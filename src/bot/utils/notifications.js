/**
 * Notification utilities for group chat
 */

const { t } = require('../config/i18n');
const config = require('../config/botConfig');

/**
 * Send a notification in group when redirecting to private chat
 * @param {Object} ctx - Telegraf context
 * @param {string} commandName - Name of the command being redirected
 */
const notifyGroupRedirect = async (ctx, commandName) => {
  const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  const language = ctx.session?.language || 'en';

  try {
    await ctx.reply(
      t(language, 'privateMessageSent', {
        username,
        command: commandName
      }),
      { reply_to_message_id: ctx.message.message_id }
    );
  } catch (error) {
    console.error('Error sending group notification:', error);
  }
};

/**
 * Send private message to user
 * @param {Object} ctx - Telegraf context
 * @param {string} message - Message text
 * @param {Object} extra - Extra options (like reply_markup)
 * @returns {boolean} - Success status
 */
const sendPrivateMessage = async (ctx, message, extra = {}) => {
  try {
    await ctx.telegram.sendMessage(ctx.from.id, message, extra);
    return true;
  } catch (error) {
    // User blocked the bot or hasn't started a conversation
    if (error.response?.error_code === 403) {
      const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
      const language = ctx.session?.language || 'en';

      await ctx.reply(
        t(language, 'cannotSendPrivate', {
          username,
          botUsername: config.botUsername
        }),
        { reply_to_message_id: ctx.message?.message_id }
      );
      return false;
    }

    console.error('Error sending private message:', error);
    return false;
  }
};

/**
 * Handle command routing between group and private chat
 * @param {Object} ctx - Telegraf context
 * @param {string} commandName - Command name
 * @param {Function} privateHandler - Handler function for private chat
 */
const routeCommand = async (ctx, commandName, privateHandler) => {
  if (ctx.isGroupChat) {
    // Notify in group
    await notifyGroupRedirect(ctx, commandName);

    // Send to private chat
    await sendPrivateMessage(ctx, '', { reply_markup: {} });

    // Execute private handler as if it was in private chat
    // Create a modified context for the private handler
    const privateCtx = { ...ctx, isGroupChat: false, isPrivateChat: true };
    await privateHandler(privateCtx, true); // true indicates "send via telegram API"
  } else {
    // Execute in private chat normally
    await privateHandler(ctx, false);
  }
};

module.exports = {
  notifyGroupRedirect,
  sendPrivateMessage,
  routeCommand
};
