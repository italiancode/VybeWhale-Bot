Let’s refine your GitHub documentation to focus on the essential information needed to score higher in the Vybe Telegram Bot Challenge. We’ll remove unnecessary details, emphasize unique features, improve user experience descriptions, and highlight commercial viability. The goal is to make the documentation clear, concise, and aligned with the judging criteria.

---

# VybeWhale Bot

A powerful Telegram bot that delivers real-time on-chain analytics for Solana tokens using Vybe APIs.

<div align="center">
  <img src="./public/logo.png" alt="VybeWhale Bot Logo" width="300"/>
</div>

## 🌟 Unique Features

- **Whale Transfer Monitoring**: Real-time notifications for large transfers (whale movements) across any Solana token.
- **Top Holder Analysis**: Identifies largest token holders and assesses whale concentration risk with intuitive scoring.
- **One-Click Wallet Tracking**: Instantly track any whale wallet with a single click (⚡ Track) without copying addresses.
- **Intelligent Risk Assessment**: Proprietary algorithm calculates whale risk based on token distribution.
- **Smart Fallback System**: When API timeouts occur, provides direct links to Vybe Network for detailed analysis.
- **Memory System**: Remembers the last token analyzed for quick follow-up lookups.

## 📱 Demo

[Try the bot: @vybewhalebot](https://t.me/vybewhalebot)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/italiancode/VybeWhale-Bot.git
cd VybeWhale-Bot
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in a `.env` file:
   - `TELEGRAM_BOT_TOKEN` (from @BotFather)
   - `VYBE_API_KEY` (from @EricVybe)
   - `VYBE_API_BASE_URL`
   - `DEFAULT_WHALE_THRESHOLD` (optional, default 5000)

4. Run the bot:

```bash
npm start
```

## 🚀 Getting Started

Send `/start` to initialize the bot and receive welcome instructions.

<div align="center">
  <img src="./public/start_bot.png" alt="Start Bot" width="500"/>
</div>

## 📊 Usage Examples

### Token Analysis

Send `/token [token_address]` to get:
- Price, market cap, and supply metrics
- Holder count and trends
- Whale distribution and concentration risk
- Top holder details and exchange holdings
- One-click tracking of the largest holder
- Link to detailed token analytics

<div align="center">
  <img src="./public/token.png" alt="Token Command Screenshot" width="500"/>
</div>

### Whale Analysis

Send `/whale [token_address]` to view:
- Top 5 holders with percentage of supply and USD value
- Recent large transfers
- Whale concentration risk assessment
- Potential market impact
- One-click tracking buttons (⚡ Track)

<div align="center">
  <img src="./public/whale.png" alt="Whale Command Screenshot" width="500"/>
</div>

## 🏆 Project Summary

VybeWhale Bot provides real-time Solana token analytics and whale alerts in Telegram. It features:
- Robust token analysis with market data and whale risk assessment.
- Advanced whale tracking with transfer notifications and risk scoring.
- Technical innovations like smart API optimization and multi-level fallbacks.
- Seamless integration with Vybe Network’s web interface.

## 💼 Commercial Viability

VybeWhale Bot has significant potential in the crypto market:

### Monetization
- **Premium Features**: Offer custom thresholds, additional tracked wallets, and priority API access.
- **White Label Solutions**: Brand the bot for crypto projects’ communities.
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

