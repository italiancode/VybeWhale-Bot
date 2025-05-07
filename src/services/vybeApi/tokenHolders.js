const axios = require('axios');
const logger = require("../../utils/logger");

// Create an API instance with authentication
const api = axios.create({
  baseURL: process.env.VYBE_API_BASE_URL,
  headers: {
    'x-api-key': process.env.VYBE_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Historical constraint: Token Holders Time Series data available from this date
const EARLIEST_HOLDERS_TS_DATE = new Date('2023-11-09T19:00:00Z').getTime();

/**
 * Debugging: Logs available API methods from the vybeApi
 */
function logApiMethods() {
  console.log("Available vybeApi methods:");
  for (const methodName in api) {
    if (typeof api[methodName] === "function") {
      console.log(`- ${methodName}`);
    }
  }
}

// Log available methods once during initialization
logApiMethods();

/**
 * Gets token holders time series data for a specific token
 * @param {string} mintAddress - The token mint address
 * @param {number} startTime - Start time as unix timestamp (milliseconds)
 * @param {number} endTime - End time as unix timestamp (milliseconds)
 * @param {string} interval - Time interval (currently only "day" is supported)
 * @param {number} limit - Result page size
 * @param {number} page - Page selection (0-indexed)
 * @returns {Promise<Array>} Array of token holder data points
 */
async function getTokenHoldersTimeSeries(
  mintAddress,
  startTime,
  endTime,
  interval = "day",
  limit = 30,
  page = 0
) {
  try {
    logger.info(`Fetching token holders time series for ${mintAddress}`);
    
    // Enforce historical data constraints
    const constrainedStartTime = Math.max(startTime || EARLIEST_HOLDERS_TS_DATE, EARLIEST_HOLDERS_TS_DATE);
    
    // Build params object
    const params = {
      interval,
      limit,
      page,
      startTime: Math.floor(constrainedStartTime / 1000) // Convert to seconds for API
    };
    
    // Only add endTime if provided
    if (endTime) params.endTime = Math.floor(endTime / 1000); // Convert to seconds for API
    
    // Make direct API call to the token holders time series endpoint
    const response = await api.get(`/token/${mintAddress}/holders-ts`, { params });
    
    // API returns { data: [ { holdersTimestamp, nHolders }, ... ] }
    if (response.data && Array.isArray(response.data.data)) {
      // Transform the data to the format we need
      return response.data.data.map(item => ({
        time: item.holdersTimestamp * 1000, // Convert seconds to milliseconds
        holderCount: item.nHolders
      }));
    }
    
    return [];
  } catch (error) {
    // Handle 404 errors specifically (no data for this token/timeframe)
    if (error.response && error.response.status === 404) {
      logger.warn(`No holder time series data available for ${mintAddress}`);
      return [];
    }
    
    logger.error(
      `Error fetching token holders time series for ${mintAddress}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Gets total token holders count from the token details endpoint
 * @param {string} mintAddress - The token mint address
 * @returns {Promise<number>} The total number of holders
 */
async function getTotalTokenHolders(mintAddress) {
  try {
    // First attempt: get from token details which includes holder count
    try {
      logger.info(`Fetching token details for ${mintAddress} to get holder count`);
      const response = await api.get(`/token/${mintAddress}`);
      
      if (response.data && typeof response.data.holderCount === 'number') {
        return response.data.holderCount;
      }
    } catch (detailsError) {
      logger.warn(`Could not get holder count from token details for ${mintAddress}:`, detailsError.message);
    }
    
    // Second attempt: fallback to time series if token details doesn't have holder count
    logger.info(`Attempting to get holder count from time series for ${mintAddress}`);
    const now = Date.now();
    // Get the latest 7 days of data
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const data = await getTokenHoldersTimeSeries(
      mintAddress,
      weekAgo,
      now,
      "day",
      7
    );
    
    if (Array.isArray(data) && data.length > 0) {
      // Sort by time descending to get most recent
      const sortedData = [...data].sort((a, b) => b.time - a.time);
      return sortedData[0]?.holderCount || 0;
    }
    
    // If we get here, we couldn't get holder count from either source
    return 0;
  } catch (error) {
    logger.error(`Error fetching total token holders for ${mintAddress}:`, error);
    return 0;
  }
}

/**
 * Gets holder trend data for the specified period
 * @param {string} mintAddress - The token mint address
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} Holder trend data with percentages
 */
async function getHoldersTrend(mintAddress, days = 30) {
  try {
    // First get current holder count from token details
    let currentHolderCount = 0;
    try {
      const tokenDetails = await api.get(`/token/${mintAddress}`);
      if (tokenDetails.data && typeof tokenDetails.data.holderCount === 'number') {
        currentHolderCount = tokenDetails.data.holderCount;
      }
    } catch (detailsError) {
      logger.warn(`Could not get token details for ${mintAddress}:`, detailsError.message);
    }
    
    // Get time series data for trend analysis
    // Calculate dates based on constraints
    const now = Date.now();
    let startTime = now - (days * 24 * 60 * 60 * 1000);
    
    // Ensure we don't request data from before it's available
    if (startTime < EARLIEST_HOLDERS_TS_DATE) {
      const actualDays = Math.floor((now - EARLIEST_HOLDERS_TS_DATE) / (24 * 60 * 60 * 1000));
      logger.info(`Adjusting request period from ${days} to ${actualDays} days due to data availability constraints`);
      startTime = EARLIEST_HOLDERS_TS_DATE;
    }
    
    // Get time series data
    const data = await getTokenHoldersTimeSeries(
      mintAddress,
      startTime,
      now,
      "day",
      days
    );
    
    if (!Array.isArray(data) || data.length < 2) {
      logger.info(`Insufficient holder time series data for ${mintAddress} to calculate trends`);
      return { 
        current: currentHolderCount,
        trend7d: null, 
        trend30d: null 
      };
    }
    
    // Sort by time ascending
    const sortedData = [...data].sort((a, b) => a.time - b.time);
    
    // If we couldn't get current holders from token details, use the most recent from time series
    if (currentHolderCount === 0 && sortedData.length > 0) {
      currentHolderCount = sortedData[sortedData.length - 1]?.holderCount || 0;
    }
    
    // Calculate 7-day change if we have enough data
    let trend7d = null;
    const dataAgeDays = Math.ceil((now - sortedData[0].time) / (24 * 60 * 60 * 1000));
    
    if (sortedData.length > 1 && dataAgeDays >= 7) {
      // Find data point closest to 7 days ago
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
      const sevenDayIndex = sortedData.findIndex(point => point.time >= sevenDaysAgo);
      
      if (sevenDayIndex >= 0) {
        const sevenDayAgoCount = sortedData[Math.max(0, sevenDayIndex)]?.holderCount || 0;
        
        if (sevenDayAgoCount > 0) {
          trend7d = ((currentHolderCount - sevenDayAgoCount) / sevenDayAgoCount) * 100;
        }
      }
    }
    
    // Calculate total period change (from first data point)
    const oldestCount = sortedData[0]?.holderCount || 0;
    let trend30d = null;
    
    if (oldestCount > 0) {
      trend30d = ((currentHolderCount - oldestCount) / oldestCount) * 100;
    }
    
    // Determine the actual period we're reporting (might be less than 30 days)
    const actualPeriodDays = dataAgeDays;
    
    return {
      current: currentHolderCount,
      trend7d,
      trend30d,
      periodDays: actualPeriodDays,
      rawData: sortedData
    };
  } catch (error) {
    logger.error(`Error calculating holder trends for ${mintAddress}:`, error);
    return { current: 0, trend7d: null, trend30d: null };
  }
}

module.exports = {
  getTokenHoldersTimeSeries,
  getTotalTokenHolders,
  getHoldersTrend,
  EARLIEST_HOLDERS_TS_DATE
};
