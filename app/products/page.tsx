import Link from 'next/link';
import { products } from '@/src/lib/products';
import { formatPrice } from '@/src/lib/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-6">All Products</h1>
        <p className="text-muted-foreground mb-8">
          Browse our complete catalog of AI bots for your business automation needs.
        </p>

        <Table>
          <TableCaption>A list of all available AI bots in the EasyBots Store</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Product Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price (USD)</TableHead>
              <TableHead className="text-right">Price (COP)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell className="text-right">{formatPrice(product.prices.usd, 'USD')}</TableCell>
                <TableCell className="text-right">{formatPrice(product.prices.cop, 'COP')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
