const {
  getWhaleTransactions,
} = require("../services/vybeApi/whaleTransactions");
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
        await processWhaleTransactions(bot, chatId, userId, tokenAddress);
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
      await processWhaleTransactions(bot, chatId, userId, userState.lastToken);
      return;
    }

    // If no previous token, proceed with normal flow
    stateManager.setState(userId, {
      command: "whale",
      step: "awaiting_token",
    });

    const message =
      `🐋 *Whale Transaction Tracker*\n\n` +
      `Please enter the *Solana token address* to track large transactions.\n\n` +
      `🔹 *Example:* \`So11111111111111111111111111111111111111112\` _(SOL token)_\n\n` +
      `This will show recent large transactions for the specified token.`;

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

    await processWhaleTransactions(bot, chatId, userId, tokenAddress);
  } catch (error) {
    logger.error("Error processing whale input:", error);
    await bot.sendMessage(
      msg.chat.id,
      "⚠️ An unexpected error occurred. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

async function processWhaleTransactions(bot, chatId, userId, tokenAddress) {
  try {
    await bot.sendChatAction(chatId, "typing");
    await bot.sendMessage(
      chatId,
      "🔍 Fetching whale transactions... This may take a moment."
    );

    // Default threshold from environment variable or fallback
    const minUsdAmount = process.env.DEFAULT_WHALE_THRESHOLD || 10000;
    // Only fetch 3 whale transactions for Telegram
    const limit = 3;

    // Get token info for symbol and name
    const tokenInfo = await vybeApi
      .getTokenInfo(tokenAddress)
      .catch((error) => {
        logger.error("Error fetching token info:", error);
        return { symbol: "Unknown", name: "Unknown Token" };
      });

    // Add a timeout to prevent long-running requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 15000);
    });

    // Use the specialized whaleTransactions module with a timeout
    const transactionsPromise = getWhaleTransactions(
      tokenAddress,
      minUsdAmount,
      limit
    );

    const transactions = await Promise.race([
      transactionsPromise,
      timeoutPromise,
    ]).catch((error) => {
      logger.error(`Whale transaction fetch error: ${error.message}`);
      return [];
    });

    logger.info(
      `Found ${
        transactions?.length || 0
      } whale transactions for ${tokenAddress}`
    );

    if (!transactions || transactions.length === 0) {
      // No transactions found, provide a link to view on the website
      await bot.sendMessage(
        chatId,
        `No recent whale transactions found for ${
          tokenInfo.symbol || "this token"
        } with minimum amount of $${Number(
          minUsdAmount
        ).toLocaleString()}.\n\n` +
          `📊 [View All Transactions on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress})`,
        { parse_mode: "Markdown" }
      );
      stateManager.clearState(userId);
      return;
    }

    // Format the transactions for display
    const formattedMessage = formatWhaleTransactions(
      transactions,
      tokenInfo,
      minUsdAmount,
      tokenAddress
    );

    await bot.sendMessage(chatId, formattedMessage, { parse_mode: "Markdown" });
    logger.info(`Whale transactions provided for user ${userId}`);

    // Store the token for later use
    stateManager.setState(userId, {
      command: "token",
      lastToken: tokenAddress,
      lastTokenSymbol: tokenInfo.symbol || "Unknown Token",
    });
  } catch (error) {
    logger.error("Error in processWhaleTransactions:", error.message);

    let errorMessage = "⚠️ Error fetching whale transactions. ";

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
        `📊 [View All Transactions on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress})`,
      { parse_mode: "Markdown" }
    );
    stateManager.clearState(userId);
  }
}

function formatWhaleTransactions(
  transactions,
  tokenInfo,
  minUsdAmount,
  tokenAddress
) {
  const tokenSymbol = tokenInfo.symbol || "Unknown";
  const tokenName = tokenInfo.name || "Unknown Token";

  // Enhanced title with whale emoji and more professional crypto style
  let message = `🐋 *${tokenSymbol} WHALE ALERT* 🐋\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  transactions.forEach((tx) => {
    // Determine what happened in plain language
    const direction =
      tx.transactionType ||
      tx.type ||
      tx.side ||
      (tx.senderAddress && tx.receiverAddress ? "TRANSFER" : "TRADE");

    const directionText = direction.toUpperCase();

    // Ultra-simple dollar amount formatting - only whole dollars, no cents
    let usdValue = 0;
    if (tx.valueUsd) {
      usdValue = parseFloat(tx.valueUsd);
    } else if (tx.usdAmount) {
      usdValue = parseFloat(tx.usdAmount);
    }
    
    // Format as integer with commas
    const usdAmount = usdValue ? Math.round(usdValue).toLocaleString() : "Unknown";

    // Extract raw token amount
    let tokenAmount = "Unknown";
    if (tx.calculatedAmount) {
      tokenAmount = tx.calculatedAmount;
    } else if (tx.tokenAmount) {
      tokenAmount = tx.tokenAmount;
    } else if (tx.amount && tx.decimal) {
      tokenAmount = Number(tx.amount) / Math.pow(10, tx.decimal);
    }

    // Ultra-simple token formatting - guaranteed to remove trailing zeros
    let formattedTokenAmount;
    if (typeof tokenAmount === "number" || !isNaN(parseFloat(tokenAmount))) {
      // Convert to a number if it's a string
      const numAmount = typeof tokenAmount === "number" ? tokenAmount : parseFloat(tokenAmount);
      
      // Extremely small numbers (use scientific notation)
      if (numAmount > 0 && numAmount < 0.001) {
        formattedTokenAmount = numAmount.toPrecision(3);
      }
      // Whole numbers - no decimal places
      else if (Number.isInteger(numAmount) || Math.round(numAmount) === numAmount) {
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
          maximumFractionDigits: 2
        });
      }
    } else {
      formattedTokenAmount = tokenAmount;
    }

    // Improved transaction descriptions with more crypto-friendly language
    let actionDescription = "";
    if (directionText.includes("BUY")) {
      actionDescription = `Whale accumulated ${formattedTokenAmount} ${tokenSymbol} ($${usdAmount})`;
    } else if (directionText.includes("SELL")) {
      actionDescription = `Whale dumped ${formattedTokenAmount} ${tokenSymbol} ($${usdAmount})`;
    } else if (directionText.includes("TRANSFER")) {
      actionDescription = `Whale moved ${formattedTokenAmount} ${tokenSymbol} ($${usdAmount})`;
    } else if (directionText.includes("SWAP")) {
      actionDescription = `Whale swapped ${formattedTokenAmount} ${tokenSymbol} ($${usdAmount})`;
    } else {
      actionDescription = `${formattedTokenAmount} ${tokenSymbol} ($${usdAmount}) major position change`;
    }

    // Format addresses for wallet information
    const fromAddress = tx.senderAddress || tx.fromAddress || tx.maker;
    const toAddress = tx.receiverAddress || tx.toAddress || tx.taker;

    let walletInfo = "";
    if (fromAddress && toAddress) {
      const shortFrom = `${fromAddress.substring(
        0,
        4
      )}...${fromAddress.substring(fromAddress.length - 4)}`;
      const shortTo = `${toAddress.substring(0, 4)}...${toAddress.substring(
        toAddress.length - 4
      )}`;

      // Add wallet info for transfers as requested
      if (directionText.includes("TRANSFER")) {
        walletInfo = `📤 From: \`${shortFrom}\`\n📥 To: \`${shortTo}\``;
      }
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

    // Enhanced emoji indicators for different transaction types
    let emoji = "🔔"; // Default
    if (directionText.includes("BUY")) {
      emoji = "🟢"; // Green for buy
    } else if (directionText.includes("SELL")) {
      emoji = "🔴"; // Red for sell
    } else if (directionText.includes("TRANSFER")) {
      emoji = "➡️"; // Arrow for transfer
    } else if (directionText.includes("SWAP")) {
      emoji = "🔄"; // Arrows for swap
    }

    // Build a more professional message with better spacing and formatting
    message += `${emoji} *${actionDescription}*\n`;

    // Add wallet information for transfers as requested
    if (walletInfo) {
      message += `${walletInfo}\n`;
    }

    // Add when it happened with better formatting
    message += `⏰ *Time:* ${date}\n`;

    // Add where it happened if available
    const venue = tx.marketplaceName || tx.dex || "";
    if (venue) {
      message += `📍 *Venue:* ${venue}\n`;
    }

    message += `\n`;
  });

  // More professional footer with call-to-action
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔍 *Track ${tokenSymbol} on Vybe:*\n`;
  message += `[View Full Activity + Charts](https://alpha.vybenetwork.com/tokens/${tokenAddress})`;

  return message;
}

module.exports = {
  handleWhaleCommand,
  handleWhaleInput,
};
