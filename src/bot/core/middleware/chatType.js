/**
 * Chat type detection middleware
 * Determines if a message is from a group or private chat
 */

const isGroupChat = (ctx) => {
  return ['group', 'supergroup'].includes(ctx.chat?.type);
};

const isPrivateChat = (ctx) => {
  return ctx.chat?.type === 'private';
};

const isSupergroup = (ctx) => {
  return ctx.chat?.type === 'supergroup';
};

/**
 * Middleware to attach chat type helpers to context
 */
const chatTypeMiddleware = () => {
  return async (ctx, next) => {
    ctx.isGroupChat = isGroupChat(ctx);
    ctx.isPrivateChat = isPrivateChat(ctx);
    ctx.isSupergroup = isSupergroup(ctx);

    return next();
  };
};

module.exports = {
  isGroupChat,
  isPrivateChat,
  isSupergroup,
  chatTypeMiddleware
};
