require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  botUsername: process.env.BOT_USERNAME || 'pnptv_bot',
  adminIds: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => parseInt(id)) : [],
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Rate limiting settings
  rateLimit: {
    maxRequests: 5,
    windowMs: 60000 // 1 minute
  },

  // Command routing configuration
  privateOnlyCommands: [
    'start',
    'subscribe',
    'profile',
    'nearby',
    'support',
    'settings'
  ],

  groupOnlyCommands: [
    'live_streams',
    'radio',
    'zoom_rooms'
  ]
};
