const logger = require('../utils/logger');

async function handleStart(bot, msg) {
    try {
        if (!msg || !msg.chat) {
            logger.error('Invalid message object received in start command');
            return;
        }

        const chatId = msg.chat.id;
        const welcomeMessage = `👋 Welcome to VybeWhale Bot!\n\n` +
            `I track Solana whale activity and smart wallets. Here's what I can do:\n\n` +
            `🐋 Track whale transactions\n` +
            `👀 Monitor smart wallets\n` +
            `📊 Get token info\n` +
            `🎁 Detect airdrops\n\n` +
            `Commands:\n` +
            `/token - Check token info\n` +
            `/whale - View whale transactions\n` +
            `/trackwallet - Track a wallet\n` +
            `/help - Show all commands\n\n` +
            `Try /help for more details!`;

        await bot.sendMessage(chatId, welcomeMessage);
        logger.info(`Start command handled for chat ${chatId}`);
    } catch (error) {
        logger.error('Error in start command:', error);
        if (msg && msg.chat) {
            await bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
        }
    }
}

module.exports = {
    command: 'start',
    handler: handleStart
}; 