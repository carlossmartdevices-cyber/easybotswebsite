/**
 * Zoom Rooms handler for private chat
 */

const handleZoomRoomsPrivate = async (ctx) => {
  const language = ctx.session?.language || 'en';

  await ctx.reply(
    '🎥 **Your Zoom Rooms**\n\n' +
    'View and manage your Zoom rooms here.\n\n' +
    'This feature shows your personal rooms and scheduled meetings.',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create New Room', callback_data: 'create_zoom' }],
          [{ text: '📋 My Rooms', callback_data: 'my_zoom_rooms' }],
          [{ text: '📅 Scheduled Meetings', callback_data: 'scheduled_zoom' }],
          [{ text: '🔙 Back to Main', callback_data: 'back_to_main' }]
        ]
      }
    }
  );
};

module.exports = {
  handleZoomRoomsPrivate
};
