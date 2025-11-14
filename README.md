# PNPtv Telegram Bot

A production-ready Telegram bot for PNPtv that intelligently routes commands between group chats and private chats.

## Key Features

- **Smart Command Routing**: Automatically routes commands to the appropriate chat type
- **Group/Private Chat Separation**: Different behaviors for group and private chats
- **Inline Menus**: Rich interactive buttons for seamless user experience
- **Multi-language Support**: English and Spanish (easily extensible)
- **Rate Limiting**: Built-in protection against spam
- **Session Management**: Persistent user preferences and state
- **Subscription Management**: PRIME subscription plans
- **Live Streaming**: Integration with live streams and broadcasts
- **Radio Player**: Group radio streaming with controls
- **Zoom Integration**: Manage and join Zoom rooms

## Important: /start Command Behavior

**The `/start` command does NOT work in group chats.**

When a user tries to use `/start` in a group:
1. The bot sends a notification in the group
2. A button is provided to redirect users to private chat
3. The actual welcome menu only appears in private chat

This ensures that group chats remain clean and focused, while private interactions are handled appropriately.

## Command Routing

### Private Chat Only Commands
These commands redirect to private chat when used in groups:
- `/start` - Welcome menu and bot introduction
- Subscribe to PRIME
- My Profile
- Nearby Users
- Support
- Settings

### Group Chat Commands
These commands work directly in groups:
- Live Streams - Show and join active streams
- Radio - Play radio with inline controls
- Zoom Rooms - List and join Zoom meetings

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd easybotswebsite
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your configuration:
```env
BOT_TOKEN=your_bot_token_from_botfather
BOT_USERNAME=your_bot_username
ADMIN_IDS=123456789,987654321
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

5. Start the bot:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
src/
├── bot/
│   ├── core/
│   │   ├── bot.js              # Main bot initialization
│   │   └── middleware/
│   │       ├── chatType.js     # Group/private chat detection
│   │       ├── rateLimit.js    # Rate limiting
│   │       └── session.js      # Session management
│   ├── handlers/
│   │   ├── group/              # Group chat handlers
│   │   │   ├── liveStreams.js
│   │   │   ├── radio.js
│   │   │   └── zoomRooms.js
│   │   └── private/            # Private chat handlers
│   │       ├── start.js        # /start command (DISABLED IN GROUPS)
│   │       ├── profile.js
│   │       ├── nearby.js
│   │       ├── subscribe.js
│   │       ├── support.js
│   │       └── settings.js
│   ├── utils/
│   │   ├── menus.js           # Inline keyboard menus
│   │   ├── notifications.js   # Group notifications
│   │   └── validation.js      # Input validation
│   └── config/
│       ├── botConfig.js       # Configuration
│       └── i18n.js            # Translations
└── index.js                   # Entry point
```

## Usage Examples

### For Users

#### Starting the Bot in Private Chat
1. Open a private chat with the bot
2. Send `/start`
3. Use the interactive menu to explore features

#### Starting the Bot from a Group
1. In a group chat, send `/start`
2. Click the "Start Bot in Private" button
3. The bot will open in private chat with the main menu

#### Using Group Features
- Send a message or use inline buttons to access:
  - Live Streams
  - Radio
  - Zoom Rooms

### For Developers

#### Adding a New Command

1. Create a handler in the appropriate directory (`handlers/group` or `handlers/private`)
2. Import and register it in `src/bot/core/bot.js`
3. Add translations in `src/bot/config/i18n.js`
4. Add menu items in `src/bot/utils/menus.js`

Example:
```javascript
// handlers/private/newfeature.js
const handleNewFeature = async (ctx) => {
  if (ctx.isGroupChat) {
    // Redirect to private
    // ... notification logic
    return;
  }

  // Handle in private chat
  await ctx.reply('New feature!');
};

module.exports = { handleNewFeature };
```

#### Adding a New Language

Edit `src/bot/config/i18n.js`:
```javascript
const translations = {
  en: { /* ... */ },
  es: { /* ... */ },
  fr: { // Add French
    welcome: 'Bienvenue à PNPtv!',
    // ... more translations
  }
};
```

## Configuration

### Rate Limiting
Default: 5 requests per minute per user

To modify, edit `src/bot/config/botConfig.js`:
```javascript
rateLimit: {
  maxRequests: 10,  // Change to allow 10 requests
  windowMs: 60000   // Per minute
}
```

### Private/Group Command Routing
Edit the command lists in `src/bot/config/botConfig.js`:
```javascript
privateOnlyCommands: [
  'start',
  'subscribe',
  // ... add more
],

groupOnlyCommands: [
  'live_streams',
  // ... add more
]
```

## Security Features

- **Input Sanitization**: All user inputs are sanitized to prevent XSS
- **Rate Limiting**: Prevents spam and abuse
- **Error Handling**: Graceful error handling without exposing internals
- **Session Isolation**: Each user has an isolated session
- **Admin Verification**: Admin-only commands check user ID

## Testing

```bash
npm test
```

For watch mode:
```bash
npm run test:watch
```

## Deployment

### Using Docker

```bash
docker build -t pnptv-bot .
docker run -d --env-file .env pnptv-bot
```

### Using PM2

```bash
npm install -g pm2
pm2 start src/index.js --name pnptv-bot
pm2 save
pm2 startup
```

## Troubleshooting

### Bot doesn't respond to /start in groups
**This is expected behavior!** The `/start` command is designed to NOT work in groups. It will show a button to redirect users to private chat.

### "BOT_TOKEN is not set" error
Make sure you've created a `.env` file with your bot token:
```env
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Rate limiting issues
If legitimate users are being rate-limited, increase the limits in `botConfig.js`

### Commands not working
1. Check bot permissions in the group
2. Ensure the bot is added as an administrator (for some features)
3. Check console logs for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please contact:
- Email: support@pnptv.app
- Telegram: @pnptv_support

## Acknowledgments

- Built with [Telegraf](https://telegraf.js.org/)
- Designed for PNPtv community
