const { getWalletPerformance } = require('../services/vybeApi/walletTokens');
const { getWalletTradingPerformance } = require('../services/vybeApi/walletPnl');
const logger = require('../utils/logger');
const stateManager = require('../utils/stateManager');

/**
 * Format USD values for display
 */
function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format percentage values for display
 */
function formatPercentage(value) {
  // For IntlNumberFormat, the value 0.01 will format as 1%
  // If API returns 0.91, we need to format it as 0.91%

  // First, ensure we're working with a number
  const numValue = parseFloat(value);
  
  // Create the formatter with options for percentage display
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Format using the appropriate decimal conversion
  return formatter.format(numValue / 100);
}

/**
 * Handle the initial wallet performance command
 */
async function handleWalletPerformance(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if a wallet address was provided directly in the command
    const commandArgs = msg.text.split(' ');
    if (commandArgs.length > 1) {
      const walletAddress = commandArgs[1].trim();
      
      // Check for optional days parameter
      let days = 14; // Default to 14 days
      if (commandArgs.length > 2 && !isNaN(parseInt(commandArgs[2]))) {
        days = Math.min(Math.max(1, parseInt(commandArgs[2])), 30); // Ensure between 1-30
      }
      
      // Validate Solana wallet address
      if (walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        // Process the wallet address directly
        await processWalletPerformance(bot, chatId, walletAddress, days);
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
      command: "walletperformance",
      step: "awaiting_wallet",
      timestamp: Date.now(),
    });

    const message =
      `📊 *Wallet Performance Analysis*\n\n` +
      `Please enter the *Solana wallet address* you want to analyze.\n\n` +
      `Example Format:\n` +
      `\`5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1\`\n\n` +
      `_You can optionally specify the number of days (1-30) for analysis after entering the wallet address._`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    logger.info(`Wallet performance command initiated for user ${userId}`);
  } catch (error) {
    logger.error("Error in wallet performance command:", error);
    await bot.sendMessage(
      msg.chat.id,
      "Sorry, something went wrong. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

/**
 * Handle wallet input for performance analysis
 */
async function handleWalletPerformanceInput(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = stateManager.getState(userId);

    if (!userState || userState.command !== "walletperformance") {
      return;
    }

    // Check for state timeout (e.g., 5 minutes)
    if (Date.now() - userState.timestamp > 5 * 60 * 1000) {
      stateManager.clearState(userId);
      await bot.sendMessage(
        chatId,
        "⏰ Wallet performance session timed out. Please start again with /walletperformance"
      );
      return;
    }

    const input = msg.text.trim().split(/\s+/);
    const walletAddress = input[0];
    
    // Check for optional days parameter
    let days = 14; // Default to 14 days
    if (input.length > 1 && !isNaN(parseInt(input[1]))) {
      days = Math.min(Math.max(1, parseInt(input[1])), 30); // Ensure between 1-30
    }

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

    await processWalletPerformance(bot, chatId, walletAddress, days);
    
    // Clear user state
    stateManager.clearState(userId);
  } catch (error) {
    logger.error("Error processing wallet performance input:", error);
    await bot.sendMessage(
      msg.chat.id,
      "❌ Error analyzing wallet. Please try again later."
    );
    stateManager.clearState(msg.from.id);
  }
}

/**
 * Convert days to PnL resolution
 */
function daysToResolution(days) {
  if (days <= 1) return '1d';
  if (days <= 7) return '7d';
  return '30d';
}

/**
 * Process wallet performance analysis with PnL data
 */
async function processWalletPerformance(bot, chatId, walletAddress, days = 14) {
  try {
    // Show typing indicator while fetching data
    await bot.sendChatAction(chatId, "typing");

    logger.info(`Analyzing wallet performance for ${walletAddress} (${days} days)`);
    
    // First send a message that we're analyzing
    const processingMsg = await bot.sendMessage(
      chatId,
      `🔍 Analyzing wallet performance for \`${walletAddress}\` over the last ${days} days...\n\nThis may take a moment.`,
      { parse_mode: "Markdown" }
    );
    
    // Get wallet performance data (balance history)
    const performance = await getWalletPerformance(walletAddress, days);
    
    // Log the raw performance data for debugging
    logger.info(`Wallet performance data for ${walletAddress}: ${JSON.stringify({
      hasData: !!performance,
      currentValue: performance?.currentValue,
      holdingsCount: performance?.topHoldings?.length || 0,
      hasDailyValues: performance?.performance?.dailyValues?.length > 0
    })}`);
    
    // Log specific price change values
    if (performance?.topHoldings?.length > 0) {
      performance.topHoldings.forEach(token => {
        logger.info(`Token ${token.symbol} price change: raw=${token.priceChange1d}, processed=${formatPercentage(token.priceChange1d)}`);
      });
    }
    
    // Get wallet trading performance (PnL data)
    // Convert days to appropriate resolution
    const resolution = daysToResolution(days);
    const tradingPerformance = await getWalletTradingPerformance(walletAddress, resolution);
    
    // Check if we got valid data for balance history
    if (!performance || !performance.performance || !performance.performance.dailyValues || performance.performance.dailyValues.length === 0) {
      await bot.sendMessage(
        chatId,
        `❌ No performance data available for wallet \`${walletAddress}\`. The wallet may be new or have no transaction history.`,
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    // Format change indicators for balance performance
    const change = performance.performance.change;
    const direction = change.absolute >= 0 ? '📈' : '📉';
    
    // Check for inconsistent data - if current value is 0 but showing large performance change
    let changeStr;
    if (performance.currentValue <= 0 && Math.abs(change.absolute) > 1000) {
      changeStr = `⚠️ Data anomaly detected`;
      logger.warn(`Data anomaly: Wallet ${walletAddress} shows $0 value but ${change.absolute} change`);
    } else {
      // Format the percentage correctly without using formatPercentage
      const percentageStr = change.percentage.toFixed(2);
      changeStr = `${direction} ${change.absolute >= 0 ? '+' : ''}${formatUSD(change.absolute)} (${percentageStr}%)`;
    }
    
    // Calculate volatility (simple implementation - standard deviation of daily changes)
    const dailyValues = performance.performance.dailyValues;
    let volatility = 'Low';
    if (dailyValues.length > 1) {
      const percentChanges = [];
      for (let i = 1; i < dailyValues.length; i++) {
        const prev = dailyValues[i-1].totalValue;
        const curr = dailyValues[i].totalValue;
        if (prev > 0) {
          percentChanges.push((curr - prev) / prev);
        }
      }
      
      if (percentChanges.length > 0) {
        // Calculate standard deviation of daily percentage changes
        const avg = percentChanges.reduce((sum, val) => sum + val, 0) / percentChanges.length;
        const variance = percentChanges.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / percentChanges.length;
        const stdDev = Math.sqrt(variance);
        
        // Classify volatility
        if (stdDev > 0.05) { // >5% daily std dev
          volatility = 'High';
        } else if (stdDev > 0.02) { // >2% daily std dev
          volatility = 'Medium';
        }
      }
    }
    
    // Check if we have valid trading data
    const hasTradingActivity = tradingPerformance && 
                              tradingPerformance.overview && 
                              tradingPerformance.overview.hasTradeActivity;
    
    // Format the portfolio performance message
    let message = 
      `📊 *Wallet Performance Analysis*\n\n` +
      `*Wallet:* \`${walletAddress}\`\n` +
      `*Period:* Last ${days} days\n` +
      `*Current Value:* ${formatUSD(performance.currentValue)}\n`;
      
    // Only show performance if it's meaningful (not zero and not a data anomaly)
    if (!(performance.currentValue <= 0 && Math.abs(change.absolute) > 1000) && 
        !(Math.abs(change.percentage) < 0.01 && Math.abs(change.absolute) < 0.01)) {
      message += `*Performance:* ${changeStr}\n`;
    }
    
    message +=
      `*Highest Value:* ${formatUSD(performance.performance.highestValue)}\n` +
      `*Lowest Value:* ${formatUSD(performance.performance.lowestValue)}\n` +
      `*Volatility:* ${volatility}\n\n` +
      `*Top Holdings:*\n`;
      
    // Check if topHoldings exists and has items
    if (performance.topHoldings && performance.topHoldings.length > 0) {
      message += performance.topHoldings.slice(0, 5).map((token, i) => {
        // Show symbol, amount, and value
        const amount = parseFloat(token.amount).toLocaleString(undefined, {
          maximumFractionDigits: token.amount >= 1 ? 2 : 6
        });
        return `${i+1}. ${token.symbol}: ${amount} (${formatUSD(token.value)})`;
      }).join('\n');
    } else {
      message += "No holdings data available";
    }
    
    // Add trading performance data if available
    if (hasTradingActivity) {
      const overview = tradingPerformance.overview;
      const totalPnL = overview.totalPnL;
      const winRate = overview.winRate;
      
      message += `\n\n` +
        `🔄 *Trading Performance (${resolution}):*\n` +
        `*Profit/Loss:* ${totalPnL >= 0 ? '✅' : '❌'} ${formatUSD(totalPnL)}\n` +
        `*Win Rate:* ${winRate.toFixed(2)}%\n` +
        `*Trades:* ${overview.tradeCount} (${overview.winningTrades} wins, ${overview.losingTrades} losses)\n` +
        `*Tokens Traded:* ${overview.uniqueTokensTraded}`;
      
      // Add best/worst token data if available
      if (tradingPerformance.bestPerformer) {
        message += `\n\n*Best Trade:* ${tradingPerformance.bestPerformer.tokenSymbol || 'Unknown'} (${formatUSD(tradingPerformance.bestPerformer.totalPnL)})`;
      }
      if (tradingPerformance.worstPerformer) {
        message += `\n*Worst Trade:* ${tradingPerformance.worstPerformer.tokenSymbol || 'Unknown'} (${formatUSD(tradingPerformance.worstPerformer.totalPnL)})`;
      }
    }
    
    // Add link to view wallet on Vybe Alpha instead of Solscan
    message += `\n\n[View on Vybe Alpha 🔍](https://vybe.fyi/wallets/${walletAddress})`;
    
    // Create a keyboard with time period options
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "7 Days", callback_data: `wallet_period:${walletAddress}:7` },
          { text: "14 Days", callback_data: `wallet_period:${walletAddress}:14` },
          { text: "30 Days", callback_data: `wallet_period:${walletAddress}:30` }
        ]
      ]
    };
    
    // Add a second row of buttons for PnL timeframes if trading activity exists
    if (hasTradingActivity) {
      inlineKeyboard.inline_keyboard.push([
        { text: "1D PnL", callback_data: `wallet_pnl:${walletAddress}:1d` },
        { text: "7D PnL", callback_data: `wallet_pnl:${walletAddress}:7d` },
        { text: "30D PnL", callback_data: `wallet_pnl:${walletAddress}:30d` }
      ]);
    }
    
    // Send the analysis message
    await bot.sendMessage(chatId, message, { 
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: inlineKeyboard
    });
    
    logger.info(`Sent wallet performance analysis for ${walletAddress} to chat ${chatId}`);
  } catch (error) {
    logger.error(`Error processing wallet performance: ${error.message}`, { error });
    await bot.sendMessage(
      chatId,
      "❌ Error analyzing wallet performance. Please try again later."
    );
  }
}

/**
 * Process and send detailed PnL analysis
 */
async function processWalletPnLDetail(bot, chatId, walletAddress, resolution = "7d") {
  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, "typing");
    
    logger.info(`Fetching detailed PnL for wallet: ${walletAddress} (${resolution})`);
    
    // Get wallet trading performance
    const tradingPerformance = await getWalletTradingPerformance(walletAddress, resolution);
    
    // Check if we have valid trading data
    const hasTradingActivity = tradingPerformance && 
                              tradingPerformance.overview && 
                              tradingPerformance.overview.hasTradeActivity;
    
    if (!hasTradingActivity) {
      await bot.sendMessage(
        chatId,
        `📊 No trading activity found for this wallet in the selected time period (${resolution}).`,
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    const overview = tradingPerformance.overview;
    
    // Format the resolution for display
    let periodText = "1 day";
    if (resolution === "7d") periodText = "7 days";
    if (resolution === "30d") periodText = "30 days";
    
    // Create detailed PnL message
    let message = 
      `🔄 *Detailed Trading Performance*\n\n` +
      `*Wallet:* \`${walletAddress}\`\n` +
      `*Period:* Last ${periodText}\n\n` +
      
      `*Profit & Loss:*\n` +
      `• Total P&L: ${formatUSD(overview.totalPnL)}\n` +
      `• Realized P&L: ${formatUSD(overview.realizedPnL)}\n` +
      `• Unrealized P&L: ${formatUSD(overview.unrealizedPnL)}\n\n` +
      
      `*Trading Stats:*\n` +
      `• Win Rate: ${overview.winRate.toFixed(2)}%\n` +
      `• Trades: ${overview.tradeCount} total\n` +
      `• Winning Trades: ${overview.winningTrades}\n` +
      `• Losing Trades: ${overview.losingTrades}\n` +
      `• Average Trade: ${formatUSD(overview.averageTradeSize)}\n` +
      `• Tokens Traded: ${overview.uniqueTokensTraded}\n\n`;
    
    // Add token performance details
    if (tradingPerformance.tokenPerformance && tradingPerformance.tokenPerformance.length > 0) {
      message += `*Top Performing Tokens:*\n`;
      
      // Sort by total PnL and show top 5
      const topTokens = [...tradingPerformance.tokenPerformance]
        .sort((a, b) => b.totalPnL - a.totalPnL)
        .slice(0, 5);
      
      topTokens.forEach((token, i) => {
        const symbol = token.tokenSymbol || 'Unknown';
        const pnl = formatUSD(token.totalPnL);
        const roi = token.roi.toFixed(2) + '%';
        const status = token.isProfitable ? '✅' : '❌';
        
        message += `${i+1}. ${status} ${symbol}: ${pnl} (ROI: ${roi})\n`;
      });
    }
    
    // Add link to view wallet on Vybe Alpha instead of Solscan
    message += `\n\n[View on Vybe Alpha 🔍](https://vybe.fyi/wallets/${walletAddress})`;
    
    // Create a keyboard with time period options
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "1D PnL", callback_data: `wallet_pnl:${walletAddress}:1d` },
          { text: "7D PnL", callback_data: `wallet_pnl:${walletAddress}:7d` },
          { text: "30D PnL", callback_data: `wallet_pnl:${walletAddress}:30d` }
        ],
        [
          { text: "« Back to Performance", callback_data: `wallet_performance:${walletAddress}` }
        ]
      ]
    };
    
    // Send the PnL analysis message
    await bot.sendMessage(chatId, message, { 
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: inlineKeyboard
    });
    
    logger.info(`Sent detailed PnL analysis for ${walletAddress} to chat ${chatId}`);
  } catch (error) {
    logger.error(`Error processing wallet PnL detail: ${error.message}`, { error });
    await bot.sendMessage(
      chatId,
      "❌ Error analyzing trading performance. Please try again later."
    );
  }
}

module.exports = {
  handleWalletPerformance,
  handleWalletPerformanceInput,
  processWalletPnLDetail, // Export for callback handling
  processWalletPerformance // Export for wallet performance callback
};