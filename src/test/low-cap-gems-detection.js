require('dotenv').config();
const vybeApi = require('@api/vybe-api');
const { findLowCapGems, detectNewLowCapGems } = require('../services/vybeApi/lowCapGems');
const { formatNewGemAlertMessage } = require('../messages/gemMessages');

// Initialize the API
vybeApi.auth(process.env.VYBE_API_KEY);

// Test wallet address - you can change this to any wallet you want to test
const TEST_WALLET = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1';

/**
 * Main test function
 */
async function runTest() {
  console.log('='.repeat(50));
  console.log('TESTING LOW CAP GEMS DETECTION FUNCTIONALITY');
  console.log('='.repeat(50));
  console.log(`\nTesting wallet: ${TEST_WALLET}`);

  try {
    console.log('\n1. Finding current low cap gems in wallet...');
    const currentGems = await findLowCapGems(TEST_WALLET);
    console.log(`✅ Found ${currentGems.length} low cap gems currently in wallet`);
    
    if (currentGems.length === 0) {
      console.log('⚠️ No gems found in this wallet. The detection test will show empty results.');
    }
    
    // For testing purposes, let's create "previous" gems by removing one if there are any
    let previousGems = [];
    let simulatedNewGem = null;
    
    if (currentGems.length > 0) {
      // Remove one gem to simulate a newly acquired gem
      simulatedNewGem = currentGems[0];
      previousGems = currentGems.slice(1);
      
      console.log(`\n2. Simulating detection by removing one gem (${simulatedNewGem.symbol}) from previous list...`);
    } else {
      console.log('\n2. No gems to simulate with, testing with empty previous list...');
    }
    
    console.log('\n3. Running detectNewLowCapGems to find differences...');
    const newGems = await detectNewLowCapGems(TEST_WALLET, previousGems);
    
    console.log(`\n✅ Detection complete - found ${newGems.length} new gems`);
    
    if (newGems.length > 0) {
      console.log('\n🔍 New Low Cap Gems Detected:');
      newGems.forEach((gem, index) => {
        console.log(`\n--- New Gem #${index + 1}: ${gem.symbol} ---`);
        console.log(`• Market Cap: $${formatNumber(gem.marketCap)}`);
        console.log(`• Balance: ${gem.balance.toLocaleString(undefined, {
          maximumFractionDigits: gem.balance >= 1 ? 2 : 6
        })}`);
        console.log(`• USD Value: $${gem.value.toFixed(2)}`);
      });
      
      // Test alert message formatting
      console.log('\n4. Testing alert message formatting...');
      const alertMessage = formatNewGemAlertMessage(TEST_WALLET, newGems[0]);
      
      console.log('\n✅ Alert message formatting successful!');
      console.log('\n--- Alert Message Preview ---');
      console.log(alertMessage);
    } else {
      console.log('\n⚠️ No new gems detected. This is expected if the wallet had no gems or we had no previous data to compare against.');
    }
    
    // If we simulated a new gem, verify it was detected
    if (simulatedNewGem) {
      const wasDetected = newGems.some(gem => gem.mintAddress === simulatedNewGem.mintAddress);
      if (wasDetected) {
        console.log(`\n✅ Successfully detected the simulated new gem (${simulatedNewGem.symbol})!`);
      } else {
        console.log(`\n❌ Failed to detect the simulated new gem (${simulatedNewGem.symbol})`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error running test:', error.message);
    if (error.data) {
      console.error('API Error Details:', error.data);
    }
    console.error(error.stack);
  }
}

/**
 * Format number with appropriate suffixes (K, M, B)
 */
function formatNumber(num) {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

// Run the test
runTest()
  .then(() => {
    console.log('\n='.repeat(50));
    console.log('TEST COMPLETED');
    console.log('='.repeat(50));
    process.exit(0);
  })
  .catch(err => {
    console.error('Unhandled error in test:', err);
    process.exit(1);
  }); 