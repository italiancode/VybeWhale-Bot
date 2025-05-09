const logger = require("../utils/logger");

const handler = async (bot, msg) => {
  const helpText = `
🤖 *VybeWhale Bot Commands*

*General Commands:*
/start - Welcome & quick overview
/help - Show this help message
/config - View and manage all settings

*Analysis Commands:*
/token [ADDRESS] - Token analysis: price, holders & whale distribution
/whale [ADDRESS] - Whale watch: View whale insights, activity & risk assessment

*Wallet Tracking:*
/trackwallet [ADDRESS] - Track wallet (or use ⚡ Track buttons)
/listwallets - View all tracked wallets
/untrackwallet [ADDRESS] - Stop tracking a wallet

*Alert Settings:*
/enablealerts [type] - Enable alerts (whale/wallet/all)
/disablealerts [type] - Disable alerts (whale/wallet/all)
/setthreshold [amount] - Set whale alert threshold (USD)

*Examples:*
• /token So11111111111111111111111111111111111111112
• /whale EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
• /trackwallet 5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1
• /setthreshold 10000
`;

  await bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
  logger.info(`Help command executed for chat ${msg.chat.id}`);
};

module.exports = {
  handler,
};
