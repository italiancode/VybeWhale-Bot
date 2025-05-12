require('dotenv').config();
const { 
  getWalletPnL, 
  processPnLData,
  getWalletTradingPerformance
} = require('../services/vybeApi/walletPnl');

// Test wallet address (you may need to replace this with a wallet that has trading activity)
const TEST_WALLET = '12QcuqcSMZ3YX2B6268hhTRTBCiWrX4HjJAAGTRvN7nZ';

/**
 * Format USD values for display
 */
function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format percentage values for display
 */
function formatPercentage(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

/**
 * Test basic PnL data retrieval
 */
async function testWalletPnL() {
  console.log('\n=== WALLET PNL DATA ===');
  
  try {
    console.log(`Fetching PnL data for wallet: ${TEST_WALLET} (1-day resolution)`);
    const pnlData = await getWalletPnL(TEST_WALLET, { resolution: '1d' });
    
    const summary = pnlData.summary || {};
    console.log('\nSummary:');
    console.log(`Win Rate: ${formatPercentage(summary.winRate || 0)}`);
    console.log(`Realized PnL: ${formatUSD(summary.realizedPnlUsd || 0)}`);
    console.log(`Unrealized PnL: ${formatUSD(summary.unrealizedPnlUsd || 0)}`);
    console.log(`Unique Tokens Traded: ${summary.uniqueTokensTraded || 0}`);
    console.log(`Trades Count: ${summary.tradesCount || 0}`);
    
    const tokenMetrics = pnlData.tokenMetrics || [];
    console.log(`\nToken Metrics: ${tokenMetrics.length} tokens`);
    
    if (tokenMetrics.length > 0) {
      console.log('\nTop tokens by realized PnL:');
      const sortedTokens = [...tokenMetrics].sort((a, b) => 
        parseFloat(b.realizedPnlUsd || 0) - parseFloat(a.realizedPnlUsd || 0)
      );
      
      sortedTokens.slice(0, 3).forEach((token, index) => {
        console.log(`${index + 1}. ${token.tokenSymbol || 'Unknown'}: ${formatUSD(token.realizedPnlUsd || 0)}`);
      });
    }
    
    return pnlData;
  } catch (error) {
    console.error('Error testing wallet PnL:', error);
  }
}

/**
 * Test processed PnL data with enhanced metrics
 */
async function testProcessedPnLData() {
  console.log('\n=== PROCESSED WALLET TRADING PERFORMANCE ===');
  
  try {
    console.log(`Analyzing trading performance for wallet: ${TEST_WALLET} (7-day resolution)`);
    const performance = await getWalletTradingPerformance(TEST_WALLET, '7d');
    
    if (!performance.overview.hasTradeActivity) {
      console.log('\nNo trade activity found for this wallet in the specified period.');
      return performance;
    }
    
    const overview = performance.overview;
    console.log('\nPerformance Overview:');
    console.log(`Total PnL: ${formatUSD(overview.totalPnL)} (${formatUSD(overview.realizedPnL)} realized, ${formatUSD(overview.unrealizedPnL)} unrealized)`);
    console.log(`Win Rate: ${formatPercentage(overview.winRate)}`);
    console.log(`Trade Count: ${overview.tradeCount} (${overview.winningTrades} winning, ${overview.losingTrades} losing)`);
    console.log(`Average Trade Size: ${formatUSD(overview.averageTradeSize)}`);
    console.log(`Unique Tokens Traded: ${overview.uniqueTokensTraded}`);
    
    if (performance.bestPerformer) {
      console.log('\nBest Performing Token:');
      const best = performance.bestPerformer;
      console.log(`${best.tokenSymbol || 'Unknown'}: ${formatUSD(best.totalPnL)}`);
      console.log(`ROI: ${formatPercentage(best.roi)}`);
    }
    
    if (performance.worstPerformer) {
      console.log('\nWorst Performing Token:');
      const worst = performance.worstPerformer;
      console.log(`${worst.tokenSymbol || 'Unknown'}: ${formatUSD(worst.totalPnL)}`);
      console.log(`ROI: ${formatPercentage(worst.roi)}`);
    }
    
    console.log('\nToken Performance:');
    performance.tokenPerformance.slice(0, 5).forEach((token, index) => {
      console.log(`${index + 1}. ${token.tokenSymbol || 'Unknown'}: ${formatUSD(token.totalPnL)} (ROI: ${formatPercentage(token.roi)})`);
    });
    
    return performance;
  } catch (error) {
    console.error('Error testing processed PnL data:', error);
  }
}

/**
 * Test time period comparison
 */
async function testTimePeriodComparison() {
  console.log('\n=== TIME PERIOD COMPARISON ===');
  
  try {
    console.log(`Comparing performance periods for wallet: ${TEST_WALLET}`);
    
    // Get performance for different time periods
    const [day1, day7, day30] = await Promise.all([
      getWalletTradingPerformance(TEST_WALLET, '1d'),
      getWalletTradingPerformance(TEST_WALLET, '7d'),
      getWalletTradingPerformance(TEST_WALLET, '30d')
    ]);
    
    console.log('\nPerformance Summary by Period:');
    console.table({
      '1 Day': {
        'Total PnL': formatUSD(day1.overview.totalPnL),
        'Win Rate': formatPercentage(day1.overview.winRate),
        'Trade Count': day1.overview.tradeCount,
        'Tokens Traded': day1.overview.uniqueTokensTraded
      },
      '7 Days': {
        'Total PnL': formatUSD(day7.overview.totalPnL),
        'Win Rate': formatPercentage(day7.overview.winRate),
        'Trade Count': day7.overview.tradeCount,
        'Tokens Traded': day7.overview.uniqueTokensTraded
      },
      '30 Days': {
        'Total PnL': formatUSD(day30.overview.totalPnL),
        'Win Rate': formatPercentage(day30.overview.winRate),
        'Trade Count': day30.overview.tradeCount,
        'Tokens Traded': day30.overview.uniqueTokensTraded
      }
    });
    
    return { day1, day7, day30 };
  } catch (error) {
    console.error('Error testing time period comparison:', error);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    // Test basic PnL data
    await testWalletPnL();
    
    // Test processed PnL data with enhanced metrics
    await testProcessedPnLData();
    
    // Test time period comparison
    await testTimePeriodComparison();
    
    console.log('\nTests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Exit the process when done
    process.exit(0);
  }
}

// Execute the tests
runTests(); 