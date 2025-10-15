import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-6">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: January 2024
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using EasyBots Store, you accept and agree to be bound by the terms and
              provisions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-muted-foreground">
              Upon purchase, we grant you a non-exclusive, non-transferable license to use the AI bot
              software for your business purposes. You may not resell, redistribute, or share access to
              the purchased bots.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Product Delivery</h2>
            <p className="text-muted-foreground">
              Digital products will be delivered to your registered email address within 24 hours of
              successful payment confirmation. Installation and setup instructions will be included.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
            <p className="text-muted-foreground">
              All payments are processed securely through Bold.co payment gateway. We accept major credit
              cards and local payment methods. Prices are listed in USD and COP and include all applicable taxes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All AI bots, software, and associated materials are the intellectual property of EasyBots
              Store. Unauthorized copying, modification, or distribution is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              EasyBots Store shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of our products or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms and Conditions, please contact us at support@easybots.store
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
