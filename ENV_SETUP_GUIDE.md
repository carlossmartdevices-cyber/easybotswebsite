# Environment Variables Setup Guide

## 📋 Complete Checklist - What You Need

### ✅ 1. Firebase Client Configuration (DONE!)
You already have these values configured:
- [x] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [x] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [x] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [x] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [x] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [x] `NEXT_PUBLIC_FIREBASE_APP_ID`

---

### ⏳ 2. Firebase Admin SDK (REQUIRED - Server-side)

**What you need:**
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY`

**How to get it:**

1. **Go to Firebase Console:**
   - Link: https://console.firebase.google.com/project/studio-9933426702-65d9f/settings/serviceaccounts/adminsdk

2. **Download Service Account Key:**
   - Click tab **"Service accounts"**
   - Click **"Generate new private key"** button
   - Click **"Generate key"** in the popup
   - A JSON file will download (e.g., `studio-9933426702-65d9f-firebase-adminsdk-xxxxx.json`)

3. **Open the downloaded JSON file** - it looks like this:
   ```json
   {
     "type": "service_account",
     "project_id": "studio-9933426702-65d9f",
     "private_key_id": "abc123def456...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@studio-9933426702-65d9f.iam.gserviceaccount.com",
     "client_id": "123456789012345678901",
     ...
   }
   ```

4. **Copy these values to your `.env` file:**
   - Find `"client_email"` → Copy the entire email address
   - Find `"private_key"` → Copy the ENTIRE key including quotes and \n characters

**Example of what to copy:**
```env
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc123@studio-9933426702-65d9f.iam.gserviceaccount.com

FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...(very long)...\n-----END PRIVATE KEY-----\n"
```

⚠️ **IMPORTANT:**
- Keep the quotes around the private key
- Keep all the `\n` characters (they represent line breaks)
- The entire key should be on ONE line in your `.env` file

---

### ⏳ 3. Base URL (UPDATE LATER)

**Current value (for local development):**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**What to do:**
- [ ] Keep as `http://localhost:3000` for now
- [ ] After deploying to Netlify, update to: `https://your-site-name.netlify.app`

---

### ⏳ 4. Bold.co Payment Gateway (REQUIRED)

**What you need:**
- [ ] `BOLD_API_KEY`
- [ ] `BOLD_WEBHOOK_SECRET`

**How to get it:**

1. **Sign up for Bold.co:**
   - Go to: https://bold.co
   - Create an account
   - Complete verification

2. **Get API Key:**
   - Login to Bold.co dashboard
   - Go to **Settings** → **API Keys** (or similar)
   - Copy your **API Key** or **Secret Key**
   - Paste into: `BOLD_API_KEY=your_key_here`

3. **Generate Webhook Secret:**
   - Option A: Bold.co might provide one in their dashboard
   - Option B: Generate your own random string (32+ characters)

   **To generate your own:**
   ```bash
   # On Mac/Linux
   openssl rand -hex 32

   # Or use any random string generator
   # Example: j8fk2mf9sk3mf8sk4mf9sk3mf8sk4mf9
   ```
   - Paste into: `BOLD_WEBHOOK_SECRET=your_secret_here`

**Example:**
```env
BOLD_API_KEY=sk_test_abc123def456ghi789
BOLD_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### ⏳ 5. Google AI API Key (REQUIRED - for notifications)

**What you need:**
- [ ] `GOOGLE_GENAI_API_KEY`

**How to get it:**

1. **Go to Google AI Studio:**
   - Link: https://aistudio.google.com/app/apikey

2. **Create API Key:**
   - Click **"Create API Key"** button
   - Choose **"Create API key in new project"** (or select existing project)
   - Copy the generated key (starts with `AIza...`)

3. **Add to `.env`:**
   ```env
   GOOGLE_GENAI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstu
   ```

---

### ⏳ 6. Admin Phone Number (OPTIONAL but recommended)

**What you need:**
- [ ] `ADMIN_PHONE_NUMBER`

**What to do:**
- Add your phone number in E.164 format (with country code, no spaces)
- This is where payment notifications will be sent (simulated for now)

**Examples:**
```env
# United States
ADMIN_PHONE_NUMBER=+15551234567

# Colombia
ADMIN_PHONE_NUMBER=+573001234567

# Mexico
ADMIN_PHONE_NUMBER=+525512345678

# Spain
ADMIN_PHONE_NUMBER=+34612345678
```

---

## 🎯 Summary - What You Actually Need To Get

### Must Have (App won't work without these):
1. ✅ Firebase Client Config - **DONE**
2. ⏳ **Firebase Admin SDK** (download JSON file from Firebase)
3. ⏳ **Bold.co API Key** (sign up at bold.co)
4. ⏳ **Bold.co Webhook Secret** (from Bold.co or generate random)
5. ⏳ **Google AI API Key** (from Google AI Studio)

### Optional:
6. ⏳ Admin Phone Number (your phone for notifications)
7. ⏳ Base URL (update after Netlify deployment)

---

## 🔗 Quick Links

| Service | Link | What to Get |
|---------|------|-------------|
| Firebase Console | https://console.firebase.google.com/project/studio-9933426702-65d9f | Admin SDK JSON file |
| Google AI Studio | https://aistudio.google.com/app/apikey | API Key |
| Bold.co | https://bold.co | API Key + Webhook Secret |

---

## ✅ How to Know You're Done

Your `.env` file should have:
- ✅ All Firebase values filled in (no placeholders)
- ✅ Bold.co API key and webhook secret
- ✅ Google AI API key
- ✅ Admin phone number (if you want notifications)

---

## 🚀 Testing

Once all values are filled in:

```bash
cd easybots-store
npm run dev
```

Visit http://localhost:3000 and test:
1. Homepage loads
2. Products display
3. Can navigate to /login
4. Can create account (tests Firebase Auth)
5. Can login

---

## ❓ Need Help?

If you're stuck on any service:
1. **Firebase** - See [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
2. **Bold.co** - Check their documentation or contact support
3. **Google AI** - See [Google AI Studio docs](https://ai.google.dev/gemini-api/docs/api-key)

---

## 🔐 Security Reminder

- **NEVER commit your `.env` file to Git** (it's in .gitignore)
- **NEVER share your private keys or API keys**
- For production (Netlify), add these same values in Netlify dashboard
