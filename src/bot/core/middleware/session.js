/**
 * Session middleware
 * Initializes user session with default values
 */

const sessionMiddleware = () => {
  return async (ctx, next) => {
    // Initialize session if it doesn't exist
    if (!ctx.session) {
      ctx.session = {
        language: 'en',
        isPrime: false,
        profile: {
          photo: null,
          bio: null,
          location: null
        },
        settings: {
          notifications: true
        }
      };
    }

    return next();
  };
};

module.exports = { sessionMiddleware };
