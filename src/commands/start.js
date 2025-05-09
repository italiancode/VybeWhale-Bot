const logger = require("../utils/logger");
const { getAlertStatus } = require("./config");

async function handler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const alertStatus = await getAlertStatus(chatId);

    const welcomeMessage = `
👋 *Welcome to VybeWhale Bot!*

Your real-time Solana on-chain analytics assistant for tracking:
• Token metrics and whale distribution
• Large whale activity
• Top holder concentration analysis
• Track wallet activity

*Quick Start:*
1. /token - Get detailed token analysis
2. /whale - View whale insights and activity
3. /trackwallet - Track any wallet (or use ⚡ Track buttons)
4. /config - View and manage your alert settings

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
