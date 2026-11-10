import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

import { translations } from "./translations";

const STORAGE_KEY = "rins-lang";

const LanguageContext = createContext(null);

const getInitialLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  } catch {
    // Storage can be blocked (private mode); fall back to English
  }
  return "en";
};

// Looks up a dotted key like "nav.products", falling back to English
const lookup = (lang, key) =>
  key
    .split(".")
    .reduce((obj, part) => obj?.[part], translations[lang]) ??
  key.split(".").reduce((obj, part) => obj?.[part], translations.en) ??
  key;

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(getInitialLang);

  // Arabic reads right to left, so flip the whole page direction
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore: the choice just won't be remembered
    }
  }, [lang]);

  const t = useCallback(
    (key, vars) =>
      String(lookup(lang, key)).replace(/\{(\w+)\}/g, (match, name) =>
        vars && name in vars ? vars[name] : match
      ),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
