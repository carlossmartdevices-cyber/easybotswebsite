/**
 * Menu templates for inline keyboards
 */

const config = require('../config/botConfig');

/**
 * Main menu for private chat
 */
const getMainMenu = (language = 'en') => {
  return {
    inline_keyboard: [
      [{ text: '💎 Subscribe to PRIME', callback_data: 'show_subscription_plans' }],
      [{ text: '👤 My Profile', callback_data: 'show_profile' }],
      [{ text: '🌍 Nearby Users', callback_data: 'show_nearby' }],
      [{ text: '🎤 Live Streams', callback_data: 'show_live_streams' }],
      [{ text: '📻 Radio', callback_data: 'show_radio' }],
      [{ text: '🎥 Zoom Rooms', callback_data: 'show_zoom_rooms' }],
      [{ text: '🤖 Support', callback_data: 'show_support' }],
      [{ text: '⚙️ Settings', callback_data: 'show_settings' }]
    ]
  };
};

/**
 * Subscription plans menu
 */
const getSubscriptionMenu = (language = 'en') => {
  return {
    inline_keyboard: [
      [{ text: '🆕 Basic ($9.99/month)', callback_data: 'plan_basic' }],
      [{ text: '🌟 Premium ($19.99/month)', callback_data: 'plan_premium' }],
      [{ text: '🏆 Gold ($49.99/month)', callback_data: 'plan_gold' }],
      [{ text: '💳 Payment Help', callback_data: 'payment_help' }],
      [{ text: '🔙 Back', callback_data: 'back_to_main' }]
    ]
  };
};

/**
 * Profile menu
 */
const getProfileMenu = (language = 'en') => {
  return {
    inline_keyboard: [
      [{ text: '📸 Edit Photo', callback_data: 'edit_photo' }],
      [{ text: '📝 Edit Bio', callback_data: 'edit_bio' }],
      [{ text: '📍 Edit Location', callback_data: 'edit_location' }],
      [{ text: '🔙 Back', callback_data: 'back_to_main' }]
    ]
  };
};

/**
 * Settings menu
 */
const getSettingsMenu = (language = 'en') => {
  return {
    inline_keyboard: [
      [{ text: '🌐 Language', callback_data: 'settings_language' }],
      [{ text: '🔔 Notifications', callback_data: 'settings_notifications' }],
      [{ text: '🔙 Back', callback_data: 'back_to_main' }]
    ]
  };
};

/**
 * Language selection menu
 */
const getLanguageMenu = () => {
  return {
    inline_keyboard: [
      [{ text: '🇺🇸 English', callback_data: 'lang_en' }],
      [{ text: '🇪🇸 Español', callback_data: 'lang_es' }],
      [{ text: '🔙 Back', callback_data: 'show_settings' }]
    ]
  };
};

/**
 * Live streams menu for group chat
 */
const getLiveStreamsMenu = (streams = [], botUsername) => {
  const buttons = streams.map(stream => [
    { text: `🎬 ${stream.title}`, callback_data: `join_stream_${stream.id}` }
  ]);

  buttons.push([
    { text: '🔍 View All Streams', url: `https://t.me/${botUsername}?start=live_streams` }
  ]);

  return { inline_keyboard: buttons };
};

/**
 * Radio control menu
 */
const getRadioMenu = () => {
  return {
    inline_keyboard: [
      [{ text: '🎵 Play/Pause', callback_data: 'radio_toggle' }],
      [{ text: '🎶 Request Song', callback_data: 'radio_request' }],
      [{ text: '📊 View Schedule', url: 'https://pnptv.app/radio-schedule' }]
    ]
  };
};

/**
 * Zoom rooms menu for group chat
 */
const getZoomRoomsMenu = (rooms = [], botUsername) => {
  const buttons = rooms.map(room => [
    { text: `🎥 ${room.title}`, callback_data: `join_zoom_${room.id}` }
  ]);

  buttons.push([
    { text: '🔍 View All Rooms', url: `https://t.me/${botUsername}?start=zoom_rooms` }
  ]);

  return { inline_keyboard: buttons };
};

/**
 * Start in group button (redirects to private chat)
 */
const getStartPrivateButton = (botUsername) => {
  return {
    inline_keyboard: [
      [{ text: '🤖 Start Bot in Private', url: `https://t.me/${botUsername}?start=main` }]
    ]
  };
};

module.exports = {
  getMainMenu,
  getSubscriptionMenu,
  getProfileMenu,
  getSettingsMenu,
  getLanguageMenu,
  getLiveStreamsMenu,
  getRadioMenu,
  getZoomRoomsMenu,
  getStartPrivateButton
};
