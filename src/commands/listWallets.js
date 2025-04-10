const Redis = require('redis');
const logger = require('../utils/logger');

let redis;
try {
    redis = Redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 10) {
                    logger.error('Redis connection failed after 10 retries');
                    return false;
                }
                return Math.min(retries * 100, 3000);
            }
        }
    });

    redis.on('error', (err) => {
        logger.error('Redis Client Error:', err);
    });

    redis.connect().catch((err) => {
        logger.error('Redis Connection Error:', err);
    });
} catch (error) {
    logger.error('Redis Initialization Error:', error);
}

async function handleListWallets(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. No tracked wallets are available.');
            return;
        }

        // Get user-specific tracked wallets
        const wallets = await redis.sMembers(`user:${userId}:wallets`);
        
        if (wallets.length === 0) {
            await bot.sendMessage(chatId, '📝 You are not tracking any wallets yet.\n\nUse /trackwallet to start tracking a wallet.');
            return;
        }

        // Format the list of wallets with both truncated display and full copyable address
        const walletList = wallets.map((wallet, index) => 
            `${index + 1}. ${wallet.slice(0, 8)}...${wallet.slice(-4)}\n` +
            `\`${wallet}\``
        ).join('\n\n');

        const message = `📝 *Your Tracked Wallets:*\n\n${walletList}\n\n` +
            `Total wallets: ${wallets.length}/5\n\n` +
            `_Tap on the full address to copy it_\n` +
            `Use /untrackwallet to stop tracking a wallet.`;

        await bot.sendMessage(chatId, message, { 
            parse_mode: 'Markdown',
            disable_web_page_preview: true 
        });
        logger.info(`Listed ${wallets.length} tracked wallets for user ${userId}`);
    } catch (error) {
        logger.error('Error listing tracked wallets:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving tracked wallets. Please try again later.');
    }
}

module.exports = { handleListWallets }; 