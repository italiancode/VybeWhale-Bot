const logger = require("../utils/logger");
const { getAlertStatus } = require("./config");

async function handler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const alertStatus = await getAlertStatus(chatId);

    const welcomeMessage = `
👋 *Welcome to VybeWhale Bot!*

I provide real-time on-chain analytics for Solana tokens using Vybe API, helping you track:

• 📊 *Token Analysis* - Price, market cap, supply metrics, holder trends
• 🐋 *Whale Transfers* - Monitor large transfers for any Solana token
• 👤 *Top Holder Analysis* - Identify largest holders with concentration risk assessment
• ⚡ *One-Click Wallet Tracking* - Instantly track any wallet with a single button
• 🔔 *Smart Alerts* - Get notified of whale activity for tokens you care about

*Quick Start:*
1. Use /token to analyze any Solana token
2. Use /whale to get comprehensive whale insights, concentration risk, and market impact analysis
3. Use /trackwallet to monitor specific wallets
4. Set your alert threshold with /setthreshold
5. Enable alerts with /enablealerts whale or wallet

${
  alertStatus
    ? `
*Your Alert Settings:*
• Status: ${alertStatus.enabled ? "✅ Enabled" : "❌ Disabled"}
• Types: ${alertStatus.types.length ? alertStatus.types.join(", ") : "None"}
• Threshold: ${
        alertStatus.threshold
          ? "$" + alertStatus.threshold.toLocaleString()
          : "Not set (default: $10,000)"
      }
`
    : ""
}

Use /help for all commands or /config to view your current settings.`;

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
