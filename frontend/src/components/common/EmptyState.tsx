import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout } from 'lucide-react';
import { Button } from '../ui/button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-earth-300">
      <div className="w-14 h-14 rounded-2xl bg-agri-50 text-agri-700 flex items-center justify-center mb-4">
        {icon || <Sprout className="w-7 h-7" />}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-earth-900 mb-1">
        {title || t('common.empty_title')}
      </h3>
      <p className="text-xs sm:text-sm text-earth-600 max-w-sm mb-6">
        {description || t('common.empty_desc')}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
