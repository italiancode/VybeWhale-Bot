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
    const tokenInfo = await vybeApi.getTokenInfo(tokenAddress)
      .catch(error => {
        logger.error("Error fetching token info:", error);
        return { symbol: "Unknown", name: "Unknown Token" };
      });

    // Use the specialized method for bot whale transactions
    const transactions = await vybeApi.getBotWhaleTransactions(
      tokenAddress,
      minUsdAmount,
      limit
    );

    if (!transactions || transactions.length === 0) {
      // No transactions found, provide a link to view on the website
      await bot.sendMessage(
        chatId,
        `No recent whale transactions found for ${tokenInfo.symbol || "this token"} with minimum amount of $${Number(minUsdAmount).toLocaleString()}.\n\n` +
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
    logger.error("Error fetching whale transactions:", error);
    const errorMessage = error.response?.data?.message || error.message;
    
    await bot.sendMessage(
      chatId,
      `⚠️ Error fetching whale transactions. The API might be experiencing high load.\n\n` + 
      `📊 [View All Transactions on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress})`,
      { parse_mode: "Markdown" }
    );
    stateManager.clearState(userId);
  }
}

function formatWhaleTransactions(transactions, tokenInfo, minUsdAmount, tokenAddress) {
  const tokenSymbol = tokenInfo.symbol || "Unknown";
  const tokenName = tokenInfo.name || "Unknown Token";

  let message = `🐋 *Whale Transactions for ${tokenSymbol}* (${tokenName})\n`;
  message += `💰 Minimum amount: $${Number(minUsdAmount).toLocaleString()}\n\n`;

  transactions.forEach((tx, index) => {
    // Format date
    const date = tx.blockTime 
      ? new Date(tx.blockTime * 1000).toLocaleString() 
      : new Date().toLocaleString();
    
    // Format amounts
    const usdAmount = tx.usdAmount 
      ? `$${Number(tx.usdAmount).toLocaleString()}` 
      : "Unknown";
    
    const tokenAmount = tx.tokenAmount 
      ? Number(tx.tokenAmount).toLocaleString() 
      : "Unknown";
    
    // Determine transaction type
    const direction = tx.type || tx.tokenTransferType || "TRANSFER";
    let directionEmoji = "↔️";
    if (direction.toUpperCase() === "BUY") directionEmoji = "🟢";
    if (direction.toUpperCase() === "SELL") directionEmoji = "🔴";
    
    // Format addresses
    const fromAddress = tx.fromAddress || tx.senderAddress || "Unknown";
    const toAddress = tx.toAddress || tx.receiverAddress || "Unknown";
    
    const shortFromAddress = fromAddress !== "Unknown"
      ? `${fromAddress.substring(0, 4)}...${fromAddress.substring(fromAddress.length - 4)}`
      : "Unknown";
    
    const shortToAddress = toAddress !== "Unknown"
      ? `${toAddress.substring(0, 4)}...${toAddress.substring(toAddress.length - 4)}`
      : "Unknown";
    
    message += `${index + 1}. ${directionEmoji} *${direction.toUpperCase()}* - ${usdAmount}\n`;
    message += `   🔢 ${tokenAmount} ${tokenSymbol}\n`;
    message += `   👤 From: \`${shortFromAddress}\` To: \`${shortToAddress}\`\n`;
    message += `   🕒 ${date}\n`;
    
    // Add transaction explorer link if available
    if (tx.txId || tx.signature) {
      const txId = tx.txId || tx.signature;
      message += `   🔍 [View Transaction](https://solscan.io/tx/${txId})\n`;
    }
    
    message += "\n";
  });

  // Add link to view all transactions on Vybe Network
  message += `📊 [View All Transactions on Vybe Network](https://alpha.vybenetwork.com/tokens/${tokenAddress})\n\n`;
  message += `Data provided by Vybe API`;
  
  return message;
}

module.exports = {
  handleWhaleCommand,
  handleWhaleInput,
};
