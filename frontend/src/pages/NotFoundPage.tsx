import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language.startsWith('kn');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-agri-100 text-agri-800 flex items-center justify-center">
        <Sprout className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-earth-900">
        404 - {isKn ? 'ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ' : 'Page Not Found'}
      </h1>
      <p className="text-xs sm:text-sm text-earth-600 max-w-sm">
        {isKn
          ? 'ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟ ಲಭ್ಯವಿಲ್ಲ ಅಥವಾ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.'
          : 'The page you requested does not exist or has been moved.'}
      </p>
      <Button onClick={() => navigate('/')}>
        <Home className="w-4 h-4 mr-1.5" />
        {t('nav.home')}
      </Button>
    </div>
  );
}
