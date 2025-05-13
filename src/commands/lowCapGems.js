const logger = require('../utils/logger');
const stateManager = require('../utils/stateManager');
const { findLowCapGems, formatLowCapGemsMessage } = require('../services/vybeApi/lowCapGems');

/**
 * Handle the lowcap command to analyze wallet for low cap gems
 */
async function handleLowCapCommand(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if a wallet address was provided directly in the command
    const commandArgs = msg.text.split(' ');
    if (commandArgs.length > 1) {
      const walletAddress = commandArgs[1].trim();
      
      // Validate Solana wallet address
      if (walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        // Process the wallet address directly
        await analyzeLowCapGems(bot, chatId, walletAddress, userId);
        return;
      } else {
        await bot.sendMessage(
          chatId,
          "❌ Invalid Solana wallet address format. Please enter a valid Solana wallet address."
        );
        return;
      }
    }

    // Set initial state for wallet input
    stateManager.setState(userId, {
      command: "lowcap",
      step: "awaiting_wallet",
      timestamp: Date.now(),
    });

    const message =
      `🔍 *Low Cap Gem Finder*\n\n` +
      `Please enter the *Solana wallet address* you want to analyze for low cap gems (< $10M market cap).\n\n` +
      `Example Format:\n` +
      `\`5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1\`\n\n` +
      `_Low cap gems often provide higher growth potential but come with increased risk._`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    logger.info(`Low cap gems command initiated for user ${userId}`);
  } catch (error) {
    logger.error("Error in low cap gems command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "Sorry, something went wrong. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

/**
 * Handle wallet input for low cap gem analysis
 */
async function handleLowCapInput(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = stateManager.getState(userId);

    if (!userState || userState.command !== "lowcap") {
      return;
    }

    // Check for state timeout (e.g., 5 minutes)
    if (Date.now() - userState.timestamp > 5 * 60 * 1000) {
      stateManager.clearState(userId);
      await bot.sendMessage(
        chatId,
        "⏰ Low cap gem finder session timed out. Please start again with /lowcap"
      );
      return;
    }

    const walletAddress = msg.text.trim();

    // Check if the input is a command
    if (walletAddress.startsWith("/")) {
      stateManager.clearState(userId);
      return;
    }

    // Validate Solana wallet address format
    if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      await bot.sendMessage(
        chatId,
        "❌ Invalid Solana wallet address format. Please enter a valid Solana wallet address."
      );
      return;
    }

    await analyzeLowCapGems(bot, chatId, walletAddress, userId);
    
    // Clear user state
    stateManager.clearState(userId);
  } catch (error) {
    logger.error("Error processing low cap gems input:", error);
    await bot.sendMessage(
      msg.chat.id,
      "❌ Error analyzing wallet. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

/**
 * Process and display low cap gems for a wallet address
 */
async function analyzeLowCapGems(bot, chatId, walletAddress, userId) {
  try {
    // If userId was not provided, extract it from the message
    if (!userId) {
      userId = chatId; // Default to chatId if no specific userId was provided
    }

    // Show typing indicator while fetching data
    await bot.sendChatAction(chatId, "typing");

    logger.info(`Analyzing low cap gems for wallet ${walletAddress}`);
    
    // Send a processing message first
    const processingMsg = await bot.sendMessage(
      chatId,
      `🔍 Analyzing wallet \`${walletAddress}\` for low cap gems...\n\nThis may take a moment.`,
      { parse_mode: "Markdown" }
    );
    
    // Find low cap gems in the wallet
    const gems = await findLowCapGems(walletAddress);
    
    // Format the message
    const message = formatLowCapGemsMessage(walletAddress, gems);
    
    // Check if the user is already tracking this wallet
    const redisManager = require('../utils/redis');
    const redisClient = redisManager.getClient();
    
    let isFollowing = false;
    let hasGemAlerts = false;
    
    if (redisClient?.isReady) {
      isFollowing = await redisClient.sIsMember(`user:${userId}:wallets`, walletAddress);
      hasGemAlerts = await redisClient.sIsMember(`wallet:${walletAddress}:gem_users`, chatId.toString());
    }
    
    // Create inline keyboard based on tracking status
    const keyboard = [];
    
    // First button - Track wallet if not already tracking
    if (!isFollowing) {
      keyboard.push({ text: "📋 Track Wallet", callback_data: `track_wallet:${walletAddress}` });
    }
    
    // Second button - Track gem alerts if following but not already tracking gems
    if (isFollowing && !hasGemAlerts) {
      keyboard.push({ text: "💎 Track Gem Alerts", callback_data: `track_gems:${walletAddress}` });
    }
    
    // Only add the keyboard if there are buttons to show
    const inlineKeyboard = keyboard.length > 0 ? 
      { inline_keyboard: [keyboard] } : 
      undefined;
    
    // Edit the processing message with results
    await bot.editMessageText(message.text, {
      chat_id: chatId,
      message_id: processingMsg.message_id,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: inlineKeyboard
    });
    
    logger.info(`Sent low cap gems analysis for ${walletAddress} to chat ${chatId}`);
  } catch (error) {
    logger.error(`Error analyzing low cap gems: ${error.message}`, { error });
    await bot.sendMessage(
      chatId,
      "❌ Error analyzing wallet for low cap gems. Please try again later."
    );
  }
}

module.exports = {
  handleLowCapCommand,
  handleLowCapInput,
  analyzeLowCapGems
}; 