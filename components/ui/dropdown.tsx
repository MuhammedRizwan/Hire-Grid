// components/ui/DropdownMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            'z-50 overflow-hidden',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-colors',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                item.danger && 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};