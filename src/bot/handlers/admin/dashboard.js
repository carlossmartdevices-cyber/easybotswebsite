/**
 * Admin Dashboard Handler
 * Main entry point for admin features
 */

const { db } = require('../../../config/firebase');
const { getAdminDashboardMenu } = require('../../utils/adminMenus');
const { logAdminAction } = require('../../utils/adminLogger');

/**
 * Handle /admin command
 * Shows main admin dashboard
 */
async function handleAdminDashboard(ctx) {
  try {
    const adminId = ctx.from.id;

    // Log admin dashboard access
    await logAdminAction({
      adminId,
      action: 'view_dashboard',
      target: 'admin_panel',
      metadata: {
        username: ctx.from.username,
        firstName: ctx.from.first_name
      }
    });

    // Get basic stats for dashboard
    let statsMessage = '';
    if (db) {
      try {
        const [usersSnapshot, plansSnapshot] = await Promise.all([
          db.collection('users').count().get(),
          db.collection('plans').count().get()
        ]);

        const totalUsers = usersSnapshot.data().count;
        const totalPlans = plansSnapshot.data().count;

        statsMessage = `\n📊 **Quick Stats:**\n` +
          `👥 Total Users: ${totalUsers}\n` +
          `💰 Active Plans: ${totalPlans}\n`;
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    }

    const message =
      `🛠 **Admin Dashboard**\n\n` +
      `Welcome, ${ctx.from.first_name}!\n` +
      `You have access to all administrative features.${statsMessage}\n\n` +
      `Select an action below:`;

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: getAdminDashboardMenu()
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: getAdminDashboardMenu()
      });
    }
  } catch (error) {
    console.error('Admin dashboard error:', error);
    await ctx.reply('❌ Error loading admin dashboard. Please try again.');
  }
}

/**
 * Handle admin close action
 */
async function handleAdminClose(ctx) {
  try {
    await ctx.deleteMessage();
    await ctx.answerCbQuery('Admin panel closed');
  } catch (error) {
    console.error('Error closing admin panel:', error);
    await ctx.answerCbQuery('Error closing panel');
  }
}

module.exports = {
  handleAdminDashboard,
  handleAdminClose
};
