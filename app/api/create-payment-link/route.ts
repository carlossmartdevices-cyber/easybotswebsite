import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/src/lib/products';
import { generateOrderId } from '@/src/lib/utils';
import { saveTransaction } from '@/src/lib/firebase-admin';
import { EpaycoPaymentRequest, EpaycoPaymentResponse, Transaction } from '@/src/lib/types';

const epayco = require('epayco-sdk-node')({
  apiKey: process.env.EPAYCO_PUBLIC_KEY,
  privateKey: process.env.EPAYCO_PRIVATE_KEY,
  lang: 'ES',
  test: process.env.EPAYCO_TEST_MODE === 'true'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, currency, userId, userName, userEmail, userPhone } = body;

    // Validate required fields
    if (!productId || !currency || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the product
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get the price based on currency
    const amount = currency === 'usd' ? product.prices.usd : product.prices.cop;
    const currencyCode = currency === 'usd' ? 'USD' : 'COP';

    // Generate unique order ID
    const orderId = generateOrderId();
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Prepare ePayco API keys
    const publicKey = process.env.EPAYCO_PUBLIC_KEY;
    const privateKey = process.env.EPAYCO_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Calculate tax (assuming 0% tax, adjust as needed)
    const taxPercentage = 0;
    const taxBase = amount;
    const tax = Math.round((amount * taxPercentage) / 100);

    // Base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Prepare ePayco payment request
    const epaycoRequest: EpaycoPaymentRequest = {
      name: product.name,
      description: `${product.name} - EasyBots Store`,
      invoice: orderId,
      currency: currencyCode.toLowerCase(),
      amount: (amount / 100).toString(), // Convert cents to currency units
      tax_base: (taxBase / 100).toString(),
      tax: (tax / 100).toString(),
      country: 'CO',
      lang: 'ES',
      external: 'false',
      extra1: product.id, // productId
      extra2: userId, // userId
      extra3: transactionId,
      confirmation: `${baseUrl}/api/webhooks/epayco`,
      response: `${baseUrl}/?payment=success`,
      name_billing: userName || 'Customer',
      address_billing: 'N/A',
      type_doc_billing: 'CC',
      mobilephone_billing: userPhone || 'N/A',
      number_doc_billing: '000000000',
      email_billing: userEmail,
    };

    // Make request to ePayco API
    let epaycoData: EpaycoPaymentResponse;

    try {
      epaycoData = await epayco.checkout.create(epaycoRequest);

      if (!epaycoData.success) {
        console.error('ePayco API error:', epaycoData);
        return NextResponse.json(
          { error: 'Failed to create payment link', details: epaycoData },
          { status: 500 }
        );
      }
    } catch (epaycoError) {
      console.error('ePayco SDK error:', epaycoError);
      return NextResponse.json(
        { error: 'Failed to create payment link', details: epaycoError instanceof Error ? epaycoError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Save transaction to Firestore
    const transaction: Transaction = {
      id: transactionId,
      orderId: orderId,
      productId: product.id,
      userId: userId,
      amount: amount,
      currency: currencyCode,
      status: 'PENDING',
      paymentLink: epaycoData.data.url_payment,
      epaycoTransactionId: epaycoData.data.id,
      epaycoRefPayco: epaycoData.data.ref_payco,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: userName || 'Customer',
        email: userEmail,
        phone: userPhone || 'N/A',
      },
    };

    await saveTransaction(transaction);

    return NextResponse.json({
      paymentLink: epaycoData.data.url_payment,
      orderId: orderId,
      transactionId: transactionId,
    });
  } catch (error) {
    console.error('Payment link creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
