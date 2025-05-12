require('dotenv').config();
const { 
  getWalletTokens, 
  processWalletTokenBalance,
  getWalletTokensTimeSeries, 
  processTimeSeriesData,
  getWalletPerformance
} = require('../services/vybeApi/walletTokens');

// Test wallet address
const TEST_WALLET = '12QcuqcSMZ3YX2B6268hhTRTBCiWrX4HjJAAGTRvN7nZ'; // Example wallet

/**
 * Format USD values for display
 */
function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
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
 * Test current wallet token balances
 */
async function testWalletTokens() {
  console.log('\n=== CURRENT WALLET TOKEN BALANCES ===');
  
  try {
    console.log(`Fetching token balances for wallet: ${TEST_WALLET}`);
    const balanceData = await getWalletTokens(TEST_WALLET);
    
    console.log(`Total token value: ${formatUSD(balanceData.totalTokenValueUsd)}`);
    console.log(`Total token count: ${balanceData.totalTokenCount}`);
    
    // Process the data into a simpler format
    const processedBalance = processWalletTokenBalance(balanceData);
    
    console.log('\nTop tokens by value:');
    processedBalance.tokens.slice(0, 5).forEach((token, index) => {
      console.log(`${index + 1}. ${token.symbol} - ${formatUSD(token.value)} (${token.amount} tokens)`);
    });
    
    return processedBalance;
  } catch (error) {
    console.error('Error testing wallet tokens:', error);
  }
}

/**
 * Test wallet token time series
 */
async function testWalletTimeSeries(days = 14) {
  console.log(`\n=== WALLET PERFORMANCE (${days} DAYS) ===`);
  
  try {
    console.log(`Fetching time series data for wallet: ${TEST_WALLET}`);
    const timeSeriesData = await getWalletTokensTimeSeries(TEST_WALLET, days);
    
    if (!timeSeriesData || !timeSeriesData.data || !timeSeriesData.data.length) {
      console.log('No time series data available');
      return;
    }
    
    const processedData = processTimeSeriesData(timeSeriesData);
    
    console.log('\nPortfolio performance summary:');
    console.log(`Start value: ${formatUSD(processedData.startValue)}`);
    console.log(`End value: ${formatUSD(processedData.endValue)}`);
    console.log(`Change: ${formatUSD(processedData.change.absolute)} (${formatPercentage(processedData.change.percentage)})`);
    console.log(`Highest value: ${formatUSD(processedData.highestValue)}`);
    console.log(`Lowest value: ${formatUSD(processedData.lowestValue)}`);
    
    console.log('\nDaily values:');
    processedData.dailyValues.forEach(day => {
      console.log(`${day.date}: ${formatUSD(day.totalValue)}`);
    });
    
    return processedData;
  } catch (error) {
    console.error('Error testing wallet time series:', error);
  }
}

/**
 * Test comprehensive wallet performance
 */
async function testWalletPerformance(days = 14) {
  console.log(`\n=== COMPREHENSIVE WALLET ANALYSIS (${days} DAYS) ===`);
  
  try {
    console.log(`Analyzing wallet performance for: ${TEST_WALLET}`);
    const performance = await getWalletPerformance(TEST_WALLET, days);
    
    console.log('\nWallet Summary:');
    console.log(`Current value: ${formatUSD(performance.currentValue)}`);
    console.log(`Period: ${performance.period}`);
    
    console.log('\nPerformance:');
    const change = performance.performance.change;
    const direction = change.absolute >= 0 ? '📈' : '📉';
    console.log(`${direction} ${formatUSD(change.absolute)} (${formatPercentage(change.percentage)})`);
    
    console.log('\nTop Holdings:');
    performance.topHoldings.forEach((token, index) => {
      console.log(`${index + 1}. ${token.symbol} - ${formatUSD(token.value)}`);
    });
    
    return performance;
  } catch (error) {
    console.error('Error testing wallet performance:', error);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    // Test getting current token balances
    await testWalletTokens();
    
    // Test getting time series data for different periods
    await testWalletTimeSeries(7);  // 1 week
    
    // Test comprehensive wallet performance
    await testWalletPerformance(30); // 30 days
    
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