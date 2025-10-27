# Quick Deployment Guide for pnptv.app

Server IP: **72.60.29.80**
Domain: **pnptv.app**
SSH Access: `ssh root@72.60.29.80`

## Prerequisites Checklist

- [ ] DNS configured (pnptv.app → 72.60.29.80)
- [ ] SSH access to server working
- [ ] Code pushed to GitHub
- [ ] `.env.production.local` file created with actual credentials

## Quick Deploy (Automated)

### From Windows (Git Bash):

```bash
cd "c:\Users\carlo\Documents\Easy Bots Website\easybots-store"

# Make script executable (Git Bash)
chmod +x deploy-to-server.sh

# Run deployment
./deploy-to-server.sh
```

This script will:
1. Push your code to GitHub
2. Clone/update code on server
3. Transfer environment variables
4. Run the deployment script
5. Start your application

## Manual Deploy (Step by Step)

### 1. Configure DNS (Do This First!)

Go to your domain registrar and add:

- **A Record**: `@` → `72.60.29.80`
- **A Record**: `www` → `72.60.29.80`

Wait 5-10 minutes, then verify:
```bash
nslookup pnptv.app
# Should show 72.60.29.80
```

### 2. Prepare Environment File

On your local machine:

```bash
cd "c:\Users\carlo\Documents\Easy Bots Website\easybots-store"

# Copy the example
cp .env.production.example .env.production.local

# Edit it with actual values
notepad .env.production.local
```

**Update these values:**
```env
NEXT_PUBLIC_BASE_URL=https://pnptv.app
FIREBASE_ADMIN_CLIENT_EMAIL=your-actual-service-account@studio-9933426702-65d9f.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-key\n-----END PRIVATE KEY-----\n"
GOOGLE_GENAI_API_KEY=your_actual_google_ai_api_key
ADMIN_PHONE_NUMBER=+your_actual_phone
EPAYCO_TEST=false
EPAYCO_TEST_MODE=false
```

### 3. Connect to Server

```bash
ssh root@72.60.29.80
```

### 4. Clone Repository on Server

```bash
cd ~
git clone https://github.com/PNPtvBots/easybots.git easybots-store
cd easybots-store
```

### 5. Transfer Environment File

**From your local machine (new terminal/Git Bash):**

```bash
cd "c:\Users\carlo\Documents\Easy Bots Website\easybots-store"

# Transfer .env file
scp .env.production.local root@72.60.29.80:~/easybots-store/

# Verify it was transferred
ssh root@72.60.29.80 "cat ~/easybots-store/.env.production.local | head -5"
```

### 6. Run Deployment Script

**On the server:**

```bash
cd ~/easybots-store
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Install Node.js 18
- Install PM2 (process manager)
- Install Nginx (web server)
- Install dependencies
- Build your Next.js app
- Start the app with PM2
- Configure Nginx
- Optionally install SSL certificate

### 7. Setup SSL Certificate

**On the server:**

```bash
sudo certbot --nginx -d pnptv.app -d www.pnptv.app
```

Follow prompts:
- Enter your email
- Agree to terms
- Choose option 2 (redirect HTTP to HTTPS)

### 8. Verify Deployment

**Check PM2 status:**
```bash
pm2 status
```

**View logs:**
```bash
pm2 logs easybots-store
```

**Test Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Visit your site:**
- http://72.60.29.80 (should work immediately)
- http://pnptv.app (after DNS propagates)
- https://pnptv.app (after SSL setup)

## Post-Deployment Configuration

### 1. Update Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **studio-9933426702-65d9f**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add: `pnptv.app`
6. Save

### 2. Update ePayco Webhook

1. Log in to [ePayco Dashboard](https://dashboard.epayco.co/)
2. Go to **Integration** → **Webhooks**
3. Set URL: `https://pnptv.app/api/webhooks/epayco`
4. Save

### 3. Test Payment Flow

1. Visit https://pnptv.app
2. Create test account
3. Try test purchase
4. Monitor logs: `ssh root@72.60.29.80 "pm2 logs easybots-store"`

## Useful Commands

### SSH Shortcuts

```bash
# Connect to server
ssh root@72.60.29.80

# Quick log check
ssh root@72.60.29.80 "pm2 logs easybots-store --lines 50"

# Quick restart
ssh root@72.60.29.80 "pm2 restart easybots-store"

# Check status
ssh root@72.60.29.80 "pm2 status"
```

### On Server Commands

```bash
# View application logs
pm2 logs easybots-store

# View only errors
pm2 logs easybots-store --err

# Restart app
pm2 restart easybots-store

# Stop app
pm2 stop easybots-store

# Monitor resources
pm2 monit

# Nginx logs
sudo tail -f /var/log/nginx/pnptv.app-access.log
sudo tail -f /var/log/nginx/pnptv.app-error.log

# Restart Nginx
sudo systemctl restart nginx

# Check SSL
sudo certbot certificates
```

## Updating Your Site

When you make changes:

**From local machine:**
```bash
cd "c:\Users\carlo\Documents\Easy Bots Website\easybots-store"

# Commit and push changes
git add .
git commit -m "Your update message"
git push origin main

# Update on server
ssh root@72.60.29.80 << 'EOF'
cd ~/easybots-store
git pull origin main
npm ci
npm run build
pm2 restart easybots-store
EOF
```

Or use the automated script:
```bash
./deploy-to-server.sh
```

## Troubleshooting

### Can't connect via SSH
```bash
# Test connection
ping 72.60.29.80

# Test SSH
ssh -v root@72.60.29.80
```

### DNS not resolving
```bash
# Check DNS propagation
nslookup pnptv.app
dig pnptv.app

# Use online tool
# Visit: https://dnschecker.org/#A/pnptv.app
```

### Application not starting
```bash
ssh root@72.60.29.80
cd ~/easybots-store

# Check logs
pm2 logs easybots-store

# Try manual start
npm run start

# Check environment
cat .env.production.local
```

### Port 3000 already in use
```bash
ssh root@72.60.29.80

# Check what's using port
sudo lsof -i :3000

# Kill process
pm2 delete easybots-store
pm2 start ecosystem.config.js
```

### SSL certificate fails
```bash
# Make sure DNS is working first
nslookup pnptv.app

# Try manual certificate
sudo certbot certonly --nginx -d pnptv.app -d www.pnptv.app

# Check Nginx config
sudo nginx -t
```

## Security Checklist

After deployment:

- [ ] SSL certificate installed (HTTPS working)
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication (optional but recommended)
- [ ] Environment variables secured (`chmod 600 .env.production.local`)
- [ ] Regular backups scheduled
- [ ] Monitoring set up (PM2 logs)

## Next Steps

1. **Set up monitoring**: Consider using services like UptimeRobot
2. **Set up backups**: Create automated backup script
3. **Add analytics**: Google Analytics or similar
4. **Set up error tracking**: Sentry or similar
5. **Performance monitoring**: Check loading times

## Support

If you encounter issues:
- Check PM2 logs: `pm2 logs easybots-store`
- Check Nginx logs: `sudo tail -f /var/log/nginx/pnptv.app-error.log`
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting

---

**Server Info:**
- IP: 72.60.29.80
- Domain: pnptv.app
- User: root
- App Directory: ~/easybots-store
- Port: 3000 (internal), 80/443 (public via Nginx)
