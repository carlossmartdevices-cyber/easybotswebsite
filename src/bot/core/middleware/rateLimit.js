/**
 * Rate limiting middleware
 * Prevents spam by limiting commands per user
 */

const config = require('../../config/botConfig');
const { t } = require('../../config/i18n');

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map();

/**
 * Clean up old entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.resetTime > config.rateLimit.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const rateLimitMiddleware = () => {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();

    const now = Date.now();
    const userKey = `ratelimit:${userId}`;
    const userLimit = rateLimitStore.get(userKey);

    if (!userLimit) {
      // First request from user
      rateLimitStore.set(userKey, {
        count: 1,
        resetTime: now
      });
      return next();
    }

    // Check if window has expired
    if (now - userLimit.resetTime > config.rateLimit.windowMs) {
      // Reset the counter
      rateLimitStore.set(userKey, {
        count: 1,
        resetTime: now
      });
      return next();
    }

    // Check if limit exceeded
    if (userLimit.count >= config.rateLimit.maxRequests) {
      const language = ctx.session?.language || 'en';
      await ctx.reply(t(language, 'rateLimitExceeded'));
      return; // Don't call next()
    }

    // Increment counter
    userLimit.count++;
    rateLimitStore.set(userKey, userLimit);

    return next();
  };
};

module.exports = { rateLimitMiddleware };
