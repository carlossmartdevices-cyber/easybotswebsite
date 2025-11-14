# Admin Features Setup Guide

## Quick Start

This guide will help you set up and configure the admin features for the PNPtv Telegram bot.

## Prerequisites

- Node.js 18+ installed
- Firebase project created
- Telegram bot token
- Admin Telegram user IDs

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required dependencies including `firebase-admin`.

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project" or select existing project
3. Follow the setup wizard
4. Enable Firestore Database:
   - Go to "Firestore Database" in left sidebar
   - Click "Create Database"
   - Choose "Start in production mode"
   - Select your region

## Step 3: Get Firebase Credentials

1. In Firebase Console, go to Project Settings (gear icon)
2. Navigate to "Service Accounts" tab
3. Click "Generate New Private Key"
4. Download the JSON file
5. **Keep this file secure - it contains sensitive credentials**

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update the following:

   ```env
   # Telegram Bot Token
   BOT_TOKEN=your_bot_token_from_botfather
   BOT_USERNAME=your_bot_username

   # Admin User IDs (comma-separated)
   ADMIN_IDS=123456789,987654321

   # Firebase Configuration
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```

### Getting Your Telegram User ID

To find your Telegram user ID:

1. Start a chat with [@userinfobot](https://t.me/userinfobot)
2. The bot will reply with your user ID
3. Add this ID to `ADMIN_IDS` in `.env`

### Setting Firebase Service Account

Open the downloaded JSON file and copy **the entire content** to `FIREBASE_SERVICE_ACCOUNT` as a single line:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"pnptv-bot","private_key_id":"abc123",...}
```

## Step 5: Initialize Firestore Collections

The bot will automatically create collections as needed, but you can optionally pre-create them:

### Required Collections

1. **users** - Stores user data
2. **plans** - Stores subscription plans
3. **broadcasts** - Stores broadcast history
4. **admin_logs** - Stores admin action logs

### Creating Sample Plans

You can add initial plans via the admin interface or directly in Firestore:

```javascript
// Sample plan document
{
  name: "Premium",
  price: 9.99,
  duration: 30,
  features: [
    "Access to premium content",
    "Priority support",
    "No ads"
  ],
  status: "active",
  createdAt: <Timestamp>,
  createdBy: 123456789
}
```

## Step 6: Set Firestore Security Rules

In Firebase Console → Firestore Database → Rules, add:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write from authenticated service account only
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

This ensures only your bot (via service account) can access the data.

## Step 7: Start the Bot

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## Step 8: Test Admin Access

1. Send `/admin` to your bot
2. You should see the admin dashboard:
   ```
   🛠 Admin Dashboard

   Welcome, [Your Name]!
   You have access to all administrative features.

   📢 Broadcast Messages
   👥 User Management
   📊 Analytics
   💰 Plan Management
   📋 View Logs
   🔙 Close
   ```

3. If you see "Not authorized", verify:
   - Your Telegram ID is in `ADMIN_IDS`
   - `.env` file is in the root directory
   - Bot was restarted after updating `.env`

## Firestore Indexes

Some queries may require composite indexes. Firebase will provide index creation links when needed.

### Common Indexes Needed

1. **users collection:**
   - Fields: `plan`, `status`
   - Query scope: Collection

2. **users collection:**
   - Fields: `createdAt`, `plan`
   - Query scope: Collection

3. **broadcasts collection:**
   - Fields: `sentAt`, `status`
   - Query scope: Collection

Click the link in the error message to auto-create the index.

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Firebase service account JSON is secure
- [ ] Only trusted users are in `ADMIN_IDS`
- [ ] Firestore security rules are configured
- [ ] Bot token is not shared publicly
- [ ] Firebase billing alerts are set up (optional)

## Common Issues

### "Database not available" Error

**Cause:** Firebase not configured or credentials invalid

**Solution:**
1. Verify `FIREBASE_SERVICE_ACCOUNT` is valid JSON
2. Check that Firestore is enabled in Firebase Console
3. Ensure service account has Firestore permissions

### "Not authorized" for Admin Commands

**Cause:** User ID not in `ADMIN_IDS`

**Solution:**
1. Get your Telegram user ID from @userinfobot
2. Add it to `ADMIN_IDS` in `.env`
3. Restart the bot

### Broadcasts Not Sending

**Cause:** Rate limiting or invalid users

**Solution:**
1. Check Telegram API rate limits
2. Verify users haven't blocked the bot
3. Check `broadcasts` collection for error messages
4. Reduce broadcast frequency

### Firestore Permission Denied

**Cause:** Service account lacks permissions

**Solution:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Update `FIREBASE_SERVICE_ACCOUNT` in `.env`
4. Restart the bot

## Production Deployment

### Environment Variables

For production, use environment variables instead of `.env` file:

```bash
export BOT_TOKEN="your_token"
export ADMIN_IDS="123456789,987654321"
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
export FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"
export NODE_ENV="production"
```

### Process Manager

Use PM2 or similar to keep the bot running:

```bash
npm install -g pm2
pm2 start src/index.js --name pnptv-bot
pm2 save
pm2 startup
```

### Monitoring

Set up monitoring for:
- Bot uptime
- Error logs
- Firestore usage
- API quota usage
- Admin action logs

### Backup

Regular backups recommended:
1. Export Firestore data monthly
2. Save admin logs
3. Backup user data
4. Keep `.env` backup securely

## Admin Features Overview

Once set up, you'll have access to:

1. **Broadcast Messages**
   - Send text, photos, or videos to all users
   - Target specific user groups (premium, free, etc.)
   - Track delivery status

2. **User Management**
   - Search users by ID or username
   - View user profiles
   - Activate/deactivate accounts
   - Extend subscriptions
   - Change user plans
   - Export user data

3. **Analytics**
   - User growth metrics
   - Revenue analytics
   - Engagement statistics
   - Plan performance

4. **Plan Management**
   - Create subscription plans
   - Edit plan details
   - Activate/deactivate plans
   - View plan analytics

5. **Admin Logs**
   - Audit trail of all admin actions
   - Filter by action type
   - Track errors and failures

## Next Steps

1. Read [ADMIN_FEATURES.md](./ADMIN_FEATURES.md) for detailed feature documentation
2. Create initial subscription plans
3. Test each admin feature
4. Set up monitoring and alerts
5. Train additional admins

## Support

For issues or questions:
- Check the troubleshooting section
- Review Firestore logs
- Check `admin_logs` collection
- Contact the development team

---

**Setup Complete!** 🎉

You now have full admin access to manage your PNPtv Telegram bot.
