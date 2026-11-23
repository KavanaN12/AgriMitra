import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudSun,
  Sun,
  CloudRain,
  Droplets,
  Wind,
  Calendar,
  Radio,
  Sprout
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useWeatherForecast } from '../../hooks/useAgriQuery';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';

interface WeatherForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  taluk?: string;
}

export function WeatherForecastModal({
  isOpen,
  onClose,
  taluk
}: WeatherForecastModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: forecast, isLoading, error, refetch } = useWeatherForecast(taluk);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('advisory.forecast_title')}
      description={
        forecast
          ? `${forecast.taluk}, Mandya • ${forecast.is_live ? t('advisory.weather_live') : t('advisory.weather_cached')}`
          : undefined
      }
      className="max-w-2xl"
    >
      {isLoading ? (
        <LoadingState message={t('common.loading')} />
      ) : error || !forecast ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="space-y-3.5">
          {/* Data Source Notice */}
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-earth-50 rounded-lg border border-earth-200">
            <span className="flex items-center gap-1.5 text-earth-700 font-medium">
              <Radio className={`h-3 w-3 ${forecast.is_live ? 'text-emerald-500 animate-pulse' : 'text-harvest-500'}`} />
              {forecast.is_live ? 'Open-Meteo High-Resolution Agro Forecast' : 'Mandya Meteorological Seasonal Fallback Model'}
            </span>
            <span className="text-earth-500 font-mono text-[11px]">{forecast.coordinates}</span>
          </div>

          {/* 7-Day List */}
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {(forecast.daily || forecast.forecast_days || []).map((day, idx) => {
              const conditionStr = day.condition || day.condition_en || 'Fair';
              const cond = isKn ? day.condition_kn || conditionStr : day.condition_en || conditionStr;
              const advice = isKn ? day.agro_advice_kn || day.agro_advice : day.agro_advice_en || day.agro_advice;

              const isRain = conditionStr.toLowerCase().includes('rain');
              const isCloud = conditionStr.toLowerCase().includes('cloud');
              const rainMm = day.precipitation_mm ?? day.rainfall_mm ?? 0;

              return (
                <div
                  key={day.date}
                  className={`p-3.5 rounded-xl border transition-all ${
                    idx === 0
                      ? 'bg-agri-50/70 border-agri-200 shadow-xs'
                      : 'bg-white hover:bg-earth-50/70 border-earth-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Date & Day */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-earth-100 text-earth-700 shrink-0">
                        {isRain ? (
                          <CloudRain className="h-5 w-5 text-sky-600" />
                        ) : isCloud ? (
                          <CloudSun className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Sun className="h-5 w-5 text-harvest-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-earth-900">
                            {idx === 0
                              ? (isKn ? 'ಇಂದು' : 'Today')
                              : idx === 1
                              ? (isKn ? 'ನಾಳೆ' : 'Tomorrow')
                              : day.day_of_week || day.day_name_en}
                          </span>
                          <span className="text-xs text-earth-500 font-mono">
                            {day.date}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-earth-600">
                          {cond}
                        </span>
                      </div>
                    </div>

                    {/* Temp & Rainfall */}
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-earth-900">
                        {Math.round(day.temp_max_c)}° / <span className="text-earth-500 font-normal">{Math.round(day.temp_min_c)}°C</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[11px] text-earth-600 mt-0.5">
                        <Droplets className="h-3 w-3 text-sky-500" />
                        <span>{day.precipitation_probability}%</span>
                        {rainMm > 0 && (
                          <span className="font-semibold text-sky-700">({rainMm}mm)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Agro Advice Pill */}
                  {advice && (
                    <div className="mt-2.5 pt-2 border-t border-earth-100/80 flex items-start gap-1.5 text-xs text-agri-900">
                      <Sprout className="h-3.5 w-3.5 text-agri-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{advice}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Dialog>
  );
}
