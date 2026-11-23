import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudSun,
  Sprout,
  BookOpen,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useAdvisories, useCrops } from '../hooks/useAgriQuery';
import { AdvisoryItem } from '../types/api';
import { WeatherHero } from '../components/advisory/WeatherHero';
import { SmartRecommendationsWidget } from '../components/advisory/SmartRecommendationsWidget';
import { AdvisoryCard } from '../components/advisory/AdvisoryCard';
import { AdvisoryDetailModal } from '../components/advisory/AdvisoryDetailModal';
import { MyCropsManager } from '../components/crops/MyCropsManager';
import { CropLibrary } from '../components/crops/CropLibrary';
import { DiseaseAssistant } from '../components/advisory/DiseaseAssistant';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export function AdvisoryPage() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const [activeTab, setActiveTab] = useState<'advisory' | 'my_crops' | 'library' | 'disease'>('advisory');

  // Advisory Feed Filters
  const [selectedCropId, setSelectedCropId] = useState<number | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSeverity, setSelectedSeverity] = useState<string | undefined>(undefined);
  const [activeModalItem, setActiveModalItem] = useState<AdvisoryItem | null>(null);

  const { data: crops = [] } = useCrops();
  const {
    data: advisories = [],
    isLoading,
    error,
    refetch
  } = useAdvisories(selectedCropId, selectedCategory, selectedSeverity);

  const tabs = [
    { id: 'advisory', label: t('advisory.tabs_advisory'), icon: CloudSun },
    { id: 'my_crops', label: t('advisory.tabs_my_crops'), icon: Sprout },
    { id: 'library', label: t('advisory.tabs_library'), icon: BookOpen },
    { id: 'disease', label: t('advisory.tabs_disease_assistant'), icon: Sparkles }
  ];

  const categories = [
    { id: undefined, label: t('advisory.category_all') },
    { id: 'irrigation', label: t('advisory.category_irrigation') },
    { id: 'pest', label: t('advisory.category_pest') },
    { id: 'fertilizer', label: t('advisory.category_fertilizer') },
    { id: 'weather', label: t('advisory.category_weather') }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-900 tracking-normal leading-snug font-kannada">
          {t('advisory.title')}
        </h1>
        <p className="text-xs sm:text-sm text-earth-600 mt-1">
          {t('advisory.subtitle')}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-earth-200 overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-agri-700 text-agri-800 bg-agri-50/50'
                  : 'border-transparent text-earth-600 hover:text-earth-900 hover:border-earth-300'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-agri-700' : 'text-earth-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Advisory & Weather Dashboard */}
      {activeTab === 'advisory' && (
        <div className="space-y-6">
          {/* Weather Hero Card */}
          <WeatherHero />

          {/* Smart Rule-Based Recommendations (Irrigation, Operations, Disease) */}
          <SmartRecommendationsWidget />

          {/* Advisories Feed Header & Filters */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-earth-900">
                {isKn ? 'ಸಕ್ರಿಯ ಬೆಳೆ ಎಚ್ಚರಿಕೆಗಳು & ಸಲಹೆಗಳು' : 'Active Field Advisories'}
              </h2>
              {(selectedCropId || selectedCategory || selectedSeverity) && (
                <button
                  onClick={() => {
                    setSelectedCropId(undefined);
                    setSelectedCategory(undefined);
                    setSelectedSeverity(undefined);
                  }}
                  className="text-xs text-agri-700 hover:text-agri-800 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="h-3 w-3" />
                  {isKn ? 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ' : 'Clear Filters'}
                </button>
              )}
            </div>

            {/* Filter Chips Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-earth-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                {isKn ? 'ಬೆಳೆ:' : 'Crop:'}
              </span>

              {/* All Crops Button */}
              <button
                onClick={() => setSelectedCropId(undefined)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedCropId === undefined
                    ? 'bg-agri-700 text-white shadow-xs'
                    : 'bg-white text-earth-700 hover:bg-earth-100 border border-earth-200'
                }`}
              >
                {t('advisory.filter_all')}
              </button>

              {/* Dynamic Crop Filters */}
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    selectedCropId === crop.id
                      ? 'bg-agri-700 text-white shadow-xs'
                      : 'bg-white text-earth-700 hover:bg-earth-100 border border-earth-200'
                  }`}
                >
                  {isKn ? crop.name_kn : crop.name_en}
                </button>
              ))}
            </div>

            {/* Category and Severity Secondary Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-earth-500 mr-1">
                {isKn ? 'ವಿಭಾಗ:' : 'Category:'}
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.id || 'all'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-earth-800 text-white shadow-xs'
                      : 'bg-white text-earth-600 hover:bg-earth-100 border border-earth-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {/* Severity Toggles */}
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setSelectedSeverity(selectedSeverity === 'warning' ? undefined : 'warning')
                  }
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedSeverity === 'warning'
                      ? 'bg-harvest-600 text-white shadow-xs'
                      : 'bg-white text-earth-700 hover:bg-earth-100 border border-earth-200'
                  }`}
                >
                  {t('advisory.warning')}
                </button>
                <button
                  onClick={() =>
                    setSelectedSeverity(selectedSeverity === 'critical' ? undefined : 'critical')
                  }
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedSeverity === 'critical'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-earth-700 hover:bg-earth-100 border border-earth-200'
                  }`}
                >
                  {t('advisory.critical')}
                </button>
              </div>
            </div>
          </div>

          {/* Advisories Grid */}
          {isLoading ? (
            <LoadingState message={t('common.loading')} />
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : advisories.length === 0 ? (
            <EmptyState
              title={t('advisory.no_advisories')}
              description={t('common.empty_desc')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advisories.map((advisory) => (
                <AdvisoryCard
                  key={advisory.id}
                  advisory={advisory}
                  onViewDetails={(item) => setActiveModalItem(item)}
                />
              ))}
            </div>
          )}

          {/* Advisory Detail Modal */}
          <AdvisoryDetailModal
            isOpen={!!activeModalItem}
            onClose={() => setActiveModalItem(null)}
            advisory={activeModalItem}
          />
        </div>
      )}

      {/* TAB 2: My Crops Manager */}
      {activeTab === 'my_crops' && <MyCropsManager />}

      {/* TAB 3: Crop Library */}
      {activeTab === 'library' && <CropLibrary />}

      {/* TAB 4: AI Disease Assistant */}
      {activeTab === 'disease' && <DiseaseAssistant />}
    </div>
  );
}
