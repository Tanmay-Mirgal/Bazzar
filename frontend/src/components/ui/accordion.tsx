'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-[#E8E8E8] py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#3F46D8] transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 text-[#6B6B6B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pt-3 text-xs text-[#6B6B6B] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
