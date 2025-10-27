import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { EpaycoWebhookEvent } from '@/src/lib/types';
import { updateTransactionStatus } from '@/src/lib/firebase-admin';
import { paymentNotificationFlow } from '@/src/ai/flows/payment-notification';

// Verify ePayco webhook signature
function verifyEpaycoSignature(event: EpaycoWebhookEvent, privateKey: string): boolean {
  const {
    x_cust_id_cliente,
    x_ref_payco,
    x_id_factura,
    x_description,
    x_amount,
    x_amount_country,
    x_amount_ok,
    x_tax,
    x_amount_base,
    x_currency_code,
    x_signature,
  } = event;

  // Build signature string as per ePayco documentation
  const signatureString = `${privateKey}^${x_cust_id_cliente}^${x_ref_payco}^${x_id_factura}^${x_amount}^${x_currency_code}`;

  const hash = createHmac('sha256', signatureString).digest('hex');

  return hash === x_signature;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook event (ePayco sends as form data)
    const formData = await request.formData();

    // Convert FormData to event object
    const event: EpaycoWebhookEvent = {
      x_cust_id_cliente: formData.get('x_cust_id_cliente') as string,
      x_ref_payco: formData.get('x_ref_payco') as string,
      x_id_invoice: formData.get('x_id_invoice') as string,
      x_id_factura: formData.get('x_id_factura') as string,
      x_description: formData.get('x_description') as string,
      x_amount: formData.get('x_amount') as string,
      x_amount_country: formData.get('x_amount_country') as string,
      x_amount_ok: formData.get('x_amount_ok') as string,
      x_tax: formData.get('x_tax') as string,
      x_amount_base: formData.get('x_amount_base') as string,
      x_currency_code: formData.get('x_currency_code') as string,
      x_bank_name: formData.get('x_bank_name') as string,
      x_cardnumber: formData.get('x_cardnumber') as string,
      x_quotas: formData.get('x_quotas') as string,
      x_respuesta: formData.get('x_respuesta') as string,
      x_response: formData.get('x_response') as string,
      x_approval_code: formData.get('x_approval_code') as string,
      x_transaction_id: formData.get('x_transaction_id') as string,
      x_transaction_date: formData.get('x_transaction_date') as string,
      x_transaction_state: formData.get('x_transaction_state') as string,
      x_franchise: formData.get('x_franchise') as string,
      x_business: formData.get('x_business') as string,
      x_customer_doctype: formData.get('x_customer_doctype') as string,
      x_customer_document: formData.get('x_customer_document') as string,
      x_customer_name: formData.get('x_customer_name') as string,
      x_customer_lastname: formData.get('x_customer_lastname') as string,
      x_customer_email: formData.get('x_customer_email') as string,
      x_customer_phone: formData.get('x_customer_phone') as string,
      x_customer_movil: formData.get('x_customer_movil') as string,
      x_customer_ind_pais: formData.get('x_customer_ind_pais') as string,
      x_customer_country: formData.get('x_customer_country') as string,
      x_customer_city: formData.get('x_customer_city') as string,
      x_customer_address: formData.get('x_customer_address') as string,
      x_customer_ip: formData.get('x_customer_ip') as string,
      x_signature: formData.get('x_signature') as string,
      x_extra1: formData.get('x_extra1') as string || undefined,
      x_extra2: formData.get('x_extra2') as string || undefined,
      x_extra3: formData.get('x_extra3') as string || undefined,
    };

    console.log('Received ePayco webhook for transaction:', event.x_ref_payco);

    // Verify webhook signature
    const privateKey = process.env.EPAYCO_PRIVATE_KEY;
    if (!privateKey) {
      console.error('ePayco private key not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const isValid = verifyEpaycoSignature(event, privateKey);
    if (!isValid) {
      console.error('Invalid ePayco webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Extract metadata from extra fields
    const productId = event.x_extra1;
    const userId = event.x_extra2;
    const transactionId = event.x_extra3;

    if (!userId || !transactionId) {
      console.error('Missing userId or transactionId in webhook');
      return NextResponse.json(
        { error: 'Missing required metadata' },
        { status: 400 }
      );
    }

    // Map ePayco status to our status
    let status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' = 'PENDING';

    switch (event.x_respuesta.toLowerCase()) {
      case 'aceptada':
      case 'aprobada':
      case 'approved':
        status = 'PAID';
        break;
      case 'rechazada':
      case 'declined':
      case 'fallida':
        status = 'FAILED';
        break;
      case 'cancelada':
      case 'cancelled':
        status = 'CANCELLED';
        break;
      case 'pendiente':
      case 'pending':
      default:
        status = 'PENDING';
    }

    // Update transaction in Firestore
    await updateTransactionStatus(
      userId,
      transactionId,
      status,
      event.x_transaction_id
    );

    console.log(`Transaction ${transactionId} updated to ${status}`);

    // If payment is successful, trigger AI notification
    if (status === 'PAID') {
      try {
        console.log('Triggering payment notification flow...');

        const amount = parseFloat(event.x_amount) * 100; // Convert to cents

        await paymentNotificationFlow({
          orderId: event.x_id_factura,
          transactionId: event.x_transaction_id,
          amount: amount,
          currency: event.x_currency_code,
          customerName: `${event.x_customer_name} ${event.x_customer_lastname}`.trim(),
          customerEmail: event.x_customer_email,
          customerPhone: event.x_customer_phone || event.x_customer_movil,
          productId: productId || 'unknown',
          status: status,
        });

        console.log('Payment notification sent successfully');
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't fail the webhook if notification fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
