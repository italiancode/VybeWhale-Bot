const logger = require('../utils/logger');
const stateManager = require('../utils/stateManager');
const { findLowCapGems } = require('../services/vybeApi/lowCapGems');

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
  if (priceChange === null || priceChange === undefined) return '⚪';
  
  // Simple green/red indicators as requested
  if (priceChange > 0) return '🟢'; // Green circle for positive
  if (priceChange < 0) return '🔴'; // Red circle for negative
  return '⚪'; // White circle for unchanged
}

/**
 * Get emoji for trend indicator
 * @param {number|null} trend - Trend value
 * @returns {string} Trend emoji
 */
function getTrendEmoji(trend) {
  if (trend === null || trend === undefined) return '⚪';
  
  // Simple green/red indicators as requested
  if (trend > 0) return '🟢'; // Green circle for positive
  if (trend < 0) return '🔴'; // Red circle for negative
  return '⚪'; // White circle for unchanged
}

/**
 * Format percentage with sign and decimal places
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage with appropriate styling
 */
function formatPercentage(value, decimals = 2) {
  // Special case for zero
  if (value === 0) return '0.00%';
  
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
  const verifiedBadge = gem.verified ? '✅ ' : '';
  const priceEmoji = getPriceEmoji(gem.priceChange24h);
  
  // Simple holder count formatting
  const formattedHolderCount = gem.holderCount 
    ? gem.holderCount >= 1000 
      ? `${(gem.holderCount / 1000).toFixed(1)}K` 
      : gem.holderCount.toLocaleString() 
    : 'Unknown';
  
  // Format holder trends with simple indicators
  const trend7d = gem.holdersTrend;
  const trendEmoji = getTrendEmoji(trend7d);
  const holderTrendText = `Holders: ${formattedHolderCount} ${trendEmoji} ${formatPercentage(trend7d)} (7D)`;
  
  // Simple whale activity text
  const whaleActivityText = `Whale Activity: Coming Soon`;
  
  // Simple price change text
  let priceChangeText = '';
  if (typeof gem.priceChange24h === 'number') {
    priceChangeText = `24h: ${priceEmoji} ${formatPercentage(gem.priceChange24h, 1)}`;
  } else {
    priceChangeText = `24h: ⚪ 0.00%`;
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
    maximumFractionDigits: gem.balance >= 1 ? 2 : 6
  });
  message += `   🏦 Balance: ${balanceFormatted} ${gem.symbol} (${formatUSD(gem.value)})\n`;
  
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
  const shortenedAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  
  // Handle case when no gems are provided
  if (!gems || gems.length === 0) {
    return {
      text: `🔍 *LOW CAP GEMS HELD BY WALLET ${shortenedAddress}*\n` +
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
            {
              text: "🔍 Find Trending Tokens",
              callback_data: `whale_command`,
            }
          ],
        ],
      },
    };
  }
  
  // Filter gems with market cap >= $60K and <= $10M for better quality results
  const filteredGems = gems.filter(gem => gem.marketCap >= 60000 && gem.marketCap <= 10000000);
  
  // Handle no qualifying gems found case with improved messaging
  if (filteredGems.length === 0) {
    return {
      text: `⚠️ *NO QUALIFYING GEMS FOUND*\n\n` +
            `We analyzed wallet \`${shortenedAddress}\` but couldn't find any suitable low cap gems.\n\n` +
            `${gems.length > 0 ? `We filtered out ${gems.length} tokens with market caps less than $60K due to high risk.` : `This wallet doesn't appear to hold any tokens that match our criteria.`}\n\n` +
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
            }
          ],
        ],
      },
    };
  }
  
  // Enhanced header with professional styling
  let message = `💎 *LOW CAP GEM ANALYSIS* 💎\n` +
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
    message += `• Filtered out ${gems.length - filteredGems.length} high-risk tokens (< $60K market cap)\n`;
  }
  message += `• Analysis time: ${new Date().toISOString().split('T')[1].split('.')[0]} UTC\n\n`;
  
  // Add professional tip section with enhanced formatting
  message += `💡 *PRO TIP*: Copy any token address and use /token command for in-depth analysis with price predictions and social metrics.\n\n`;
  
  // Create inline keyboard with enhanced tracking buttons and clear labeling
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "📡 TRACK FULL WALLET",
          callback_data: `track_wallet:${walletAddress}`,
        }
      ],
      [
        {
          text: "💎 TRACK GEMS ONLY",
          callback_data: `track_gems:${walletAddress}`,
        },
        {
          text: "📊 VIEW PERFORMANCE",
          callback_data: `wallet_performance:${walletAddress}`,
        }
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
  const shortenedAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  const tokenInfo = formatTokenInfo(gem);
  
  // Risk assessment section with enhanced styling
  let riskLevel = '';
  let riskEmoji = '';
  
  if (gem.marketCap < 60000) {
    riskLevel = 'HIGH RISK';
    riskEmoji = '🔴';
  } else if (gem.marketCap < 1000000) {
    riskLevel = 'MEDIUM RISK';
    riskEmoji = '🟠';
  } else {
    riskLevel = 'LOWER RISK';
    riskEmoji = '🟢';
  }
  
  const marketCapWarning = gem.marketCap < 60000 
    ? `⚠️ *CAUTION: Very low market cap detected*\n` +
      `This token has a market cap below $60K, which typically indicates higher volatility and risk.\n` 
    : '';
  
  // Premium styled alert header
  let message = `🚨 *NEW GEM DETECTED* 🚨\n` +
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
    maximumFractionDigits: gem.balance >= 1 ? 2 : 6
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
        }
      ],
      [
        {
          text: "🔎 ANALYZE THIS TOKEN",
          callback_data: `analyze_token:${gem.mintAddress}`,
        },
        {
          text: "🚫 STOP GEM ALERTS",
          callback_data: `untrack_gems:${walletAddress}`,
        }
      ],
    ],
  };
  
  return {
    text: message,
    keyboard: inlineKeyboard,
  };
}

/**
 * Handle the lowcap command to analyze wallet for low cap gems
 */
async function handleLowCapCommand(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if a wallet address was provided directly in the command
    const commandArgs = msg.text.split(' ');
    if (commandArgs.length > 1) {
      const walletAddress = commandArgs[1].trim();
      
      // Validate Solana wallet address
      if (walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        // Process the wallet address directly
        await analyzeLowCapGems(bot, chatId, walletAddress, userId);
        return;
      } else {
        await bot.sendMessage(
          chatId,
          "❌ Invalid Solana wallet address format. Please enter a valid Solana wallet address."
        );
        return;
      }
    }

    // Set initial state for wallet input
    stateManager.setState(userId, {
      command: "lowcap",
      step: "awaiting_wallet",
      timestamp: Date.now(),
    });

    const message =
      `🔍 *Low Cap Gem Finder*\n\n` +
      `Please enter the *Solana wallet address* you want to analyze for low cap gems (< $10M market cap).\n\n` +
      `Example Format:\n` +
      `\`5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1\`\n\n` +
      `_Low cap gems often provide higher growth potential but come with increased risk._`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    logger.info(`Low cap gems command initiated for user ${userId}`);
  } catch (error) {
    logger.error("Error in low cap gems command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "Sorry, something went wrong. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

/**
 * Handle wallet input for low cap gem analysis
 */
async function handleLowCapInput(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = stateManager.getState(userId);

    if (!userState || userState.command !== "lowcap") {
      return;
    }

    // Check for state timeout (e.g., 5 minutes)
    if (Date.now() - userState.timestamp > 5 * 60 * 1000) {
      stateManager.clearState(userId);
      await bot.sendMessage(
        chatId,
        "⏰ Low cap gem finder session timed out. Please start again with /lowcap"
      );
      return;
    }

    const walletAddress = msg.text.trim();

    // Check if the input is a command
    if (walletAddress.startsWith("/")) {
      stateManager.clearState(userId);
      return;
    }

    // Validate Solana wallet address format
    if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      await bot.sendMessage(
        chatId,
        "❌ Invalid Solana wallet address format. Please enter a valid Solana wallet address."
      );
      return;
    }

    await analyzeLowCapGems(bot, chatId, walletAddress, userId);
    
    // Clear user state
    stateManager.clearState(userId);
  } catch (error) {
    logger.error("Error processing low cap gems input:", error);
    await bot.sendMessage(
      msg.chat.id,
      "❌ Error analyzing wallet. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

/**
 * Process and display low cap gems for a wallet address
 */
async function analyzeLowCapGems(bot, chatId, walletAddress, userId) {
  try {
    // If userId was not provided, extract it from the message
    if (!userId) {
      userId = chatId; // Default to chatId if no specific userId was provided
    }

    // Create a unique analysis ID to track this request
    const analysisId = `${walletAddress}_${Date.now()}`;
    
    // Show typing indicator while fetching data
    await bot.sendChatAction(chatId, "typing");

    logger.info(`Analyzing low cap gems for wallet ${walletAddress} (ID: ${analysisId})`);
    
    // Send a processing message first
    const processingMsg = await bot.sendMessage(
      chatId,
      `🔍 *Analyzing wallet for low cap gems*\n\nWallet: \`${walletAddress}\`\n\nThis process will take approximately 30-45 seconds. You'll receive a notification when complete.`,
      { parse_mode: "Markdown" }
    );
    
    // Store the analysis state
    const analysisState = {
      chatId,
      userId,
      walletAddress,
      messageId: processingMsg.message_id,
      startTime: Date.now(),
      status: 'processing',
      analysisId
    };
    
    // Periodically update the user with progress
    const progressInterval = setInterval(async () => {
      if (analysisState.status === 'completed' || analysisState.status === 'failed') {
        clearInterval(progressInterval);
        return;
      }
      
      try {
        // Only update if it's been less than 2 minutes
        if (Date.now() - analysisState.startTime < 120000) {
          const elapsedTime = Math.floor((Date.now() - analysisState.startTime) / 1000);
          const progressMessage = `🔍 *Analyzing wallet for low cap gems*\n\nWallet: \`${walletAddress}\`\n\n⏱️ Analysis in progress (${elapsedTime}s)...\n${
            analysisState.statusMessage ? `\n${analysisState.statusMessage}` : ''
          }\n\nThis may take up to a minute. You'll receive a notification when complete.`;
          
          await bot.editMessageText(progressMessage, {
            chat_id: chatId,
            message_id: processingMsg.message_id,
            parse_mode: "Markdown"
          });
        }
      } catch (error) {
        logger.error(`Error updating progress for analysis ${analysisId}:`, error);
        // Don't stop the interval, just skip this update
      }
    }, 10000); // Update every 10 seconds
    
    // Define a progress callback for the analysis
    const progressCallback = (progress) => {
      if (progress.status === 'analyzing') {
        analysisState.statusMessage = `Found ${progress.tokensFound} tokens, analyzing potential gems...`;
      }
    };
    
    // Find low cap gems in the wallet (with progress updates)
    const gems = await findLowCapGems(walletAddress, progressCallback).catch(error => {
      logger.error(`Error in gem analysis for ${analysisId}:`, error);
      analysisState.status = 'failed';
      analysisState.error = error.message;
      clearInterval(progressInterval);
      throw error;
    });
    
    // Mark analysis as completed
    analysisState.status = 'completed';
    clearInterval(progressInterval);
    
    // Format the message
    const message = formatLowCapGemsMessage(walletAddress, gems);
    
    // Track user relationships with the wallet for customized UI
    const redisManager = require('../utils/redis');
    const redisClient = redisManager.getClient();
    
    let isFollowing = false;
    let hasGemAlerts = false;
    
    if (redisClient?.isReady) {
      isFollowing = await redisClient.sIsMember(`user:${userId}:wallets`, walletAddress);
      hasGemAlerts = await redisClient.sIsMember(`wallet:${walletAddress}:gem_users`, chatId.toString());
    }
    
    // Always use the keyboard from the message formatter - this ensures buttons are visible
    try {
      // Edit the processing message with results
      await bot.editMessageText(message.text, {
        chat_id: chatId,
        message_id: processingMsg.message_id,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: message.keyboard // Use the keyboard from formatLowCapGemsMessage
      });
      
      logger.info(`Sent low cap gems analysis for ${walletAddress} to chat ${chatId} (found ${gems.length} gems)`);
    } catch (editError) {
      // If editing fails (user may have left chat), send as a new message
      logger.warn(`Could not edit message for analysis ${analysisId}, sending as new message: ${editError.message}`);
      
      try {
        // Send as a new message (notification)
        await bot.sendMessage(chatId, 
          `🔍 *Low Cap Gems Analysis Completed*\n\n${message.text}`, 
          {
            parse_mode: "Markdown",
            disable_web_page_preview: true,
            reply_markup: message.keyboard // Use the keyboard from formatLowCapGemsMessage
          }
        );
      } catch (sendError) {
        logger.error(`Failed to send results to chat ${chatId} for analysis ${analysisId}:`, sendError);
      }
    }
  } catch (error) {
    logger.error(`Error analyzing low cap gems: ${error.message}`, { error });
    try {
      await bot.sendMessage(
        chatId,
        "❌ Error analyzing wallet for low cap gems. Please try again later."
      );
    } catch (sendError) {
      logger.error(`Failed to send error message to chat ${chatId}:`, sendError);
    }
  }
}

module.exports = {
  handleLowCapCommand,
  handleLowCapInput,
  analyzeLowCapGems,
  formatLowCapGemsMessage,
  formatNewGemAlertMessage
}; 