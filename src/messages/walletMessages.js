/**
 * Message formatting functions for wallet tracking and alerts
 */
const { formatUSD } = require('./gemMessages');

/**
 * Format wallet alert message
 * @param {string} wallet - Wallet address
 * @param {Object} balance - Wallet balance data
 * @param {Object} prevBalance - Previous wallet balance data (optional)
 * @returns {string} Formatted wallet alert message
 */
function formatWalletAlertMessage(wallet, balance, prevBalance) {
  try {
    // Check if we have previous data to show changes
    const valueChange = prevBalance 
        ? balance.totalValue - prevBalance.totalValue 
        : 0;
    const valueChangePercent = prevBalance && prevBalance.totalValue > 0
        ? (valueChange / prevBalance.totalValue) * 100
        : 0;
    
    // Format the change string
    let changeStr = '';
    if (prevBalance) {
        const direction = valueChange >= 0 ? '📈' : '📉';
        changeStr = `${direction} ${valueChange >= 0 ? '+' : ''}${formatUSD(valueChange)} (${valueChangePercent.toFixed(2)}%)`;
    }

    const message = 
        `👀 *Wallet Activity Update*\n\n` +
        `*Wallet:* \`${wallet}\`\n` +
        `*Total Value:* ${formatUSD(balance.totalValue)}\n` +
        (changeStr ? `*Change:* ${changeStr}\n` : '') + 
        `\n*Top Holdings:*\n` +
        balance.tokens.slice(0, 5).map(token => 
            `• ${token.symbol}: ${formatUSD(token.value)}`
        ).join('\n') + 
        `\n\n[View Wallet on Vybe Alpha 🔍](https://vybe.fyi/wallets/${wallet})`;

    return message;
  } catch (error) {
    return `Error formatting wallet alert message: ${error.message}`;
  }
}

/**
 * Generate a unique signature for a wallet alert message
 * This helps avoid sending duplicate messages
 * 
 * @param {string} wallet - Wallet address
 * @param {Object} balance - Wallet balance data
 * @returns {string} - Unique message signature
 */
function generateWalletMessageSignature(wallet, balance) {
  try {
    // Include wallet address and total value
    let signature = `${wallet}:${balance.totalValue.toFixed(2)}`;
    
    // Add top 5 tokens
    if (balance.tokens && balance.tokens.length > 0) {
      const topTokens = balance.tokens.slice(0, 5).map(token => 
        `${token.symbol}:${token.value.toFixed(2)}`
      ).join(';');
      signature += `:${topTokens}`;
    }
    
    return signature;
  } catch (error) {
    return `${wallet}:${Date.now()}`; // Fallback to ensure uniqueness
  }
}

module.exports = {
  formatWalletAlertMessage,
  generateWalletMessageSignature
}; 