/**
 * User Management Handler
 * Search, edit, and manage users
 */

const { db } = require('../../../config/firebase');
const { getUserManagementMenu, getUserActionsMenu, getAdminDashboardMenu } = require('../../utils/adminMenus');
const { logAdminAction } = require('../../utils/adminLogger');

/**
 * Show user management menu
 */
async function handleUserManagement(ctx) {
  try {
    const message =
      `👥 **User Management**\n\n` +
      `Search and manage user accounts.\n\n` +
      `Select an action:`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getUserManagementMenu()
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('User management menu error:', error);
    await ctx.answerCbQuery('Error loading user management');
  }
}

/**
 * Handle search user action
 */
async function handleSearchUser(ctx) {
  try {
    ctx.session.adminAction = 'search_user';

    await ctx.editMessageText(
      `🔍 **Search User**\n\n` +
      `Enter one of the following to search:\n` +
      `• User ID (Telegram ID)\n` +
      `• Username (without @)\n` +
      `• First name or last name\n\n` +
      `Example: 12345678 or john_doe`,
      { parse_mode: 'Markdown' }
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Search user error:', error);
    await ctx.answerCbQuery('Error starting user search');
  }
}

/**
 * Process user search
 */
async function processUserSearch(ctx) {
  try {
    if (!db) {
      await ctx.reply('❌ Database not available');
      return;
    }

    const searchQuery = ctx.message.text.trim();
    const adminId = ctx.from.id;

    // Search for user
    let users = [];

    // Try searching by ID first
    if (!isNaN(searchQuery)) {
      const userDoc = await db.collection('users').doc(searchQuery).get();
      if (userDoc.exists) {
        users.push({ id: userDoc.id, ...userDoc.data() });
      }
    }

    // If not found by ID, search by username
    if (users.length === 0) {
      const usernameQuery = await db.collection('users')
        .where('username', '==', searchQuery)
        .limit(5)
        .get();

      usernameQuery.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
    }

    // If still not found, search by name
    if (users.length === 0) {
      const nameQuery = await db.collection('users')
        .where('firstName', '==', searchQuery)
        .limit(5)
        .get();

      nameQuery.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
    }

    if (users.length === 0) {
      await ctx.reply(
        `❌ **No users found**\n\n` +
        `Search query: "${searchQuery}"\n\n` +
        `Try searching with:\n` +
        `• User ID\n` +
        `• Username (without @)\n` +
        `• First name`,
        {
          parse_mode: 'Markdown',
          reply_markup: getUserManagementMenu()
        }
      );
      delete ctx.session.adminAction;
      return;
    }

    // Display results
    for (const user of users) {
      await displayUser(ctx, user);
    }

    // Log search
    await logAdminAction({
      adminId,
      action: 'search_user',
      target: searchQuery,
      metadata: {
        resultsFound: users.length
      }
    });

    delete ctx.session.adminAction;
  } catch (error) {
    console.error('Process user search error:', error);
    await ctx.reply('❌ Error searching for user. Please try again.');
  }
}

/**
 * Display user information
 */
async function displayUser(ctx, user) {
  try {
    const joinDate = user.createdAt?.toDate?.() || new Date(user.createdAt || Date.now());
    const subscriptionEnd = user.subscriptionEnd?.toDate?.() || null;

    const message =
      `👤 **User Profile**\n\n` +
      `**ID:** \`${user.id}\`\n` +
      `**Name:** ${user.firstName || 'N/A'} ${user.lastName || ''}\n` +
      `**Username:** ${user.username ? '@' + user.username : 'N/A'}\n` +
      `**Plan:** ${user.plan || 'basic'}\n` +
      `**Status:** ${user.status || 'active'}\n` +
      `**Joined:** ${joinDate.toLocaleDateString()}\n` +
      (subscriptionEnd ? `**Subscription Ends:** ${subscriptionEnd.toLocaleDateString()}\n` : '') +
      (user.bio ? `\n**Bio:** ${user.bio}\n` : '') +
      (user.location ? `**Location:** ${user.location.city || 'N/A'}\n` : '');

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: getUserActionsMenu(user.id)
    });
  } catch (error) {
    console.error('Display user error:', error);
  }
}

/**
 * Handle user activation
 */
async function handleActivateUser(ctx, userId) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await db.collection('users').doc(userId).update({
      status: 'active',
      updatedAt: new Date()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'activate_user',
      target: userId,
      metadata: {}
    });

    await ctx.answerCbQuery('✅ User activated');

    // Refresh user display
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      await displayUser(ctx, { id: userDoc.id, ...userDoc.data() });
    }
  } catch (error) {
    console.error('Activate user error:', error);
    await ctx.answerCbQuery('❌ Error activating user');
  }
}

/**
 * Handle user deactivation
 */
async function handleDeactivateUser(ctx, userId) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await db.collection('users').doc(userId).update({
      status: 'inactive',
      updatedAt: new Date()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'deactivate_user',
      target: userId,
      metadata: {}
    });

    await ctx.answerCbQuery('✅ User deactivated');

    // Refresh user display
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      await displayUser(ctx, { id: userDoc.id, ...userDoc.data() });
    }
  } catch (error) {
    console.error('Deactivate user error:', error);
    await ctx.answerCbQuery('❌ Error deactivating user');
  }
}

/**
 * Handle extend subscription
 */
async function handleExtendSubscription(ctx, userId) {
  try {
    ctx.session.adminAction = `extend_subscription_${userId}`;

    await ctx.editMessageText(
      `🔄 **Extend Subscription**\n\n` +
      `User ID: \`${userId}\`\n\n` +
      `Enter the number of days to extend:\n` +
      `Example: 30 (for 30 days)`,
      { parse_mode: 'Markdown' }
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Extend subscription error:', error);
    await ctx.answerCbQuery('❌ Error starting subscription extension');
  }
}

/**
 * Process subscription extension
 */
async function processExtendSubscription(ctx, userId, days) {
  try {
    if (!db) {
      await ctx.reply('❌ Database not available');
      return;
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      await ctx.reply('❌ User not found');
      return;
    }

    const user = userDoc.data();
    const currentEnd = user.subscriptionEnd?.toDate?.() || new Date();
    const newEnd = new Date(currentEnd.getTime() + (days * 24 * 60 * 60 * 1000));

    await db.collection('users').doc(userId).update({
      subscriptionEnd: newEnd,
      updatedAt: new Date()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'extend_subscription',
      target: userId,
      metadata: {
        daysExtended: days,
        newEndDate: newEnd
      }
    });

    await ctx.reply(
      `✅ **Subscription Extended**\n\n` +
      `User ID: \`${userId}\`\n` +
      `Extended by: ${days} days\n` +
      `New end date: ${newEnd.toLocaleDateString()}`,
      {
        parse_mode: 'Markdown',
        reply_markup: getAdminDashboardMenu()
      }
    );

    delete ctx.session.adminAction;
  } catch (error) {
    console.error('Process extend subscription error:', error);
    await ctx.reply('❌ Error extending subscription. Please try again.');
  }
}

/**
 * Handle change plan
 */
async function handleChangePlan(ctx, userId) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    // Get available plans
    const plansSnapshot = await db.collection('plans')
      .where('status', '==', 'active')
      .get();

    const plans = [];
    plansSnapshot.forEach(doc => {
      plans.push({ id: doc.id, ...doc.data() });
    });

    if (plans.length === 0) {
      await ctx.answerCbQuery('❌ No active plans available');
      return;
    }

    ctx.session.adminAction = `change_plan_${userId}`;

    // Build inline keyboard with plans
    const keyboard = plans.map(plan => ([{
      text: `${plan.name} - $${plan.price}/mo`,
      callback_data: `admin_assign_plan_${userId}_${plan.id}`
    }]));

    keyboard.push([{ text: '🔙 Cancel', callback_data: 'admin_users' }]);

    await ctx.editMessageText(
      `💰 **Change Plan**\n\n` +
      `User ID: \`${userId}\`\n\n` +
      `Select a new plan:`,
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      }
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Change plan error:', error);
    await ctx.answerCbQuery('❌ Error loading plans');
  }
}

/**
 * Handle assign plan to user
 */
async function handleAssignPlan(ctx, userId, planId) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    const planDoc = await db.collection('plans').doc(planId).get();
    if (!planDoc.exists) {
      await ctx.answerCbQuery('❌ Plan not found');
      return;
    }

    const plan = planDoc.data();

    await db.collection('users').doc(userId).update({
      plan: plan.name.toLowerCase(),
      subscriptionEnd: new Date(Date.now() + (plan.duration * 24 * 60 * 60 * 1000)),
      updatedAt: new Date()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'assign_plan',
      target: userId,
      metadata: {
        planId,
        planName: plan.name
      }
    });

    await ctx.editMessageText(
      `✅ **Plan Assigned**\n\n` +
      `User ID: \`${userId}\`\n` +
      `New Plan: ${plan.name}\n` +
      `Duration: ${plan.duration} days`,
      {
        parse_mode: 'Markdown',
        reply_markup: getAdminDashboardMenu()
      }
    );
    await ctx.answerCbQuery('✅ Plan assigned successfully');

    delete ctx.session.adminAction;
  } catch (error) {
    console.error('Assign plan error:', error);
    await ctx.answerCbQuery('❌ Error assigning plan');
  }
}

/**
 * Get user statistics
 */
async function handleUserStats(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('📊 Loading statistics...');

    const [
      totalUsersSnapshot,
      activeUsersSnapshot,
      premiumUsersSnapshot,
      todaySnapshot
    ] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('users').where('status', '==', 'active').count().get(),
      db.collection('users').where('plan', 'in', ['premium', 'gold']).count().get(),
      db.collection('users')
        .where('createdAt', '>=', new Date(new Date().setHours(0, 0, 0, 0)))
        .count()
        .get()
    ]);

    const message =
      `📊 **User Statistics**\n\n` +
      `👥 Total Users: ${totalUsersSnapshot.data().count}\n` +
      `✅ Active Users: ${activeUsersSnapshot.data().count}\n` +
      `👑 Premium Users: ${premiumUsersSnapshot.data().count}\n` +
      `📈 New Today: ${todaySnapshot.data().count}\n`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getUserManagementMenu()
    });
  } catch (error) {
    console.error('User stats error:', error);
    await ctx.answerCbQuery('❌ Error loading statistics');
  }
}

/**
 * Export users to CSV
 */
async function handleExportUsers(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('📤 Preparing export...');

    const usersSnapshot = await db.collection('users').limit(1000).get();

    let csvContent = 'ID,Username,First Name,Plan,Status,Join Date\n';

    usersSnapshot.forEach(doc => {
      const user = doc.data();
      const joinDate = user.createdAt?.toDate?.() || new Date();
      csvContent += `${doc.id},"${user.username || 'N/A'}","${user.firstName || 'N/A'}","${user.plan || 'basic'}","${user.status || 'active'}","${joinDate.toISOString()}"\n`;
    });

    // Send as file
    await ctx.replyWithDocument({
      source: Buffer.from(csvContent),
      filename: `users_export_${new Date().toISOString().split('T')[0]}.csv`
    }, {
      caption: `📤 User Export (${usersSnapshot.size} users)`
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'export_users',
      target: 'all_users',
      metadata: {
        count: usersSnapshot.size
      }
    });
  } catch (error) {
    console.error('Export users error:', error);
    await ctx.reply('❌ Error exporting users. Please try again.');
  }
}

module.exports = {
  handleUserManagement,
  handleSearchUser,
  processUserSearch,
  handleActivateUser,
  handleDeactivateUser,
  handleExtendSubscription,
  processExtendSubscription,
  handleChangePlan,
  handleAssignPlan,
  handleUserStats,
  handleExportUsers
};
