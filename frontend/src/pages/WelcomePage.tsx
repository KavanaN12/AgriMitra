import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  AlertTriangle,
  Users,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe2
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export function WelcomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const isKn = i18n.language.startsWith('kn');

  const setLanguage = (lang: 'kn' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('agrimitra_language', lang);
  };

  const features = [
    {
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      titleEn: 'Smart Crop Advisory',
      titleKn: 'ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಸಲಹೆ',
      descEn: 'Timely weather alerts, pest warnings and scientific cultivation guidance for Mandya crops.',
      descKn: 'ಮಂಡ್ಯದ ಕಬ್ಬು, ಭತ್ತ, ರಾಗಿ ಬೆಳೆಗಳಿಗೆ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಹಾಗೂ ಕೀಟಬಾಧೆ ನಿಯಂತ್ರಣ ಸಲಹೆಗಳು.'
    },
    {
      icon: Users,
      color: 'bg-agri-100 text-agri-800 border-agri-200',
      titleEn: 'Farmer Community',
      titleKn: 'ರೈತರ ಸಂಘ ಮತ್ತು ವೇದಿಕೆ',
      descEn: 'Connect with fellow farmers across Mandya taluks, share knowledge and discuss mandi trends.',
      descKn: 'ಮಂಡ್ಯದ ಎಲ್ಲಾ ತಾಲೂಕುಗಳ ರೈತರೊಂದಿಗೆ ಸಂವಾದ, ಕೃಷಿ ಅನುಭವಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಚರ್ಚೆ.'
    },
    {
      icon: ShoppingBag,
      color: 'bg-harvest-100 text-harvest-800 border-harvest-200',
      titleEn: 'Farmer-to-Buyer Connect',
      titleKn: 'ನೇರ ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕ',
      descEn: 'List your harvest directly to local buyers and traders with zero middleman commissions.',
      descKn: 'ಮಧ್ಯವರ್ತಿಗಳ ಕಮಿಷನ್ ಇಲ್ಲದೆ ಮಂಡಿ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಗ್ರಾಹಕರಿಗೆ ನೇರವಾಗಿ ಬೆಳೆ ಮಾರಾಟ.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Hero Welcome Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-agri-700 text-white flex items-center justify-center mx-auto shadow-md">
          <Sprout className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-earth-900 tracking-normal leading-snug font-kannada">
          {t('auth.welcome_title')}
        </h1>
        <p className="text-base sm:text-lg text-earth-600 max-w-2xl mx-auto">
          {t('auth.welcome_subtitle')}
        </p>
      </div>

      {/* Language Selection Card */}
      <Card className="p-5 sm:p-6 border-earth-200 bg-white shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Globe2 className="w-5 h-5 text-agri-700" />
          <h2 className="text-base sm:text-lg font-bold text-earth-900">
            {t('auth.select_preferred_language')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => setLanguage('kn')}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              isKn
                ? 'border-agri-600 bg-agri-50 text-agri-950 shadow-xs'
                : 'border-earth-200 hover:border-earth-300 bg-white text-earth-800'
            }`}
          >
            <div className="text-left">
              <p className="font-bold text-base sm:text-lg">ಕನ್ನಡ (Kannada)</p>
              <p className="text-xs text-earth-500">ಮಂಡ್ಯ ರೈತರಿಗಾಗಿ ಕನ್ನಡ ಭಾಷೆ</p>
            </div>
            {isKn && <CheckCircle2 className="w-6 h-6 text-agri-600" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              !isKn
                ? 'border-agri-600 bg-agri-50 text-agri-950 shadow-xs'
                : 'border-earth-200 hover:border-earth-300 bg-white text-earth-800'
            }`}
          >
            <div className="text-left">
              <p className="font-bold text-base sm:text-lg">English</p>
              <p className="text-xs text-earth-500">Standard English interface</p>
            </div>
            {!isKn && <CheckCircle2 className="w-6 h-6 text-agri-600" />}
          </button>
        </div>
      </Card>

      {/* Three Integrated Modules Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-5 flex flex-col justify-between space-y-3 border-earth-200 bg-white">
              <div className="space-y-2.5">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-earth-900">
                  {isKn ? item.titleKn : item.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-earth-600 leading-relaxed">
                  {isKn ? item.descKn : item.descEn}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pilot Scope & Action Buttons */}
      <Card className="p-6 sm:p-8 bg-earth-900 text-white shadow-md border-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-800/80 border border-agri-600/50 text-xs font-semibold text-agri-200">
              <ShieldCheck className="w-3.5 h-3.5 text-agri-400" />
              <span>{isKn ? 'ಮಂಡ್ಯ ಪ್ರಾಯೋಗಿಕ ಆವೃತ್ತಿ' : 'Mandya Pilot Edition'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {isKn ? 'ನಿಮ್ಮ ಕೃಷಿ ಪಯಣವನ್ನು ಇಂದೇ ಆರಂಭಿಸಿ' : 'Join Mandya’s Rural Agricultural Network'}
            </h2>
            <p className="text-xs sm:text-sm text-earth-300">
              {isKn
                ? 'ರೈತರು ಹಾಗೂ ಖರೀದಿದಾರರಿಬ್ಬರಿಗೂ ಉಚಿತ ನೋಂದಣಿ ಮತ್ತು ನೇರ ಸೇವೆಗಳು ಲಭ್ಯ.'
                : 'Free registration with tailored tools for growers and local buyers.'}
            </p>
          </div>

          <div className="flex flex-col w-full sm:w-auto gap-3">
            <Button
              size="lg"
              className="w-full sm:w-56 font-bold bg-agri-500 hover:bg-agri-600 text-white shadow-sm"
              onClick={() => navigate('/register')}
            >
              <span>{t('auth.get_started')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-56 font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => navigate('/login')}
            >
              <span>{t('auth.sign_in')}</span>
            </Button>
          </div>
        </div>

        {/* Secure Platform Footer */}
        <div className="mt-6 pt-5 border-t border-earth-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-earth-300">
          <span>
            {isKn
              ? 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಕೃಷಿ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆ • ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆ'
              : 'Mandya District Agricultural Pilot Project • Government of Karnataka'}
          </span>
          <span className="text-forest-400 font-semibold">
            {isKn ? 'ಸುರಕ್ಷಿತ ಬಹು-ಬಳಕೆದಾರ ವ್ಯವಸ್ಥೆ' : 'Secure Multi-User Platform'}
          </span>
        </div>
      </Card>
    </div>
  );
}
