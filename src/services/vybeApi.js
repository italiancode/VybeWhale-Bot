const axios = require("axios");
const logger = require("../utils/logger");
const tokenHolders = require("./vybeApi/tokenHolders");

class VybeAPI {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.VYBE_API_BASE_URL,
      headers: {
        // 'Authorization': `Bearer ${process.env.VYBE_API_KEY}`,
        "x-api-key": process.env.VYBE_API_KEY,
        "Content-Type": "application/json",
      },
    });
  }

  async getTokenInfo(mintAddress) {
    try {
      const response = await this.api.get(`/token/${mintAddress}`);
      return response.data;
    } catch (error) {
      logger.error("Error fetching token info:", error);
      throw error;
    }
  }

  // The following methods are unused in the command files, so they've been removed:
  // - getWhaleTransactions (now using the specialized version from whaleTransactions.js)
  // - getBotWhaleTransactions (replaced by functions in whaleTransactions.js)
  // - getWalletTokenBalance
  // - getTokenTopHolders (replaced by getTopTokenHolders in topTokenHolder.js)
  // - getTokenTransferVolume
  // - getWalletInfo
  // - trackWallet
  // - untrackWallet
  // - isWalletTracked
  // - getTrackedWallets
}

module.exports = new VybeAPI();
