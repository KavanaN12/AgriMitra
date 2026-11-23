import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Droplets,
  Layers,
  Bug,
  Sprout,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Crop } from '../../types/api';

interface CropDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: Crop | null;
}

export function CropDetailModal({ isOpen, onClose, crop }: CropDetailModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');
  const [activeTab, setActiveTab] = useState<'timeline' | 'requirements' | 'pests'>('timeline');

  if (!crop) return null;

  const name = isKn ? crop.name_kn : crop.name_en;
  const description = isKn ? crop.description_kn || crop.description_en : crop.description_en;
  const soilReq = isKn ? crop.soil_requirements_kn || crop.soil_requirements_en : crop.soil_requirements_en;
  const waterReq = isKn ? crop.water_requirements_kn || crop.water_requirements_en : crop.water_requirements_en;
  const irrigationGuide = isKn ? crop.irrigation_guidance_kn || crop.irrigation_guidance_en : crop.irrigation_guidance_en;

  let rawGrowthStages: any[] = [];
  try {
    rawGrowthStages = crop.growth_stages || (crop.growth_stages_json ? JSON.parse(crop.growth_stages_json) : []);
  } catch (e) {
    rawGrowthStages = [];
  }
  const growthStages: any[] = Array.isArray(rawGrowthStages) ? rawGrowthStages : [];

  let rawPests: any[] = [];
  try {
    rawPests = crop.pests_diseases || (crop.pests_diseases_json ? JSON.parse(crop.pests_diseases_json) : []);
  } catch (e) {
    rawPests = [];
  }
  const pests: any[] = Array.isArray(rawPests) ? rawPests : [];

  const durationDays = crop.duration_days ?? crop.typical_duration_days ?? 120;
  const season = crop.season_en ?? crop.seasonality ?? 'Kharif / Rabi';
  const sciName = crop.scientific_name ? ` (${crop.scientific_name})` : '';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${name}${sciName}`}
      description={`${crop.category} • ${season} • ${durationDays} days`}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Description Banner */}
        {description && (
          <p className="text-xs sm:text-sm text-earth-700 leading-relaxed bg-earth-50 p-3.5 rounded-xl border border-earth-200">
            {description}
          </p>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-earth-200 pb-1 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-agri-700 text-white shadow-xs'
                : 'text-earth-600 hover:text-earth-900 hover:bg-earth-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {t('advisory.crop_timeline')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requirements')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'requirements'
                ? 'bg-agri-700 text-white shadow-xs'
                : 'text-earth-600 hover:text-earth-900 hover:bg-earth-100'
            }`}
          >
            <Droplets className="h-3.5 w-3.5" />
            {t('advisory.water_need')} & {t('advisory.soil_need')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pests')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'pests'
                ? 'bg-agri-700 text-white shadow-xs'
                : 'text-earth-600 hover:text-earth-900 hover:bg-earth-100'
            }`}
          >
            <Bug className="h-3.5 w-3.5" />
            {t('advisory.common_pests')}
          </button>
        </div>

        {/* Tab 1: Growth Stage Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {growthStages.length === 0 ? (
              <p className="text-xs text-earth-500 italic py-4 text-center">
                {isKn ? 'ಹಂತಗಳ ವಿವರ ಲಭ್ಯವಿಲ್ಲ' : 'No growth stage details available.'}
              </p>
            ) : (
              growthStages.map((stage: any, idx: number) => {
                const stageName = isKn
                  ? stage.stage_kn || stage.stage_name_kn || stage.stage || stage.stage_name_en
                  : stage.stage || stage.stage_name_en || stage.stage_kn;
                const practicesRaw = (isKn ? stage.practices_kn : stage.practices_en) || stage.key_practices || stage.practices_en || stage.practices_kn;
                const practices = Array.isArray(practicesRaw) ? practicesRaw : practicesRaw ? [practicesRaw] : [];
                const durationLabel = stage.duration_days
                  ? `${stage.duration_days} ${isKn ? 'ದಿನಗಳು' : 'days'}`
                  : stage.start_day !== undefined && stage.end_day !== undefined
                  ? `${stage.start_day} - ${stage.end_day} ${isKn ? 'ದಿನಗಳು' : 'days'}`
                  : null;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-earth-200 bg-white shadow-xs hover:border-agri-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-agri-100 text-agri-800 text-xs font-bold">
                          {stage.stage_order || idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-earth-900">
                          {stageName}
                        </h4>
                      </div>
                      {durationLabel && (
                        <Badge variant="outline" className="text-xs font-mono bg-earth-50">
                          {durationLabel}
                        </Badge>
                      )}
                    </div>

                    {practices.length > 0 && (
                      <div className="mt-2 space-y-1 bg-agri-50/50 p-2.5 rounded-lg border border-agri-100">
                        <span className="text-[11px] font-semibold text-agri-800 uppercase tracking-wider block">
                          {t('advisory.key_practices')}:
                        </span>
                        {practices.map((prac: any, pIdx: number) => (
                          <div key={pIdx} className="flex items-start gap-1.5 text-xs text-earth-700">
                            <span className="text-agri-600 font-bold">•</span>
                            <span className="leading-relaxed">{prac}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Requirements */}
        {activeTab === 'requirements' && (
          <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
            {soilReq && (
              <div className="p-3.5 rounded-xl border border-earth-200 bg-white">
                <h4 className="text-xs font-bold text-earth-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Layers className="h-4 w-4 text-harvest-700" />
                  {t('advisory.soil_need')}
                </h4>
                <p className="text-xs text-earth-700 leading-relaxed">
                  {soilReq}
                </p>
              </div>
            )}

            {waterReq && (
              <div className="p-3.5 rounded-xl border border-earth-200 bg-white">
                <h4 className="text-xs font-bold text-earth-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Droplets className="h-4 w-4 text-sky-600" />
                  {t('advisory.water_need')}
                </h4>
                <p className="text-xs text-earth-700 leading-relaxed">
                  {waterReq}
                </p>
              </div>
            )}

            {irrigationGuide && (
              <div className="p-3.5 rounded-xl border border-earth-200 bg-agri-50/60">
                <h4 className="text-xs font-bold text-agri-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Sprout className="h-4 w-4 text-agri-700" />
                  {t('advisory.irrigation_technique')}
                </h4>
                <p className="text-xs text-earth-800 leading-relaxed">
                  {irrigationGuide}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pests & Diseases */}
        {activeTab === 'pests' && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {pests.length === 0 ? (
              <p className="text-xs text-earth-500 italic py-4 text-center">
                {isKn ? 'ಕೀಟ ಮಾಹಿತಿಗಳು ಲಭ್ಯವಿಲ್ಲ' : 'No pest details available.'}
              </p>
            ) : (
              pests.map((item: any, idx: number) => {
                const pestName = isKn
                  ? item.pest_kn || item.name_kn || item.pest_name || item.name_en
                  : item.pest_name || item.name_en || item.pest_kn;
                const symptoms = isKn
                  ? item.symptoms_kn || item.symptoms || item.symptoms_en
                  : item.symptoms || item.symptoms_en || item.symptoms_kn;
                const management = isKn
                  ? item.management_kn || item.management || item.management_en
                  : item.management || item.management_en || item.management_kn;

                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-earth-200 bg-white space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-earth-900 flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-harvest-600" />
                        {pestName}
                      </h4>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {item.type || 'Pest / Disease'}
                      </Badge>
                    </div>

                    {symptoms && (
                      <div className="text-xs text-earth-700">
                        <span className="font-semibold text-earth-900">{t('advisory.symptoms')}: </span>
                        <span>{symptoms}</span>
                      </div>
                    )}

                    {management && (
                      <div className="text-xs text-agri-900 bg-agri-50/60 p-2.5 rounded-lg border border-agri-100">
                        <span className="font-semibold text-agri-800">{t('advisory.management')}: </span>
                        <span>{management}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
