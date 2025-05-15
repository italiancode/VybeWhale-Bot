/**
 * Message formatting functions for low cap gems
 * Enhanced for professional presentation and improved UX
 */

// NOTE: Low cap gem formatting functions have been moved to src/commands/lowCapGems.js
// This file now exists as a reference or for future message formatting functions

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

// Export only the functions that may be needed by other modules
module.exports = {
  formatUSD
};