const Redis = require('redis');
const vybeApi = require('./vybeApi');
const logger = require('../utils/logger');

class AlertService {
    constructor() {
        this.checkInterval = parseInt(process.env.ALERT_CHECK_INTERVAL) || 60000; // Default to 1 minute
        this.redis = null;
        this.lastCheck = {};
    }

    async initialize(redisClient) {
        this.redis = redisClient;
        logger.info('Alert Service initialized');
    }

    setupAlerts(bot) {
        if (!this.redis) {
            logger.error('Alert Service not initialized with Redis client');
            return;
        }

        setInterval(async () => {
            try {
                if (this.redis?.isReady) {
                    await this.checkWhaleAlerts(bot);
                    await this.checkWalletAlerts(bot);
                }
            } catch (error) {
                logger.error('Error in alert check:', error);
            }
        }, this.checkInterval);

        logger.info('Alert checks started');
    }

    async checkWhaleAlerts(bot) {
        if (!this.redis?.isReady) return;
        
        try {
            // Get all chats that have alerts enabled
            const alertChats = await this.redis.sMembers('alert_enabled_chats');
            if (!alertChats.length) return;

            const trackedTokens = await this.redis.sMembers('tracked_tokens');
            const now = Date.now();

            for (const token of trackedTokens) {
                // Rate limit checks per token
                if (this.lastCheck[token] && (now - this.lastCheck[token] < 30000)) {
                    continue; // Skip if checked in last 30 seconds
                }
                this.lastCheck[token] = now;

                const transactions = await vybeApi.getWhaleTransactions(token);
                
                for (const tx of transactions) {
                    const key = `whale_alert:${tx.hash}`;
                    const exists = await this.redis.get(key);
                    
                    if (!exists) {
                        // Check threshold for each chat
                        for (const chatId of alertChats) {
                            const threshold = await this.redis.get(`threshold:${chatId}`) || 10000;
                            if (tx.usdAmount >= threshold) {
                                await this.sendWhaleAlert(bot, tx, chatId);
                            }
                        }
                        // Store hash with 24h expiry
                        await this.redis.set(key, '1', 'EX', 86400);
                    }
                }
            }
        } catch (error) {
            logger.error('Error checking whale alerts:', error);
        }
    }

    async checkWalletAlerts(bot) {
        if (!this.redis?.isReady) return;
        
        try {
            const alertChats = await this.redis.sMembers('alert_enabled_chats');
            if (!alertChats.length) return;

            for (const chatId of alertChats) {
                const wallets = await this.redis.sMembers(`wallets:${chatId}`);
                
                for (const wallet of wallets) {
                    // Rate limit checks per wallet
                    if (this.lastCheck[wallet] && (Date.now() - this.lastCheck[wallet] < 300000)) {
                        continue; // Skip if checked in last 5 minutes
                    }
                    this.lastCheck[wallet] = Date.now();

                    const balance = await vybeApi.getWalletTokenBalance(wallet);
                    await this.sendWalletAlert(bot, wallet, balance, chatId);
                }
            }
        } catch (error) {
            logger.error('Error checking wallet alerts:', error);
        }
    }

    async sendWhaleAlert(bot, transaction, chatId) {
        try {
            const formatNumber = (num) => {
                if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
                if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
                if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
                return num.toFixed(2);
            };

            const message = 
                `🐋 *Whale Alert!*\n\n` +
                `*Token:* ${transaction.symbol || 'Unknown'}\n` +
                `*Amount:* ${formatNumber(transaction.amount)} (${transaction.symbol})\n` +
                `*USD Value:* $${formatNumber(transaction.usdAmount)}\n` +
                `*Type:* ${transaction.type}\n` +
                `*From:* \`${transaction.from.slice(0, 8)}...${transaction.from.slice(-8)}\`\n` +
                `*To:* \`${transaction.to.slice(0, 8)}...${transaction.to.slice(-8)}\`\n\n` +
                `[View Transaction 🔍](https://solscan.io/tx/${transaction.hash})`;

            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            logger.error('Error sending whale alert:', error);
        }
    }

    async sendWalletAlert(bot, wallet, balance, chatId) {
        try {
            const formatNumber = (num) => {
                if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
                if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
                if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
                return num.toFixed(2);
            };

            const message = 
                `👀 *Wallet Activity Update*\n\n` +
                `*Wallet:* \`${wallet.slice(0, 8)}...${wallet.slice(-8)}\`\n` +
                `*Total Value:* $${formatNumber(balance.totalValue)}\n\n` +
                `*Top Holdings:*\n` +
                balance.tokens.slice(0, 5).map(token => 
                    `• ${token.symbol}: $${formatNumber(token.value)}`
                ).join('\n') + '\n\n' +
                `[View Wallet 🔍](https://solscan.io/account/${wallet})`;

            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            logger.error('Error sending wallet alert:', error);
        }
    }
}

module.exports = AlertService; 