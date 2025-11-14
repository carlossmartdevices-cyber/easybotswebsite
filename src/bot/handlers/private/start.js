/**
 * /start command handler
 * This command does NOT work in groups - it redirects to private chat
 */

const { getMainMenu, getStartPrivateButton } = require('../../utils/menus');
const { sendPrivateMessage } = require('../../utils/notifications');
const { t } = require('../../config/i18n');
const config = require('../../config/botConfig');

const handleStart = async (ctx) => {
  const language = ctx.session?.language || 'en';

  // IMPORTANT: /start command does NOT work in groups
  // It redirects users to private chat instead
  if (ctx.isGroupChat) {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    // Send notification in group with button to start private chat
    await ctx.reply(
      t(language, 'startInGroup'),
      {
        reply_to_message_id: ctx.message.message_id,
        reply_markup: getStartPrivateButton(config.botUsername)
      }
    );

    return;
  }

  // Handle deep link parameters (e.g., /start subscribe_prime)
  const startParam = ctx.message?.text?.split(' ')[1];

  if (startParam) {
    // Handle deep link routing
    switch (startParam) {
      case 'subscribe_prime':
        // Import and call subscription handler
        const { handleSubscription } = require('./subscribe');
        return handleSubscription(ctx);

      case 'live_streams':
        // Import and call live streams handler
        const { handleLiveStreamsPrivate } = require('./liveStreams');
        return handleLiveStreamsPrivate(ctx);

      case 'zoom_rooms':
        // Import and call zoom rooms handler
        const { handleZoomRoomsPrivate } = require('./zoomRooms');
        return handleZoomRoomsPrivate(ctx);

      default:
        // Show main menu for unknown parameters
        break;
    }
  }

  // Get user data for personalized welcome message
  const isPrime = ctx.session?.isPrime || false;
  const userName = ctx.from.first_name || ctx.from.username || 'Friend';

  // Determine badge, tier, and access level based on premium status
  const badge = isPrime ? '💎' : '🆓';
  const tier = isPrime ? 'Premium Member' : 'Free Member';
  const accessLevel = isPrime ? 'full' : 'free';

  // Show welcome message and main menu in private chat
  await ctx.reply(
    t(language, 'welcome', {
      name: userName,
      badge: badge,
      tier: tier,
      accessLevel: accessLevel
    }),
    {
      reply_markup: getMainMenu(language)
    }
  );
};

module.exports = { handleStart };
