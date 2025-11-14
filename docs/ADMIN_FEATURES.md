# PNPtv Bot - Admin Features Documentation

## Overview

The PNPtv Telegram bot includes comprehensive admin features for managing users, broadcasting messages, viewing analytics, and managing subscription plans. All admin features are restricted to authorized users specified in the `ADMIN_IDS` environment variable.

## Table of Contents

1. [Setup](#setup)
2. [Admin Access Control](#admin-access-control)
3. [Admin Dashboard](#admin-dashboard)
4. [Broadcast Messages](#broadcast-messages)
5. [User Management](#user-management)
6. [Analytics Dashboard](#analytics-dashboard)
7. [Plan Management](#plan-management)
8. [Admin Logs](#admin-logs)
9. [Security & Rate Limiting](#security--rate-limiting)
10. [Firestore Collections](#firestore-collections)

---

## Setup

### Prerequisites

1. **Firebase/Firestore Account**
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore database
   - Download service account credentials

2. **Environment Variables**

Add the following to your `.env` file:

```env
# Admin Configuration
ADMIN_IDS=12345678,87654321

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

### Getting Firebase Credentials

1. Go to Firebase Console → Project Settings
2. Navigate to "Service Accounts" tab
3. Click "Generate New Private Key"
4. Copy the entire JSON content to `FIREBASE_SERVICE_ACCOUNT` (as a single line)

---

## Admin Access Control

### Authorization

Only users with Telegram IDs listed in `ADMIN_IDS` can:
- Use the `/admin` command
- Access admin features in both private and group chats
- View and interact with admin menus

### Example

```env
ADMIN_IDS=123456789,987654321,456789123
```

This allows three users to access admin features.

---

## Admin Dashboard

### Accessing the Dashboard

**Command:** `/admin`

**Works in:** Both private and group chats

**Description:** Opens the main admin dashboard with access to all admin features.

### Dashboard Menu

```
🛠 Admin Dashboard

📢 Broadcast Messages
👥 User Management
📊 Analytics
💰 Plan Management
📋 View Logs
🔙 Close
```

---

## Broadcast Messages

### Overview

Send messages to all users or specific groups (premium users, free users, etc.).

### Features

- **Text Messages:** Send formatted text messages with Markdown support
- **Photo Broadcasts:** Send photos with optional captions
- **Video Broadcasts:** Send videos with optional captions
- **Targeted Broadcasting:**
  - All Users
  - Premium Users Only (premium + gold plans)
  - Free Users Only (basic plan)

### How to Send a Broadcast

1. Click **📢 Broadcast Messages** from admin dashboard
2. Select message type:
   - 💬 Text Message
   - 📷 Photo with Caption
   - 🎥 Video with Caption
3. Enter/send your content
4. Review preview
5. Select target audience:
   - ✅ Send to All Users
   - 👑 Send to Premium Only
   - 🆓 Send to Free Only
6. Confirm and wait for delivery report

### Delivery Report

After sending, you'll receive:
- Total users targeted
- Successfully sent count
- Failed delivery count
- Detailed logs in Firestore

### Example Flow

```
Admin: /admin
Bot: [Shows admin dashboard]
Admin: [Clicks "Broadcast Messages"]
Admin: [Clicks "Text Message"]
Bot: "Enter the message you want to broadcast:"
Admin: "🎉 New feature released! Check it out."
Bot: [Shows preview and target options]
Admin: [Clicks "Send to All Users"]
Bot: "Broadcasting... Please wait."
Bot: "✅ Broadcast Complete
     ✅ Sent: 1,234
     ❌ Failed: 5
     📈 Total: 1,239"
```

---

## User Management

### Overview

Search, view, edit, and manage individual user accounts.

### Features

#### Search Users

Search by:
- Telegram User ID
- Username (without @)
- First name or last name

#### User Actions

For each user, you can:
- **View Profile:** See complete user information
- **Activate/Deactivate:** Enable or disable user accounts
- **Extend Subscription:** Add days to subscription
- **Change Plan:** Assign different subscription plan
- **Export Data:** Export user information

#### User Statistics

View aggregate statistics:
- Total users
- Active users
- Premium users
- New users today

#### Export Users

Export user data to CSV format including:
- User ID
- Username
- First name
- Plan
- Status
- Join date

### Example Flow

```
Admin: [Clicks "User Management"]
Admin: [Clicks "Search User"]
Bot: "Enter username/ID to search:"
Admin: "john_doe"
Bot: "👤 User Profile
     ID: 123456789
     Name: John Doe
     Username: @john_doe
     Plan: premium
     Status: active
     Joined: 01/15/2024"
     [Edit User] [Extend Sub] [Change Plan] [Activate/Deactivate]
Admin: [Clicks "Extend Subscription"]
Bot: "Enter the number of days to extend:"
Admin: "30"
Bot: "✅ Subscription Extended
     Extended by: 30 days
     New end date: 03/15/2024"
```

---

## Analytics Dashboard

### Overview

View detailed analytics about users, revenue, and engagement.

### Available Metrics

#### User Growth

- Total users
- New users today
- New users last 7 days
- New users last 30 days
- New users last 90 days
- Daily/weekly/monthly growth rates

#### Revenue

- Monthly Recurring Revenue (MRR)
- Active subscriptions by plan
- New subscriptions this month
- Annual Run Rate (ARR)
- Revenue breakdown by plan

#### Engagement

- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Active user percentage
- Broadcast delivery rates
- Engagement rates

#### Plans Overview

- User distribution by plan
- Conversion rate (free to paid)
- Plan popularity
- Revenue per plan

### Export Analytics

Export analytics data to CSV format for further analysis.

### Example

```
📊 Analytics Dashboard

📈 User Growth
💰 Revenue: $12,450/mo MRR
💬 Engagement: 45% DAU Rate
📊 Plans: 23% Conversion Rate
```

---

## Plan Management

### Overview

Create, edit, and manage subscription plans.

### Features

#### Add New Plan

Create subscription plans with:
- Plan name (e.g., Premium, Gold, Enterprise)
- Monthly price
- Duration in days
- List of features
- Active/inactive status

#### Edit Plan

Modify existing plan:
- Name
- Price
- Duration

#### Plan Analytics

View plan-specific metrics:
- Total users on plan
- Active users
- New users (last 30 days)
- Total revenue
- Active revenue

#### Activate/Deactivate Plans

Control plan availability.

### Example Flow

```
Admin: [Clicks "Plan Management"]
Admin: [Clicks "Add New Plan"]
Bot: "Step 1 of 4: Enter the plan name"
Admin: "Enterprise"
Bot: "Step 2 of 4: Enter the monthly price"
Admin: "49.99"
Bot: "Step 3 of 4: Enter the duration in days"
Admin: "30"
Bot: "Step 4 of 4: Enter plan features (one per line)"
Admin: "Priority support
       Custom branding
       Advanced analytics
       API access"
Bot: "✅ Plan Created Successfully!
     Name: Enterprise
     Price: $49.99/month
     Duration: 30 days
     Features: 4"
```

---

## Admin Logs

### Overview

View audit trail of all admin actions.

### Features

- View all logs
- Filter by action type:
  - Broadcast logs
  - User management logs
  - Plan management logs
- See timestamp, action, target, and status
- Track errors and failures

### Log Information

Each log entry includes:
- Timestamp
- Admin ID
- Action performed
- Target (user ID, plan ID, etc.)
- Status (success/failed/partial)
- Error message (if failed)
- Additional metadata

### Example

```
📋 Admin Activity Logs

✅ Jan 15, 14:30
   Action: broadcast
   Target: all

✅ Jan 15, 14:25
   Action: activate_user
   Target: 123456789

❌ Jan 15, 14:20
   Action: extend_subscription
   Target: 987654321
   Error: User not found
```

---

## Security & Rate Limiting

### Admin Middleware

All admin features are protected by middleware that:
- Verifies user is in `ADMIN_IDS` list
- Denies access to unauthorized users
- Works in both private and group chats

### Rate Limiting

Admin commands are rate-limited to:
- **10 requests per minute** per admin
- Prevents accidental spam
- Protects against API rate limits

### Error Handling

- All admin actions are wrapped in try-catch blocks
- Errors are logged to console and Firestore
- User-friendly error messages
- Automatic rollback on failures

---

## Firestore Collections

### users

Stores user data:
```javascript
{
  id: "123456789",           // Telegram user ID (document ID)
  username: "john_doe",
  firstName: "John",
  lastName: "Doe",
  plan: "premium",
  status: "active",          // active/inactive
  subscriptionEnd: Timestamp,
  bio: "User bio",
  location: {
    city: "New York",
    latitude: 40.7128,
    longitude: -74.0060
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActive: Timestamp
}
```

### plans

Stores subscription plans:
```javascript
{
  name: "Premium",
  price: 9.99,
  duration: 30,              // days
  features: [
    "Feature 1",
    "Feature 2"
  ],
  status: "active",          // active/inactive
  createdAt: Timestamp,
  createdBy: 123456789,      // Admin ID
  updatedAt: Timestamp
}
```

### broadcasts

Stores broadcast history:
```javascript
{
  adminId: 123456789,
  userId: 987654321,
  type: "text",              // text/photo/video
  targetGroup: "all",        // all/premium/free
  message: "Broadcast content",
  fileId: "file_id",         // for photo/video
  status: "sent",            // sent/failed
  error: "Error message",    // if failed
  sentAt: Timestamp
}
```

### admin_logs

Stores admin action audit trail:
```javascript
{
  adminId: 123456789,
  action: "broadcast",
  target: "all_users",
  metadata: {
    type: "text",
    totalUsers: 1234,
    sent: 1230,
    failed: 4
  },
  status: "success",         // success/failed/partial
  error: null,
  timestamp: Timestamp
}
```

---

## Best Practices

### For Admins

1. **Broadcasts:**
   - Always preview before sending
   - Start with small test groups
   - Use targeted broadcasts when appropriate
   - Monitor delivery rates

2. **User Management:**
   - Document subscription extensions in notes
   - Verify user identity before making changes
   - Use deactivation instead of deletion
   - Export data regularly for backups

3. **Plan Management:**
   - Test new plans with a few users first
   - Keep plan names consistent
   - Document feature changes
   - Monitor plan analytics

4. **Security:**
   - Don't share admin credentials
   - Use secure .env file storage
   - Regularly review admin logs
   - Report suspicious activity

### For Developers

1. **Error Handling:**
   - Always wrap admin actions in try-catch
   - Log errors to both console and Firestore
   - Provide user-friendly error messages
   - Implement retry logic for transient failures

2. **Performance:**
   - Use Firestore batch operations when possible
   - Implement pagination for large data sets
   - Cache frequently accessed data
   - Monitor API quotas

3. **Testing:**
   - Test with Firebase Emulator
   - Create test admin accounts
   - Verify rate limiting
   - Test error scenarios

---

## Troubleshooting

### Firebase Not Working

**Issue:** "Database not available" error

**Solutions:**
1. Check `FIREBASE_SERVICE_ACCOUNT` is valid JSON
2. Verify Firebase project has Firestore enabled
3. Check service account has necessary permissions
4. Ensure `FIREBASE_DATABASE_URL` is correct

### Admin Commands Not Working

**Issue:** "Not authorized" error

**Solutions:**
1. Verify your Telegram ID is in `ADMIN_IDS`
2. Check `.env` file is loaded correctly
3. Restart the bot after changing `ADMIN_IDS`
4. Use correct ID format (numbers only, comma-separated)

### Broadcast Failures

**Issue:** High broadcast failure rate

**Solutions:**
1. Check for rate limiting from Telegram
2. Verify users haven't blocked the bot
3. Ensure message format is valid
4. Use smaller delay between messages

### Rate Limit Errors

**Issue:** "Too many requests" error

**Solutions:**
1. Wait 60 seconds before retrying
2. Reduce frequency of admin commands
3. Use batch operations instead of loops
4. Check rate limit configuration

---

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Firestore logs
3. Check admin_logs collection
4. Contact the development team

---

## Changelog

### v1.0.0 (Initial Release)

- Admin dashboard with full menu system
- Broadcast messages (text, photo, video)
- User management (search, edit, activate/deactivate)
- Analytics dashboard (users, revenue, engagement)
- Plan management (add, edit, activate/deactivate)
- Admin action logging
- Rate limiting and security controls
- Firestore integration
- Support for both private and group chats

---

**Last Updated:** January 2024
**Version:** 1.0.0
