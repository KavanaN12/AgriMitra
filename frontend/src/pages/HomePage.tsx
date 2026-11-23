import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CloudSun,
  AlertTriangle,
  Users,
  ShoppingBag,
  TrendingUp,
  Droplets,
  Wind,
  ArrowRight,
  Sprout,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import {
  useWeather,
  useAdvisories,
  useMarketListings,
  useCommunityPosts
} from '../hooks/useAgriQuery';

export function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language.startsWith('kn');

  const { data: weather, isLoading: weatherLoading, error: weatherError, refetch: refetchWeather } = useWeather();
  const { data: advisories = [], isLoading: advLoading } = useAdvisories();
  const { data: listings = [], isLoading: marketLoading } = useMarketListings();
  const { data: posts = [], isLoading: postsLoading } = useCommunityPosts();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-agri-800 via-agri-700 to-agri-900 text-white p-6 sm:p-8 shadow-lifted">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase text-agri-100 border border-white/20">
            <Sprout className="w-3.5 h-3.5 text-harvest-300" />
            <span>{isKn ? 'ಮಂಡ್ಯ ಕೃಷಿ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆ' : 'Mandya Pilot • Karnataka'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-normal leading-snug font-kannada">
            {t('home.greeting')}
          </h1>
          <p className="text-sm sm:text-base text-agri-100/90 leading-relaxed">
            {t('home.hero_desc')}
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Button
              onClick={() => navigate('/advisory')}
              variant="secondary"
              size="sm"
              className="bg-white text-agri-900 hover:bg-agri-50 border-0 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 mr-1.5 text-harvest-600" />
              {t('home.view_advisories')}
            </Button>
            <Button
              onClick={() => navigate('/community')}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xs"
            >
              <Users className="w-4 h-4 mr-1.5" />
              {t('home.ask_community')}
            </Button>
            <Button
              onClick={() => navigate('/market')}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xs"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              {t('home.list_produce')}
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-agri-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Grid: Mandya Weather & Agro Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <Card className="lg:col-span-1 bg-gradient-to-b from-white to-agri-50/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-agri-800 uppercase tracking-wider">
                {isKn ? 'ಹವಾಮಾನ' : 'Agro-Climate'}
              </span>
              <Badge variant="success">Mandya Basin</Badge>
            </div>
            <CardTitle className="text-base sm:text-lg">
              {t('home.weather_title')}
            </CardTitle>
          </CardHeader>

          {weatherLoading ? (
            <LoadingState rows={2} />
          ) : weatherError ? (
            <ErrorState onRetry={() => refetchWeather()} />
          ) : weather ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-earth-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-harvest-100/70 text-harvest-700">
                    <CloudSun className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-earth-900">
                      {weather.temperature_c}°C
                    </span>
                    <p className="text-xs text-earth-500">
                      {isKn ? 'ಗರಿಷ್ಠ ತಾಪಮಾನ' : 'Day Temperature'}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1 text-xs text-earth-600">
                  <div className="flex items-center justify-end gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>{weather.humidity_percent}% {isKn ? 'ತೇವಾಂಶ' : 'Humidity'}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Wind className="w-3.5 h-3.5 text-earth-400" />
                    <span>{weather.wind_speed_kmh} km/h</span>
                  </div>
                </div>
              </div>

              {/* Forecast summary */}
              <div className="p-3 rounded-xl bg-earth-50 border border-earth-200/60 text-xs sm:text-sm text-earth-800 leading-relaxed">
                <p className="font-medium text-earth-900 mb-0.5">
                  {isKn ? 'ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ:' : 'Agro-Weather Advisory:'}
                </p>
                <p>{isKn ? weather.forecast_summary_kn : weather.forecast_summary_en}</p>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Critical Alerts & Advisories Preview */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-earth-900">
                {t('home.active_advisories')}
              </h2>
              <p className="text-xs text-earth-500">
                {isKn ? 'ಮದ್ದೂರು ಮತ್ತು ಮಳವಳ್ಳಿ ಕಬ್ಬು, ಭತ್ತದ ಎಚ್ಚರಿಕೆಗಳು' : 'Mandya district crop health alerts'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/advisory')}
              variant="ghost"
              size="sm"
              className="text-agri-800 font-semibold"
            >
              {t('home.view_all')} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {advLoading ? (
            <LoadingState rows={2} />
          ) : advisories.length === 0 ? (
            <p className="text-xs text-earth-500 py-6 text-center">
              {t('common.empty_desc')}
            </p>
          ) : (
            <div className="space-y-3">
              {advisories.slice(0, 2).map(adv => (
                <div
                  key={adv.id}
                  onClick={() => navigate('/advisory')}
                  className="p-3.5 rounded-xl border border-earth-200/80 hover:border-agri-300 hover:bg-agri-50/30 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={adv.severity === 'warning' ? 'warning' : 'info'}>
                        {adv.severity === 'warning' ? t('advisory.warning') : t('advisory.info')}
                      </Badge>
                      {adv.crop && (
                        <span className="text-xs font-semibold text-agri-900">
                          {isKn ? adv.crop.name_kn : adv.crop.name_en}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-earth-400">
                      {new Date(adv.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-earth-900">
                    {isKn ? adv.title_kn : adv.title_en}
                  </h3>
                  <p className="text-xs text-earth-600 line-clamp-2">
                    {isKn ? adv.message_kn : adv.message_en}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Grid: Produce Market Glance & Recent Discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketplace Glance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-earth-900">
                {t('home.market_glance')}
              </h2>
              <p className="text-xs text-earth-500">
                {isKn ? 'ಸ್ಥಳೀಯ ರೈತರ ನೇರ ಮಾರಾಟ ದರಗಳು' : 'Direct Mandya farmer listings'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/market')}
              variant="ghost"
              size="sm"
              className="text-agri-800 font-semibold"
            >
              {t('home.view_all')} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {marketLoading ? (
            <LoadingState rows={2} />
          ) : listings.length === 0 ? (
            <p className="text-xs text-earth-500 py-6 text-center">
              {t('common.empty_desc')}
            </p>
          ) : (
            <div className="divide-y divide-earth-100">
              {listings.slice(0, 3).map(listing => (
                <div
                  key={listing.id}
                  onClick={() => navigate('/market')}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-earth-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm text-earth-900">
                      {isKn ? listing.crop_name_kn : listing.crop_name_en}
                    </p>
                    <p className="text-xs text-earth-500">
                      {listing.variety} • {listing.farmer_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-agri-800">
                      ₹{listing.price_per_unit} / {listing.unit}
                    </p>
                    <span className="text-[11px] text-earth-500">
                      {listing.quantity} {listing.unit} {isKn ? 'ಲಭ್ಯ' : 'available'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Community Discussions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-earth-900">
                {t('home.community_discussions')}
              </h2>
              <p className="text-xs text-earth-500">
                {isKn ? 'ಮದ್ದೂರು ಮತ್ತು ಮಂಡ್ಯ ರೈತರ ಸಮಾಲೋಚನೆಗಳು' : 'Recent farmer forum queries'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/community')}
              variant="ghost"
              size="sm"
              className="text-agri-800 font-semibold"
            >
              {t('home.view_all')} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {postsLoading ? (
            <LoadingState rows={2} />
          ) : posts.length === 0 ? (
            <p className="text-xs text-earth-500 py-6 text-center">
              {t('common.empty_desc')}
            </p>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 2).map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate('/community')}
                  className="p-3 rounded-xl border border-earth-200/70 hover:bg-agri-50/20 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-agri-800">
                      {post.author_name}
                    </span>
                    <span className="text-[10px] text-earth-400">
                      {post.likes_count} {t('community.likes')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-earth-900 line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-earth-600 line-clamp-2">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
