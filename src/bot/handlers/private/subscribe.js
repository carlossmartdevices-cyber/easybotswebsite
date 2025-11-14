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
    trial: {
      name: 'Trial',
      price: 0,
      duration: '7 days',
      benefits: [
        '✓ Access to basic content',
        '✓ Limited support',
        '✗ No media privileges'
      ]
    },
    monthly: {
      name: 'Monthly',
      price: 9.99,
      duration: '30 days',
      benefits: [
        '✓ Full access to all content',
        '✓ Premium media (photos, videos)',
        '✓ Priority support',
        '✓ Exclusive group features',
        '✓ Send media in groups'
      ]
    },
    quarterly: {
      name: 'Quarterly',
      price: 24.99,
      duration: '90 days',
      benefits: [
        '✓ All Monthly benefits',
        '✓ Discounted rate (save 17%)',
        '✓ Bonus exclusive content',
        '✓ Access to exclusive channels'
      ]
    },
    yearly: {
      name: 'Yearly',
      price: 79.99,
      duration: '365 days',
      benefits: [
        '✓ All Quarterly benefits',
        '✓ Best value (save 33%)',
        '✓ VIP support',
        '✓ Special events access',
        '✓ Member-only content'
      ]
    },
    lifetime: {
      name: 'Lifetime',
      price: 199.99,
      duration: 'Unlimited',
      benefits: [
        '✓ All Yearly benefits',
        '✓ Lifetime access',
        '✓ VIP badge',
        '✓ Priority for new features',
        '✓ Exclusive lifetime perks'
      ]
    }
  };

  const plan = plans[planId];

  if (!plan) {
    await ctx.answerCbQuery('Invalid plan selected');
    return;
  }

  // Format benefits for display
  const benefitsText = plan.benefits.join('\n');

  // Format price display
  const priceText = plan.price === 0 ? 'FREE' : `$${plan.price}`;

  // In production, integrate with payment gateway here
  const messageText = plan.price === 0
    ? `🆓 **${plan.name} Plan**\n\n` +
      `Duration: ${plan.duration}\n\n` +
      `**Benefits:**\n${benefitsText}\n\n` +
      `Click below to activate your free trial!`
    : `💎 **${plan.name} Plan**\n\n` +
      `Price: ${priceText}\n` +
      `Duration: ${plan.duration}\n\n` +
      `**Benefits:**\n${benefitsText}\n\n` +
      `To complete your subscription, please use the payment link below:`;

  await ctx.editMessageText(
    messageText,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: plan.price === 0 ? '🆓 Activate Trial' : '💳 Pay Now', url: `https://pnptv.app/subscribe/${planId}` }],
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
