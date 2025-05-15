const Redis = require('redis');
const logger = require('../utils/logger');
const { processWalletPerformance, processWalletPnLDetail } = require('./walletPerformance');

class RedisClient {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.client = Redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 10) {
              logger.error("Redis connection failed after 10 retries");
                    return false;
                }
                return Math.min(retries * 100, 3000);
          },
        },
    });

      this.client.on("error", (err) => {
        logger.error("Redis Client Error:", err);
    });

      this.client.on("connect", () => {
        logger.info("Redis Client Connected");
    });

      await this.client.connect();
      this.isInitialized = true;
} catch (error) {
      logger.error("Redis Initialization Error:", error);
      throw error;
    }
  }

  async quit() {
    if (this.client) {
      await this.client.quit();
      this.isInitialized = false;
    }
  }

  get isReady() {
    return this.client?.isReady || false;
  }
}

const redisClient = new RedisClient();

// Initialize Redis when the module loads
redisClient.initialize().catch((err) => {
  logger.error("Failed to initialize Redis:", err);
});

async function handleListWallets(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        if (!redisClient.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. No tracked wallets are available.');
            return;
        }

        // Get user-specific tracked wallets
        const wallets = await redisClient.client.sMembers(`user:${userId}:wallets`);
        
        if (wallets.length === 0) {
            await bot.sendMessage(chatId, '📝 You are not tracking any wallets yet.\n\nUse /trackwallet to start tracking a wallet.');
            return;
        }

        // Check which wallets have gem alerts enabled
        const gemTrackedWallets = [];
        for (const wallet of wallets) {
            const isTrackedForGems = await redisClient.client.sIsMember(`wallet:${wallet}:gem_users`, chatId.toString());
            if (isTrackedForGems) {
                gemTrackedWallets.push(wallet);
            }
        }

        // Format the list of wallets with gem alert status
        const walletList = wallets.map((wallet, index) => {
            const gemStatus = gemTrackedWallets.includes(wallet) ? ' 💎' : '';
            return `${index + 1}. \`${wallet}\`${gemStatus}`;
        }).join('\n\n');

        let message = `📝 *Your Tracked Wallets:*\n\n${walletList}\n\n` +
            `Total wallets: ${wallets.length}/5\n\n`;
            
        // Add gem legend if any wallet has gem alerts
        if (gemTrackedWallets.length > 0) {
            message += `_💎 = Gem alerts enabled_\n\n`;
        }
        
        message += `_Tap on the address to copy it_\n` +
            `Use /untrackwallet to stop tracking a wallet.`;

        // Create an improved inline keyboard with separate buttons for performance and gem alerts
        const inlineKeyboard = {
            inline_keyboard: [
                [
                    { text: "📊 View Performance", callback_data: `wallet_performance_list:${userId}` }
                ],
                [
                    { text: "💎 Manage Gem Alerts", callback_data: `wallet_gems_list:${userId}` }
                ]
            ]
        };

        await bot.sendMessage(chatId, message, { 
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: inlineKeyboard
        });
        logger.info(`Listed ${wallets.length} tracked wallets for user ${userId}`);
    } catch (error) {
        logger.error('Error listing tracked wallets:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving tracked wallets. Please try again later.');
    }
}

/**
 * Handle callback when user clicks "View Performance" or "Manage Gem Alerts" button
 */
async function handleWalletPerformanceCallback(bot, query) {
    try {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const callbackData = query.data;
        
        // Extract the callback action
        const parts = callbackData.split(':');
        const action = parts[0];
        
        logger.info(`Processing callback in listWallets.js: ${action} from user ${userId}`);
        
        if (action === 'wallet_performance_list') {
            // Show list of wallets as buttons for performance tracking
            logger.info(`Showing performance list for user ${userId}`);
            await showWalletPerformanceList(bot, query);
        } else if (action === 'wallet_gems_list') {
            // Show list of wallets as buttons for gem alert management
            logger.info(`Showing gems management list for user ${userId}`);
            await showWalletGemsManagementList(bot, query);
        } else if (action === 'wallet_performance') {
            // User selected a specific wallet to analyze
            const walletAddress = parts[1];
            
            // First, answer the callback query to stop loading indicator
            await bot.answerCallbackQuery(query.id);
            
            // Process the wallet performance (using the method from walletPerformance.js)
            await processWalletPerformance(bot, chatId, walletAddress);
        } else if (action === 'wallet_period') {
            // User selected a different time period
            const walletAddress = parts[1];
            const days = parseInt(parts[2]);
            
            // Answer the callback query
            await bot.answerCallbackQuery(query.id, {
                text: `Analyzing ${days} day performance...`
            });
            
            // Process the wallet performance with the selected time period
            await processWalletPerformance(bot, chatId, walletAddress, days);
        } else if (action === 'wallet_pnl') {
            // User wants to see detailed PnL analysis
            const walletAddress = parts[1];
            const resolution = parts[2]; // '1d', '7d', or '30d'
            
            // Answer the callback query
            await bot.answerCallbackQuery(query.id, {
                text: `Fetching detailed PnL data...`
            });
            
            // Show detailed PnL analysis
            await processWalletPnLDetail(bot, chatId, walletAddress, resolution);
        } else if (action === 'track_gems' || action === 'untrack_gems') {
            // Handle gem alert toggling
            const walletAddress = parts[1];
            
            await toggleGemAlerts(bot, query, walletAddress, action === 'track_gems');
            
            // Show the gem management list again after toggling
            await showWalletGemsManagementList(bot, query);
        } else if (action === 'wallet_instruction') {
            // Just a static help button - nothing to do but acknowledge click
            await bot.answerCallbackQuery(query.id, {
                text: `Click on any wallet to toggle gem alerts for it`
            });
        } else if (action === 'wallet_list_back') {
            // User clicked back button - show wallet list again
            await bot.answerCallbackQuery(query.id);
            
            // Get user's tracked wallets
            const wallets = await redisClient.client.sMembers(`user:${userId}:wallets`);
            
            if (wallets.length === 0) {
                await bot.editMessageText(
                    '📝 You are not tracking any wallets yet.\n\nUse /trackwallet to start tracking a wallet.',
                    {
                        chat_id: chatId,
                        message_id: query.message.message_id
                    }
                );
                return;
            }
            
            // Check which wallets have gem alerts enabled
            const gemTrackedWallets = [];
            for (const wallet of wallets) {
                const isTrackedForGems = await redisClient.client.sIsMember(`wallet:${wallet}:gem_users`, chatId.toString());
                if (isTrackedForGems) {
                    gemTrackedWallets.push(wallet);
                }
            }
            
            // Format the list of wallets with gem alert status
            const walletList = wallets.map((wallet, index) => {
                const gemStatus = gemTrackedWallets.includes(wallet) ? ' 💎' : '';
                return `${index + 1}. \`${wallet}\`${gemStatus}`;
            }).join('\n\n');
            
            // Create improved inline keyboard with separate buttons for performance and gem alerts
            const inlineKeyboard = {
                inline_keyboard: [
                    [
                        { text: "📊 View Performance", callback_data: `wallet_performance_list:${userId}` }
                    ],
                    [
                        { text: "💎 Manage Gem Alerts", callback_data: `wallet_gems_list:${userId}` }
                    ]
                ]
            };
            
            // Create the message text with gem legend if needed
            let messageText = `📝 *Your Tracked Wallets:*\n\n${walletList}\n\n` +
                `Total wallets: ${wallets.length}/5\n\n`;
                
            if (gemTrackedWallets.length > 0) {
                messageText += `_💎 = Gem alerts enabled_\n\n`;
            }
            
            messageText += `_Tap on the address to copy it_\n` +
                `Use /untrackwallet to stop tracking a wallet.`;
            
            // Try a more direct approach to edit the message text
            try {
                await bot.editMessageText(messageText, {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: "Markdown",
                    reply_markup: inlineKeyboard
                });
                logger.info(`Successfully updated gem management UI for user ${userId}`);
            } catch (editError) {
                logger.error(`Error editing message for gem management: ${editError.message}`);
                // If there was an error editing, try answering the callback query with an error
                await bot.answerCallbackQuery(query.id, {
                    text: "Error updating the interface. Please try again.",
                    show_alert: true
                });
            }
        } else {
            // Unhandled action - provide feedback
            await bot.answerCallbackQuery(query.id, {
                text: `Unknown action: ${action}. Please try again.`
            });
            logger.warn(`Unhandled callback action: ${action}`);
        }
    } catch (error) {
        logger.error('Error handling wallet performance callback:', error);
        await bot.answerCallbackQuery(query.id, { 
            text: '❌ Error processing request. Please try again.' 
        });
    }
}

/**
 * Show list of tracked wallets as buttons for performance tracking
 */
async function showWalletPerformanceList(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    
    try {
        if (!redisClient.isReady) {
            await bot.answerCallbackQuery(query.id, { 
                text: '⚠️ Storage service is currently unavailable.' 
            });
            return;
        }
        
        // Get user's tracked wallets
        const wallets = await redisClient.client.sMembers(`user:${userId}:wallets`);
        
        if (wallets.length === 0) {
            await bot.answerCallbackQuery(query.id, { 
                text: 'You are not tracking any wallets yet.' 
            });
            return;
        }
        
        // Create buttons for each wallet - only for performance view
        const walletButtons = [];
        
        // Add each wallet as a separate row for better display
        for (const wallet of wallets) {
            walletButtons.push([{
                text: `📊 ${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`,
                callback_data: `wallet_performance:${wallet}`
            }]);
        }
        
        // Add a back button
        walletButtons.push([{
            text: "← Back to Wallet List",
            callback_data: "wallet_list_back"
        }]);
        
        const inlineKeyboard = {
            inline_keyboard: walletButtons
        };
        
        // Answer the callback query first
        await bot.answerCallbackQuery(query.id);
        
        // Edit the original message to show the wallet list as buttons
        let messageText = "📊 *Select a wallet to view performance:*\n\n";
        messageText += "Click on any wallet to see its performance metrics.";
        
        try {
            await bot.editMessageText(messageText, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "Markdown",
                reply_markup: inlineKeyboard
            });
            logger.info(`Successfully updated performance UI for user ${userId}`);
        } catch (editError) {
            logger.error(`Error editing message for performance view: ${editError.message}`);
            // If there was an error editing, try answering the callback query with an error
            await bot.answerCallbackQuery(query.id, {
                text: "Error updating the interface. Please try again.",
                show_alert: true
            });
        }
        
    } catch (error) {
        logger.error('Error showing wallet performance list:', error);
        await bot.answerCallbackQuery(query.id, { 
            text: '❌ Error retrieving wallet list. Please try again.' 
        });
    }
}

/**
 * Toggle gem alerts for a specific wallet
 */
async function toggleGemAlerts(bot, query, walletAddress, enable) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    
    try {
        logger.info(`Toggling gem alerts ${enable ? 'on' : 'off'} for wallet ${walletAddress} by user ${userId}`);
        
        if (!redisClient.isReady) {
            await bot.answerCallbackQuery(query.id, { 
                text: '⚠️ Storage service is currently unavailable.' 
            });
            return false;
        }
        
        if (enable) {
            // Enable gem alerts
            await Promise.all([
                // Add the wallet to gem alert tracking
                redisClient.client.sAdd('gem_alert_wallets', walletAddress),
                
                // Associate this chat/user with the wallet's gem alerts
                redisClient.client.sAdd(`wallet:${walletAddress}:gem_users`, chatId.toString()),
                
                // Enable gem alerts for this chat/user
                redisClient.client.sAdd('alert_enabled_chats', chatId.toString()),
                redisClient.client.sAdd(`alerts:${chatId}`, 'gem')
            ]);
            
            // Initialize an empty cache for this wallet in the AlertService
            // This avoids sending alerts for existing gems
            const alertService = require('../services/alerts');
            if (alertService && alertService.walletGemsCache) {
                // Make sure the cache exists with empty array to prevent false positives
                const redisManager = require('../utils/redis');
                const alertServiceInstance = new alertService();
                
                // Initialize the alert service if not already done
                if (!alertServiceInstance.redis) {
                    await alertServiceInstance.initialize(redisManager.getClient());
                }
                
                // Force a check for this wallet to establish baseline
                const now = Date.now();
                alertServiceInstance.lastCheck[`gem_${walletAddress}`] = now;
                
                // Clear the cache for this wallet to establish a baseline to compare against
                if (!alertServiceInstance.walletGemsCache) {
                    alertServiceInstance.walletGemsCache = {};
                }
                
                // Trigger an immediate check for this wallet
                const { findLowCapGems } = require('../services/vybeApi/lowCapGems');
                const currentGems = await findLowCapGems(walletAddress);
                alertServiceInstance.walletGemsCache[walletAddress] = currentGems || [];
                
                logger.info(`Set initial gem baseline for wallet ${walletAddress}: ${currentGems.length} gems`);
            } else {
                logger.warn('Alert service not available for gem cache initialization');
            }
            
            // Success message
            await bot.answerCallbackQuery(query.id, { 
                text: '✅ Gem alerts enabled for this wallet.' 
            });
            return true;
        } else {
            // Disable gem alerts
            await Promise.all([
                redisClient.client.sRem(`wallet:${walletAddress}:gem_users`, chatId.toString())
            ]);
            
            // Check if any users are still tracking this wallet for gems
            const trackingUsers = await redisClient.client.sMembers(`wallet:${walletAddress}:gem_users`);
            if (trackingUsers.length === 0) {
                // If no users left, remove wallet from gem alert tracking
                await redisClient.client.sRem('gem_alert_wallets', walletAddress);
            }
            
            // Success message
            await bot.answerCallbackQuery(query.id, { 
                text: '✅ Gem alerts disabled for this wallet.' 
            });
            return true;
        }
    } catch (error) {
        logger.error(`Error toggling gem alerts: ${error.message}`, { error });
        await bot.answerCallbackQuery(query.id, { 
            text: '❌ Error updating gem alerts. Please try again.' 
        });
        return false; // Return false to indicate failure
    }
}

/**
 * Show list of tracked wallets for gem alert management
 */
async function showWalletGemsManagementList(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    
    try {
        logger.info(`Entering showWalletGemsManagementList for user ${userId}`);
        
        if (!redisClient.isReady) {
            logger.error(`Redis client not ready in showWalletGemsManagementList for user ${userId}`);
            await bot.answerCallbackQuery(query.id, { 
                text: '⚠️ Storage service is currently unavailable.' 
            });
            return;
        }
        
        // Get user's tracked wallets
        const wallets = await redisClient.client.sMembers(`user:${userId}:wallets`);
        logger.info(`Found ${wallets.length} wallets for user ${userId}`);
        
        if (wallets.length === 0) {
            await bot.answerCallbackQuery(query.id, { 
                text: 'You are not tracking any wallets yet.' 
            });
            return;
        }
        
        // Check which wallets have gem alerts enabled
        const gemTrackedWallets = [];
        for (const wallet of wallets) {
            const isTrackedForGems = await redisClient.client.sIsMember(`wallet:${wallet}:gem_users`, chatId.toString());
            if (isTrackedForGems) {
                gemTrackedWallets.push(wallet);
            }
        }
        
        // Create toggle buttons for each wallet - only for gem alerts
        const walletButtons = [];
        
        // Add each wallet as a separate row
        for (const wallet of wallets) {
            const hasGemAlerts = gemTrackedWallets.includes(wallet);
            walletButtons.push([{
                text: `${hasGemAlerts ? '✅' : '❌'} ${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`,
                callback_data: hasGemAlerts ? `untrack_gems:${wallet}` : `track_gems:${wallet}`
            }]);
        }
        
        // Add a helpful instruction text that isn't a button
        let instructionText = "Toggle gem alerts for each wallet below:";
        
        // Add a back button
        walletButtons.push([{
            text: "← Back to Wallet List",
            callback_data: "wallet_list_back"
        }]);
        
        const inlineKeyboard = {
            inline_keyboard: walletButtons
        };
        
        // Answer the callback query first
        await bot.answerCallbackQuery(query.id);
        
        // Edit the original message to show the gem alert management options
        let messageText = "💎 *Low Cap Gem Alert Management*\n\n";
        messageText += "When enabled, you'll receive alerts when a wallet acquires new low cap gems (< $10M market cap).\n\n";
        
        if (gemTrackedWallets.length > 0) {
            messageText += `*Currently enabled for:* ${gemTrackedWallets.length} wallet${gemTrackedWallets.length > 1 ? 's' : ''}\n\n`;
        } else {
            messageText += "*No gem alerts enabled yet.*\n\n";
        }
        
        messageText += `${instructionText}`;
        
        try {
            await bot.editMessageText(messageText, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "Markdown",
                reply_markup: inlineKeyboard
            });
            logger.info(`Successfully updated gem management UI for user ${userId}`);
        } catch (editError) {
            logger.error(`Error editing message for gem management: ${editError.message}`);
            // If there was an error editing, try answering the callback query with an error
            await bot.answerCallbackQuery(query.id, {
                text: "Error updating the interface. Please try again.",
                show_alert: true
            });
        }
        
    } catch (error) {
        logger.error('Error showing gem alerts management:', error);
        await bot.answerCallbackQuery(query.id, { 
            text: '❌ Error retrieving wallet list. Please try again.' 
        });
    }
}

// Cleanup function to be called when shutting down the application
async function cleanup() {
  await redisClient.quit();
}

module.exports = { 
  handleListWallets,
  handleWalletPerformanceCallback,
  cleanup
}; 