/**
 * Message formatting functions for low cap gems
 * Enhanced for professional presentation and improved UX
 */

// Helper functions
/**
 * Format a USD value with appropriate suffix (K, M, B)
 * @param {number} value - USD value to format
 * @returns {string} Formatted USD string
 */
function formatUSD(value) {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Get emoji indicator for price changes
 * @param {number|null} priceChange - Price change percentage
 * @returns {string} Appropriate emoji
 */
function getPriceEmoji(priceChange) {
  if (priceChange === null || priceChange === undefined) return "⚪";

  // Simple green/red indicators as requested
  if (priceChange > 0) return "🟢"; // Green circle for positive
  if (priceChange < 0) return "🔴"; // Red circle for negative
  return "⚪"; // White circle for unchanged
}

/**
 * Get emoji for trend indicator
 * @param {number|null} trend - Trend value
 * @returns {string} Trend emoji
 */
function getTrendEmoji(trend) {
  if (trend === null || trend === undefined) return "⚪";

  // Simple green/red indicators as requested
  if (trend > 0) return "🟢"; // Green circle for positive
  if (trend < 0) return "🔴"; // Red circle for negative
  return "⚪"; // White circle for unchanged
}

/**
 * Format percentage with sign and decimal places
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage with appropriate styling
 */
function formatPercentage(value, decimals = 2) {
  // Special case for zero
  if (value === 0) return "0.00%";

  // Enhanced percentage formatting
  if (value > 0) {
    return `+${value.toFixed(decimals)}%`;
  } else {
    return `${value.toFixed(decimals)}%`;
  }
}

/**
 * Format common token information used in multiple message types
 * @param {Object} gem - Token data
 * @returns {Object} Formatted token information with professional styling
 */
function formatTokenInfo(gem) {
  // Verification badge with premium look
  const verifiedBadge = gem.verified ? "✅ " : "";
  const priceEmoji = getPriceEmoji(gem.priceChange24h);

  // Simple holder count formatting
  const formattedHolderCount = gem.holderCount
    ? gem.holderCount >= 1000
      ? `${(gem.holderCount / 1000).toFixed(1)}K`
      : gem.holderCount.toLocaleString()
    : "Unknown";

  // Format holder trends with simple indicators
  const trend7d = gem.holdersTrend;
  const trendEmoji = getTrendEmoji(trend7d);
  const holderTrendText = `Holders: ${formattedHolderCount} ${trendEmoji} ${formatPercentage(
    trend7d
  )} (7D)`;

  // Simple whale activity text
  const whaleActivityText = `Whale Activity: Coming Soon`;

  // Simple price change text
  let priceChangeText = "";
  if (typeof gem.priceChange24h === "number") {
    priceChangeText = `24h: ${priceEmoji} ${formatPercentage(
      gem.priceChange24h,
      1
    )}`;
  } else {
    priceChangeText = `24h: ⚪ 0.00%`;
  }

  return {
    verifiedBadge,
    priceEmoji,
    formattedHolderCount,
    holderTrendText,
    whaleActivityText,
    priceChangeText,
  };
}

/**
 * Format each gem with enhanced professional info
 * @param {Object} gem - Gem data to format
 * @param {number} index - Index of gem in list
 * @returns {string} Formatted gem message with premium styling
 */
function formatGemDetails(gem, index) {
  const tokenInfo = formatTokenInfo(gem);

  // Enhanced header with token symbol and badge
  let message = `*${index + 1}. ${tokenInfo.verifiedBadge}${gem.symbol}*\n`;

  // Simple bullet point formatting
  message += `   • Price: $${gem.price.toFixed(gem.price < 0.01 ? 8 : 6)}\n`;
  message += `   • ${tokenInfo.priceChangeText}\n`;
  message += `   • Market Cap: ${formatUSD(gem.marketCap)}\n`;

  // Balance section
  const balanceFormatted = gem.balance.toLocaleString(undefined, {
    maximumFractionDigits: gem.balance >= 1 ? 2 : 6,
  });
  message += `   🏦 Balance: ${balanceFormatted} ${gem.symbol} (${formatUSD(
    gem.value
  )})\n`;

  // Metrics section
  message += `   ${tokenInfo.holderTrendText}\n`;
  message += `   ${tokenInfo.whaleActivityText}\n`;

  // Token details with full address
  message += `   📝 Token: \`${gem.mintAddress}\`\n`;
  message += `   🔍 [View Analytics Dashboard](https://alpha.vybe.network/tokens/${gem.mintAddress})\n\n`;

  return message;
}

/**
 * Format a message for displaying low cap gems found in a wallet
 * @param {string} walletAddress - Wallet address analyzed
 * @param {Array} gems - Low cap gems found
 * @returns {Object} Message object with text and empty message if no gems found
 */
function formatLowCapGemsMessage(walletAddress, gems) {
  const shortenedAddress = `${walletAddress.slice(
    0,
    4
  )}...${walletAddress.slice(-4)}`;

  // Handle case when no gems are provided
  if (!gems || gems.length === 0) {
    return {
      text:
        `🔍 *LOW CAP GEMS HELD BY WALLET ${shortenedAddress}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `No low cap tokens (< $10M market cap) found in this wallet's holdings.\n\n` +
        `Try using the /whale command to find trending tokens instead.`,
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

  // Filter gems with market cap >= $60K and <= $10M for better quality results
  const filteredGems = gems.filter(
    (gem) => gem.marketCap >= 60000 && gem.marketCap <= 10000000
  );

  // Handle no qualifying gems found case with improved messaging
  if (filteredGems.length === 0) {
    return {
      text:
        `⚠️ *NO QUALIFYING GEMS FOUND*\n\n` +
        `We analyzed wallet \`${shortenedAddress}\` but couldn't find any suitable low cap gems.\n\n` +
        `${
          gems.length > 0
            ? `We filtered out ${gems.length} tokens with market caps less than $60K due to high risk.`
            : `This wallet doesn't appear to hold any tokens that match our criteria.`
        }\n\n` +
        `Try using the /whale command to find trending tokens instead.`,
      isEmpty: true,
      keyboard: {
        inline_keyboard: [
          [
            {
              text: "📊 View Wallet Performance",
              callback_data: `wallet_performance:${walletAddress}`,
            },
            {
              text: "🔍 Find Trending Tokens",
              callback_data: `whale_command`,
            },
          ],
        ],
      },
    };
  }

  // Enhanced header with professional styling
  let message =
    `💎 *LOW CAP GEM ANALYSIS* 💎\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📂 *WALLET:* \`${shortenedAddress}\`\n` +
    `🔍 *FILTER:* $60K-$10M Market Cap\n` +
    `📈 *RESULTS:* ${filteredGems.length} qualifying gems\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Sort gems by market cap (largest first)
  const sortedGems = filteredGems.sort((a, b) => b.marketCap - a.marketCap);

  // Format each gem with enhanced info
  sortedGems.forEach((gem, i) => {
    message += formatGemDetails(gem, i);
  });

  // Add premium summary section
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *SUMMARY*\n`;
  message += `• Found ${sortedGems.length} viable low cap gems\n`;
  if (gems.length > filteredGems.length) {
    message += `• Filtered out ${
      gems.length - filteredGems.length
    } high-risk tokens (< $60K market cap)\n`;
  }
  message += `• Analysis time: ${
    new Date().toISOString().split("T")[1].split(".")[0]
  } UTC\n\n`;

  // Add professional tip section with enhanced formatting
  message += `💡 *PRO TIP*: Copy any token address and use /token command for in-depth analysis with price predictions and social metrics.\n\n`;

  // Create inline keyboard with enhanced tracking buttons and clear labeling
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "📡 TRACK FULL WALLET",
          callback_data: `track_wallet:${walletAddress}`,
        },
      ],
      [
        {
          text: "💎 TRACK GEMS ONLY",
          callback_data: `track_gems:${walletAddress}`,
        },
        {
          text: "📊 VIEW PERFORMANCE",
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

  // Risk assessment section with enhanced styling
  let riskLevel = "";
  let riskEmoji = "";

  if (gem.marketCap < 60000) {
    riskLevel = "HIGH RISK";
    riskEmoji = "🔴";
  } else if (gem.marketCap < 1000000) {
    riskLevel = "MEDIUM RISK";
    riskEmoji = "🟠";
  } else {
    riskLevel = "LOWER RISK";
    riskEmoji = "🟢";
  }

  const marketCapWarning =
    gem.marketCap < 60000
      ? `⚠️ *CAUTION: Very low market cap detected*\n` +
        `This token has a market cap below $60K, which typically indicates higher volatility and risk.\n`
      : "";

  // Premium styled alert header
  let message =
    `🚨 *NEW GEM DETECTED* 🚨\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔍 *WALLET:* \`${shortenedAddress}\`\n` +
    `💎 *TOKEN:* ${tokenInfo.verifiedBadge}*${gem.symbol}*\n` +
    `⚖️ *RISK ASSESSMENT:* ${riskEmoji} ${riskLevel}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Simple bullet point formatting with price metrics
  message += `\n• Price: $${gem.price.toFixed(gem.price < 0.01 ? 8 : 6)}\n`;
  message += `• ${tokenInfo.priceChangeText}\n`;
  message += `• Market Cap: ${formatUSD(gem.marketCap)}\n`;

  if (marketCapWarning) {
    message += `${marketCapWarning}\n`;
  }

  // Balance information with premium formatting
  message += `🏦 *BALANCE DETAILS*\n`;
  message += `• Quantity: ${gem.balance.toLocaleString(undefined, {
    maximumFractionDigits: gem.balance >= 1 ? 2 : 6,
  })} ${gem.symbol}\n`;
  message += `• Value: ${formatUSD(gem.value)}\n\n`;

  // Additional metrics section
  message += `📊 *TOKEN METRICS*\n`;
  message += `• ${tokenInfo.holderTrendText}\n`;
  message += `• ${tokenInfo.whaleActivityText}\n`;
  message += `• Token: \`${gem.mintAddress}\`\n\n`;

  // Call to action section
  message += `🔗 *ACTIONS*\n`;
  message += `• [View Complete Analytics](https://alpha.vybe.network/tokens/${gem.mintAddress})\n`;
  message += `• Use /token \`${gem.mintAddress}\` for detailed analysis\n`;

  // Create enhanced inline keyboard with prominent action buttons
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "📊 VIEW FULL ANALYTICS",
          url: `https://alpha.vybe.network/tokens/${gem.mintAddress}`,
        },
      ],
      [
        {
          text: "🔎 ANALYZE THIS TOKEN",
          callback_data: `analyze_token:${gem.mintAddress}`,
        },
        {
          text: "🚫 STOP GEM ALERTS",
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
  formatTokenInfo, // Export additional utility functions
  formatGemDetails,
};
