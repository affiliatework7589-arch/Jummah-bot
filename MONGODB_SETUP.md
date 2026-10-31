# MongoDB Atlas Setup Guide for Jummah Time Bot

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or GitHub account
3. Verify your email address

## Step 2: Create a New Cluster (Free Tier)

1. After login, click **"Build a Database"**
2. Choose **Shared Cluster** (this is the free option)
3. Select your preferred region (choose one closest to your users, e.g., "Asia" for Pakistan)
4. Name your cluster (e.g., "JummahBotCluster")
5. Click **"Create Cluster"**
6. Wait ~2-3 minutes for creation to complete

## Step 3: Create Database User

1. In the Atlas dashboard, go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Fill in:
   - **Auth Method**: Password
   - **Username**: `jummahbot`
   - **Password**: Click "Autogenerate Secure Password" (copy it!) or create your own
   - **Database User Privileges**: Read and write to any database
4. Click **"Add User"**

## Step 4: Allow Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For Render deployment, you have two options:

   **Option A: Allow from Anywhere (Recommended for Render)**
   - Click **"Allow Access from Anywhere"**
   - Click **"Confirm"**

   **Option B: Add Render IPs Manually**
   - Click "Add Current IP Address" (if you're testing locally first)
   - Or add Render's IP ranges: `0.0.0.0/0` and `10.0.0.0/8`

4. Click **"Confirm"**

## Step 5: Get Your Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://jummahbot:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **IMPORTANT**: Replace `<password>` with the actual password you created in Step 3
6. Save this string — you'll need it for `.env`

## Step 6: Test Connection (Optional)

Before deploying, verify your connection works:

```bash
node -e "
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://jummahbot:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/baileys_auth?retryWrites=true&w=majority';
const client = new MongoClient(uri);
client.connect()
  .then(() => console.log('Connected successfully!'))
  .catch(err => console.error('Connection failed:', err.message));
"
```

## Step 7: Update Your .env File

Replace the `MONGODB_URI` in your `.env` file with your actual connection string:

```
DRY_RUN=false
TIMEZONE=Asia/Karachi
SESSION_NAMES=num1,num2
MONGODB_URI=mongodb+srv://jummahbot:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/baileys_auth?retryWrites=true&w=majority
```

**Note**: Keep the `?retryWrites=true&w=majority` at the end — it's required for Render deployment.

## Step 8: Deploy to Render

1. Push your code to GitHub
2. Go to https://dashboard.render.com/new/web
3. Connect your repository
4. Use these settings:
   - **Name**: jummah-bot
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Add environment variables:
   - `DRY_RUN=false`
   - `TIMEZONE=Asia/Karachi`
   - `SESSION_NAMES=num1,num2`
   - `MONGODB_URI=mongodb+srv://jummahbot:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/baileys_auth?retryWrites=true&w=majority`
6. Click **"Create Web Service"**

## Troubleshooting

### Connection Timeout
- Make sure you whitelisted `0.0.0.0/0` in Network Access
- Check that MongoDB Atlas is not blocking your IP

### Auth Failed
- Verify username and password are correct
- Special characters in password may need URL encoding (replace `@` with `%40`, etc.)

### "No route to host"
- This means network access isn't configured properly
- Go back to Network Access and add `0.0.0.0/0`

### Free Tier Limitations
- Free tier (M0) has shared resources and may be slower
- No guarantee of uptime
- Sufficient for personal bot usage

## Security Notes

- **Never commit your `.env` file** to GitHub (it's already in `.gitignore`)
- MongoDB Atlas free tier is sufficient for this use case
- Sessions are stored securely in MongoDB with encrypted connections (TLS)
- Consider changing your password periodically
