# Token Holders Code Guide

## Code Organization

Our code is organized into two main files:

1. **`src/services/vybeApi/tokenHolders.js`** - Handles API calls and data processing
2. **`src/commands/token.js`** - Handles user interaction and display

## How the Code Works

### 1. API Service (`tokenHolders.js`)

This file contains three main functions:

#### `getTokenHoldersTimeSeries()`
```javascript
async function getTokenHoldersTimeSeries(mintAddress, startTime, endTime, interval, limit, page) {
  // Makes API call to /token/{mintAddress}/holders-ts
  // Converts timestamps between seconds and milliseconds
  // Returns array of { time, holderCount } objects
}
```

- **Purpose**: Fetches raw holder data over time
- **Input**: Token address, time range, pagination
- **Output**: Array of timestamp and holder count pairs
- **Key Details**: 
  - Converts JS timestamps (milliseconds) to Unix timestamps (seconds)
  - Transforms API response format to our expected format
  - Enforces the earliest data constraint (Nov 9, 2023)

#### `getTotalTokenHolders()`
```javascript
async function getTotalTokenHolders(mintAddress) {
  // First tries to get holder count from token details API
  // Falls back to time series if needed
  // Returns a single number
}
```

- **Purpose**: Gets current holder count for a token
- **Input**: Token address
- **Output**: Single number (total holders)
- **Key Details**:
  - Tries multiple API endpoints for reliability
  - Has fallback mechanisms if primary source fails

#### `getHoldersTrend()`
```javascript
async function getHoldersTrend(mintAddress, days) {
  // Gets time series data
  // Calculates percentage changes
  // Returns { current, trend7d, trend30d } object
}
```

- **Purpose**: Analyzes holder trends
- **Input**: Token address, lookback period
- **Output**: Object with current count and percentage changes
- **Key Details**:
  - Calculates 7-day change (recent trend)
  - Calculates full period change (long-term trend)
  - Adjusts period based on available data

### 2. Command Handler (`token.js`)

#### Key Functions:

##### `processTokenInput()`
```javascript
async function processTokenInput(bot, msg, tokenInput) {
  // Fetches token info and holder data
  // Handles errors and formats response
  // Sends message to user
}
```

- **Purpose**: Processes token command
- **Input**: Bot instance, message, token address
- **Output**: Sends formatted message to Telegram
- **Key Details**:
  - Makes parallel API calls for efficiency
  - Has robust error handling for each API call
  - Falls back to available data when needed

##### `formatTokenInfo()`
```javascript
function formatTokenInfo(tokenInfo, holderData) {
  // Formats numbers for display
  // Calculates percentage changes
  // Creates formatted markdown message
}
```

- **Purpose**: Creates human-readable message
- **Input**: Token data and holder trend data
- **Output**: Formatted markdown string
- **Key Details**:
  - Smart number formatting (K, M, B, T suffixes)
  - Adds trend indicators (🟢/🔴)
  - Includes fallbacks for missing data

## Data Flow Diagram

```
User Command → token.js → tokenHolders.js → Vybe API → 
Raw Data → Data Processing → Formatting → User Response
```

## Code Examples

### Getting Token Holder Trends

```javascript
// In tokenHolders.js
const holderData = await getHoldersTrend("So11111111111111111111111111111111111111112", 30);

// Returns:
// {
//   current: 776029,
//   trend7d: 0.86,
//   trend30d: 1.42,
//   periodDays: 30,
//   rawData: [...]
// }
```

### Displaying Token Information

```javascript
// In token.js
const message = formatTokenInfo(tokenInfo, holderData);

// Sends formatted message to user
await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
```

## Error Handling

The code includes robust error handling:

1. **API Failures**: Falls back to alternative sources
2. **Missing Data**: Shows partial information rather than failing
3. **Data Format Issues**: Transforms API response to expected format
4. **Historical Constraints**: Enforces valid date ranges

This design ensures the feature works reliably even when parts of the API have issues. 