
- **Token Verification**: The API attempts to verify tokens using `get_token_details`, but this call may fail with "Not Found" for tokens that aren't in Vybe's database.
- **Transaction Filtering**: Transactions are filtered based on:
  - Exact token address match (to prevent returning data for the wrong token)
  - Minimum USD transaction value (configurable via the DEFAULT_WHALE_THRESHOLD setting)

### Implementation Details

The whale transaction functionality has been optimized to:

1. Validate token addresses against the Vybe API
2. Request a larger number of transactions than needed to allow for proper filtering
3. Sort results by value to show the most significant transactions first
4. Handle different API response formats consistently
5. Provide clear feedback when no data is available

## Understanding Whale Analysis

The bot's whale analysis combines two key data points:

1. **Top Token Holders**: Identifies wallets holding the largest percentages of a token's supply
2. **Recent Whale Transactions**: Shows high-value transactions above the specified threshold

Based on this data, the bot calculates a **Whale Concentration Risk** level:
- **VERY HIGH**: >70% supply held by top 5 holders - extreme caution advised
- **HIGH**: 50-70% held by top 5 - significant manipulation potential
- **MODERATE**: 30-50% held by top 5 - some manipulation possible
- **LOW**: 15-30% held by top 5 - well-distributed but still watch large holders
- **VERY LOW**: <15% held by top 5 - minimal manipulation risk

### One-Click Whale Tracking

See an interesting whale wallet? Just click the ⚡ button next to any wallet address to instantly start tracking it. You'll receive alerts whenever the wallet makes significant moves, potentially giving you an edge in the market.

For more detailed information, see the [Understanding Whale Analysis](Understanding-Whale-Analysis.md) document.