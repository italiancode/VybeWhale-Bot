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
  if (priceChange === null || priceChange === undefined) return '⚪';
  
  // Simply use green for positive, red for negative
  if (priceChange > 0) return '🟢';
  if (priceChange < 0) return '🔴';
  return '↔️'; // Flat/unchanged
}

/**
 * Get emoji for trend indicator
 * @param {number|null} trend - Trend value
 * @returns {string} Trend emoji
 */
function getTrendEmoji(trend) {
  if (trend === null || trend === undefined) return '⚪';
  return trend >= 0 ? '🟢' : '🔴';
}

/**
 * Format percentage with sign and decimal places
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, decimals = 2) {
  // Special case for zero
  if (value === 0) return '0.00%';
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format common token information used in multiple message types
 * @param {Object} gem - Token data
 * @returns {Object} Formatted token information
 */
function formatTokenInfo(gem) {
  const verifiedBadge = gem.verified ? '✅ ' : '';
  const priceEmoji = getPriceEmoji(gem.priceChange24h);
  const formattedHolderCount = gem.holderCount ? gem.holderCount.toLocaleString() : '?';
  
  // Format holder trends - only show 7-day trend
  const trend7d = gem.holdersTrend;
  
  // Format holder trend in a clean format with just 7-day data
  const holderTrendText = `Holder Growth: ${getTrendEmoji(trend7d)} ${formatPercentage(trend7d)} (7D)`;
  
  // Coming soon for whale activity
  const whaleActivityText = `Whale Activity: Coming Soon`;
  
  // Price change text - matching the token analysis style
  let priceChangeText = '';
  if (typeof gem.priceChange24h === 'number') {
    // Format similar to token analysis: "24h: 🟢 +5.2%"
    priceChangeText = `24h Change: ${priceEmoji} ${formatPercentage(gem.priceChange24h, 1)}`;
  } else {
    priceChangeText = `24h Change: ↔️ 0.0%`;
  }
    
  return {
    verifiedBadge,
    priceEmoji,
    formattedHolderCount,
    holderTrendText,
    whaleActivityText,
    priceChangeText
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
  
  let message = `${index + 1}. *${tokenInfo.verifiedBadge}${gem.symbol}*\n` +
    `   • Price: $${gem.price.toFixed(6)}\n`;
  
  // Always add price change section, even if it's 0%
  message += `   • ${tokenInfo.priceChangeText}\n`;
  
  message += `   • Market Cap: ${formatUSD(gem.marketCap)}\n` +
    `   • Balance: ${gem.balance.toLocaleString(undefined, {
      maximumFractionDigits: gem.balance >= 1 ? 2 : 6
    })} ${gem.symbol} (${formatUSD(gem.value)})\n` +
    `   • Holders: ${tokenInfo.formattedHolderCount}\n` +
    `   • ${tokenInfo.holderTrendText}\n` +
    `   • ${tokenInfo.whaleActivityText}\n` +
    `   • Token Address: \`${gem.mintAddress}\`\n` +
    `   • [View Token Details 🔗](https://alpha.vybe.network/tokens/${gem.mintAddress})\n\n`;
    
  return message;
}

/**
 * Format a message for displaying low cap gems found in a wallet
 * @param {string} walletAddress - Wallet address analyzed
 * @param {Array} gems - Low cap gems found
 * @returns {Object} Message object with text and empty message if no gems found
 */
function formatLowCapGemsMessage(walletAddress, gems) {
  const shortenedAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  
  if (!gems || gems.length === 0) {
    return {
      text: `🔍 *LOW CAP GEMS HELD BY WALLET ${shortenedAddress}*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `No low cap tokens (< $10M market cap) found in this wallet's holdings.\n\n` +
            `Try another wallet or use /lowcap to find trending low cap gems!`,
      isEmpty: true
    };
  }
  
  // Filter out very low market cap tokens (less than $60K)
  const filteredGems = gems.filter(gem => gem.marketCap >= 60000);
  
  if (filteredGems.length === 0) {
    return {
      text: `🔍 *LOW CAP GEMS HELD BY WALLET ${shortenedAddress}*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `⚠️ All tokens in this wallet have market cap below $60K (extremely high risk).\n` +
            `No viable low cap gems found.\n\n` +
            `Try another wallet or use /lowcap to find trending low cap gems!`,
      isEmpty: true
    };
  }
  
  let message = `🔍 *LOW CAP GEMS HELD BY WALLET ${shortenedAddress}*\n` +
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
    message += ` (${gems.length - filteredGems.length} tokens with <$60K market cap were filtered out)`;
  }
  message += `.\n\n`;
  
  // Add tracking options
  message += `⚡️ *Track This Wallet*:\n`;
  message += `• /trackwallet ${walletAddress} - Monitor all activity\n`;
  message += `• /trackgems ${walletAddress} - Get alerts on new gem acquisitions\n\n`;
  message += `Wallet address: \`${walletAddress}\``;
  
  return {
    text: message,
    isEmpty: false
  };
}

/**
 * Format a message for alerting about a new low cap gem
 * @param {string} walletAddress - Wallet address
 * @param {Object} gem - Newly acquired gem data
 * @returns {string} Formatted alert message
 */
function formatNewGemAlertMessage(walletAddress, gem) {
  const shortenedAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  const tokenInfo = formatTokenInfo(gem);
  
  // Market cap warning for very low caps
  const marketCapWarning = gem.marketCap < 60000 ? '⚠️ *Very low market cap (high risk)*\n' : '';
  
  let message = `🚨 *NEW TOKEN ALERT*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Wallet: \`${shortenedAddress}\` acquired *${tokenInfo.verifiedBadge}${gem.symbol}*\n\n` +
                `• Price: $${gem.price.toFixed(6)}\n`;
  
  // Always add price change section
  message += `• ${tokenInfo.priceChangeText}\n`;
  
  message += `• Market Cap: ${formatUSD(gem.marketCap)}\n` +
             `${marketCapWarning}` +
             `• Value: ${formatUSD(gem.value)} (${gem.balance.toLocaleString(undefined, {
               maximumFractionDigits: gem.balance >= 1 ? 2 : 6
             })} ${gem.symbol})\n` +
             `• Holders: ${tokenInfo.formattedHolderCount}\n` +
             `• ${tokenInfo.holderTrendText}\n` +
             `• ${tokenInfo.whaleActivityText}\n` +
             `• Token Address: \`${gem.mintAddress}\`\n` +
             `━━━━━━━━━━━━━━━━━━━━━━\n` +
             `• [View Token Details 🔗](https://alpha.vybe.network/tokens/${gem.mintAddress})\n\n` +
             `Wallet address: \`${walletAddress}\``;
  
  return message;
}

module.exports = {
  formatLowCapGemsMessage,
  formatNewGemAlertMessage,
  formatUSD
};