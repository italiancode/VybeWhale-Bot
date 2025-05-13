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
            await bot.sendMessage(chatId, '❌ Please provide a valid positive number for the threshold.');
            return;
        }

        await redis.set(`threshold:${chatId}`, threshold);
        await bot.sendMessage(chatId, `✅ Whale alert threshold set to $${threshold.toLocaleString()}`);
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

        await redis.sAdd(`wallets:${chatId}`, wallet);
        await bot.sendMessage(chatId, `✅ Added wallet ${wallet} to tracking list`);
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

        await redis.sRem(`wallets:${chatId}`, wallet);
        await bot.sendMessage(chatId, `✅ Removed wallet ${wallet} from tracking list`);
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
        if (!['whale', 'wallet', 'gem', 'all'].includes(alertType)) {
            await bot.sendMessage(chatId, '❌ Invalid alert type. Available types: whale, wallet, gem, all');
            return;
        }

        // Add chat to enabled alerts
        await redis.sAdd('alert_enabled_chats', chatId.toString());

        // Set specific alert types
        if (alertType === 'all') {
            await redis.sAdd(`alerts:${chatId}`, 'whale');
            await redis.sAdd(`alerts:${chatId}`, 'wallet');
            await redis.sAdd(`alerts:${chatId}`, 'gem');
            await bot.sendMessage(chatId, '✅ All alerts have been enabled for this chat.');
        } else {
            await redis.sAdd(`alerts:${chatId}`, alertType);
            await bot.sendMessage(chatId, `✅ ${alertType.charAt(0).toUpperCase() + alertType.slice(1)} alerts have been enabled for this chat.`);
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
        if (!['whale', 'wallet', 'gem', 'all'].includes(alertType)) {
            await bot.sendMessage(chatId, '❌ Invalid alert type. Available types: whale, wallet, gem, all');
            return;
        }

        if (alertType === 'all') {
            await redis.sRem(`alerts:${chatId}`, 'whale');
            await redis.sRem(`alerts:${chatId}`, 'wallet');
            await redis.sRem(`alerts:${chatId}`, 'gem');
            await redis.sRem('alert_enabled_chats', chatId.toString());
            await bot.sendMessage(chatId, '✅ All alerts have been disabled for this chat.');
        } else {
            await redis.sRem(`alerts:${chatId}`, alertType);
            
            // Check if any alerts remain enabled
            const enabledAlerts = await redis.sMembers(`alerts:${chatId}`);
            if (enabledAlerts.length === 0) {
                await redis.sRem('alert_enabled_chats', chatId.toString());
            }
            
            await bot.sendMessage(chatId, `✅ ${alertType.charAt(0).toUpperCase() + alertType.slice(1)} alerts have been disabled for this chat.`);
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

        return {
            enabled: enabledAlerts.length > 0,
            types: enabledAlerts,
            threshold: threshold ? parseFloat(threshold) : null
        };
    } catch (error) {
        logger.error('Error getting alert status:', error);
        return null;
    }
}

/**
 * Track a wallet for gem alerts
 */
async function handleTrackGemAlerts(bot, msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const walletAddress = match[1];

    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        // Validate wallet address format
        if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
            await bot.sendMessage(chatId, '❌ Invalid Solana wallet address format.');
            return;
        }

        // Check if user is already following this wallet
        const isFollowing = await redis.sIsMember(`user:${userId}:wallets`, walletAddress);
        if (!isFollowing) {
            await bot.sendMessage(
                chatId,
                `❌ You must first follow this wallet using /trackwallet ${walletAddress} before enabling gem alerts for it.`,
                { parse_mode: 'Markdown' }
            );
            return;
        }

        // Add the wallet to gem alert tracking
        await redis.sAdd('gem_alert_wallets', walletAddress);
        await redis.sAdd(`wallet:${walletAddress}:gem_users`, chatId.toString());
        
        // Enable gem alerts for this chat
        await redis.sAdd('alert_enabled_chats', chatId.toString());
        await redis.sAdd(`alerts:${chatId}`, 'gem');

        await bot.sendMessage(
            chatId, 
            `✅ Now tracking low cap gem alerts for wallet \`${walletAddress}\`.\n\nYou'll receive alerts when this wallet acquires new low cap tokens with promising metrics.`,
            { parse_mode: 'Markdown' }
        );
        
        logger.info(`Gem alerts enabled for wallet ${walletAddress} by user ${chatId}`);
    } catch (error) {
        logger.error('Error tracking gem alerts:', error);
        await bot.sendMessage(chatId, '❌ Error setting up gem alerts. Please try again later.');
    }
}

/**
 * Stop tracking a wallet for gem alerts
 */
async function handleUntrackGemAlerts(bot, msg, match) {
    const chatId = msg.chat.id;
    const walletAddress = match[1];

    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        // Remove the user from this wallet's gem alerts
        await redis.sRem(`wallet:${walletAddress}:gem_users`, chatId.toString());
        
        // Check if any users are still tracking this wallet for gems
        const trackingUsers = await redis.sMembers(`wallet:${walletAddress}:gem_users`);
        if (trackingUsers.length === 0) {
            // If no users left, remove wallet from gem alert tracking
            await redis.sRem('gem_alert_wallets', walletAddress);
        }

        await bot.sendMessage(
            chatId, 
            `✅ Stopped tracking low cap gem alerts for wallet \`${walletAddress}\`.`,
            { parse_mode: 'Markdown' }
        );
        
        logger.info(`Gem alerts disabled for wallet ${walletAddress} by user ${chatId}`);
    } catch (error) {
        logger.error('Error removing gem alerts:', error);
        await bot.sendMessage(chatId, '❌ Error updating gem alerts. Please try again later.');
    }
}

module.exports = {
    handleSetThreshold,
    handleAddWallet,
    handleRemoveWallet,
    handleEnableAlerts,
    handleDisableAlerts,
    getAlertStatus,
    handleTrackGemAlerts,
    handleUntrackGemAlerts
}; 