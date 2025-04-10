require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const logger = require('./utils/logger');
const stateManager = require('./utils/stateManager');
const redisManager = require('./utils/redis');
const AlertService = require('./services/alerts');
const config = require('./commands/config');
const { handleConfigCommand } = require('./commands/configView');

// Import command handlers
const { handler: handleStartCommand } = require('./commands/start');
const { handler: handleHelpCommand } = require('./commands/help');
const { handleTokenInput, handleTokenCommand } = require('./commands/token');
const { handleWalletInput, handleTrackWalletCommand } = require('./commands/trackWallet');
const { handleWhaleInput, handleWhaleCommand } = require('./commands/whale');
const { handleListWallets } = require('./commands/listWallets');
const { handleUntrackWalletCommand, handleUntrackWalletInput } = require('./commands/untrackWallet');

async function initializeApp() {
    try {
        // Initialize Redis
        const redisClient = await redisManager.initialize();
        
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
        await alertService.initialize(redisClient);
        alertService.setupAlerts(bot);

        // Set up command list
        await bot.setMyCommands([
            { command: 'start', description: 'Start the bot' },
            { command: 'help', description: 'Show help message' },
            { command: 'config', description: 'View and manage all settings' },
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
                    if (text.match(/^\/setthreshold\s+(.+)/)) {
                        const match = text.match(/^\/setthreshold\s+(.+)/);
                        if (!match[1].match(/^\d+(\.\d+)?$/)) {
                            await bot.sendMessage(msg.chat.id, '❌ Please provide a valid number for the threshold.\n\nExample: /setthreshold 10000');
                            return;
                        }
                        await config.handleSetThreshold(bot, msg, match);
                        return;
                    }
                    if (text.match(/^\/enablealerts\s+(.+)/)) {
                        const match = text.match(/^\/enablealerts\s+(.+)/);
                        await config.handleEnableAlerts(bot, msg, match);
                        return;
                    }
                    if (text.match(/^\/disablealerts\s+(.+)/)) {
                        const match = text.match(/^\/disablealerts\s+(.+)/);
                        await config.handleDisableAlerts(bot, msg, match);
                        return;
                    }

                    // Handle commands without parameters
                    if (text === '/setthreshold') {
                        await bot.sendMessage(msg.chat.id, '❌ Please provide a threshold amount.\n\nExample: /setthreshold 10000');
                        return;
                    }
                    if (text === '/enablealerts') {
                        await bot.sendMessage(msg.chat.id, '❌ Please specify an alert type: whale, wallet, or all\n\nExample: /enablealerts whale');
                        return;
                    }
                    if (text === '/disablealerts') {
                        await bot.sendMessage(msg.chat.id, '❌ Please specify an alert type: whale, wallet, or all\n\nExample: /disablealerts whale');
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
                        case 'config':
                            await handleConfigCommand(bot, msg);
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
                        default:
                            // Handle unknown commands
                            await bot.sendMessage(msg.chat.id, '❌ Unknown command. Use /help to see available commands.');
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
        const botInfo = await bot.getMe();
        logger.info(`Bot connected successfully. Bot username: @${botInfo.username}`);
        logger.info('VybeWhale bot is running...');

    } catch (error) {
        logger.error('Failed to initialize application:', error);
        process.exit(1);
    }
}

// Handle application shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await redisManager.quit();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await redisManager.quit();
    process.exit(0);
});

// Start the application
initializeApp(); 