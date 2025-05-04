require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
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
                // Don't kill the bot for Telegram API errors, just restart polling if needed
                if (error.response && error.response.statusCode >= 500) {
                    logger.info('Telegram server error, restarting polling after delay');
                    bot.stopPolling().then(() => {
                        setTimeout(() => bot.startPolling(), 10000);
                    });
                }
            } else {
                logger.error('Polling error:', error.message || error);
                // Restart polling for other errors after a delay
                setTimeout(() => {
                    try {
                        bot.startPolling();
                        logger.info('Polling restarted after error');
                    } catch (e) {
                        logger.error('Failed to restart polling:', e);
                    }
                }, 15000);
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

// Handle application shutdown - with more graceful handling for Render
process.on('SIGINT', async () => {
    logger.info('Received SIGINT signal');
    try {
        // When running locally, exit properly
        if (!process.env.RENDER) {
            logger.info('Shutting down gracefully...');
            await redisManager.quit();
            process.exit(0);
        } else {
            // On Render, don't exit to prevent automatic shutdown
            logger.info('SIGINT received on Render, but keeping the process alive');
            // Just disconnect Redis but keep process running
            await redisManager.quit();
            // Restart initialization after a delay
            setTimeout(() => {
                logger.info('Reinitializing application after SIGINT');
                initializeApp();
            }, 30000);
        }
    } catch (err) {
        logger.error('Error during shutdown:', err);
    }
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM signal');
    try {
        // When running locally, exit properly
        if (!process.env.RENDER) {
            logger.info('Shutting down gracefully...');
            await redisManager.quit();
            process.exit(0);
        } else {
            // On Render, don't exit to prevent automatic shutdown
            logger.info('SIGTERM received on Render, but keeping the process alive');
            // Disconnect Redis but keep the process running
            await redisManager.quit();
            // Restart initialization after a delay
            setTimeout(() => {
                logger.info('Reinitializing application after SIGTERM');
                initializeApp();
            }, 30000);
        }
    } catch (err) {
        logger.error('Error during shutdown:', err);
    }
});

// Handle uncaught exceptions to prevent app from crashing
process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    // Don't exit the process, try to keep it running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection:', reason);
    // Don't exit the process, try to keep it running
});

// Create HTTP server for Render deployment with health checks
const server = http.createServer((req, res) => {
    // Simple health check endpoint
    if (req.url === '/health' || req.url === '/') {
        // Return different status if the bot is not fully operational
        try {
            const botStatus = bot ? 'connected' : 'disconnected';
            const redisStatus = redisManager.isConnected() ? 'connected' : 'disconnected';
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'up',
                timestamp: new Date().toISOString(),
                bot: botStatus,
                redis: redisStatus,
                uptime: process.uptime() + ' seconds'
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', error: err.message }));
        }
    // Handle ping from uptime monitors
    } else if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong');
    // Default response for other routes
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('VybeWhale Bot is running');
    }
});

// Get port from environment or use a default
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`HTTP server listening on port ${PORT}`);
});

// Set up a keep-alive ping to prevent Render from shutting down the service
let keepAliveInterval;
function setupKeepAlive() {
    // Clear any existing interval
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    
    // Set up a new interval to ping the server every 14 minutes (less than Render's 15min timeout)
    keepAliveInterval = setInterval(() => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/ping',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            logger.debug(`Keep-alive ping successful: ${res.statusCode}`);
        });

        req.on('error', (error) => {
            logger.error('Keep-alive ping failed:', error);
            // If our ping fails, restart the HTTP server
            try {
                server.close(() => {
                    server.listen(PORT, () => {
                        logger.info('HTTP server restarted after failed ping');
                    });
                });
            } catch (e) {
                logger.error('Failed to restart HTTP server:', e);
            }
        });

        req.end();
    }, 14 * 60 * 1000); // 14 minutes

    logger.info('Keep-alive ping mechanism initialized');
}

// Application initialization wrapper with retry
function startWithRetry(maxRetries = 5, retryDelay = 30000) {
    let retries = 0;
    
    function attemptStart() {
        initializeApp().catch(error => {
            logger.error(`Failed to initialize application (attempt ${retries + 1}/${maxRetries}):`, error);
            
            if (retries < maxRetries) {
                retries++;
                logger.info(`Retrying in ${retryDelay/1000} seconds...`);
                setTimeout(attemptStart, retryDelay);
            } else {
                logger.error(`Maximum retries (${maxRetries}) reached. Please check the application logs.`);
                // On Render, don't exit to prevent the service from being marked as failed
                if (!process.env.RENDER) {
                    process.exit(1);
                } else {
                    // Wait longer and try again
                    setTimeout(() => {
                        logger.info('Resetting retry count and starting again...');
                        retries = 0;
                        attemptStart();
                    }, retryDelay * 2);
                }
            }
        });
    }
    
    attemptStart();
    setupKeepAlive();
}

// Start the application with retry mechanism
startWithRetry();