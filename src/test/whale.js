// src/test/whale.js
require("dotenv").config(); // Load environment variables

const { getTokenTrades } = require("../services/vybeApi/tokenTrades");
// const {
//   getWhaleTransactions,
// } = require("../services/vybeApi/whaleTransactions");
// const logger = require("../utils/logger");

// // Test configuration
// const mintAddress = "38PgzpJYu2HkiYvV8qePFakB8tuobPdGm2FFEn7Dpump"; // SOL token address
// const minUsdAmount = 1000; // Increased threshold to test filtering
// const limit = 5; // Number of transactions to fetch

// console.log(`🐋 Testing whale transactions API...`);
// console.log(`🔹 Token address: ${mintAddress}`);
// console.log(`🔹 Min USD amount: $${minUsdAmount.toLocaleString()}`);
// console.log(`🔹 Limit: ${limit} transactions`);
// console.log("---------------------------------------------");

// Execute the whale transaction API call and log results
// getWhaleTransactions(mintAddress, minUsdAmount, limit)
//   .then(data => {
//     console.log('✅ Whale transactions fetched successfully!');
//     console.log(`Found ${data?.length || 0} whale transactions.`);

//     if (data && data.length > 0) {
//       data.forEach((tx, index) => {
//         const amount = tx.usdAmount || tx.valueUsd || 'Unknown';
//         console.log(`📊 Transaction #${index + 1}: $${typeof amount === 'number' ? amount.toLocaleString() : amount}`);
//         console.log(`   From: ${tx.senderAddress?.substring(0, 10)}... to ${tx.receiverAddress?.substring(0, 10)}...`);
//         console.log(`   Time: ${new Date(tx.blockTime * 1000).toISOString()}`);
//       });
//     } else {
//       console.log('⚠️ No transactions found matching criteria.');
//     }

//     console.log('\nFull response data:');
//     console.log(JSON.stringify(data, null, 2));
//   })
//   .catch(error => {
//     console.error('❌ Error fetching whale transactions:');
//     console.error(error.message);
//     if (error.response) {
//       console.error('API Response:', error.response.status, error.response.data);
//     }
//   });

async function testTrades() {
  try {
    const mintAddress = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"; // BONK
    const trades = await getTokenTrades({
      mintAddress,
      // programIds: null, // Fetch across all programs
      timeRangeHours: 24,
      limit: 100,
      // limitPerProgram: 1,
      // minTradeValueUSD: 10000, // Filter for trades worth at least $10,000
    });

    if (trades.length === 0) {
      console.log(
        `No whale transactions found for token ${mintAddress} with value >= $10,000.`
      );
      return;
    }

    console.log(`Recent whale transactions for token ${mintAddress}:`);
    trades.forEach((trade, index) => {
      console.log(`${index + 1}.`);
      console.log(`  Program: ${trade.programId}`);
      console.log(`  Pair: ${trade.pair}`);
      console.log(`  Direction: ${trade.direction} ${trade.directionContext}`);

      if (trade.baseValueUSD) {
        console.log(`  Base Value: $${trade.baseValueUSD}`);
      }

      if (trade.quoteValueUSD) {
        console.log(`  Quote Value: $${trade.quoteValueUSD}`);
      }

      console.log(`  Price: ${trade.price} (quote per base)`);
      console.log(`  Base Size: ${trade.baseSize}`);
      console.log(`  Quote Size: ${trade.quoteSize}`);
      console.log(`  Timestamp: ${trade.timestamp}`);
      console.log(`  Signature: ${trade.signature.substring(0, 20)}...`);
      console.log("---");
    });

    console.log("\nSummary:");
    console.log(`  Total trades: ${trades.length}`);
  } catch (error) {
    console.error("Failed to fetch whale transactions:", error.message);
  }
}

// Run the example
testTrades();
