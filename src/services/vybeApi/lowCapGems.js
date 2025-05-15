const vybeApi = require("@api/vybe-api");
const logger = require("../../utils/logger");
const { getHoldersTrend } = require("./tokenHolders");
const { getWalletTokens } = require("./walletTokens");

// Initialize the API with your key
vybeApi.auth(process.env.VYBE_API_KEY);

// Market cap threshold for "low cap" definition (in USD)
const LOW_CAP_THRESHOLD = 10000000; // $10M

// Cache token market data to reduce API calls
const tokenMarketCache = new Map();
const tokenCacheTTL = 15 * 60 * 1000; // 15 minutes cache

// Direct reference to formatLowCapGemsMessage from commands/lowCapGems.js
const lowCapGemsModule = require('../../commands/lowCapGems');

/**
 * Fetch token data including market cap information
 * with caching to improve performance
 * @param {string} mintAddress - Token mint address
 * @returns {Promise<Object>} Token data with market cap info
 */
async function getTokenMarketData(mintAddress) {
  try {
    // Check cache first
    const now = Date.now();
    if (tokenMarketCache.has(mintAddress)) {
      const cachedData = tokenMarketCache.get(mintAddress);
      if (now - cachedData.timestamp < tokenCacheTTL) {
        return cachedData.data;
      }
    }
    
    logger.info(`Fetching token market data for ${mintAddress}`);
    
    // Use get_token_details which includes price history (price1d, price7d)
    const response = await vybeApi.get_token_details({
      mintAddress: mintAddress
    });
    
    if (!response || !response.data) {
      logger.warn(`No market data returned for token ${mintAddress}`);
      return null;
    }
    
    // Log price data for debugging
    const data = response.data;
    if (data.price && data.price1d) {
      logger.info(`Token ${mintAddress} prices: current=${data.price}, 1d=${data.price1d}, 7d=${data.price7d || 'N/A'}`);
    }
    
    // Cache the result
    tokenMarketCache.set(mintAddress, {
      data: response.data,
      timestamp: now
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Error fetching token market data for ${mintAddress}:`, error);
    return null;
  }
}

// Cache for whale activity data
const whaleActivityCache = new Map();
const whaleActivityTTL = 30 * 60 * 1000; // 30 minutes

/**
 * Calculate whale activity for a token with caching
 * @param {string} mintAddress - Token mint address
 * @returns {Promise<number>} Percentage change in whale holdings over 24h
 */
async function getWhaleActivity(mintAddress) {
  try {
    // Check cache first
    const now = Date.now();
    if (whaleActivityCache.has(mintAddress)) {
      const cachedData = whaleActivityCache.get(mintAddress);
      if (now - cachedData.timestamp < whaleActivityTTL) {
        return cachedData.value;
      }
    }
    
    logger.info(`Calculating whale activity for ${mintAddress}`);
    
    // Get top holders data with snapshots
    const response = await vybeApi.get_top_holders({
      mintAddress: mintAddress,
      limit: 10,
      includeSnapshots: true
    });
    
    if (!response || !response.data || !response.data.data) {
      return 0;
    }
    
    const data = response.data.data;
    
    // Calculate change in top holder percentages over 24h
    let currentTotal = 0;
    let previousTotal = 0;
    
    for (const holder of data) {
      if (holder.isExchange) {
        continue; // Exclude exchanges from whale calculations
      }
      
      currentTotal += parseFloat(holder.percentage || 0);
      
      if (holder.snapshots && holder.snapshots.day) {
        previousTotal += parseFloat(holder.snapshots.day.percentage || 0);
      }
    }
    
    if (previousTotal === 0) {
      return 0;
    }
    
    // Calculate percentage change
    const changePercent = ((currentTotal - previousTotal) / previousTotal) * 100;
    
    // Cache the result
    whaleActivityCache.set(mintAddress, {
      value: changePercent,
      timestamp: now
    });
    
    return changePercent;
  } catch (error) {
    logger.error(`Error calculating whale activity for ${mintAddress}:`, error);
    return 0;
  }
}

/**
 * Calculate token analysis in parallel for improved performance
 * @param {Array} tokens - Array of token data objects
 * @returns {Promise<Array>} Array of analyzed tokens
 */
async function analyzeTokensInParallel(tokens) {
  try {
    // Filter out tokens with very low USD value first
    const validTokens = tokens.filter(token => parseFloat(token.valueUsd) >= 10);
    
    // Prepare analysis tasks
    const analysisPromises = validTokens.map(async (token) => {
      try {
        // Get market data for the token
        const marketData = await getTokenMarketData(token.mintAddress);
        
        if (!marketData) {
          return null;
        }
        
        const marketCap = parseFloat(marketData.mcap || marketData.marketCap || 0);
        
        // Check if it's a low cap token
        if (marketCap > 0 && marketCap < LOW_CAP_THRESHOLD) {
          // For performance, run these in parallel
          const [whaleActivity, holdersTrend] = await Promise.all([
            getWhaleActivity(token.mintAddress),
            getHoldersTrend(token.mintAddress, 7)
          ]);
          
          // Calculate price changes using the market data we already have
          let priceChange24h = 0;
          let priceChange7d = 0;
          
          // If we have price1d and price7d in the market data, calculate the percent changes
          if (marketData.price && marketData.price1d && marketData.price1d > 0) {
            priceChange24h = ((marketData.price - marketData.price1d) / marketData.price1d) * 100;
          }
          
          if (marketData.price && marketData.price7d && marketData.price7d > 0) {
            priceChange7d = ((marketData.price - marketData.price7d) / marketData.price7d) * 100;
          }
          
          // Debug log for price change data
          logger.info(`Token ${token.symbol || token.mintAddress} price changes: 24h=${priceChange24h.toFixed(2)}%, 7d=${priceChange7d.toFixed(2)}%`);
          
          // Look for pump and dump patterns
          // A typical P&D has large price increase followed by decrease
          const hadPump = priceChange7d > 50; // 50%+ gain at some point in the week
          const hasLargeVolatility = Math.abs(priceChange24h) > 20; // 20%+ change in 24h
          
          return {
            symbol: token.symbol || 'Unknown',
            name: token.name || 'Unknown Token',
            mintAddress: token.mintAddress,
            marketCap: marketCap,
            price: parseFloat(token.priceUsd || 0),
            balance: parseFloat(token.amount || 0),
            value: parseFloat(token.valueUsd || 0),
            whaleActivity: whaleActivity,
            holdersTrend: holdersTrend.trend7d || 0,
            holderCount: holdersTrend.current || 0,
            verified: !!token.verified,
            priceChange24h,
            priceChange7d,
            hadPump,
            hasLargeVolatility
          };
        }
        
        return null;
      } catch (error) {
        logger.error(`Error analyzing token ${token.mintAddress}:`, error);
        return null;
      }
    });
    
    // Run all analyses in parallel and filter out nulls
    const results = await Promise.all(analysisPromises);
    return results.filter(result => result !== null);
  } catch (error) {
    logger.error('Error in parallel token analysis:', error);
    return [];
  }
}

/**
 * Process wallet tokens with improved speed and progress notifications
 * @param {string} walletAddress - Wallet address to analyze
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Array>} Array of low cap tokens with analysis
 */
async function findLowCapGems(walletAddress, progressCallback = null) {
  try {
    logger.info(`Finding low cap gems in wallet ${walletAddress}`);
    
    // Get all tokens in wallet
    const walletTokens = await getWalletTokens(walletAddress, {
      sortByDesc: 'valueUsd',
      limit: 50 // Check more tokens to find potential gems
    });
    
    if (!walletTokens || !walletTokens.data || !Array.isArray(walletTokens.data)) {
      logger.warn(`No tokens found in wallet ${walletAddress}`);
      return [];
    }
    
    if (progressCallback) {
      progressCallback({ status: 'analyzing', tokensFound: walletTokens.data.length });
    }
    
    // Analyze tokens in parallel for better performance
    const lowCapGems = await analyzeTokensInParallel(walletTokens.data);
    
    // Sort by value (highest first)
    return lowCapGems.sort((a, b) => b.value - a.value);
  } catch (error) {
    logger.error(`Error finding low cap gems for wallet ${walletAddress}:`, error);
    return [];
  }
}

/**
 * Detect new low cap gems in a wallet since the last scan
 * @param {string} walletAddress - Wallet address to analyze
 * @param {Array} previousGems - Previously found gems for comparison
 * @returns {Promise<Array>} Array of newly found low cap gems with analysis
 */
async function detectNewLowCapGems(walletAddress, previousGems = []) {
  try {
    logger.info(`Detecting new low cap gems in wallet ${walletAddress}`);
    
    // If no previous data, return empty array (no new gems to report)
    if (!Array.isArray(previousGems)) {
      logger.warn(`Invalid previousGems parameter, expected array but got ${typeof previousGems}`);
      previousGems = [];
    }
    
    // Get current low cap gems
    const currentGems = await findLowCapGems(walletAddress);
    
    // If no previous data, return empty array (no new gems to report)
    if (previousGems.length === 0) {
      return [];
    }
    
    // Create a set of previously detected gem mint addresses
    const previousMints = new Set(previousGems.map(gem => gem.mintAddress));
    
    // Find gems that weren't in the previous detection
    const newGems = currentGems.filter(gem => !previousMints.has(gem.mintAddress));
    
    if (newGems.length > 0) {
      logger.info(`Found ${newGems.length} new low cap gems in wallet ${walletAddress}`);
      
      // For each new gem, prepare alert messages
      newGems.forEach(gem => {
        // Pre-generate the message format to ensure we can send it properly
        gem.alertMessage = lowCapGemsModule.formatNewGemAlertMessage(walletAddress, gem);
      });
    }
    
    return newGems;
  } catch (error) {
    logger.error(`Error detecting new low cap gems for wallet ${walletAddress}:`, error);
    return [];
  }
}

// Clear caches periodically
setInterval(() => {
  const now = Date.now();
  
  // Clear expired token cache entries
  for (const [mintAddress, data] of tokenMarketCache.entries()) {
    if (now - data.timestamp > tokenCacheTTL) {
      tokenMarketCache.delete(mintAddress);
    }
  }
  
  // Clear expired whale activity cache entries
  for (const [mintAddress, data] of whaleActivityCache.entries()) {
    if (now - data.timestamp > whaleActivityTTL) {
      whaleActivityCache.delete(mintAddress);
    }
  }
}, 15 * 60 * 1000); // Run every 15 minutes

module.exports = {
  findLowCapGems,
  detectNewLowCapGems,
  LOW_CAP_THRESHOLD
}; 