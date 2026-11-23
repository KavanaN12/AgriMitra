import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  CalendarDays,
  Radio,
  Zap,
  Info
} from 'lucide-react';
import { useWeather } from '../../hooks/useAgriQuery';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { WeatherForecastModal } from './WeatherForecastModal';

interface WeatherHeroProps {
  taluk?: string;
}

export function WeatherHero({ taluk }: WeatherHeroProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');
  const [forecastOpen, setForecastOpen] = useState(false);

  const { data: weather, isLoading, error } = useWeather(taluk);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-agri-800 to-agri-950 p-6 text-white shadow-lg animate-pulse min-h-[160px] flex items-center justify-center">
        <p className="text-sm text-agri-200">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl bg-earth-100 p-5 border border-earth-200 text-earth-700">
        <p className="text-sm font-medium">{t('common.error_title')}</p>
      </div>
    );
  }

  const isLive = weather.is_live ?? (weather.source?.toLowerCase().includes('open-meteo') ?? false);
  const conditionStr = weather.condition || weather.forecast_summary_en || 'Partly Cloudy';
  const conditionLabel = isKn
    ? weather.condition_kn || weather.forecast_summary_kn || conditionStr
    : weather.condition_en || weather.forecast_summary_en || conditionStr;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-agri-800 via-agri-900 to-earth-900 p-5 sm:p-6 text-white shadow-lg border border-agri-700/50">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-agri-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-36 h-36 rounded-full bg-harvest-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Main Temp & Condition */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-harvest-300 shadow-inner shrink-0">
              {conditionStr.toLowerCase().includes('rain') ? (
                <CloudRain className="h-9 w-9 sm:h-11 sm:w-11" />
              ) : conditionStr.toLowerCase().includes('cloud') ? (
                <CloudSun className="h-9 w-9 sm:h-11 sm:w-11" />
              ) : (
                <Sun className="h-9 w-9 sm:h-11 sm:w-11" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {Math.round(weather.temperature_c)}°C
                </span>
                <span className="text-base sm:text-lg font-medium text-agri-100">
                  {conditionLabel}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-agri-200">
                <span>{weather.taluk || taluk || 'Mandya Taluk'}, Mandya</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Radio className={`h-3 w-3 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-harvest-400'}`} />
                  {isLive ? t('advisory.weather_live') : t('advisory.weather_cached')}
                </span>
              </div>
            </div>
          </div>

          {/* Key Weather Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex flex-col">
              <span className="text-[11px] text-agri-200 flex items-center gap-1 font-medium">
                <CloudRain className="h-3 w-3 text-sky-300" />
                {t('advisory.rainfall_prob')}
              </span>
              <span className="text-sm font-bold text-white mt-0.5">
                {weather.precipitation_probability ?? 20}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-agri-200 flex items-center gap-1 font-medium">
                <Droplets className="h-3 w-3 text-cyan-300" />
                {t('advisory.humidity')}
              </span>
              <span className="text-sm font-bold text-white mt-0.5">
                {weather.humidity_percent ?? weather.humidity_pct ?? 65}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-agri-200 flex items-center gap-1 font-medium">
                <Wind className="h-3 w-3 text-emerald-300" />
                {t('advisory.wind_speed')}
              </span>
              <span className="text-sm font-bold text-white mt-0.5">
                {weather.wind_speed_kmh} km/h
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-agri-200 flex items-center gap-1 font-medium">
                <Zap className="h-3 w-3 text-amber-300" />
                {t('advisory.uv_index')}
              </span>
              <span className="text-sm font-bold text-white mt-0.5">
                {weather.uv_index ?? 7.2}
              </span>
            </div>
          </div>

          {/* Action button: 7-day forecast */}
          <div className="flex sm:justify-end">
            <Button
              onClick={() => setForecastOpen(true)}
              variant="secondary"
              className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border-white/20 font-medium text-xs sm:text-sm py-2 px-4 shadow-sm backdrop-blur-md"
            >
              <CalendarDays className="h-4 w-4 mr-1.5 text-harvest-300" />
              {t('advisory.forecast_7day')}
            </Button>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Modal */}
      <WeatherForecastModal
        isOpen={forecastOpen}
        onClose={() => setForecastOpen(false)}
        taluk={taluk}
      />
    </>
  );
}
