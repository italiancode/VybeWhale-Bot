# Vybe Telegram Bot - Wallet Tracking System

This document explains how the wallet tracking and performance analysis features work in our Telegram bot.

## How Wallet Alerts Work (`alerts.js`)

The wallet alert system monitors wallets you're tracking and notifies you when significant changes happen.

### In Simple Terms:

1. **Tracking Wallets**: When you track a wallet using `/trackwallet`, the bot keeps an eye on it for you.

2. **Regular Checks**: Every 5 minutes, the bot checks each tracked wallet to see if anything has changed.

3. **Smart Filtering**: The bot only alerts you when *meaningful* changes happen, such as:
   - Portfolio value changing by more than 5%
   - New tokens appearing in the wallet
   - Tokens disappearing from the wallet

4. **Avoiding Spam**: You'll never receive duplicate alerts showing the same information. The bot creates a unique "fingerprint" for each alert message and only sends a new alert if the information has actually changed.

5. **Informative Alerts**: When you do get an alert, it shows:
   - Wallet address
   - Total wallet value in USD
   - How much the value changed since last alert (with percentage)
   - Top 5 tokens in the wallet by value

### Technical Details:

The alert system uses a combination of caching and Redis storage to track changes efficiently:

- `walletBalanceCache`: Stores the previous balance data for comparison
- `detectSignificantChanges()`: Determines if changes are meaningful enough for an alert
- `generateWalletMessageSignature()`: Creates a unique signature for each potential alert message
- Redis storage with 24-hour TTL for message signatures to prevent duplicates

## How Wallet Performance Works (`walletPerformance.js`)

The wallet performance analyzer gives you in-depth insights into any Solana wallet's performance over time.

### In Simple Terms:

1. **Access Options**:
   - Use `/walletperformance [address] [days]` command directly
   - Click the "Track Performance" button when viewing your tracked wallets
   - Select a wallet from the button list that appears

2. **Analysis Periods**: Choose between 7, 14, or 30 days of historical data.

3. **Performance Metrics**: The analysis shows you:
   - Current wallet value
   - Performance over time (dollar amount and percentage)
   - Highest and lowest values reached
   - Volatility rating (Low, Medium, or High)
   - Top 5 holdings with price change indicators

4. **Interactive Interface**: After viewing the analysis, you can switch between different time periods using the buttons at the bottom.

### Technical Details:

- Uses the Vybe API's time-series wallet token balance endpoint
- Calculates volatility using standard deviation of daily percentage changes
- Processes raw data into meaningful metrics for easier comprehension
- Provides an interactive user interface with Telegram's inline keyboard buttons

## How to Improve the Data

We could enhance our wallet performance analysis by incorporating the Vybe API's Wallet PnL endpoint, which provides:

1. **Trading Performance Summary**:
   - Win rate
   - Realized and unrealized PnL (Profit and Loss)
   - Number of unique tokens traded
   - Average trade size
   - Trade count statistics (winning vs. losing trades)

2. **Token-Specific Metrics**:
   - Performance of individual tokens in the portfolio
   - Best and worst performing tokens
   - Detailed buying and selling activities

This would give users a more complete picture of a wallet's trading activity and success rate, rather than just the balance changes over time.

## Using the Wallet Tracking System

### Basic Commands:

- `/trackwallet [address]` - Start tracking a wallet
- `/listwallets` - See all wallets you're tracking
- `/untrackwallet [address]` - Stop tracking a wallet
- `/walletperformance [address] [days]` - Analyze wallet performance

### Interactive Features:

1. From the wallet list, click "Track Performance"
2. Select a wallet from the button list
3. View the performance analysis
4. Click time period buttons (7, 14, or 30 days) to see different timeframes

### Tips for Best Use:

- Track wallets of successful traders to learn from their strategies
- Monitor project team wallets to see if they're buying or selling
- Set up alerts for your own wallet to stay informed about significant changes
- Compare performance across different time periods to identify trends 