const logger = require("../utils/logger");
const stateManager = require("../utils/stateManager");
const vybeApi = require("../services/vybeApi");

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

    const tokenInfo = await vybeApi.getTokenInfo(tokenInput);

    const [topHolders, transferVolume] = await Promise.all([
      vybeApi.getTokenTopHolders(tokenInput).catch(() => null),
      vybeApi
        .getTokenTransferVolume(tokenInput, Date.now() - 86400000, Date.now())
        .catch(() => null),
    ]);

    const response = formatTokenInfo(
      tokenInfo,
      topHolders,
      transferVolume,
      bot
    );
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

function formatTokenInfo(tokenInfo, topHolders, transferVolume, bot) {
  const formatNumber = (num) => {
    if (!num && num !== 0) return "N/A";
    
    // For very precise small numbers (like some token prices)
    if (num < 0.000001) {
      return num.toExponential(6);
    }
    
    // For numbers less than 1 but greater than 0.000001
    if (num < 1) {
      const decimals = Math.max(8, -Math.floor(Math.log10(num)));
      return num.toFixed(decimals);
    }

    // For trillions
    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}T`;
    }

    // For billions
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}B`;
    }
    
    // For millions
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}M`;
    }
    
    // For thousands
    if (num >= 1_000) {
      return `${(num / 1_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}K`;
    }
    
    // For numbers between 1 and 999
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  message += `\n📡 *Whale Watch:*\nUse [/whale ${tokenInfo.mintAddress}] to see recent whale activity for this token.\n`;

  message += `\n📈 *Full Analytics:*\n[View full chart on AlphaVybe 🔗](https://alpha.vybenetwork.com/tokens/${tokenInfo.mintAddress})`;

  return message;
}

module.exports = {
  handleTokenCommand,
  handleTokenInput,
};
