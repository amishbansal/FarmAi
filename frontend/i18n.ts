import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';

i18n
  .use(LanguageDetector) // Auto detect user language
  .use(initReactI18next) // Connect with React
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      pa: { translation: pa },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['localStorage', 'navigator'], // Detect from localStorage or browser
      caches: ['localStorage'],
    },
  });

export default i18n;
