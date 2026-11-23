import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('kn') ? 'kn' : 'en';

  const toggleLanguage = (lang: 'kn' | 'en') => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  };

  return (
    <div className="inline-flex items-center rounded-xl bg-earth-100 p-0.5 border border-earth-200">
      <button
        type="button"
        onClick={() => toggleLanguage('kn')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all font-kannada leading-normal whitespace-nowrap ${
          currentLang === 'kn'
            ? 'bg-forest-700 text-white shadow-xs'
            : 'text-earth-700 hover:text-earth-950 hover:bg-earth-200/60'
        }`}
        aria-label="ಕನ್ನಡ Kannada"
      >
        ಕನ್ನಡ
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all leading-normal whitespace-nowrap ${
          currentLang === 'en'
            ? 'bg-forest-700 text-white shadow-xs'
            : 'text-earth-700 hover:text-earth-950 hover:bg-earth-200/60'
        }`}
        aria-label="English"
      >
        English
      </button>
    </div>
  );
}
