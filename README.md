# Vybe Telegram Bot

A powerful Telegram bot that delivers real-time on-chain analytics for Solana tokens using Vybe APIs.

## Features

- **Token Analysis**: Get comprehensive token information including price, supply, and market cap
- **Whale Transaction Tracking**: Monitor large transactions (whale movements) for any Solana token
- **Smart Fallback System**: When API timeouts occur, provides direct links to Vybe Network for detailed analysis
- **Memory System**: Remembers the last token you analyzed for quick lookups

## Demo

[Try the bot: @vybewhalebot](https://t.me/vybewhalebot)

## Installation

1. Clone the repository

```bash
git clone https://github.com/italiancode/VybeWhale-Bot.git
cd VybeWhale-Bot
```

2. Install dependencies with `npm install`

3. Create a `.env` file with your:

   - TELEGRAM_BOT_TOKEN (from @BotFather)
   - VYBE_API_KEY (from @EricVybe)
   - VYBE_API_BASE_URL
   - DEFAULT_WHALE_THRESHOLD (optional, default 5000)

4. Run the bot with `npm start`

## Usage Examples

### Token Analysis

Send `/token [token_address]` to get detailed information about any Solana token.

Example response:

```
📊 TOKEN: SOL (Wrapped SOL)
━━━━━━━━━━━━━━━━━━
💰 Price: $152.43 (+2.31%)
💎 Market Cap: $76.2B
⚖️ Circulating Supply: 500M
📈 Volume (24h): $2.4B

🥇 Top Holders:
1. 0xabc...def9 - 5.2%
2. 0x123...789f - 3.1%
3. 0xdef...abc1 - 2.6%
```

![Token Command Screenshot]

### Whale Tracking

Send `/whale [token_address]` to track large transactions for any token.

Example response:

```
🐋 Whale Transactions for PUMP (Pump.fun)
💰 Minimum amount: $5,000

1. 🟢 BUY - $25,450
   🔢 325,000 PUMP
   👤 From: `7Wfr...j2kP` To: `cUB2...8vTg`
   🕒 4/28/2025, 10:35:24 AM

2. 🔴 SELL - $18,270
   🔢 230,000 PUMP
   👤 From: `hGtP...p9sC` To: `rNk5...mXv7`
   🕒 4/28/2025, 10:21:16 AM

📊 View All Transactions on Vybe Network
```

![Whale Command Screenshot]

## Technical Implementation

- Node.js backend using the `node-telegram-bot-api` library
- Redis for state management and caching
- Optimized API calls to handle high-volume tokens
- Error handling with smart fallbacks to web interface

## Available Commands

- `/start` - Initialize the bot and get welcome message
- `/help` - Display available commands and usage information
- `/token [ADDRESS]` - Get detailed token information and metrics
- `/whale [ADDRESS]` - View recent whale transactions for a token
- `/trackwallet [ADDRESS]` - Start tracking a wallet address
- `/untrackwallet [ADDRESS]` - Stop tracking a wallet address
- `/listwallets` - View all wallets you're currently tracking
- `/setthreshold [AMOUNT]` - Set minimum USD value for whale alerts
- `/enablealerts [TYPE]` - Enable specific types of alerts
- `/disablealerts [TYPE]` - Disable specific types of alerts

## Project Summary

VybeWhale bot delivers real-time Solana token analytics and whale alerts directly in Telegram chats. The bot features a robust token analyzer with comprehensive market data and a standout whale transaction tracker that detects and reports large token movements with configurable thresholds.

Technical innovations include smart API optimization that dynamically adjusts request parameters based on token volume, multi-level fallback systems that ensure users always get value even when facing API limitations, and seamless integration with Vybe Network's web interface for deeper analysis.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Built with ❤️ by Agbaka Daniel Ugonna Matthew (Big Dreams Web3)
