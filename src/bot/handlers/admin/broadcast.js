/**
 * Broadcast Messages Handler
 * Allows admins to send messages to all users or specific groups
 */

const { db } = require('../../../config/firebase');
const { getBroadcastMenu, getBroadcastConfirmMenu, getAdminDashboardMenu } = require('../../utils/adminMenus');
const { logAdminAction } = require('../../utils/adminLogger');

/**
 * Show broadcast menu
 */
async function handleBroadcast(ctx) {
  try {
    const message =
      `📢 **Broadcast Messages**\n\n` +
      `Send messages to all users or specific groups.\n\n` +
      `⚠️ **Important:**\n` +
      `- Messages will be sent to all matching users\n` +
      `- Cannot be undone once sent\n` +
      `- You'll see a preview before sending\n\n` +
      `Select message type:`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getBroadcastMenu()
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Broadcast menu error:', error);
    await ctx.answerCbQuery('Error loading broadcast menu');
  }
}

/**
 * Handle text broadcast initiation
 */
async function handleBroadcastText(ctx) {
  try {
    ctx.session.adminAction = 'broadcast_text';
    ctx.session.broadcastData = {};

    await ctx.editMessageText(
      `📝 **Text Broadcast**\n\n` +
      `Enter the message you want to broadcast:\n\n` +
      `Tip: You can use Markdown formatting.`,
      { parse_mode: 'Markdown' }
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Text broadcast error:', error);
    await ctx.answerCbQuery('Error starting text broadcast');
  }
}

/**
 * Handle photo broadcast initiation
 */
async function handleBroadcastPhoto(ctx) {
  try {
    ctx.session.adminAction = 'broadcast_photo';
    ctx.session.broadcastData = {};

    await ctx.editMessageText(
      `📷 **Photo Broadcast**\n\n` +
      `Send me the photo you want to broadcast.\n\n` +
      `After sending the photo, you can add a caption.`,
      { parse_mode: 'Markdown' }
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Photo broadcast error:', error);
    await ctx.answerCbQuery('Error starting photo broadcast');
  }
}

/**
 * Handle video broadcast initiation
 */
async function handleBroadcastVideo(ctx) {
  try {
    ctx.session.adminAction = 'broadcast_video';
    ctx.session.broadcastData = {};

    await ctx.editMessageText(
      `🎥 **Video Broadcast**\n\n` +
      `Send me the video you want to broadcast.\n\n` +
      `After sending the video, you can add a caption.`,
      { parse_mode: 'Markdown' }
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Video broadcast error:', error);
    await ctx.answerCbQuery('Error starting video broadcast');
  }
}

/**
 * Process broadcast text message
 */
async function processBroadcastMessage(ctx) {
  try {
    if (ctx.session.adminAction?.startsWith('broadcast_')) {
      const message = ctx.message.text;
      ctx.session.broadcastData.message = message;

      const previewMessage =
        `📝 **Broadcast Preview**\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `${message}\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `Select target audience:`;

      await ctx.reply(previewMessage, {
        parse_mode: 'Markdown',
        reply_markup: getBroadcastConfirmMenu('text')
      });
    }
  } catch (error) {
    console.error('Process broadcast message error:', error);
    await ctx.reply('❌ Error processing broadcast message. Please try again.');
  }
}

/**
 * Process broadcast photo
 */
async function processBroadcastPhoto(ctx) {
  try {
    if (ctx.session.adminAction === 'broadcast_photo') {
      const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Get highest resolution
      ctx.session.broadcastData.fileId = photo.file_id;
      ctx.session.broadcastData.caption = ctx.message.caption || '';

      await ctx.reply(
        `📷 Photo received!\n\n` +
        (ctx.message.caption ? `Caption: ${ctx.message.caption}\n\n` : '') +
        `Select target audience:`,
        {
          parse_mode: 'Markdown',
          reply_markup: getBroadcastConfirmMenu('photo')
        }
      );
    }
  } catch (error) {
    console.error('Process broadcast photo error:', error);
    await ctx.reply('❌ Error processing photo. Please try again.');
  }
}

/**
 * Process broadcast video
 */
async function processBroadcastVideo(ctx) {
  try {
    if (ctx.session.adminAction === 'broadcast_video') {
      const video = ctx.message.video;
      ctx.session.broadcastData.fileId = video.file_id;
      ctx.session.broadcastData.caption = ctx.message.caption || '';

      await ctx.reply(
        `🎥 Video received!\n\n` +
        (ctx.message.caption ? `Caption: ${ctx.message.caption}\n\n` : '') +
        `Select target audience:`,
        {
          parse_mode: 'Markdown',
          reply_markup: getBroadcastConfirmMenu('video')
        }
      );
    }
  } catch (error) {
    console.error('Process broadcast video error:', error);
    await ctx.reply('❌ Error processing video. Please try again.');
  }
}

/**
 * Send broadcast to users
 */
async function sendBroadcast(ctx, targetGroup) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    const adminId = ctx.from.id;
    const broadcastData = ctx.session.broadcastData;
    const broadcastType = ctx.session.adminAction.replace('broadcast_', '');

    await ctx.answerCbQuery('⏳ Starting broadcast...');
    await ctx.editMessageText('📢 Broadcasting... Please wait.');

    // Build query based on target group
    let query = db.collection('users');

    if (targetGroup === 'premium') {
      query = query.where('plan', 'in', ['premium', 'gold']);
    } else if (targetGroup === 'free') {
      query = query.where('plan', '==', 'basic').where('status', '==', 'active');
    }

    // Get users
    const usersSnapshot = await query.get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send broadcast to each user
    for (const user of users) {
      try {
        const userId = parseInt(user.id);

        if (broadcastType === 'text') {
          await ctx.telegram.sendMessage(userId, broadcastData.message, {
            parse_mode: 'Markdown'
          });
        } else if (broadcastType === 'photo') {
          await ctx.telegram.sendPhoto(userId, broadcastData.fileId, {
            caption: broadcastData.caption,
            parse_mode: 'Markdown'
          });
        } else if (broadcastType === 'video') {
          await ctx.telegram.sendVideo(userId, broadcastData.fileId, {
            caption: broadcastData.caption,
            parse_mode: 'Markdown'
          });
        }

        sent++;

        // Log to Firestore
        if (db) {
          await db.collection('broadcasts').add({
            adminId,
            userId,
            type: broadcastType,
            targetGroup,
            message: broadcastData.message || broadcastData.caption,
            fileId: broadcastData.fileId || null,
            status: 'sent',
            sentAt: new Date()
          });
        }
      } catch (error) {
        failed++;
        errors.push({ userId: user.id, error: error.message });

        // Log failed broadcast
        if (db) {
          await db.collection('broadcasts').add({
            adminId,
            userId: user.id,
            type: broadcastType,
            targetGroup,
            message: broadcastData.message || broadcastData.caption,
            status: 'failed',
            error: error.message,
            sentAt: new Date()
          });
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Log admin action
    await logAdminAction({
      adminId,
      action: 'broadcast',
      target: targetGroup,
      metadata: {
        type: broadcastType,
        totalUsers: users.length,
        sent,
        failed
      },
      status: failed === 0 ? 'success' : failed === users.length ? 'failed' : 'partial'
    });

    // Send results
    const resultMessage =
      `✅ **Broadcast Complete**\n\n` +
      `📊 Results:\n` +
      `✅ Sent: ${sent}\n` +
      `❌ Failed: ${failed}\n` +
      `📈 Total: ${users.length}\n\n` +
      (failed > 0 ? `⚠️ Some messages failed to send. Check logs for details.` : '');

    await ctx.editMessageText(resultMessage, {
      parse_mode: 'Markdown',
      reply_markup: getAdminDashboardMenu()
    });

    // Clear session data
    delete ctx.session.adminAction;
    delete ctx.session.broadcastData;
  } catch (error) {
    console.error('Send broadcast error:', error);
    await ctx.editMessageText(
      `❌ **Broadcast Failed**\n\n` +
      `Error: ${error.message}\n\n` +
      `Please try again or contact support.`,
      {
        parse_mode: 'Markdown',
        reply_markup: getAdminDashboardMenu()
      }
    );
  }
}

/**
 * Handle broadcast send to all users
 */
async function handleBroadcastSendAll(ctx, type) {
  await sendBroadcast(ctx, 'all');
}

/**
 * Handle broadcast send to premium users
 */
async function handleBroadcastSendPremium(ctx, type) {
  await sendBroadcast(ctx, 'premium');
}

/**
 * Handle broadcast send to free users
 */
async function handleBroadcastSendFree(ctx, type) {
  await sendBroadcast(ctx, 'free');
}

module.exports = {
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
};
