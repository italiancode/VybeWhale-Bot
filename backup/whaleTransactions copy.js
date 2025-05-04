// src/services/vybeApi/whaleTransactions.js
const vybeApi = require("@api/vybe-api");
const logger = require("../src/utils/logger");

// Initialize the API with your key
vybeApi.auth(process.env.VYBE_API_KEY);

/**
 * Fetches whale transactions (large value transfers and trades) for a token
 * Combines both token transfers and trade data for a comprehensive view
 */
async function getWhaleTransactions(mintAddress, minUsdAmount, limit = 10) {
  try {
    // Create an array to hold all whale transactions
    let allWhaleTransactions = [];
    
    // 1. Fetch token transfers
    try {
      const transferResponse = await vybeApi.get_token_transfers(mintAddress);
      logger.info(`Got ${transferResponse?.data?.transfers?.length || 0} transfers for ${mintAddress}`);
      
      if (transferResponse?.data?.transfers) {
        // Add transfers to the list
        const transfers = transferResponse.data.transfers;
        transfers.forEach(tx => {
          tx.transactionType = "TRANSFER"; // Add transaction type marker
        });
        allWhaleTransactions = [...transfers];
      }
    } catch (error) {
      logger.warn(`Error fetching token transfers: ${error.message}`);
    }
    
    // 2. Fetch trade data if available
    try {
      const tradeResponse = await vybeApi.get_trade_data_program(mintAddress);
      logger.info(`Got ${tradeResponse?.data?.length || 0} trades for ${mintAddress}`);
      
      if (tradeResponse?.data && Array.isArray(tradeResponse.data)) {
        // Process trades and add them to the list
        const trades = tradeResponse.data;
        trades.forEach(trade => {
          // Add transaction type based on trade direction
          trade.transactionType = trade.side === "buy" ? "BUY" : "SELL";
          
          // Ensure trades have consistent fields with transfers for filtering and display
          if (trade.tokenAmount && !trade.calculatedAmount) {
            trade.calculatedAmount = trade.tokenAmount;
          }
          
          if (trade.usdAmount && !trade.valueUsd) {
            trade.valueUsd = trade.usdAmount.toString();
          }
        });
        
        // Add trades to our collection
        allWhaleTransactions = [...allWhaleTransactions, ...trades];
      }
    } catch (error) {
      logger.warn(`Error fetching trade data: ${error.message}`);
    }
    
    // 3. Filter transactions by the minimum USD amount
    let whaleTransactions = allWhaleTransactions.filter(tx => {
      // Use different fields depending on transaction type
      const txValueUsd = parseFloat(tx.valueUsd || tx.usdAmount || 0) || 
        (tx.calculatedAmount && tx.price ? parseFloat(tx.calculatedAmount) * parseFloat(tx.price) : 0);
      
      return txValueUsd >= parseFloat(minUsdAmount);
    });
    
    // 4. Sort by value and timestamp, highest value and most recent first
    whaleTransactions.sort((a, b) => {
      const aValue = parseFloat(a.valueUsd || a.usdAmount || 0);
      const bValue = parseFloat(b.valueUsd || b.usdAmount || 0);
      
      // First sort by value (highest first)
      if (bValue !== aValue) {
        return bValue - aValue;
      }
      
      // If values are equal, sort by timestamp (most recent first)
      const aTime = a.blockTime || a.timestamp || 0;
      const bTime = b.blockTime || b.timestamp || 0;
      return bTime - aTime;
    });
    
    // 5. Limit the results
    whaleTransactions = whaleTransactions.slice(0, limit);
    
    logger.info(`Returning ${whaleTransactions.length} whale transactions for ${mintAddress}`);
    return whaleTransactions;
  } catch (error) {
    logger.error("Error fetching whale transactions:", error);
    throw error;
  }
}

module.exports = {
  getWhaleTransactions,
};
