const logger = require('../utils/logger');
const monitoringService = require('../services/monitoringService');

/**
 * Professional Status Command
 * Shows comprehensive system health and performance metrics
 */

/**
 * Handle the /status command
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 */
async function handleStatusCommand(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        logger.info(`Status command requested by user ${userId}`);

        // Get comprehensive health data
        const healthReport = monitoringService.getHealthReport();

        // Create status message
        const statusMessage = formatStatusMessage(healthReport);

        await bot.sendMessage(chatId, statusMessage, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });

        logger.info(`Status information sent to user ${userId}`);

    } catch (error) {
        logger.error('Error in status command:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving system status. Please try again later.');
    }
}

/**
 * Format the status message with health and performance data
 */
function formatStatusMessage(healthReport) {
    const status = healthReport.status;
    const metrics = healthReport.metrics;

    // Overall status emoji
    const statusEmoji = getStatusEmoji(status.overall);
    
    // Component status emojis
    const botEmoji = getStatusEmoji(status.components.bot);
    const apiEmoji = getStatusEmoji(status.components.api);
    const alertsEmoji = getStatusEmoji(status.components.alerts);
    const dbEmoji = getStatusEmoji(status.components.database);

    const message = `
🤖 *VybeWhale Bot System Status* ${statusEmoji}

📊 *Overall Health:* \`${status.overall.toUpperCase()}\`
⏱️ *Uptime:* \`${healthReport.uptime.formatted}\`
🕐 *Last Check:* \`${new Date(status.lastHealthCheck).toLocaleString()}\`

🔧 *Component Status:*
${botEmoji} Bot Service: \`${status.components.bot}\`
${apiEmoji} API Service: \`${status.components.api}\`
${alertsEmoji} Alert System: \`${status.components.alerts}\`
${dbEmoji} Database: \`${status.components.database}\`

📈 *Performance Metrics:*

*Bot Activity:*
• Messages Processed: \`${metrics.bot.totalMessages.toLocaleString()}\`
• Commands Executed: \`${metrics.bot.totalCommands.toLocaleString()}\`
• Active Users: \`${typeof metrics.bot.activeUsers === 'object' ? metrics.bot.activeUsers.size || 0 : metrics.bot.activeUsers}\`
• Error Rate: \`${parseFloat(metrics.bot.errorRate || 0).toFixed(2)}%\`

_Last updated: ${new Date().toLocaleString()}_
`;

    return message.trim();
}

/**
 * Get status emoji based on health status
 */
function getStatusEmoji(status) {
    switch (status) {
        case 'healthy':
            return '✅';
        case 'degraded':
            return '⚠️';
        case 'unhealthy':
            return '❌';
        default:
            return '❓';
    }
}

/**
 * Handle the /health command (alias for status)
 */
async function handleHealthCommand(bot, msg) {
    return handleStatusCommand(bot, msg);
}

/**
 * Handle the /metrics command (detailed metrics)
 */
async function handleMetricsCommand(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        // Check if user is admin (you can implement your own admin check)
        const isAdmin = await isUserAdmin(userId);
        if (!isAdmin) {
            await bot.sendMessage(chatId, '❌ This command is only available to administrators.');
            return;
        }

        const healthReport = monitoringService.getHealthReport();
        const detailedMetrics = formatDetailedMetrics(healthReport);

        await bot.sendMessage(chatId, detailedMetrics, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });

    } catch (error) {
        logger.error('Error in metrics command:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving detailed metrics.');
    }
}

/**
 * Format detailed metrics for admin users
 */
function formatDetailedMetrics(healthReport) {
    const performance = healthReport.performance.history.slice(-10); // Last 10 data points
    
    return `
🔍 *Detailed System Metrics*

📊 *Recent Performance (Last 10 minutes):*
${performance.map((point, index) => 
    `\`${index + 1}.\` API: ${point.apiSuccessRate.toFixed(1)}% | Memory: ${point.memoryUsage.toFixed(1)}%`
).join('\n')}

🧠 *Memory Usage:*
• Current: \`${healthReport.metrics.system.memoryUsage.toFixed(2)}%\`
• Trend: \`${performance.length > 1 ? 
    (performance[performance.length - 1].memoryUsage > performance[0].memoryUsage ? 'Increasing' : 'Decreasing') 
    : 'Stable'}\`

⚡ *System Info:*
• Bot Errors: \`${healthReport.metrics.bot.errors}\`
• Error Rate: \`${healthReport.metrics.bot.errorRate.toFixed(2)}%\`

_This data is updated every minute_
`;
}

/**
 * Check if user is admin (implement your own logic)
 */
async function isUserAdmin(userId) {
    // Implement your admin check logic here
    // For now, return false (no admin access)
    // You could check against a list of admin user IDs from environment variables
    const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [];
    return adminIds.includes(userId);
}

/**
 * Handle the /memory command (Redis memory status)
 */
async function handleMemoryCommand(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        // Check if user is admin
        const isAdmin = await isUserAdmin(userId);
        if (!isAdmin) {
            await bot.sendMessage(chatId, '❌ This command is only available to administrators.');
            return;
        }

        // Get Redis memory info
        const redisClient = require('../utils/redis').getClient();
        if (!redisClient?.isReady) {
            await bot.sendMessage(chatId, '❌ Redis connection not available.');
            return;
        }

        const memoryInfo = await redisClient.info('memory');
        const keyspaceInfo = await redisClient.info('keyspace');

        const memoryMessage = formatMemoryStatus(memoryInfo, keyspaceInfo);

        await bot.sendMessage(chatId, memoryMessage, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });

    } catch (error) {
        logger.error('Error in memory command:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving memory status.');
    }
}

/**
 * Format Redis memory status
 */
function formatMemoryStatus(memoryInfo, keyspaceInfo) {
    const memoryLines = memoryInfo.split('\r\n');
    const keyspaceLines = keyspaceInfo.split('\r\n');

    const memoryData = {};
    const keyspaceData = {};

    // Parse memory info
    memoryLines.forEach(line => {
        if (line.includes(':')) {
            const [key, value] = line.split(':');
            memoryData[key] = value;
        }
    });

    // Parse keyspace info
    keyspaceLines.forEach(line => {
        if (line.includes(':')) {
            const [key, value] = line.split(':');
            keyspaceData[key] = value;
        }
    });

    const usedMemory = parseInt(memoryData.used_memory || 0);
    const maxMemory = parseInt(memoryData.maxmemory || 0);
    const memoryUsagePercent = maxMemory > 0 ? ((usedMemory / maxMemory) * 100).toFixed(2) : 'N/A';

    return `
🧠 *Redis Memory Status*

💾 *Memory Usage:*
• Used Memory: \`${formatBytes(usedMemory)}\`
• Max Memory: \`${maxMemory > 0 ? formatBytes(maxMemory) : 'Unlimited'}\`
• Usage: \`${memoryUsagePercent}%\`
• Peak Memory: \`${formatBytes(parseInt(memoryData.used_memory_peak || 0))}\`

🔑 *Key Statistics:*
• Total Keys: \`${keyspaceData.db0 ? keyspaceData.db0.split(',')[0].split('=')[1] : '0'}\`
• Expired Keys: \`${memoryData.expired_keys || '0'}\`
• Evicted Keys: \`${memoryData.evicted_keys || '0'}\`

⚡ *Performance:*
• Memory Fragmentation: \`${parseFloat(memoryData.mem_fragmentation_ratio || 1).toFixed(2)}\`
• RSS Memory: \`${formatBytes(parseInt(memoryData.used_memory_rss || 0))}\`

🧹 *Cleanup Recommendations:*
${getMemoryRecommendations(usedMemory, maxMemory, memoryData)}

_Last updated: ${new Date().toLocaleString()}_
`;
}

/**
 * Get memory optimization recommendations
 */
function getMemoryRecommendations(usedMemory, maxMemory, memoryData) {
    const recommendations = [];
    const usagePercent = maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0;

    if (usagePercent > 90) {
        recommendations.push('🚨 Critical: Memory usage above 90% - immediate cleanup needed');
    } else if (usagePercent > 80) {
        recommendations.push('⚠️ Warning: Memory usage above 80% - consider cleanup');
    } else if (usagePercent > 60) {
        recommendations.push('💡 Info: Memory usage above 60% - monitor closely');
    } else {
        recommendations.push('✅ Memory usage is healthy');
    }

    const fragmentation = parseFloat(memoryData.mem_fragmentation_ratio || 1);
    if (fragmentation > 1.5) {
        recommendations.push('🔧 High memory fragmentation detected - restart recommended');
    }

    const evictedKeys = parseInt(memoryData.evicted_keys || 0);
    if (evictedKeys > 0) {
        recommendations.push(`⚠️ ${evictedKeys} keys have been evicted - consider increasing memory`);
    }

    return recommendations.map(rec => `• ${rec}`).join('\n');
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
    handleStatusCommand,
    handleHealthCommand,
    handleMetricsCommand,
    handleMemoryCommand
};
