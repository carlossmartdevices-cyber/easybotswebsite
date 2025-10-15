import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RefundPage() {
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

        <h1 className="text-4xl font-bold mb-6">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: January 2024
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Refund Eligibility</h2>
            <p className="text-muted-foreground">
              Due to the digital nature of our AI bot products, we offer a 7-day money-back guarantee
              from the date of purchase. To be eligible for a refund, you must submit a refund request
              within 7 days of your purchase date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Refund Conditions</h2>
            <p className="text-muted-foreground">
              Refunds may be requested under the following conditions:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>The product does not work as described in the product listing</li>
              <li>You experienced technical issues that prevented proper product use</li>
              <li>The product was not delivered within 24 hours of payment confirmation</li>
              <li>You accidentally purchased the wrong product</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Non-Refundable Situations</h2>
            <p className="text-muted-foreground">
              Refunds will not be issued in the following cases:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Change of mind after the 7-day period</li>
              <li>Failure to use the product due to lack of technical knowledge</li>
              <li>Incompatibility with systems not listed in product requirements</li>
              <li>Products that have been substantially customized or modified</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Refund Process</h2>
            <p className="text-muted-foreground">
              To request a refund, please contact our support team at refunds@easybots.store with your
              order number and reason for the refund. Our team will review your request and respond
              within 2-3 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Refund Timeline</h2>
            <p className="text-muted-foreground">
              Once your refund is approved, it will be processed within 5-7 business days. The refund
              will be issued to the original payment method used for the purchase. Please note that
              your bank or payment provider may take additional time to process the refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Partial Refunds</h2>
            <p className="text-muted-foreground">
              In certain situations, partial refunds may be granted at our discretion, such as when
              only specific features are not working or when the product has been partially used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
            <p className="text-muted-foreground">
              For refund inquiries or to initiate a refund request, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              Email: refunds@easybots.store<br />
              Include your order number and detailed reason for the refund request.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
