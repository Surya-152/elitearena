// src/components/common/LanguageSelector.jsx
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export default function LanguageSelector() {
  const { lang, setLang, languages, langName } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-ea-muted
                   hover:text-ea-text hover:bg-ea-surface transition-all text-sm font-body">
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-mono text-xs">{langName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-50
                        shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
             style={{ background:'#10101f', border:'1px solid rgba(30,30,58,0.9)' }}>
          {languages.map(l => (
            <button key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left
                          font-body text-sm transition-all hover:bg-ea-surface
                ${lang === l.code ? 'text-ea-cyan bg-ea-cyan/5' : 'text-ea-text'}`}>
              <span className="text-base leading-none">{l.flag}</span>
              <div>
                <div className="font-medium text-xs leading-tight">{l.nativeName}</div>
                <div className="text-ea-muted text-[10px]">{l.name}</div>
              </div>
              {lang === l.code && <span className="ml-auto text-ea-cyan text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}
