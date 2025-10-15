# Deployment Guide for EasyBots Store

## Option 1: Vercel (Recommended) ⭐

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))

### Step-by-Step Deployment

#### 1. Prepare Your Repository

First, initialize Git and push to GitHub:

```bash
cd easybots-store

# Initialize Git (if not already done)
git init

# Create .gitignore to exclude sensitive files
echo "node_modules
.next
.env.local
.env
.DS_Store
*.log" > .gitignore

# Add all files
git add .
git commit -m "Initial commit: EasyBots Store"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/easybots-store.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

#### 3. Configure Environment Variables

After deployment, go to your project settings:

1. Navigate to **Settings** → **Environment Variables**
2. Add all variables from your `.env.local`:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key_here

# Bold.co
BOLD_API_KEY=your_bold_api_key
BOLD_WEBHOOK_SECRET=your_webhook_secret

# Google AI
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# Admin Phone
ADMIN_PHONE_NUMBER=+1234567890
```

3. Select environments: **Production**, **Preview**, and **Development**
4. Click "Save"

#### 4. Redeploy

After adding environment variables:
1. Go to **Deployments**
2. Click on the latest deployment
3. Click **Redeploy**

#### 5. Configure Bold.co Webhook

1. Get your Vercel deployment URL (e.g., `https://easybots-store.vercel.app`)
2. Go to Bold.co dashboard
3. Set webhook URL to: `https://easybots-store.vercel.app/api/webhooks/bold`
4. Enable events: `transaction.created` and `transaction.updated`

### ✅ Done! Your app is live!

---

## Option 2: Netlify

### Step-by-Step Deployment

#### 1. Build Configuration

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### 2. Deploy

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Netlify auto-detects Next.js
6. Add environment variables in **Site settings** → **Environment variables**
7. Deploy

---

## Option 3: Railway

### Step-by-Step Deployment

#### 1. Create railway.json (optional)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 2. Deploy

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your repository
6. Railway auto-detects Next.js
7. Add environment variables in **Variables** tab
8. Deploy

---

## Option 4: Render

### Step-by-Step Deployment

#### 1. Create render.yaml (optional)

```yaml
services:
  - type: web
    name: easybots-store
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18.17.0
```

#### 2. Deploy

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New Web Service"
4. Connect your repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables
7. Deploy

**Note:** Free tier has cold starts (services sleep after 15 minutes of inactivity)

---

## Option 5: Self-Hosted (VPS)

### Prerequisites
- VPS with Ubuntu 22.04 (DigitalOcean, AWS EC2, etc.)
- Domain name (optional but recommended)

### Step-by-Step Deployment

#### 1. SSH into Your Server

```bash
ssh root@your-server-ip
```

#### 2. Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

#### 4. Clone Your Repository

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/easybots-store.git
cd easybots-store
```

#### 5. Install Dependencies and Build

```bash
npm install
npm run build
```

#### 6. Create .env.local

```bash
nano .env.local
# Paste your environment variables
# Save with Ctrl+X, then Y, then Enter
```

#### 7. Start with PM2

```bash
pm2 start npm --name "easybots-store" -- start
pm2 save
pm2 startup
```

#### 8. Install and Configure Nginx

```bash
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/easybots-store
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/easybots-store /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 9. Install SSL Certificate (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 10. Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### ✅ Your app is now live at https://your-domain.com

---

## Comparison Table

| Platform | Free Tier | Setup Time | Best For | Cold Starts |
|----------|-----------|------------|----------|-------------|
| **Vercel** | ✅ Yes | 5 min | Next.js apps | ❌ No |
| **Netlify** | ✅ Yes | 5 min | Static sites | ⚠️ Minimal |
| **Railway** | ⚠️ $5 credit | 10 min | Full-stack | ❌ No |
| **Render** | ✅ Yes | 10 min | Web services | ✅ Yes (free tier) |
| **AWS Amplify** | ⚠️ Usage-based | 15 min | AWS ecosystem | ❌ No |
| **VPS (Self-hosted)** | ❌ No ($5-10/mo) | 30-60 min | Full control | ❌ No |

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Verify environment variables are set correctly
- [ ] Test user signup and login
- [ ] Test product display and language switcher
- [ ] Create a test purchase (use Bold.co test mode if available)
- [ ] Configure Bold.co webhook with your production URL
- [ ] Test webhook by creating a test transaction
- [ ] Verify AI notification flow works
- [ ] Check Firebase rules and security
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (usually automatic)
- [ ] Set up monitoring/analytics (Vercel Analytics, Google Analytics, etc.)

---

## Troubleshooting

### Build Fails

**Common issues:**
- Missing environment variables → Add them in platform settings
- Node version mismatch → Set Node version to 18.x
- Dependency conflicts → Delete node_modules and package-lock.json, reinstall

### Webhooks Not Working

**Check:**
- Webhook URL is publicly accessible
- Webhook URL includes `/api/webhooks/bold`
- Bold.co webhook secret matches your environment variable
- Server logs for signature verification errors

### Firebase Connection Issues

**Check:**
- All NEXT_PUBLIC_* variables are set
- Firebase Admin credentials are correct
- Private key is properly formatted (with \n for newlines)

### API Routes Return 500 Errors

**Check:**
- Server-side environment variables are set
- Bold.co API key is correct
- Firebase Admin SDK is initialized properly
- Check platform logs for detailed errors

---

## Recommended: Vercel

For the fastest and easiest deployment with the best Next.js support, use Vercel:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Time to deploy: ~5 minutes** ⚡

**Cost: FREE** 💰

---

## Need Help?

If you encounter issues during deployment:
1. Check platform-specific documentation
2. Review error logs in the deployment dashboard
3. Verify all environment variables are set correctly
4. Test locally first with `npm run build && npm start`

Good luck with your deployment! 🚀
