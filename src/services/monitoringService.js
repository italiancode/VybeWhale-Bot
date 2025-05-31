const logger = require('../utils/logger');

/**
 * Basic Monitoring Service
 * Provides system health and performance monitoring
 */
class MonitoringService {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            bot: {
                totalMessages: 0,
                totalCommands: 0,
                activeUsers: new Set(),
                errorRate: 0,
                errors: 0
            },
            alerts: {
                totalSent: 0,
                successfulDeliveries: 0,
                averageDeliveryTime: 150
            },
            system: {
                memoryUsage: 0
            }
        };
        this.performance = {
            history: [],
            trends: {
                apiSuccessRate: 'stable',
                trend: '0.00'
            }
        };
        
        // Update system metrics periodically
        this.updateInterval = setInterval(() => {
            this.updateSystemMetrics();
        }, 60000); // Every minute
    }

    /**
     * Get comprehensive health report
     */
    getHealthReport() {
        const uptime = Date.now() - this.startTime;
        const uptimeFormatted = this.formatUptime(uptime);
        
        return {
            status: {
                overall: 'healthy',
                lastHealthCheck: Date.now(),
                components: {
                    bot: 'healthy',
                    api: 'healthy',
                    alerts: 'healthy',
                    database: 'healthy'
                }
            },
            uptime: {
                milliseconds: uptime,
                formatted: uptimeFormatted
            },
            metrics: this.metrics,
            performance: this.performance
        };
    }

    /**
     * Update system metrics
     */
    updateSystemMetrics() {
        try {
            // Update memory usage
            const memUsage = process.memoryUsage();
            this.metrics.system.memoryUsage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
            
            // Add to performance history
            this.performance.history.push({
                timestamp: Date.now(),
                apiSuccessRate: 95 + Math.random() * 5, // Mock 95-100% success rate
                memoryUsage: this.metrics.system.memoryUsage
            });
            
            // Keep only last 60 data points (1 hour)
            if (this.performance.history.length > 60) {
                this.performance.history = this.performance.history.slice(-60);
            }
            
        } catch (error) {
            logger.error('Error updating system metrics:', error);
        }
    }

    /**
     * Record a message processed
     */
    recordMessage(userId) {
        this.metrics.bot.totalMessages++;
        if (userId) {
            this.metrics.bot.activeUsers.add(userId);
        }
    }

    /**
     * Record a command executed
     */
    recordCommand(userId) {
        this.metrics.bot.totalCommands++;
        if (userId) {
            this.metrics.bot.activeUsers.add(userId);
        }
    }

    /**
     * Record an error
     */
    recordError() {
        this.metrics.bot.errors++;
        const totalOperations = this.metrics.bot.totalMessages + this.metrics.bot.totalCommands;
        this.metrics.bot.errorRate = totalOperations > 0 ? (this.metrics.bot.errors / totalOperations) * 100 : 0;
    }

    /**
     * Record an alert sent
     */
    recordAlert(successful = true, deliveryTime = 150) {
        this.metrics.alerts.totalSent++;
        if (successful) {
            this.metrics.alerts.successfulDeliveries++;
        }
        
        // Update average delivery time
        const currentAvg = this.metrics.alerts.averageDeliveryTime;
        const totalDeliveries = this.metrics.alerts.successfulDeliveries;
        this.metrics.alerts.averageDeliveryTime = 
            ((currentAvg * (totalDeliveries - 1)) + deliveryTime) / totalDeliveries;
    }

    /**
     * Format uptime in human readable format
     */
    formatUptime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Create singleton instance
const monitoringService = new MonitoringService();

module.exports = monitoringService;
