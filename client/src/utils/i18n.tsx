// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import commonEN from '../locales/en/common.json';
import formsEN from '../locales/en/forms.json';
import commonDE from '../locales/en/common.json';
import formsDE from '../locales/en/forms.json';

const resources = {
    en:{
        common:commonEN,
        forms:formsEN
    },
    de:{
        common:commonEN,
        forms:formsEN
    }
}

// Initialize i18next
i18n
  .use(HttpBackend) // Load translations using HTTP backend
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    fallbackLng: 'en', // Default language
    supportedLngs: ['en','de'], // List of supported languages
    debug: false, // Enable debug mode for development
    resources,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    backend: {
      loadPath: '../locales/{{lng}}/{{ns}}.json', // Path to translation files
    },
    ns: ['common', 'forms'], // Define namespaces (different translation files)
    defaultNS: 'common', // Default namespace used if not specified in key
  });

export default i18n;