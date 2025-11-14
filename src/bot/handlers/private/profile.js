/**
 * Profile handler (private chat only)
 */

const { getProfileMenu } = require('../../utils/menus');
const { sendPrivateMessage } = require('../../utils/notifications');
const { validateBio, sanitizeInput } = require('../../utils/validation');
const { t } = require('../../config/i18n');

const handleProfile = async (ctx) => {
  const language = ctx.session?.language || 'en';

  // If called from group, redirect to private
  if (ctx.isGroupChat) {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    await ctx.reply(
      t(language, 'privateMessageSent', {
        username,
        command: 'My Profile'
      }),
      { reply_to_message_id: ctx.message.message_id }
    );

    // Send to private chat
    const profileText = getProfileText(ctx.session);
    await sendPrivateMessage(
      ctx,
      profileText,
      { reply_markup: getProfileMenu(language), parse_mode: 'Markdown' }
    );

    return;
  }

  // Show in private chat
  const profileText = getProfileText(ctx.session);

  await ctx.reply(profileText, {
    reply_markup: getProfileMenu(language),
    parse_mode: 'Markdown'
  });
};

/**
 * Get profile text
 */
const getProfileText = (session) => {
  const profile = session?.profile || {};

  return (
    '👤 **My Profile**\n\n' +
    `📸 Photo: ${profile.photo ? 'Set ✅' : 'Not set ❌'}\n` +
    `📝 Bio: ${profile.bio || 'Not set'}\n` +
    `📍 Location: ${profile.location ? 'Set ✅' : 'Not set ❌'}\n\n` +
    'Use the buttons below to edit your profile.'
  );
};

/**
 * Handle edit photo
 */
const handleEditPhoto = async (ctx) => {
  await ctx.editMessageText(
    '📸 **Edit Photo**\n\n' +
    'Please send me a photo to set as your profile picture.',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Profile', callback_data: 'show_profile' }]
        ]
      }
    }
  );

  await ctx.answerCbQuery();

  // Set state to expect photo
  ctx.session.expectingPhoto = true;
};

/**
 * Handle edit bio
 */
const handleEditBio = async (ctx) => {
  await ctx.editMessageText(
    '📝 **Edit Bio**\n\n' +
    'Please send me your new bio (max 500 characters).',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Profile', callback_data: 'show_profile' }]
        ]
      }
    }
  );

  await ctx.answerCbQuery();

  // Set state to expect bio
  ctx.session.expectingBio = true;
};

/**
 * Handle edit location
 */
const handleEditLocation = async (ctx) => {
  await ctx.editMessageText(
    '📍 **Edit Location**\n\n' +
    'Please send me your location using the Telegram location feature.',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Profile', callback_data: 'show_profile' }]
        ]
      }
    }
  );

  await ctx.answerCbQuery();

  // Set state to expect location
  ctx.session.expectingLocation = true;
};

/**
 * Process photo upload
 */
const processPhotoUpload = async (ctx) => {
  if (!ctx.session.expectingPhoto) return;

  const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Get highest quality
  ctx.session.profile.photo = photo.file_id;
  ctx.session.expectingPhoto = false;

  await ctx.reply('✅ Photo updated successfully!', {
    reply_markup: getProfileMenu(ctx.session?.language || 'en')
  });
};

/**
 * Process bio text
 */
const processBioText = async (ctx) => {
  if (!ctx.session.expectingBio) return;

  const bio = sanitizeInput(ctx.message.text);
  const validation = validateBio(bio);

  if (!validation.valid) {
    await ctx.reply(`❌ ${validation.error}\n\nPlease try again.`);
    return;
  }

  ctx.session.profile.bio = bio;
  ctx.session.expectingBio = false;

  await ctx.reply('✅ Bio updated successfully!', {
    reply_markup: getProfileMenu(ctx.session?.language || 'en')
  });
};

/**
 * Process location
 */
const processLocation = async (ctx) => {
  if (!ctx.session.expectingLocation) return;

  const location = ctx.message.location;
  ctx.session.profile.location = {
    latitude: location.latitude,
    longitude: location.longitude
  };
  ctx.session.expectingLocation = false;

  await ctx.reply('✅ Location updated successfully!', {
    reply_markup: getProfileMenu(ctx.session?.language || 'en')
  });
};

module.exports = {
  handleProfile,
  handleEditPhoto,
  handleEditBio,
  handleEditLocation,
  processPhotoUpload,
  processBioText,
  processLocation
};
