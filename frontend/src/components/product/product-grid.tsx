import * as React from 'react';
import { ProductCard } from './product-card';
import { Product } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col space-y-3 rounded-lg border border-zinc-200 p-4 bg-white"
          >
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 mb-4">
          <PackageOpen className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 mb-1">
          No products found
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mb-6">
          We couldn't find any products matching your current search or filter criteria.
        </p>
        <Link href="/products">
          <Button variant="outline" size="sm">
            Clear Filters
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
