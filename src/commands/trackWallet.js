const Redis = require("redis");
const logger = require("../utils/logger");
const stateManager = require("../utils/stateManager");

let redis;
try {
  redis = Redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error("Redis connection failed after 10 retries");
          return false;
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redis.on("error", (err) => {
    logger.error("Redis Client Error:", err);
  });

  redis.connect().catch((err) => {
    logger.error("Redis Connection Error:", err);
  });
} catch (error) {
  logger.error("Redis Initialization Error:", error);
}

async function handleTrackWalletCommand(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Set initial state for wallet input
    stateManager.setState(userId, {
      command: "trackwallet",
      step: "awaiting_wallet",
    });

    const message =
      `Please enter the Solana wallet address you want to track.\n\n` +
      `Example: 5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1\n\n` +
      `You can find wallet addresses on:\n` +
      `• Solscan\n` +
      `• Solana Explorer\n` +
      `• Your wallet app`;

    await bot.sendMessage(chatId, message);
    logger.info(`Track wallet command initiated for user ${userId}`);
  } catch (error) {
    logger.error("Error in track wallet command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "Sorry, something went wrong. Please try again later."
    );
  }
}

async function handleWalletInput(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = stateManager.getState(userId);

    if (!userState || userState.command !== "trackwallet") {
      return;
    }

    const walletAddress = msg.text.trim();
    
    // Check if the input is a command
    if (walletAddress.startsWith('/')) {
      // Clear the current state and let the main message handler process the command
      stateManager.clearState(userId);
      return;
    }
    
    // Validate Solana wallet address format (base58 encoded, typically 32-44 characters)
    if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      await bot.sendMessage(
        chatId,
        "❌ Invalid Solana wallet address format. Please enter a valid Solana wallet address."
      );
      return;
    }

    // Show typing indicator
    await bot.sendChatAction(chatId, 'typing');

    if (!redis?.isReady) {
      await bot.sendMessage(
        chatId,
        "⚠️ Storage service is currently unavailable. Wallet tracking will not persist after restart."
      );
    } else {
      // Add wallet to tracked wallets
      await redis.sAdd("tracked_wallets", walletAddress);
      logger.info(`Wallet ${walletAddress} added to tracking for user ${userId}`);
    }

    await bot.sendMessage(
      chatId,
      `✅ Wallet ${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)} is now being tracked.\n\nUse /listwallets to see all tracked wallets.`
    );

    // Clear user state
    stateManager.clearState(userId);
  } catch (error) {
    logger.error("Error processing wallet input:", error);
    await bot.sendMessage(
      msg.chat.id,
      "❌ Error tracking wallet. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

module.exports = {
  handleTrackWalletCommand,
  handleWalletInput,
};
