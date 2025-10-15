import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in cents to currency string
export function formatPrice(cents: number, currency: 'USD' | 'COP'): string {
  const amount = cents / 100;

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } else {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}

// Generate a unique order ID
export function generateOrderId(): string {
  return `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

// Generate deep link for Android app
export function generateBoldDeepLink(
  productId: string,
  currency: 'USD' | 'COP'
): string {
  return `bold://payment?productId=${productId}&currency=${currency}`;
}
