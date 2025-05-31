const logger = require('../utils/logger');

/**
 * API Service Health Monitor
 * Tracks API call success rates and circuit breaker status
 */
class ApiService {
    constructor() {
        this.metrics = {
            totalCalls: 0,
            successfulCalls: 0,
            consecutiveFailures: 0,
            circuitBreakerOpen: false,
            lastError: null,
            averageResponseTime: 250
        };
        
        this.circuitBreakerThreshold = 5; // Open after 5 consecutive failures
        this.circuitBreakerTimeout = 30000; // 30 seconds
        this.circuitBreakerTimer = null;
    }

    /**
     * Get current API health status
     */
    getHealthStatus() {
        const successRate = this.metrics.totalCalls > 0 
            ? ((this.metrics.successfulCalls / this.metrics.totalCalls) * 100).toFixed(1)
            : '100.0';

        return {
            successRate: parseFloat(successRate),
            totalCalls: this.metrics.totalCalls,
            consecutiveFailures: this.metrics.consecutiveFailures,
            circuitBreakerOpen: this.metrics.circuitBreakerOpen,
            lastError: this.metrics.lastError,
            averageResponseTime: Math.round(this.metrics.averageResponseTime)
        };
    }

    /**
     * Record a successful API call
     */
    recordSuccess(responseTime = 250) {
        this.metrics.totalCalls++;
        this.metrics.successfulCalls++;
        this.metrics.consecutiveFailures = 0;
        
        // Update average response time
        this.updateAverageResponseTime(responseTime);
        
        // Close circuit breaker if it was open
        if (this.metrics.circuitBreakerOpen) {
            this.closeCircuitBreaker();
        }
        
        logger.debug(`API call successful. Total: ${this.metrics.totalCalls}, Success rate: ${this.getHealthStatus().successRate}%`);
    }

    /**
     * Record a failed API call
     */
    recordFailure(error = null, responseTime = 5000) {
        this.metrics.totalCalls++;
        this.metrics.consecutiveFailures++;
        
        if (error) {
            this.metrics.lastError = error.message || error.toString();
        }
        
        // Update average response time (failures usually take longer)
        this.updateAverageResponseTime(responseTime);
        
        // Check if we should open the circuit breaker
        if (this.metrics.consecutiveFailures >= this.circuitBreakerThreshold && !this.metrics.circuitBreakerOpen) {
            this.openCircuitBreaker();
        }
        
        logger.warn(`API call failed. Consecutive failures: ${this.metrics.consecutiveFailures}, Success rate: ${this.getHealthStatus().successRate}%`);
    }

    /**
     * Update average response time
     */
    updateAverageResponseTime(responseTime) {
        const currentAvg = this.metrics.averageResponseTime;
        const totalCalls = this.metrics.totalCalls;
        
        // Weighted average with more weight on recent calls
        this.metrics.averageResponseTime = ((currentAvg * (totalCalls - 1)) + responseTime) / totalCalls;
    }

    /**
     * Open the circuit breaker
     */
    openCircuitBreaker() {
        this.metrics.circuitBreakerOpen = true;
        logger.warn('Circuit breaker opened due to consecutive API failures');
        
        // Set timer to automatically close circuit breaker
        if (this.circuitBreakerTimer) {
            clearTimeout(this.circuitBreakerTimer);
        }
        
        this.circuitBreakerTimer = setTimeout(() => {
            this.closeCircuitBreaker();
        }, this.circuitBreakerTimeout);
    }

    /**
     * Close the circuit breaker
     */
    closeCircuitBreaker() {
        this.metrics.circuitBreakerOpen = false;
        logger.info('Circuit breaker closed - API calls resumed');
        
        if (this.circuitBreakerTimer) {
            clearTimeout(this.circuitBreakerTimer);
            this.circuitBreakerTimer = null;
        }
    }

    /**
     * Check if API calls should be allowed
     */
    isCallAllowed() {
        return !this.metrics.circuitBreakerOpen;
    }

    /**
     * Reset all metrics (useful for testing)
     */
    resetMetrics() {
        this.metrics = {
            totalCalls: 0,
            successfulCalls: 0,
            consecutiveFailures: 0,
            circuitBreakerOpen: false,
            lastError: null,
            averageResponseTime: 250
        };
        
        if (this.circuitBreakerTimer) {
            clearTimeout(this.circuitBreakerTimer);
            this.circuitBreakerTimer = null;
        }
    }

    /**
     * Get detailed metrics for debugging
     */
    getDetailedMetrics() {
        return {
            ...this.metrics,
            circuitBreakerThreshold: this.circuitBreakerThreshold,
            circuitBreakerTimeout: this.circuitBreakerTimeout,
            isCallAllowed: this.isCallAllowed()
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.circuitBreakerTimer) {
            clearTimeout(this.circuitBreakerTimer);
        }
    }
}

// Create singleton instance
const apiService = new ApiService();

module.exports = apiService;
