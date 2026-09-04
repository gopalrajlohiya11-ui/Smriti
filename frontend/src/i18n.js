import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import asTranslation from './locales/as.json';

const savedLang = localStorage.getItem('smriti_language') || localStorage.getItem('smriti_selected_lang') || 'en';

const resources = {
  en: {
    translation: enTranslation
  },
  as: {
    translation: asTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang === 'as' ? 'as' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
