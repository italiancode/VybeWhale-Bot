const Redis = require('redis');
const logger = require('./logger');

class RedisManager {
    constructor() {
        this.client = null;
    }

    async initialize() {
        if (this.client) return this.client;

        try {
            this.client = Redis.createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger.error('Redis connection failed after 10 retries');
                            return false;
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });

            this.client.on('error', (err) => {
                logger.error('Redis Client Error:', err);
            });

            this.client.on('connect', () => {
                logger.info('Redis Client Connected');
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            logger.error('Redis Initialization Error:', error);
            throw error;
        }
    }

    async quit() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }

    getClient() {
        return this.client;
    }

    isConnected() {
        return this.client !== null && this.client.isOpen;
    }
}

// Export a singleton instance
module.exports = new RedisManager();