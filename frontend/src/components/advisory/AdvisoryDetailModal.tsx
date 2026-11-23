import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AdvisoryItem } from '../../types/api';

interface AdvisoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  advisory: AdvisoryItem | null;
}

export function AdvisoryDetailModal({
  isOpen,
  onClose,
  advisory
}: AdvisoryDetailModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  if (!advisory) return null;

  const title = isKn ? advisory.title_kn || advisory.title_en : advisory.title_en;
  const description = isKn
    ? advisory.description_kn || advisory.message_kn
    : advisory.description_en || advisory.message_en;
  const rawActions = (isKn ? advisory.actions_kn : advisory.actions_en)
    || (advisory.action_items_en ? (isKn && advisory.action_items_kn ? advisory.action_items_kn.split(';') : advisory.action_items_en.split(';')) : []);
  const actions: string[] = Array.isArray(rawActions) ? rawActions : [];
  const explanation = isKn ? advisory.explanation_kn || advisory.explanation_en : advisory.explanation_en;
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={`${cropLabel} • ${advisory.category}`}
      className="max-w-xl"
    >
      <div className="space-y-4">
        {/* Top Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-earth-100">
          <div className="flex items-center gap-2">
            {severityBadge}
            <Badge variant="outline" className="capitalize text-xs">
              {advisory.category}
            </Badge>
            {advisory.is_personalized && (
              <Badge variant="outline" className="text-agri-700 border-agri-300 bg-agri-50 text-[10px]">
                {isKn ? 'ವೈಯಕ್ತಿಕ ಶಿಫಾರಸು' : 'Personalized'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-earth-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{t('advisory.valid_until')}: {advisory.valid_until}</span>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="text-sm text-earth-800 leading-relaxed bg-earth-50/70 p-3.5 rounded-xl border border-earth-200">
          {description}
        </div>

        {/* Recommended Actions */}
        {actions && actions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-earth-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-agri-600" />
              {t('advisory.checklist')}
            </h4>
            <div className="space-y-1.5 bg-agri-50/40 p-3 rounded-xl border border-agri-200/80">
              {actions.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-earth-800">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-agri-600 text-[10px] font-bold text-white mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agronomic Explanation */}
        {explanation && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-earth-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-harvest-600" />
              {t('advisory.explanation')}
            </h4>
            <p className="text-xs text-earth-700 leading-relaxed bg-harvest-50/40 p-3 rounded-xl border border-harvest-200/80">
              {explanation}
            </p>
          </div>
        )}

        {/* Scientific Source & Local Contact */}
        <div className="rounded-xl bg-earth-100 p-3 text-xs text-earth-700 space-y-2">
          <div className="flex items-center gap-1.5 font-medium text-earth-900">
            <ShieldCheck className="h-4 w-4 text-agri-700" />
            <span>{t('advisory.source')}:</span>
            <span className="font-semibold">{advisory.source_reference || 'UAS Bangalore / ICAR-KVK Mandya'}</span>
          </div>
          <div className="text-[11px] text-earth-600 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-earth-500 shrink-0" />
            <span>
              {isKn
                ? 'ಸಂದೇಹಗಳಿದ್ದರೆ ನಿಮ್ಮ ತಾಲೂಕಿನ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ (RSK) ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ ಮಂಡ್ಯ (V.C. Farm) ಸಂಪರ್ಕಿಸಿ.'
                : 'For field queries, contact your taluk Raitha Samparka Kendra (RSK) or KVK Mandya (V.C. Farm).'}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="px-5">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
