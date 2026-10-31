# Jummah Time

WhatsApp auto-responder bot for Friday 1:15 PM - 2:00 PM (Asia/Karachi) using Baileys.

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env`:
```
DRY_RUN=false
TIMEZONE=Asia/Karachi
SESSION_NAMES=num1,num2
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baileys_auth
```

3. Install dependencies:
```bash
npm install
```

4. Run the bot:
```bash
node index.js
```

5. Scan QR codes with your WhatsApp when prompted (displayed in terminal).

## Features
- Only active during Friday 13:15-14:00 Asia/Karachi
- Skips groups, broadcasts, newsletters, status
- Reply to private text/voice messages with random reply variants
- Auto-reject private calls and send follow-up text
- Smart call rejection based on cached message context
- Human-like delays and typing indicators
- Multi-session support
- MongoDB session storage (persists across restarts)

## Deploying to Render (Free Tier)

### Prerequisites
1. A free MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
2. A Render account: https://render.com/register
3. Push your code to GitHub

### Steps

**1. Set up MongoDB Atlas (free tier):**
- Create a new cluster (M0 Free tier)
- Get your connection string
- Whitelist Render IPs or allow from anywhere (0.0.0.0/0)

**2. Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

**3. Deploy on Render:**
- Go to https://dashboard.render.com/new/web
- Connect your GitHub repo
- Choose settings:
  - **Name**: jummah-bot
  - **Region**: Choose closest to you
  - **Branch**: main
  - **Build Command**: `npm install`
  - **Start Command**: `node index.js`
- Add environment variables:
  - `DRY_RUN=false`
  - `TIMEZONE=Asia/Karachi`
  - `SESSION_NAMES=num1,num2`
  - `MONGODB_URI=<your_mongodb_connection_string>`
- Click **"Create Web Service"**

## Deploying to Koyeb (Free Tier)

### Steps

**1. Set up MongoDB Atlas:**
- Create a free cluster (M0 tier)
- Get your connection string
- Whitelist Koyeb IPs or allow from anywhere (0.0.0.0/0)

**2. Deploy:**
- Go to https://app.koyeb.com/deploy
- Connect your GitHub repository
- Choose settings:
  - **Service name**: jummah-bot
  - **Region**: Choose closest to you
  - **Build type**: Dockerfile
  - **Start command**: `node index.js`
- Add environment variables (same as Render above)
- Click **"Deploy"**

**Note:** Koyeb free tier has limited resources and apps may spin down after inactivity.

## Troubleshooting

**QR codes not appearing in logs:**
- Check service logs for connection errors
- Ensure MongoDB Atlas allows connections from your region

**Sessions not persisting:**
- Verify MONGODB_URI is correct in environment variables
- Check Atlas network access settings (allow 0.0.0.0/0)

**App not starting:**
- Check that PORT environment variable is set by hosting platform
- Verify all required packages are in package.json

## WARNING
This uses Baileys, an unofficial WhatsApp library. There is a risk of account ban. **Use a spare phone number only.**

## File Structure
- `index.js` — Main entry point with Express health check and session loop
- `utils/delay.js` — Random delay helpers
- `utils/filter.js` — Private message and window filters
- `utils/mongoAuth.js` — MongoDB auth state storage
- `replies.js` — Reply variants
- `Dockerfile` — Container build config for Koyeb/Render
- `.env.example` — Environment template
- `MONGODB_SETUP.md` — MongoDB Atlas setup guide
- `ecosystem.config.js` — Optional PM2 config for local development
