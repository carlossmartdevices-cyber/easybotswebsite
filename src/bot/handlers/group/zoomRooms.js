/**
 * Zoom Rooms handler for group chat
 * Shows active zoom rooms with join buttons
 */

const { getZoomRoomsMenu } = require('../../utils/menus');
const config = require('../../config/botConfig');

const handleZoomRoomsGroup = async (ctx) => {
  const language = ctx.session?.language || 'en';

  // Mock data - in production, fetch from database
  const activeRooms = [
    { id: 1, title: 'Team Meeting - Marketing', participants: 12 },
    { id: 2, title: 'Community Hangout', participants: 35 },
    { id: 3, title: 'Weekly Q&A Session', participants: 67 }
  ];

  if (activeRooms.length === 0) {
    await ctx.reply(
      '🎥 **Zoom Rooms**\n\n' +
      'No active Zoom rooms at the moment.\n\n' +
      'Create a new room to get started!',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '➕ Create Room', url: `https://t.me/${config.botUsername}?start=create_zoom` }]
          ]
        }
      }
    );
    return;
  }

  let roomText = '🎥 **Active Zoom Rooms**\n\nJoin a room:\n\n';

  activeRooms.forEach((room, index) => {
    roomText += `${index + 1}. **${room.title}**\n`;
    roomText += `   👥 ${room.participants} participants\n\n`;
  });

  await ctx.reply(roomText, {
    parse_mode: 'Markdown',
    reply_markup: getZoomRoomsMenu(activeRooms, config.botUsername)
  });
};

/**
 * Handle joining a zoom room
 */
const handleJoinZoom = async (ctx) => {
  const roomId = ctx.callbackQuery.data.replace('join_zoom_', '');

  // In production, generate actual Zoom link
  const zoomLink = `https://zoom.us/j/pnptv${roomId}`;

  await ctx.answerCbQuery('Opening Zoom room...', { url: zoomLink });
};

module.exports = {
  handleZoomRoomsGroup,
  handleJoinZoom
};
