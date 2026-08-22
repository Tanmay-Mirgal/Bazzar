'use client';

import * as React from 'react';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div>
      {/* Desktop Pills Filter */}
      <div className="hidden md:flex flex-wrap gap-2 items-center">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory('all')}
          className="rounded-full text-xs font-medium h-8 px-4"
        >
          All Products
        </Button>

        {categories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <Button
              key={cat.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectCategory(cat.name)}
              className="rounded-full text-xs font-medium h-8 px-4"
            >
              {cat.name}
            </Button>
          );
        })}
      </div>

      {/* Mobile Select Dropdown */}
      <div className="md:hidden w-full">
        <Select
          value={selectedCategory}
          onValueChange={(val) => onSelectCategory(val)}
        >
          <SelectTrigger className="w-full h-10 text-xs">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
