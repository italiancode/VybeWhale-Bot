# Understanding Token Trades with Vybe API: A Simple Guide

## Overview

This guide explains how a piece of JavaScript code uses the **Vybe Network API** to fetch token trade data on the Solana blockchain. We'll break down how the code works, how the Vybe API accepts its input parameters, and what the output means—all in a way that’s easy to understand, even if you're not a developer.

### What Are Token Trades?

Imagine you’re at a market where people trade items, like swapping apples for oranges. On the Solana blockchain, a **token trade** is when someone swaps one digital token (e.g., BONK) for another (e.g., SOL, which is Solana’s main currency). These trades happen on platforms called **decentralized exchanges (DEXs)**, such as Raydium, Orca, or Jupiter.

The Vybe Network API helps us see details of these trades, like who made the trade, how many tokens were swapped, the price, and when it happened.

---

## How the Code Works: A Layperson’s Explanation

The code we’re discussing is a JavaScript program that talks to the Vybe API to get trade data for a specific token pair (e.g., BONK/SOL). Think of the code as a librarian who goes to a library (the Vybe API) to find books (trade data) based on certain instructions (parameters).

Here’s a step-by-step breakdown of what the code does:

### 1. **Setting Up the Connection**
The code starts by connecting to the Vybe API, like logging into a library system:

```javascript
const vybeApi = require("@api/vybe-api");
vybeApi.auth(process.env.VYBE_API_KEY);
```

- **What’s Happening?** The code uses a special key (`VYBE_API_KEY`) to prove it’s allowed to access the Vybe API. Without this key, the API won’t share any data—just like needing a library card to borrow books.
- **Simple Explaination:** Think of this as showing your ID to the librarian so they trust you to look at their records.

### 2. **Defining the Request: What Trades to Fetch**
The code has a function called `getTokenTrades` that asks the Vybe API for trade data:

```javascript
async function getTokenTrades({
  baseMintAddress,
  quoteMintAddress,
  programIds = null,
  timeRangeHours = 24,
  limitPerProgram = 10,
})
```

- **What’s Happening?** The function is like filling out a form to tell the librarian exactly what you’re looking for. It specifies:
  - **Which tokens to look for:** `baseMintAddress` (e.g., BONK) and `quoteMintAddress` (e.g., SOL) define the trading pair, like asking for trades of apples for oranges.
  - **Where to look:** `programIds` tells the API which DEXs (like Raydium or Orca) to check. If set to `null`, it looks everywhere Vybe supports.
  - **How far back to look:** `timeRangeHours` (e.g., 24 hours) sets the time period, like saying, “Show me trades from the last day.”
  - **How many trades to show:** `limitPerProgram` (e.g., 10) limits the number of trades to avoid getting too much data at once.
- **Simple Explaination:** Imagine telling the librarian, “I want to know about apple-orange trades from the past day, and I only want to see the 10 most recent ones. Check all the markets you know about.”

### 3. **Sending the Request to Vybe API**
The code sends the request to the Vybe API:

```javascript
const response = await vybeApi.get_trade_data_program({
  programId: null,
  baseMintAddress,
  quoteMintAddress,
  timeStart,
  timeEnd,
  limit: limitPerProgram,
  sortByDesc: "blocktime",
});
```

- **What’s Happening?** The code calls the `get_trade_data_program` endpoint (https://api.vybenetwork.xyz/token/trades) to fetch the trades. It sets `programId` to `null` to look across all DEXs, specifies the token pair (`baseMintAddress` and `quoteMintAddress`), sets the time range (`timeStart` and `timeEnd`), and sorts the results by the most recent trades (`sortByDesc: "blocktime"`).
- **Simple Explaination:** This is like the librarian going through all their records to find apple-orange trades from the past day and bringing back the 10 most recent ones, sorted from newest to oldest.

### 4. **Processing the Response**
The code takes the data from the API and formats it to make it easier to read:

```javascript
const formattedTrades = allTrades.map((trade) => ({
  authorityAddress: trade.authorityAddress,
  blockTime: trade.blockTime,
  timestamp: new Date(trade.blockTime * 1000).toISOString(),
  pair: `${trade.baseMintAddress}/${trade.quoteMintAddress}`,
  direction: trade.quoteMintAddress === quoteMintAddress ? "Buy" : "Sell",
  price: trade.price,
  baseSize: trade.baseSize,
  quoteSize: trade.quoteSize,
  signature: trade.signature,
  feePayer: trade.feePayer,
  programId: trade.programId,
}));
```

- **What’s Happening?** The API returns a list of trades, and the code organizes each trade into a neat format:
  - **Who made the trade:** `authorityAddress` (the trader’s wallet address).
  - **When it happened:** `timestamp` (a readable date and time).
  - **What was traded:** `pair` (e.g., BONK/SOL).
  - **Buy or Sell:** `direction` (whether the trader bought or sold the quote token, e.g., SOL).
  - **Price and Amounts:** `price` (how much SOL per BONK), `baseSize` (amount of BONK), `quoteSize` (amount of SOL).
  - **Where it happened:** `programId` (the DEX, like Raydium or Orca).
- **Simple Explaination:** The librarian hands you a list of trades, and you write down the important details in a notebook: who traded, when, what they swapped, and how much they paid.

### 5. **Showing the Results**
The code prints the formatted trades:

```javascript
trades.forEach((trade, index) => {
  console.log(`${index + 1}.`);
  console.log(`  Program: ${trade.programId}`);
  console.log(`  Pair: ${trade.pair}`);
  console.log(`  Direction: ${trade.direction} (for quote token)`);
  console.log(`  Price: ${trade.price} (quote per base)`);
  console.log(`  Base Size: ${trade.baseSize}`);
  console.log(`  Quote Size: ${trade.quoteSize}`);
  console.log(`  Timestamp: ${trade.timestamp}`);
  console.log(`  Signature: ${trade.signature}`);
  console.log("---");
});
```

- **What’s Happening?** The code displays the trades in a readable format, showing the DEX, token pair, whether it was a buy or sell, the price, amounts, and when it happened.
- **Simple Explaination:** You read your notebook aloud: “Trade 1: On Raydium, someone swapped 1 million BONK for 22.5 SOL at a price of 0.0000225 SOL per BONK on May 7, 2025.”

---

## How Vybe API Accepts Parameters: A Simple Explanation

The Vybe API’s `get_trade_data_program` endpoint (https://api.vybenetwork.xyz/token/trades) is like a search tool in a library. It needs specific instructions (parameters) to find the right data. Here’s how it accepts parameters, explained in simple terms:

### Parameters the API Accepts

| **Parameter**        | **What It Means (Simple Explaination)**                                                                 | **Example Value**                          |
|----------------------|-----------------------------------------------------------------------------------------------------|--------------------------------------------|
| `programId`          | Which market to check for trades (e.g., Raydium, Orca). Set to `null` to check all markets.         | `null` (checks all markets) or `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8` (Raydium) |
| `baseMintAddress`    | The first token in the pair you’re interested in (e.g., BONK).                                      | `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` (BONK) |
| `quoteMintAddress`   | The second token in the pair (e.g., SOL).                                                           | `So11111111111111111111111111111111111111112` (SOL) |
| `mintAddress`        | A single token to search for (e.g., BONK), if you don’t care about the pair. Can’t be used with `baseMintAddress` and `quoteMintAddress`. | `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` (BONK) |
| `marketId`           | A specific trading market to check (ignores `baseMintAddress` and `quoteMintAddress` if used).      | `9REnhWkexAXopmGHV3TvprquKcuhJanDqB8hTocihxNk` |
| `authorityAddress`   | The wallet address of the trader to filter by (e.g., only show trades by this person).              | `CKWXpDkudKoVDhhDJC7uRd5Ccb8eaBv2TWfTpLB539DC` |
| `resolution`         | How to group the data by time (e.g., hourly, daily). Not needed for raw trade data.                 | `1h` (hourly) |
| `timeStart`          | The earliest time to look for trades (a Unix timestamp, like a date in computer format).            | `1746548220` (May 6, 2025, 5:17 PM UTC) |
| `timeEnd`            | The latest time to look for trades.                                                                 | `1746634620` (May 7, 2025, 5:17 PM UTC) |
| `page`               | Which page of results to show (like flipping to page 2 of a book). Starts at 0.                     | `0` (first page) |
| `limit`              | How many trades to show at once (max is 1000).                                                      | `10` (show 10 trades) |
| `sortByAsc`          | Sort the trades in ascending order (oldest to newest) by price or time. Can’t use with `sortByDesc`.| `blocktime` (sort by time, oldest first) |
| `sortByDesc`         | Sort the trades in descending order (newest to oldest) by price or time. Can’t use with `sortByAsc`.| `blocktime` (sort by time, newest first) |
| `feePayer`           | The wallet that paid the fees for the trade (often the same as the trader).                         | `CKWXpDkudKoVDhhDJC7uRd5Ccb8eaBv2TWfTpLB539DC` |

### How the API Uses These Parameters
- **Exclusive Filters:** You can’t use `mintAddress`, `baseMintAddress/quoteMintAddress`, and `marketId` together. Pick one way to search:
  - Use `baseMintAddress` and `quoteMintAddress` to find trades for a specific pair (e.g., BONK/SOL).
  - Use `mintAddress` to find all trades involving a single token (e.g., BONK with anything).
  - Use `marketId` to find trades in a specific market (ignores the token pair).
- **Default Behavior:** If you don’t set `programId`, the API looks at **all supported markets** (Raydium, Orca, Jupiter, etc.) for the last 14 days. If you don’t set `timeStart` and `timeEnd`, it uses the last 14 days by default.
- **Sorting:** Use `sortByDesc: "blocktime"` to get the newest trades first, which is what the code does.
- **Simple Explaination:** Think of these parameters as telling the librarian, “Find me trades for apples and oranges (or just apples), check all markets, from yesterday to today, and show me the 10 newest ones.”

---

## Example: Fetching BONK/SOL Trades

Let’s see how the code uses these parameters to fetch trades for BONK/SOL:

### Code Example
The code calls `getTokenTrades` with these settings:

```javascript
const trades = await getTokenTrades({
  baseMintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
  quoteMintAddress: "11111111111111111111111111111111", // SOL
  programIds: null, // Fetch across all programs
  timeRangeHours: 24,
  limitPerProgram: 10,
});
```

- **What’s Happening?**
  - **Token Pair:** BONK (`DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`) and SOL (`11111111111111111111111111111111`).
  - **Where to Look:** `programIds: null` means check all markets (Raydium, Orca, Jupiter, etc.).
  - **Time Range:** `timeRangeHours: 24` means look at the last 24 hours. The code calculates `timeStart` and `timeEnd` automatically (e.g., from May 6, 2025, to May 7, 2025).
  - **Limit:** `limitPerProgram: 10` means get up to 10 trades.

### API Request Sent to Vybe
The code sends this request to the Vybe API:

```javascript
vybeApi.get_trade_data_program({
  programId: null,
  baseMintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  quoteMintAddress: "11111111111111111111111111111111",
  timeStart: 1746548220, // May 6, 2025, 5:17 PM UTC
  timeEnd: 1746634620, // May 7, 2025, 5:17 PM UTC
  limit: 10,
  sortByDesc: "blocktime",
});
```

### Example Output
The API might return something like this (simplified):

```
Recent BONK/SOL trades across all programs:
1.
  Program: 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 (Raydium V4)
  Pair: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/11111111111111111111111111111111
  Direction: Sell (for quote token)
  Price: 0.00002250 (quote per base)
  Base Size: 1000000.0
  Quote Size: 22.50
  Timestamp: 2025-05-07T17:15:00.000Z
  Signature: kQQksZ1K4DWPRyGkaXqT5L4HkBmPCyyBn9pzao3GSnDxFTgiu4fMRGpi5TD7dq8FsckkeySXazT117qryP3RpwE
---
2.
  Program: 9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP (Orca V2)
  Pair: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/11111111111111111111111111111111
  Direction: Sell (for quote token)
  Price: 0.00002248 (quote per base)
  Base Size: 500000.0
  Quote Size: 11.24
  Timestamp: 2025-05-07T17:14:00.000Z
  Signature: 3RupgsV1i2rbWXJFT3yGZsZivFqZbxUEYimghWVsMEJggxKC2LmvCugoDE1bSTMyktgXDBE2peiMfn575JvSFUzs
---
```

- **Simple Explaination:** This output says:
  - On Raydium, someone sold 1 million BONK for 22.5 SOL at a price of 0.0000225 SOL per BONK on May 7, 2025.
  - On Orca, someone sold 500,000 BONK for 11.24 SOL at a price of 0.00002248 SOL per BONK on May 7, 2025.

---

## Why This Matters

This code helps you see who’s trading tokens like BONK and SOL, how much they’re trading, and at what price. It’s like having a window into a busy marketplace where you can watch people swap digital coins. By checking all markets (not just Raydium), you get a complete picture of the trading activity, which can help you understand market trends or make better trading decisions.
