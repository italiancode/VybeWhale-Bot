# VybeWhale Telegram Bot

A real-time Telegram bot for tracking crypto whale activity, smart wallets, and airdrops using the Vybe API.

## Features

- 🐋 Whale Alerts: Get notified of large transactions
- 👀 Smart Wallet Tracking: Monitor specific wallets
- 📊 Token Insights: Get detailed token information
- ⚙️ Custom Configurations: Set thresholds and manage alerts

## Prerequisites

- Node.js (v14 or higher)
- Redis server
- Telegram Bot Token (from BotFather)
- Vybe API Key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/italiancode/vybewhale-bot.git
cd vybewhale-bot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Fill in your Telegram Bot Token and Vybe API Key
- Configure Redis connection URL

4. Start the bot:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Commands

- `/token [TOKEN]` - Get token information
- `/whale [TOKEN]` - View recent whale transactions
- `/trackwallet [ADDRESS]` - Track a wallet for alerts
- `/setthreshold [AMOUNT]` - Set whale alert threshold
- `/addwallet [ADDRESS]` - Add wallet to tracking
- `/removewallet [ADDRESS]` - Remove wallet from tracking
- `/enablealerts [TYPE]` - Enable specific alert types
- `/disablealerts [TYPE]` - Disable specific alert types
- `/help` - Show help message

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

Built with ❤️ by Agbaka Daniel Ugonna Matthew (Big Dreams Web3)  