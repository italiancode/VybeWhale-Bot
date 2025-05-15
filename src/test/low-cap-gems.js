require('dotenv').config();
const vybeApi = require('@api/vybe-api');
const { findLowCapGems } = require('../services/vybeApi/lowCapGems');
const { formatLowCapGemsMessage } = require('../messages/gemMessages');

// Initialize the API
vybeApi.auth(process.env.VYBE_API_KEY);

// Test wallet address - you can change this to any wallet you want to test
const TEST_WALLET = '42e6KaraNpvvHUrcUt33GcQYmxaPN6vp5HdT39xVYiJR';

/**
 * Main test function
 */
async function runTest() {
  console.log('='.repeat(50));
  console.log('TESTING LOW CAP GEMS FUNCTIONALITY');
  console.log('='.repeat(50));
  console.log(`\nTesting wallet: ${TEST_WALLET}`);

  try {
    console.log('\n1. Finding low cap gems in wallet...');
    const startTime = Date.now();
    
    const gems = await findLowCapGems(TEST_WALLET);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`\n✅ Found ${gems.length} low cap gems in ${duration.toFixed(2)} seconds`);
    
    if (gems.length > 0) {
      console.log('\n🔍 Low Cap Gem Details:');
      gems.forEach((gem, index) => {
        console.log(`\n--- Gem #${index + 1}: ${gem.symbol} ---`);
        console.log(`• Name: ${gem.name}`);
        console.log(`• Symbol: ${gem.symbol}`);
        console.log(`• Mint Address: ${gem.mintAddress}`);
        console.log(`• Market Cap: $${formatNumber(gem.marketCap)}`);
        console.log(`• Price: $${gem.price.toFixed(gem.price < 0.01 ? 8 : 4)}`);
        console.log(`• Balance: ${gem.balance.toLocaleString(undefined, {
          maximumFractionDigits: gem.balance >= 1 ? 2 : 6
        })}`);
        console.log(`• USD Value: $${gem.value.toFixed(2)}`);
        console.log(`• Whale Activity (24h): ${gem.whaleActivity >= 0 ? '+' : ''}${gem.whaleActivity.toFixed(2)}%`);
        console.log(`• Holders Trend (7d): ${gem.holdersTrend >= 0 ? '+' : ''}${gem.holdersTrend.toFixed(2)}%`);
        console.log(`• Holder Count: ${gem.holderCount}`);
        console.log(`• Verified: ${gem.verified ? 'Yes' : 'No'}`);
      });

      // Test message formatting
      console.log('\n2. Testing message formatting...');
      const message = formatLowCapGemsMessage(TEST_WALLET, gems);
      
      console.log('\n✅ Message formatting successful!');
      console.log('\n--- Message Preview ---');
      console.log(message.text);
    } else {
      console.log('\n⚠️ No low cap gems found in this wallet. Try a different wallet address.');
      
      // Test message formatting for empty results
      const message = formatLowCapGemsMessage(TEST_WALLET, []);
      console.log('\n--- Empty Results Message ---');
      console.log(message.text);
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