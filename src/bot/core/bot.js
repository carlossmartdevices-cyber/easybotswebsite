/**
 * Main bot initialization and configuration
 */

const { Telegraf, session } = require('telegraf');
const config = require('../config/botConfig');
const { chatTypeMiddleware } = require('./middleware/chatType');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { sessionMiddleware } = require('./middleware/session');
const { adminMiddleware, adminRateLimitMiddleware } = require('./middleware/adminMiddleware');

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

// Admin handlers
const { handleAdminDashboard, handleAdminClose } = require('../handlers/admin/dashboard');
const {
  handleBroadcast,
  handleBroadcastText,
  handleBroadcastPhoto,
  handleBroadcastVideo,
  processBroadcastMessage,
  processBroadcastPhoto,
  processBroadcastVideo,
  handleBroadcastSendAll,
  handleBroadcastSendPremium,
  handleBroadcastSendFree
} = require('../handlers/admin/broadcast');
const {
  handleUserManagement,
  handleSearchUser,
  processUserSearch,
  handleActivateUser,
  handleDeactivateUser,
  handleExtendSubscription,
  processExtendSubscription,
  handleChangePlan,
  handleAssignPlan,
  handleUserStats,
  handleExportUsers
} = require('../handlers/admin/users');
const {
  handleAnalytics,
  handleUserGrowth,
  handleRevenue,
  handleEngagement,
  handlePlansOverview,
  handleExportAnalytics
} = require('../handlers/admin/analytics');
const {
  handlePlanManagement,
  handleViewAllPlans,
  handleManagePlan,
  handleAddPlan,
  processAddPlan,
  handleEditPlan,
  processEditPlan,
  handleActivatePlan,
  handleDeactivatePlan,
  handlePlanAnalytics,
  handleViewPlanAnalytics
} = require('../handlers/admin/plans');
const {
  handleLogs,
  handleAllLogs,
  handleBroadcastLogs,
  handleUserLogs,
  handlePlanLogs
} = require('../handlers/admin/logs');

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

  // /admin command - ADMIN ONLY (works in both private and group chats)
  bot.command('admin', adminMiddleware(), adminRateLimitMiddleware(), handleAdminDashboard);

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
  // ADMIN CALLBACK HANDLERS
  // ============================

  // Admin dashboard
  bot.action('admin_dashboard', adminMiddleware(), handleAdminDashboard);
  bot.action('admin_close', adminMiddleware(), handleAdminClose);

  // Broadcast callbacks
  bot.action('admin_broadcast', adminMiddleware(), handleBroadcast);
  bot.action('broadcast_text', adminMiddleware(), handleBroadcastText);
  bot.action('broadcast_photo', adminMiddleware(), handleBroadcastPhoto);
  bot.action('broadcast_video', adminMiddleware(), handleBroadcastVideo);
  bot.action(/^broadcast_send_all_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleBroadcastSendAll(ctx, ctx.match[1]);
  });
  bot.action(/^broadcast_send_premium_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleBroadcastSendPremium(ctx, ctx.match[1]);
  });
  bot.action(/^broadcast_send_free_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleBroadcastSendFree(ctx, ctx.match[1]);
  });

  // User management callbacks
  bot.action('admin_users', adminMiddleware(), handleUserManagement);
  bot.action('admin_search_user', adminMiddleware(), handleSearchUser);
  bot.action('admin_user_stats', adminMiddleware(), handleUserStats);
  bot.action('admin_export_users', adminMiddleware(), handleExportUsers);
  bot.action(/^admin_activate_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleActivateUser(ctx, ctx.match[1]);
  });
  bot.action(/^admin_deactivate_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleDeactivateUser(ctx, ctx.match[1]);
  });
  bot.action(/^admin_extend_sub_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleExtendSubscription(ctx, ctx.match[1]);
  });
  bot.action(/^admin_change_plan_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleChangePlan(ctx, ctx.match[1]);
  });
  bot.action(/^admin_assign_plan_(.+)_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleAssignPlan(ctx, ctx.match[1], ctx.match[2]);
  });

  // Analytics callbacks
  bot.action('admin_analytics', adminMiddleware(), handleAnalytics);
  bot.action('analytics_users', adminMiddleware(), handleUserGrowth);
  bot.action('analytics_revenue', adminMiddleware(), handleRevenue);
  bot.action('analytics_engagement', adminMiddleware(), handleEngagement);
  bot.action('analytics_plans', adminMiddleware(), handlePlansOverview);
  bot.action('analytics_export', adminMiddleware(), handleExportAnalytics);

  // Plan management callbacks
  bot.action('admin_plans', adminMiddleware(), handlePlanManagement);
  bot.action('plan_view_all', adminMiddleware(), handleViewAllPlans);
  bot.action('plan_add', adminMiddleware(), handleAddPlan);
  bot.action('plan_analytics', adminMiddleware(), handlePlanAnalytics);
  bot.action(/^plan_manage_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleManagePlan(ctx, ctx.match[1]);
  });
  bot.action(/^plan_edit_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleEditPlan(ctx, ctx.match[1]);
  });
  bot.action(/^plan_activate_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleActivatePlan(ctx, ctx.match[1]);
  });
  bot.action(/^plan_deactivate_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleDeactivatePlan(ctx, ctx.match[1]);
  });
  bot.action(/^plan_view_analytics_(.+)$/, adminMiddleware(), async (ctx) => {
    await handleViewPlanAnalytics(ctx, ctx.match[1]);
  });

  // Logs callbacks
  bot.action('admin_logs', adminMiddleware(), handleLogs);
  bot.action('logs_all', adminMiddleware(), handleAllLogs);
  bot.action('logs_broadcast', adminMiddleware(), handleBroadcastLogs);
  bot.action('logs_users', adminMiddleware(), handleUserLogs);
  bot.action('logs_plans', adminMiddleware(), handlePlanLogs);

  // ============================
  // MESSAGE HANDLERS
  // ============================

  // Handle photo uploads (for profile photo or admin broadcast)
  bot.on('photo', async (ctx) => {
    if (ctx.isPrivateChat && ctx.session.expectingPhoto) {
      await processPhotoUpload(ctx);
    } else if (ctx.session.adminAction === 'broadcast_photo') {
      await processBroadcastPhoto(ctx);
    }
  });

  // Handle location (for profile location)
  bot.on('location', async (ctx) => {
    if (ctx.isPrivateChat && ctx.session.expectingLocation) {
      await processLocation(ctx);
    }
  });

  // Handle video uploads (for admin broadcast)
  bot.on('video', async (ctx) => {
    if (ctx.session.adminAction === 'broadcast_video') {
      await processBroadcastVideo(ctx);
    }
  });

  // Handle text messages (for bio, support, admin actions, etc.)
  bot.on('text', async (ctx) => {
    // Handle admin actions first (works in both private and group chats)
    if (ctx.session.adminAction) {
      const action = ctx.session.adminAction;

      // Broadcast text message
      if (action.startsWith('broadcast_')) {
        await processBroadcastMessage(ctx);
        return;
      }

      // User search
      if (action === 'search_user') {
        await processUserSearch(ctx);
        return;
      }

      // Extend subscription
      if (action.startsWith('extend_subscription_')) {
        const userId = action.replace('extend_subscription_', '');
        const days = parseInt(ctx.message.text);
        if (!isNaN(days) && days > 0) {
          await processExtendSubscription(ctx, userId, days);
        } else {
          await ctx.reply('❌ Invalid number. Please enter a valid number of days.');
        }
        return;
      }

      // Plan creation steps
      if (action.startsWith('add_plan_')) {
        await processAddPlan(ctx);
        return;
      }

      // Plan editing
      if (action.startsWith('edit_plan_')) {
        const planId = action.replace('edit_plan_', '');
        await processEditPlan(ctx, planId);
        return;
      }
    }

    // Handle private chat specific actions
    if (ctx.isPrivateChat) {
      // Check if expecting specific input
      if (ctx.session.expectingBio) {
        await processBioText(ctx);
      } else if (ctx.session.expectingSupportQuestion || ctx.session.expectingSupportTicket) {
        await processSupportQuestion(ctx);
      } else if (!ctx.session.adminAction) {
        // Unknown command in private chat (only if not in admin flow)
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
