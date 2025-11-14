/**
 * Support handler (private chat only)
 */

const { sendPrivateMessage } = require('../../utils/notifications');
const { t } = require('../../config/i18n');

const handleSupport = async (ctx) => {
  const language = ctx.session?.language || 'en';

  // If called from group, redirect to private
  if (ctx.isGroupChat) {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    await ctx.reply(
      t(language, 'privateMessageSent', {
        username,
        command: 'Support'
      }),
      { reply_to_message_id: ctx.message.message_id }
    );

    // Send to private chat
    await sendPrivateMessage(
      ctx,
      getSupportText(),
      { reply_markup: getSupportMenu(), parse_mode: 'Markdown' }
    );

    return;
  }

  // Show in private chat
  await ctx.reply(getSupportText(), {
    reply_markup: getSupportMenu(),
    parse_mode: 'Markdown'
  });
};

/**
 * Get support text
 */
const getSupportText = () => {
  return (
    '🤖 **Support**\n\n' +
    'How can we help you today?\n\n' +
    '• Ask a question to our AI assistant\n' +
    '• Contact a human support agent\n' +
    '• View FAQ and documentation\n\n' +
    'Choose an option below:'
  );
};

/**
 * Get support menu
 */
const getSupportMenu = () => {
  return {
    inline_keyboard: [
      [{ text: '🤖 AI Assistant', callback_data: 'support_ai' }],
      [{ text: '👤 Human Agent', callback_data: 'support_human' }],
      [{ text: '📚 FAQ', url: 'https://pnptv.app/faq' }],
      [{ text: '🔙 Back to Main', callback_data: 'back_to_main' }]
    ]
  };
};

/**
 * Handle AI support
 */
const handleAISupport = async (ctx) => {
  await ctx.editMessageText(
    '🤖 **AI Support**\n\n' +
    'I\'m here to help! Please describe your issue or ask your question.\n\n' +
    'Type your message below:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Support', callback_data: 'show_support' }]
        ]
      }
    }
  );

  await ctx.answerCbQuery();

  // Set state to expect support question
  ctx.session.expectingSupportQuestion = true;
};

/**
 * Handle human support
 */
const handleHumanSupport = async (ctx) => {
  await ctx.editMessageText(
    '👤 **Human Support**\n\n' +
    'A support agent will assist you shortly.\n\n' +
    'Average wait time: 5-10 minutes\n\n' +
    'Please describe your issue:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '❌ Cancel', callback_data: 'show_support' }]
        ]
      }
    }
  );

  await ctx.answerCbQuery();

  // Set state to expect support ticket
  ctx.session.expectingSupportTicket = true;
};

/**
 * Process support question
 */
const processSupportQuestion = async (ctx) => {
  if (!ctx.session.expectingSupportQuestion && !ctx.session.expectingSupportTicket) {
    return;
  }

  const question = ctx.message.text;

  if (ctx.session.expectingSupportQuestion) {
    // AI support response (mock)
    await ctx.reply(
      '🤖 **AI Assistant**\n\n' +
      'Thank you for your question. Based on your inquiry, here are some suggestions:\n\n' +
      '1. Check our FAQ: https://pnptv.app/faq\n' +
      '2. Try restarting the bot with /start\n' +
      '3. Contact human support for further assistance\n\n' +
      'Was this helpful?',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👍 Yes', callback_data: 'support_helpful_yes' },
              { text: '👎 No', callback_data: 'support_helpful_no' }
            ],
            [{ text: '🔙 Back to Support', callback_data: 'show_support' }]
          ]
        }
      }
    );

    ctx.session.expectingSupportQuestion = false;
  } else if (ctx.session.expectingSupportTicket) {
    // Human support ticket (mock)
    await ctx.reply(
      '✅ **Ticket Created**\n\n' +
      'Your support ticket has been created.\n\n' +
      'Ticket ID: #' + Math.floor(Math.random() * 100000) + '\n\n' +
      'A support agent will contact you shortly.',
      {
        parse_mode: 'Markdown',
        reply_markup: getSupportMenu()
      }
    );

    ctx.session.expectingSupportTicket = false;
  }
};

module.exports = {
  handleSupport,
  handleAISupport,
  handleHumanSupport,
  processSupportQuestion
};
