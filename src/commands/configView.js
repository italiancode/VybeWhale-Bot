const logger = require('../utils/logger');
const redisManager = require('../utils/redis');

async function formatConfigMessage(chatId) {
    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            return '⚠️ Unable to fetch configuration - storage service unavailable';
        }

        // Fetch current settings
        const enabledAlerts = await redis.sMembers(`alerts:${chatId}`);
        const threshold = await redis.get(`threshold:${chatId}`);
        const trackedWallets = await redis.sMembers(`user:${chatId}:wallets`);

        // Format message
        let message = '⚙️ *Current Configuration*\n\n';
        
        // Alert Status
        message += '*Alert Settings:*\n';
        if (enabledAlerts.length === 0) {
            message += '• No alerts enabled\n';
        } else {
            message += `• Whale Alerts: ${enabledAlerts.includes('whale') ? '✅' : '❌'}\n`;
            message += `• Wallet Alerts: ${enabledAlerts.includes('wallet') ? '✅' : '❌'}\n`;
        }

        // Threshold
        message += '\n*Whale Alert Threshold:*\n';
        message += threshold 
            ? `• $${parseFloat(threshold).toLocaleString()}\n`
            : '• Not set (default: $10,000)\n';

        // Tracked Wallets
        message += '\n*Tracked Wallets:*\n';
        if (trackedWallets.length === 0) {
            message += '• No wallets tracked\n';
        } else {
            trackedWallets.forEach((wallet, index) => {
                message += `• ${wallet.slice(0, 8)}...${wallet.slice(-4)}\n`;
            });
        }

        // Available Commands
        message += '\n*Available Configuration Commands:*\n';
        message += '• /setthreshold <amount> - Set whale alert threshold\n';
        message += '• /enablealerts <type> - Enable alerts (whale/wallet/all)\n';
        message += '• /disablealerts <type> - Disable alerts (whale/wallet/all)\n';
        message += '• /trackwallet - Track a new wallet\n';
        message += '• /untrackwallet - Stop tracking a wallet\n';

        return message;
    } catch (error) {
        logger.error('Error formatting config message:', error);
        return '❌ Error fetching configuration. Please try again later.';
    }
}

async function handleConfigCommand(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const configMessage = await formatConfigMessage(chatId);
        
        await bot.sendMessage(chatId, configMessage, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
    } catch (error) {
        logger.error('Error in config command:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error displaying configuration. Please try again later.');
    }
}

module.exports = {
    handleConfigCommand
}; 