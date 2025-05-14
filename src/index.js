require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const https = require('https');
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
const { handleListWallets, handleWalletPerformanceCallback } = require('./commands/listWallets');
const { handleUntrackWalletCommand, handleUntrackWalletInput } = require('./commands/untrackWallet');
const { handleWalletPerformance, handleWalletPerformanceInput } = require('./commands/walletPerformance');
const { handleLowCapCommand, handleLowCapInput, analyzeLowCapGems } = require('./commands/lowCapGems');

// Global references for the server routes to access
let globalBot = null;

async function initializeApp() {
    try {
        // Initialize Redis
        const redisClient = await redisManager.initialize();
        
        // Initialize bot with polling with improved error handling and reconnection logic
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
            polling: {
                interval: 300,
                autoStart: true,
                params: {
                    timeout: 10
                }
            }
        });

        // Store bot reference globally
        globalBot = bot;
        
        // Track bot state
        let botActive = true;
        
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
            { command: 'walletperformance', description: 'Analyze wallet performance' },
            { command: 'lowcap', description: 'Find low cap gems in a wallet' },
            { command: 'setthreshold', description: 'Set whale alert threshold' },
            { command: 'enablealerts', description: 'Enable specific alerts' },
            { command: 'disablealerts', description: 'Disable specific alerts' },
            { command: 'untrackgems', description: 'Untrack gem alerts for a wallet' }
        ]);

        // Handle messages with improved error handling
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
                    if (text.match(/^\/untrackgems\s+(.+)/)) {
                        const match = text.match(/^\/untrackgems\s+(.+)/);
                        await config.handleUntrackGemAlerts(bot, msg, match);
                        return;
                    }

                    // Handle commands without parameters
                    if (text === '/setthreshold') {
                        await bot.sendMessage(msg.chat.id, '❌ Please provide a threshold amount.\n\nExample: /setthreshold 10000');
                        return;
                    }
                    if (text === '/enablealerts') {
                        await bot.sendMessage(msg.chat.id, '❌ Please specify an alert type: whale, wallet, gem, or all\n\nExample: /enablealerts whale');
                        return;
                    }
                    if (text === '/disablealerts') {
                        await bot.sendMessage(msg.chat.id, '❌ Please specify an alert type: whale, wallet, gem, or all\n\nExample: /disablealerts whale');
                        return;
                    }
                    if (text === '/untrackgems') {
                        await bot.sendMessage(msg.chat.id, '❌ Please provide a wallet address.\n\nExample: /untrackgems 5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1');
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
                        case 'walletperformance':
                            await handleWalletPerformance(bot, msg);
                            break;
                        case 'lowcap':
                            await handleLowCapCommand(bot, msg);
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
                        case 'walletperformance':
                            await handleWalletPerformanceInput(bot, msg);
                            break;
                        case 'lowcap':
                            await handleLowCapInput(bot, msg);
                            break;
                    }
                }
            } catch (error) {
                logger.error('Error handling message:', error);
                try {
                    await bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
                } catch (sendError) {
                    logger.error('Failed to send error message to user:', sendError);
                }
            }
        });

        // Handle callback queries from inline keyboards
        bot.on('callback_query', async (query) => {
            try {
                // Make sure query data exists
                if (!query || !query.data) {
                    logger.error('Received callback query with no data');
                    if (query && query.id) {
                        await bot.answerCallbackQuery(query.id, {
                            text: 'Invalid callback data'
                        });
                    }
                    return;
                }
                
                const data = query.data;
                
                // Debug log every callback query
                logger.info(`Received callback query: ${data} from user ${query.from.id}`);
                
                // Handle wallet performance related callbacks
                if (data.startsWith('wallet_performance_list:') || 
                    data.startsWith('wallet_performance:') || 
                    data === 'wallet_list_back' ||
                    data.startsWith('wallet_period:') ||
                    data.startsWith('wallet_gems_list:') ||
                    data === 'wallet_instruction' ||
                    data.startsWith('wallet_pnl:')) {
                    logger.info(`Routing ${data} to handleWalletPerformanceCallback`);
                    await handleWalletPerformanceCallback(bot, query);
                    return;
                }
                
                // Handle gem-related callbacks from the lowcap gem screen
                if (data.startsWith('track_wallet:')) {
                    await handleGemCallbacks(bot, query);
                    return;
                }
                
                // Handle gem alert toggling from both screens
                if (data.startsWith('track_gems:') || data.startsWith('untrack_gems:')) {
                    const lastScreen = query.message.text || "";
                    
                    // Check if we're in the gem management screen
                    if (lastScreen.includes("Low Cap Gem Alert Management")) {
                        // Use the wallet list callback handler for the gem management screen
                        await handleWalletPerformanceCallback(bot, query);
                    } else {
                        // Use gem callbacks for other screens
                        await handleGemCallbacks(bot, query);
                    }
                    return;
                }
                
                // Handle other callback types as needed
                // ...
                
                // Default handler for unrecognized callbacks
                await bot.answerCallbackQuery(query.id, {
                    text: 'Unknown action'
                });
            } catch (error) {
                logger.error('Error handling callback query:', error);
                try {
                    await bot.answerCallbackQuery(query.id, {
                        text: 'Sorry, something went wrong. Please try again.'
                    });
                } catch (answerError) {
                    logger.error('Failed to answer callback query:', answerError);
                }
            }
        });

        // Improved error handling for polling errors
        bot.on('polling_error', (error) => {
            logger.error('Polling error:', error.message || error);
            
            // Don't restart if we're deliberately stopping
            if (!botActive) return;
            
            // Implement progressive backoff for reconnection
            let reconnectDelay = 5000; // Start with 5 seconds
            
            if (error.code === 'EFATAL') {
                logger.error('Fatal polling error. Restarting polling with delay...', error.message || error);
                reconnectDelay = 10000; // 10 seconds for fatal errors
            } else if (error.code === 'ETELEGRAM') {
                logger.error('Telegram API error:', error.message || error);
                
                // Handle rate limiting specially
                if (error.response && error.response.statusCode === 429) {
                    const retryAfter = error.response.body?.parameters?.retry_after || 30;
                    reconnectDelay = (retryAfter * 1000) + 1000; // Convert to ms and add buffer
                    logger.info(`Rate limited. Restarting polling after ${retryAfter} seconds`);
                }
                // Handle Telegram server errors
                else if (error.response && error.response.statusCode >= 500) {
                    reconnectDelay = 15000; // 15 seconds for server errors
                    logger.info('Telegram server error, restarting polling after delay');
                }
            }
            
            // Implement the reconnection with the calculated delay
            bot.stopPolling().then(() => {
                logger.info(`Restarting polling in ${reconnectDelay/1000} seconds...`);
                setTimeout(() => {
                    if (botActive) {
                        try {
                            bot.startPolling();
                            logger.info('Polling successfully restarted');
                        } catch (e) {
                            logger.error('Failed to restart polling:', e);
                            // Try again with longer delay
                            setTimeout(() => {
                                try {
                                    bot.startPolling();
                                    logger.info('Polling restarted on second attempt');
                                } catch (e2) {
                                    logger.error('Failed to restart polling on second attempt:', e2);
                                }
                            }, reconnectDelay * 2);
                        }
                    }
                }, reconnectDelay);
            }).catch(stopError => {
                logger.error('Error stopping polling:', stopError);
                // Force restart polling after a longer delay
                setTimeout(() => {
                    if (botActive) {
                        try {
                            bot.startPolling();
                            logger.info('Polling restarted after stop error');
                        } catch (e) {
                            logger.error('Failed to restart polling after stop error:', e);
                        }
                    }
                }, reconnectDelay * 3);
            });
        });

        // Better error handling for general bot errors
        bot.on('error', (error) => {
            logger.error('Bot error:', error.message || error);
            // Don't try to restart here - let the polling_error handler deal with it
        });

        // Telegram webhook errors
        bot.on('webhook_error', (error) => {
            logger.error('Webhook error:', error.message || error);
        });

        // Test bot token
        const botInfo = await bot.getMe();
        logger.info(`Bot connected successfully. Bot username: @${botInfo.username}`);
        logger.info('VybeWhale bot is running...');
        
        // Add self-healing watchdog
        const watchdogInterval = setInterval(async () => {
            try {
                // Check if bot is still responsive
                const isResponsive = await (async () => {
                    try {
                        const result = await bot.getMe();
                        return !!result;
                    } catch (error) {
                        logger.error('Bot is not responsive to getMe():', error.message);
                        return false;
                    }
                })();
                
                if (!isResponsive && botActive) {
                    logger.warn('Watchdog detected unresponsive bot, restarting polling...');
                    botActive = false; // Prevent multiple restarts
                    
                    try {
                        await bot.stopPolling();
                        
                        // Wait a bit before restarting
                        setTimeout(async () => {
                            try {
                                await bot.startPolling();
                                botActive = true;
                                logger.info('Bot polling restarted by watchdog');
                            } catch (error) {
                                logger.error('Failed to restart polling from watchdog:', error);
                                // Try again after longer delay
                                setTimeout(async () => {
                                    try {
                                        await bot.startPolling();
                                        botActive = true;
                                        logger.info('Bot polling restarted by watchdog (second attempt)');
                                    } catch (e) {
                                        logger.error('Watchdog failed to restart polling twice:', e);
                                        // Try one last time with a complete reinitialization
                                        botActive = true; // Allow the app to restart
                                        setTimeout(() => {
                                            initializeApp();
                                        }, 30000);
                                    }
                                }, 15000);
                            }
                        }, 5000);
                    } catch (error) {
                        logger.error('Watchdog failed to stop polling:', error);
                    }
                }
            } catch (error) {
                logger.error('Watchdog error:', error);
            }
        }, 60000); // Check every minute
        
        // Initialize Twitter Bot (if explicitly enabled in .env)
        if (process.env.TWITTER_BOT_ENABLED === 'true') {
            const twitterBot = require('./vybewhale-twitter-bot');
            twitterBot.initializeTwitterBot().then(initialized => {
                if (initialized) {
                    logger.info('Twitter bot initialized and running autonomously');
                } else {
                    logger.info('Twitter bot initialization failed');
                }
            });
        } else {
            logger.info('Twitter bot is disabled. Set TWITTER_BOT_ENABLED=true in .env to enable it.');
        }
        
        // Return cleanup resources
        return {
            bot,
            watchdogInterval,
            botActive: () => botActive
        };

    } catch (error) {
        logger.error('Failed to initialize application:', error);
        globalBot = null; // Clear reference if initialization fails
        throw error; // Rethrow to be handled by startWithRetry
    }
}

// Handle application shutdown - with more graceful handling for Render
process.on('SIGINT', async () => {
    logger.info('Received SIGINT signal, shutting down...');
    try {
        // Shutdown Twitter Bot if running
        if (process.env.TWITTER_BOT_ENABLED === 'true') {
            try {
                const twitterBot = require('./vybewhale-twitter-bot');
                twitterBot.shutdownTwitterBot();
                logger.info('Twitter bot shutdown complete');
            } catch (twitterError) {
                logger.error('Error shutting down Twitter bot:', twitterError);
            }
        }
        
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
        process.exit(1);
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
            const botStatus = globalBot ? 'connected' : 'disconnected';
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
    
    // Get server URL from environment or build it
    const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
    const fullServerUrl = serverUrl.includes('://') ? serverUrl : `https://${serverUrl}`;
    
    logger.info(`Setting up keep-alive ping to ${fullServerUrl}`);
    
    // Set up a new interval to ping the server more frequently (every 5 minutes)
    // Render's free tier spins down after 15 minutes of inactivity
    keepAliveInterval = setInterval(() => {
        // Log less frequently to avoid filling logs
        const shouldLog = Math.random() < 0.1; // Only log ~10% of pings
        
        // Make an HTTP request to our own service
        const pingUrl = `${fullServerUrl}/ping`;
        const options = {
            method: 'GET',
            timeout: 10000, // 10-second timeout
        };
        
        // Use native http or https based on URL
        const httpClient = pingUrl.startsWith('https') ? require('https') : http;
        
        if (shouldLog) {
            logger.debug(`Sending keep-alive ping to ${pingUrl}`);
        }
        
        const req = httpClient.request(pingUrl, options, (res) => {
            if (shouldLog) {
                logger.debug(`Keep-alive ping response: ${res.statusCode}`);
            }
            
            // Read the response data to properly close the connection
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
        });
        
        req.on('error', (error) => {
            logger.error(`Keep-alive ping failed: ${error.message}`);
            
            // If our standard ping fails, try an alternative approach
            try {
                // Try to make a request directly to Render's app URL if we have the app name
                const renderApp = process.env.RENDER_APP_NAME || 'vybewhale-bot';
                const renderUrl = `https://${renderApp}.onrender.com/ping`;
                
                logger.info(`Attempting alternative ping to ${renderUrl}`);
                
                const altReq = https.request(renderUrl, { method: 'GET', timeout: 10000 }, (altRes) => {
                    logger.info(`Alternative ping response: ${altRes.statusCode}`);
                    
                    // Read the response data
                    let altData = '';
                    altRes.on('data', (chunk) => { altData += chunk; });
                });
                
                altReq.on('error', (altError) => {
                    logger.error(`Alternative ping also failed: ${altError.message}`);
                });
                
                altReq.end();
            } catch (backupError) {
                logger.error(`Failed to perform backup ping: ${backupError.message}`);
            }
        });
        
        req.end();
    }, 5 * 60 * 1000); // Every 5 minutes instead of 14
    
    // Also set up an external ping service if configured
    // This is crucial for keeping the Render free tier from sleeping
    if (process.env.PING_URL) {
        const pingTargets = process.env.PING_URL.split(',').map(url => url.trim());
        
        // Register our service with multiple ping services for redundancy
        pingTargets.forEach(target => {
            const pingUrl = target.replace('{url}', encodeURIComponent(fullServerUrl));
            
            logger.info(`Registering with external ping service: ${pingUrl}`);
            
            // Make a one-time request to register
            const httpClient = pingUrl.startsWith('https') ? require('https') : http;
            const req = httpClient.request(pingUrl, { method: 'GET', timeout: 30000 }, (res) => {
                logger.info(`Ping service registration response: ${res.statusCode}`);
                
                // Read the response data
                let pingData = '';
                res.on('data', (chunk) => { pingData += chunk; });
                res.on('end', () => {
                    if (pingData.length > 0) {
                        logger.debug(`Ping service response: ${pingData.substring(0, 100)}`);
                    }
                });
            });
            
            req.on('error', (error) => {
                logger.error(`Failed to register with ping service: ${error.message}`);
            });
            
            req.end();
        });
    } else {
        logger.info('No external ping service configured. Set PING_URL in env vars for better uptime.');
        logger.info('Example services: https://cron-job.org, https://uptimerobot.com, https://cronitor.io');
    }

    logger.info('Keep-alive ping mechanism initialized');
}

// Application initialization wrapper with retry
function startWithRetry(maxRetries = 5, retryDelay = 30000) {
    let retries = 0;
    let resources = null;
    
    async function attemptStart() {
        try {
            // Clear any existing global reference before reinitialization
            globalBot = null;
            
            resources = await initializeApp();
            // Reset retries on successful start
            retries = 0;
        } catch (error) {
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
        }
    }
    
    attemptStart();
    setupKeepAlive();
    
    return {
        getResources: () => resources
    };
}

// Start the application with retry mechanism
startWithRetry();

/**
 * Handle callbacks for gem tracking and analysis
 */
async function handleGemCallbacks(bot, query) {
    try {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const callbackData = query.data;
        
        // Extract the callback action and wallet
        const [action, walletAddress] = callbackData.split(':');
        
        if (action === 'track_wallet') {
            // Add wallet to tracking
            const redisClient = redisManager.getClient();
            if (!redisClient?.isReady) {
                await bot.answerCallbackQuery(query.id, {
                    text: '⚠️ Storage service unavailable. Try again later.'
                });
                return;
            }
            
            // Check if user already has 5 wallets
            const trackedWallets = await redisClient.sMembers(`user:${userId}:wallets`);
            if (trackedWallets.length >= 5) {
                await bot.answerCallbackQuery(query.id, {
                    text: 'You are already tracking 5 wallets. Remove one first.',
                    show_alert: true
                });
                return;
            }
            
            // Add wallet to user's tracked wallets
            await redisClient.sAdd(`user:${userId}:wallets`, walletAddress);
            
            await bot.answerCallbackQuery(query.id, {
                text: `✅ Wallet added to your tracking list`
            });
        } else if (action === 'track_gems') {
            const redisClient = redisManager.getClient();
            if (!redisClient?.isReady) {
                await bot.answerCallbackQuery(query.id, {
                    text: '⚠️ Storage service unavailable. Try again later.'
                });
                return;
            }
            
            // Check if user is already following this wallet
            const isFollowing = await redisClient.sIsMember(`user:${userId}:wallets`, walletAddress);
            if (!isFollowing) {
                await bot.answerCallbackQuery(query.id, {
                    text: 'You must first follow this wallet before enabling gem alerts for it.',
                    show_alert: true
                });
                
                // Edit the message to add a track wallet button
                const message = query.message;
                const keyboard = {
                    inline_keyboard: [
                        [
                            { text: '📋 Track Wallet', callback_data: `track_wallet:${walletAddress}` }
                        ]
                    ]
                };
                
                try {
                    await bot.editMessageReplyMarkup(keyboard, {
                        chat_id: chatId,
                        message_id: message.message_id
                    });
                } catch (err) {
                    logger.error('Error updating keyboard:', err);
                }
                
                return;
            }
            
            // Track wallet for gem alerts
            await config.handleTrackGemAlerts(bot, {
                chat: { id: chatId },
                from: { id: userId }
            }, [null, walletAddress]);
            
            await bot.answerCallbackQuery(query.id, {
                text: `✅ Gem alerts enabled for this wallet`
            });
            
            // Refresh the wallet performance list to update buttons
            if (query.message && query.message.text && query.message.text.includes("Select a wallet to view performance")) {
                // Get updated wallet list to refresh the UI
                const { handleWalletPerformanceCallback } = require('./commands/listWallets');
                await handleWalletPerformanceCallback(bot, {
                    ...query,
                    data: `wallet_performance_list:${userId}`
                });
            }
        } else if (action === 'untrack_gems') {
            const redisClient = redisManager.getClient();
            if (!redisClient?.isReady) {
                await bot.answerCallbackQuery(query.id, {
                    text: '⚠️ Storage service unavailable. Try again later.'
                });
                return;
            }
            
            // Untrack wallet for gem alerts
            await config.handleUntrackGemAlerts(bot, {
                chat: { id: chatId },
                from: { id: userId }
            }, [null, walletAddress]);
            
            await bot.answerCallbackQuery(query.id, {
                text: `✅ Gem alerts disabled for this wallet`
            });
            
            // Refresh the wallet performance list to update buttons
            if (query.message && query.message.text && query.message.text.includes("Select a wallet to view performance")) {
                // Get updated wallet list to refresh the UI
                const { handleWalletPerformanceCallback } = require('./commands/listWallets');
                await handleWalletPerformanceCallback(bot, {
                    ...query,
                    data: `wallet_performance_list:${userId}`
                });
            }
        }
    } catch (error) {
        logger.error('Error handling gem callback:', error);
        await bot.answerCallbackQuery(query.id, {
            text: 'Error processing request. Please try again.'
        });
    }
}