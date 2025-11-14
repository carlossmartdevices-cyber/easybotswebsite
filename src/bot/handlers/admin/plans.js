/**
 * Plan Management Handler
 * Add, edit, and manage subscription plans
 */

const { db } = require('../../../config/firebase');
const { getPlanManagementMenu, getPlanActionsMenu, getAdminDashboardMenu } = require('../../utils/adminMenus');
const { logAdminAction } = require('../../utils/adminLogger');

/**
 * Show plan management menu
 */
async function handlePlanManagement(ctx) {
  try {
    const message =
      `💰 **Plan Management**\n\n` +
      `Manage subscription plans and pricing.\n\n` +
      `Select an action:`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getPlanManagementMenu()
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Plan management menu error:', error);
    await ctx.answerCbQuery('Error loading plan management');
  }
}

/**
 * View all plans
 */
async function handleViewAllPlans(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('📋 Loading plans...');

    const plansSnapshot = await db.collection('plans').get();

    if (plansSnapshot.empty) {
      await ctx.editMessageText(
        `📋 **No Plans Found**\n\n` +
        `There are no subscription plans configured yet.\n\n` +
        `Use "Add New Plan" to create one.`,
        {
          parse_mode: 'Markdown',
          reply_markup: getPlanManagementMenu()
        }
      );
      return;
    }

    let message = `📋 **All Subscription Plans**\n\n`;

    plansSnapshot.forEach(doc => {
      const plan = doc.data();
      const statusEmoji = plan.status === 'active' ? '✅' : '❌';

      message += `${statusEmoji} **${plan.name}**\n`;
      message += `   💵 Price: $${plan.price}/month\n`;
      message += `   ⏱ Duration: ${plan.duration} days\n`;
      message += `   📝 Features: ${plan.features?.length || 0}\n`;
      message += `   ID: \`${doc.id}\`\n\n`;
    });

    // Build inline keyboard with plan actions
    const keyboard = [];
    plansSnapshot.forEach(doc => {
      keyboard.push([{
        text: `⚙️ Manage ${doc.data().name}`,
        callback_data: `plan_manage_${doc.id}`
      }]);
    });
    keyboard.push([{ text: '🔙 Back', callback_data: 'admin_plans' }]);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (error) {
    console.error('View all plans error:', error);
    await ctx.answerCbQuery('❌ Error loading plans');
  }
}

/**
 * Show plan management actions
 */
async function handleManagePlan(ctx, planId) {
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

    const message =
      `💰 **Plan Details**\n\n` +
      `**Name:** ${plan.name}\n` +
      `**Price:** $${plan.price}/month\n` +
      `**Duration:** ${plan.duration} days\n` +
      `**Status:** ${plan.status || 'active'}\n` +
      `**Features:**\n${(plan.features || []).map(f => `  • ${f}`).join('\n')}\n\n` +
      `Plan ID: \`${planId}\``;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getPlanActionsMenu(planId)
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Manage plan error:', error);
    await ctx.answerCbQuery('❌ Error loading plan details');
  }
}

/**
 * Handle add new plan
 */
async function handleAddPlan(ctx) {
  try {
    ctx.session.adminAction = 'add_plan_name';
    ctx.session.newPlan = {};

    await ctx.editMessageText(
      `➕ **Add New Plan**\n\n` +
      `Step 1 of 4: Enter the plan name\n\n` +
      `Example: Premium, Gold, Enterprise\n\n` +
      `Type the plan name:`,
      { parse_mode: 'Markdown' }
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Add plan error:', error);
    await ctx.answerCbQuery('❌ Error starting plan creation');
  }
}

/**
 * Process plan creation steps
 */
async function processAddPlan(ctx) {
  try {
    const action = ctx.session.adminAction;
    const message = ctx.message.text.trim();

    if (action === 'add_plan_name') {
      ctx.session.newPlan.name = message;
      ctx.session.adminAction = 'add_plan_price';

      await ctx.reply(
        `✅ Plan name: ${message}\n\n` +
        `Step 2 of 4: Enter the monthly price\n\n` +
        `Example: 9.99\n\n` +
        `Type the price (numbers only):`,
        { parse_mode: 'Markdown' }
      );
    } else if (action === 'add_plan_price') {
      const price = parseFloat(message);

      if (isNaN(price) || price < 0) {
        await ctx.reply('❌ Invalid price. Please enter a valid number (e.g., 9.99)');
        return;
      }

      ctx.session.newPlan.price = price;
      ctx.session.adminAction = 'add_plan_duration';

      await ctx.reply(
        `✅ Price: $${price}/month\n\n` +
        `Step 3 of 4: Enter the duration in days\n\n` +
        `Example: 30 (for monthly), 365 (for yearly)\n\n` +
        `Type the duration:`,
        { parse_mode: 'Markdown' }
      );
    } else if (action === 'add_plan_duration') {
      const duration = parseInt(message);

      if (isNaN(duration) || duration < 1) {
        await ctx.reply('❌ Invalid duration. Please enter a number of days (e.g., 30)');
        return;
      }

      ctx.session.newPlan.duration = duration;
      ctx.session.adminAction = 'add_plan_features';

      await ctx.reply(
        `✅ Duration: ${duration} days\n\n` +
        `Step 4 of 4: Enter plan features\n\n` +
        `Separate each feature with a new line.\n\n` +
        `Example:\n` +
        `Access to premium content\n` +
        `Priority support\n` +
        `No ads\n\n` +
        `Type the features:`,
        { parse_mode: 'Markdown' }
      );
    } else if (action === 'add_plan_features') {
      const features = message.split('\n').filter(f => f.trim() !== '');
      ctx.session.newPlan.features = features;

      // Save plan to Firestore
      if (!db) {
        await ctx.reply('❌ Database not available');
        return;
      }

      const planData = {
        ...ctx.session.newPlan,
        status: 'active',
        createdAt: new Date(),
        createdBy: ctx.from.id
      };

      const planRef = await db.collection('plans').add(planData);

      await logAdminAction({
        adminId: ctx.from.id,
        action: 'add_plan',
        target: planRef.id,
        metadata: planData
      });

      const confirmMessage =
        `✅ **Plan Created Successfully!**\n\n` +
        `**Name:** ${planData.name}\n` +
        `**Price:** $${planData.price}/month\n` +
        `**Duration:** ${planData.duration} days\n` +
        `**Features:**\n${features.map(f => `  • ${f}`).join('\n')}\n\n` +
        `Plan ID: \`${planRef.id}\``;

      await ctx.reply(confirmMessage, {
        parse_mode: 'Markdown',
        reply_markup: getPlanManagementMenu()
      });

      // Clear session
      delete ctx.session.adminAction;
      delete ctx.session.newPlan;
    }
  } catch (error) {
    console.error('Process add plan error:', error);
    await ctx.reply('❌ Error creating plan. Please try again.');
    delete ctx.session.adminAction;
    delete ctx.session.newPlan;
  }
}

/**
 * Handle edit plan
 */
async function handleEditPlan(ctx, planId) {
  try {
    ctx.session.adminAction = `edit_plan_${planId}`;

    await ctx.editMessageText(
      `✏️ **Edit Plan**\n\n` +
      `What would you like to edit?\n\n` +
      `Reply with:\n` +
      `• \`name: New Name\`\n` +
      `• \`price: 19.99\`\n` +
      `• \`duration: 30\`\n\n` +
      `Example: \`price: 14.99\``,
      { parse_mode: 'Markdown' }
    );
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Edit plan error:', error);
    await ctx.answerCbQuery('❌ Error starting plan edit');
  }
}

/**
 * Process plan edit
 */
async function processEditPlan(ctx, planId) {
  try {
    if (!db) {
      await ctx.reply('❌ Database not available');
      return;
    }

    const message = ctx.message.text.trim();
    const parts = message.split(':').map(p => p.trim());

    if (parts.length !== 2) {
      await ctx.reply('❌ Invalid format. Use: `field: value`\nExample: `price: 19.99`', {
        parse_mode: 'Markdown'
      });
      return;
    }

    const [field, value] = parts;
    const updateData = {};

    if (field === 'name') {
      updateData.name = value;
    } else if (field === 'price') {
      const price = parseFloat(value);
      if (isNaN(price) || price < 0) {
        await ctx.reply('❌ Invalid price. Please enter a valid number.');
        return;
      }
      updateData.price = price;
    } else if (field === 'duration') {
      const duration = parseInt(value);
      if (isNaN(duration) || duration < 1) {
        await ctx.reply('❌ Invalid duration. Please enter a number of days.');
        return;
      }
      updateData.duration = duration;
    } else {
      await ctx.reply('❌ Invalid field. Supported fields: name, price, duration');
      return;
    }

    updateData.updatedAt = new Date();

    await db.collection('plans').doc(planId).update(updateData);

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'edit_plan',
      target: planId,
      metadata: updateData
    });

    await ctx.reply(
      `✅ **Plan Updated**\n\n` +
      `Updated ${field} to: ${value}`,
      {
        parse_mode: 'Markdown',
        reply_markup: getPlanManagementMenu()
      }
    );

    delete ctx.session.adminAction;
  } catch (error) {
    console.error('Process edit plan error:', error);
    await ctx.reply('❌ Error updating plan. Please try again.');
  }
}

/**
 * Handle activate plan
 */
async function handleActivatePlan(ctx, planId) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await db.collection('plans').doc(planId).update({
      status: 'active',
      updatedAt: new Date()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'activate_plan',
      target: planId,
      metadata: {}
    });

    await ctx.answerCbQuery('✅ Plan activated');
    await handleManagePlan(ctx, planId);
  } catch (error) {
    console.error('Activate plan error:', error);
    await ctx.answerCbQuery('❌ Error activating plan');
  }
}

/**
 * Handle deactivate plan
 */
async function handleDeactivatePlan(ctx, planId) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await db.collection('plans').doc(planId).update({
      status: 'inactive',
      updatedAt: new Date()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'deactivate_plan',
      target: planId,
      metadata: {}
    });

    await ctx.answerCbQuery('✅ Plan deactivated');
    await handleManagePlan(ctx, planId);
  } catch (error) {
    console.error('Deactivate plan error:', error);
    await ctx.answerCbQuery('❌ Error deactivating plan');
  }
}

/**
 * Handle plan analytics
 */
async function handlePlanAnalytics(ctx) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('📊 Loading plan analytics...');

    // Get all plans
    const plansSnapshot = await db.collection('plans').get();
    const plans = [];
    plansSnapshot.forEach(doc => {
      plans.push({ id: doc.id, ...doc.data() });
    });

    if (plans.length === 0) {
      await ctx.editMessageText('❌ No plans found', {
        reply_markup: getPlanManagementMenu()
      });
      return;
    }

    // Get user counts for each plan
    let message = `📊 **Plan Analytics**\n\n`;

    for (const plan of plans) {
      const userCount = await db.collection('users')
        .where('plan', '==', plan.name.toLowerCase())
        .count()
        .get();

      const revenue = userCount.data().count * (plan.price || 0);

      message += `**${plan.name}**\n`;
      message += `👥 Users: ${userCount.data().count}\n`;
      message += `💰 Revenue: $${revenue.toFixed(2)}/mo\n`;
      message += `📊 Status: ${plan.status || 'active'}\n\n`;
    }

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getPlanManagementMenu()
    });

    await logAdminAction({
      adminId: ctx.from.id,
      action: 'view_plan_analytics',
      target: 'all_plans',
      metadata: {}
    });
  } catch (error) {
    console.error('Plan analytics error:', error);
    await ctx.answerCbQuery('❌ Error loading plan analytics');
  }
}

/**
 * View analytics for specific plan
 */
async function handleViewPlanAnalytics(ctx, planId) {
  try {
    if (!db) {
      await ctx.answerCbQuery('❌ Database not available');
      return;
    }

    await ctx.answerCbQuery('📊 Loading analytics...');

    const planDoc = await db.collection('plans').doc(planId).get();

    if (!planDoc.exists) {
      await ctx.answerCbQuery('❌ Plan not found');
      return;
    }

    const plan = planDoc.data();

    // Get user statistics
    const [totalUsers, activeUsers, last30DaysUsers] = await Promise.all([
      db.collection('users').where('plan', '==', plan.name.toLowerCase()).count().get(),
      db.collection('users')
        .where('plan', '==', plan.name.toLowerCase())
        .where('status', '==', 'active')
        .count()
        .get(),
      db.collection('users')
        .where('plan', '==', plan.name.toLowerCase())
        .where('createdAt', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .count()
        .get()
    ]);

    const totalRevenue = totalUsers.data().count * (plan.price || 0);
    const activeRevenue = activeUsers.data().count * (plan.price || 0);

    const message =
      `📊 **${plan.name} Analytics**\n\n` +
      `**Users:**\n` +
      `👥 Total: ${totalUsers.data().count}\n` +
      `✅ Active: ${activeUsers.data().count}\n` +
      `📈 New (30d): ${last30DaysUsers.data().count}\n\n` +
      `**Revenue:**\n` +
      `💰 Total MRR: $${totalRevenue.toFixed(2)}/mo\n` +
      `💵 Active MRR: $${activeRevenue.toFixed(2)}/mo\n\n` +
      `**Plan Details:**\n` +
      `💵 Price: $${plan.price}/mo\n` +
      `⏱ Duration: ${plan.duration} days\n` +
      `📊 Status: ${plan.status || 'active'}`;

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getPlanActionsMenu(planId)
    });
  } catch (error) {
    console.error('View plan analytics error:', error);
    await ctx.answerCbQuery('❌ Error loading analytics');
  }
}

module.exports = {
  handlePlanManagement,
  handleViewAllPlans,
  handleManagePlan,
  handleAddPlan,
  processAddPlan,
  handleEditPlan,
  processEditPlan,
  handleActivatePlan,
  handleDeactivatePlan,
  handlePlanAnalytics,
  handleViewPlanAnalytics
};
