/**
 * Twitter Bot Configuration
 * Contains settings and configuration for the VybeWhale Twitter Bot
 */
require("dotenv").config();

module.exports = {
  // Twitter API credentials
  twitterApiKey: process.env.TWITTER_API_KEY,
  twitterApiKeySecret: process.env.TWITTER_API_KEY_SECRET,
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN,
  twitterAccessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  twitterClientId: process.env.TWITTER_CLIENT_ID,
  twitterClientSecret: process.env.TWITTER_CLIENT_SECRET,

  // Bot settings
  twitterEnabled: process.env.TWITTER_BOT_ENABLED === "true",
  maxTweetsPerHour: parseInt(process.env.MAX_TWEETS_PER_HOUR || "10"),
  minSignificantChange: parseFloat(
    process.env.MIN_SIGNIFICANT_PRICE_CHANGE || "5"
  ), // Minimum % price change to report

  // Thresholds
  whaleTransactionMinUsd: parseInt(
    process.env.TWITTER_WHALE_MIN_USD || "50000"
  ), // Min USD for whale transaction
  holderChangeThreshold: parseFloat(process.env.HOLDER_CHANGE_THRESHOLD || "3"), // % change in holders

  // Popular tokens to monitor automatically
  // These are tokens the bot will automatically check for significant events
  popularTokens: [
    "So11111111111111111111111111111111111111112", // SOL
  ],

  // Tweet formatting
  maxTweetLength: 280,
  messageTemplates: {
    whaleTransaction:
      "🐳 Whale Alert!\n\n${tokenSymbol} ${transactionType} - $${amount}\n\n${address} ${action} ${tokenAmount} ${tokenSymbol} (${percentOfSupply}% of supply)\n\nMarket Cap: $${marketCap}\n${priceImpact}\n\n#Solana #${tokenSymbol} #Crypto #VybeWhale",

    priceChange:
      "📈 ${direction} Alert!\n\n${tokenSymbol} ${priceAction} by ${changePercent}% in the last ${timeframe}\n\nCurrent Price: $${price}\nMarket Cap: $${marketCap}\n\n#Solana #${tokenSymbol} #Crypto #VybeWhale",

    holderChange:
      "👥 Holder Alert!\n\n${tokenSymbol} has ${direction} ${changePercent}% holders in ${timeframe}\n\nCurrent Holders: ${holderCount}\nMarket Cap: $${marketCap}\n\n#Solana #${tokenSymbol} #Crypto #VybeWhale",

    newToken:
      "🚀 New Token Alert!\n\n${tokenSymbol} has launched on #Solana!\n\nInitial Price: $${price}\nInitial Liquidity: $${liquidity}\nContract: ${tokenAddress}\n\n#Crypto #NewListings #VybeWhale",
  },

  // Telegram bot link to include in tweets
  telegramLink: "https://t.me/vybewhalebot",
};
