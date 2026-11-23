import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './en.json';
import knTranslation from './kn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      kn: { translation: knTranslation }
    },
    fallbackLng: 'kn', // Mandya pilot defaults to Kannada
    supportedLngs: ['kn', 'en'],
    interpolation: {
      escapeValue: false // React already protects against XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
