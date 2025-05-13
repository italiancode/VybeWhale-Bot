const logger = require("../utils/logger");

const handler = async (bot, msg) => {
  const helpText = `
🤖 *VybeWhale Bot Commands*

*General Commands:*
/start - Welcome & quick overview
/help - Show this help message
/config - View and manage all settings

*Token Analysis:*
/token [ADDRESS] - Token analysis: price, holders & whale distribution
/whale [ADDRESS] - Whale watch: View whale insights, activity & risk assessment

*Wallet Analysis:*
/walletperformance [ADDRESS] - Analyze wallet performance, holdings & trading activity
/lowcap [ADDRESS] - Find low cap gems with high growth potential in a wallet

*Wallet Tracking:*
/trackwallet [ADDRESS] - Track wallet for ongoing analysis
/listwallets - View all tracked wallets with performance tracking options
/untrackwallet [ADDRESS] - Stop tracking a wallet

*Alert Settings:*
/enablealerts [type] - Enable alerts (whale/wallet/gem/all)
/disablealerts [type] - Disable alerts (whale/wallet/gem/all)
/untrackgems [ADDRESS] - Stop tracking gem alerts for a wallet
/setthreshold [amount] - Set whale alert threshold (USD)

*Examples:*
• /token So11111111111111111111111111111111111111112
• /whale EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
• /walletperformance 5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1
• /lowcap 4QbWA5MChbahM5GqstbfHfbE3HuYX1grg4VB5MhmUcXr
• /setthreshold 10000
`;

  await bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
  logger.info(`Help command executed for chat ${msg.chat.id}`);
};

module.exports = {
  handler,
};
