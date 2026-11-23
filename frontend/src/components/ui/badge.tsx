import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'critical' | 'destructive' | 'info' | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-earth-100 text-earth-800 border-earth-300',
    secondary: 'bg-forest-100 text-forest-800 border-forest-200',
    success: 'bg-forest-100 text-forest-800 border-forest-200',
    warning: 'bg-harvest-100 text-harvest-800 border-harvest-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    outline: 'border border-earth-300 text-earth-700 bg-transparent'
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
