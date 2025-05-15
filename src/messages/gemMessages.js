/**
 * Message formatting functions for low cap gems
 */

// Helper functions
/**
 * Format a USD value with appropriate suffix (K, M)
 * @param {number} value - USD value to format
 * @returns {string} Formatted USD string
 */
function formatUSD(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Get emoji indicator for price changes
 * @param {number|null} priceChange - Price change percentage
 * @returns {string} Appropriate emoji
 */
function getPriceEmoji(priceChange) {
  if (priceChange === null || priceChange === undefined) return "⚪";

  // Simply use green for positive, red for negative
  if (priceChange > 0) return "🟢";
  if (priceChange < 0) return "🔴";
  return "↔️"; // Flat/unchanged
}

/**
 * Format percentage with sign and decimal places
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, decimals = 2) {
  // Special case for zero
  if (value === 0) return "0.00%";
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

/**
 * Format common token information used in multiple message types
 * @param {Object} gem - Token data
 * @returns {Object} Formatted token information
 */
function formatTokenInfo(gem) {
  const verifiedBadge = gem.verified ? "✅ " : "";
  const priceEmoji = getPriceEmoji(gem.priceChange24h);

  // Price change text - matching the token analysis style
  let priceChangeText = "";
  if (typeof gem.priceChange24h === "number") {
    // Format similar to token analysis: "24h: 🟢 +5.2%"
    priceChangeText = `24h Change: ${priceEmoji} ${formatPercentage(
      gem.priceChange24h,
      1
    )}`;
  } else {
    priceChangeText = `24h Change: ↔️ 0.0%`;
  }

  // 7d price change text
  let priceChange7dText = "";
  if (typeof gem.priceChange7d === "number") {
    const priceEmoji7d = getPriceEmoji(gem.priceChange7d);
    priceChange7dText = `7d Change: ${priceEmoji7d} ${formatPercentage(
      gem.priceChange7d,
      1
    )}`;
  }

  // Format holder trend if available
  let holderTrendText = "";
  if (typeof gem.holdersTrend === "number") {
    const trendEmoji = getPriceEmoji(gem.holdersTrend);
    holderTrendText = `Holder Trend: ${trendEmoji} ${formatPercentage(
      gem.holdersTrend,
      1
    )}`;
  }

  // Add holder information if available
  let formattedHolderCount = "";

  if (gem.holders) {
    formattedHolderCount = gem.holders.toLocaleString();
  } else if (gem.holderCount) {
    formattedHolderCount = gem.holderCount.toLocaleString();
  }

  return {
    verifiedBadge,
    priceEmoji,
    priceChangeText,
    priceChange7dText,
    holderTrendText,
    formattedHolderCount,
  };
}

/**
 * Format each gem with basic info
 * @param {Object} gem - Gem data to format
 * @param {number} index - Index of gem in list
 * @returns {string} Formatted gem message
 */
function formatGemDetails(gem, index) {
  const tokenInfo = formatTokenInfo(gem);

  let message =
    `${index + 1}. *${tokenInfo.verifiedBadge}${gem.symbol}*\n` +
    `   • Price: $${gem.price.toFixed(6)}\n`;

  // Always add price change section, even if it's 0%
  message += `   • ${tokenInfo.priceChangeText}\n`;
  
  // Add 7d price change if available
  if (tokenInfo.priceChange7dText) {
    message += `   • ${tokenInfo.priceChange7dText}\n`;
  }

  message +=
    `   • Market Cap: ${formatUSD(gem.marketCap)}\n` +
    `   • Balance: ${gem.balance.toLocaleString(undefined, {
      maximumFractionDigits: gem.balance >= 1 ? 2 : 6,
    })} ${gem.symbol} (${formatUSD(gem.value)})\n`;

  // Add holder information if available
  if (tokenInfo.formattedHolderCount) {
    message += `   • Holders: ${tokenInfo.formattedHolderCount}\n`;
  }
  
  // Add holder trend information if available
  if (tokenInfo.holderTrendText) {
    message += `   • ${tokenInfo.holderTrendText}\n`;
  }

  message += `   • Token Address: \`${gem.mintAddress}\`\n`;

  message += `   • [View Token Details 🔗](https://alpha.vybe.network/tokens/${gem.mintAddress})\n\n`;

  return message;
}

/**
 * Format a message for displaying low cap gems found in a wallet
 * @param {string} walletAddress - Wallet address analyzed
 * @param {Array} gems - Low cap gems found
 * @returns {Object} Message object with text, empty message status, and inline keyboard
 */
function formatLowCapGemsMessage(walletAddress, gems) {
  const shortenedAddress = `${walletAddress.slice(
    0,
    4
  )}...${walletAddress.slice(-4)}`;

  if (!gems || gems.length === 0) {
    return {
      text:
        `🔍 *LOW CAP GEMS HELD BY WALLET ${shortenedAddress}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `No low cap tokens (< $10M market cap) found in this wallet's holdings.\n\n` +
        `Try another wallet or use /lowcap to find trending low cap gems!`,
      isEmpty: true,
      keyboard: {
        inline_keyboard: [
          [
            {
              text: "📊 View Wallet Performance",
              callback_data: `wallet_performance:${walletAddress}`,
            },
          ],
        ],
      },
    };
  }

  // Filter out very low market cap tokens (less than $60K)
  const filteredGems = gems.filter((gem) => gem.marketCap >= 60000);

  if (filteredGems.length === 0) {
    return {
      text:
        `🔍 *LOW CAP GEMS HELD BY WALLET ${shortenedAddress}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ All tokens in this wallet have market cap below $60K (extremely high risk).\n` +
        `No viable low cap gems found.\n\n` +
        `Try another wallet or use /lowcap to find trending low cap gems!`,
      isEmpty: true,
      keyboard: {
        inline_keyboard: [
          [
            {
              text: "📊 View Wallet Performance",
              callback_data: `wallet_performance:${walletAddress}`,
            },
          ],
        ],
      },
    };
  }

  let message =
    `🔍 *LOW CAP GEMS HELD BY WALLET ${shortenedAddress}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Filtering: Market Cap $60K-$10M\n\n`;

  // Sort gems by market cap (largest first)
  const sortedGems = filteredGems.sort((a, b) => b.marketCap - a.marketCap);

  // Format each gem with basic info
  sortedGems.forEach((gem, i) => {
    message += formatGemDetails(gem, i);
  });

  // Add total count summary
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📝 *SUMMARY*: Found ${sortedGems.length} viable low cap gems`;
  if (gems.length > filteredGems.length) {
    message += ` (${
      gems.length - filteredGems.length
    } tokens with <$60K market cap were filtered out)`;
  }
  message += `.\n\n`;

  // Add note about detailed analysis
  message += `For detailed token analysis, use the /token command with any token address.\n\n`;

  // Add tracking options
  message += `⚡️ *Track This Wallet*:\n`;
  message += `• /trackwallet ${walletAddress} - Monitor all wallet activity\n`;
  message += `• /trackgems ${walletAddress} - Get alerts for new gems\n\n`;
  message += `Wallet address: \`${walletAddress}\``;

  // Create inline keyboard with tracking buttons
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "📋 Track Wallet",
          callback_data: `track_wallet:${walletAddress}`,
        },
        {
          text: "💎 Track Gems Only",
          callback_data: `track_gems:${walletAddress}`,
        },
      ],
      [
        {
          text: "📊 View Performance",
          callback_data: `wallet_performance:${walletAddress}`,
        },
      ],
    ],
  };

  return {
    text: message,
    isEmpty: false,
    keyboard: inlineKeyboard,
  };
}

/**
 * Format a message for alerting about a new low cap gem
 * @param {string} walletAddress - Wallet address
 * @param {Object} gem - Newly acquired gem data
 * @returns {Object} Formatted alert message with text and inline keyboard
 */
function formatNewGemAlertMessage(walletAddress, gem) {
  const shortenedAddress = `${walletAddress.slice(
    0,
    4
  )}...${walletAddress.slice(-4)}`;
  const tokenInfo = formatTokenInfo(gem);

  // Market cap warning for very low caps
  const marketCapWarning =
    gem.marketCap < 60000 ? "⚠️ *Very low market cap (high risk)*\n" : "";

  let message =
    `🚨 *NEW TOKEN ALERT*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Wallet: \`${shortenedAddress}\` acquired *${tokenInfo.verifiedBadge}${gem.symbol}*\n\n` +
    `• Token Address: \`${gem.mintAddress}\`\n` +
    `• Price: $${gem.price.toFixed(6)}\n`;

  // Always add price change section
  message += `• ${tokenInfo.priceChangeText}\n`;
  
  // Add 7d price change if available
  if (tokenInfo.priceChange7dText) {
    message += `• ${tokenInfo.priceChange7dText}\n`;
  }

  message += `• Market Cap: ${formatUSD(gem.marketCap)}\n`;

  // Add holder information if available
  if (tokenInfo.formattedHolderCount) {
    message += `• Holders: ${tokenInfo.formattedHolderCount}\n`;
  }
  
  // Add holder trend information if available
  if (tokenInfo.holderTrendText) {
    message += `• ${tokenInfo.holderTrendText}\n`;
  }

  message +=
    `${marketCapWarning}` +
    `• Value: ${formatUSD(gem.value)} (${gem.balance.toLocaleString(undefined, {
      maximumFractionDigits: gem.balance >= 1 ? 2 : 6,
    })} ${gem.symbol})\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• [View Token Details 🔗](https://alpha.vybe.network/tokens/${gem.mintAddress})\n\n` +
    `Use /token ${gem.mintAddress} for detailed token analysis\n\n` +
    `Wallet address: \`${walletAddress}\``;

  // Create inline keyboard with action buttons
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "📊 View Token Details",
          url: `https://alpha.vybe.network/tokens/${gem.mintAddress}`,
        },
      ],
      [
        {
          text: "🚫 Stop Gem Alerts",
          callback_data: `untrack_gems:${walletAddress}`,
        },
      ],
    ],
  };

  return {
    text: message,
    keyboard: inlineKeyboard,
  };
}

module.exports = {
  formatLowCapGemsMessage,
  formatNewGemAlertMessage,
  formatUSD,
};
