const Redis = require("redis");
const logger = require("../utils/logger");
const stateManager = require("../utils/stateManager");

class RedisClient {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.client = Redis.createClient({
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

      this.client.on("error", (err) => {
        logger.error("Redis Client Error:", err);
      });

      this.client.on("connect", () => {
        logger.info("Redis Client Connected");
      });

      await this.client.connect();
      this.isInitialized = true;
    } catch (error) {
      logger.error("Redis Initialization Error:", error);
      throw error;
    }
  }

  async quit() {
    if (this.client) {
      await this.client.quit();
      this.isInitialized = false;
    }
  }

  get isReady() {
    return this.client?.isReady || false;
  }
}

const redisClient = new RedisClient();

// Initialize Redis when the module loads
redisClient.initialize().catch((err) => {
  logger.error("Failed to initialize Redis:", err);
});

async function handleTrackWalletCommand(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if user has reached maximum wallet limit (e.g., 5 wallets per user)
    const userWallets =
      (await redisClient.client?.sMembers(`user:${userId}:wallets`)) || [];
    if (userWallets.length >= 5) {
      await bot.sendMessage(
        chatId,
        "❌ You have reached the maximum limit of 5 tracked wallets. Please remove some wallets using /untrackwallet before adding new ones."
      );
      return;
    }

    // Check if a wallet address was provided directly in the command
    const commandArgs = msg.text.split(" ");
    if (commandArgs.length > 1) {
      const walletAddress = commandArgs[1].trim();

      // Validate Solana wallet address
      if (walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        // Process the wallet address directly
        await processWalletTracking(bot, chatId, userId, walletAddress);
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
      command: "trackwallet",
      step: "awaiting_wallet",
      timestamp: Date.now(), // Add timestamp for potential timeout handling
    });

    const message =
      `🔍 *Wallet Tracking Setup*\n\n` +
      `Please enter the *Solana wallet address* you want to track.\n\n` +
      `Example Format:\n` +
      `\`5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1\`\n\n` +
      `_You can track up to 5 wallets._`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    logger.info(`Track wallet command initiated for user ${userId}`);
  } catch (error) {
    logger.error("Error in track wallet command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "Sorry, something went wrong. Please try again later."
    );
    stateManager.clearState(msg.from.id);
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

    // Check for state timeout (e.g., 5 minutes)
    if (Date.now() - userState.timestamp > 5 * 60 * 1000) {
      stateManager.clearState(userId);
      await bot.sendMessage(
        chatId,
        "⏰ Wallet tracking session timed out. Please start again with /trackwallet"
      );
      return;
    }

    const walletAddress = msg.text.trim();

    // Check if the input is a command
    if (walletAddress.startsWith("/")) {
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

    await processWalletTracking(bot, chatId, userId, walletAddress);

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

// Helper function to process wallet tracking (used by both command and input handlers)
async function processWalletTracking(bot, chatId, userId, walletAddress) {
  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, "typing");

    if (!redisClient.isReady) {
      await bot.sendMessage(
        chatId,
        "⚠️ Storage service is currently unavailable. Please try again later."
      );
      return;
    }

    // Check if wallet is already being tracked by this user
    const userWallets = await redisClient.client.sMembers(
      `user:${userId}:wallets`
    );
    if (userWallets.includes(walletAddress)) {
      await bot.sendMessage(chatId, "⚠️ You are already tracking this wallet.");
      return;
    }

    // Add wallet to tracked wallets and create user association
    await Promise.all([
      redisClient.client.sAdd("tracked_wallets", walletAddress),
      redisClient.client.sAdd(`user:${userId}:wallets`, walletAddress),
      redisClient.client.sAdd(
        `wallet:${walletAddress}:users`,
        userId.toString()
      ),
    ]);

    logger.info(`Wallet ${walletAddress} added to tracking for user ${userId}`);

    await bot.sendMessage(
      chatId,
      `✅ Wallet \`${walletAddress}\` is now being tracked!\n\nYou'll receive alerts when this wallet makes significant moves.\n\nUse /listwallets to see all tracked wallets.`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    logger.error(`Error processing wallet tracking: ${error.message}`, {
      error,
    });
    throw error;
  }
}

// Cleanup function to be called when shutting down the application
async function cleanup() {
  await redisClient.quit();
}

module.exports = {
  handleTrackWalletCommand,
  handleWalletInput,
  cleanup,
};
