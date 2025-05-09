const logger = require('../utils/logger');
const redisManager = require('../utils/redis');

async function handleSetThreshold(bot, msg, match) {
    const chatId = msg.chat.id;
    const threshold = parseFloat(match[1]);

    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        if (isNaN(threshold) || threshold <= 0) {
            await bot.sendMessage(chatId, '❌ Please provide a valid positive number for the threshold (e.g., /setthreshold 5000).');
            return;
        }

        await redis.set(`threshold:${chatId}`, threshold);
        await bot.sendMessage(chatId, `✅ Whale alert threshold set to $${threshold.toLocaleString()}\n\nYou'll now receive alerts for whale transfers above this value when whale alerts are enabled.`);
        logger.info(`Threshold set for chat ${chatId}: $${threshold}`);
    } catch (error) {
        logger.error('Error setting threshold:', error);
        await bot.sendMessage(chatId, '❌ Error setting threshold. Please try again.');
    }
}

async function handleAddWallet(bot, msg, match) {
    const chatId = msg.chat.id;
    const wallet = match[1];

    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        // Basic Solana address validation (starts with a letter/number and is 32-44 chars)
        if (!wallet || !/^[a-zA-Z0-9]{32,44}$/.test(wallet)) {
            await bot.sendMessage(chatId, '❌ Invalid wallet address format. Please provide a valid Solana wallet address.');
            return;
        }

        // Check if wallet is already tracked
        const isTracked = await redis.sIsMember(`user:${chatId}:wallets`, wallet);
        if (isTracked) {
            await bot.sendMessage(chatId, `ℹ️ This wallet is already being tracked.`);
            return;
        }

        await redis.sAdd(`user:${chatId}:wallets`, wallet);
        const walletCount = await redis.sCard(`user:${chatId}:wallets`);
        
        await bot.sendMessage(chatId, 
            `✅ Now tracking wallet: \`${wallet.substring(0, 8)}...${wallet.substring(wallet.length - 4)}\`\n\n` +
            `You're now tracking ${walletCount} wallet${walletCount !== 1 ? 's' : ''} total.` +
            `\n\nMake sure you have wallet alerts enabled with /enablealerts wallet`,
            { parse_mode: 'Markdown' }
        );
        
        logger.info(`Added wallet for chat ${chatId}: ${wallet.substring(0, 8)}...`);
    } catch (error) {
        logger.error('Error adding wallet:', error);
        await bot.sendMessage(chatId, '❌ Error adding wallet. Please try again.');
    }
}

async function handleRemoveWallet(bot, msg, match) {
    const chatId = msg.chat.id;
    const wallet = match[1];

    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        // Check if wallet exists
        const isTracked = await redis.sIsMember(`user:${chatId}:wallets`, wallet);
        if (!isTracked) {
            await bot.sendMessage(chatId, `❌ Wallet not found in your tracking list.`);
            return;
        }

        await redis.sRem(`user:${chatId}:wallets`, wallet);
        const walletCount = await redis.sCard(`user:${chatId}:wallets`);
        
        await bot.sendMessage(chatId, 
            `✅ Stopped tracking wallet: \`${wallet.substring(0, 8)}...${wallet.substring(wallet.length - 4)}\`\n\n` +
            `You're now tracking ${walletCount} wallet${walletCount !== 1 ? 's' : ''} total.`,
            { parse_mode: 'Markdown' }
        );
        
        logger.info(`Removed wallet for chat ${chatId}: ${wallet.substring(0, 8)}...`);
    } catch (error) {
        logger.error('Error removing wallet:', error);
        await bot.sendMessage(chatId, '❌ Error removing wallet. Please try again.');
    }
}

async function handleEnableAlerts(bot, msg, match) {
    const chatId = msg.chat.id;
    const alertType = match[1].toLowerCase();

    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        // Validate alert type
        if (!['whale', 'wallet', 'all'].includes(alertType)) {
            await bot.sendMessage(chatId, '❌ Invalid alert type. Available types: whale, wallet, all');
            return;
        }

        // Add chat to enabled alerts
        await redis.sAdd('alert_enabled_chats', chatId.toString());

        // Set specific alert types
        if (alertType === 'all') {
            await redis.sAdd(`alerts:${chatId}`, 'whale');
            await redis.sAdd(`alerts:${chatId}`, 'wallet');
            await bot.sendMessage(chatId, 
                '✅ All alerts have been enabled for this chat.\n\n' +
                '• *Whale Alerts*: Large token transfers above threshold\n' +
                '• *Wallet Alerts*: Activity from tracked wallets'
            , { parse_mode: 'Markdown' });
        } else {
            await redis.sAdd(`alerts:${chatId}`, alertType);
            
            let alertDescription = "";
            if (alertType === 'whale') {
                alertDescription = 'You will now receive alerts for large token transfers above your threshold.';
            } else if (alertType === 'wallet') {
                alertDescription = 'You will now receive alerts for activity from your tracked wallets.';
                
                // Check if user has any wallets tracked
                const walletCount = await redis.sCard(`user:${chatId}:wallets`);
                if (walletCount === 0) {
                    alertDescription += '\n\nℹ️ You haven\'t tracked any wallets yet. Use /trackwallet <address> or the ⚡ Track buttons to start tracking.';
                }
            }
            
            await bot.sendMessage(chatId, 
                `✅ ${alertType.charAt(0).toUpperCase() + alertType.slice(1)} alerts have been enabled.\n\n${alertDescription}`
            , { parse_mode: 'Markdown' });
        }

        // Set default threshold if not set
        const threshold = await redis.get(`threshold:${chatId}`);
        if (!threshold) {
            await redis.set(`threshold:${chatId}`, 10000); // Default $10,000
            await bot.sendMessage(chatId, 'ℹ️ Default whale alert threshold set to $10,000. Use /setthreshold to change it.');
        }

        logger.info(`Alerts enabled for chat ${chatId}: ${alertType}`);
    } catch (error) {
        logger.error('Error enabling alerts:', error);
        await bot.sendMessage(chatId, '❌ Error enabling alerts. Please try again.');
    }
}

async function handleDisableAlerts(bot, msg, match) {
    const chatId = msg.chat.id;
    const alertType = match[1].toLowerCase();

    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        // Validate alert type
        if (!['whale', 'wallet', 'all'].includes(alertType)) {
            await bot.sendMessage(chatId, '❌ Invalid alert type. Available types: whale, wallet, all');
            return;
        }

        if (alertType === 'all') {
            await redis.sRem(`alerts:${chatId}`, 'whale');
            await redis.sRem(`alerts:${chatId}`, 'wallet');
            await redis.sRem('alert_enabled_chats', chatId.toString());
            await bot.sendMessage(chatId, '✅ All alerts have been disabled for this chat.\n\nYou will no longer receive any automatic notifications.');
        } else {
            await redis.sRem(`alerts:${chatId}`, alertType);
            
            // Check if any alerts remain enabled
            const enabledAlerts = await redis.sMembers(`alerts:${chatId}`);
            if (enabledAlerts.length === 0) {
                await redis.sRem('alert_enabled_chats', chatId.toString());
            }
            
            await bot.sendMessage(chatId, 
                `✅ ${alertType.charAt(0).toUpperCase() + alertType.slice(1)} alerts have been disabled.\n\n` +
                `You will no longer receive ${alertType} notifications.`
            );
        }

        logger.info(`Alerts disabled for chat ${chatId}: ${alertType}`);
    } catch (error) {
        logger.error('Error disabling alerts:', error);
        await bot.sendMessage(chatId, '❌ Error disabling alerts. Please try again.');
    }
}

async function getAlertStatus(chatId) {
    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) return null;

        const enabledAlerts = await redis.sMembers(`alerts:${chatId}`);
        const threshold = await redis.get(`threshold:${chatId}`);
        const walletCount = await redis.sCard(`user:${chatId}:wallets`);

        return {
            enabled: enabledAlerts.length > 0,
            types: enabledAlerts,
            threshold: threshold ? parseFloat(threshold) : null,
            walletCount: walletCount || 0
        };
    } catch (error) {
        logger.error('Error getting alert status:', error);
        return null;
    }
}

module.exports = {
    handleSetThreshold,
    handleAddWallet,
    handleRemoveWallet,
    handleEnableAlerts,
    handleDisableAlerts,
    getAlertStatus
}; 