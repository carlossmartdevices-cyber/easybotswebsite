# Getting Started with EasyBots Store

This guide will help you set up and run the EasyBots Store application.

## Quick Start

1. **Navigate to the project directory:**
   ```bash
   cd "c:\Users\carlo\Documents\Easy Bots Website\easybots-store"
   ```

2. **Install dependencies (already done):**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase, Bold.co, and Google AI credentials

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Go to http://localhost:3000

## What's Been Built

### ✅ Core Features Implemented

1. **Homepage ([app/page.tsx](app/page.tsx))**
   - Product grid displaying 6 AI bots
   - Language switcher (English/Spanish)
   - User authentication section (Login/Logout)
   - Dark theme UI with ShadCN components

2. **Authentication ([app/login/page.tsx](app/login/page.tsx))**
   - Email/password login
   - User signup with full name
   - Form validation with Zod
   - Firebase Authentication integration

3. **Product Card ([src/components/product-card.tsx](src/components/product-card.tsx))**
   - Product images from Unsplash
   - Bilingual name and description
   - USD and COP pricing
   - Buy buttons for both currencies
   - Android deep link support (bold://)

4. **Payment Integration**
   - **Create Payment Link API** ([app/api/create-payment-link/route.ts](app/api/create-payment-link/route.ts))
     - Creates Bold.co payment links
     - Saves transactions to Firestore
     - Handles both USD and COP

   - **Webhook Handler** ([app/api/webhooks/bold/route.ts](app/api/webhooks/bold/route.ts))
     - Receives Bold.co events
     - Verifies HMAC-SHA256 signatures
     - Updates transaction status
     - Triggers AI notifications

5. **AI Notification System**
   - **Genkit Flow** ([src/ai/flows/payment-notification.ts](src/ai/flows/payment-notification.ts))
     - Triggers on successful payments
     - Uses Gemini 1.5 Flash
     - Composes admin notifications

   - **WhatsApp Tool** ([src/ai/tools/whatsapp.ts](src/ai/tools/whatsapp.ts))
     - Simulates WhatsApp sending
     - Ready for Twilio integration

6. **Legal Pages**
   - Terms and Conditions ([app/terms/page.tsx](app/terms/page.tsx))
   - Privacy Policy ([app/privacy/page.tsx](app/privacy/page.tsx))
   - Refund Policy ([app/refund/page.tsx](app/refund/page.tsx))
   - All Products Table ([app/products/page.tsx](app/products/page.tsx))

### 📁 Project Structure

```
easybots-store/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── login/             # Auth page
│   ├── products/          # Products table
│   ├── terms/             # Legal pages
│   ├── privacy/
│   ├── refund/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Dark theme styles
├── src/
│   ├── ai/                # Genkit AI flows
│   ├── components/        # React components
│   └── lib/               # Utilities and configs
├── components/ui/         # ShadCN components
├── docs/                  # Documentation
└── .env.example          # Environment template
```

## Next Steps

### 1. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Get your credentials and add to `.env.local`

### 2. Set Up Bold.co

1. Sign up at https://bold.co
2. Get your API key
3. Generate a webhook secret
4. Add credentials to `.env.local`

### 3. Get Google AI Key

1. Visit https://aistudio.google.com/app/apikey
2. Create an API key
3. Add to `.env.local` as `GOOGLE_GENAI_API_KEY`

### 4. Test the Application

1. **Test Authentication:**
   - Go to /login
   - Create a new account
   - Verify login/logout works

2. **Test Product Display:**
   - Homepage should show 6 products
   - Language switcher should work
   - Prices should display correctly

3. **Test Payment Flow:**
   - Click "Buy USD" or "Buy COP"
   - Should redirect to Bold.co (with real credentials)
   - Webhook will update transaction status

## Important Files

- **[.env.example](.env.example)** - Copy this to `.env.local` and fill in your credentials
- **[README.md](README.md)** - Complete documentation
- **[docs/backend.json](docs/backend.json)** - Backend architecture reference
- **[src/lib/products.ts](src/lib/products.ts)** - Edit to add/modify products
- **[src/lib/placeholder-images.json](src/lib/placeholder-images.json)** - Product images

## Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Firebase Authentication Not Working
- Check that Email/Password provider is enabled in Firebase Console
- Verify all NEXT_PUBLIC_FIREBASE_* variables are set
- Clear browser cache and cookies

### Payment Links Not Creating
- Verify Bold.co API key is correct
- Check that product exists in products.ts
- Review server logs for API errors

## Support

If you encounter issues:
1. Check the [README.md](README.md) for detailed troubleshooting
2. Review the [docs/backend.json](docs/backend.json) for API structure
3. Check server logs in the terminal

## Features to Add (Optional)

- [ ] User dashboard to view purchase history
- [ ] Email notifications via SendGrid/Mailgun
- [ ] Admin panel for managing products
- [ ] Product search and filtering
- [ ] Shopping cart for multiple purchases
- [ ] Actual WhatsApp integration with Twilio
- [ ] Product delivery system (download links)
- [ ] Customer reviews and ratings

---

Enjoy building with EasyBots Store! 🚀
