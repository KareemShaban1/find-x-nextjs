import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const SUPPORTED_LANGS = ["en", "ar"] as const;
export type Locale = (typeof SUPPORTED_LANGS)[number];

export const RTL_LOCALES: Locale[] = ["ar"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "findx_lang",
    },
  });

export default i18n;
