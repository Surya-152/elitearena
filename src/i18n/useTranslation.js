// src/i18n/useTranslation.js — Language hook
import { useState, useEffect, useCallback } from 'react';
import T, { LANGUAGES } from './translations';

const STORAGE_KEY = 'ea_lang';
const DEFAULT     = 'en';

function getLang() {
  try { return localStorage.getItem(STORAGE_KEY) || DEFAULT; }
  catch { return DEFAULT; }
}

// Global lang state shared across components
let _lang     = getLang();
let _listeners = [];

function setGlobalLang(code) {
  _lang = code;
  try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  _listeners.forEach(fn => fn(code));
}

export function useTranslation() {
  const [lang, setLang] = useState(_lang);

  useEffect(() => {
    const fn = (code) => setLang(code);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }, []);

  const t = useCallback((key) => {
    return (T[lang] && T[lang][key]) || T[DEFAULT][key] || key;
  }, [lang]);

  return {
    t,
    lang,
    setLang: setGlobalLang,
    languages: LANGUAGES,
    langName:  LANGUAGES.find(l => l.code === lang)?.nativeName || 'English',
  };
}
