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

async function handleSetThreshold(msg, match) {
    const chatId = msg.chat.id;
    const threshold = parseFloat(match[1]);

    try {
        if (!redis?.isReady) {
            await msg.reply('⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        await redis.set(`threshold:${chatId}`, threshold);
        await msg.reply(`✅ Whale alert threshold set to $${threshold}`);
    } catch (error) {
        logger.error('Error setting threshold:', error);
        await msg.reply('❌ Error setting threshold. Please try again.');
    }
}

async function handleAddWallet(msg, match) {
    const chatId = msg.chat.id;
    const wallet = match[1];

    try {
        if (!redis?.isReady) {
            await msg.reply('⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        await redis.sAdd(`wallets:${chatId}`, wallet);
        await msg.reply(`✅ Added wallet ${wallet} to tracking list`);
    } catch (error) {
        logger.error('Error adding wallet:', error);
        await msg.reply('❌ Error adding wallet. Please try again.');
    }
}

async function handleRemoveWallet(msg, match) {
    const chatId = msg.chat.id;
    const wallet = match[1];

    try {
        if (!redis?.isReady) {
            await msg.reply('⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        await redis.sRem(`wallets:${chatId}`, wallet);
        await msg.reply(`✅ Removed wallet ${wallet} from tracking list`);
    } catch (error) {
        logger.error('Error removing wallet:', error);
        await msg.reply('❌ Error removing wallet. Please try again.');
    }
}

async function handleEnableAlerts(msg, match) {
    const chatId = msg.chat.id;
    const alertType = match[1].toLowerCase();

    try {
        if (!redis?.isReady) {
            await msg.reply('⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        await redis.sAdd(`alerts:${chatId}`, alertType);
        await msg.reply(`✅ Enabled ${alertType} alerts`);
    } catch (error) {
        logger.error('Error enabling alerts:', error);
        await msg.reply('❌ Error enabling alerts. Please try again.');
    }
}

async function handleDisableAlerts(msg, match) {
    const chatId = msg.chat.id;
    const alertType = match[1].toLowerCase();

    try {
        if (!redis?.isReady) {
            await msg.reply('⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        await redis.sRem(`alerts:${chatId}`, alertType);
        await msg.reply(`✅ Disabled ${alertType} alerts`);
    } catch (error) {
        logger.error('Error disabling alerts:', error);
        await msg.reply('❌ Error disabling alerts. Please try again.');
    }
}

module.exports = {
    handleSetThreshold,
    handleAddWallet,
    handleRemoveWallet,
    handleEnableAlerts,
    handleDisableAlerts
}; 