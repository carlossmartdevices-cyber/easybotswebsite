/**
 * PNPtv Telegram Bot
 * Main entry point
 */

const { createBot } = require('./bot/core/bot');
const config = require('./bot/config/botConfig');

// Validate configuration
if (!config.botToken) {
  console.error('❌ Error: BOT_TOKEN is not set in environment variables');
  console.error('Please create a .env file based on .env.example');
  process.exit(1);
}

// Create bot instance
const bot = createBot();

// Start bot
console.log('🤖 Starting PNPtv Telegram Bot...');
console.log(`📝 Bot Username: @${config.botUsername}`);
console.log(`🌍 Environment: ${config.nodeEnv}`);

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('\n🛑 Stopping bot (SIGINT)...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Stopping bot (SIGTERM)...');
  bot.stop('SIGTERM');
});

// Launch bot
bot.launch()
  .then(() => {
    console.log('✅ Bot started successfully!');
    console.log('🎯 Ready to receive messages...');
    console.log('\n⚠️  Important: /start command will NOT work in groups');
    console.log('   It will redirect users to private chat instead.\n');
  })
  .catch((error) => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  });

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});
