const logger = require("../utils/logger");

const handler = async (bot, msg) => {
  const helpText = `
🤖 *VybeWhale Bot Commands*

*General Commands:*
/start - Start the bot
/help - Show this help message
/config - View and manage all settings

*Token Commands:*
/token - Check token info and market data
/whale - View whale transactions for a token

*Wallet Tracking:*
/trackwallet - Track a wallet's activity
/listwallets - List all tracked wallets
/untrackwallet - Stop tracking a wallet

*Alert Settings:*
/enablealerts [type] - Enable alerts:
  • whale - Large transactions above threshold
  • wallet - Activity from tracked wallets
  • all - Both types of alerts
/disablealerts [type] - Disable specific alerts
/setthreshold [amount] - Set whale alert threshold (USD)

*Examples:*
• /token So11111111111111111111111111111111111111112
• /whale EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
• /trackwallet 5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1
• /setthreshold 10000
• /enablealerts whale
`;

  await bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
};

module.exports = {
  handler,
};
