import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Sprout,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useCrops } from '../../hooks/useAgriQuery';
import { Crop } from '../../types/api';
import { CropDetailModal } from './CropDetailModal';

export function CropLibrary() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  const { data: crops = [], isLoading, error } = useCrops();

  const categories = [
    { id: 'all', label: t('advisory.category_all') },
    { id: 'commercial', label: t('advisory.category_commercial') },
    { id: 'cereal', label: t('advisory.category_cereal') },
    { id: 'horticulture', label: t('advisory.category_horticulture') },
    { id: 'vegetable', label: t('advisory.category_vegetable') }
  ];

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (crop.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchEn = crop.name_en.toLowerCase().includes(q);
        const matchKn = crop.name_kn.toLowerCase().includes(q);
        const matchSci = crop.scientific_name ? crop.scientific_name.toLowerCase().includes(q) : false;
        if (!matchEn && !matchKn && !matchSci) {
          return false;
        }
      }

      return true;
    });
  }, [crops, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-earth-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-agri-700" />
            {isKn ? 'ಮಂಡ್ಯ ಬೆಳೆ ಮಾಹಿತಿ ಕೋಶ' : 'Mandya Crop Knowledge Library'}
          </h2>
          <p className="text-xs sm:text-sm text-earth-600 mt-0.5">
            {isKn
              ? 'ಪ್ರಮುಖ ಕೃಷಿ ಬೆಳೆಗಳ ಬೆಳವಣಿಗೆ ಹಂತಗಳು, ಮಣ್ಣು-ನೀರು ನಿರ್ವಹಣೆ ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣ ಸೂತ್ರಗಳು'
              : 'Agronomic growth schedules, soil-water dynamics, and IPM pest guidelines for Mandya crops.'}
          </p>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isKn
                ? 'ಬೆಳೆ ಹೆಸರು ಹುಡುಕಿ (ಉದಾ: ಕಬ್ಬು, ಭತ್ತ, ರಾಗಿ, Tomato)...'
                : 'Search crops by common or scientific name (e.g. Sugarcane, Ragi, Paddy)...'
            }
            className="pl-10 text-xs sm:text-sm bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-agri-700 text-white border-agri-700 shadow-xs'
                  : 'bg-white text-earth-700 border-earth-200 hover:bg-earth-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crops Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-earth-100 animate-pulse" />
          ))}
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-earth-300 text-center bg-white">
          <p className="text-sm font-medium text-earth-700">
            {isKn ? 'ಯಾವುದೇ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No crops found matching your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop) => {
            const name = isKn ? crop.name_kn : crop.name_en;
            const desc = isKn ? crop.description_kn || crop.description_en : crop.description_en;

            return (
              <Card
                key={crop.id}
                className="hover:shadow-md transition-all border-earth-200 flex flex-col justify-between hover:border-agri-300 group"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="default" className="capitalize text-xs font-semibold text-agri-800 bg-agri-100">
                      {crop.category}
                    </Badge>
                    <span className="text-[11px] text-earth-500 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {crop.duration_days ?? crop.typical_duration_days ?? 120} {isKn ? 'ದಿನಗಳು' : 'days'}
                    </span>
                  </div>

                  <CardTitle className="text-base sm:text-lg text-earth-900 group-hover:text-agri-800 transition-colors">
                    {name}
                  </CardTitle>
                  {crop.scientific_name && (
                    <p className="text-xs font-mono italic text-earth-500">
                      {crop.scientific_name}
                    </p>
                  )}

                  <CardDescription className="text-xs text-earth-700 mt-2 line-clamp-3 leading-relaxed">
                    {desc}
                  </CardDescription>
                </CardHeader>

                <div className="px-5 py-3 border-t border-earth-100 flex items-center justify-between mt-2">
                  <div className="text-[11px] text-earth-600 flex items-center gap-1 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-harvest-600" />
                    <span>{crop.season_en ?? crop.seasonality ?? 'Kharif / Rabi'}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCrop(crop)}
                    className="text-xs text-agri-700 hover:text-agri-800 hover:bg-agri-50 font-semibold"
                  >
                    {isKn ? 'ಸಂಪೂರ್ಣ ಮಾಹಿತಿ' : 'Growth Guide'}
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Crop Growth & IPM Guide Dialog */}
      <CropDetailModal
        isOpen={!!selectedCrop}
        onClose={() => setSelectedCrop(null)}
        crop={selectedCrop}
      />
    </div>
  );
}
