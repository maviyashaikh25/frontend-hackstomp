import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('app_lang') || 'en');
  const sarvamKey = "sk_ouf9w07j_CxYCqjPiGZMOoC5eYhMAskJT";

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  // Optional: Function to translate dynamic content using Sarvam AI
  const translateDynamic = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    try {
      const response = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': sarvamKey
        },
        body: JSON.stringify({
          input: text,
          source_language_code: 'en-IN',
          target_language_code: targetLang === 'hi' ? 'hi-IN' : targetLang === 'mr' ? 'mr-IN' : 'hi-IN',
          speaker_gender: 'Female'
        })
      });
      const data = await response.json();
      return data.translated_text || text;
    } catch (err) {
      console.error("Translation API failed", err);
      return text;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translateDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
