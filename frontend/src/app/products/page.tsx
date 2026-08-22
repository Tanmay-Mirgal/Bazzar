'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { ProductGrid } from '@/components/product/product-grid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, Package, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = React.useState<string>(initialSearch);
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  React.useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  React.useEffect(() => {
    async function fetchFilteredProducts() {
      setIsLoading(true);
      try {
        const data = await getProducts({
          category: selectedCategory,
          search: searchQuery,
          sortBy: sortBy as any,
        });
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const updateUrlParams = (cat: string, search: string) => {
    const params = new URLSearchParams();
    if (cat && cat !== 'all') params.set('category', cat);
    if (search && search.trim() !== '') params.set('search', search.trim());
    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    updateUrlParams(categoryName, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrlParams(selectedCategory, query);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    router.push('/products');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || (selectedCategory !== 'all');

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
                <Package className="h-4 w-4" />
                Complete Collection
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {selectedCategory !== 'all' ? `${selectedCategory} Products` : 'All Products'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {isLoading ? 'Loading...' : `${products.length} item${products.length === 1 ? '' : 's'} available`}
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                <SelectTrigger className="w-48 h-10 text-xs bg-slate-800 border-slate-700 text-white rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">⭐ Featured / Newest</SelectItem>
                  <SelectItem value="price-asc">↑ Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">↓ Price: High to Low</SelectItem>
                  <SelectItem value="name">A–Z: Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Search + Category Filters */}
        <div className="space-y-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedCategory === cat.name
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1.5 text-xs text-rose-600 font-semibold hover:text-rose-700 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold rounded-full px-2.5">
                  Category: {selectedCategory}
                </Badge>
              )}
              {searchQuery.trim() && (
                <Badge variant="secondary" className="text-xs bg-violet-50 text-violet-700 border border-violet-200 font-semibold rounded-full px-2.5">
                  Search: "{searchQuery}"
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}
