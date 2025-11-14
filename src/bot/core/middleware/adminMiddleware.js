/**
 * Admin access control middleware
 * Restricts access to admin commands to authorized users only
 */

const config = require('../../config/botConfig');

/**
 * Check if user is an admin
 * @param {number} userId - Telegram user ID
 * @returns {boolean} - True if user is admin
 */
function isAdmin(userId) {
  return config.adminIds.includes(userId);
}

/**
 * Admin middleware - blocks non-admin users
 */
const adminMiddleware = () => {
  return async (ctx, next) => {
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.reply('⚠️ Unable to verify user identity.');
      return;
    }

    if (!isAdmin(userId)) {
      await ctx.reply('⚠️ You are not authorized to use this command.\n\nThis command is restricted to administrators only.');
      return;
    }

    return next();
  };
};

/**
 * Admin rate limiting - 10 requests per minute for admin commands
 */
const adminRateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of adminRateLimitStore.entries()) {
    if (now - value.resetTime > 60000) { // 1 minute window
      adminRateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const adminRateLimitMiddleware = () => {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();

    const now = Date.now();
    const userKey = `admin:ratelimit:${userId}`;
    const userLimit = adminRateLimitStore.get(userKey);

    if (!userLimit) {
      adminRateLimitStore.set(userKey, {
        count: 1,
        resetTime: now
      });
      return next();
    }

    // Check if window has expired
    if (now - userLimit.resetTime > 60000) {
      adminRateLimitStore.set(userKey, {
        count: 1,
        resetTime: now
      });
      return next();
    }

    // Check if limit exceeded (10 requests per minute for admins)
    if (userLimit.count >= 10) {
      await ctx.reply('⚠️ Too many admin requests. Please wait a minute.');
      return;
    }

    // Increment counter
    userLimit.count++;
    adminRateLimitStore.set(userKey, userLimit);

    return next();
  };
};

module.exports = {
  adminMiddleware,
  adminRateLimitMiddleware,
  isAdmin
};
