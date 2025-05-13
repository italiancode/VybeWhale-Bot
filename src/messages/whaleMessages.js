/**
 * Message formatting functions for whale alerts
 */
const { formatUSD } = require('./gemMessages');

/**
 * Format whale alert message
 * @param {Object} transaction - Whale transaction data
 * @returns {string} Formatted whale alert message
 */
function formatWhaleAlertMessage(transaction) {
  try {
    const message = 
      `🐋 *Whale Alert!*\n\n` +
      `*Token:* ${transaction.symbol || 'Unknown'}\n` +
      `*Amount:* ${formatNumber(transaction.amount)} (${transaction.symbol})\n` +
      `*USD Value:* ${formatUSD(transaction.usdAmount)}\n` +
      `*Type:* ${transaction.type}\n` +
      `*From:* \`${transaction.from}\`\n` +
      `*To:* \`${transaction.to}\`\n\n` +
      `[View Token on Vybe Alpha 🔍](https://vybe.fyi/token/${transaction.mintAddress})`;

    return message;
  } catch (error) {
    return `Error formatting whale alert message: ${error.message}`;
  }
}

/**
 * Format number with appropriate suffixes (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

module.exports = {
  formatWhaleAlertMessage,
  formatNumber
}; 