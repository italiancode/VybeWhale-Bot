# VybeWhale Telegram Bot

A real-time Telegram bot for tracking crypto whale activity, smart wallets, and token analytics using the Vybe API.

## Features

- 🐋 **Whale Alerts**: Track large transactions in real-time
- 👛 **Wallet Tracking**: Monitor specific wallet addresses
- 📊 **Token Analytics**: Get detailed token information and metrics
- ⚙️ **Customizable Alerts**: Configure thresholds and notification preferences

## Prerequisites

- Node.js (v14 or higher)
- Redis server (optional, for enhanced functionality)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- AlphaVybe API Key (from [@EricVybe](https://t.me/EricVybe))

## Setup

1. Clone the repository:

```bash
git clone https://github.com/italiancode/VybeWhale-Bot.git
cd VybeWhale-Bot
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

- Copy `.env.example` to `.env`
- Update with your credentials:
  - TELEGRAM_BOT_TOKEN (from @BotFather)
  - VYBE_API_KEY (from @EricVybe)
  - REDIS_URL (optional)

4. Start the bot:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Available Commands

### Token and Whale Tracking

- `/token [ADDRESS]` - Get detailed token information and metrics
- `/whale [ADDRESS]` - View recent whale transactions for a token

### Wallet Management

- `/trackwallet [ADDRESS]` - Start tracking a wallet address
- `/untrackwallet [ADDRESS]` - Stop tracking a wallet address
- `/listwallets` - View all wallets you're currently tracking

### Alert Configuration

- `/setthreshold [AMOUNT]` - Set minimum USD value for whale alerts
- `/enablealerts [TYPE]` - Enable specific types of alerts
- `/disablealerts [TYPE]` - Disable specific types of alerts

### General

- `/start` - Initialize the bot and get welcome message
- `/help` - Display available commands and usage information

## Alert Types

The bot supports various alert types that can be enabled/disabled:

- Whale Transactions
- Wallet Activity
- Price Changes
- Volume Spikes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Built with ❤️ by Agbaka Daniel Ugonna Matthew (Big Dreams Web3)
