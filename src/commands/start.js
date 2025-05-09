const logger = require("../utils/logger");
const { getAlertStatus } = require("./config");

async function handler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const alertStatus = await getAlertStatus(chatId);

    const welcomeMessage = `
👋 *Welcome to VybeWhale Bot!*

I help you track Solana tokens and wallets with real-time alerts for:
• Token price and market data
• Whale transactions
• Wallet activity and holdings

*Quick Start:*
1. Use /token to analyze any Solana token
2. Use /whale - View whale transactions
3. Use /trackwallet to monitor wallets
4. Enable alerts with /enablealerts whale or wallet

${
  alertStatus
    ? `
*Your Alert Settings:*
• Status: ${alertStatus.enabled ? "✅ Enabled" : "❌ Disabled"}
• Types: ${alertStatus.types.length ? alertStatus.types.join(", ") : "None"}
• Threshold: ${
        alertStatus.threshold
          ? "$" + alertStatus.threshold.toLocaleString()
          : "Not set"
      }
`
    : ""
}

Use /help to see all available commands.`;

    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });
    logger.info(`Start command executed for chat ${chatId}`);
  } catch (error) {
    logger.error("Error in start command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "Sorry, something went wrong. Please try again later."
    );
  }
}

module.exports = {
  handler,
};
