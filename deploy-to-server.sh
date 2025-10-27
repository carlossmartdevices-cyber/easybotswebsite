#!/bin/bash

# =============================================================================
# Deploy EasyBots Store to pnptv.app (72.60.29.80)
# =============================================================================

set -e

SERVER_IP="72.60.29.80"
SERVER_USER="root"
APP_DIR="easybots-store"
DOMAIN="pnptv.app"

echo "=========================================="
echo "Deploying to $DOMAIN ($SERVER_IP)"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Step 1: Check SSH connection
print_info "Testing SSH connection..."
if ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'Connected'" > /dev/null 2>&1; then
    print_success "SSH connection successful"
else
    echo "Error: Cannot connect to server. Please check:"
    echo "  1. Server is running"
    echo "  2. SSH is enabled"
    echo "  3. You have the correct credentials"
    exit 1
fi

# Step 2: Push latest code to Git
print_info "Pushing latest code to Git..."
git add .
git commit -m "Deployment to pnptv.app - $(date '+%Y-%m-%d %H:%M:%S')" || true
git push origin main
print_success "Code pushed to Git"

# Step 3: Clone/Pull on server
print_info "Updating code on server..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd ~
if [ -d "easybots-store" ]; then
    echo "Updating existing repository..."
    cd easybots-store
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/PNPtvBots/easybots.git easybots-store
    cd easybots-store
fi
ENDSSH
print_success "Code updated on server"

# Step 4: Transfer environment file
print_info "Transferring environment configuration..."
if [ -f ".env.production.local" ]; then
    scp .env.production.local $SERVER_USER@$SERVER_IP:~/$APP_DIR/.env.production.local
    print_success "Environment file transferred"
else
    echo "Warning: .env.production.local not found!"
    echo "Please create it before continuing."
    echo "Would you like to create it now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        cp .env.production.example .env.production.local
        echo "Created .env.production.local from example."
        echo "Please edit it with your actual credentials, then run this script again."
        exit 1
    fi
fi

# Step 5: Transfer deployment files
print_info "Transferring deployment configurations..."
scp deploy.sh $SERVER_USER@$SERVER_IP:~/$APP_DIR/
scp ecosystem.config.js $SERVER_USER@$SERVER_IP:~/$APP_DIR/
scp nginx.conf $SERVER_USER@$SERVER_IP:~/$APP_DIR/
print_success "Configuration files transferred"

# Step 6: Run deployment on server
print_info "Running deployment script on server..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd ~/easybots-store
chmod +x deploy.sh
./deploy.sh
ENDSSH
print_success "Deployment script completed"

# Step 7: Check status
print_info "Checking deployment status..."
ssh $SERVER_USER@$SERVER_IP "pm2 status"

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Your site should be accessible at:"
echo "  • http://pnptv.app (HTTP)"
echo "  • http://$SERVER_IP (Direct IP)"
echo ""
echo "Next steps:"
echo "  1. Configure SSL: ssh $SERVER_USER@$SERVER_IP"
echo "     Then run: sudo certbot --nginx -d pnptv.app -d www.pnptv.app"
echo ""
echo "  2. Update Firebase authorized domains to include: pnptv.app"
echo ""
echo "  3. Update ePayco webhook URL to: https://pnptv.app/api/webhooks/epayco"
echo ""
echo "Useful commands:"
echo "  • View logs: ssh $SERVER_USER@$SERVER_IP 'pm2 logs easybots-store'"
echo "  • Restart: ssh $SERVER_USER@$SERVER_IP 'pm2 restart easybots-store'"
echo "  • Status: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo ""
