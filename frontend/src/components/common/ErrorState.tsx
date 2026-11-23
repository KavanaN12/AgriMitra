import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/60 rounded-2xl border border-red-200">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900 mb-1">
        {title || t('common.error_title')}
      </h3>
      <p className="text-xs sm:text-sm text-red-700 max-w-sm mb-4">
        {message || 'An error occurred while fetching information.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="border-red-200 text-red-800 hover:bg-red-100">
          <RefreshCw className="w-4 h-4 mr-1.5" />
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
