/**
 * Main bot initialization and configuration
 */

const { Telegraf, session } = require('telegraf');
const config = require('../config/botConfig');
const { chatTypeMiddleware } = require('./middleware/chatType');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { sessionMiddleware } = require('./middleware/session');

// Import handlers
const { handleStart } = require('../handlers/private/start');
const { handleSubscription, handlePlanSelection, handlePaymentHelp } = require('../handlers/private/subscribe');
const { handleProfile, handleEditPhoto, handleEditBio, handleEditLocation, processPhotoUpload, processBioText, processLocation } = require('../handlers/private/profile');
const { handleNearby } = require('../handlers/private/nearby');
const { handleSupport, handleAISupport, handleHumanSupport, processSupportQuestion } = require('../handlers/private/support');
const { handleSettings, handleLanguageSelection, handleLanguageChange, handleNotificationToggle } = require('../handlers/private/settings');

const { handleLiveStreamsGroup, handleJoinStream } = require('../handlers/group/liveStreams');
const { handleRadioGroup, handleRadioToggle, handleRadioRequest, handleRequestCommand } = require('../handlers/group/radio');
const { handleZoomRoomsGroup, handleJoinZoom } = require('../handlers/group/zoomRooms');

const { getMainMenu } = require('../utils/menus');
const { t } = require('../config/i18n');

/**
 * Create and configure bot instance
 */
function createBot() {
  if (!config.botToken) {
    throw new Error('BOT_TOKEN is not defined in environment variables');
  }

  const bot = new Telegraf(config.botToken);

  // Apply middleware
  bot.use(session());
  bot.use(sessionMiddleware());
  bot.use(chatTypeMiddleware());
  bot.use(rateLimitMiddleware());

  // Error handling middleware
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    const language = ctx.session?.language || 'en';

    ctx.reply(
      '❌ An error occurred. Please try again later or contact support.',
      { parse_mode: 'Markdown' }
    ).catch(console.error);
  });

  // ============================
  // COMMAND HANDLERS
  // ============================

  // /start command - DOES NOT WORK IN GROUPS (redirects to private)
  bot.command('start', handleStart);

  // /request command for radio (group only)
  bot.command('request', handleRequestCommand);

  // ============================
  // CALLBACK QUERY HANDLERS
  // ============================

  // Main menu callbacks
  bot.action('back_to_main', async (ctx) => {
    const language = ctx.session?.language || 'en';
    await ctx.editMessageText(t(language, 'welcome'), {
      parse_mode: 'Markdown',
      reply_markup: getMainMenu(language)
    });
    await ctx.answerCbQuery();
  });

  // Subscription callbacks
  bot.action('show_subscription_plans', async (ctx) => {
    await handleSubscription(ctx);
    await ctx.answerCbQuery();
  });

  bot.action(/^plan_(basic|premium|gold)$/, handlePlanSelection);
  bot.action('payment_help', handlePaymentHelp);

  // Profile callbacks
  bot.action('show_profile', async (ctx) => {
    await handleProfile(ctx);
    await ctx.answerCbQuery();
  });

  bot.action('edit_photo', handleEditPhoto);
  bot.action('edit_bio', handleEditBio);
  bot.action('edit_location', handleEditLocation);

  // Nearby callbacks
  bot.action('show_nearby', async (ctx) => {
    await handleNearby(ctx);
    await ctx.answerCbQuery();
  });

  // Support callbacks
  bot.action('show_support', async (ctx) => {
    await handleSupport(ctx);
    await ctx.answerCbQuery();
  });

  bot.action('support_ai', handleAISupport);
  bot.action('support_human', handleHumanSupport);
  bot.action(/^support_helpful_(yes|no)$/, async (ctx) => {
    const helpful = ctx.callbackQuery.data.includes('yes');
    await ctx.answerCbQuery(helpful ? 'Glad I could help!' : 'Sorry, let me connect you to human support.');

    if (!helpful) {
      await handleHumanSupport(ctx);
    }
  });

  // Settings callbacks
  bot.action('show_settings', async (ctx) => {
    await handleSettings(ctx);
    await ctx.answerCbQuery();
  });

  bot.action('settings_language', handleLanguageSelection);
  bot.action(/^lang_(en|es)$/, handleLanguageChange);
  bot.action('settings_notifications', handleNotificationToggle);

  // Live Streams callbacks
  bot.action('show_live_streams', async (ctx) => {
    if (ctx.isGroupChat) {
      await handleLiveStreamsGroup(ctx);
    } else {
      const { handleLiveStreamsPrivate } = require('../handlers/private/liveStreams');
      await handleLiveStreamsPrivate(ctx);
    }
    await ctx.answerCbQuery();
  });

  bot.action(/^join_stream_\d+$/, handleJoinStream);

  // Radio callbacks
  bot.action('show_radio', async (ctx) => {
    if (ctx.isGroupChat) {
      await handleRadioGroup(ctx);
    } else {
      // For private chat, redirect to group or show controls
      await ctx.reply(
        '📻 **Radio**\n\n' +
        'Radio is best experienced in group chats!\n\n' +
        'Join a PNPtv group to listen to live radio.',
        { parse_mode: 'Markdown' }
      );
    }
    await ctx.answerCbQuery();
  });

  bot.action('radio_toggle', handleRadioToggle);
  bot.action('radio_request', handleRadioRequest);

  // Zoom Rooms callbacks
  bot.action('show_zoom_rooms', async (ctx) => {
    if (ctx.isGroupChat) {
      await handleZoomRoomsGroup(ctx);
    } else {
      const { handleZoomRoomsPrivate } = require('../handlers/private/zoomRooms');
      await handleZoomRoomsPrivate(ctx);
    }
    await ctx.answerCbQuery();
  });

  bot.action(/^join_zoom_\d+$/, handleJoinZoom);

  // ============================
  // MESSAGE HANDLERS
  // ============================

  // Handle photo uploads (for profile photo)
  bot.on('photo', async (ctx) => {
    if (ctx.isPrivateChat && ctx.session.expectingPhoto) {
      await processPhotoUpload(ctx);
    }
  });

  // Handle location (for profile location)
  bot.on('location', async (ctx) => {
    if (ctx.isPrivateChat && ctx.session.expectingLocation) {
      await processLocation(ctx);
    }
  });

  // Handle text messages (for bio, support, etc.)
  bot.on('text', async (ctx) => {
    if (ctx.isPrivateChat) {
      // Check if expecting specific input
      if (ctx.session.expectingBio) {
        await processBioText(ctx);
      } else if (ctx.session.expectingSupportQuestion || ctx.session.expectingSupportTicket) {
        await processSupportQuestion(ctx);
      } else {
        // Unknown command in private chat
        const language = ctx.session?.language || 'en';
        await ctx.reply(t(language, 'commandNotFound'), {
          reply_markup: getMainMenu(language)
        });
      }
    }
  });

  return bot;
}

module.exports = { createBot };
