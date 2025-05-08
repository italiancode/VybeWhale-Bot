const vybeApi = require("@api/vybe-api");
const logger = require("../../utils/logger");

/**
 * Authentication Setup
 * Ensures the Vybe API is authenticated before use.
 */
try {
  const apiKey = process.env.VYBE_API_KEY;
  if (apiKey) {
    vybeApi.auth(apiKey);
    logger.debug(
      "Vybe API authenticated successfully for top token holders module"
    );
  } else {
    logger.warn("VYBE_API_KEY is not set in environment variables");
  }
} catch (error) {
  logger.error(`Error authenticating with Vybe API: ${error.message}`);
}

/**
 * Fetches the top token holders (whales) for a given mint address.
 * @param {string} mintAddress - The mint address of the token.
 * @param {Object} [options] - Optional parameters for pagination and sorting.
 * @param {number} [options.page=0] - Page number (0-indexed).
 * @param {number} [options.limit=1000] - Number of holders to return per page (max 1000).
 * @param {string} [options.sortBy] - Field to sort by ('rank', 'ownerName', 'ownerAddress', 'valueUsd', 'balance', 'percentageOfSupplyHeld').
 * @param {boolean} [options.ascending=true] - Sort ascending (true) or descending (false).
 * @returns {Promise<Array>} - A promise that resolves to an array of top token holders.
 */
async function getTopTokenHolders(mintAddress, options = {}) {
  try {
    // Input Validation
    if (!mintAddress || typeof mintAddress !== "string") {
      throw new Error("Invalid mint address. Must be a non-empty string.");
    }

    // Prepare API Parameters
    const apiParams = {
      mintAddress: mintAddress,
      limit: options.limit || 1000,
    };

    // Add Pagination
    if (typeof options.page === "number") {
      apiParams.page = options.page;
    }

    // Add Sorting
    if (options.sortBy) {
      if (options.ascending === false) {
        apiParams.sortByDesc = options.sortBy;
      } else {
        apiParams.sortByAsc = options.sortBy;
      }
    }

    // Logging
    logger.info(`Fetching top token holders for mint address: ${mintAddress}`);
    logger.debug(`Request parameters: ${JSON.stringify(apiParams, null, 2)}`);

    // API Call
    const response = await vybeApi.get_top_holders(apiParams);

    // Response Handling
    if (!response) {
      logger.warn("No response received from Vybe API");
      return [];
    }

    if (response.status === 404) {
      logger.warn(
        `No data matches the provided query for mint address: ${mintAddress}`
      );
      return [];
    }

    if (response.status === 400) {
      logger.error(`Invalid request for mint address: ${mintAddress}`);
      throw new Error("Invalid request to Vybe API");
    }

    if (response.status === 500) {
      logger.error(`Internal server error for mint address: ${mintAddress}`);
      throw new Error("Internal server error from Vybe API");
    }

    if (!response.data || !Array.isArray(response.data.data)) {
      logger.warn("No top holders data returned from Vybe API");
      return [];
    }

    // Log Results
    logger.info(`Fetched ${response.data.data.length} top holders`);

    // Format Data
    const formattedHolders = response.data.data.map((holder) => ({
      rank: holder.rank,
      ownerName: holder.ownerName,
      ownerAddress: holder.ownerAddress,
      valueUsd: holder.valueUsd,
      balance: holder.balance,
      percentageOfSupplyHeld: holder.percentageOfSupplyHeld,
    }));

    return formattedHolders;
  } catch (error) {
    logger.error(`Error fetching top token holders: ${error.message}`, {
      mintAddress,
      stack: error.stack,
    });
    throw error;
  }
}

// Export the Module
module.exports = {
  getTopTokenHolders,
};
