const vybeApi = require('../services/vybeApi');
const logger = require('../utils/logger');
const stateManager = require('../utils/stateManager');

async function handleWhaleCommand(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userState = stateManager.getState(userId);

        // Check for direct token address in command
        const commandArgs = msg.text.split(' ');
        if (commandArgs.length > 1) {
            const tokenAddress = commandArgs[1].trim();
            // Validate Solana address format
            if (tokenAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
                await handleDirectWhaleTracking(bot, chatId, tokenAddress);
                return;
            } else {
                await bot.sendMessage(chatId, '❌ Invalid Solana token address format. Please enter a valid Solana token address.');
                return;
            }
        }

        // Check if we have a lastToken from previous token analysis
        if (userState?.lastToken) {
            logger.info(`Using last analyzed token ${userState.lastTokenSymbol} for whale tracking`);
            await handleDirectWhaleTracking(bot, chatId, userState.lastToken);
            return;
        }

        // If no previous token, proceed with normal flow
        stateManager.setState(userId, {
            command: 'whale',
            step: 'awaiting_token'
        });

        const message = 
            `🐋 *Whale Transaction Tracker*\n\n` +
            `Please enter the *Solana token address* to track whale movements.\n\n` +
            `🔹 *Example:* \`So11111111111111111111111111111111111111112\` _(SOL token)_\n\n` +
            `This will show you recent large transactions and their impact.`;

        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        logger.info(`Whale command initiated for user ${userId}`);
    } catch (error) {
        logger.error('Error in whale command:', error);
        await bot.sendMessage(msg.chat.id, '⚠️ Sorry, something went wrong. Please try again later.');
    }
}

async function handleWhaleInput(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userState = stateManager.getState(userId);

        if (!userState || userState.command !== 'whale') {
            return;
        }

        const tokenAddress = msg.text.trim();
        
        if (tokenAddress.startsWith('/')) {
            stateManager.clearState(userId);
            return;
        }
        
        if (!tokenAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
            await bot.sendMessage(chatId, '❌ Invalid Solana token address format. Please enter a valid Solana token address.');
            return;
        }

        await bot.sendChatAction(chatId, 'typing');

        const tokenInfo = await vybeApi.getTokenInfo(tokenAddress);
        const transactions = await vybeApi.getWhaleTransactions(tokenAddress);
        
        if (transactions.length === 0) {
            await bot.sendMessage(chatId, `No recent whale transactions found for ${tokenInfo.symbol || 'this token'}.`);
        } else {
            const tokenMessage = `📊 *${tokenInfo.symbol || 'Token'} Information*\n` +
                `Name: ${tokenInfo.name || 'N/A'}\n` +
                `Price: $${tokenInfo.price?.toFixed(6) || 'N/A'}\n` +
                `24h Volume: $${tokenInfo.volume24h?.toLocaleString() || 'N/A'}\n\n` +
                `🐋 *Recent Whale Transactions*\n\n`;

            const transactionsMessage = transactions.map((tx, index) => {
                const type = tx.type.toUpperCase();
                const emoji = type === 'BUY' ? '🟢' : type === 'SELL' ? '🔴' : '⚪';
                const amount = tx.usdAmount?.toLocaleString() || 'N/A';
                const time = new Date(tx.timestamp).toLocaleString();
                
                return `${index + 1}. ${emoji} ${type}\n` +
                       `   Amount: $${amount}\n` +
                       `   From: ${tx.senderAddress?.slice(0, 8)}...${tx.senderAddress?.slice(-4)}\n` +
                       `   To: ${tx.receiverAddress?.slice(0, 8)}...${tx.receiverAddress?.slice(-4)}\n` +
                       `   Time: ${time}`;
            }).join('\n\n');

            const fullMessage = tokenMessage + transactionsMessage;
            if (fullMessage.length > 4000) {
                await bot.sendMessage(chatId, tokenMessage, { parse_mode: 'Markdown' });
                await bot.sendMessage(chatId, transactionsMessage, { parse_mode: 'Markdown' });
            } else {
                await bot.sendMessage(chatId, fullMessage, { parse_mode: 'Markdown' });
            }
        }

        stateManager.clearState(userId);
        logger.info(`Whale transactions provided for user ${userId}`);
    } catch (error) {
        logger.error('Error processing whale command input:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error fetching whale transactions. Please try again later.');
        stateManager.clearState(msg.from.id);
    }
}

async function handleDirectWhaleTracking(bot, chatId, tokenAddress) {
    try {
        await bot.sendChatAction(chatId, 'typing');

        const tokenInfo = await vybeApi.getTokenInfo(tokenAddress);
        const transactions = await vybeApi.getWhaleTransactions(tokenAddress);
        
        if (transactions.length === 0) {
            await bot.sendMessage(chatId, 
                `🔍 No recent whale transactions found for *${tokenInfo.symbol || 'this token'}*.\n\n` +
                `I'll notify you when large transactions occur!`, 
                { parse_mode: 'Markdown' }
            );
            return;
        }

        let message = `🐋 *${tokenInfo.symbol} Whale Activity*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `💰 Price: $${tokenInfo.price?.toFixed(2)}\n\n`;

        transactions.slice(0, 5).forEach((tx, index) => {
            const type = tx.type.toUpperCase();
            const emoji = type === 'BUY' ? '🟢' : '🔴';
            const amount = tx.usdAmount?.toLocaleString() || 'N/A';
            const timeAgo = getTimeAgo(new Date(tx.timestamp));
            
            message += `${emoji} $${amount}\n`;
            message += `└ ${timeAgo} ago\n`;
        });

        message += `\n📊 [View All Transactions](https://alpha.vybenetwork.com/tokens/${tokenAddress})`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        logger.info(`Whale tracking data provided for ${tokenInfo.symbol}`);
    } catch (error) {
        logger.error('Error in direct whale tracking:', error);
        await bot.sendMessage(chatId, '⚠️ Error fetching whale data. Try again later.');
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        day: 86400,
        hour: 3600,
        minute: 60
    };

    if (seconds < intervals.minute) return 'just now';
    if (seconds < intervals.hour) return Math.floor(seconds / intervals.minute) + 'm';
    if (seconds < intervals.day) return Math.floor(seconds / intervals.hour) + 'h';
    return Math.floor(seconds / intervals.day) + 'd';
}

module.exports = { 
    handleWhaleCommand,
    handleWhaleInput,
    handleDirectWhaleTracking
};