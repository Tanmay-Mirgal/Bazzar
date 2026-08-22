'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  maxStock,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center rounded-md border border-zinc-200 w-fit bg-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || quantity <= 1}
        className="h-8 w-8 rounded-none rounded-l-md hover:bg-zinc-100 disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>

      <span className="w-10 text-center text-xs font-semibold text-zinc-900 select-none">
        {quantity}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || quantity >= maxStock}
        className="h-8 w-8 rounded-none rounded-r-md hover:bg-zinc-100 disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
