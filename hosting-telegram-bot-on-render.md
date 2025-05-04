# Hosting Your Telegram Bot for Free on Render.com

![Render and Telegram Bot Hosting](https://render.com/illustrations/render-logo-color-light.svg)

## Introduction

Want to run your Telegram bot 24/7 without paying for hosting? Render.com offers a free tier that's perfect for Telegram bots. This simple guide will show you exactly how to deploy your bot in just a few steps.

## Why Choose Render?

- **Completely free** for basic bots
- **Super easy setup** - just connect your GitHub
- **No technical knowledge** needed beyond the basics

## Step 1: The One Change Your Bot Needs

Render has one special requirement: **your bot must listen on a port**. Most Telegram bots don't do this by default.

Add this code to your main file (index.js):

```javascript
const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!');
});

// Get port from environment or use a default
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
```

That's it! This creates a tiny web server that keeps Render happy.

## Step 2: Prepare Your Package.json

Make sure your package.json has the right start command:

```json
{
  "scripts": {
    "start": "node src/index.js"  // change this to match your file path
  }
}
```

## Step 3: Deploy to Render

1. Sign up at [render.com](https://render.com/) (it's free!)
2. Click **New** → **Web Service**
3. Connect your GitHub or GitLab account
4. Pick your bot's repository

## Step 4: Configuration (Super Simple!)

Fill in these details:
- **Name**: Your bot's name (e.g., "my-awesome-bot")
- **Environment**: Select "Node"
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

## Step 5: Add Your Bot Token

1. Scroll to "Environment Variables"
2. Click "Add Environment Variable"
3. Add `TELEGRAM_BOT_TOKEN` as the key
4. Paste your Telegram bot token as the value
5. Add any other secrets your bot needs

## Step 6: Deploy!

Click **"Create Web Service"** and wait about 2 minutes. That's it!

## Common Problem: "No Open Ports Detected"

If you see this error, it means you forgot Step 1. Add the HTTP server code from above to fix it.

## Keep an Eye on Your Bot

- Visit your Render dashboard to see logs
- Remember: on the free plan, your bot will "sleep" when inactive
- It may take up to 50 seconds to "wake up" when someone messages it after a long period

## That's All Folks!

Your bot is now running for free in the cloud. No complicated server setup, no monthly bills!

---

Happy bot building!
