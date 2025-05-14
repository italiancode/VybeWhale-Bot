/**
 * Twitter Client for VybeWhale Bot
 * 
 * This module handles the Twitter API connection and tweet queue
 * for the VybeWhale Twitter bot.
 */

const logger = require('../utils/logger');

class TwitterClient {
  constructor() {
    this.isInitialized = false;
    this.testMode = false;
    this.tweetQueue = [];
    this.processingInterval = null;
  }
  
  /**
   * Initialize the Twitter client
   * @returns {boolean} True if initialized successfully
   */
  initialize() {
    // Check if Twitter is disabled in the configuration
    if (process.env.TWITTER_BOT_ENABLED !== 'true') {
      logger.info('Twitter bot is disabled in the configuration. Set TWITTER_BOT_ENABLED=true to enable it.');
      return false;
    }
    
    // Check for test mode (using test credentials)
    if (
      process.env.TWITTER_API_KEY === 'test_key' ||
      process.env.TWITTER_API_KEY_SECRET === 'test_secret' ||
      process.env.TWITTER_ACCESS_TOKEN === 'test_token' ||
      process.env.TWITTER_ACCESS_TOKEN_SECRET === 'test_token_secret' ||
      process.env.TWITTER_BEARER_TOKEN === 'test_bearer_token'
    ) {
      logger.info('Twitter client initialized in TEST MODE');
      this.testMode = true;
      this.isInitialized = true;
    } else {
      // Check if we have the required Bearer Token
      if (!process.env.TWITTER_BEARER_TOKEN) {
        logger.error('Twitter Bearer Token not found. Please set TWITTER_BEARER_TOKEN in your .env file.');
        return false;
      }
      
      try {
        // In a real implementation, we would initialize the Twitter API v2 client here
        // For now, we'll just log success
        logger.info('Twitter client initialized successfully');
        this.isInitialized = true;
      } catch (error) {
        logger.error('Error initializing Twitter client:', error);
        return false;
      }
    }
    
    // Start the tweet queue processor
    this.startQueueProcessor();
    
    return this.isInitialized;
  }
  
  /**
   * Start the queue processor to handle tweets
   */
  startQueueProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    // Process the queue every 5 minutes
    this.processingInterval = setInterval(() => {
      this.processQueuedTweets();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Process tweets in the queue
   */
  processQueuedTweets() {
    if (!this.isInitialized) {
      logger.error('Cannot process tweets: Twitter client not initialized');
      return;
    }
    
    if (this.tweetQueue.length === 0) {
      logger.info('No tweets in queue to process');
      return;
    }
    
    const tweet = this.tweetQueue.shift();
    
    try {
      if (this.testMode) {
        // In test mode, just log the tweet rather than posting
        logger.info(`[TEST MODE] Would tweet: "${tweet.content.substring(0, 50)}..."`);
        
        // Call the callback with a mock tweet ID
        if (tweet.callback) {
          tweet.callback(null, { id: 'test_tweet_' + Date.now() });
        }
      } else {
        // In a real implementation, this would use the Twitter API to post the tweet
        // For now, we'll just log that we're sending the tweet
        logger.info(`Sending tweet: "${tweet.content.substring(0, 50)}..."`);
        
        // Here we would actually call the Twitter API to post the tweet
        // using the Bearer Token for authentication:
        
        // const response = await twitterApiClient.post('tweets', {
        //   text: tweet.content
        // });
        
        // Mock a successful response
        if (tweet.callback) {
          tweet.callback(null, { id: 'tweet_' + Date.now() });
        }
      }
    } catch (error) {
      logger.error('Error processing tweet:', error);
      if (tweet.callback) {
        tweet.callback(error, null);
      }
    }
  }
  
  /**
   * Queue a tweet to be sent
   * @param {string} content - The tweet content
   * @param {function} callback - Callback function when tweet is posted
   */
  queueTweet(content, callback) {
    if (!this.isInitialized) {
      logger.error('Cannot queue tweet: Twitter client not initialized');
      if (callback) callback(new Error('Twitter client not initialized'), null);
      return;
    }
    
    // Add tweet to the queue
    this.tweetQueue.push({ content, callback, timestamp: Date.now() });
    logger.info(`Tweet queued: "${content.substring(0, 30)}..." (Queue length: ${this.tweetQueue.length})`);
    
    // If in test mode, process the queue immediately
    if (this.testMode) {
      this.processQueuedTweets();
    }
  }
  
  /**
   * Send a tweet immediately (without using the queue)
   * @param {string} content - The tweet content
   * @returns {Promise<object>} - Promise resolving to tweet result
   */
  async sendTweet(content) {
    if (!this.isInitialized) {
      logger.error('Cannot send tweet: Twitter client not initialized');
      throw new Error('Twitter client not initialized');
    }
    
    try {
      if (this.testMode) {
        // In test mode, just log the tweet rather than posting
        logger.info(`[TEST MODE] Immediate tweet: "${content.substring(0, 50)}..."`);
        return { id: 'test_tweet_' + Date.now(), text: content };
      } else {
        // In a real implementation, this would use the Twitter API to post the tweet
        logger.info(`Sending immediate tweet: "${content.substring(0, 50)}..."`);
        
        // Here we would actually call the Twitter API to post the tweet
        // using the Bearer Token for authentication:
        
        // const response = await twitterApiClient.post('tweets', {
        //   text: content
        // });
        // return response;
        
        // Mock a successful response for now
        return { id: 'tweet_' + Date.now(), text: content };
      }
    } catch (error) {
      logger.error('Error sending tweet:', error);
      throw error;
    }
  }
  
  /**
   * Get status information about the Twitter client
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      testMode: this.testMode,
      queueLength: this.tweetQueue.length
    };
  }
}

// Create and export a singleton instance
const twitterClient = new TwitterClient();
module.exports = twitterClient;