import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Check local storage for saved language, default to 'en'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('pulseaid_lang') || 'en';
  });

  // Save to local storage whenever language changes
  useEffect(() => {
    localStorage.setItem('pulseaid_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  // Translation function
  const t = (key) => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English if translation is missing
    const enDict = translations['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return key; // Fallback to key itself
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
