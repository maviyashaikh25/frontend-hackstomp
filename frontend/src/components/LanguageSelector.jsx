import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  if (pathname !== '/') return null;

  const langs = [
    { code: 'en', label: 'English', icon: '🇺🇸' },
    { code: 'hi', label: 'हिन्दी', icon: '🇮🇳' },
    { code: 'mr', label: 'मराठी', icon: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી', icon: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', icon: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', icon: '🇮🇳' },
    { code: 'kn', label: 'ಕನ್ನಡ', icon: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', icon: '🇮🇳' },
  ];

  const currentLang = langs.find(l => l.code === language) || langs[0];

  return (
    <div className="lang-selector">
      <button className="lang-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="lang-icon">{currentLang.icon}</span>
        <span className="lang-label">{currentLang.label}</span>
        <span className="material-icons" style={{ fontSize: '18px' }}>{isOpen ? 'expand_less' : 'expand_more'}</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {langs.map(l => (
            <div 
              key={l.code} 
              className={`lang-option ${language === l.code ? 'active' : ''}`}
              onClick={() => {
                changeLanguage(l.code);
                setIsOpen(false);
              }}
            >
              <span className="lang-icon">{l.icon}</span>
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
