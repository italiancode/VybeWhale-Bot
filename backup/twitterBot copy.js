/**
 * VybeWhale Twitter Bot
 * 
 * This module autonomously monitors Solana tokens and tweets about:
 * - Significant token trades and volume spikes
 * - Major holder count changes and accumulation trends
 * - Notable price movements and market signals
 * 
 * No manual commands needed - the bot runs automatically in the background
 * and publishes market insights to grow the Twitter audience.
 */

const config = require('../src/vybewhale-twitter-bot/config');
const twitterClient = require('../src/vybewhale-twitter-bot/twitterClient');
const logger = require('../src/utils/logger');
const { formatNumber, formatLargeNumber } = require('../src/utils/formatter');

// Import Vybe API services
const whaleTransfers = require('../src/services/vybeApi/whaleTransfers');
const tokenHolders = require('../src/services/vybeApi/tokenHolders');
const tokenService = require('../src/services/vybeApi/walletTokens');
const tokenTrades = require('../src/services/vybeApi/tokenTrades');

// Import local vybeApi service
const vybeApi = require('../src/services/vybeApi');

// Template string processor that replaces variables in a template
function processTemplate(template, variables) {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    processed = processed.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  }
  
  // Add telegram link at the end if there's room
  if (processed.length + config.telegramLink.length + 30 < config.maxTweetLength) {
    processed += `\n\n🔍 For deeper analysis: ${config.telegramLink}`;
  }
  
  return processed;
}

class TwitterBot {
  constructor() {
    this.config = config; // Store reference to the config
    this.whaleCache = new Map(); // Cache to avoid duplicate whale transaction alerts
    this.priceCache = new Map(); // Cache for token prices to detect changes
    this.holderCache = new Map(); // Cache for holder counts to detect changes
    this.tradeCache = new Map(); // Cache for trade volumes and patterns
    this.isInitialized = false;
    this.monitoringIntervals = [];
    
    // Track tokens showing unusual volume/activity
    this.hotTokens = new Set();
  }

  /**
   * Initialize the Twitter bot
   */
  async initialize() {
    if (this.isInitialized) return true;
    
    // Initialize Twitter client
    const clientInitialized = twitterClient.initialize();
    if (!clientInitialized) {
      logger.error('Twitter bot initialization failed, Twitter bot disabled');
      return false;
    }
    
    this.isInitialized = true;
    logger.info('VybeWhale Twitter Bot initialized successfully');
    
    // Queue an initialization tweet
    this.sendStartupTweet();
    
    // Start the autonomous monitoring system
    this.startAutonomousMonitoring();
    
    return true;
  }
  
  /**
   * Send a startup tweet when the bot initializes
   */
  sendStartupTweet() {
    const startupMessage = `🚀 VybeWhale Market Intelligence is now online and tracking Solana tokens.\n\nMonitoring price movements, trade volume spikes, and whale activity 24/7.\n\n#Solana #Crypto #VybeWhale`;
    twitterClient.queueTweet(startupMessage);
  }
  
  /**
   * Start comprehensive autonomous monitoring of the Solana ecosystem
   */
  startAutonomousMonitoring() {
    // Clear any existing intervals
    this.stopMonitoring();
    
    // Monitor whale transactions (every 15 minutes)
    const whaleInterval = setInterval(() => this.checkWhaleTransactions(), 15 * 60 * 1000);
    this.monitoringIntervals.push(whaleInterval);
    
    // Monitor price changes (every 30 minutes)
    const priceInterval = setInterval(() => this.checkPriceChanges(), 30 * 60 * 1000);
    this.monitoringIntervals.push(priceInterval);
    
    // Monitor holder changes (every 2 hours)
    const holderInterval = setInterval(() => this.checkHolderChanges(), 2 * 60 * 60 * 1000);
    this.monitoringIntervals.push(holderInterval);
    
    // Monitor trade volumes and patterns (every 45 minutes)
    const tradeInterval = setInterval(() => this.checkTokenTrades(), 45 * 60 * 1000);
    this.monitoringIntervals.push(tradeInterval);
    
    // Discover hot tokens with high activity (every 4 hours)
    const discoveryInterval = setInterval(() => this.discoverHotTokens(), 4 * 60 * 60 * 1000);
    this.monitoringIntervals.push(discoveryInterval);
    
    // Run initial checks after a brief delay
    setTimeout(() => {
      this.checkWhaleTransactions();
      this.checkPriceChanges();
      this.discoverHotTokens(); // Start by finding hot tokens
    }, 10000);
    
    logger.info('Twitter bot autonomous monitoring started');
  }
  
  /**
   * Stop all monitoring intervals
   */
  stopMonitoring() {
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals = [];
    logger.info('Twitter bot monitoring stopped');
  }

  /**
   * Discover trending tokens with high activity
   */
  async discoverHotTokens() {
    if (!this.isInitialized) return;
    logger.info('Discovering hot tokens...');
    
    try {
      const popularTokens = this.config?.popularTokens || [];
      for (const tokenMint of popularTokens) {
        try {
          // Get token info using the local vybeApi
          const tokenInfo = await vybeApi.getTokenInfo(tokenMint);
          if (!tokenInfo || !tokenInfo.symbol) continue;
          
          // Check recent trades
          const trades = await tokenTrades.getTokenTrades({
            mintAddress: tokenMint,
            timeRangeHours: 24,
            limit: 20
          });
          
          // Check recent whale transfers
          const transfers = await whaleTransfers.getRecentWhaleTransfers(tokenMint);
          
          // Calculate activity score: recent trades + significant whale transfers
          let activityScore = trades.length;
          
          // Add weight for recent large whale transfers
          if (transfers && transfers.length) {
            const largeTransfers = transfers.filter(t => t.usd_amount >= config.whaleTransactionMinUsd/2);
            activityScore += largeTransfers.length * 2;
          }
          
          // Keep tokens with high activity score
          if (activityScore >= 5) {
            this.hotTokens.add(tokenMint);
            
            // If this is a newly discovered hot token, tweet about it
            if (!this.hotTokens.has(tokenMint) && !this.config.popularTokens.includes(tokenMint)) {
              // Tweet about the emerging hot token
              const tweetContent = `🔥 New Hot Token Alert!\n\n${tokenInfo.symbol} is showing increased activity with ${trades.length} trades and ${transfers?.length || 0} whale movements in the last 24h.\n\nPrice: $${formatNumber(tokenInfo.price)}\nMarket Cap: $${formatLargeNumber(tokenInfo.market_cap || 0)}\n\n#Solana #${tokenInfo.symbol} #Crypto`;
              
              twitterClient.queueTweet(tweetContent);
              logger.info(`Discovered and tweeted about new hot token: ${tokenInfo.symbol}`);
            }
          }
        } catch (error) {
          logger.error(`Error checking activity for token ${tokenMint}:`, error);
        }
      }
      
      logger.info(`Hot tokens updated: ${this.hotTokens.size} tokens being tracked`);
      
    } catch (error) {
      logger.error('Error discovering hot tokens:', error);
    }
  }
  
  /**
   * Check for significant token trades and volume patterns
   */
  async checkTokenTrades() {
    if (!this.isInitialized) return;
    logger.info('Checking for significant token trades and patterns...');
    
    try {
      // Check all tracked tokens (popular + hot)
      const tokensToCheck = [...new Set([...this.config.popularTokens, ...this.hotTokens])];
      
      for (const tokenAddress of tokensToCheck) {
        // Get token info
        const tokenInfo = await vybeApi.getTokenInfo(tokenAddress);
        if (!tokenInfo || !tokenInfo.symbol) continue;
        
        // Get recent trades (last 24h)
        const trades = await tokenTrades.getTokenTrades({
          mintAddress: tokenAddress,
          timeRangeHours: 24,
          limit: 100
        });
        
        if (!trades || trades.length < 5) continue; // Skip tokens with low trade activity
        
        // Calculate trade volume
        const totalVolumeUSD = trades.reduce((sum, trade) => {
          // Calculate USD value 
          const tradeValue = trade.baseSize * trade.price;
          return sum + tradeValue;
        }, 0);
        
        // Get previous trade volume from cache or initialize
        const previousData = this.tradeCache.get(tokenAddress) || { 
          volume: totalVolumeUSD, 
          timestamp: new Date(),
          tradeCount: trades.length
        };
        
        // Determine if there's a significant volume change
        const volumeChange = ((totalVolumeUSD - previousData.volume) / previousData.volume) * 100;
        const tradeCountChange = ((trades.length - previousData.tradeCount) / previousData.tradeCount) * 100;
        
        // Update cache
        this.tradeCache.set(tokenAddress, {
          volume: totalVolumeUSD,
          timestamp: new Date(),
          tradeCount: trades.length
        });
        
        // Calculate time since last update
        const hoursSinceLastUpdate = (new Date() - previousData.timestamp) / (1000 * 60 * 60);
        
        // Skip if we just recently tweeted about this token's trades
        if (hoursSinceLastUpdate < 12) continue;
        
        // Tweet about significant volume changes (100%+ increase)
        if (volumeChange >= 100) {
          const variables = {
            tokenSymbol: tokenInfo.symbol,
            volumeChange: volumeChange.toFixed(0),
            volume: formatLargeNumber(totalVolumeUSD),
            tradeCount: trades.length,
            price: formatNumber(tokenInfo.price)
          };
          
          // Create custom tweet for volume spike
          const tweetContent = `📊 Trading Volume Spike!\n\n${variables.tokenSymbol} volume increased by ${variables.volumeChange}% in the last ${Math.floor(hoursSinceLastUpdate)}h\n\nVolume: $${variables.volume}\nTrades: ${variables.tradeCount}\nPrice: $${variables.price}\n\n#Solana #${variables.tokenSymbol} #VybeWhale`;
          
          twitterClient.queueTweet(tweetContent);
          logger.info(`Queued volume spike tweet for ${tokenInfo.symbol}: ${volumeChange.toFixed(0)}% increase`);
        }
        
        // Also detect buy vs sell pressure
        const buyTrades = trades.filter(t => t.direction === 'Buy').length;
        const sellTrades = trades.filter(t => t.direction === 'Sell').length;
        
        if (trades.length >= 20) {
          // Calculate buy/sell ratio
          const buyRatio = buyTrades / trades.length;
          
          // Tweet about heavy buy pressure (>70% buys)
          if (buyRatio >= 0.7 && hoursSinceLastUpdate >= 12) {
            const buyPercentage = (buyRatio * 100).toFixed(0);
            
            const tweetContent = `🟢 Strong Buy Pressure!\n\n${tokenInfo.symbol} is seeing ${buyPercentage}% buy transactions out of ${trades.length} trades in the last 24h\n\nPrice: $${formatNumber(tokenInfo.price)}\nMarket Cap: $${formatLargeNumber(tokenInfo.market_cap || 0)}\n\n#Solana #${tokenInfo.symbol} #Trading #VybeWhale`;
            
            twitterClient.queueTweet(tweetContent);
            logger.info(`Queued buy pressure tweet for ${tokenInfo.symbol}: ${buyPercentage}% buys`);
          }
          // Tweet about heavy sell pressure (>70% sells)
          else if (buyRatio <= 0.3 && hoursSinceLastUpdate >= 12) {
            const sellPercentage = ((1 - buyRatio) * 100).toFixed(0);
            
            const tweetContent = `🔴 Heavy Sell Pressure!\n\n${tokenInfo.symbol} is seeing ${sellPercentage}% sell transactions out of ${trades.length} trades in the last 24h\n\nPrice: $${formatNumber(tokenInfo.price)}\nMarket Cap: $${formatLargeNumber(tokenInfo.market_cap || 0)}\n\n#Solana #${tokenInfo.symbol} #Trading #VybeWhale`;
            
            twitterClient.queueTweet(tweetContent);
            logger.info(`Queued sell pressure tweet for ${tokenInfo.symbol}: ${sellPercentage}% sells`);
          }
        }
      }
    } catch (error) {
      logger.error('Error checking token trades:', error);
    }
  }
  
  /**
   * Check for significant whale transactions
   */
  async checkWhaleTransactions() {
    if (!this.isInitialized) return;
    logger.info('Checking for whale transactions...');
    
    try {
      const popularTokens = this.config?.popularTokens || [];
      for (const tokenMint of popularTokens) {
        try {
          // Get token info using the local vybeApi
          const tokenInfo = await vybeApi.getTokenInfo(tokenMint);
          if (!tokenInfo || !tokenInfo.symbol) continue;
          
          const transfers = await whaleTransfers.getRecentWhaleTransfers(tokenMint);
          if (!transfers || !transfers.length) continue;
          
          // Filter for large and recent transfers
          const significantTransfers = transfers.filter(transfer => {
            // Only transfers larger than threshold
            if (transfer.usd_amount < config.whaleTransactionMinUsd) return false;
            
            // Check if this transfer has already been tweeted about
            const transferKey = `${transfer.signature}-${transfer.token_mint}`;
            if (this.whaleCache.has(transferKey)) return false;
            
            // Only transfers from the last 60 minutes
            const transferTime = new Date(transfer.block_time * 1000);
            const now = new Date();
            const minutesAgo = (now - transferTime) / (1000 * 60);
            
            // Cache this transfer to avoid duplicates
            this.whaleCache.set(transferKey, now);
            
            // Clean up cache (remove entries older than 24h)
            for (const [key, time] of this.whaleCache.entries()) {
              if ((now - time) > 24 * 60 * 60 * 1000) {
                this.whaleCache.delete(key);
              }
            }
            
            return minutesAgo <= 60; // Only transfers in the last hour
          });
          
          // Tweet about the most significant transfer
          if (significantTransfers.length > 0) {
            // Sort by USD amount descending
            significantTransfers.sort((a, b) => b.usd_amount - a.usd_amount);
            const transfer = significantTransfers[0];
            
            // Prepare tweet variables
            const isBuy = transfer.is_buy;
            const variables = {
              tokenSymbol: tokenInfo.symbol,
              transactionType: isBuy ? 'BUY' : 'SELL',
              amount: formatNumber(transfer.usd_amount),
              address: transfer.wallet_address.substring(0, 4) + '...' + transfer.wallet_address.substring(transfer.wallet_address.length - 4),
              action: isBuy ? 'bought' : 'sold',
              tokenAmount: formatNumber(transfer.token_amount),
              percentOfSupply: (transfer.token_amount / tokenInfo.supply * 100).toFixed(4),
              marketCap: formatLargeNumber(tokenInfo.market_cap || 0),
              priceImpact: transfer.price_impact ? `Price Impact: ${transfer.price_impact.toFixed(2)}%` : ''
            };
            
            // Create tweet content
            const tweetContent = processTemplate(config.messageTemplates.whaleTransaction, variables);
            twitterClient.queueTweet(tweetContent);
            
            logger.info(`Queued whale transaction tweet for ${tokenInfo.symbol}`);
          }
        } catch (error) {
          logger.error(`Error checking whale transactions for token ${tokenMint}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error checking whale transactions:', error);
    }
  }
  
  /**
   * Check for significant price changes
   */
  async checkPriceChanges() {
    if (!this.isInitialized) return;
    logger.info('Checking for price changes...');
    
    try {
      const popularTokens = this.config?.popularTokens || [];
      for (const tokenMint of popularTokens) {
        try {
          // Get token info using the local vybeApi
          const tokenInfo = await vybeApi.getTokenInfo(tokenMint);
          if (!tokenInfo || !tokenInfo.symbol) continue;
          
          const currentPrice = tokenInfo.price;
          if (!currentPrice) continue;
          
          // Get previous price from cache or initialize
          const previousData = this.priceCache.get(tokenMint) || { price: currentPrice, timestamp: new Date() };
          const previousPrice = previousData.price;
          
          // Calculate change percentage
          const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
          const absChangePercent = Math.abs(changePercent);
          
          // Update cache
          this.priceCache.set(tokenMint, { 
            price: currentPrice, 
            timestamp: new Date() 
          });
          
          // Tweet about significant price changes
          if (absChangePercent >= config.minSignificantChange) {
            // Calculate time difference in hours
            const hoursSinceLastUpdate = (new Date() - previousData.timestamp) / (1000 * 60 * 60);
            
            // Only tweet if it's been at least 2 hours since the last price check for this token
            if (hoursSinceLastUpdate >= 2) {
              const variables = {
                tokenSymbol: tokenInfo.symbol,
                direction: changePercent > 0 ? '📈 PRICE SURGE' : '📉 PRICE DROP',
                priceAction: changePercent > 0 ? 'surged' : 'dropped',
                changePercent: absChangePercent.toFixed(2),
                timeframe: hoursSinceLastUpdate < 24 ? `${Math.round(hoursSinceLastUpdate)} hours` : `${Math.round(hoursSinceLastUpdate/24)} days`,
                price: formatNumber(currentPrice),
                marketCap: formatLargeNumber(tokenInfo.market_cap || 0)
              };
              
              const tweetContent = processTemplate(config.messageTemplates.priceChange, variables);
              twitterClient.queueTweet(tweetContent);
              
              logger.info(`Queued price change tweet for ${tokenInfo.symbol}: ${changePercent.toFixed(2)}%`);
            }
          }
        } catch (error) {
          logger.error(`Error checking price changes for token ${tokenMint}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error checking price changes:', error);
    }
  }
  
  /**
   * Check for significant holder count changes
   */
  async checkHolderChanges() {
    if (!this.isInitialized) return;
    logger.info('Checking for holder changes...');
    
    try {
      // Check all tracked tokens (popular + hot)
      const tokensToCheck = [...new Set([...this.config.popularTokens, ...this.hotTokens])];
      
      for (const tokenAddress of tokensToCheck) {
        // Get token info
        const tokenInfo = await vybeApi.getTokenInfo(tokenAddress);
        if (!tokenInfo || !tokenInfo.symbol) continue;
        
        try {
          // Get holder trend data
          const holderTrendData = await tokenHolders.getHoldersTrend(tokenAddress, 30);
          if (!holderTrendData || !holderTrendData.current) continue;
          
          const currentHolders = holderTrendData.current;
          
          // Get previous holder count from cache or initialize
          const previousData = this.holderCache.get(tokenAddress) || { 
            holders: currentHolders, 
            timestamp: new Date(),
            trend7d: holderTrendData.trend7d || 0
          };
          
          // Calculate hours since last update
          const hoursSinceLastUpdate = (new Date() - previousData.timestamp) / (1000 * 60 * 60);
          
          // Skip if we just tweeted about this recently
          if (hoursSinceLastUpdate < 24) continue;
          
          // Update cache with new data
          this.holderCache.set(tokenAddress, {
            holders: currentHolders,
            timestamp: new Date(),
            trend7d: holderTrendData.trend7d || 0
          });
          
          // Check 7-day holder trend
          if (holderTrendData.trend7d !== null) {
            const trendChange = holderTrendData.trend7d - previousData.trend7d;
            
            // Tweet about accelerating holder growth (trend improving by at least 5%)
            if (holderTrendData.trend7d > 5 && trendChange >= 5 && hoursSinceLastUpdate >= 24) {
              const tweetContent = `👥 Holder Growth Accelerating!\n\n${tokenInfo.symbol} holders increased by ${holderTrendData.trend7d.toFixed(1)}% in the last 7 days\n\nCurrent Holders: ${formatNumber(currentHolders)}\nPrice: $${formatNumber(tokenInfo.price)}\n\nThis token is gaining adoption fast! 🚀\n\n#Solana #${tokenInfo.symbol} #Crypto`;
              
              twitterClient.queueTweet(tweetContent);
              logger.info(`Queued accelerating holder growth tweet for ${tokenInfo.symbol}`);
            }
            // Tweet about significant holder loss (>10% decline)
            else if (holderTrendData.trend7d < -10 && hoursSinceLastUpdate >= 24) {
              const tweetContent = `👥 Significant Holder Decline!\n\n${tokenInfo.symbol} has lost ${Math.abs(holderTrendData.trend7d).toFixed(1)}% of holders in the last 7 days\n\nCurrent Holders: ${formatNumber(currentHolders)}\nPrice: $${formatNumber(tokenInfo.price)}\n\n#Solana #${tokenInfo.symbol} #Crypto`;
              
              twitterClient.queueTweet(tweetContent);
              logger.info(`Queued holder decline tweet for ${tokenInfo.symbol}`);
            }
          }
          
          // Get holder time series data if available
          if (holderTrendData.rawData && holderTrendData.rawData.length >= 7) {
            const data = holderTrendData.rawData;
            
            // Check for consistent daily growth pattern (7+ days)
            let consecutiveGrowthDays = 0;
            for (let i = 1; i < data.length; i++) {
              if (data[i].holderCount > data[i-1].holderCount) {
                consecutiveGrowthDays++;
              } else {
                consecutiveGrowthDays = 0;
              }
            }
            
            // Tweet about consistent daily holder growth (7+ days)
            if (consecutiveGrowthDays >= 7 && hoursSinceLastUpdate >= 48) {
              const growthPercent = ((data[data.length-1].holderCount - data[data.length-8].holderCount) / data[data.length-8].holderCount * 100).toFixed(1);
              
              const tweetContent = `📊 Consistent Holder Growth!\n\n${tokenInfo.symbol} has gained holders for ${consecutiveGrowthDays} consecutive days\n\nTotal Growth: ${growthPercent}%\nCurrent Holders: ${formatNumber(currentHolders)}\n\nStrong community building! 💪\n\n#Solana #${tokenInfo.symbol} #Crypto`;
              
              twitterClient.queueTweet(tweetContent);
              logger.info(`Queued consistent holder growth tweet for ${tokenInfo.symbol}`);
            }
          }
        } catch (holderError) {
          logger.error(`Error fetching holder data for ${tokenAddress}:`, holderError);
        }
      }
    } catch (error) {
      logger.error('Error checking holder changes:', error);
    }
  }
  
  /**
   * Get the status of the Twitter bot
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      monitoring: this.monitoringIntervals.length > 0,
      twitterClient: twitterClient.getStatus(),
      caches: {
        whaleCache: this.whaleCache.size,
        priceCache: this.priceCache.size,
        holderCache: this.holderCache.size,
        tradeCache: this.tradeCache.size,
      },
      hotTokens: Array.from(this.hotTokens)
    };
  }
}

// Create and export a singleton instance
const twitterBot = new TwitterBot();
module.exports = twitterBot; 