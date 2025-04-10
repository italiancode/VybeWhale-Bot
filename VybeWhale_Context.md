# VybeWhale Bot - Project Context and Structure

## 🧠 Purpose
VybeWhale is a real-time Telegram bot built to empower crypto communities with instant, actionable on-chain alerts using the Vybe API. It brings whale activity, smart wallet monitoring, token insights, and airdrop detection directly into Telegram groups, giving communities a data edge.

## 🛠 Core Features
1. **Whale Alerts**
   - Detects large transactions (buys/sells/mints) above a certain threshold.
   - Sends alerts with token info, wallet, and amount.

2. **Smart Wallet Tracking**
   - Users can follow wallets.
   - Notified when followed wallets trade or receive new tokens.

3. **Token Insight Commands**
   - `/token [TOKEN]`: Snapshot of key token data (price, volume, holders, whales).
   - `/whale [TOKEN]`: Shows recent large transactions for token.

4. **Airdrop Watcher**
   - Tracks wallets receiving new token transfers (potential airdrops).
   - Alert community when patterns emerge.

5. **Custom Configs (Per Group)**
   - Set transaction thresholds.
   - Add/Remove tracked wallets.
   - Enable/Disable alert types.

## 📦 Bot Structure

```bash
vybewhale-bot/
├── src/
│   ├── index.js               # Entry point - starts the bot
│   ├── commands/
│   │   ├── trackWallet.js     # Handle /trackwallet command
│   │   ├── token.js           # Handle /token command
│   │   ├── whale.js           # Handle /whale command
│   │   └── ...                # More command handlers
│   ├── services/
│   │   ├── vybeApi.js         # Functions to call Vybe API endpoints
│   │   └── alerts.js          # Alert checking engine
│   └── utils/
│       └── helpers.js         # Utility functions
├── .env                       # API keys and bot config
├── README.md                  # Setup and usage docs
└── package.json               # Dependencies and scripts
```

## 📡 APIs Used (Vybe)
- Token Metrics: Price, volume, holders, tx history
- Wallet Activity: Transfer history, token balances
- Transaction Alerts: Whale-size txns
- Airdrop Detection: New token inflows

## 🧩 Tech Stack
- Node.js + `node-telegram-bot-api`
- Vybe API
- Firebase / Redis (config + tracking data)
- Railway / Render (for deployment)

## 🔑 Access
- Get a free Vybe API key from @EricVybe on Telegram
- Telegram Bot Token via BotFather

---

