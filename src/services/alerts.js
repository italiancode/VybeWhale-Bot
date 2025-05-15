const Redis = require('redis');
const vybeApi = require('./vybeApi');
const logger = require('../utils/logger');
const { getWhaleTransfers } = require('./vybeApi/whaleTransfers');
const { getWalletTokens, processWalletTokenBalance } = require('./vybeApi/walletTokens');
const { detectNewLowCapGems } = require('./vybeApi/lowCapGems');
const { formatNewGemAlertMessage } = require('../messages/gemMessages');
const { formatWalletAlertMessage, generateWalletMessageSignature } = require('../messages/walletMessages');
const { formatWhaleAlertMessage } = require('../messages/whaleMessages');

class AlertService {
    constructor() {
        this.checkInterval = parseInt(process.env.ALERT_CHECK_INTERVAL) || 60000; // Default to 1 minute
        this.redis = null;
        this.lastCheck = {};
        this.walletBalanceCache = {}; // Store previous balance data for comparison
        this.walletGemsCache = {}; // Store previous low cap gems data
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
                    await this.checkLowCapGemAlerts(bot);
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
                            
                            // Check if whale alerts are enabled for this chat
                            const hasWhaleAlerts = await this.redis.sIsMember(`alerts:${chatId}`, 'whale');
                            
                            if (hasWhaleAlerts && tx.usdAmount >= threshold) {
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
            // Get all tracked wallets
            const trackedWallets = await this.redis.sMembers('tracked_wallets');
            if (!trackedWallets.length) return;
            
            for (const wallet of trackedWallets) {
                // Rate limit checks per wallet
                if (this.lastCheck[wallet] && (Date.now() - this.lastCheck[wallet] < 300000)) {
                    continue; // Skip if checked in last 5 minutes
                }
                this.lastCheck[wallet] = Date.now();
                
                // Get all users tracking this wallet
                const userIds = await this.redis.sMembers(`wallet:${wallet}:users`);
                if (!userIds.length) continue;
                
                // Get wallet token balances using the new API endpoint
                const balanceData = await getWalletTokens(wallet, {
                    limit: 10, // Get top 10 tokens by value
                    sortByDesc: 'valueUsd'
                });
                
                // Process the balance data into a simplified format
                const balance = processWalletTokenBalance(balanceData);
                
                // Check for significant changes compared to last check
                const prevBalance = this.walletBalanceCache[wallet] || null;
                const hasSignificantChanges = this.detectSignificantChanges(balance, prevBalance);
                
                // Store the previous message signature to avoid sending duplicate messages
                const currentMessageSignature = generateWalletMessageSignature(wallet, balance);
                const previousMessageSignature = await this.redis.get(`wallet:${wallet}:last_message_signature`);
                
                // Update the cache with current balance
                this.walletBalanceCache[wallet] = balance;
                
                // Only send alerts if there are significant changes AND the message content would be different
                if (hasSignificantChanges && (!previousMessageSignature || previousMessageSignature !== currentMessageSignature)) {
                    logger.info(`Significant changes detected in wallet ${wallet}, sending alerts`);
                    
                    // Send alert to each user tracking this wallet
                    for (const userId of userIds) {
                        try {
                            // Check if the user has wallet alerts enabled
                            const userHasWalletAlerts = await this.redis.sIsMember(`alerts:${userId}`, 'wallet');
                            
                            // Only send alert if user has wallet alerts enabled
                            if (userHasWalletAlerts) {
                                await this.sendWalletAlert(bot, wallet, balance, userId, prevBalance);
                            } else {
                                logger.info(`Skipping wallet alert for user ${userId} - wallet alerts disabled`);
                            }
                        } catch (error) {
                            logger.error(`Error sending wallet alert to user ${userId}:`, error);
                        }
                    }
                    
                    // Store the new message signature with a TTL of 24 hours
                    await this.redis.set(`wallet:${wallet}:last_message_signature`, currentMessageSignature, 'EX', 86400);
                } else if (hasSignificantChanges) {
                    logger.info(`Changes detected in wallet ${wallet}, but message content would be the same - skipping alert`);
                } else {
                    logger.info(`No significant changes detected for wallet ${wallet} - skipping alert`);
                }
            }
        } catch (error) {
            logger.error('Error checking wallet alerts:', error);
        }
    }
    
    /**
     * Detect significant changes in wallet balance
     * 
     * @param {Object} currentBalance - Current balance data
     * @param {Object} previousBalance - Previous balance data
     * @returns {boolean} - True if significant changes detected
     */
    detectSignificantChanges(currentBalance, previousBalance) {
        // If no previous data, consider it a significant change
        if (!previousBalance) return true;
        
        // Check for significant total value change (>5%)
        const totalValueChange = Math.abs(currentBalance.totalValue - previousBalance.totalValue);
        const totalValueChangePercent = previousBalance.totalValue > 0 
            ? (totalValueChange / previousBalance.totalValue) * 100 
            : 0;
            
        if (totalValueChangePercent > 5) return true;
        
        // Check for new tokens
        const currentTokens = new Set(currentBalance.tokens.map(t => t.mintAddress));
        const prevTokens = new Set(previousBalance.tokens.map(t => t.mintAddress));
        
        // New token appeared in the wallet
        if ([...currentTokens].some(addr => !prevTokens.has(addr))) return true;
        
        // Token disappeared from the wallet
        if ([...prevTokens].some(addr => !currentTokens.has(addr))) return true;
        
        // No significant changes detected
        return false;
    }

    async sendWhaleAlert(bot, transaction, chatId) {
        try {
            const message = formatWhaleAlertMessage(transaction);

            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            logger.error('Error sending whale alert:', error);
        }
    }

    async sendWalletAlert(bot, wallet, balance, chatId, prevBalance = null) {
        try {
            const message = formatWalletAlertMessage(wallet, balance, prevBalance);

            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            logger.error('Error sending wallet alert:', error);
        }
    }

    /**
     * Check for new low cap gems in tracked wallets
     */
    async checkLowCapGemAlerts(bot) {
        if (!this.redis?.isReady) return;
        
        try {
            // Get all wallets tracked for gem alerts
            const trackedWallets = await this.redis.sMembers('gem_alert_wallets');
            if (!trackedWallets.length) return;
            
            logger.info(`Checking gem alerts for ${trackedWallets.length} tracked wallets`);
            
            for (const wallet of trackedWallets) {
                // Rate limit checks per wallet
                if (this.lastCheck[`gem_${wallet}`] && (Date.now() - this.lastCheck[`gem_${wallet}`] < 1800000)) {
                    // Skip if checked in the last 30 minutes (reduced from 1 hour)
                    continue;
                }
                this.lastCheck[`gem_${wallet}`] = Date.now();
                
                // Get all users tracking this wallet for gem alerts
                const userIds = await this.redis.sMembers(`wallet:${wallet}:gem_users`);
                if (!userIds.length) {
                    logger.info(`No users tracking gems for wallet ${wallet}, skipping`);
                    continue;
                }
                
                logger.info(`Checking for new gems in wallet ${wallet} for ${userIds.length} users`);
                
                // Get previous gems data or initialize empty array
                const prevGems = this.walletGemsCache[wallet] || [];
                
                // Check for new low cap gems
                const newGems = await detectNewLowCapGems(wallet, prevGems);
                
                if (newGems.length > 0) {
                    logger.info(`Found ${newGems.length} new gems in wallet ${wallet}`);
                    
                    // Update the cache with current gems (use all new gems detected)
                    if (!this.walletGemsCache[wallet]) {
                        this.walletGemsCache[wallet] = newGems;
                    } else {
                        // Merge new gems with previous ones
                        const prevMintAddresses = new Set(prevGems.map(g => g.mintAddress));
                        for (const gem of newGems) {
                            if (!prevMintAddresses.has(gem.mintAddress)) {
                                this.walletGemsCache[wallet].push(gem);
                            }
                        }
                    }
                    
                    // Send alerts for each new gem
                    for (const gem of newGems) {
                        const messageData = formatNewGemAlertMessage(wallet, gem);
                        
                        // Send to each user tracking this wallet's gems
                        for (const userId of userIds) {
                            try {
                                // Check if the user has gem alerts enabled
                                const userHasGemAlerts = await this.redis.sIsMember(`alerts:${userId}`, 'gem');
                                
                                if (userHasGemAlerts) {
                                    await bot.sendMessage(userId, messageData.text, {
                                        parse_mode: 'Markdown',
                                        disable_web_page_preview: true,
                                        reply_markup: messageData.keyboard
                                    });
                                    logger.info(`Sent gem alert for wallet ${wallet} to user ${userId}: ${gem.symbol}`);
                                } else {
                                    logger.info(`User ${userId} has gem alerts disabled, skipping notification for ${gem.symbol}`);
                                }
                            } catch (error) {
                                logger.error(`Error sending gem alert to user ${userId}:`, error);
                            }
                        }
                    }
                } else {
                    logger.info(`No new gems found in wallet ${wallet}`);
                }
            }
        } catch (error) {
            logger.error('Error checking low cap gem alerts:', error);
        }
    }
}

module.exports = AlertService; 