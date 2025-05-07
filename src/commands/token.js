const logger = require("../utils/logger");
const stateManager = require("../utils/stateManager");
const vybeApi = require("../services/vybeApi");
const tokenHolders = require("../services/vybeApi/tokenHolders");

async function handleTokenCommand(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check for direct token address in command
    const commandArgs = msg.text.split(" ");
    if (commandArgs.length > 1) {
      const tokenInput = commandArgs[1].trim();
      // Validate Solana address format
      if (tokenInput.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        await processTokenInput(bot, msg, tokenInput);
        return;
      } else {
        await bot.sendMessage(
          chatId,
          "❌ *Invalid Solana token address format.*\n\nPlease enter a valid address. Example:\n`So11111111111111111111111111111111111111112`",
          { parse_mode: "Markdown" }
        );
        return;
      }
    }

    // Set initial state for token input
    stateManager.setState(userId, {
      command: "token",
      step: "awaiting_token",
      lastToken: null, // Initialize lastToken
    });

    const message =
      `🧠 *Token Analyzer*\n\n` +
      `Please enter the *Solana token address* you want to analyze.\n\n` +
      `🔹 *Example:* \`So11111111111111111111111111111111111111112\` _(SOL token)_\n\n` +
      `This will return key market data including price, supply, market cap, and 24h performance.`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    logger.info(`Token command initiated for user ${userId}`);
  } catch (error) {
    logger.error("Error in token command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "⚠️ Sorry, something went wrong. Please try again later."
    );
  }
}

// Helper function to process token input
async function processTokenInput(bot, msg, tokenInput) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    await bot.sendChatAction(chatId, "typing");

    // Get token info with basic data
    const tokenInfo = await vybeApi.getTokenInfo(tokenInput);

    // Get holder trend data
    let holderData = null;
    try {
      holderData = await tokenHolders.getHoldersTrend(tokenInput, 30);
      
      // If holderData.current is 0 but token info has a holderCount, use that
      if (holderData && holderData.current === 0 && tokenInfo.holderCount) {
        holderData.current = tokenInfo.holderCount;
      }
    } catch (holderError) {
      logger.error(`Error getting holder trend for ${tokenInput}:`, holderError);
      // Create a basic holder data object with just the current count from tokenInfo
      holderData = { 
        current: tokenInfo.holderCount || 0, 
        trend7d: null, 
        trend30d: null 
      };
    }

    // Format and send response
    const response = formatTokenInfo(tokenInfo, holderData);
    await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });

    // Store the last analyzed token
    stateManager.setState(userId, {
      command: "token",
      lastToken: tokenInput,
      lastTokenSymbol: tokenInfo.symbol || "Unknown Token",
    });

    logger.info(`Token info provided for user ${userId}`);
  } catch (apiError) {
    logger.error(
      "API Error:",
      apiError.response ? apiError.response.data : apiError
    );

    const chatId = msg.chat.id;
    if (apiError.response?.status === 404) {
      await bot.sendMessage(
        chatId,
        "❌ Token not found. Please check the address and try again."
      );
    } else if (apiError.response?.status === 429) {
      await bot.sendMessage(
        chatId,
        "⏳ Rate limit exceeded. Please wait a few minutes and try again."
      );
    } else {
      await bot.sendMessage(
        chatId,
        "⚠️ Error fetching token data. Try again later."
      );
    }
  }
}

async function handleTokenInput(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = stateManager.getState(userId);

    if (!userState || userState.command !== "token") return;

    const tokenInput = msg.text.trim();

    // Check if input is a new command
    if (tokenInput.startsWith("/")) {
      stateManager.clearState(userId);
      return;
    }

    // Validate Solana address format
    if (!tokenInput.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      await bot.sendMessage(
        chatId,
        "❌ *Invalid Solana token address format.*\n\nPlease enter a valid address. Example:\n`So11111111111111111111111111111111111111112`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    await processTokenInput(bot, msg, tokenInput);
  } catch (error) {
    logger.error("Error processing token input:", error);
    await bot.sendMessage(
      msg.chat.id,
      "⚠️ An unexpected error occurred. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

function formatTokenInfo(tokenInfo, holderData) {
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    
    // For integers or round numbers, don't add decimals
    if (Number.isInteger(num)) {
      return num.toLocaleString();
    }

    // For very precise small numbers (like some token prices)
    if (num < 0.000001 && num > 0) {
      return num.toExponential(6);
    }

    // For numbers less than 1 but greater than 0.000001
    if (num < 1 && num > 0) {
      const decimals = Math.max(8, -Math.floor(Math.log10(num)));
      return num.toFixed(decimals);
    }

    // For trillions
    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}T`;
    }

    // For billions
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}B`;
    }

    // For millions
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}M`;
    }

    // For thousands
    if (num >= 1_000) {
      return `${(num / 1_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}K`;
    }

    // For numbers between 1 and 999
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const price24hChange =
    tokenInfo.price && tokenInfo.price1d
      ? (
          ((tokenInfo.price - tokenInfo.price1d) / tokenInfo.price1d) *
          100
        ).toFixed(2)
      : null;

  const price7dChange =
    tokenInfo.price && tokenInfo.price7d
      ? (
          ((tokenInfo.price - tokenInfo.price7d) / tokenInfo.price7d) *
          100
        ).toFixed(2)
      : null;

  const formatPriceChange = (change) => {
    if (!change) return "";
    return change > 0 ? `🟢 +${change}%` : `🔴 ${change}%`;
  };

  // Format holders trend data
  const formatHoldersTrend = () => {
    if (!holderData) return 'N/A';
    
    const { trend7d, trend30d, periodDays } = holderData;
    let trendText = '';
    
    if (trend7d !== null) {
      const trend7dFormatted = trend7d.toFixed(2);
      trendText += trend7d > 0 ? 
        `7d: 🟢 +${trend7dFormatted}%` : 
        `7d: 🔴 ${trend7dFormatted}%`;
    }
    
    if (trend7d !== null && trend30d !== null) {
      trendText += ' | ';
    }
    
    if (trend30d !== null) {
      // Display the actual period days if it's not 30
      const periodLabel = periodDays && periodDays < 30 ? `${periodDays}d` : '30d';
      
      const trend30dFormatted = trend30d.toFixed(2);
      trendText += trend30d > 0 ? 
        `${periodLabel}: 🟢 +${trend30dFormatted}%` : 
        `${periodLabel}: 🔴 ${trend30dFormatted}%`;
    }
    
    return trendText || 'N/A';
  };

  // Get holder count - first try to get from holderData, then from tokenInfo.holderCount
  const holderCount = holderData?.current || tokenInfo.holderCount || 0;

  let message = `💰 *${tokenInfo.name || "Unknown Token"} (${
    tokenInfo.symbol || "N/A"
  })*\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `📊 *Market Overview*\n`;
  message += `• Price: $${formatNumber(tokenInfo.price)}\n`;
  message += `• 24h: ${formatPriceChange(
    price24hChange
  )} | 7d: ${formatPriceChange(price7dChange)}\n`;
  message += `• Market Cap: $${formatNumber(tokenInfo.marketCap)}\n`;
  message += `• 24h Volume: $${formatNumber(tokenInfo.usdValueVolume24h)}\n`;
  message += `• Circulating Supply: ${formatNumber(tokenInfo.currentSupply)}\n`;
  
  // Add holders data - ensure we display it as a whole number
  const displayHolderCount = parseInt(holderCount || 0);
  message += `• Holders: ${formatNumber(displayHolderCount)}\n`;
  
  // Add holder trend if available
  const holdersTrendText = formatHoldersTrend();
  if (holdersTrendText !== 'N/A') {
    message += `• Holder Trend: ${holdersTrendText}\n`;
  }
  
  message += `• Verified: ${tokenInfo.verified ? "✅ Yes" : "❌ No"}\n`;

  message += `\n📡 *Whale Watch:*\nUse [/whale ${tokenInfo.mintAddress}] to see recent whale activity for this token.\n`;

  message += `\n📈 *Full Analytics:*\n[View full chart on AlphaVybe 🔗](https://alpha.vybenetwork.com/tokens/${tokenInfo.mintAddress})`;

  return message;
}

module.exports = {
  handleTokenCommand,
  handleTokenInput,
};
