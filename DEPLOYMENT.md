# Deployment Guide for pnptv.app

This guide covers deploying the EasyBots Store application to your VPS/Cloud server with the domain **pnptv.app**.

## Prerequisites

- A VPS or Cloud server (Ubuntu 20.04+ or similar)
- Root or sudo access to the server
- Domain **pnptv.app** registered
- Access to DNS management for pnptv.app

## Server Requirements

- **OS**: Ubuntu 20.04 LTS or later (Debian-based)
- **RAM**: Minimum 1GB (2GB recommended)
- **CPU**: 1 vCPU minimum (2+ recommended)
- **Storage**: 20GB minimum
- **Node.js**: 18.x or later
- **PM2**: Latest version
- **Nginx**: Latest version

## Step-by-Step Deployment

### 1. Initial Server Setup

First, connect to your server via SSH:

```bash
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

Update system packages:

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 2. Configure DNS

Before deploying, configure your DNS records at your domain registrar:

**For pnptv.app:**

| Type  | Name | Value           | TTL  |
|-------|------|-----------------|------|
| A     | @    | YOUR_SERVER_IP  | 3600 |
| A     | www  | YOUR_SERVER_IP  | 3600 |

Or use CNAME for www:

| Type  | Name | Value      | TTL  |
|-------|------|------------|------|
| A     | @    | YOUR_SERVER_IP | 3600 |
| CNAME | www  | pnptv.app  | 3600 |

**Note:** DNS propagation can take up to 48 hours, but usually completes within a few hours.

Verify DNS propagation:
```bash
dig pnptv.app
dig www.pnptv.app
```

### 3. Transfer Files to Server

From your local machine, transfer the project to the server:

**Option A: Using Git (Recommended)**

On your server:
```bash
cd ~
git clone https://github.com/your-username/easybots-store.git
cd easybots-store
```

**Option B: Using SCP/RSYNC**

From your local machine:
```bash
# Using rsync (recommended)
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /c/Users/carlo/Documents/Easy\ Bots\ Website/easybots-store/ \
  your-username@your-server-ip:~/easybots-store/

# Or using scp
scp -r /c/Users/carlo/Documents/Easy\ Bots\ Website/easybots-store \
  your-username@your-server-ip:~/
```

### 4. Configure Environment Variables

On your server, create the production environment file:

```bash
cd ~/easybots-store
cp .env.production.example .env.production.local
nano .env.production.local
```

Update the following critical values:

```env
# Update base URL
NEXT_PUBLIC_BASE_URL=https://pnptv.app

# Add your Firebase Admin private key (get from Firebase Console)
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@studio-9933426702-65d9f.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-private-key\n-----END PRIVATE KEY-----\n"

# Set production mode for ePayco
EPAYCO_TEST=false
EPAYCO_TEST_MODE=false

# Add your actual Google AI API key
GOOGLE_GENAI_API_KEY=your_actual_google_ai_api_key

# Add your WhatsApp number for notifications
ADMIN_PHONE_NUMBER=+your_phone_number
```

Save and exit (Ctrl+X, then Y, then Enter in nano).

### 5. Run Deployment Script

Make the deployment script executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will automatically:
- Install Node.js, PM2, and Nginx
- Install dependencies
- Build the Next.js application
- Start the app with PM2
- Configure Nginx
- Optionally set up SSL with Let's Encrypt

**If you want to manually run each step**, see the [Manual Deployment](#manual-deployment) section below.

### 6. Setup SSL Certificate

If the deployment script didn't set up SSL, do it manually:

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d pnptv.app -d www.pnptv.app

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose to redirect HTTP to HTTPS (option 2)
```

Certbot will automatically:
- Obtain the SSL certificate
- Update your Nginx configuration
- Set up auto-renewal

Verify auto-renewal:
```bash
sudo certbot renew --dry-run
```

### 7. Configure Firewall

Set up a firewall to allow only necessary traffic:

```bash
# Install UFW if not installed
sudo apt-get install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 8. Verify Deployment

Check that everything is running:

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs easybots-store

# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t
```

Visit your site:
- http://pnptv.app (should redirect to HTTPS)
- https://pnptv.app

### 9. Post-Deployment Configuration

#### A. Update Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add `pnptv.app` to the list

#### B. Update ePayco Webhook URL

1. Log in to [ePayco Dashboard](https://dashboard.epayco.co/)
2. Go to **Integration** → **Webhooks** or **Confirmation URL**
3. Update the webhook URL to: `https://pnptv.app/api/webhooks/epayco`
4. Save changes

#### C. Test Payment Flow

1. Visit https://pnptv.app
2. Create a test account
3. Try purchasing a product with a test payment
4. Verify webhook is received and processed
5. Check logs: `pm2 logs easybots-store`

## Manual Deployment

If you prefer to deploy manually instead of using the script:

### Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### Install PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### Install Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Build and Start Application

```bash
cd ~/easybots-store

# Install dependencies
npm ci

# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/pnptv.app

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/pnptv.app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Useful PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs easybots-store

# Restart application
pm2 restart easybots-store

# Stop application
pm2 stop easybots-store

# Monitor in real-time
pm2 monit

# View detailed info
pm2 info easybots-store
```

## Updating Your Application

When you make changes and need to redeploy:

### Option A: Using Git (Recommended)

```bash
cd ~/easybots-store

# Pull latest changes
git pull origin main

# Install any new dependencies
npm ci

# Rebuild
npm run build

# Restart with PM2
pm2 restart easybots-store
```

### Option B: Manual File Transfer

```bash
# From local machine
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /c/Users/carlo/Documents/Easy\ Bots\ Website/easybots-store/ \
  your-username@your-server-ip:~/easybots-store/

# On server
cd ~/easybots-store
npm ci
npm run build
pm2 restart easybots-store
```

### Quick Update Script

Create `update.sh` on your server:

```bash
#!/bin/bash
cd ~/easybots-store
git pull origin main
npm ci
npm run build
pm2 restart easybots-store
pm2 save
echo "Application updated successfully!"
pm2 status
```

Make it executable:
```bash
chmod +x update.sh
```

Then update with:
```bash
./update.sh
```

## Monitoring and Logs

### Application Logs

```bash
# Real-time logs
pm2 logs easybots-store --lines 100

# Error logs only
pm2 logs easybots-store --err

# Flush logs
pm2 flush
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/pnptv.app-access.log

# Error logs
sudo tail -f /var/log/nginx/pnptv.app-error.log
```

### System Monitoring

```bash
# PM2 monitoring dashboard
pm2 monit

# System resources
htop
# or
top
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs easybots-store

# Check environment variables
cat .env.production.local

# Try starting manually to see errors
npm run start
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -50 /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Port Already in Use

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check auto-renewal
sudo certbot renew --dry-run
```

### Webhook Not Receiving Events

1. Verify webhook URL in ePayco dashboard
2. Check firewall allows HTTPS traffic: `sudo ufw status`
3. Test webhook endpoint: `curl https://pnptv.app/api/webhooks/epayco`
4. Check application logs: `pm2 logs easybots-store`

### Database Connection Issues

1. Verify Firebase credentials in `.env.production.local`
2. Check Firebase Admin SDK private key format (must include `\n`)
3. Test Firebase connection in logs

## Security Best Practices

1. **Keep System Updated**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

2. **Use Strong Firewall Rules**
   - Only open necessary ports (22, 80, 443)
   - Consider changing SSH port from default 22

3. **Secure SSH Access**
   ```bash
   # Disable password authentication (use SSH keys only)
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

4. **Keep Environment Variables Secret**
   - Never commit `.env.production.local` to Git
   - Use proper file permissions: `chmod 600 .env.production.local`

5. **Enable Automatic Security Updates**
   ```bash
   sudo apt-get install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

6. **Monitor Logs Regularly**
   - Set up log monitoring
   - Consider using a service like Sentry for error tracking

## Backup Strategy

Create automated backups:

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/easybots-store"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz ~/easybots-store \
  --exclude='node_modules' --exclude='.next'

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "Backup completed: app_$DATE.tar.gz"
```

Add to crontab for daily backups:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Performance Optimization

1. **Enable Nginx Caching**
   - Already configured in `nginx.conf`

2. **Use PM2 Cluster Mode**
   - Already enabled in `ecosystem.config.js` with `instances: 'max'`

3. **Monitor Resource Usage**
   ```bash
   pm2 monit
   ```

4. **Consider CDN**
   - Use Cloudflare for static assets caching
   - Add Cloudflare DNS and enable proxy

## Support

If you encounter issues:

1. Check logs: `pm2 logs easybots-store`
2. Verify environment variables: `.env.production.local`
3. Test each component individually
4. Review this documentation
5. Contact support@easybots.store

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [ePayco API Documentation](https://docs.epayco.com/)

---

**Congratulations!** Your EasyBots Store is now deployed at https://pnptv.app
