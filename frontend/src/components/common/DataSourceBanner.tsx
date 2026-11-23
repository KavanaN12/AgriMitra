import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { useHealth } from '../../hooks/useAgriQuery';

export function DataSourceBanner() {
  const { t } = useTranslation();
  const { data: health, isLoading } = useHealth();
  const [showDetails, setShowDetails] = useState(false);

  // If health environment is demo-msw or default vite msw
  const isMsw = !health || health.environment === 'demo-msw';

  return (
    <div className="bg-earth-100 border-b border-earth-200/80 px-3 sm:px-4 py-1 text-xs text-earth-700 font-kannada select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isMsw ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-harvest-100 text-harvest-800 font-medium border border-harvest-200 text-[11px] whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-harvest-600 shrink-0" />
              <span>{t('modes.demo_badge')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-forest-100 text-forest-900 font-semibold border border-forest-200 text-[11px] whitespace-nowrap">
              <ShieldCheck className="w-3 h-3 text-forest-700 shrink-0" />
              <span>{t('modes.live_badge')}</span>
            </span>
          )}

          <span className="hidden sm:inline text-earth-600 text-xs leading-normal">
            {isMsw ? t('modes.demo_tooltip') : t('modes.live_tooltip')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-earth-500 hidden md:inline">
            Pilot: Mandya (Karnataka) • v0.1.0
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[11px] text-agri-800 hover:text-agri-950 font-medium underline"
            title="Data connection details"
          >
            <Info className="w-3 h-3" />
            <span>Info</span>
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-earth-200 text-xs text-earth-700 space-y-1">
          <p>
            <strong>Backend Connection:</strong> {isLoading ? 'Checking...' : health?.database || 'MSW Service Worker Active'}
          </p>
          <p className="text-[11px] text-earth-500">
            In demonstration mode, all queries and mutations interact with Mock Service Worker running directly in your browser with realistic Mandya district records. In Docker/Render, it communicates with the FastAPI service.
          </p>
        </div>
      )}
    </div>
  );
}
