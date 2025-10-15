'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/src/components/product-card';
import { products } from '@/src/lib/products';
import { useAuth } from '@/src/lib/auth-context';

export default function HomePage() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const translations = {
    en: {
      title: 'EasyBots Store',
      subtitle: 'Your Digital AI Bots Marketplace',
      description: 'Discover powerful AI bots designed to automate your business processes, enhance customer experience, and boost productivity.',
      login: 'Login',
      logout: 'Logout',
      switchLanguage: 'Español',
      footer: {
        terms: 'Terms & Conditions',
        privacy: 'Privacy Policy',
        refund: 'Refund Policy',
        allProducts: 'All Products',
        copyright: '2024 EasyBots Store. All rights reserved.',
      },
    },
    es: {
      title: 'Tienda EasyBots',
      subtitle: 'Tu Mercado de Bots IA Digitales',
      description: 'Descubre poderosos bots de IA diseñados para automatizar tus procesos de negocio, mejorar la experiencia del cliente y aumentar la productividad.',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      switchLanguage: 'English',
      footer: {
        terms: 'Términos y Condiciones',
        privacy: 'Política de Privacidad',
        refund: 'Política de Reembolso',
        allProducts: 'Todos los Productos',
        copyright: '2024 Tienda EasyBots. Todos los derechos reservados.',
      },
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              >
                {t.switchLanguage}
              </Button>
              {loading ? (
                <span className="text-sm text-muted-foreground">Loading...</span>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    {t.logout}
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm">
                    {t.login}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-4xl font-bold mb-4">{t.subtitle}</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.description}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              language={language}
              userEmail={user?.email || undefined}
              userId={user?.uid || undefined}
              userName={user?.displayName || undefined}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              {t.footer.terms}
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              {t.footer.privacy}
            </Link>
            <Link href="/refund" className="text-sm text-muted-foreground hover:text-foreground">
              {t.footer.refund}
            </Link>
            <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
              {t.footer.allProducts}
            </Link>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
