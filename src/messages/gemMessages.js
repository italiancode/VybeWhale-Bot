/**
 * Message formatting functions for low cap gems
 */

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
      text: `🔍 *Low Cap Gems Held by Wallet ${shortenedAddress}* 🔍\n\nNo low cap tokens (< $10M market cap) found in this wallet's holdings.\n\nTry another wallet or use /lowcap to find trending low cap gems!`,
      isEmpty: true
    };
  }
  
  let message = `🔍 *Low Cap Gems Held by Wallet ${shortenedAddress}* 🔍\n(Market Cap < $10M, High Growth Potential)\n\n`;
  
  // Format each gem
  gems.slice(0, 5).forEach((gem, index) => {
    const formatUSD = (value) => {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
      return `$${value.toFixed(2)}`;
    };
    
    message += `${index + 1}. *Token: $${gem.symbol}*\n` +
      `   Market Cap: ${formatUSD(gem.marketCap)}\n` +
      `   Wallet Balance: ${gem.balance.toLocaleString(undefined, {
        maximumFractionDigits: gem.balance >= 1 ? 2 : 6
      })} $${gem.symbol} (${formatUSD(gem.value)})\n` +
      `   Whale Activity: ${gem.whaleActivity >= 0 ? '+' : ''}${gem.whaleActivity.toFixed(1)}% in last 24h\n` +
      `   Holders: ${gem.holdersTrend >= 0 ? '+' : ''}${gem.holdersTrend.toFixed(1)}% in last 7d\n` +
      `   🔗 [Details](https://alpha.vybe.network/tokens/${gem.mintAddress})\n\n`;
  });
  
  message += `ℹ️ Use /trackwallet ${walletAddress} to monitor this wallet's activity!`;
  
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
  
  const formatUSD = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };
  
  let message = `🚨 *New Low Cap Gem Alert for Wallet ${shortenedAddress}*\n` +
    `Token: $${gem.symbol}\n` +
    `Market Cap: ${formatUSD(gem.marketCap)}\n` +
    `Wallet Balance: ${gem.balance.toLocaleString(undefined, {
      maximumFractionDigits: gem.balance >= 1 ? 2 : 6
    })} $${gem.symbol} (${formatUSD(gem.value)})\n` +
    `Whale Activity: ${gem.whaleActivity >= 0 ? '+' : ''}${gem.whaleActivity.toFixed(1)}% in last 24h\n` +
    `Holders: ${gem.holdersTrend >= 0 ? '+' : ''}${gem.holdersTrend.toFixed(1)}% in last 7d\n` +
    `🔗 [Details](https://alpha.vybe.network/tokens/${gem.mintAddress})`;
  
  return message;
}

// Helper function for formatting USD values
function formatUSD(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

module.exports = {
  formatLowCapGemsMessage,
  formatNewGemAlertMessage,
  formatUSD
}; 