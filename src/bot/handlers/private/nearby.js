/**
 * Nearby users handler (private chat only)
 */

const { sendPrivateMessage } = require('../../utils/notifications');
const { t } = require('../../config/i18n');

const handleNearby = async (ctx) => {
  const language = ctx.session?.language || 'en';

  // If called from group, redirect to private
  if (ctx.isGroupChat) {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    await ctx.reply(
      t(language, 'privateMessageSent', {
        username,
        command: 'Nearby Users'
      }),
      { reply_to_message_id: ctx.message.message_id }
    );

    // Send to private chat
    await sendPrivateMessage(
      ctx,
      getNearbyUsersText(ctx.session),
      { reply_markup: getNearbyMenu(), parse_mode: 'Markdown' }
    );

    return;
  }

  // Show in private chat
  await ctx.reply(getNearbyUsersText(ctx.session), {
    reply_markup: getNearbyMenu(),
    parse_mode: 'Markdown'
  });
};

/**
 * Get nearby users text
 */
const getNearbyUsersText = (session) => {
  const hasLocation = session?.profile?.location;

  if (!hasLocation) {
    return (
      '🌍 **Nearby Users**\n\n' +
      '📍 Please set your location first to see nearby users.\n\n' +
      'Go to My Profile → Edit Location to set your location.'
    );
  }

  // In production, fetch real nearby users from database
  const nearbyUsers = [
    { username: 'user1', distance: '0.5 km', isPrime: true },
    { username: 'user2', distance: '1.2 km', isPrime: false },
    { username: 'user3', distance: '2.8 km', isPrime: true }
  ];

  let text = '🌍 **Nearby Users**\n\n';

  nearbyUsers.forEach((user, index) => {
    const badge = user.isPrime ? '💎' : '';
    text += `${index + 1}. @${user.username} ${badge} - ${user.distance}\n`;
  });

  text += '\n👆 Tap on a username to view their profile.';

  return text;
};

/**
 * Get nearby menu
 */
const getNearbyMenu = () => {
  return {
    inline_keyboard: [
      [{ text: '🔄 Refresh', callback_data: 'show_nearby' }],
      [{ text: '📍 Update Location', callback_data: 'edit_location' }],
      [{ text: '🔙 Back to Main', callback_data: 'back_to_main' }]
    ]
  };
};

module.exports = {
  handleNearby
};
