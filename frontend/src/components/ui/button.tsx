import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agri-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-forest-700 text-white hover:bg-forest-800 shadow-sm active:bg-forest-900 border border-forest-800/30',
      secondary: 'bg-forest-100 text-forest-900 hover:bg-forest-200 border border-forest-300 font-semibold',
      outline: 'border border-earth-300 bg-white hover:bg-earth-100 text-earth-800 hover:text-earth-950 font-medium shadow-xs',
      ghost: 'hover:bg-forest-50 text-forest-800 hover:text-forest-950 font-medium',
      danger: 'bg-red-700 text-white hover:bg-red-800 shadow-sm'
    };

    // Mobile touch target: minimum 44px for standard buttons
    const sizes = {
      sm: 'min-h-[38px] px-3 py-1.5 text-xs',
      md: 'min-h-[46px] px-4 py-2.5 text-sm',
      lg: 'min-h-[52px] px-6 py-3 text-base font-semibold'
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseClasses, variants[variant], sizes[size], className))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
