
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