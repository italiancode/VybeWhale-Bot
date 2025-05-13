const logger = require("../utils/logger");
const { getAlertStatus } = require("./config");

async function handler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const alertStatus = await getAlertStatus(chatId);

    const welcomeMessage = `
👋 *Welcome to VybeWhale Bot!*

Your go-to for Solana whale tracking and token insights:

*Get Started:*
1. /token [address] - Analyze any token
2. /whale [address] - View whale insights and activity
3. /walletperformance [address] - Analyze wallet performance & trading activity
4. /lowcap [address] - Find low cap gems with high growth potential
5. /trackwallet [address] - Track a wallet for ongoing analysis
6. /listwallets - View all your tracked wallets
7. /config - View and manage all settings

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
