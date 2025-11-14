const translations = {
  en: {
    welcome: `🎉 Welcome, {name}…

{badge} {tier}

You now have {accessLevel} access to the PNPtv! community —
the cult begins here. 🔥

💎 Did you know? Premium members unlock the real fun:
• 📸 Send & receive spicy photos + videos
• 🎥 Host private video rooms
• 📺 Full access to the PNPtv! PRIME channel (Santino, Lex & the boys)

📋 Start your journey:
• 📜 Read the law of the cult: /rules
• 🧭 Open your command center: /menu
• 🤖 Need help, daddy? /help

🔥 Enjoy yourself. Explore. Connect.
This is where the magic (and the chaos) happens.`,
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
    welcome: `🎉 Bienvenido, {name}…

{badge} {tier}

Ahora tienes acceso {accessLevel} a la comunidad PNPtv! —
aquí empieza el culto. 🔥

💎 ¿Sabías que los miembros Premium desbloquean lo realmente rico?
• 📸 Enviar y recibir fotos + videos calientes
• 🎥 Crear salas privadas de videollamada
• 📺 Acceder al canal premium PNPtv! PRIME (Santino, Lex y los chicos)

📋 Empieza tu viaje:
• 📜 Lee las reglas sagradas: /rules
• 🧭 Abre tu centro de comandos: /menu
• 🤖 ¿Necesitas ayuda, bebé? /help

🔥 Disfruta. Explora. Conecta.
Aquí es donde empieza la magia… y el caos.`,
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
