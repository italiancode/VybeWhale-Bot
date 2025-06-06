const axios = require("axios");
const logger = require("../utils/logger");
const tokenHolders = require("./vybeApi/tokenHolders");
const apiService = require("./apiService");

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
    const startTime = Date.now();
    try {
      const response = await this.api.get(`/token/${mintAddress}`);
      const responseTime = Date.now() - startTime;

      // Record successful API call
      apiService.recordSuccess(responseTime);

      return response.data;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Record failed API call
      apiService.recordFailure(error, responseTime);

      logger.error("Error fetching token info:", error);
      throw error;
    }
  }
}

module.exports = new VybeAPI();
