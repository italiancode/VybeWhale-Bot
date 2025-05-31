const logger = require('../utils/logger');

/**
 * Message Delivery Service
 * Tracks message delivery success rates and performance
 */
class MessageDeliveryService {
    constructor() {
        this.metrics = {
            totalSent: 0,
            successfulDeliveries: 0,
            failedDeliveries: 0,
            averageDeliveryTime: 120,
            pendingMessages: 0,
            lastDeliveryTime: null
        };
        
        this.deliveryQueue = [];
        this.isProcessing = false;
    }

    /**
     * Get current message delivery metrics
     */
    getMetrics() {
        const successRate = this.metrics.totalSent > 0 
            ? ((this.metrics.successfulDeliveries / this.metrics.totalSent) * 100).toFixed(1)
            : '100.0';

        return {
            successRate: parseFloat(successRate),
            totalSent: this.metrics.totalSent,
            successfulDeliveries: this.metrics.successfulDeliveries,
            failedDeliveries: this.metrics.failedDeliveries,
            averageDeliveryTime: Math.round(this.metrics.averageDeliveryTime),
            pendingMessages: this.metrics.pendingMessages,
            lastDeliveryTime: this.metrics.lastDeliveryTime
        };
    }

    /**
     * Record a successful message delivery
     */
    recordSuccess(deliveryTime = 120) {
        this.metrics.totalSent++;
        this.metrics.successfulDeliveries++;
        this.metrics.lastDeliveryTime = Date.now();
        
        // Update average delivery time
        this.updateAverageDeliveryTime(deliveryTime);
        
        logger.debug(`Message delivered successfully in ${deliveryTime}ms. Success rate: ${this.getMetrics().successRate}%`);
    }

    /**
     * Record a failed message delivery
     */
    recordFailure(deliveryTime = 5000) {
        this.metrics.totalSent++;
        this.metrics.failedDeliveries++;
        
        // Update average delivery time (failures usually take longer)
        this.updateAverageDeliveryTime(deliveryTime);
        
        logger.warn(`Message delivery failed after ${deliveryTime}ms. Success rate: ${this.getMetrics().successRate}%`);
    }

    /**
     * Update average delivery time
     */
    updateAverageDeliveryTime(deliveryTime) {
        const currentAvg = this.metrics.averageDeliveryTime;
        const totalDeliveries = this.metrics.successfulDeliveries + this.metrics.failedDeliveries;
        
        if (totalDeliveries > 0) {
            this.metrics.averageDeliveryTime = ((currentAvg * (totalDeliveries - 1)) + deliveryTime) / totalDeliveries;
        }
    }

    /**
     * Add message to pending queue
     */
    addToPendingQueue(message) {
        this.deliveryQueue.push({
            id: Date.now() + Math.random(),
            message,
            timestamp: Date.now()
        });
        
        this.metrics.pendingMessages = this.deliveryQueue.length;
        
        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Process pending message queue
     */
    async processQueue() {
        if (this.isProcessing || this.deliveryQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        try {
            while (this.deliveryQueue.length > 0) {
                const messageItem = this.deliveryQueue.shift();
                this.metrics.pendingMessages = this.deliveryQueue.length;
                
                const startTime = Date.now();
                
                try {
                    // Simulate message processing
                    await this.simulateDelivery(messageItem);
                    
                    const deliveryTime = Date.now() - startTime;
                    this.recordSuccess(deliveryTime);
                    
                } catch (error) {
                    const deliveryTime = Date.now() - startTime;
                    this.recordFailure(deliveryTime);
                    logger.error('Message delivery failed:', error);
                }
                
                // Small delay between messages to prevent overwhelming
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Simulate message delivery (replace with actual delivery logic)
     */
    async simulateDelivery(messageItem) {
        // Simulate network delay
        const delay = 50 + Math.random() * 200; // 50-250ms
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Simulate occasional failures (5% failure rate)
        if (Math.random() < 0.05) {
            throw new Error('Simulated delivery failure');
        }
        
        return true;
    }

    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            pendingMessages: this.deliveryQueue.length,
            isProcessing: this.isProcessing,
            oldestPendingMessage: this.deliveryQueue.length > 0 
                ? Date.now() - this.deliveryQueue[0].timestamp 
                : null
        };
    }

    /**
     * Clear all pending messages (emergency use)
     */
    clearQueue() {
        const clearedCount = this.deliveryQueue.length;
        this.deliveryQueue = [];
        this.metrics.pendingMessages = 0;
        
        logger.warn(`Cleared ${clearedCount} pending messages from delivery queue`);
        return clearedCount;
    }

    /**
     * Reset all metrics (useful for testing)
     */
    resetMetrics() {
        this.metrics = {
            totalSent: 0,
            successfulDeliveries: 0,
            failedDeliveries: 0,
            averageDeliveryTime: 120,
            pendingMessages: 0,
            lastDeliveryTime: null
        };
        
        this.deliveryQueue = [];
        this.isProcessing = false;
    }

    /**
     * Get detailed metrics for debugging
     */
    getDetailedMetrics() {
        return {
            ...this.metrics,
            queueStatus: this.getQueueStatus(),
            deliveryQueueLength: this.deliveryQueue.length
        };
    }
}

// Create singleton instance
const messageDeliveryService = new MessageDeliveryService();

module.exports = messageDeliveryService;
