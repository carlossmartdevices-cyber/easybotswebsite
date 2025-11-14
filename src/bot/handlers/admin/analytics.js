/**
 * Analytics Dashboard Handler
 * View user growth, revenue, and engagement metrics
 */

const { db } = require('../../../config/firebase');
const { getAnalyticsMenu, getAdminDashboardMenu } = require('../../utils/adminMenus');
const { logAdminAction } = require('../../utils/adminLogger');

/**
 * Show analytics menu
 */
async function handleAnalytics(ctx) {
  try {
    const message =
      `📊 **Analytics Dashboard**\n\n` +
      `View detailed analytics and insights.\n\n` +
      `Select a metric:`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getAnalyticsMenu()
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Analytics menu error:', error);
    await ctx.answerCbQuery('Error loading analytics');
  }
}

/**
 * Handle user growth analytics
 */
async function handleUserGrowth(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('📈 Loading user growth data...');

    const now = new Date();
    const periods = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      last7Days: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      last30Days: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      last90Days: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    };

    const [todayUsers, last7DaysUsers, last30DaysUsers, last90DaysUsers, totalUsers] = await Promise.all([
      db.collection('users').where('createdAt', '>=', periods.today).count().get(),
      db.collection('users').where('createdAt', '>=', periods.last7Days).count().get(),
      db.collection('users').where('createdAt', '>=', periods.last30Days).count().get(),
      db.collection('users').where('createdAt', '>=', periods.last90Days).count().get(),
      db.collection('users').count().get()
    ]);

    // Calculate daily averages
    const avgPerDay7 = (last7DaysUsers.data().count / 7).toFixed(1);
    const avgPerDay30 = (last30DaysUsers.data().count / 30).toFixed(1);

    const message =
      `📈 **User Growth Analytics**\n\n` +
      `**Total Users:** ${totalUsers.data().count}\n\n` +
      `**New Users:**\n` +
      `📅 Today: ${todayUsers.data().count}\n` +
      `📅 Last 7 days: ${last7DaysUsers.data().count} (avg ${avgPerDay7}/day)\n` +
      `📅 Last 30 days: ${last30DaysUsers.data().count} (avg ${avgPerDay30}/day)\n` +
      `📅 Last 90 days: ${last90DaysUsers.data().count}\n\n` +
      `**Growth Rate:**\n` +
      `• Weekly: ${avgPerDay7} users/day\n` +
      `• Monthly: ${avgPerDay30} users/day`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getAnalyticsMenu()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'view_analytics',
      target: 'user_growth',
      metadata: {}
    });
  } catch (error) {
    console.error('User growth analytics error:', error);
    await ctx.answerCbQuery('❌ Error loading user growth data');
  }
}

/**
 * Handle revenue analytics
 */
async function handleRevenue(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('💰 Loading revenue data...');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get active premium users
    const premiumUsers = await db.collection('users')
      .where('plan', 'in', ['premium', 'gold'])
      .where('status', '==', 'active')
      .get();

    // Calculate revenue based on active subscriptions
    let monthlyRevenue = 0;
    let planBreakdown = {
      premium: { count: 0, revenue: 0 },
      gold: { count: 0, revenue: 0 }
    };

    // Get plan prices
    const plansSnapshot = await db.collection('plans').get();
    const planPrices = {};
    plansSnapshot.forEach(doc => {
      const plan = doc.data();
      planPrices[plan.name.toLowerCase()] = plan.price || 0;
    });

    premiumUsers.forEach(doc => {
      const user = doc.data();
      const plan = user.plan.toLowerCase();
      const price = planPrices[plan] || 0;

      monthlyRevenue += price;
      if (planBreakdown[plan]) {
        planBreakdown[plan].count++;
        planBreakdown[plan].revenue += price;
      }
    });

    // Get new subscriptions this month
    const newSubsThisMonth = await db.collection('users')
      .where('plan', 'in', ['premium', 'gold'])
      .where('createdAt', '>=', startOfMonth)
      .count()
      .get();

    const message =
      `💰 **Revenue Analytics**\n\n` +
      `**Monthly Recurring Revenue (MRR):**\n` +
      `💵 $${monthlyRevenue.toFixed(2)}\n\n` +
      `**Active Subscriptions:**\n` +
      `👑 Premium: ${planBreakdown.premium.count} ($${planBreakdown.premium.revenue.toFixed(2)})\n` +
      `💎 Gold: ${planBreakdown.gold.count} ($${planBreakdown.gold.revenue.toFixed(2)})\n\n` +
      `**This Month:**\n` +
      `📈 New Subscriptions: ${newSubsThisMonth.data().count}\n` +
      `💵 New Revenue: $${(newSubsThisMonth.data().count * (planPrices.premium || 0)).toFixed(2)} (est.)\n\n` +
      `**Annual Run Rate (ARR):**\n` +
      `💰 $${(monthlyRevenue * 12).toFixed(2)}`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getAnalyticsMenu()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'view_analytics',
      target: 'revenue',
      metadata: {
        mrr: monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    await ctx.answerCbQuery('❌ Error loading revenue data');
  }
}

/**
 * Handle engagement analytics
 */
async function handleEngagement(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('💬 Loading engagement data...');

    const now = new Date();
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get active users (users who interacted recently)
    const [activeToday, activeLast7Days, totalUsers] = await Promise.all([
      db.collection('users').where('lastActive', '>=', last24Hours).count().get(),
      db.collection('users').where('lastActive', '>=', last7Days).count().get(),
      db.collection('users').count().get()
    ]);

    // Get broadcast stats
    const broadcastsLast7Days = await db.collection('broadcasts')
      .where('sentAt', '>=', last7Days)
      .get();

    let broadcastsSent = 0;
    let broadcastsFailed = 0;
    broadcastsLast7Days.forEach(doc => {
      const broadcast = doc.data();
      if (broadcast.status === 'sent') broadcastsSent++;
      if (broadcast.status === 'failed') broadcastsFailed++;
    });

    const deliveryRate = broadcastsSent + broadcastsFailed > 0
      ? ((broadcastsSent / (broadcastsSent + broadcastsFailed)) * 100).toFixed(1)
      : 0;

    // Calculate engagement rates
    const totalUsersCount = totalUsers.data().count;
    const dailyActiveRate = totalUsersCount > 0
      ? ((activeToday.data().count / totalUsersCount) * 100).toFixed(1)
      : 0;
    const weeklyActiveRate = totalUsersCount > 0
      ? ((activeLast7Days.data().count / totalUsersCount) * 100).toFixed(1)
      : 0;

    const message =
      `💬 **Engagement Analytics**\n\n` +
      `**Active Users:**\n` +
      `📅 Last 24h: ${activeToday.data().count} (${dailyActiveRate}% of total)\n` +
      `📅 Last 7 days: ${activeLast7Days.data().count} (${weeklyActiveRate}% of total)\n\n` +
      `**Broadcasts (Last 7 days):**\n` +
      `✅ Delivered: ${broadcastsSent}\n` +
      `❌ Failed: ${broadcastsFailed}\n` +
      `📊 Delivery Rate: ${deliveryRate}%\n\n` +
      `**Engagement Metrics:**\n` +
      `📈 DAU Rate: ${dailyActiveRate}%\n` +
      `📈 WAU Rate: ${weeklyActiveRate}%`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getAnalyticsMenu()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'view_analytics',
      target: 'engagement',
      metadata: {}
    });
  } catch (error) {
    console.error('Engagement analytics error:', error);
    await ctx.answerCbQuery('❌ Error loading engagement data');
  }
}

/**
 * Handle plans overview analytics
 */
async function handlePlansOverview(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('📊 Loading plans data...');

    // Get all users grouped by plan
    const usersSnapshot = await db.collection('users').get();

    const planStats = {
      basic: 0,
      premium: 0,
      gold: 0
    };

    usersSnapshot.forEach(doc => {
      const user = doc.data();
      const plan = (user.plan || 'basic').toLowerCase();
      if (planStats.hasOwnProperty(plan)) {
        planStats[plan]++;
      }
    });

    const total = Object.values(planStats).reduce((sum, count) => sum + count, 0);

    const message =
      `📊 **Plans Overview**\n\n` +
      `**Distribution:**\n` +
      `🆓 Basic: ${planStats.basic} (${total > 0 ? ((planStats.basic / total) * 100).toFixed(1) : 0}%)\n` +
      `👑 Premium: ${planStats.premium} (${total > 0 ? ((planStats.premium / total) * 100).toFixed(1) : 0}%)\n` +
      `💎 Gold: ${planStats.gold} (${total > 0 ? ((planStats.gold / total) * 100).toFixed(1) : 0}%)\n\n` +
      `**Total Users:** ${total}\n` +
      `**Conversion Rate:** ${total > 0 ? (((planStats.premium + planStats.gold) / total) * 100).toFixed(1) : 0}%`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getAnalyticsMenu()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'view_analytics',
      target: 'plans_overview',
      metadata: planStats
    });
  } catch (error) {
    console.error('Plans overview analytics error:', error);
    await ctx.answerCbQuery('❌ Error loading plans data');
  }
}

/**
 * Export analytics data
 */
async function handleExportAnalytics(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('📤 Preparing analytics export...');

    const now = new Date();
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get users from last 30 days
    const usersSnapshot = await db.collection('users')
      .where('createdAt', '>=', last30Days)
      .get();

    // Prepare CSV
    let csvContent = 'Date,New Users,Plan\n';

    const usersByDate = {};
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      const date = user.createdAt?.toDate?.() || new Date();
      const dateStr = date.toISOString().split('T')[0];

      if (!usersByDate[dateStr]) {
        usersByDate[dateStr] = { basic: 0, premium: 0, gold: 0 };
      }

      const plan = (user.plan || 'basic').toLowerCase();
      if (usersByDate[dateStr].hasOwnProperty(plan)) {
        usersByDate[dateStr][plan]++;
      }
    });

    // Generate CSV rows
    for (const [date, plans] of Object.entries(usersByDate).sort()) {
      csvContent += `${date},${plans.basic + plans.premium + plans.gold},"Basic: ${plans.basic}, Premium: ${plans.premium}, Gold: ${plans.gold}"\n`;
    }

    // Send as file
    await ctx.replyWithDocument({
      source: Buffer.from(csvContent),
      filename: `analytics_${new Date().toISOString().split('T')[0]}.csv`
    }, {
      caption: `📊 Analytics Export (Last 30 days)`
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'export_analytics',
      target: 'last_30_days',
      metadata: {}
    });
  } catch (error) {
    console.error('Export analytics error:', error);
    await ctx.reply('❌ Error exporting analytics. Please try again.');
  }
}

module.exports = {
  handleAnalytics,
  handleUserGrowth,
  handleRevenue,
  handleEngagement,
  handlePlansOverview,
  handleExportAnalytics
};
