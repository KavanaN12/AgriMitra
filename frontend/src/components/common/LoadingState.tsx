import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export function LoadingState({ message, rows = 3 }: LoadingStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-agri-100 border-t-agri-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-agri-700">
          <Sprout className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-earth-700">
        {message || t('common.loading')}
      </p>

      {/* Subtle Skeleton preview lines */}
      <div className="w-full max-w-md space-y-2.5 pt-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-4 bg-earth-200/60 rounded-md animate-pulse"
            style={{ width: `${85 - idx * 15}%`, margin: '0 auto' }}
          />
        ))}
      </div>
    </div>
  );
}
