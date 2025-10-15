import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { BoldWebhookEvent } from '@/src/lib/types';
import { updateTransactionStatus, getTransaction } from '@/src/lib/firebase-admin';
import { paymentNotificationFlow } from '@/src/ai/flows/payment-notification';

// Verify Bold.co webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('hex');
  return calculatedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-bold-signature');

    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.BOLD_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook event
    const event: BoldWebhookEvent = JSON.parse(rawBody);

    console.log('Received Bold.co webhook:', event.type);

    // Handle different event types
    if (event.type === 'transaction.created' || event.type === 'transaction.updated') {
      const { data } = event;
      const userId = data.metadata?.userId;
      const productId = data.metadata?.productId;

      if (!userId) {
        console.error('Missing userId in webhook metadata');
        return NextResponse.json(
          { error: 'Missing userId' },
          { status: 400 }
        );
      }

      // Map Bold.co status to our status
      let status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' = 'PENDING';

      switch (data.status.toUpperCase()) {
        case 'PAID':
        case 'APPROVED':
        case 'SUCCESS':
          status = 'PAID';
          break;
        case 'FAILED':
        case 'DECLINED':
          status = 'FAILED';
          break;
        case 'CANCELLED':
        case 'CANCELED':
          status = 'CANCELLED';
          break;
        default:
          status = 'PENDING';
      }

      // Update transaction in Firestore
      // We need to find the transaction by orderId
      // For simplicity, we'll use the orderId from Bold as our transaction ID
      // In production, you'd want a more robust way to map these
      const transactionId = data.orderId || data.id;

      await updateTransactionStatus(
        userId,
        transactionId,
        status,
        data.id
      );

      console.log(`Transaction ${transactionId} updated to ${status}`);

      // If payment is successful, trigger AI notification
      if (status === 'PAID') {
        try {
          console.log('Triggering payment notification flow...');

          await paymentNotificationFlow({
            orderId: data.orderId,
            transactionId: data.id,
            amount: data.amount,
            currency: data.currency,
            customerName: data.customer?.name || 'Unknown',
            customerEmail: data.customer?.email || 'unknown@example.com',
            customerPhone: data.customer?.phone || 'N/A',
            productId: productId || 'unknown',
            status: status,
          });

          console.log('Payment notification sent successfully');
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
          // Don't fail the webhook if notification fails
        }
      }

      return NextResponse.json({ received: true });
    }

    // Unknown event type
    console.log('Unhandled webhook event type:', event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
