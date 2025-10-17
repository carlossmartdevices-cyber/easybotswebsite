# EasyBots Store - Digital AI Bots Marketplace

A fully functional e-commerce web application built with Next.js 15, featuring user authentication, Bold.co payment integration, and AI-powered payment notifications.

## Features

- **Product Catalog**: Browse and purchase digital AI bots
- **Multi-language Support**: English and Spanish interface
- **User Authentication**: Firebase Authentication with email/password
- **Secure Payments**: Integration with Bold.co payment gateway (USD and COP)
- **AI Notifications**: Genkit-powered WhatsApp notifications for successful payments
- **Responsive Design**: Dark theme with ShadCN UI components
- **Android Deep Links**: Support for mobile app payments via bold:// protocol

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React with ShadCN UI components
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Payments**: Bold.co Payment Gateway
- **AI**: Google Genkit with Gemini 1.5 Flash
- **Form Validation**: React Hook Form + Zod

## Project Structure

```
easybots-store/
├── app/
│   ├── api/
│   │   ├── create-payment-link/   # Payment link creation endpoint
│   │   └── webhooks/
│   │       └── bold/               # Bold.co webhook handler
│   ├── login/                      # Authentication page
│   ├── products/                   # All products table view
│   ├── terms/                      # Terms & Conditions
│   ├── privacy/                    # Privacy Policy
│   ├── refund/                     # Refund Policy
│   ├── layout.tsx                  # Root layout with AuthProvider
│   ├── page.tsx                    # Homepage
│   └── globals.css                 # Global styles (dark theme)
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   └── payment-notification.ts  # AI notification flow
│   │   ├── tools/
│   │   │   └── whatsapp.ts             # WhatsApp tool
│   │   └── genkit.ts                    # Genkit configuration
│   ├── components/
│   │   └── product-card.tsx             # Product card component
│   └── lib/
│       ├── auth-context.tsx             # Firebase auth context
│       ├── firebase.ts                  # Firebase client config
│       ├── firebase-admin.ts            # Firebase Admin SDK
│       ├── images.ts                    # Image placeholder loader
│       ├── placeholder-images.json      # Image URLs
│       ├── products.ts                  # Product data
│       ├── types.ts                     # TypeScript types
│       └── utils.ts                     # Utility functions
├── components/
│   └── ui/                         # ShadCN UI components
├── docs/
│   └── backend.json                # Backend documentation
└── .env.example                    # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Bold.co account with API credentials
- Google AI API key for Genkit

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd easybots-store
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Firebase Configuration (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Firebase Admin SDK (Server)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"

# Bold.co API
BOLD_API_KEY=your_bold_api_key
BOLD_WEBHOOK_SECRET=your_bold_webhook_secret

# Google Genkit
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# Admin Notifications
ADMIN_PHONE_NUMBER=+1234567890
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. Navigate to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Save changes

### 3. Create Firestore Database

1. Navigate to Firestore Database
2. Click "Create database"
3. Start in production mode (or test mode for development)
4. Choose a location
5. The database structure will be automatically created when transactions are saved

### 4. Get Firebase Credentials

**For Client (Web):**
1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Click on the Web icon (</>)
4. Register your app
5. Copy the configuration values to your `.env.local` file

**For Server (Admin SDK):**
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Copy the values to your `.env.local` file:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

## Bold.co Setup

1. Create a Bold.co account at [https://bold.co](https://bold.co)
2. Navigate to your dashboard
3. Go to API Keys section
4. Copy your API key to `BOLD_API_KEY` in `.env.local`
5. Generate a webhook secret and add it to `BOLD_WEBHOOK_SECRET`
6. Configure webhook URL in Bold.co dashboard:
   - URL: `https://your-domain.com/api/webhooks/bold`
   - Events: `transaction.created`, `transaction.updated`

## Google AI API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add it to `GOOGLE_GENAI_API_KEY` in `.env.local`

## Usage

### User Flow

1. **Browse Products**: Users see a grid of AI bots on the homepage
2. **Language Selection**: Toggle between English and Spanish
3. **Login/Signup**: Create an account or login via [/login](http://localhost:3000/login)
4. **Purchase**: Click "Buy USD" or "Buy COP" on any product
5. **Payment**: Complete payment through Bold.co
6. **Confirmation**: Receive email confirmation and product access

### Admin Flow

1. **Webhook Reception**: Bold.co sends payment events to `/api/webhooks/bold`
2. **Transaction Storage**: Webhook saves transaction to Firestore
3. **AI Notification**: On successful payment, Genkit flow triggers
4. **WhatsApp Notification**: Admin receives payment notification

## API Routes

### POST /api/create-payment-link

Creates a Bold.co payment link for a product purchase.

**Request Body:**
```json
{
  "productId": "bot-customer-service",
  "currency": "usd",
  "userId": "firebase-user-id",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "userPhone": "+1234567890"
}
```

**Response:**
```json
{
  "paymentLink": "https://checkout.bold.co/...",
  "orderId": "ORDER-1234567890-ABC123",
  "transactionId": "TXN-1234567890-XYZ789"
}
```

### POST /api/webhooks/bold

Receives Bold.co webhook events for payment status updates.

**Headers:**
- `x-bold-signature`: HMAC-SHA256 signature for verification

**Event Types:**
- `transaction.created`: New transaction initiated
- `transaction.updated`: Transaction status changed

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure the platform supports:
- Node.js 18+
- Environment variables
- API routes
- Webhook endpoints

## Security Considerations

- All API keys are server-side only (except NEXT_PUBLIC_* variables)
- Webhook signatures are verified using HMAC-SHA256
- Firebase Admin SDK credentials are kept secure
- Payment processing happens entirely on Bold.co (PCI compliant)
- User authentication is handled by Firebase

## Customization

### Adding New Products

Edit [src/lib/products.ts](src/lib/products.ts):

```typescript
{
  id: 'your-bot-id',
  name: 'Your Bot Name',
  name_es: 'Nombre del Bot',
  description: 'Bot description in English',
  description_es: 'Descripción del bot en español',
  prices: {
    usd: 9999, // $99.99 in cents
    cop: 39990000, // 399,900 COP in cents
  },
  image: 'your-image-key',
}
```

Add image URL to [src/lib/placeholder-images.json](src/lib/placeholder-images.json).

### Styling

The app uses a dark theme by default. To customize:
- Edit CSS variables in [app/globals.css](app/globals.css)
- Modify ShadCN components in [components/ui/](components/ui/)
- Update Tailwind config if needed

## Troubleshooting

### Firebase Authentication Issues
- Verify Firebase config in `.env.local`
- Check Firebase Console for authentication errors
- Ensure email/password provider is enabled

### Payment Link Creation Fails
- Verify Bold.co API key
- Check Bold.co dashboard for API errors
- Ensure correct request format

### Webhook Not Receiving Events
- Verify webhook URL in Bold.co dashboard
- Check webhook secret matches
- Ensure endpoint is publicly accessible
- Review server logs for signature verification errors

### AI Notifications Not Sending
- Verify Google AI API key
- Check Genkit configuration
- Review server logs for flow execution errors

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Email: support@easybots.store
- Create an issue in the repository

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using Next.js, Firebase, and Bold.co
#   e a s y b o t s  
 #   e a s y b o t s w e b s i t e  
 