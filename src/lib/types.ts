// Product types
export interface Product {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  prices: {
    usd: number;
    cop: number;
  };
  image: string;
}

// Transaction types
export interface Transaction {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  paymentLink?: string;
  boldTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

// Bold.co API types
export interface BoldPaymentLinkRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  redirectUrl: string;
  paymentMethods: {
    metadata: {
      productId: string;
      userId: string;
    };
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface BoldPaymentLinkResponse {
  paymentLink: string;
  id: string;
}

export interface BoldWebhookEvent {
  type: 'transaction.created' | 'transaction.updated';
  data: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    customer?: {
      name: string;
      email: string;
      phone: string;
    };
    metadata?: {
      productId: string;
      userId: string;
    };
  };
}
