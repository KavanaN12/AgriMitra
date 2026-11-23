import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Droplets,
  Wind,
  Bug,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAdvisoryRecommendations } from '../../hooks/useAgriQuery';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function SmartRecommendationsWidget() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { data: recs = [], isLoading, error } = useAdvisoryRecommendations();

  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-earth-200 animate-pulse space-y-3">
        <div className="h-4 bg-earth-200 rounded w-1/3"></div>
        <div className="h-16 bg-earth-100 rounded-xl"></div>
      </div>
    );
  }

  if (error || recs.length === 0) {
    return null;
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-earth-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-harvest-600" />
          {t('advisory.smart_recommendations')}
        </h2>
        <Badge variant="outline" className="text-agri-700 border-agri-300 bg-agri-50 text-[11px]">
          Rule-Based AI Engine
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {recs.map((rec, index) => {
          const title = isKn ? rec.title_kn || rec.title_en : rec.title_en;
          const summary = isKn ? rec.summary_kn || rec.summary_en : rec.summary_en;
          const explanation = isKn ? rec.explanation_kn || rec.explanation_en : rec.explanation_en;
          const isExpanded = expandedIndex === index;

          const recType = rec.type || rec.recommendation_type;
          const isIrrigation = recType === 'irrigation';
          const isOperations = recType === 'operation';
          const urgency = rec.urgency || (rec.severity === 'critical' ? 'high' : rec.severity === 'warning' ? 'medium' : 'low');
          const cropName = rec.crop_name || (isKn ? rec.crop_name_kn : rec.crop_name_en);

          const icon = isIrrigation ? (
            <Droplets className="h-5 w-5 text-sky-600" />
          ) : isOperations ? (
            <Wind className="h-5 w-5 text-emerald-600" />
          ) : (
            <Bug className="h-5 w-5 text-harvest-600" />
          );

          const borderColor = urgency === 'high'
            ? 'border-red-200 bg-red-50/20'
            : urgency === 'medium'
            ? 'border-harvest-200 bg-harvest-50/20'
            : 'border-agri-200 bg-agri-50/20';

          return (
            <div
              key={index}
              className={`p-4 rounded-2xl bg-white border transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${borderColor}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-earth-100/80 shrink-0">
                      {icon}
                    </div>
                    <div>
                      {cropName && (
                        <span className="text-[11px] font-semibold text-agri-700 uppercase tracking-wider block">
                          {cropName}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-earth-900 leading-snug">
                        {title}
                      </h3>
                    </div>
                  </div>

                  <Badge
                    variant={
                      urgency === 'high'
                        ? 'critical'
                        : urgency === 'medium'
                        ? 'warning'
                        : 'outline'
                    }
                    className="shrink-0 text-[10px]"
                  >
                    {urgency}
                  </Badge>
                </div>

                <p className="text-xs text-earth-700 leading-relaxed mt-1">
                  {summary}
                </p>

                {/* Expandable Agronomic Reasoning */}
                {isExpanded && explanation && (
                  <div className="mt-3 p-3 rounded-xl bg-earth-50 border border-earth-200 text-xs text-earth-800 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 font-semibold text-agri-800">
                      <Info className="h-3.5 w-3.5 text-agri-600 shrink-0" />
                      <span>{t('advisory.explanation')}</span>
                    </div>
                    <p className="leading-relaxed text-[11px] text-earth-700">
                      {explanation}
                    </p>
                    {rec.source_reference && (
                      <div className="pt-1.5 border-t border-earth-200/80 flex items-center gap-1 text-[10px] text-earth-500 font-medium">
                        <ShieldCheck className="h-3 w-3 text-agri-600 shrink-0" />
                        <span>{t('advisory.source')}: {rec.source_reference}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Toggle reasoning button */}
              <div className="mt-3 pt-2.5 border-t border-earth-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpand(index)}
                  className="text-xs font-semibold text-agri-700 hover:text-agri-800 flex items-center gap-1 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>{isKn ? 'ವಿವರಣೆ ಮರೆಮಾಡಿ' : 'Hide Reasoning'}</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>{isKn ? 'ವೈಜ್ಞಾನಿಕ ವಿವರಣೆ' : 'Why this recommendation?'}</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                {rec.action_required && (
                  <span className="text-[10px] font-semibold text-harvest-700 bg-harvest-100 px-2 py-0.5 rounded-full">
                    {isKn ? 'ಕ್ರಮ ಅಗತ್ಯ' : 'Action Needed'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
