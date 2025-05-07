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
 * Fetches token trade data from the Vybe Network API for a specific trading pair across multiple programs.
 * @param {string} baseMintAddress - The mint address of the base token (e.g., BONK).
 * @param {string} quoteMintAddress - The mint address of the quote token (e.g., SOL).
 * @param {string[]|null} [programIds=null] - Array of program IDs to fetch trades from (e.g., Raydium V4, Orca). If null, fetches from all supported programs.
 * @param {number} [timeRangeHours=24] - The time range in hours to fetch trades for (default: 24 hours).
 * @param {number} [limitPerProgram=10] - The maximum number of trades to fetch per program (default: 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of trade objects from all programs.
 * @throws {Error} - If the API call fails or parameters are invalid.
 */
export async function getTokenTrades({
  baseMintAddress,
  quoteMintAddress,
  programIds = null, // If null, fetch from all supported programs
  timeRangeHours = 24,
  limitPerProgram = 10,
}) {
  try {
    // Input validation
    if (!baseMintAddress || typeof baseMintAddress !== "string") {
      throw new Error("baseMintAddress is required and must be a string.");
    }
    if (!quoteMintAddress || typeof quoteMintAddress !== "string") {
      throw new Error("quoteMintAddress is required and must be a string.");
    }
    if (timeRangeHours <= 0 || typeof timeRangeHours !== "number") {
      throw new Error("timeRangeHours must be a positive number.");
    }
    if (
      limitPerProgram <= 0 ||
      typeof limitPerProgram !== "number" ||
      limitPerProgram > 1000
    ) {
      throw new Error(
        "limitPerProgram must be a positive number and not exceed 1000."
      );
    }

    // Calculate time range (e.g., last 24 hours)
    const timeEnd = Math.floor(Date.now() / 1000); // Current Unix timestamp
    const timeStart = timeEnd - timeRangeHours * 3600; // timeRangeHours ago

    logger.info(
      `Fetching trades for pair ${baseMintAddress}/${quoteMintAddress} from ${new Date(
        timeStart * 1000
      ).toISOString()} to ${new Date(timeEnd * 1000).toISOString()}`
    );

    // Determine which programs to query
    const programsToQuery = programIds || Object.values(SUPPORTED_PROGRAMS);
    let allTrades = [];

    // If programIds is null, fetch trades with programId set to null to aggregate across all programs
    if (programIds === null) {
      logger.info(
        "Fetching trades across all supported programs (programId=null)."
      );
      const response = await vybeApi.get_trade_data_program({
        programId: null, // Aggregate across all programs
        baseMintAddress,
        quoteMintAddress,
        timeStart,
        timeEnd,
        limit: limitPerProgram,
        sortByDesc: "blocktime",
      });

      if (!response || !response.data || !Array.isArray(response.data)) {
        logger.warn(
          "No trade data returned from Vybe API when fetching across all programs."
        );
        return [];
      }

      allTrades = response.data;
      logger.info(`Fetched ${allTrades.length} trades across all programs.`);
    } else {
      // Fetch trades for each specified program
      for (const programId of programsToQuery) {
        logger.info(`Fetching trades for program ${programId}`);
        try {
          const response = await vybeApi.get_trade_data_program({
            programId,
            baseMintAddress,
            quoteMintAddress,
            timeStart,
            timeEnd,
            limit: limitPerProgram,
            sortByDesc: "blocktime",
          });

          if (!response || !response.data || !Array.isArray(response.data)) {
            logger.warn(`No trade data returned for program ${programId}.`);
            continue;
          }

          const trades = response.data;
          logger.info(
            `Fetched ${trades.length} trades for program ${programId}`
          );
          allTrades = allTrades.concat(trades);
        } catch (error) {
          logger.error(
            `Error fetching trades for program ${programId}: ${error.message}`,
            {
              programId,
              baseMintAddress,
              quoteMintAddress,
              stack: error.stack,
            }
          );
        }
      }
    }

    // Sort all trades by blockTime (most recent first)
    allTrades.sort((a, b) => b.blockTime - a.blockTime);

    // Format trades for better readability
    const formattedTrades = allTrades.map((trade) => ({
      authorityAddress: trade.authorityAddress,
      blockTime: trade.blockTime,
      timestamp: new Date(trade.blockTime * 1000).toISOString(),
      pair: `${trade.baseMintAddress}/${trade.quoteMintAddress}`,
      direction: trade.quoteMintAddress === quoteMintAddress ? "Buy" : "Sell",
      price: trade.price,
      baseSize: trade.baseSize,
      quoteSize: trade.quoteSize,
      signature: trade.signature,
      feePayer: trade.feePayer,
      programId: trade.programId,
    }));

    logger.debug("Formatted trades:", formattedTrades);
    return formattedTrades;
  } catch (error) {
    logger.error(`Error fetching token trades: ${error.message}`, {
      baseMintAddress,
      quoteMintAddress,
      timeRangeHours,
      limitPerProgram,
      stack: error.stack,
    });
    throw error;
  }
}
