import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const en = {
  nav: {
    findJobs: "Find Jobs",
    postJob: "Post Job",
    findServices: "Find Services",
    postService: "Post Service",
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    logout: "Logout",
  },
  home: {
    tagline: "Pakistan's Marketplace for",
    jobs: "Jobs",
    and: "&",
    services: "Professional Services",
    subtitle: "Two trusted marketplaces. One platform. Endless opportunities.",
  },
};

const ur = {
  nav: {
    findJobs: "نوکریاں تلاش کریں",
    postJob: "نوکری پوسٹ کریں",
    findServices: "سروسز تلاش کریں",
    postService: "سروس پوسٹ کریں",
    login: "لاگ ان",
    register: "رجسٹر",
    dashboard: "ڈیش بورڈ",
    logout: "لاگ آؤٹ",
  },
  home: {
    tagline: "پاکستان کا مارکیٹ پلیس",
    jobs: "نوکریاں",
    and: "اور",
    services: "پیشہ ورانہ خدمات",
    subtitle: "دو قابل اعتماد مارکیٹ پلیس۔ ایک پلیٹ فارم۔ لامحدود مواقع۔",
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en }, ur: { translation: ur } },
      fallbackLng: "en",
      lng: "en",
      supportedLngs: ["en", "ur"],
      react: { useSuspense: false },
      initImmediate: false,
      interpolation: { escapeValue: false },
      detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
    });
}

export default i18n;
