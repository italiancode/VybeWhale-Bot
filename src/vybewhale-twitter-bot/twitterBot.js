/**
 * VybeWhale Twitter Bot - Simplified Price Monitor
 * 
 * Simplified version focused only on price monitoring and tweets
 */

const config = require('./config');
const twitterClient = require('./twitterClient');
const logger = require('../utils/logger');
const { formatNumber, formatLargeNumber } = require('../utils/formatter');

// Import local vybeApi service
const vybeApi = require('../services/vybeApi');

class TwitterBot {
  constructor() {
    this.config = config;
    this.priceCache = new Map(); // Cache for token prices to detect changes
    this.isInitialized = false;
    this.monitoringIntervals = [];
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
    
    // Start price monitoring
    this.startPriceMonitoring();
    
    return true;
  }
  
  /**
   * Send a startup tweet when the bot initializes
   */
  sendStartupTweet() {
    const startupMessage = `🚀 VybeWhale Price Bot is now online and tracking Solana tokens.\n\nMonitoring price movements 24/7.\n\n#Solana #Crypto #VybeWhale`;
    twitterClient.queueTweet(startupMessage);
  }
  
  /**
   * Start price monitoring of the Solana ecosystem
   */
  startPriceMonitoring() {
    // Clear any existing intervals
    this.stopMonitoring();
    
    // Monitor price changes (every 30 minutes)
    const priceInterval = setInterval(() => this.checkPriceChanges(), 30 * 60 * 1000);
    this.monitoringIntervals.push(priceInterval);
    
    // Run initial price check after a brief delay
    setTimeout(() => {
      this.checkPriceChanges();
    }, 10000);
    
    logger.info('Twitter bot price monitoring started');
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
   * Manually queue a tweet about a token price
   */
  async tweetTokenPrice(tokenAddress) {
    if (!this.isInitialized) {
      logger.warn('Cannot tweet token price: Twitter bot not initialized');
      return false;
    }
    
    try {
      const tokenInfo = await vybeApi.getTokenInfo(tokenAddress);
      if (!tokenInfo || !tokenInfo.symbol) {
        logger.error(`Cannot tweet price: Invalid token info for ${tokenAddress}`);
        return false;
      }
      
      const tweetText = `🔔 $${tokenInfo.symbol} Price Update\n\nCurrent price: $${formatNumber(tokenInfo.price)}\nMarket Cap: $${formatLargeNumber(tokenInfo.market_cap || 0)}\n\n#Solana #${tokenInfo.symbol}`;
      
      twitterClient.queueTweet(tweetText);
      logger.info(`Queued price tweet for ${tokenInfo.symbol}`);
      return true;
    } catch (error) {
      logger.error(`Error tweeting token price: ${error.message}`);
      return false;
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
              const direction = changePercent > 0 ? '📈 PRICE SURGE' : '📉 PRICE DROP';
              const priceAction = changePercent > 0 ? 'surged' : 'dropped';
              const timeframe = hoursSinceLastUpdate < 24 
                ? `${Math.round(hoursSinceLastUpdate)} hours` 
                : `${Math.round(hoursSinceLastUpdate/24)} days`;
                
              const tweetContent = `${direction}!\n\n$${tokenInfo.symbol} has ${priceAction} ${absChangePercent.toFixed(2)}% in the last ${timeframe}\n\nCurrent Price: $${formatNumber(currentPrice)}\nMarket Cap: $${formatLargeNumber(tokenInfo.market_cap || 0)}\n\n#Solana #${tokenInfo.symbol}`;
              
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
   * Get the status of the Twitter bot
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      monitoring: this.monitoringIntervals.length > 0,
      twitterClient: twitterClient.getStatus(),
      priceCache: this.priceCache.size,
    };
  }
  
  /**
   * Queue a tweet
   */
  queueTweet(text) {
    if (!this.isInitialized) {
      logger.warn('Cannot queue tweet: Twitter bot not initialized');
      return false;
    }
    
    return twitterClient.queueTweet(text);
  }
}

// Create and export a singleton instance
const twitterBot = new TwitterBot();
module.exports = twitterBot; 
module.exports = twitterBot; 