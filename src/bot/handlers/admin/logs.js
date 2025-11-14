/**
 * Admin Logs Handler
 * View and filter admin action logs
 */

const { getAdminLogs, formatLog } = require('../../utils/adminLogger');
const { getLogsMenu, getAdminDashboardMenu } = require('../../utils/adminMenus');

/**
 * Show logs menu
 */
async function handleLogs(ctx) {
  try {
    const message =
      `📋 **Admin Logs**\n\n` +
      `View recent admin actions and activity.\n\n` +
      `Select a log type:`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getLogsMenu()
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Logs menu error:', error);
    await ctx.answerCbQuery('Error loading logs menu');
  }
}

/**
 * Display logs
 */
async function displayLogs(ctx, filter = {}) {
  try {
    const logs = await getAdminLogs(filter);

    if (logs.length === 0) {
      await ctx.editMessageText(
        `📋 **No Logs Found**\n\n` +
        `There are no logs matching your criteria.`,
        {
          parse_mode: 'Markdown',
          reply_markup: getLogsMenu()
        }
      );
      return;
    }

    let message = `📋 **Admin Activity Logs**\n\n`;
    message += `Showing last ${logs.length} entries:\n\n`;

    // Display last 10 logs
    logs.slice(0, 10).forEach((log, index) => {
      const timestamp = log.timestamp?.toDate?.() || new Date(log.timestamp);
      const date = timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const statusEmoji = log.status === 'success' ? '✅' : log.status === 'failed' ? '❌' : '⚠️';

      message += `${statusEmoji} ${date}\n`;
      message += `   Action: ${log.action}\n`;
      message += `   Target: ${log.target}\n`;
      if (log.error) {
        message += `   Error: ${log.error}\n`;
      }
      message += `\n`;
    });

    if (logs.length > 10) {
      message += `\n_... and ${logs.length - 10} more entries_`;
    }

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getLogsMenu()
    });
  } catch (error) {
    console.error('Display logs error:', error);
    await ctx.reply('❌ Error loading logs. Please try again.');
  }
}

/**
 * Handle all logs
 */
async function handleAllLogs(ctx) {
  await ctx.answerCbQuery('📋 Loading all logs...');
  await displayLogs(ctx, { limit: 50 });
}

/**
 * Handle broadcast logs
 */
async function handleBroadcastLogs(ctx) {
  await ctx.answerCbQuery('📢 Loading broadcast logs...');
  await displayLogs(ctx, { action: 'broadcast', limit: 50 });
}

/**
 * Handle user management logs
 */
async function handleUserLogs(ctx) {
  await ctx.answerCbQuery('👥 Loading user management logs...');
  await displayLogs(ctx, { action: 'search_user', limit: 50 });
}

/**
 * Handle plan logs
 */
async function handlePlanLogs(ctx) {
  await ctx.answerCbQuery('💰 Loading plan logs...');
  await displayLogs(ctx, { action: 'add_plan', limit: 50 });
}

module.exports = {
  handleLogs,
  handleAllLogs,
  handleBroadcastLogs,
  handleUserLogs,
  handlePlanLogs
};
