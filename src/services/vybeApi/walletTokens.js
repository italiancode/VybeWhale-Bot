const vybeApi = require("@api/vybe-api");
const logger = require("../../utils/logger");

// Initialize the API with your key
vybeApi.auth(process.env.VYBE_API_KEY);

/**
 * Fetches token balances for a given wallet address
 * 
 * @param {string} walletAddress - The wallet address to check
 * @param {Object} options - Additional options for filtering results
 * @param {boolean} options.onlyVerified - Only include verified tokens
 * @param {number} options.limit - Maximum number of tokens to return
 * @param {string} options.sortByDesc - Sort by this field in descending order (e.g., 'valueUsd')
 * @returns {Promise<Object>} - Wallet token balance data
 */
async function getWalletTokens(walletAddress, options = {}) {
  try {
    if (!walletAddress) {
      logger.error("No wallet address provided for token balances");
      return { totalTokenValueUsd: 0, totalTokenCount: 0, data: [] };
    }

    const params = {
      ownerAddress: walletAddress,
      ...options
    };

    // If no sort order is specified, sort by value
    if (!options.sortByAsc && !options.sortByDesc) {
      params.sortByDesc = 'valueUsd';
    }

    logger.info(`Fetching token balances for wallet: ${walletAddress}`);
    
    const response = await vybeApi.get_wallet_tokens(params);
    
    if (!response || !response.data) {
      logger.warn(`No token balance data returned for wallet ${walletAddress}`);
      return { totalTokenValueUsd: 0, totalTokenCount: 0, data: [] };
    }
    
    return response.data;
  } catch (error) {
    logger.error(`Error fetching token balances for wallet ${walletAddress}:`, error);
    return { totalTokenValueUsd: 0, totalTokenCount: 0, data: [] };
  }
}

/**
 * Process wallet token balance data into a simplified format
 * 
 * @param {Object} balanceData - Raw balance data from API
 * @returns {Object} - Simplified balance data
 */
function processWalletTokenBalance(balanceData) {
  try {
    if (!balanceData || !balanceData.data) {
      return { totalValue: 0, tokens: [] };
    }
    
    const totalValue = parseFloat(balanceData.totalTokenValueUsd || 0);
    
    const tokens = balanceData.data.map(token => ({
      symbol: token.symbol || 'Unknown',
      name: token.name || 'Unknown Token',
      mintAddress: token.mintAddress,
      amount: parseFloat(token.amount || 0),
      value: parseFloat(token.valueUsd || 0),
      priceUsd: parseFloat(token.priceUsd || 0),
      priceChange1d: parseFloat(token.priceUsd1dChange || 0),
      valueChange1d: parseFloat(token.valueUsd1dChange || 0),
      verified: !!token.verified,
      logoUrl: token.logoUrl || null
    }));
    
    return {
      totalValue,
      tokens
    };
  } catch (error) {
    logger.error("Error processing wallet token balance:", error);
    return { totalValue: 0, tokens: [] };
  }
}

/**
 * Fetches historical token balance data for a wallet over time
 * 
 * @param {string} walletAddress - The wallet address to check
 * @param {number} days - Number of days of historical data to retrieve (1-30)
 * @returns {Promise<Object>} - Time-series wallet token balance data
 */
async function getWalletTokensTimeSeries(walletAddress, days = 14) {
  try {
    if (!walletAddress) {
      logger.error("No wallet address provided for token balances time series");
      return { data: [] };
    }

    // Validate days parameter
    const daysParam = Math.min(Math.max(1, days), 30); // Ensure days is between 1 and 30
    
    const params = {
      ownerAddress: walletAddress,
      days: daysParam
    };

    logger.info(`Fetching token balance time series for wallet: ${walletAddress} (${daysParam} days)`);
    
    const response = await vybeApi.get_wallet_tokens_ts(params);
    
    if (!response || !response.data) {
      logger.warn(`No time series data returned for wallet ${walletAddress}`);
      return { data: [] };
    }
    
    return response.data;
  } catch (error) {
    logger.error(`Error fetching token balance time series for wallet ${walletAddress}:`, error);
    return { data: [] };
  }
}

/**
 * Process time series data into a format suitable for charts and analysis
 * 
 * @param {Object} timeSeriesData - Raw time series data from API
 * @returns {Object} - Processed time series data with calculated metrics
 */
function processTimeSeriesData(timeSeriesData) {
  try {
    if (!timeSeriesData || !timeSeriesData.data || !Array.isArray(timeSeriesData.data)) {
      return {
        dailyValues: [],
        change: { absolute: 0, percentage: 0 },
        highestValue: 0,
        lowestValue: 0
      };
    }
    
    // Sort by blockTime to ensure chronological order
    const sortedData = [...timeSeriesData.data].sort((a, b) => a.blockTime - b.blockTime);
    
    // Format data for easier consumption
    const dailyValues = sortedData.map(day => {
      // Convert blockTime to date
      const date = new Date(day.blockTime * 1000);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const tokenValue = parseFloat(day.tokenValue || 0);
      const stakeValue = parseFloat(day.stakeValue || 0);
      const systemValue = parseFloat(day.systemValue || 0);
      
      // Total value is the sum of token, stake, and system values
      const totalValue = tokenValue + stakeValue + systemValue;
      
      return {
        date: formattedDate,
        timestamp: day.blockTime,
        totalValue,
        tokenValue,
        stakeValue,
        systemValue
      };
    });
    
    // Calculate metrics
    const valuesOnly = dailyValues.map(day => day.totalValue);
    const firstValue = valuesOnly[0] || 0;
    const lastValue = valuesOnly[valuesOnly.length - 1] || 0;
    const absoluteChange = lastValue - firstValue;
    const percentageChange = firstValue > 0 
      ? (absoluteChange / firstValue) * 100 
      : 0;
    const highestValue = Math.max(...valuesOnly);
    const lowestValue = Math.min(...valuesOnly);
    
    return {
      dailyValues,
      change: {
        absolute: absoluteChange,
        percentage: percentageChange
      },
      highestValue,
      lowestValue,
      startValue: firstValue,
      endValue: lastValue
    };
  } catch (error) {
    logger.error("Error processing time series data:", error);
    return {
      dailyValues: [],
      change: { absolute: 0, percentage: 0 },
      highestValue: 0,
      lowestValue: 0
    };
  }
}

/**
 * Get portfolio performance metrics for a wallet
 * 
 * @param {string} walletAddress - The wallet address to analyze
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} - Portfolio performance metrics
 */
async function getWalletPerformance(walletAddress, days = 14) {
  try {
    // Get time series data
    const timeSeriesData = await getWalletTokensTimeSeries(walletAddress, days);
    
    // Process the data
    const performanceData = processTimeSeriesData(timeSeriesData);
    
    // Get current token holdings for additional context
    const currentBalanceData = await getWalletTokens(walletAddress);
    const currentBalance = processWalletTokenBalance(currentBalanceData);
    
    // Combine the data
    return {
      address: walletAddress,
      currentValue: currentBalance.totalValue,
      topHoldings: currentBalance.tokens.slice(0, 5),
      performance: performanceData,
      period: `${days} days`
    };
  } catch (error) {
    logger.error(`Error analyzing wallet performance for ${walletAddress}:`, error);
    return {
      address: walletAddress,
      currentValue: 0,
      topHoldings: [],
      performance: {
        dailyValues: [],
        change: { absolute: 0, percentage: 0 },
        highestValue: 0,
        lowestValue: 0
      },
      period: `${days} days`
    };
  }
}

module.exports = {
  getWalletTokens,
  processWalletTokenBalance,
  getWalletTokensTimeSeries,
  processTimeSeriesData,
  getWalletPerformance
}; 