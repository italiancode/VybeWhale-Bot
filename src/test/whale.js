// src/test/whale.js
require('dotenv').config(); // Load environment variables

const { getWhaleTransactions } = require('../services/vybeApi/whaleTransactions');
const logger = require('../utils/logger');

// Test configuration
const mintAddress = '38PgzpJYu2HkiYvV8qePFakB8tuobPdGm2FFEn7Dpump'; // SOL token address
const minUsdAmount = 1000; // Increased threshold to test filtering
const limit = 5; // Number of transactions to fetch

console.log(`🐋 Testing whale transactions API...`);
console.log(`🔹 Token address: ${mintAddress}`);
console.log(`🔹 Min USD amount: $${minUsdAmount.toLocaleString()}`);
console.log(`🔹 Limit: ${limit} transactions`);
console.log('---------------------------------------------');

// Execute the whale transaction API call and log results
getWhaleTransactions(mintAddress, minUsdAmount, limit)
  .then(data => {
    console.log('✅ Whale transactions fetched successfully!');
    console.log(`Found ${data?.length || 0} whale transactions.`);
    
    if (data && data.length > 0) {
      data.forEach((tx, index) => {
        const amount = tx.usdAmount || tx.valueUsd || 'Unknown';
        console.log(`📊 Transaction #${index + 1}: $${typeof amount === 'number' ? amount.toLocaleString() : amount}`);
        console.log(`   From: ${tx.senderAddress?.substring(0, 10)}... to ${tx.receiverAddress?.substring(0, 10)}...`);
        console.log(`   Time: ${new Date(tx.blockTime * 1000).toISOString()}`);
      });
    } else {
      console.log('⚠️ No transactions found matching criteria.');
    }
    
    console.log('\nFull response data:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('❌ Error fetching whale transactions:');
    console.error(error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }
  });