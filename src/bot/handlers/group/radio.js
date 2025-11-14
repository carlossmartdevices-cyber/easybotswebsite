/**
 * Radio handler for group chat
 * Plays radio with inline controls
 */

const { getRadioMenu } = require('../../utils/menus');
const { t } = require('../../config/i18n');

const handleRadioGroup = async (ctx) => {
  const language = ctx.session?.language || 'en';

  // Mock current song data - in production, fetch from radio API
  const nowPlaying = {
    song: 'Midnight Dreams',
    artist: 'The Synthwave Collective'
  };

  const radioText = t(language, 'radioNowPlaying', {
    song: nowPlaying.song,
    artist: nowPlaying.artist
  });

  // In production, send actual audio stream
  // For now, just send a message with controls
  await ctx.reply(radioText, {
    parse_mode: 'Markdown',
    reply_markup: getRadioMenu()
  });

  // Alternative: Send audio file
  // await ctx.replyWithAudio(
  //   { url: 'https://pnptv.app/radio/stream.mp3' },
  //   {
  //     caption: radioText,
  //     reply_markup: getRadioMenu(),
  //     parse_mode: 'Markdown'
  //   }
  // );
};

/**
 * Handle radio toggle (play/pause)
 */
const handleRadioToggle = async (ctx) => {
  // In production, implement actual play/pause logic
  await ctx.answerCbQuery('⏸️ Radio paused');

  // Update the message to show paused state
  await ctx.editMessageReplyMarkup({
    inline_keyboard: [
      [{ text: '▶️ Play', callback_data: 'radio_toggle' }],
      [{ text: '🎶 Request Song', callback_data: 'radio_request' }],
      [{ text: '📊 View Schedule', url: 'https://pnptv.app/radio-schedule' }]
    ]
  });
};

/**
 * Handle song request
 */
const handleRadioRequest = async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
    '🎶 **Song Request**\n\n' +
    'To request a song, please send the song name and artist in this format:\n\n' +
    '`/request Song Name - Artist Name`\n\n' +
    'Example: `/request Bohemian Rhapsody - Queen`',
    { parse_mode: 'Markdown' }
  );
};

/**
 * Handle /request command
 */
const handleRequestCommand = async (ctx) => {
  const requestText = ctx.message.text.replace('/request', '').trim();

  if (!requestText) {
    await ctx.reply(
      '❌ Please specify the song name and artist.\n\n' +
      'Example: `/request Bohemian Rhapsody - Queen`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // In production, add to request queue
  await ctx.reply(
    `✅ Song request received!\n\n` +
    `🎵 ${requestText}\n\n` +
    `Your request has been added to the queue.`,
    { parse_mode: 'Markdown' }
  );
};

module.exports = {
  handleRadioGroup,
  handleRadioToggle,
  handleRadioRequest,
  handleRequestCommand
};
