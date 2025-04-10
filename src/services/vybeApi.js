const axios = require('axios');
const logger = require('../utils/logger');

class VybeAPI {
    constructor() {
        if (!process.env.VYBE_API_BASE_URL) {
            throw new Error('VYBE_API_BASE_URL environment variable is not configured');
        }
        if (!process.env.VYBE_API_KEY) {
            throw new Error('VYBE_API_KEY environment variable is not configured');
        }

        console.log('Initializing VybeAPI with base URL:', process.env.VYBE_API_BASE_URL);
        
        this.api = axios.create({
            baseURL: process.env.VYBE_API_BASE_URL,
            headers: {
                'Authorization': `Bearer ${process.env.VYBE_API_KEY}`,
                'x-api-key': process.env.VYBE_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for debugging
        this.api.interceptors.request.use(request => {
            console.log('Making request to:', request.baseURL + request.url);
            return request;
        });
    }

    async getTokenInfo(mintAddress) {
        try {
            console.log(`Fetching token info for mint address: ${mintAddress}`);
            const response = await this.api.get(`/token/${mintAddress}`);
            return response.data;
        } catch (error) {
            logger.error('Error fetching token info:', {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data,
                mintAddress,
                url: error.config?.url
            });
            throw new Error(`Failed to fetch token info: ${error.response?.data?.message || error.message}`);
        }
    }

    async getWhaleTransactions(mintAddress, minUsdAmount = process.env.DEFAULT_WHALE_THRESHOLD) {
        try {
            const response = await this.api.get('/token/transfers', {
                params: {
                    mintAddress,
                    minUsdAmount,
                    limit: 10, // Get top 10 whale transactions
                    sortByDesc: 'usdAmount' // Sort by largest transactions first
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching whale transactions:', error);
            throw error;
        }
    }

    async getWalletTokenBalance(ownerAddress) {
        try {
            const response = await this.api.get(`/account/token-balance/${ownerAddress}`, {
                params: {
                    includeNoPriceBalance: true,
                    limit: 100 // Get top 100 tokens by value
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching wallet token balance:', error);
            throw error;
        }
    }

    async getTokenTopHolders(mintAddress) {
        try {
            const response = await this.api.get(`/token/${mintAddress}/top-holders`, {
                params: {
                    limit: 10 // Get top 10 holders
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching token top holders:', error);
            throw error;
        }
    }

    async getTokenTransferVolume(mintId, startTime, endTime) {
        try {
            const response = await this.api.get(`/token/${mintId}/transfer-volume`, {
                params: {
                    startTime,
                    endTime,
                    interval: '1d' // Daily intervals
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching token transfer volume:', error);
            throw error;
        }
    }
}

module.exports = new VybeAPI(); 
