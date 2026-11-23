import React from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useAgriQuery';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-earth-800 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 sticky top-0 z-40 shadow-md">
      <WifiOff className="w-4 h-4 text-harvest-400 shrink-0" />
      <span>{t('modes.offline_notice')}</span>
    </div>
  );
}
