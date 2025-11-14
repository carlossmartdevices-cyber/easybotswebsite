/**
 * Live Streams handler for private chat
 */

const handleLiveStreamsPrivate = async (ctx) => {
  const language = ctx.session?.language || 'en';

  await ctx.reply(
    '🎥 **Your Live Streams**\n\n' +
    'View and manage your live streams here.\n\n' +
    'This feature shows your personal streams and subscribed channels.',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔴 Start New Stream', callback_data: 'start_stream' }],
          [{ text: '📺 My Streams', callback_data: 'my_streams' }],
          [{ text: '⭐ Subscribed Channels', callback_data: 'subscribed_streams' }],
          [{ text: '🔙 Back to Main', callback_data: 'back_to_main' }]
        ]
      }
    }
  );
};

module.exports = {
  handleLiveStreamsPrivate
};
