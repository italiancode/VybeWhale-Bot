const logger = require('../utils/logger');
const redisManager = require('../services/redisManager');
const { detectNewLowCapGems } = require('../services/vybeApi/lowCapGems');
const { formatNewGemAlertMessage } = require('../messages/gemMessages');

/**
 * Force gem check for a wallet
 * Command format: /forcegem [wallet_address]
 */
async function handleForceGemCheck(bot, msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const walletAddress = match[1];

    if (!walletAddress) {
        await bot.sendMessage(chatId, '❌ Please provide a wallet address to check');
        return;
    }

    try {
        const redis = redisManager.getClient();
        if (!redis?.isReady) {
            await bot.sendMessage(chatId, '⚠️ Storage service is currently unavailable. Please try again later.');
            return;
        }

        // Check if user has permission
        const isAdmin = await redis.sIsMember('admin_users', userId);
        if (!isAdmin) {
            await bot.sendMessage(chatId, '⚠️ This command is only available to administrators.');
            return;
        }

        // Send status message
        const statusMsg = await bot.sendMessage(chatId, `🔍 Checking wallet ${walletAddress} for new low cap gems...`);

        // Check if this wallet is already tracked for gems
        const isTrackedWallet = await redis.sIsMember('gem_alert_wallets', walletAddress);
        if (!isTrackedWallet) {
            await bot.sendMessage(chatId, `⚠️ This wallet is not being tracked for gem alerts. Adding it temporarily for this check.`);
        }

        // Get previous gems cache if exists
        let prevGems = [];
        const cachedGemsJson = await redis.get(`wallet:${walletAddress}:gems_cache`);
        if (cachedGemsJson) {
            try {
                prevGems = JSON.parse(cachedGemsJson);
                logger.info(`Loaded ${prevGems.length} previous gems for wallet ${walletAddress} from Redis`);
            } catch (e) {
                logger.error(`Error parsing cached gems for wallet ${walletAddress}:`, e);
            }
        }

        // Get new gems
        const newGems = await detectNewLowCapGems(walletAddress, prevGems);

        // Update status message
        await bot.editMessageText(
            `Found ${newGems.length} new low cap gems in wallet ${walletAddress}`,
            {
                chat_id: chatId,
                message_id: statusMsg.message_id
            }
        );

        // Send alert for each new gem
        if (newGems.length > 0) {
            // Update cache
            const allGems = [...prevGems, ...newGems];
            await redis.set(`wallet:${walletAddress}:gems_cache`, JSON.stringify(allGems), 'EX', 86400);

            for (const gem of newGems) {
                const alertMessage = formatNewGemAlertMessage(walletAddress, gem);
                await bot.sendMessage(chatId, alertMessage, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
            }
        } else {
            await bot.sendMessage(chatId, 'No new low cap gems found in this wallet.');
        }
    } catch (error) {
        logger.error(`Error in force gem check for wallet ${walletAddress}:`, error);
        await bot.sendMessage(chatId, '❌ Error checking gems. Please try again later.');
    }
}

module.exports = {
    handleForceGemCheck
}; 