const axios = require('axios');
const logger = require('../utils/logger');

class VybeAPI {
    constructor() {
        this.api = axios.create({
            baseURL: process.env.VYBE_API_BASE_URL,
            headers: {
                'Authorization': `Bearer ${process.env.VYBE_API_KEY}`,
                'x-api-key': process.env.VYBE_API_KEY,
                'Content-Type': 'application/json'
            }
        });
    }

    async getTokenInfo(mintAddress) {
        try {
            const response = await this.api.get(`/token/${mintAddress}`);
            return response.data;
        } catch (error) {
            logger.error('Error fetching token info:', error);
            throw error;
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

    async getWalletInfo(walletAddress) {
        try {
            const response = await this.api.get(`/account/${walletAddress}`, {
                params: {
                    includeTokens: true,
                    includeNFTs: true
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching wallet info:', error);
            throw error;
        }
    }

    async trackWallet(walletAddress) {
        try {
            const response = await this.api.post('/tracking/wallet', {
                walletAddress,
                notificationType: 'all' // Track all types of activities
            });
            return response.data;
        } catch (error) {
            logger.error('Error tracking wallet:', error);
            throw error;
        }
    }

    async untrackWallet(walletAddress) {
        try {
            const response = await this.api.delete(`/tracking/wallet/${walletAddress}`);
            return response.data;
        } catch (error) {
            logger.error('Error untracking wallet:', error);
            throw error;
        }
    }

    async isWalletTracked(walletAddress) {
        try {
            const response = await this.api.get(`/tracking/wallet/${walletAddress}/status`);
            return response.data.isTracked;
        } catch (error) {
            logger.error('Error checking wallet tracking status:', error);
            throw error;
        }
    }

    async getTrackedWallets() {
        try {
            const response = await this.api.get('/tracking/wallets');
            return response.data.wallets;
        } catch (error) {
            logger.error('Error fetching tracked wallets:', error);
            throw error;
        }
    }
}

module.exports = new VybeAPI(); 
