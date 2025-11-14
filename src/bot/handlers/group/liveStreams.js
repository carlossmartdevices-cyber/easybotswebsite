/**
 * Live Streams handler for group chat
 * Shows active streams with join buttons
 */

const { getLiveStreamsMenu } = require('../../utils/menus');
const { t } = require('../../config/i18n');
const config = require('../../config/botConfig');

const handleLiveStreamsGroup = async (ctx) => {
  const language = ctx.session?.language || 'en';

  // Mock data - in production, fetch from database
  const activeStreams = [
    { id: 1, title: 'Tech Talk: AI & Machine Learning', viewers: 245 },
    { id: 2, title: 'Music Night: Live DJ Set', viewers: 532 },
    { id: 3, title: 'Gaming Session: Fortnite Tournament', viewers: 1203 }
  ];

  if (activeStreams.length === 0) {
    await ctx.reply(
      '🎥 **Live Streams**\n\n' +
      'No active streams at the moment.\n\n' +
      'Check back later or start your own stream!',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔴 Start Stream', url: `https://t.me/${config.botUsername}?start=start_stream` }]
          ]
        }
      }
    );
    return;
  }

  let streamText = t(language, 'activeStreams') + '\n\n';

  activeStreams.forEach((stream, index) => {
    streamText += `${index + 1}. **${stream.title}**\n`;
    streamText += `   👥 ${stream.viewers} viewers\n\n`;
  });

  await ctx.reply(streamText, {
    parse_mode: 'Markdown',
    reply_markup: getLiveStreamsMenu(activeStreams, config.botUsername)
  });
};

/**
 * Handle joining a stream
 */
const handleJoinStream = async (ctx) => {
  const streamId = ctx.callbackQuery.data.replace('join_stream_', '');

  // In production, generate actual stream link
  const streamLink = `https://pnptv.app/stream/${streamId}`;

  await ctx.answerCbQuery('Opening stream...', { url: streamLink });
};

module.exports = {
  handleLiveStreamsGroup,
  handleJoinStream
};
