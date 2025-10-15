'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/src/lib/types';
import { formatPrice, generateBoldDeepLink } from '@/src/lib/utils';
import { getProductImage } from '@/src/lib/images';

interface ProductCardProps {
  product: Product;
  language: 'en' | 'es';
  userEmail?: string;
  userId?: string;
  userName?: string;
}

export function ProductCard({ product, language, userEmail, userId, userName }: ProductCardProps) {
  const [loadingUSD, setLoadingUSD] = useState(false);
  const [loadingCOP, setLoadingCOP] = useState(false);

  const productName = language === 'es' ? product.name_es : product.name;
  const productDescription = language === 'es' ? product.description_es : product.description;

  const handlePurchase = async (currency: 'USD' | 'COP') => {
    if (!userEmail || !userId) {
      alert(language === 'es' ? 'Por favor inicia sesión para comprar' : 'Please login to purchase');
      window.location.href = '/login';
      return;
    }

    const setLoading = currency === 'USD' ? setLoadingUSD : setLoadingCOP;
    setLoading(true);

    try {
      const response = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          currency: currency.toLowerCase(),
          userId,
          userName: userName || 'Guest',
          userEmail,
          userPhone: '+1234567890', // Default placeholder
        }),
      });

      const data = await response.json();

      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error(data.error || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(language === 'es' ? 'Error al crear el enlace de pago' : 'Error creating payment link');
    } finally {
      setLoading(false);
    }
  };

  const handleAndroidDeepLink = (currency: 'USD' | 'COP') => {
    const deepLink = generateBoldDeepLink(product.id, currency);
    window.location.href = deepLink;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
          <Image
            src={getProductImage(product.image)}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardTitle className="text-xl">{productName}</CardTitle>
        <CardDescription>{productDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">USD:</span>
            <span className="text-lg font-bold">{formatPrice(product.prices.usd, 'USD')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">COP:</span>
            <span className="text-lg font-bold">{formatPrice(product.prices.cop, 'COP')}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => handlePurchase('USD')}
            disabled={loadingUSD || loadingCOP}
            className="flex-1"
            variant="default"
          >
            {loadingUSD ? (language === 'es' ? 'Procesando...' : 'Processing...') : (language === 'es' ? 'Comprar USD' : 'Buy USD')}
          </Button>
          <Button
            onClick={() => handlePurchase('COP')}
            disabled={loadingUSD || loadingCOP}
            className="flex-1"
            variant="secondary"
          >
            {loadingCOP ? (language === 'es' ? 'Procesando...' : 'Processing...') : (language === 'es' ? 'Comprar COP' : 'Buy COP')}
          </Button>
        </div>
        <Button
          onClick={() => handleAndroidDeepLink('USD')}
          disabled={loadingUSD || loadingCOP}
          className="w-full"
          variant="outline"
        >
          {language === 'es' ? 'Comprar en App Android' : 'Buy on Android App'}
        </Button>
      </CardFooter>
    </Card>
  );
}
