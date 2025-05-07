const vybeApi = require("@api/vybe-api");
const logger = require("../../utils/logger");

// Initialize the API with your key from environment variables
if (!process.env.VYBE_API_KEY) {
  throw new Error("VYBE_API_KEY is not set in environment variables.");
}
vybeApi.auth(process.env.VYBE_API_KEY);

// List of supported DEXs and aggregators (from Vybe Network WebSocket docs)
const SUPPORTED_PROGRAMS = {
  // Supported DEXs & AMMs:
  "1Dex Program": "DEXYosS6oEGvk8uCDayvwEZz4qEyDJRf9nFgYCaqPMTm",
  Bonkswap: "BSwp6bEBihVLdqJRKGgzjcGLHkcTuzmSo1TQkHepzH8p",
  Crema: "CLMM9tUoggJu2wagPkkqs9eFG4BWhVBZWkP1qv3Sp7tR",
  Dexlab: "DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N",
  Fluxbeam: "FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X",
  "GooseFX V1": "GAMMA7meSFWaBXF25oSUgmGRwaW6sCMFLmBNiMSdbHVT",
  Guacswap: "Gswppe6ERWKpUTXvRPfXdzHhiCyJvLadVvXGfdpBqcE1",
  Invariant: "HyaB3W9q6XdA5xwpU4XnSZV94htfmbmqJXZcEbRaJutt",
  "Lifinity V1": "EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S",
  "Lifinity V2": "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c",
  "Mercurial Stable Swap": "MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky",
  "Meteora DLMM": "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
  "Meteora Pools": "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB",
  "Meteora Vault": "24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi",
  "Obric V2": "obriQD1zbpyLz95G5n7nJe6a4DPjpFwa5XYPoNm113y",
  "OpenBook V2": "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb",
  "Orca V2": "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP",
  "Orca Whirlpool": "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
  "Phoenix DEX": "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY",
  "Pump.fun": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
  "Raydium V4": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
  "Raydium CLMM": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
  "Raydium CPMM": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C",
  Saber: "SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ",
  "Sanctum Router": "stkitrT1Uoy18Dk1fTrgPw8W6MVzoCfYoAFT4MLsmhq",
  Solfi: "SoLFiHG9TfgtdUXUjWAxi3LtvYuFyDLVhBWxdMZxyCe",
  "Stabble Stable Swap": "swapNyd8XiQwJ6ianp9snpu4brUqFxadzvHebnAXjJZ",
  "Stabble Weighted Swap": "swapFpHZwjELNnjvThjajtiVmkz3yPQEHjLtka2fwHW",
  // Supported Aggregators:
  "Jupiter V6": "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
  OKX: "6m2CDdhRgxpH4WjvdzxAYbGxwdGUz5MziiL5jek2kBma",
};

/**
 * Logs available methods in the vybeApi for debugging purposes.
 */
function logApiMethods() {
  logger.debug("Available vybeApi methods:");
  for (const methodName in vybeApi) {
    if (typeof vybeApi[methodName] === "function") {
      logger.debug(`- ${methodName}`);
    }
  }
}

// Log available methods once during initialization
logApiMethods();

/**
 * Fetches token trade data from the Vybe Network API.
 * @param {Object} options - Options for fetching trades
 * @param {string} [options.mintAddress] - The mint address of the token to fetch trades for (regardless of base/quote)
 * @param {string} [options.baseMintAddress] - The mint address of the base token (must be used with quoteMintAddress)
 * @param {string} [options.quoteMintAddress] - The mint address of the quote token (must be used with baseMintAddress)
 * @param {number} [options.timeRangeHours=24] - Time range in hours to look back
 * @param {number} [options.limit=10] - Maximum number of trades to fetch
 * @returns {Promise<Array>} - A promise that resolves to an array of formatted trade objects
 */
async function getTokenTrades({
  mintAddress,
  baseMintAddress,
  quoteMintAddress,
  timeRangeHours,
  limit,
}) {
  try {
    // Validate input parameters
    const hasMintAddress = mintAddress && typeof mintAddress === "string";
    const hasBaseAndQuote =
      baseMintAddress &&
      typeof baseMintAddress === "string" &&
      quoteMintAddress &&
      typeof quoteMintAddress === "string";

    if (hasMintAddress && hasBaseAndQuote) {
      throw new Error(
        "Cannot provide both mintAddress and baseMintAddress/quoteMintAddress. Use one or the other."
      );
    }

    if (!hasMintAddress && !hasBaseAndQuote) {
      throw new Error(
        "Either mintAddress or both baseMintAddress and quoteMintAddress must be provided."
      );
    }

    // Calculate time range
    const timeEnd = Math.floor(Date.now() / 1000);
    const timeStart = timeEnd - timeRangeHours * 3600;

    logger.info(
      `Fetching trades for token ${
        hasMintAddress ? mintAddress : `${baseMintAddress}/${quoteMintAddress}`
      } ` +
        `from ${new Date(timeStart * 1000).toISOString()} to ${new Date(
          timeEnd * 1000
        ).toISOString()}`
    );

    // Prepare API parameters - EXACTLY matching the direct API call structure
    const apiParams = {
      timeStart,
      timeEnd,
      limit,
    };

    // Add token parameters based on what was provided
    if (hasMintAddress) {
      apiParams.mintAddress = mintAddress;
    } else {
      apiParams.baseMintAddress = baseMintAddress;
      apiParams.quoteMintAddress = quoteMintAddress;
    }

    // Make API call - using exact same structure as direct API call
    const response = await vybeApi.get_trade_data_program(apiParams);

    // Handle response
    if (
      !response ||
      !response.data ||
      !response.data.data ||
      !Array.isArray(response.data.data)
    ) {
      logger.warn("No trade data returned from Vybe API");
      return [];
    }

    // Extract trades from nested data structure
    let trades = response.data.data;
    logger.info(`Fetched ${trades.length} trades from Vybe API`);

    // If no trades found, return empty array
    if (trades.length === 0) {
      return [];
    }

    // Format trades for better readability
    const formattedTrades = trades.map((trade) => {
      const tradeDetails = {
        authorityAddress: trade.authorityAddress,
        blockTime: trade.blockTime,
        timestamp: new Date(trade.blockTime * 1000).toISOString(),
        pair: `${trade.baseMintAddress}/${trade.quoteMintAddress}`,
        price: trade.price,
        baseSize: trade.baseSize,
        quoteSize: trade.quoteSize,
        signature: trade.signature,
        feePayer: trade.feePayer,
        programId: trade.programId,
      };

      // Determine direction
      if (hasMintAddress) {
        tradeDetails.direction =
          trade.baseMintAddress === mintAddress ? "Sell" : "Buy";
        tradeDetails.directionContext = `(for token ${mintAddress})`;
      } else {
        tradeDetails.direction =
          trade.quoteMintAddress === quoteMintAddress ? "Buy" : "Sell";
        tradeDetails.directionContext = `(for token ${baseMintAddress})`;
      }

      return tradeDetails;
    });

    return formattedTrades;
  } catch (error) {
    logger.error(`Error fetching token trades: ${error.message}`, {
      mintAddress,
      baseMintAddress,
      quoteMintAddress,
      timeRangeHours,
      limit,
      stack: error.stack,
    });
    throw error;
  }
}

// Export functions for use in other modules
module.exports = {
  getTokenTrades,
  SUPPORTED_PROGRAMS,
};
