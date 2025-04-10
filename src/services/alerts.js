const Redis = require('redis');
const vybeApi = require('./vybeApi');
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

    redis.on('connect', () => {
        logger.info('Redis Client Connected');
    });

    redis.connect().catch((err) => {
        logger.error('Redis Connection Error:', err);
    });
} catch (error) {
    logger.error('Redis Initialization Error:', error);
}

class AlertService {
    constructor() {
        this.checkInterval = parseInt(process.env.ALERT_CHECK_INTERVAL) || 60000; // Default to 1 minute if not set
    }

    setupAlerts(bot) {
        setInterval(async () => {
            try {
                if (redis?.isReady) {
                    await this.checkWhaleAlerts(bot);
                    await this.checkWalletAlerts(bot);
                }
            } catch (error) {
                logger.error('Error in alert check:', error);
            }
        }, this.checkInterval);
    }

    async checkWhaleAlerts(bot) {
        if (!redis?.isReady) return;
        try {
            const trackedTokens = await redis.sMembers('tracked_tokens');
            for (const token of trackedTokens) {
                const transactions = await vybeApi.getWhaleTransactions(token);
                for (const tx of transactions) {
                    const key = `whale_alert:${tx.hash}`;
                    const exists = await redis.get(key);
                    if (!exists) {
                        await this.sendWhaleAlert(bot, tx);
                        await redis.set(key, '1', 'EX', 86400); // Expire after 24h
                    }
                }
            }
        } catch (error) {
            logger.error('Error checking whale alerts:', error);
        }
    }

    async checkWalletAlerts(bot) {
        if (!redis?.isReady) return;
        try {
            const trackedWallets = await redis.sMembers('tracked_wallets');
            for (const wallet of trackedWallets) {
                const balance = await vybeApi.getWalletTokenBalance(wallet);
                const key = `wallet_alert:${wallet}:${Date.now()}`;
                const exists = await redis.get(key);
                if (!exists) {
                    await this.sendWalletAlert(bot, wallet, balance);
                    await redis.set(key, '1', 'EX', 86400);
                }
            }
        } catch (error) {
            logger.error('Error checking wallet alerts:', error);
        }
    }

    async sendWhaleAlert(bot, transaction) {
        try {
            const message = `🐋 Whale Alert!\n\n` +
                `Token: ${transaction.token}\n` +
                `Amount: ${transaction.amount}\n` +
                `Type: ${transaction.type}\n` +
                `Wallet: ${transaction.wallet}\n` +
                `Transaction: ${transaction.hash}`;

            if (redis?.isReady) {
                const chats = await redis.sMembers('alert_chats');
                for (const chatId of chats) {
                    await bot.sendMessage(chatId, message);
                }
            }
        } catch (error) {
            logger.error('Error sending whale alert:', error);
        }
    }

    async sendWalletAlert(bot, wallet, balance) {
        try {
            const message = `👀 Wallet Activity Alert!\n\n` +
                `Wallet: ${wallet}\n` +
                `Total Value: $${balance.totalValue}\n` +
                `Top Tokens:\n` +
                balance.tokens.slice(0, 5).map(token => 
                    `• ${token.symbol}: $${token.value}`
                ).join('\n');

            if (redis?.isReady) {
                const chats = await redis.sMembers('alert_chats');
                for (const chatId of chats) {
                    await bot.sendMessage(chatId, message);
                }
            }
        } catch (error) {
            logger.error('Error sending wallet alert:', error);
        }
    }
}

// Export the class instead of an instance
module.exports = AlertService; 