const logger = require("../utils/logger");
const stateManager = require("../utils/stateManager");
const vybeApi = require("../services/vybeApi");
const tokenHolders = require("../services/vybeApi/tokenHolders");
const { getTopTokenHolders } = require("../services/vybeApi/topTokenHolder");

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
      `This will return key market data including price, supply, market cap, whale distribution, and 24h performance.`;

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

    // Send a waiting message to improve user experience
    const waitingMsg = await bot.sendMessage(
      chatId,
      "🔍 *Analyzing token data and whale distribution...*\n\nPlease wait a moment.",
      { parse_mode: "Markdown" }
    );

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
      logger.error(
        `Error getting holder trend for ${tokenInput}:`,
        holderError
      );
      // Create a basic holder data object with just the current count from tokenInfo
      holderData = {
        current: tokenInfo.holderCount || 0,
        trend7d: null,
        trend30d: null,
      };
    }

    // Get top token holders data
    let topHolders = [];
    try {
      topHolders = await getTopTokenHolders(tokenInput, {
        page: 0,
        limit: 5, // Get top 5 holders
        sortBy: "valueUsd",
        ascending: false,
      });
    } catch (holderError) {
      logger.error(`Error getting top holders for ${tokenInput}:`, holderError);
    }

    // Delete the waiting message before sending the actual response
    await bot.deleteMessage(chatId, waitingMsg.message_id).catch((err) => {
      logger.warn(`Could not delete waiting message: ${err.message}`);
    });
    
    // Check if we have meaningful data to display
    const hasPrice = tokenInfo.price !== undefined && tokenInfo.price !== null;
    const hasHolderCount = (holderData?.current > 0) || (tokenInfo.holderCount > 0);
    const hasTopHolders = topHolders && topHolders.length > 0;
    const hasMarketCap = tokenInfo.marketCap !== undefined && tokenInfo.marketCap !== null;
    
    // If we have very limited data, provide helpful explanation
    if (!hasPrice && !hasMarketCap && !hasTopHolders) {
      // Build a more helpful message for tokens with limited data
      const tokenSymbol = tokenInfo.symbol || "this token";
      const helpMessage = 
        `ℹ️ *Limited data available for ${tokenSymbol}*\n\n` +
        `The token exists on-chain, but has limited market data. This could be because:\n` +
        `• The token is new or has low trading volume\n` +
        `• It hasn't been listed on major exchanges yet\n` +
        `• This token is not yet fully indexed by Vybe Network\n\n` +
        (hasHolderCount ? `• Holders: ${formatNumber(holderData?.current || tokenInfo.holderCount)}\n\n` : '') +
        `📊 [View Token on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenInput}) for all available data\n\n` +
        `You can try the /whale command to see if there are any recent large transactions for this token.`;
      
      await bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
      
      // Still store the token for later reference
      stateManager.setState(userId, {
        command: "token",
        lastToken: tokenInput,
        lastTokenSymbol: tokenInfo.symbol || "Unknown Token",
      });
      
      logger.info(`Limited token info provided for user ${userId}`);
      return;
    }

    // Format and send response
    const response = formatTokenInfo(tokenInfo, holderData, topHolders);
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

function formatTokenInfo(tokenInfo, holderData, topHolders = []) {
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

  // Check what data we have available
  const hasPrice = tokenInfo.price !== undefined && tokenInfo.price !== null;
  const hasMarketCap = tokenInfo.marketCap !== undefined && tokenInfo.marketCap !== null;
  const hasVolume = tokenInfo.usdValueVolume24h !== undefined && tokenInfo.usdValueVolume24h !== null;
  const hasSupply = tokenInfo.currentSupply !== undefined && tokenInfo.currentSupply !== null;
  
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
    if (!change) return "N/A";
    return change > 0 ? `🟢 +${change}%` : `🔴 ${change}%`;
  };

  // Format holders trend data
  const formatHoldersTrend = () => {
    if (!holderData) return "N/A";

    const { trend7d, trend30d, periodDays } = holderData;
    let trendText = "";

    if (trend7d !== null) {
      const trend7dFormatted = trend7d.toFixed(2);
      trendText +=
        trend7d > 0
          ? `7d: 🟢 +${trend7dFormatted}%`
          : `7d: 🔴 ${trend7dFormatted}%`;
    }

    if (trend7d !== null && trend30d !== null) {
      trendText += " | ";
    }

    if (trend30d !== null) {
      // Display the actual period days if it's not 30
      const periodLabel =
        periodDays && periodDays < 30 ? `${periodDays}d` : "30d";

      const trend30dFormatted = trend30d.toFixed(2);
      trendText +=
        trend30d > 0
          ? `${periodLabel}: 🟢 +${trend30dFormatted}%`
          : `${periodLabel}: 🔴 ${trend30dFormatted}%`;
    }

    return trendText || "N/A";
  };

  // Calculate top holders concentration
  const calculateHolderConcentration = () => {
    if (!topHolders || topHolders.length === 0) return 0;

    return topHolders.reduce((total, holder) => {
      return total + (parseFloat(holder.percentageOfSupplyHeld) || 0);
    }, 0);
  };

  // Get holder count - first try to get from holderData, then from tokenInfo.holderCount
  const holderCount = holderData?.current || tokenInfo.holderCount || 0;
  const topHolderConcentration = calculateHolderConcentration();
  const hasTopHolders = topHolders && topHolders.length > 0;

  let message = `💰 *${tokenInfo.name || "Unknown Token"} (${
    tokenInfo.symbol || "N/A"
  }) ${tokenInfo.verified ? "✅" : ""}*\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  
  // Market overview section - only include if we have some market data
  message += `📊 *Market Overview*\n`;
  
  // Always show price if available
  if (hasPrice) {
    message += `• Price: $${formatNumber(tokenInfo.price)}\n`;
    
    // Only show price changes if we have them
    if (price24hChange || price7dChange) {
      const price24hText = price24hChange ? formatPriceChange(price24hChange) : "N/A";
      const price7dText = price7dChange ? formatPriceChange(price7dChange) : "N/A";
      message += `• 24h: ${price24hText} | 7d: ${price7dText}\n`;
    }
  } else {
    message += `• Price: Not Available\n`;
  }
  
  // Add other market data if available
  if (hasMarketCap) {
    message += `• Market Cap: $${formatNumber(tokenInfo.marketCap)}\n`;
  }
  
  if (hasVolume) {
    message += `• 24h Volume: $${formatNumber(tokenInfo.usdValueVolume24h)}\n`;
  }
  
  if (hasSupply) {
    message += `• Circulating Supply: ${formatNumber(tokenInfo.currentSupply)}\n`;
  }

  // Add holders data only if we have it
  if (holderCount > 0) {
    const displayHolderCount = parseInt(holderCount || 0);
    message += `• Holders: ${formatNumber(displayHolderCount)}\n`;

    // Add holder trend if available
    const holdersTrendText = formatHoldersTrend();
    if (holdersTrendText !== "N/A") {
      message += `• Holder Trend: ${holdersTrendText}\n`;
    }
  }

  message += `• Verified: ${tokenInfo.verified ? "✅ Yes" : "❌ No"}\n`;

  // Add whale distribution section if top holders data is available
  if (hasTopHolders) {
    message += `\n🐋 *Whale Distribution*\n`;
    message += `• Top 5 hold: ${topHolderConcentration.toFixed(2)}% of supply\n`;
    
    // Determine whale concentration risk
    let whaleRisk = "";
    if (topHolderConcentration > 70) {
      whaleRisk = "VERY HIGH ⚠️";
    } else if (topHolderConcentration > 50) {
      whaleRisk = "HIGH ⚠️";
    } else if (topHolderConcentration > 30) {
      whaleRisk = "MODERATE ⚠️";
    } else if (topHolderConcentration > 15) {
      whaleRisk = "LOW ✅";
    } else {
      whaleRisk = "VERY LOW ✅";
    }
    
    message += `• Whale Risk: ${whaleRisk}\n`;
    
    // Display largest holder
    if (topHolders.length > 0) {
      const largestHolder = topHolders[0];
      const holderName = largestHolder.ownerName || "Unknown Wallet";
      const holderPercentage = parseFloat(
        largestHolder.percentageOfSupplyHeld
      ).toFixed(2);
      
      if (holderName === "Unknown Wallet") {
        // If unknown wallet, show full address that can be copied
        const address = largestHolder.ownerAddress;
        message += `• Largest Holder: \`${address}\` (${holderPercentage}%)\n`;
      } else {
        // If known wallet, just show the name
        message += `• Largest Holder: ${holderName} (${holderPercentage}%)\n`;
      }
    }
  } else if (hasPrice || hasMarketCap) {
    // If we have market data but no whale data, add a note about it
    message += `\n🐋 *Whale Data*\n`;
    message += `• Top holder data not yet available for this token\n`;
    message += `• Use /whale command to check for recent large transfers\n`;
  }

  // Add Whale Watch section
  message += `\n📡 *Whale Watch:*\n• Use [/whale ${tokenInfo.mintAddress}] to see recent whale activity for this token.\n`;

  // Add analytics link
  message += `\n📈 *Full Analytics:*\n[View full chart on AlphaVybe 🔗](https://alpha.vybenetwork.com/tokens/${tokenInfo.mintAddress})`;

  // Add note about limited data if we're missing key metrics
  if (!hasPrice || !hasMarketCap || !hasTopHolders) {
    message += `\n\nℹ️ *Note:* Some data may be limited for newer or less tracked tokens.`;
  }

  return message;
}

module.exports = {
  handleTokenCommand,
  handleTokenInput,
};
