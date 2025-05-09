const { getWhaleTransfers } = require("../services/vybeApi/whaleTransfers");
const { getTopTokenHolders } = require("../services/vybeApi/topTokenHolder");
const vybeApi = require("../services/vybeApi");
const logger = require("../utils/logger");
const stateManager = require("../utils/stateManager");

async function handleWhaleCommand(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = stateManager.getState(userId);

    // Check for direct token address in command
    const commandArgs = msg.text.split(" ");
    if (commandArgs.length > 1) {
      const tokenAddress = commandArgs[1].trim();
      // Validate Solana address format
      if (tokenAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        await processWhaleTransfers(bot, chatId, userId, tokenAddress);
        return;
      } else {
        await bot.sendMessage(
          chatId,
          "❌ Invalid Solana token address format. Please enter a valid Solana token address."
        );
        return;
      }
    }

    // Check if we have a lastToken from previous token analysis
    if (userState?.lastToken) {
      logger.info(
        `Using last analyzed token ${userState.lastTokenSymbol} for whale tracking`
      );
      await processWhaleTransfers(bot, chatId, userId, userState.lastToken);
      return;
    }

    // If no previous token, proceed with normal flow
    stateManager.setState(userId, {
      command: "whale",
      step: "awaiting_token",
    });

    const message =
      `🐋 *Whale Transfer Tracker*\n\n` +
      `Please enter the *Solana token address* to track large transfers.\n\n` +
      `🔹 *Example:* \`So11111111111111111111111111111111111111112\` _(SOL token)_\n\n` +
      `Note: Whale tracking is only available for established tokens with significant trading volume.\n\n` +
      `This will show recent large transfers for the specified token.`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    logger.info(`Whale command initiated for user ${userId}`);
  } catch (error) {
    logger.error("Error in whale command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "⚠️ Sorry, something went wrong. Please try again later."
    );
  }
}

async function handleWhaleInput(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = stateManager.getState(userId);

    if (!userState || userState.command !== "whale") {
      return;
    }

    const tokenAddress = msg.text.trim();

    // Check if input is a new command
    if (tokenAddress.startsWith("/")) {
      stateManager.clearState(userId);
      return;
    }

    // Validate Solana address format
    if (!tokenAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      await bot.sendMessage(
        chatId,
        "❌ Invalid Solana token address format. Please enter a valid Solana token address."
      );
      return;
    }

    await processWhaleTransfers(bot, chatId, userId, tokenAddress);
  } catch (error) {
    logger.error("Error processing whale input:", error);
    await bot.sendMessage(
      msg.chat.id,
      "⚠️ An unexpected error occurred. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

async function processWhaleTransfers(bot, chatId, userId, tokenAddress) {
  try {
    await bot.sendChatAction(chatId, "typing");
    await bot.sendMessage(
      chatId,
      "🔍 Analyzing token whale data for strategic insights...\n\n This may take a moment."
    );

    // Default threshold from environment variable or fallback
    const minUsdAmount = process.env.DEFAULT_WHALE_THRESHOLD || 10000;
    // Only fetch 3 whale transfers for Telegram
    const limit = 3;

    // Get token info for symbol and name
    const tokenInfo = await vybeApi
      .getTokenInfo(tokenAddress)
      .catch((error) => {
        logger.error("Error fetching token info:", error);
        return { symbol: "Unknown", name: "Unknown Token" };
      });

    logger.info(
      `Fetching whale transfers for token ${tokenAddress} (${
        tokenInfo.symbol || "Unknown"
      })`
    );

    // Add a timeout to prevent long-running requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 15000);
    });

    // Use the specialized getWhaleTransfers from the whaleTransfers module
    const transfersPromise = getWhaleTransfers(
      tokenAddress,
      minUsdAmount,
      limit
    );

    // Also fetch top token holders
    const topHoldersPromise = getTopTokenHolders(tokenAddress, {
      page: 0,
      limit: 5,
      sortBy: "valueUsd",
      ascending: false,
    });

    // Race the transfer fetch against a timeout
    const [transfers, topHolders] = await Promise.all([
      Promise.race([transfersPromise, timeoutPromise]).catch((error) => {
        logger.error(`Whale transfer fetch error: ${error.message}`);
        return [];
      }),
      Promise.race([topHoldersPromise, timeoutPromise]).catch((error) => {
        logger.error(`Top holders fetch error: ${error.message}`);
        return [];
      }),
    ]);

    logger.info(
      `Found ${transfers?.length || 0} whale transfers and ${
        topHolders?.length || 0
      } top holders for ${tokenAddress}`
    );

    if (
      (!transfers || transfers.length === 0) &&
      (!topHolders || topHolders.length === 0)
    ) {
      // No transfers or top holders found, provide more helpful message
      const tokenSymbol = tokenInfo.symbol || "this token";
      const message =
        `ℹ️ *No whale data available*\n\n` +
        `No recent whale transfers or top holder data found for *${tokenSymbol}* with minimum amount of $${Number(
          minUsdAmount
        ).toLocaleString()}.\n\n` +
        `This could be because:\n` +
        `• The token is new or has low trading volume\n` +
        `• No recent transfers exceed the minimum value\n` +
        `• This token is not yet tracked by Vybe Network\n\n` +
        `📊 [View Token on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress}) for all available data`;

      await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      stateManager.clearState(userId);
      return;
    }

    // Format the transfers and top holders for display
    const formattedMessage = formatWhaleData(
      transfers,
      topHolders,
      tokenInfo,
      minUsdAmount,
      tokenAddress
    );

    await bot.sendMessage(chatId, formattedMessage, { parse_mode: "Markdown" });
    logger.info(`Whale transfers and holder data provided for user ${userId}`);

    // Store the token for later use
    stateManager.setState(userId, {
      command: "token",
      lastToken: tokenAddress,
      lastTokenSymbol: tokenInfo.symbol || "Unknown Token",
    });
  } catch (error) {
    logger.error("Error in processWhaleTransfers:", error.message);

    let errorMessage = "⚠️ Error fetching whale data. ";

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      errorMessage += "The request timed out. ";
    } else if (error.response?.status === 429) {
      errorMessage += "The API rate limit has been reached. ";
    } else if (error.response?.status >= 500) {
      errorMessage += "The API is currently experiencing issues. ";
    } else {
      errorMessage += "Please try again later. ";
    }

    await bot.sendMessage(
      chatId,
      `${errorMessage}\n\n` +
        `📊 [View All Transfers on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress})`,
      { parse_mode: "Markdown" }
    );
    stateManager.clearState(userId);
  }
}

function formatWhaleData(
  transfers,
  topHolders,
  tokenInfo,
  minUsdAmount,
  tokenAddress
) {
  const tokenSymbol = tokenInfo.symbol || "Unknown";
  const tokenName = tokenInfo.name || "Unknown Token";

  // Enhanced title with whale emoji and more professional crypto style
  let message = `🐋 *${tokenSymbol} WHALE ANALYSIS* [📊](https://alpha.vybenetwork.com/tokens/${tokenAddress})\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // First add the top holders information if available
  if (topHolders && topHolders.length > 0) {
    message += `*💰 TOP TOKEN HOLDERS (WHALES)*\n\n`;

    // Calculate total concentration of top 5 holders
    let totalPercentage = 0;
    topHolders.forEach((holder) => {
      if (holder.percentageOfSupplyHeld) {
        totalPercentage += parseFloat(holder.percentageOfSupplyHeld);
      }
    });

    message += `Top 5 control: *${totalPercentage.toFixed(2)}%* of supply\n\n`;

    topHolders.forEach((holder, index) => {
      // Format wallet name/address
      const walletName = holder.ownerName || "Unknown Wallet";
      const shortAddress = `${holder.ownerAddress.substring(
        0,
        4
      )}...${holder.ownerAddress.substring(holder.ownerAddress.length - 4)}`;

      // Format USD value
      const usdValue = parseFloat(holder.valueUsd);
      const formattedUsdValue = Math.round(usdValue).toLocaleString();

      // Format percentage
      const percentage = parseFloat(holder.percentageOfSupplyHeld).toFixed(2);

      // Add track wallet button using ⚡ symbol
      const trackCmd = `/trackwallet ${holder.ownerAddress}`;

      // Create more mobile-friendly display
      if (walletName === "Unknown Wallet") {
        // For unknown wallets, make the address copyable
        message += `${
          index + 1
        }. \`${shortAddress}\` [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(
          trackCmd
        )})\n`;
      } else {
        // For known wallets, display the name with the address
        message += `${
          index + 1
        }. *${walletName}*\n\`${shortAddress}\` [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(
          trackCmd
        )})\n`;
      }

      message += `$${formattedUsdValue} (${percentage}%)\n`;

      // Only add a new line between entries, not after the last one
      if (index < topHolders.length - 1) {
        message += `\n`;
      }
    });

    // Add separator if we also have transfers to display
    if (transfers && transfers.length > 0) {
      message += `\n━━━━━━━━━━━━━━━━\n\n`;
    }
  }

  // Then add recent whale transfers if available
  if (transfers && transfers.length > 0) {
    message += `*🔥 RECENT WHALE TRANSFERS*\n\n`;

    transfers.forEach((tx) => {
      // Dollar amount formatting
      let usdValue = 0;
      if (tx.valueUsd) {
        usdValue = parseFloat(tx.valueUsd);
      } else if (tx.usdAmount) {
        usdValue = parseFloat(tx.usdAmount);
      }

      // Format as integer with commas
      const usdAmount = usdValue
        ? Math.round(usdValue).toLocaleString()
        : "Unknown";

      // Extract raw token amount
      let tokenAmount = "Unknown";
      if (tx.calculatedAmount) {
        tokenAmount = tx.calculatedAmount;
      } else if (tx.tokenAmount) {
        tokenAmount = tx.tokenAmount;
      } else if (tx.amount && tx.decimal) {
        tokenAmount = Number(tx.amount) / Math.pow(10, tx.decimal);
      }

      // Token amount formatting
      let formattedTokenAmount;
      if (typeof tokenAmount === "number" || !isNaN(parseFloat(tokenAmount))) {
        // Convert to a number if it's a string
        const numAmount =
          typeof tokenAmount === "number"
            ? tokenAmount
            : parseFloat(tokenAmount);

        // Extremely small numbers (use scientific notation)
        if (numAmount > 0 && numAmount < 0.001) {
          formattedTokenAmount = numAmount.toPrecision(3);
        }
        // Whole numbers - no decimal places
        else if (
          Number.isInteger(numAmount) ||
          Math.round(numAmount) === numAmount
        ) {
          formattedTokenAmount = Math.round(numAmount).toLocaleString();
        }
        // Numbers that look like integers with many trailing zeros
        else if (numAmount >= 1000) {
          formattedTokenAmount = Math.round(numAmount).toLocaleString();
        }
        // For other numbers, simplify to at most 2 decimal places
        else {
          formattedTokenAmount = numAmount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          });
        }
      } else {
        formattedTokenAmount = tokenAmount;
      }

      // Build a more mobile-friendly layout for transfers only
      message += `➡️ *Whale transferred ${formattedTokenAmount} ${tokenSymbol}*\n`;
      message += `💵 $${usdAmount}\n`;

      // Format addresses for wallet information
      const fromAddress = tx.senderAddress || tx.fromAddress || tx.maker;
      const toAddress = tx.receiverAddress || tx.toAddress || tx.taker;

      if (fromAddress && toAddress) {
        const shortFrom = `${fromAddress.substring(
          0,
          4
        )}...${fromAddress.substring(fromAddress.length - 4)}`;
        const shortTo = `${toAddress.substring(0, 4)}...${toAddress.substring(
          toAddress.length - 4
        )}`;
        const fromTrackCmd = `/trackwallet ${fromAddress}`;
        const toTrackCmd = `/trackwallet ${toAddress}`;

        message += `📤 From: \`${shortFrom}\` [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(
          fromTrackCmd
        )})\n`;
        message += `📥 To: \`${shortTo}\` [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(
          toTrackCmd
        )})\n`;
      }

      // Format date in simple terms
      const date = tx.blockTime
        ? new Date(tx.blockTime * 1000).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

      message += `⏰ ${date}\n`;

      // Add Solscan verification link if signature is available (using shorter text)
      if (tx.signature) {
        message += `[🔍 Verify](solscan.io/tx/${tx.signature})\n`;
      }

      message += `\n`;
    });
  }

  // Add insights about potential impact from whales in a mobile-friendly way
  if (topHolders && topHolders.length > 0) {
    message += `*🧠 INSIGHTS*\n\n`;

    // Calculate concentration metrics
    const topHolderPercentage = parseFloat(
      topHolders[0].percentageOfSupplyHeld
    );
    let top5Percentage = 0;
    topHolders.slice(0, Math.min(5, topHolders.length)).forEach((holder) => {
      top5Percentage += parseFloat(holder.percentageOfSupplyHeld || 0);
    });

    // Provide risk assessment based on concentration
    let whaleRisk;
    if (top5Percentage > 70) {
      whaleRisk = "VERY HIGH";
    } else if (top5Percentage > 50) {
      whaleRisk = "HIGH";
    } else if (top5Percentage > 30) {
      whaleRisk = "MODERATE";
    } else if (top5Percentage > 15) {
      whaleRisk = "LOW";
    } else {
      whaleRisk = "VERY LOW";
    }

    message += `*Risk:* ${whaleRisk}\n`;

    // Add the largest holder info with copyable address if it's unknown
    const largestHolder = topHolders[0];
    if (
      largestHolder.ownerName === "Unknown Wallet" ||
      !largestHolder.ownerName
    ) {
      const address = largestHolder.ownerAddress;
      const shortAddr = `${address.substring(0, 6)}...${address.substring(
        address.length - 4
      )}`;
      const trackCmd = `/trackwallet ${address}`;
      message += `*Largest:* \`${shortAddr}\` (${topHolderPercentage.toFixed(
        2
      )}%) [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(
        trackCmd
      )})\n`;
    } else {
      message += `*Largest:* ${
        largestHolder.ownerName
      } (${topHolderPercentage.toFixed(2)}%)\n`;
    }

    message += `*Top 5:* ${top5Percentage.toFixed(2)}% of supply\n\n`;

    // Add contextual note on the impact (simplified)
    if (top5Percentage > 50) {
      message += `⚠️ High concentration risk - price volatility likely\n`;
    } else if (top5Percentage < 15) {
      message += `✅ Well-distributed token - lower manipulation risk\n`;
    } else {
      message += `⚠️ Monitor these wallets for market-moving activity\n`;
    }
  }

  // Footer with helpful resources and explanation about the ⚡ buttons
  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `ℹ️ *Click the ⚡ Track buttons to track any wallet.*\n\n`;
  message += `📊 [View Full Activity on AlphaVybe](https://alpha.vybenetwork.com/tokens/${tokenAddress})\n`;

  return message;
}

module.exports = {
  handleWhaleCommand,
  handleWhaleInput,
};
