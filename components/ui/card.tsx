// components/ui/Card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800',
        'transition-all duration-200',
        hover && 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800', className)}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-800', className)}>{children}</div>
);