import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/src/lib/products';
import { generateOrderId } from '@/src/lib/utils';
import { saveTransaction } from '@/src/lib/firebase-admin';
import { BoldPaymentLinkRequest, Transaction } from '@/src/lib/types';

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

    // Prepare Bold.co API request
    const boldApiKey = process.env.BOLD_API_KEY;
    if (!boldApiKey) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const boldRequest: BoldPaymentLinkRequest = {
      amount: amount, // Amount in cents
      currency: currencyCode,
      orderId: orderId,
      description: `${product.name} - EasyBots Store`,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?payment=success`,
      paymentMethods: {
        metadata: {
          productId: product.id,
          userId: userId,
        },
      },
      customer: {
        name: userName,
        email: userEmail,
        phone: userPhone,
      },
    };

    // Make request to Bold.co API
    const boldResponse = await fetch('https://api.bold.co/v2/payment-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `x-api-key ${boldApiKey}`,
      },
      body: JSON.stringify(boldRequest),
    });

    if (!boldResponse.ok) {
      const errorData = await boldResponse.json();
      console.error('Bold.co API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create payment link', details: errorData },
        { status: boldResponse.status }
      );
    }

    const boldData = await boldResponse.json();

    // Save transaction to Firestore
    const transaction: Transaction = {
      id: transactionId,
      orderId: orderId,
      productId: product.id,
      userId: userId,
      amount: amount,
      currency: currencyCode,
      status: 'PENDING',
      paymentLink: boldData.paymentLink || boldData.url,
      boldTransactionId: boldData.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: userName,
        email: userEmail,
        phone: userPhone,
      },
    };

    await saveTransaction(transaction);

    return NextResponse.json({
      paymentLink: boldData.paymentLink || boldData.url,
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
