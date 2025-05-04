// src/services/vybeApi/whaleTransactions.js
const vybeApi = require("@api/vybe-api");
const logger = require("../../utils/logger");

// Initialize the API with your key
vybeApi.auth(process.env.VYBE_API_KEY);

/**
 * Fetches whale transactions using the Vybe API SDK
 */
async function getWhaleTransactions(mintAddress, minUsdAmount, limit = 10) {
  try {
    const { data } = await vybeApi.get_token_transfers(mintAddress);
    return data;
  } catch (error) {
    logger.error("Error fetching whale transactions:", error);
    throw error;
  }
}

/**
 * Specialized method for bot to get at least some whale transactions quickly
 * @param {string} mintAddress - The token's mint address
 * @param {number} minUsdAmount - Minimum USD amount for transactions
 * @param {number} limit - Maximum number of transactions to return
 * @returns {Promise<Array>} - Array of whale transactions optimized for bot
 */
async function getBotWhaleTransactions(
  mintAddress,
  minUsdAmount = 10000,
  limit = 3
) {
  try {
    // Use shorter time window (2 days)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Increase minimum amount based on provided threshold
    const apiMinAmount = Math.max(5000, minUsdAmount * 0.5);

    logger.info(
      `Fetching bot whale transactions for ${mintAddress} with min amount ${apiMinAmount}`
    );

    const response = await vybeApi.get_token_transfers(mintAddress);

    let transactions = response.data;

    // Filter by USD amount client-side
    if (minUsdAmount && transactions && transactions.length > 0) {
      transactions = transactions.filter(
        (tx) => tx.valueUsd && parseFloat(tx.valueUsd) >= minUsdAmount
      );

      // Limit to requested count
      transactions = transactions.slice(0, limit);
    }

    return transactions;
  } catch (error) {
    // For timeouts, return empty array
    if (
      error.code === "ECONNABORTED" ||
      (error.response && error.response.status === 408)
    ) {
      logger.warn(`Timeout fetching whale transactions for ${mintAddress}`);
      return [];
    }

    // For other errors, rethrow
    throw error;
  }
}

module.exports = {
  getWhaleTransactions,
  getBotWhaleTransactions,
};
