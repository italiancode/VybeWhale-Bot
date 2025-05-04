// src/test/whale.test.js
require('dotenv').config(); // Load environment variables

const { getWhaleTransactions } = require('../services/vybeApi/whaleTransactions');


// We're using the real logger for seeing actual output
const logger = require('../utils/logger');


const mintAddress = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
// Set the minimum USD amount - make it low enough to get some results
const minUsdAmount = 5000; 
const limit = 5; // Get more results for testing


// Execute the whale transaction API call and log results
getWhaleTransactions(mintAddress, minUsdAmount, limit)
  .then(data => {
    console.log('Whale transactions fetched successfully:');
    
    // Debug: Log the shape of the data
    console.log('Data type:', typeof data);
    console.log('Is Array:', Array.isArray(data));
    if (typeof data === 'object') {
      console.log('Object keys:', Object.keys(data));
    }
    
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Error fetching whale transactions:');
    console.error(error);
  });