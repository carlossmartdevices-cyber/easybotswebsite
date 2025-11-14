/**
 * Subscription handler (private chat only)
 */

const { getSubscriptionMenu, getMainMenu } = require('../../utils/menus');
const { sendPrivateMessage } = require('../../utils/notifications');
const { t } = require('../../config/i18n');
const config = require('../../config/botConfig');

const handleSubscription = async (ctx, sendViaAPI = false) => {
  const language = ctx.session?.language || 'en';

  // If called from group, redirect to private
  if (ctx.isGroupChat) {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    await ctx.reply(
      t(language, 'privateMessageSent', {
        username,
        command: 'Subscribe to PRIME'
      }),
      { reply_to_message_id: ctx.message.message_id }
    );

    // Send to private chat
    const success = await sendPrivateMessage(
      ctx,
      t(language, 'subscriptionPlans'),
      { reply_markup: getSubscriptionMenu(language) }
    );

    return;
  }

  // Show in private chat
  const message = t(language, 'subscriptionPlans');

  if (sendViaAPI) {
    await ctx.telegram.sendMessage(
      ctx.from.id,
      message,
      { reply_markup: getSubscriptionMenu(language) }
    );
  } else {
    await ctx.reply(message, {
      reply_markup: getSubscriptionMenu(language),
      parse_mode: 'Markdown'
    });
  }
};

/**
 * Handle subscription plan selection
 */
const handlePlanSelection = async (ctx) => {
  const language = ctx.session?.language || 'en';
  const planId = ctx.callbackQuery.data.replace('plan_', '');

  const plans = {
    basic: { name: 'Basic', price: 9.99 },
    premium: { name: 'Premium', price: 19.99 },
    gold: { name: 'Gold', price: 49.99 }
  };

  const plan = plans[planId];

  if (!plan) {
    await ctx.answerCbQuery('Invalid plan selected');
    return;
  }

  // In production, integrate with payment gateway here
  await ctx.editMessageText(
    `You selected the **${plan.name}** plan ($${plan.price}/month).\n\n` +
    `To complete your subscription, please contact support or use the payment link:\n` +
    `https://pnptv.app/subscribe/${planId}`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 Pay Now', url: `https://pnptv.app/subscribe/${planId}` }],
          [{ text: '🔙 Back to Plans', callback_data: 'show_subscription_plans' }],
          [{ text: '🏠 Main Menu', callback_data: 'back_to_main' }]
        ]
      }
    }
  );

  await ctx.answerCbQuery();
};

/**
 * Handle payment help
 */
const handlePaymentHelp = async (ctx) => {
  const language = ctx.session?.language || 'en';

  await ctx.editMessageText(
    '💳 **Payment Help**\n\n' +
    'We accept the following payment methods:\n' +
    '• Credit/Debit Cards (Visa, Mastercard, Amex)\n' +
    '• PayPal\n' +
    '• Cryptocurrency (BTC, ETH)\n\n' +
    'If you have any issues, please contact our support team.',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🤖 Contact Support', callback_data: 'show_support' }],
          [{ text: '🔙 Back to Plans', callback_data: 'show_subscription_plans' }]
        ]
      }
    }
  );

  await ctx.answerCbQuery();
};

module.exports = {
  handleSubscription,
  handlePlanSelection,
  handlePaymentHelp
};
