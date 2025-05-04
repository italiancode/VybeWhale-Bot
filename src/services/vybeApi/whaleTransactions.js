const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Fetches whale transactions specifically for bot usage with additional filtering
 * @param {string} mintAddress - The token's mint address
 * @param {number} minUsdAmount - Minimum USD amount for transactions
 * @param {number} limit - Maximum number of transactions to return
 * @returns {Promise<Array>} - Array of filtered whale transactions
 */
async function getWhaleTransactions(mintAddress, minUsdAmount = 10000, limit = 3) {
    try {
        const apiClient = axios.create({
            baseURL: process.env.VYBE_API_BASE_URL,
            headers: {
                'x-api-key': process.env.VYBE_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        const apiMinAmount = Math.max(5000, minUsdAmount * 0.5);
        
        const params = {
            mintAddress,
            limit: Math.min(10, limit * 2),
            sortByDesc: 'amount',
            timeStart: Math.floor(twoDaysAgo.getTime() / 1000)
        };
        
        logger.info(`Fetching bot whale transactions for ${mintAddress} with min amount ${apiMinAmount}`);
        
        const response = await apiClient.get('/token/transfers', { 
            params,
            timeout: 8000
        });
        
        let transactions = response.data;
        
        if (minUsdAmount && transactions.length > 0) {
            transactions = transactions.filter(tx => 
                tx.usdAmount && tx.usdAmount >= Number(minUsdAmount)
            );
            
            transactions = transactions.slice(0, limit);
        }
        
        return transactions;
    } catch (error) {
        if (error.code === 'ECONNABORTED' || 
            (error.response && error.response.status === 408)) {
            logger.warn(`Timeout fetching whale transactions for ${mintAddress}`);
            return [];
        }
        
        throw error;
    }
}

module.exports = {
    getWhaleTransactions
};
