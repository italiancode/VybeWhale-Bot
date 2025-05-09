# Vybe Telegram Bot

A powerful Telegram bot that delivers real-time on-chain analytics for Solana tokens using Vybe APIs.

## Features

- **Token Analysis**: Get comprehensive token information including price, supply, market cap, and whale distribution metrics
- **Whale Transaction Tracking**: Monitor large transactions (whale movements) for any Solana token
- **Top Holder Analysis**: Identify the largest token holders and assess whale concentration risk
- **Whale Risk Assessment**: Get actionable insights about potential price impact from whale activity
- **One-Click Wallet Tracking**: Instantly follow any whale wallet with a single click (⚡)
- **Smart Fallback System**: When API timeouts occur, provides direct links to Vybe Network for detailed analysis
- **Memory System**: Remembers the last token you analyzed for quick lookups

## 📱 Demo

[Try the bot: @vybewhalebot](https://t.me/vybewhalebot)

## 🔧 Installation

1. Clone the repository

```bash
git clone https://github.com/italiancode/VybeWhale-Bot.git
cd VybeWhale-Bot
```

2. Install dependencies with `npm install`

3. Create a `.env` file with your:

   - TELEGRAM_BOT_TOKEN (from @BotFather)
   - VYBE_API_KEY (from https://vybe.fyi/settings/api)
   - VYBE_API_BASE_URL
   - DEFAULT_WHALE_THRESHOLD (optional, default 5000)

4. Run the bot with `npm start`

## 🚀 Getting Started

Start the bot by sending the `/start` command to get a welcome message with quick start instructions:

<div align="center">
  <img src="./public/start bot.png" alt="Start Bot" width="500"/>
</div>

## 📊 Usage Examples

### Token Analysis

Send `/token [token_address]` to get detailed information about any Solana token, including:

- Price, market cap, and supply metrics
- Holder count and trend analytics
- Whale distribution with concentration risk assessment
- Top holder information and exchange holdings
- One-click tracking of the largest holder
- Direct link to detailed token analytics

<div align="center">
  <img src="./public/token.png" alt="Token Command Screenshot" width="500"/>
</div>

### Whale Analysis

Send `/whale [token_address]` to get comprehensive whale information for any token:

- Top 5 token holders with percentage of supply and USD value
- Recent large transfers with detailed information
- Whale concentration risk assessment
- Potential market impact insights
- One-click tracking buttons (⚡ Track) to follow any whale wallet instantly

<div align="center">
  <img src="./public/whale.png" alt="Whale Command Screenshot" width="500"/>
</div>

## 💻 Technical Implementation

- Node.js backend using the `node-telegram-bot-api` library
- Redis for state management and caching
- Optimized API calls to handle high-volume tokens
- Error handling with smart fallbacks to web interface
- Structured command handling with separation of concerns
- Comprehensive logging system for debugging and analytics

## 📝 Available Commands

- `/start` - Initialize the bot and get welcome message
- `/help` - Display available commands and usage information
- `/token [ADDRESS]` - Get detailed token information and metrics
- `/whale [ADDRESS]` - View comprehensive whale insights including top holders and transfers
- `/trackwallet [ADDRESS]` - Start tracking a wallet address (or use ⚡ Track buttons for one-click tracking)
- `/untrackwallet [ADDRESS]` - Stop tracking a wallet address
- `/listwallets` - View all wallets you're currently tracking
- `/setthreshold [AMOUNT]` - Set minimum USD value for whale alerts
- `/enablealerts [TYPE]` - Enable specific types of alerts
- `/disablealerts [TYPE]` - Disable specific types of alerts

## 🏆 Project Summary

VybeWhale bot delivers real-time Solana token analytics and whale alerts directly in Telegram chats. The bot features a robust token analyzer with comprehensive market data and a standout whale analysis system that combines top holder data with transfer tracking to provide advanced risk assessment.

Technical innovations include smart API optimization that dynamically adjusts request parameters based on token volume, multi-level fallback systems that ensure users always get value even when facing API limitations, and seamless integration with Vybe Network's web interface for deeper analysis.

## 💼 Commercial Viability

VybeWhale Bot has significant potential in the crypto market:

### Monetization

- **Premium Features**: Offer custom thresholds, additional tracked wallets, and priority API access.
- **White Label Solutions**: Brand the bot for crypto projects' communities.
- **Enterprise Use**: License to trading firms and crypto funds.

### Scalability

- **API Integration Hub**: Centralize multiple data sources.
- **Community Features**: Modular design for rapid iteration.

### Market Advantage

- **Real-Time Insights**: Actionable data for traders.
- **User-Friendly**: Accessible to non-technical users.
- **Network Effect**: Each tracked wallet benefits the entire user base.

## 🔗 Deployment

Deploy to Telegram:

1. Create a bot with @BotFather.
2. Host on a cloud service (e.g., Heroku, Render).
3. Set environment variables.
4. Add to Telegram channels/groups with admin permissions.

[Deployed Bot Link](https://t.me/vybewhalebot)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

Built with ❤️ by Agbaka Daniel Ugonna Matthew (Big Dreams Web3)
