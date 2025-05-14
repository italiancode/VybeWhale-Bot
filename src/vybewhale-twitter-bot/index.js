/**
 * VybeWhale Twitter Bot
 * 
 * An autonomous Twitter bot that monitors Solana tokens and automatically tweets about:
 * - Significant token trades and volume spikes
 * - Whale transactions and accumulation patterns
 * - Holder trend changes and community growth
 * - Price movements and market signals
 * 
 * No manual commands needed - the bot runs in the background and publishes
 * real-time market insights to grow the Twitter audience.
 */

const config = require('./config');
const twitterBot = require('./twitterBot');
const logger = require('../utils/logger');

/**
 * Initialize the Twitter bot
 * @returns {Boolean} - Whether initialization was successful
 */
async function initializeTwitterBot() {
  try {
    logger.info('Initializing VybeWhale Twitter Bot...');
    
    // Check if the Twitter bot is enabled in config
    if (!config.twitterEnabled) {
      logger.info('Twitter bot is disabled in configuration. Set TWITTER_BOT_ENABLED=true to enable.');
      return false;
    }
    
    // Initialize the Twitter client and bot
    const initialized = await twitterBot.initialize();
    
    if (!initialized) {
      logger.error('Failed to initialize Twitter bot');
      return false;
    }
    
    logger.info('VybeWhale Twitter Bot initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing Twitter bot:', error);
    return false;
  }
}

/**
 * Shutdown the Twitter bot
 */
function shutdownTwitterBot() {
  try {
    // Stop monitoring
    if (twitterBot.isInitialized) {
      twitterBot.stopMonitoring();
    }
    
    logger.info('Twitter bot shutdown complete');
    return true;
  } catch (error) {
    logger.error('Error shutting down Twitter bot:', error);
    return false;
  }
}

// Export functions and components
module.exports = {
  initializeTwitterBot,
  shutdownTwitterBot,
  config,
  twitterBot
}; 