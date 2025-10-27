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
  epaycoTransactionId?: string;
  epaycoRefPayco?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

// ePayco API types
export interface EpaycoPaymentRequest {
  name: string;
  description: string;
  invoice: string;
  currency: string;
  amount: string;
  tax_base: string;
  tax: string;
  country: string;
  lang: string;
  external: string;
  extra1: string; // productId
  extra2: string; // userId
  extra3: string;
  confirmation: string;
  response: string;
  name_billing: string;
  address_billing: string;
  type_doc_billing: string;
  mobilephone_billing: string;
  number_doc_billing: string;
  email_billing: string;
}

export interface EpaycoPaymentResponse {
  success: boolean;
  data: {
    id: string;
    url_payment: string;
    ref_payco: string;
  };
}

export interface EpaycoWebhookEvent {
  x_cust_id_cliente: string;
  x_ref_payco: string;
  x_id_invoice: string;
  x_id_factura: string;
  x_description: string;
  x_amount: string;
  x_amount_country: string;
  x_amount_ok: string;
  x_tax: string;
  x_amount_base: string;
  x_currency_code: string;
  x_bank_name: string;
  x_cardnumber: string;
  x_quotas: string;
  x_respuesta: string; // Payment status (Aceptada, Rechazada, Pendiente)
  x_response: string;
  x_approval_code: string;
  x_transaction_id: string;
  x_transaction_date: string;
  x_transaction_state: string; // Transaction state
  x_franchise: string;
  x_business: string;
  x_customer_doctype: string;
  x_customer_document: string;
  x_customer_name: string;
  x_customer_lastname: string;
  x_customer_email: string;
  x_customer_phone: string;
  x_customer_movil: string;
  x_customer_ind_pais: string;
  x_customer_country: string;
  x_customer_city: string;
  x_customer_address: string;
  x_customer_ip: string;
  x_signature: string;
  x_extra1?: string; // productId
  x_extra2?: string; // userId
  x_extra3?: string;
  x_extra4?: string;
  x_extra5?: string;
  x_extra6?: string;
  x_extra7?: string;
  x_extra8?: string;
  x_extra9?: string;
  x_extra10?: string;
}
