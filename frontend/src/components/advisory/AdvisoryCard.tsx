import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AdvisoryItem } from '../../types/api';

interface AdvisoryCardProps {
  advisory: AdvisoryItem;
  onViewDetails: (advisory: AdvisoryItem) => void;
}

export function AdvisoryCard({ advisory, onViewDetails }: AdvisoryCardProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});

  const toggleAction = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const title = isKn ? advisory.title_kn || advisory.title_en : advisory.title_en;
  const description = isKn
    ? advisory.description_kn || advisory.message_kn
    : advisory.description_en || advisory.message_en;
  const rawActions = (isKn ? advisory.actions_kn : advisory.actions_en)
    || (advisory.action_items_en ? (isKn && advisory.action_items_kn ? advisory.action_items_kn.split(';') : advisory.action_items_en.split(';')) : []);
  const actions: string[] = Array.isArray(rawActions) ? rawActions : [];
  const cropLabel = advisory.crop_name || (isKn ? advisory.crop?.name_kn : advisory.crop?.name_en) || 'Mandya Crop';

  const severityBadge =
    advisory.severity === 'critical' ? (
      <Badge variant="critical">{t('advisory.critical')}</Badge>
    ) : advisory.severity === 'warning' ? (
      <Badge variant="warning">{t('advisory.warning')}</Badge>
    ) : (
      <Badge variant="info">{t('advisory.info')}</Badge>
    );

  return (
    <Card className="hover:shadow-md transition-all border-earth-200 flex flex-col justify-between">
      <div>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="default" className="font-semibold text-agri-900 bg-agri-100">
                {cropLabel}
              </Badge>
              <Badge variant="outline" className="text-earth-600 capitalize text-xs">
                {advisory.category}
              </Badge>
              {severityBadge}
            </div>

            <span className="text-[11px] text-earth-500 flex items-center gap-1 font-mono">
              <Calendar className="h-3 w-3" />
              {advisory.valid_until}
            </span>
          </div>

          <CardTitle className="text-base sm:text-lg text-earth-900 leading-snug">
            {title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-earth-700 mt-1 line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>

        {/* Action items preview with interactive checkboxes */}
        {actions && actions.length > 0 && (
          <div className="px-5 pb-2">
            <div className="text-xs font-semibold text-earth-600 mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-agri-600" />
              <span>{t('advisory.action_items')}:</span>
            </div>
            <div className="space-y-1.5 bg-earth-50/80 p-2.5 rounded-xl border border-earth-100">
              {actions.slice(0, 3).map((act, idx) => {
                const isChecked = !!checkedActions[idx];
                return (
                  <div
                    key={idx}
                    onClick={(e) => toggleAction(idx, e)}
                    className="flex items-start gap-2 text-xs text-earth-800 cursor-pointer select-none group"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-earth-400 group-hover:text-agri-600 shrink-0"
                      aria-label="Toggle task"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-3.5 w-3.5 text-agri-600" />
                      ) : (
                        <Square className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <span className={`leading-relaxed text-[11px] ${isChecked ? 'line-through text-earth-400' : ''}`}>
                      {act}
                    </span>
                  </div>
                );
              })}
              {actions.length > 3 && (
                <p className="text-[10px] text-earth-500 font-medium pt-0.5">
                  +{actions.length - 3} {isKn ? 'ಇನ್ನಷ್ಟು ಕ್ರಮಗಳು' : 'more action items...'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with Source & Detail button */}
      <div className="px-5 py-3 border-t border-earth-100 flex items-center justify-between gap-2 mt-2">
        <div className="text-[11px] text-earth-500 truncate flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-agri-600 shrink-0" />
          <span className="truncate">{advisory.source_reference || 'UAS Bangalore / KVK Mandya'}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(advisory)}
          className="text-xs text-agri-700 hover:text-agri-800 hover:bg-agri-50 shrink-0 font-medium"
        >
          {t('advisory.view_details')}
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
