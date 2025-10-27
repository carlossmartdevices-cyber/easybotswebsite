#!/bin/bash

# =============================================================================
# EasyBots Store Deployment Script for pnptv.app
# =============================================================================
# This script automates the deployment process on your VPS/Cloud server
# =============================================================================

set -e  # Exit on any error

echo "=========================================="
echo "EasyBots Store Deployment Script"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="easybots-store"
APP_DIR="$HOME/easybots-store"
NODE_VERSION="18"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Check if running on server
if [ "$1" != "--force" ] && [ -f "/.dockerenv" ] || grep -qa container=lxc /proc/1/environ 2>/dev/null; then
    print_info "Detected container/server environment"
fi

# Step 1: Update system packages
print_info "Updating system packages..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update -qq
    print_success "System packages updated"
elif command -v yum &> /dev/null; then
    sudo yum update -y -q
    print_success "System packages updated"
fi

# Step 2: Install Node.js if not installed
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Step 3: Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2..."
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed: $(pm2 --version)"
fi

# Step 4: Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    print_info "Installing Nginx..."
    sudo apt-get install -y nginx
    print_success "Nginx installed"
else
    print_success "Nginx already installed"
fi

# Step 5: Create logs directory
print_info "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Step 6: Check for .env.production.local
if [ ! -f ".env.production.local" ]; then
    print_error "Error: .env.production.local not found!"
    echo ""
    echo "Please create .env.production.local with your production environment variables."
    echo "You can use .env.production.example as a template."
    exit 1
fi
print_success "Environment file found"

# Step 7: Install dependencies
print_info "Installing dependencies..."
npm ci --production=false
print_success "Dependencies installed"

# Step 8: Build the application
print_info "Building Next.js application..."
npm run build
print_success "Build completed"

# Step 9: Stop existing PM2 process if running
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    print_info "Stopping existing PM2 process..."
    pm2 stop $APP_NAME
    pm2 delete $APP_NAME
    print_success "Existing process stopped"
fi

# Step 10: Start application with PM2
print_info "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
print_success "Application started"

# Step 11: Setup PM2 startup script
print_info "Setting up PM2 startup script..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
print_success "PM2 startup configured"

# Step 12: Configure Nginx (if not already configured)
if [ ! -f "/etc/nginx/sites-available/pnptv.app" ]; then
    print_info "Configuring Nginx..."
    sudo cp nginx.conf /etc/nginx/sites-available/pnptv.app
    sudo ln -sf /etc/nginx/sites-available/pnptv.app /etc/nginx/sites-enabled/

    # Test Nginx configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        print_success "Nginx configured and reloaded"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
else
    print_success "Nginx already configured"
fi

# Step 13: Setup SSL with Let's Encrypt (optional)
if ! command -v certbot &> /dev/null; then
    echo ""
    print_info "SSL Certificate Setup"
    read -p "Do you want to install Certbot for SSL certificates? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installing Certbot..."
        sudo apt-get install -y certbot python3-certbot-nginx
        print_success "Certbot installed"

        print_info "Obtaining SSL certificate..."
        sudo certbot --nginx -d pnptv.app -d www.pnptv.app
        print_success "SSL certificate obtained"
    fi
fi

# Step 14: Display status
echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
pm2 status
echo ""
print_success "Deployment completed successfully!"
echo ""
echo "Your site should now be running at:"
echo "  • http://pnptv.app (will redirect to HTTPS if SSL is configured)"
echo "  • https://pnptv.app (if SSL is configured)"
echo ""
echo "Useful commands:"
echo "  • View logs:    pm2 logs $APP_NAME"
echo "  • Restart app:  pm2 restart $APP_NAME"
echo "  • Stop app:     pm2 stop $APP_NAME"
echo "  • App status:   pm2 status"
echo "  • Monitor:      pm2 monit"
echo ""
echo "Next steps:"
echo "  1. Configure DNS A record for pnptv.app to point to your server IP"
echo "  2. Update ePayco webhook URL to: https://pnptv.app/api/webhooks/epayco"
echo "  3. Add pnptv.app to Firebase authorized domains"
echo "  4. Test the payment flow thoroughly"
echo ""
