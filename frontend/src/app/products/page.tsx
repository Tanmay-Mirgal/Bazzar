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
import { SlidersHorizontal, Search, X, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-white text-[#111111] pb-20">
      {/* Header Banner */}
      <div className="border-b border-[#E8E8E8] bg-[#F7F7F5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#3F46D8]">Storefront Catalog</span>
              <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight mt-1">
                {selectedCategory !== 'all' ? `${selectedCategory}` : 'All Products'}
              </h1>
              <p className="text-xs text-[#6B6B6B] mt-1">
                {isLoading ? 'Loading catalog...' : `${products.length} product${products.length === 1 ? '' : 's'} listed`}
              </p>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#6B6B6B]" />
              <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                <SelectTrigger className="w-48 h-9 text-xs bg-white border-[#E8E8E8] text-[#111111] rounded-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Featured / Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar Filter */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">Search Catalog</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                <input
                  type="text"
                  placeholder="Filter by keywords..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-none border border-[#E8E8E8] bg-[#F7F7F5] focus:outline-none focus:border-[#111111] transition-all"
                />
                {searchQuery && (
                  <button onClick={() => handleSearchChange('')} className="absolute right-2.5 top-2.5 text-[#6B6B6B] hover:text-[#111111]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Navigation */}
            <div className="space-y-3 pt-4 border-t border-[#E8E8E8]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Categories</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[11px] text-rose-600 font-semibold hover:underline">
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex flex-col space-y-1 text-xs">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`py-2 px-3 text-left font-semibold transition-colors flex items-center justify-between border-b border-[#E8E8E8] ${
                    selectedCategory === 'all' ? 'bg-[#111111] text-white' : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5]'
                  }`}
                >
                  <span>All Products</span>
                  {selectedCategory === 'all' && <Check className="h-3.5 w-3.5" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`py-2 px-3 text-left font-semibold transition-colors flex items-center justify-between border-b border-[#E8E8E8] ${
                      selectedCategory === cat.name ? 'bg-[#111111] text-white' : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.name && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase text-[#6B6B6B]">Active Filters:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategory !== 'all' && (
                    <Badge variant="outline" className="text-[10px] rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-[#111111] font-medium">
                      Category: {selectedCategory}
                    </Badge>
                  )}
                  {searchQuery.trim() && (
                    <Badge variant="outline" className="text-[10px] rounded-none bg-[#F7F7F5] border-[#E8E8E8] text-[#111111] font-medium">
                      Search: "{searchQuery}"
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-9">
            <ProductGrid products={products} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-8 space-y-8">
          <Skeleton className="h-10 w-64 rounded-none bg-[#F7F7F5]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-none bg-[#F7F7F5]" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}
