import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import ai from '../genkit';
import { sendWhatsAppNotification } from '../tools/whatsapp';
import { gemini15Flash } from '@genkit-ai/googleai';

// Define input schema for payment notification
const PaymentNotificationInput = z.object({
  orderId: z.string(),
  transactionId: z.string(),
  amount: z.number(),
  currency: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  productId: z.string(),
  status: z.string(),
});

// Define output schema
const PaymentNotificationOutput = z.object({
  notificationSent: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

// Create the payment notification flow
export const paymentNotificationFlow = defineFlow(
  {
    name: 'paymentNotification',
    inputSchema: PaymentNotificationInput,
    outputSchema: PaymentNotificationOutput,
  },
  async (input) => {
    try {
      const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER || '+1234567890';

      // Create a prompt for the AI to compose a notification message
      const prompt = `
You are a helpful assistant for an e-commerce store called "EasyBots Store" that sells AI bots.

A payment has been received with the following details:
- Order ID: ${input.orderId}
- Transaction ID: ${input.transactionId}
- Amount: ${input.amount / 100} ${input.currency}
- Status: ${input.status}
- Product ID: ${input.productId}

Customer Information:
- Name: ${input.customerName}
- Email: ${input.customerEmail}
- Phone: ${input.customerPhone}

Compose a concise, professional WhatsApp notification message (maximum 160 characters) to inform the store administrator about this successful payment.
Include the order ID, amount, and customer name. Keep it brief and clear.

Use the sendWhatsAppNotification tool to send this message to the phone number: ${adminPhoneNumber}
`;

      // Use Genkit to generate and send the notification
      const result = await ai.generate({
        model: gemini15Flash,
        prompt,
        tools: [sendWhatsAppNotification],
        config: {
          temperature: 0.3,
        },
      });

      console.log('AI Response:', result.text);

      return {
        notificationSent: true,
        message: result.text,
      };
    } catch (error) {
      console.error('Payment notification flow error:', error);
      return {
        notificationSent: false,
        message: 'Failed to send notification',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
);

export default paymentNotificationFlow;
