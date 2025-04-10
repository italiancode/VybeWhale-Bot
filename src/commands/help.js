const logger = require('../utils/logger');

async function handler(bot, msg) {
    try {
        const helpMessage = `🤖 *VybeWhale Bot Commands*\n\n` +
            `*Main Commands:*\n` +
            `• /token - Check token info\n` +
            `• /whale - View whale transactions\n` +
            `• /trackwallet - Track a wallet\n` +
            `• /listwallets - List tracked wallets\n` +
            `• /untrackwallet - Stop tracking a wallet\n\n` +
            `*Settings:*\n` +
            `• /start - Start the bot\n` +
            `• /help - Show this help message`;

        await bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        logger.error('Error in help command:', error);
        await bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
}

module.exports = { handler }; 