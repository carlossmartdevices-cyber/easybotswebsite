/**
 * Settings handler (private chat only)
 */

const { getSettingsMenu, getLanguageMenu } = require('../../utils/menus');
const { sendPrivateMessage } = require('../../utils/notifications');
const { t } = require('../../config/i18n');

const handleSettings = async (ctx) => {
  const language = ctx.session?.language || 'en';

  // If called from group, redirect to private
  if (ctx.isGroupChat) {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    await ctx.reply(
      t(language, 'privateMessageSent', {
        username,
        command: 'Settings'
      }),
      { reply_to_message_id: ctx.message.message_id }
    );

    // Send to private chat
    await sendPrivateMessage(
      ctx,
      getSettingsText(ctx.session),
      { reply_markup: getSettingsMenu(language), parse_mode: 'Markdown' }
    );

    return;
  }

  // Show in private chat
  await ctx.reply(getSettingsText(ctx.session), {
    reply_markup: getSettingsMenu(language),
    parse_mode: 'Markdown'
  });
};

/**
 * Get settings text
 */
const getSettingsText = (session) => {
  const language = session?.language || 'en';
  const notifications = session?.settings?.notifications ? 'Enabled ✅' : 'Disabled ❌';

  return (
    '⚙️ **Settings**\n\n' +
    `🌐 Language: ${language.toUpperCase()}\n` +
    `🔔 Notifications: ${notifications}\n\n` +
    'Use the buttons below to change your settings.'
  );
};

/**
 * Handle language selection screen
 */
const handleLanguageSelection = async (ctx) => {
  await ctx.editMessageText(
    '🌐 **Language Settings**\n\n' +
    'Choose your preferred language:',
    {
      parse_mode: 'Markdown',
      reply_markup: getLanguageMenu()
    }
  );

  await ctx.answerCbQuery();
};

/**
 * Handle language change
 */
const handleLanguageChange = async (ctx) => {
  const newLang = ctx.callbackQuery.data.replace('lang_', '');

  if (!['en', 'es'].includes(newLang)) {
    await ctx.answerCbQuery('Invalid language');
    return;
  }

  ctx.session.language = newLang;

  await ctx.editMessageText(
    getSettingsText(ctx.session),
    {
      parse_mode: 'Markdown',
      reply_markup: getSettingsMenu(newLang)
    }
  );

  await ctx.answerCbQuery('✅ Language updated!');
};

/**
 * Handle notification toggle
 */
const handleNotificationToggle = async (ctx) => {
  const currentState = ctx.session?.settings?.notifications ?? true;
  ctx.session.settings = ctx.session.settings || {};
  ctx.session.settings.notifications = !currentState;

  const language = ctx.session?.language || 'en';

  await ctx.editMessageText(
    getSettingsText(ctx.session),
    {
      parse_mode: 'Markdown',
      reply_markup: getSettingsMenu(language)
    }
  );

  const message = ctx.session.settings.notifications
    ? '✅ Notifications enabled!'
    : '🔕 Notifications disabled!';

  await ctx.answerCbQuery(message);
};

module.exports = {
  handleSettings,
  handleLanguageSelection,
  handleLanguageChange,
  handleNotificationToggle
};
