const {
  getWhaleTransactions,
} = require("../services/vybeApi/whaleTransactions");
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
      `Note: Whale tracking is only available for established tokens with significant trading volume.\n\n` +
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
      "🔍 Analyzing token whale data for strategic insights...\n\n This may take a moment."
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

    logger.info(
      `Fetching whale transactions for token ${tokenAddress} (${
        tokenInfo.symbol || "Unknown"
      })`
    );

    // Add a timeout to prevent long-running requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 15000);
    });

    // Use the specialized getWhaleTransactions from the whaleTransactions module
    const transactionsPromise = getWhaleTransactions(
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

    // Race the transaction fetch against a timeout
    const [transactions, topHolders] = await Promise.all([
      Promise.race([transactionsPromise, timeoutPromise]).catch((error) => {
        logger.error(`Whale transaction fetch error: ${error.message}`);
        return [];
      }),
      Promise.race([topHoldersPromise, timeoutPromise]).catch((error) => {
        logger.error(`Top holders fetch error: ${error.message}`);
        return [];
      }),
    ]);

    logger.info(
      `Found ${transactions?.length || 0} whale transactions and ${
        topHolders?.length || 0
      } top holders for ${tokenAddress}`
    );

    if ((!transactions || transactions.length === 0) && (!topHolders || topHolders.length === 0)) {
      // No transactions or top holders found, provide more helpful message
      const tokenSymbol = tokenInfo.symbol || "this token";
      const message =
        `ℹ️ *No whale data available*\n\n` +
        `No recent whale transactions or top holder data found for *${tokenSymbol}* with minimum amount of $${Number(
          minUsdAmount
        ).toLocaleString()}.\n\n` +
        `This could be because:\n` +
        `• The token is new or has low trading volume\n` +
        `• No recent transactions exceed the minimum value\n` +
        `• This token is not yet tracked by Vybe Network\n\n` +
        `📊 [View Token on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress}) for all available data`;

      await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      stateManager.clearState(userId);
      return;
    }

    // Format the transactions and top holders for display
    const formattedMessage = formatWhaleTransactions(
      transactions,
      topHolders,
      tokenInfo,
      minUsdAmount,
      tokenAddress
    );

    await bot.sendMessage(chatId, formattedMessage, { parse_mode: "Markdown" });
    logger.info(`Whale transactions and holder data provided for user ${userId}`);

    // Store the token for later use
    stateManager.setState(userId, {
      command: "token",
      lastToken: tokenAddress,
      lastTokenSymbol: tokenInfo.symbol || "Unknown Token",
    });
  } catch (error) {
    logger.error("Error in processWhaleTransactions:", error.message);

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
        `📊 [View All Transactions on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress})`,
      { parse_mode: "Markdown" }
    );
    stateManager.clearState(userId);
  }
}

function formatWhaleTransactions(
  transactions,
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
    topHolders.forEach(holder => {
      if (holder.percentageOfSupplyHeld) {
        totalPercentage += parseFloat(holder.percentageOfSupplyHeld);
      }
    });
    
    message += `🔍 *Top 5 holders control: ${totalPercentage.toFixed(2)}% of supply*\n\n`;
    
    topHolders.forEach((holder, index) => {
      // Format wallet name/address
      const walletName = holder.ownerName || "Unknown Wallet";
      const shortAddress = `${holder.ownerAddress.substring(0, 4)}...${holder.ownerAddress.substring(holder.ownerAddress.length - 4)}`;
      
      // Format USD value
      const usdValue = parseFloat(holder.valueUsd);
      const formattedUsdValue = Math.round(usdValue).toLocaleString();
      
      // Format percentage
      const percentage = parseFloat(holder.percentageOfSupplyHeld).toFixed(2);
      
      // Add track wallet button using + symbol
      const trackCmd = `/trackwallet ${holder.ownerAddress}`;
      
      message += `${index + 1}. *${walletName}* (\`${shortAddress}\`) [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(trackCmd)})\n`;
      message += `   💵 $${formattedUsdValue} (${percentage}% of supply)\n`;
      
      // Only add a new line between entries, not after the last one
      if (index < topHolders.length - 1) {
        message += `\n`;
      }
    });
    
    // Add separator if we also have transactions to display
    if (transactions && transactions.length > 0) {
      message += `\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }
  }

  // Then add recent whale transactions if available
  if (transactions && transactions.length > 0) {
    message += `*🔥 RECENT WHALE TRANSACTIONS*\n\n`;

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

      // Ultra-simple token formatting - guaranteed to remove trailing zeros
      let formattedTokenAmount;
      if (typeof tokenAmount === "number" || !isNaN(parseFloat(tokenAmount))) {
        // Convert to a number if it's a string
        const numAmount =
          typeof tokenAmount === "number" ? tokenAmount : parseFloat(tokenAmount);

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

        // Add wallet info for transfers as requested, with track buttons
        if (directionText.includes("TRANSFER")) {
          const fromTrackCmd = `/trackwallet ${fromAddress}`;
          const toTrackCmd = `/trackwallet ${toAddress}`;
          
          walletInfo = `📤 From: \`${shortFrom}\` [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(fromTrackCmd)})\n📥 To: \`${shortTo}\` [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(toTrackCmd)})`;
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
      } else if (fromAddress) {
        // For non-transfers, add the main whale wallet with a track button
        const walletToShow = fromAddress;
        const shortWallet = `${walletToShow.substring(0, 4)}...${walletToShow.substring(walletToShow.length - 4)}`;
        const trackCmd = `/trackwallet ${walletToShow}`;
        
        message += `👤 Wallet: \`${shortWallet}\` [⚡ Track](https://t.me/share/url?url=${encodeURIComponent(trackCmd)})\n`;
      }

      // Add when it happened with better formatting
      message += `⏰ *Time:* ${date}\n`;

      // Add where it happened if available
      const venue = tx.marketplaceName || tx.dex || "";
      if (venue) {
        message += `📍 *Venue:* ${venue}\n`;
      }

      // Add Solscan verification link if signature is available
      if (tx.signature) {
        message += `🔍 [Verify on Solscan](solscan.io/tx/${tx.signature})\n`;
      }

      message += `\n`;
    });
  }

  // Add insights about potential impact from whales
  if (topHolders && topHolders.length > 0) {
    message += `*🧠 WHALE INSIGHTS*\n\n`;
    
    // Calculate concentration metrics
    const topHolderPercentage = parseFloat(topHolders[0].percentageOfSupplyHeld);
    let top5Percentage = 0;
    topHolders.slice(0, Math.min(5, topHolders.length)).forEach(holder => {
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
    
    message += `🦈 *Whale Concentration Risk:* ${whaleRisk}\n`;
    message += `🔝 *Largest Holder:* ${topHolderPercentage.toFixed(2)}% of supply\n`;
    message += `👥 *Top 5 Holders:* ${top5Percentage.toFixed(2)}% of supply\n\n`;
    
    // Add contextual note on the impact
    if (top5Percentage > 50) {
      message += `⚠️ *Note:* High concentration means potential for large price swings if top holders decide to sell.\n`;
    } else if (top5Percentage < 15) {
      message += `✅ *Note:* Well-distributed token with lower risk of whale manipulation.\n`;
    } else {
      message += `⚠️ *Note:* Watch these wallets for potential market-moving transactions.\n`;
    }
  }

  // Footer with helpful resources and explanation about the + buttons
  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `ℹ️ *Click the ⚡ Track buttons to track any wallet.*\n\n`;
  message += `📊 [View Full Activity on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress})\n`;
  // message += `🔔 Use /token ${tokenAddress} for detailed metrics\n`;

  return message;
}

module.exports = {
  handleWhaleCommand,
  handleWhaleInput,
};
