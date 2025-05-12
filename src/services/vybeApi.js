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
}

module.exports = new VybeAPI();
