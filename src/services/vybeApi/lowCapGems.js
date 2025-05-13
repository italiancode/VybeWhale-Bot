const vybeApi = require("@api/vybe-api");
const logger = require("../../utils/logger");
const { getHoldersTrend } = require("./tokenHolders");
const { getWalletTokens } = require("./walletTokens");

// Initialize the API with your key
vybeApi.auth(process.env.VYBE_API_KEY);

// Market cap threshold for "low cap" definition (in USD)
const LOW_CAP_THRESHOLD = 10000000; // $10M

/**
 * Fetch token data including market cap information
 * @param {string} mintAddress - Token mint address
 * @returns {Promise<Object>} Token data with market cap info
 */
async function getTokenMarketData(mintAddress) {
  try {
    logger.info(`Fetching token market data for ${mintAddress}`);
    
    // Use get_token_details which is the correct API method
    const response = await vybeApi.get_token_details({
      mintAddress: mintAddress,
      includeHolderCount: true
    });
    
    if (!response || !response.data) {
      logger.warn(`No market data returned for token ${mintAddress}`);
      return null;
    }
    
    return response.data;
  } catch (error) {
    logger.error(`Error fetching token market data for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Calculate whale activity for a token
 * @param {string} mintAddress - Token mint address
 * @returns {Promise<number>} Percentage change in whale holdings over 24h
 */
async function getWhaleActivity(mintAddress) {
  try {
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
    return changePercent;
  } catch (error) {
    logger.error(`Error calculating whale activity for ${mintAddress}:`, error);
    return 0;
  }
}

/**
 * Find low cap gems in a wallet
 * @param {string} walletAddress - Wallet address to analyze
 * @returns {Promise<Array>} Array of low cap tokens with analysis
 */
async function findLowCapGems(walletAddress) {
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
    
    const lowCapGems = [];
    
    // Process each token to check if it's a low cap gem
    for (const token of walletTokens.data) {
      // Skip tokens with very low USD value (likely dust)
      if (parseFloat(token.valueUsd) < 10) {
        continue;
      }
      
      // Get market data for the token
      const marketData = await getTokenMarketData(token.mintAddress);
      
      if (!marketData) {
        continue;
      }
      
      const marketCap = parseFloat(marketData.mcap || marketData.marketCap || 0);
      
      // Check if it's a low cap token
      if (marketCap > 0 && marketCap < LOW_CAP_THRESHOLD) {
        // Get additional data for analysis
        const whaleActivity = await getWhaleActivity(token.mintAddress);
        const holdersTrend = await getHoldersTrend(token.mintAddress, 7);
        
        lowCapGems.push({
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
          verified: !!token.verified
        });
      }
    }
    
    // Sort by value (highest first)
    return lowCapGems.sort((a, b) => b.value - a.value);
  } catch (error) {
    logger.error(`Error finding low cap gems for wallet ${walletAddress}:`, error);
    return [];
  }
}

/**
 * Detect newly acquired low cap gems by comparing current and previous wallet contents
 * @param {string} walletAddress - Wallet address to analyze
 * @param {Array} previousGems - Previously detected gems
 * @returns {Promise<Array>} Array of newly acquired low cap gems
 */
async function detectNewLowCapGems(walletAddress, previousGems = []) {
  try {
    logger.info(`Detecting new low cap gems in wallet ${walletAddress}`);
    
    // Get current low cap gems
    const currentGems = await findLowCapGems(walletAddress);
    
    // If no previous data, return empty array (no new gems to report)
    if (!Array.isArray(previousGems) || previousGems.length === 0) {
      return [];
    }
    
    // Create a set of previously detected gem mint addresses
    const previousMints = new Set(previousGems.map(gem => gem.mintAddress));
    
    // Find gems that weren't in the previous detection
    const newGems = currentGems.filter(gem => !previousMints.has(gem.mintAddress));
    
    return newGems;
  } catch (error) {
    logger.error(`Error detecting new low cap gems for wallet ${walletAddress}:`, error);
    return [];
  }
}

module.exports = {
  findLowCapGems,
  detectNewLowCapGems,
  LOW_CAP_THRESHOLD
}; 