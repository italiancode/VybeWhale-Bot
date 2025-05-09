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
        let message = '⚙️ *VybeWhale Bot Configuration*\n\n';
        
        // Alert Status
        message += '*Alert Settings:*\n';
        if (enabledAlerts.length === 0) {
            message += '• Alerts: ❌ No alerts enabled\n';
        } else {
            message += `• Whale Alerts: ${enabledAlerts.includes('whale') ? '✅ Enabled' : '❌ Disabled'}\n`;
            message += `• Wallet Alerts: ${enabledAlerts.includes('wallet') ? '✅ Enabled' : '❌ Disabled'}\n`;
        }

        // Threshold
        message += '\n*Whale Alert Threshold:*\n';
        message += threshold 
            ? `• $${parseFloat(threshold).toLocaleString()} minimum transfer value\n`
            : '• Not set (default: $10,000)\n';
        message += '• Large transfers above this value trigger whale alerts\n';

        // Tracked Wallets
        message += '\n*Tracked Wallets:*\n';
        if (trackedWallets.length === 0) {
            message += '• No wallets currently tracked\n';
            message += '• Use /trackwallet command or ⚡ Track buttons to add wallets\n';
        } else {
            message += `• Total tracked: ${trackedWallets.length}\n`;
            const maxToShow = Math.min(5, trackedWallets.length);
            for (let i = 0; i < maxToShow; i++) {
                const wallet = trackedWallets[i];
                message += `• \`${wallet.slice(0, 8)}...${wallet.slice(-4)}\`\n`;
            }
            if (trackedWallets.length > maxToShow) {
                message += `• Plus ${trackedWallets.length - maxToShow} more wallets\n`;
            }
            message += '• Use /listwallets to see all tracked wallets\n';
        }

        // Available Commands
        message += '\n*Configuration Commands:*\n';
        message += '• /setthreshold <amount> - Set minimum USD for whale alerts\n';
        message += '• /enablealerts <type> - Enable alerts (whale/wallet/all)\n';
        message += '• /disablealerts <type> - Disable alerts (whale/wallet/all)\n';
        message += '• /trackwallet <address> - Start tracking a wallet\n';
        message += '• /untrackwallet <address> - Stop tracking a wallet\n';
        message += '• /listwallets - View all tracked wallets\n';
        message += '• /config - View this configuration summary\n';

        // Usage Tips
        message += '\n*Pro Tips:*\n';
        message += '• Use the ⚡ Track buttons when viewing whale data for one-click tracking\n';
        message += '• Set a reasonable threshold based on the tokens you monitor\n';

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
        logger.info(`Config command executed for chat ${chatId}`);
    } catch (error) {
        logger.error('Error in config command:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error displaying configuration. Please try again later.');
    }
}

module.exports = {
    handleConfigCommand
}; 