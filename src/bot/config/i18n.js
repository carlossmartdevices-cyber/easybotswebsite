const translations = {
  en: {
    welcome: 'Welcome to PNPtv!',
    mainMenuIntro: '💎 Welcome to PNPtv! on Telegram!\n\nUse the menu below to explore, connect, and enjoy everything PNPtv has to offer:\n\n- Update your profile and share your location.\n\n- Choose a membership to access the best PNP amateur content.\n\n- Connect with members near you.\n\n- Get support whenever you need it.',
    privateMessageSent: '@{username}, I sent you a private message about {command}!',
    cannotSendPrivate: '@{username}, I couldn\'t send you a private message. Please unblock me or start a chat with @{botUsername}!',
    commandNotFound: 'Command not found. Here\'s the main menu:',
    rateLimitExceeded: '⚠️ Too many requests. Please wait a minute!',
    subscriptionPlans: '💎 **PNPtv PRIME Subscriptions**\n\nChoose a plan:',
    activeStreams: '🎥 **Active Live Streams**\n\nJoin a stream:',
    radioNowPlaying: '📻 **PNPtv Radio**\n\nNow Playing: {song} - {artist}\n\n🎵 /radio_play\n🎶 /radio_request',
    startInGroup: 'To use this bot, please start a private chat with me by clicking the button below:',
  },
  es: {
    welcome: '¡Bienvenido a PNPtv!',
    mainMenuIntro: '💎 ¡Bienvenido a PNPtv! en Telegram!\n\nUsa el menú a continuación para explorar, conectarte y disfrutar todo lo que ofrece PNPtv:\n\n- Actualiza tu perfil y comparte tu ubicación.\n\n- Elige un plan de suscripción para acceder al mejor contenido amateur de PNP.\n\n- Conéctate con miembros cerca de ti.\n\n- Obtén soporte cuando lo necesites.',
    privateMessageSent: '@{username}, te envié un mensaje privado sobre {command}!',
    cannotSendPrivate: '@{username}, no pude enviarte un mensaje privado. ¡Por favor desbloquéame o inicia un chat con @{botUsername}!',
    commandNotFound: 'Comando no encontrado. Aquí está el menú principal:',
    rateLimitExceeded: '⚠️ Demasiadas solicitudes. ¡Por favor espera un minuto!',
    subscriptionPlans: '💎 **Suscripciones PNPtv PRIME**\n\nElige un plan:',
    activeStreams: '🎥 **Transmisiones en Vivo Activas**\n\nÚnete a una transmisión:',
    radioNowPlaying: '📻 **Radio PNPtv**\n\nSonando ahora: {song} - {artist}\n\n🎵 /radio_play\n🎶 /radio_request',
    startInGroup: 'Para usar este bot, por favor inicia un chat privado conmigo haciendo clic en el botón de abajo:',
  }
};

function t(language, key, params = {}) {
  const lang = translations[language] || translations.en;
  let text = lang[key] || translations.en[key] || key;

  // Replace placeholders
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });

  return text;
}

module.exports = { translations, t };
