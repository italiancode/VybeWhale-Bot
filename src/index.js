require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const logger = require('./utils/logger');
const stateManager = require('./utils/stateManager');
const AlertService = require('./services/alerts');
const config = require('./commands/config');

// Import command handlers
const { handler: handleStartCommand } = require('./commands/start');
const { handler: handleHelpCommand } = require('./commands/help');
const { handleTokenInput, handleTokenCommand } = require('./commands/token');
const { handleWalletInput, handleTrackWalletCommand } = require('./commands/trackWallet');
const { handleWhaleInput, handleWhaleCommand } = require('./commands/whale');
const { handleListWallets } = require('./commands/listWallets');
const { handleUntrackWalletCommand, handleUntrackWalletInput } = require('./commands/untrackWallet');

// Initialize bot with polling
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// Setup alert system
const alertService = new AlertService();
alertService.setupAlerts(bot);

// Set up command list
bot.setMyCommands([
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'Show help message' },
    { command: 'token', description: 'Check token info' },
    { command: 'whale', description: 'View whale transactions' },
    { command: 'trackwallet', description: 'Track a wallet' },
    { command: 'listwallets', description: 'List tracked wallets' },
    { command: 'untrackwallet', description: 'Stop tracking a wallet' },
    { command: 'setthreshold', description: 'Set whale alert threshold' },
    { command: 'enablealerts', description: 'Enable specific alerts' },
    { command: 'disablealerts', description: 'Disable specific alerts' }
]);

// Handle messages
bot.on('message', async (msg) => {
    try {
        if (!msg.text) return; // Ignore non-text messages

        const userId = msg.from.id;
        const userState = stateManager.getState(userId);

        // Handle commands
        if (msg.text.startsWith('/')) {
            const text = msg.text;
            const command = text.split(' ')[0].slice(1).toLowerCase();
            
            // Clear any existing state when a command is received
            if (userState) {
                stateManager.clearState(userId);
            }

            // Handle commands with parameters
            if (text.match(/^\/setthreshold (.+)/)) {
                const match = text.match(/^\/setthreshold (.+)/);
                await config.handleSetThreshold(msg, match);
                return;
            }
            if (text.match(/^\/enablealerts (.+)/)) {
                const match = text.match(/^\/enablealerts (.+)/);
                await config.handleEnableAlerts(msg, match);
                return;
            }
            if (text.match(/^\/disablealerts (.+)/)) {
                const match = text.match(/^\/disablealerts (.+)/);
                await config.handleDisableAlerts(msg, match);
                return;
            }

            // Handle basic commands
            switch (command) {
                case 'start':
                    await handleStartCommand(bot, msg);
                    break;
                case 'help':
                    await handleHelpCommand(bot, msg);
                    break;
                case 'token':
                    await handleTokenCommand(bot, msg);
                    break;
                case 'whale':
                    await handleWhaleCommand(bot, msg);
                    break;
                case 'trackwallet':
                    await handleTrackWalletCommand(bot, msg);
                    break;
                case 'listwallets':
                    await handleListWallets(bot, msg);
                    break;
                case 'untrackwallet':
                    await handleUntrackWalletCommand(bot, msg);
                    break;
            }
            return;
        }

        // Process input based on user state
        if (userState) {
            switch (userState.command) {
                case 'token':
                    await handleTokenInput(bot, msg);
                    break;
                case 'trackwallet':
                    await handleWalletInput(bot, msg);
                    break;
                case 'untrackwallet':
                    await handleUntrackWalletInput(bot, msg);
                    break;
                case 'whale':
                    await handleWhaleInput(bot, msg);
                    break;
            }
        }
    } catch (error) {
        logger.error('Error handling message:', error);
        await bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

// Add error handlers
bot.on('polling_error', (error) => {
    if (error.code === 'EFATAL') {
        logger.error('Fatal polling error. Restarting polling...', error.message || error);
        bot.stopPolling().then(() => {
            setTimeout(() => bot.startPolling(), 5000);
        });
    } else if (error.code === 'ETELEGRAM') {
        logger.error('Telegram API error:', error.message || error);
    } else {
        logger.error('Polling error:', error.message || error);
    }
});

bot.on('error', (error) => {
    logger.error('Bot error:', error.message || error);
});

// Test bot token
bot.getMe().then((botInfo) => {
    logger.info(`Bot connected successfully. Bot username: @${botInfo.username}`);
}).catch((error) => {
    logger.error('Failed to connect bot:', error.message || error);
});

// Start message
logger.info('VybeWhale bot is running...'); 