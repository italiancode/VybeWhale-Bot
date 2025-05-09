const logger = require("../utils/logger");
const { getAlertStatus } = require("./config");

async function handler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const alertStatus = await getAlertStatus(chatId);

    const welcomeMessage = `
👋 *Welcome to VybeWhale Bot!*

Your go-to for Solana whale tracking and token insights:
• 🐳 Whale Alerts: Real-time notifications for big moves
• 📊 Token Metrics: Price, supply, and holder trends
• ⚡ One-Click Tracking: Follow any wallet instantly
• 🔍 Risk Assessment: Whale concentration and market impact

*Get Started:*
1. /token [address] - Analyze any token
2. /whale [address] - View whale insights and activity
3. /trackwallet [address] - Track wallets with one click
4. /config - View and manage your alert settings

${
  alertStatus
    ? `
*Your Settings:*
• Alerts: ${alertStatus.enabled ? "✅ On" : "❌ Off"}
• Types: ${alertStatus.types.length ? alertStatus.types.join(", ") : "None"}
• Threshold: $${alertStatus.threshold?.toLocaleString() || "Not set"}
`
    : ""
}

Type /help for more commands.`;

    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });
    logger.info(`Start command executed for chat ${chatId}`);
  } catch (error) {
    logger.error("Error in start command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "Oops! Something went wrong. Try again later."
    );
  }
}

module.exports = {
  handler,
};
