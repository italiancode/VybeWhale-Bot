const vybeApi = require("@api/vybe-api");
const logger = require("../../utils/logger");

// Initialize the API with your key
vybeApi.auth(process.env.VYBE_API_KEY);

/**
 * Get wallet Profit and Loss (PnL) data from Vybe API
 * 
 * @param {string} walletAddress - The wallet address to analyze
 * @param {Object} options - Additional options
 * @param {string} options.resolution - Time period for analysis: "1d" (1 day), "7d" (7 days), or "30d" (30 days)
 * @param {string} options.tokenAddress - Optional token address to filter results
 * @param {string} options.sortByDesc - Sort results in descending order by this field
 * @returns {Promise<Object>} - Wallet PnL data
 */
async function getWalletPnL(walletAddress, options = {}) {
  try {
    if (!walletAddress) {
      logger.error("No wallet address provided for PnL analysis");
      return { summary: {}, tokenMetrics: [] };
    }

    // Set default resolution to 1d if not provided
    const resolution = options.resolution || "1d";
    if (!["1d", "7d", "30d"].includes(resolution)) {
      logger.warn(`Invalid resolution: ${resolution}. Using default "1d"`);
    }

    const params = {
      ownerAddress: walletAddress,
      resolution,
      ...options
    };

    // If no sort order specified, sort by realized PnL
    if (!options.sortByAsc && !options.sortByDesc) {
      params.sortByDesc = 'realizedPnlUsd';
    }

    logger.info(`Fetching wallet PnL for ${walletAddress} with resolution ${resolution}`);
    
    const response = await vybeApi.get_wallet_pnl(params);
    
    if (!response || !response.data) {
      logger.warn(`No PnL data returned for wallet ${walletAddress}`);
      return { summary: {}, tokenMetrics: [] };
    }
    
    return response.data;
  } catch (error) {
    logger.error(`Error fetching wallet PnL for ${walletAddress}:`, error);
    return { summary: {}, tokenMetrics: [] };
  }
}

/**
 * Process and enhance wallet PnL data
 * 
 * @param {Object} pnlData - Raw PnL data from API
 * @returns {Object} - Processed PnL data with additional metrics
 */
function processPnLData(pnlData) {
  try {
    if (!pnlData || !pnlData.summary) {
      return {
        overview: {
          totalPnL: 0,
          winRate: 0,
          tradeCount: 0,
          hasTradeActivity: false
        },
        tokenPerformance: [],
        bestPerformer: null,
        worstPerformer: null
      };
    }
    
    const summary = pnlData.summary;
    const tokenMetrics = pnlData.tokenMetrics || [];
    
    // Calculate total PnL (realized + unrealized)
    const realizedPnL = parseFloat(summary.realizedPnlUsd || 0);
    const unrealizedPnL = parseFloat(summary.unrealizedPnlUsd || 0);
    const totalPnL = realizedPnL + unrealizedPnL;
    
    // Check if there's any trade activity
    const hasTradeActivity = summary.tradesCount > 0;
    
    // Process token metrics with additional calculated fields
    const processedTokenMetrics = tokenMetrics.map(token => {
      const buys = parseFloat(token.buysVolumeUsd || 0);
      const sells = parseFloat(token.sellsVolumeUsd || 0);
      const realizedPnL = parseFloat(token.realizedPnlUsd || 0);
      const unrealizedPnL = parseFloat(token.unrealizedPnlUsd || 0);
      const totalPnL = realizedPnL + unrealizedPnL;
      
      // Calculate ROI if possible
      let roi = 0;
      if (buys > 0) {
        roi = (totalPnL / buys) * 100;
      }
      
      return {
        ...token,
        totalPnL,
        roi,
        isProfitable: totalPnL > 0,
        isFullyRealized: unrealizedPnL === 0 && realizedPnL !== 0
      };
    });
    
    // Sort tokens by total PnL to find best and worst performers
    const sortedTokens = [...processedTokenMetrics].sort((a, b) => b.totalPnL - a.totalPnL);
    
    const bestPerformer = sortedTokens.length > 0 ? sortedTokens[0] : null;
    const worstPerformer = sortedTokens.length > 0 ? sortedTokens[sortedTokens.length - 1] : null;
    
    return {
      overview: {
        totalPnL,
        realizedPnL,
        unrealizedPnL,
        winRate: summary.winRate || 0,
        tradeCount: summary.tradesCount || 0,
        tradeVolume: parseFloat(summary.tradesVolumeUsd || 0),
        averageTradeSize: parseFloat(summary.averageTradeUsd || 0),
        uniqueTokensTraded: summary.uniqueTokensTraded || 0,
        winningTrades: summary.winningTradesCount || 0,
        losingTrades: summary.losingTradesCount || 0,
        hasTradeActivity
      },
      tokenPerformance: processedTokenMetrics,
      bestPerformer,
      worstPerformer,
      pnlTrend: summary.pnlTrendSevenDays || []
    };
  } catch (error) {
    logger.error("Error processing PnL data:", error);
    return {
      overview: {
        totalPnL: 0,
        winRate: 0,
        tradeCount: 0,
        hasTradeActivity: false
      },
      tokenPerformance: [],
      bestPerformer: null,
      worstPerformer: null
    };
  }
}

/**
 * Get comprehensive wallet trading performance analysis
 * 
 * @param {string} walletAddress - The wallet address to analyze
 * @param {string} resolution - Time period for analysis: "1d", "7d", or "30d"
 * @returns {Promise<Object>} - Complete wallet trading performance analysis
 */
async function getWalletTradingPerformance(walletAddress, resolution = "7d") {
  try {
    // Get wallet PnL data
    const pnlData = await getWalletPnL(walletAddress, { resolution });
    
    // Process the data with additional metrics
    const processedData = processPnLData(pnlData);
    
    // Return the processed data with wallet address and period for context
    return {
      address: walletAddress,
      period: resolution,
      ...processedData
    };
  } catch (error) {
    logger.error(`Error analyzing wallet trading performance for ${walletAddress}:`, error);
    return {
      address: walletAddress,
      period: resolution,
      overview: {
        totalPnL: 0,
        winRate: 0,
        tradeCount: 0,
        hasTradeActivity: false
      },
      tokenPerformance: [],
      bestPerformer: null,
      worstPerformer: null
    };
  }
}

module.exports = {
  getWalletPnL,
  processPnLData,
  getWalletTradingPerformance
}; 