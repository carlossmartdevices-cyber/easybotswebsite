# Netlify Deployment Guide for EasyBots Store

## Quick Deployment Steps

### ✅ Already Completed
- [x] Git repository initialized
- [x] All files committed
- [x] Netlify configuration file created ([netlify.toml](netlify.toml))
- [x] Netlify Next.js plugin installed

### 🚀 What You Need to Do Now

---

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `easybots-store`
3. Choose Public or Private
4. **DO NOT** initialize with README
5. Click **"Create repository"**

---

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
cd "c:\Users\carlo\Documents\Easy Bots Website\easybots-store"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/easybots-store.git

# Push your code
git push -u origin master
```

**Example:**
If your GitHub username is "johndoe":
```bash
git remote add origin https://github.com/johndoe/easybots-store.git
git push -u origin master
```

---

## Step 3: Deploy to Netlify

### Option A: Via Netlify Website (Easiest)

1. **Go to [app.netlify.com](https://app.netlify.com)**
   - Sign up or login (you can use GitHub to login)

2. **Click "Add new site" → "Import an existing project"**

3. **Choose "Deploy with GitHub"**
   - Authorize Netlify to access your repositories
   - Select `easybots-store` repository

4. **Configure Build Settings** (should auto-detect):
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty)

5. **Click "Deploy site"**
   - Initial build will take 2-3 minutes
   - Don't worry if it fails - we need to add environment variables first

6. **Your site will be live at**: `https://random-name-123.netlify.app`
   - You can customize this URL in Site settings

---

### Option B: Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize and deploy
cd easybots-store
netlify init
```

Follow the prompts to create and link your site.

---

## Step 4: Add Environment Variables

This is **CRITICAL** - your app won't work without these!

1. **In Netlify Dashboard**:
   - Go to your site
   - Click **"Site configuration"** in the left menu
   - Click **"Environment variables"**

2. **Add all these variables** (click "Add a variable" for each):

### Firebase Client Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY = (from your .env file)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = (from your .env file)
NEXT_PUBLIC_FIREBASE_PROJECT_ID = (from your .env file)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = (from your .env file)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (from your .env file)
NEXT_PUBLIC_FIREBASE_APP_ID = (from your .env file)
```

### Base URL
```
NEXT_PUBLIC_BASE_URL = https://your-site-name.netlify.app
```
⚠️ **Important**: Replace with your actual Netlify URL

### Firebase Admin (Server-side)
```
FIREBASE_ADMIN_PROJECT_ID = (from your .env file)
FIREBASE_ADMIN_CLIENT_EMAIL = (from your .env file)
FIREBASE_ADMIN_PRIVATE_KEY = (from your .env file)
```

### Bold.co Payment
```
BOLD_API_KEY = (from your .env file)
BOLD_WEBHOOK_SECRET = (from your .env file)
```

### Google AI
```
GOOGLE_GENAI_API_KEY = (from your .env file)
```

### Admin Phone
```
ADMIN_PHONE_NUMBER = +1234567890
```

3. **Save all variables**

---

## Step 5: Redeploy

After adding environment variables:

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete (~2-3 minutes)

---

## Step 6: Configure Bold.co Webhook

1. **Copy your Netlify URL**: `https://your-site-name.netlify.app`

2. **Go to Bold.co Dashboard**:
   - Navigate to Webhooks/API settings
   - Add new webhook URL: `https://your-site-name.netlify.app/api/webhooks/bold`
   - Enable events:
     - `transaction.created`
     - `transaction.updated`
   - Save

3. **Test the webhook**:
   - Bold.co usually has a "Test webhook" button
   - Click it to verify connection

---

## Step 7: Test Your Site

Visit your Netlify URL and test:

- [ ] Homepage loads correctly
- [ ] Products display with images
- [ ] Language switcher works (EN/ES)
- [ ] Can navigate to login page
- [ ] Can create an account
- [ ] Can login
- [ ] Click "Buy USD" or "Buy COP" (should redirect to Bold.co)
- [ ] Complete a test purchase
- [ ] Check Netlify function logs for webhook received

---

## Checking Logs

### View Function Logs (for API routes):
1. In Netlify Dashboard → **"Functions"** tab
2. You'll see:
   - `create-payment-link`
   - `webhooks-bold`
3. Click on any to see execution logs

### View Deploy Logs:
1. **"Deploys"** tab
2. Click on latest deploy
3. View build logs

---

## Custom Domain (Optional)

To use your own domain:

1. **In Netlify Dashboard**:
   - **"Domain management"** → **"Add a domain"**
   - Enter your domain
   - Follow DNS configuration instructions

2. **Update environment variables**:
   - Change `NEXT_PUBLIC_BASE_URL` to your custom domain
   - Redeploy

3. **Update Bold.co webhook URL** to your custom domain

---

## Troubleshooting

### Build Fails
**Check:**
- All dependencies in package.json
- Node version (should be 18.x)
- Build logs for specific errors

**Fix:**
- Go to Site settings → Build & deploy → Environment → Node version: `18`

### "Function execution timed out"
**This happens if**:
- Firebase Admin takes too long to initialize
- Bold.co API is slow

**Fix:**
- Increase function timeout in netlify.toml:
```toml
[functions]
  node_bundler = "esbuild"
  external_node_modules = ["firebase-admin"]
```

### Environment Variables Not Working
**Check:**
- Variable names match exactly (case-sensitive)
- No extra spaces before/after values
- Redeploy after adding variables

### Webhooks Not Receiving
**Check:**
- Webhook URL is correct (with /api/webhooks/bold)
- Site is deployed and live
- Bold.co webhook secret matches
- Check function logs for errors

### Firebase Connection Issues
**Check:**
- All NEXT_PUBLIC_* variables are set
- Firebase project allows your Netlify domain
- Firebase Admin private key is properly formatted

---

## Performance Optimization

### Enable Netlify Features:

1. **Asset Optimization**:
   - Site settings → Build & deploy → Post processing
   - Enable: Bundle CSS, Minify CSS, Minify JS, Compress images

2. **Caching**:
   - Add to netlify.toml:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## Continuous Deployment

Every time you push to GitHub, Netlify will automatically:
1. Detect the push
2. Run `npm run build`
3. Deploy the new version

To update your site:
```bash
git add .
git commit -m "Update description"
git push origin master
```

---

## Site URLs

After deployment, you'll have:
- **Production**: `https://your-site-name.netlify.app`
- **Branch deploys**: Automatic preview for PRs
- **Deploy previews**: Every commit gets a unique URL

---

## Monitoring

### Enable Netlify Analytics (Optional - Paid):
- Site settings → Analytics
- $9/month for server-side analytics
- No client-side JavaScript needed

### Free Alternative:
- Add Google Analytics
- Use Netlify's free bandwidth/function usage stats

---

## Support

If you run into issues:
1. Check [Netlify Support Forums](https://answers.netlify.com/)
2. Check [Netlify Next.js Docs](https://docs.netlify.com/frameworks/next-js/)
3. Review function logs in Netlify dashboard
4. Check this project's [DEPLOYMENT.md](DEPLOYMENT.md) for general issues

---

## Summary Checklist

- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Connected repository to Netlify
- [ ] Added all environment variables in Netlify
- [ ] Redeployed site
- [ ] Configured Bold.co webhook URL
- [ ] Tested site functionality
- [ ] Tested payment flow
- [ ] Verified webhook receives events

---

## Your Site is Live! 🎉

Once completed, your EasyBots Store will be live at:
**https://your-site-name.netlify.app**

You can now:
- Share the link with customers
- Process real payments through Bold.co
- Receive AI-powered notifications on sales
- Scale automatically with Netlify's infrastructure

**Need to update?** Just push to GitHub and Netlify deploys automatically!

---

**Questions?** Check the main [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md) for more details.
