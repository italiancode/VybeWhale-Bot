/**
 * Utility functions for formatting numbers and text for display
 */

/**
 * Format a number with commas as thousands separators and appropriate decimal places
 * @param {number} num - The number to format
 * @param {number} [maxDecimals=2] - Maximum decimal places to display
 * @param {number} [minDecimals=0] - Minimum decimal places to display
 * @returns {string} - Formatted number
 */
function formatNumber(num, maxDecimals = 2, minDecimals = 0) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  // Determine number of decimal places based on size
  let decimals = maxDecimals;
  if (Math.abs(num) < 1 && Math.abs(num) > 0) {
    // For small numbers, use more decimal places (up to 6)
    decimals = 6;
  }
  
  // Format the number with appropriate decimal places
  return num.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format a large number with K, M, B, T suffixes
 * @param {number} num - The number to format
 * @param {number} [precision=2] - Number of decimal places
 * @returns {string} - Formatted number with appropriate suffix
 */
function formatLargeNumber(num, precision = 2) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1e12) {
    return sign + (absNum / 1e12).toFixed(precision) + 'T';
  } else if (absNum >= 1e9) {
    return sign + (absNum / 1e9).toFixed(precision) + 'B';
  } else if (absNum >= 1e6) {
    return sign + (absNum / 1e6).toFixed(precision) + 'M';
  } else if (absNum >= 1e3) {
    return sign + (absNum / 1e3).toFixed(precision) + 'K';
  } else {
    return sign + absNum.toFixed(precision);
  }
}

/**
 * Format a percentage with appropriate sign and decimal places
 * @param {number} percent - The percentage to format
 * @param {number} [decimals=2] - Number of decimal places
 * @param {boolean} [includeSign=true] - Whether to include + or - sign
 * @returns {string} - Formatted percentage
 */
function formatPercentage(percent, decimals = 2, includeSign = true) {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return '0%';
  }
  
  const fixed = percent.toFixed(decimals);
  
  if (includeSign && percent > 0) {
    return '+' + fixed + '%';
  } else {
    return fixed + '%';
  }
}

/**
 * Format a time duration in a human-readable way
 * @param {number} milliseconds - Time duration in milliseconds
 * @returns {string} - Formatted time string
 */
function formatDuration(milliseconds) {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${Math.floor(milliseconds / 1000)}s`;
  } else if (milliseconds < 3600000) {
    return `${Math.floor(milliseconds / 60000)}m ${Math.floor((milliseconds % 60000) / 1000)}s`;
  } else if (milliseconds < 86400000) {
    return `${Math.floor(milliseconds / 3600000)}h ${Math.floor((milliseconds % 3600000) / 60000)}m`;
  } else {
    return `${Math.floor(milliseconds / 86400000)}d ${Math.floor((milliseconds % 86400000) / 3600000)}h`;
  }
}

module.exports = {
  formatNumber,
  formatLargeNumber,
  formatPercentage,
  formatDuration
}; 