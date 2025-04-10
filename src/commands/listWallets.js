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
        
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. No tracked wallets are available.');
            return;
        }

        // Get all tracked wallets
        const wallets = await redis.sMembers('tracked_wallets');
        
        if (wallets.length === 0) {
            await bot.sendMessage(chatId, '📝 You are not tracking any wallets yet.\n\nUse /trackwallet to start tracking a wallet.');
            return;
        }

        // Format the list of wallets
        const walletList = wallets.map((wallet, index) => 
            `${index + 1}. ${wallet}`
        ).join('\n');

        const message = `📝 Your Tracked Wallets:\n\n${walletList}\n\n` +
            `Use /untrackwallet [ADDRESS] to stop tracking a wallet.`;

        await bot.sendMessage(chatId, message);
        logger.info(`Listed ${wallets.length} tracked wallets for user ${msg.from.id}`);
    } catch (error) {
        logger.error('Error listing tracked wallets:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving tracked wallets. Please try again later.');
    }
}

module.exports = { handleListWallets }; 