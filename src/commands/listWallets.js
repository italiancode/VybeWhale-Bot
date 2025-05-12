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

        // Format the list of wallets with only full addresses
        const walletList = wallets.map((wallet, index) => 
            `${index + 1}. \`${wallet}\``
        ).join('\n\n');

        const message = `📝 *Your Tracked Wallets:*\n\n${walletList}\n\n` +
            `Total wallets: ${wallets.length}/5\n\n` +
            `_Tap on the address to copy it_\n` +
            `Use /untrackwallet to stop tracking a wallet.`;

        // Create an inline keyboard with "Track Performance" button
        const inlineKeyboard = {
            inline_keyboard: [
                [{ text: "📊 Track Performance", callback_data: `wallet_performance_list:${userId}` }]
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
 * Handle callback when user clicks "Track Performance" button
 */
async function handleWalletPerformanceCallback(bot, query) {
    try {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const callbackData = query.data;
        
        // Extract the callback action
        const parts = callbackData.split(':');
        const action = parts[0];
        
        if (action === 'wallet_performance_list') {
            // Show list of wallets as buttons
            await showWalletPerformanceList(bot, query);
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
            
            // Format the list of wallets with only full addresses
            const walletList = wallets.map((wallet, index) => 
                `${index + 1}. \`${wallet}\``
            ).join('\n\n');
            
            // Create the "Track Performance" button again
            const inlineKeyboard = {
                inline_keyboard: [
                    [{ text: "📊 Track Performance", callback_data: `wallet_performance_list:${userId}` }]
                ]
            };
            
            // Edit the message to show the wallet list again
            await bot.editMessageText(
                `📝 *Your Tracked Wallets:*\n\n${walletList}\n\n` +
                `Total wallets: ${wallets.length}/5\n\n` +
                `_Tap on the address to copy it_\n` +
                `Use /untrackwallet to stop tracking a wallet.`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true,
                    reply_markup: inlineKeyboard
                }
            );
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
        
        // Create buttons for each wallet
        const walletButtons = wallets.map(wallet => [{
            text: wallet,
            callback_data: `wallet_performance:${wallet}`
        }]);
        
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
        await bot.editMessageText(
            "📊 *Select a wallet to view performance:*", {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
        });
        
    } catch (error) {
        logger.error('Error showing wallet performance list:', error);
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