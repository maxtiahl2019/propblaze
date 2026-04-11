'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Lang } from './translations'
import { t as translate } from './translations'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

// MVP: English-only. Browser language auto-detection removed — was causing
// mixed-language UI with incomplete translations for DE/UA/ES.
// Language switcher in Settings shows EN/RU/SR only (user-set comms pref).
// Full i18n is a Phase 2 deliverable.
const MVP_SUPPORTED_LANGS: Lang[] = ['en', 'ru', 'sr']

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    // Only restore if it's one of the MVP-supported languages
    const stored = localStorage.getItem('pb_lang') as Lang | null
    if (stored && MVP_SUPPORTED_LANGS.includes(stored)) {
      setLangState(stored)
    }
    // Otherwise stay on English — no auto-detect from browser
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('pb_lang', l)
  }

  const tFn = (key: string) => translate(lang, key)

  return (
    <LangContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LangContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LangContext)
}

export function LangSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useTranslation()
  const FLAGS: Record<Lang, string> = { en: '🇬🇧', de: '🇩🇪', ru: '🇷🇺', ua: '🇺🇦', es: '🇪🇸', sr: '🇷🇸' }
  const LABELS: Record<Lang, string> = { en: 'EN', de: 'DE', ru: 'RU', ua: 'UA', es: 'ES', sr: 'SR' }

  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`}>
      {(Object.keys(FLAGS) as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`text-xs px-2 py-1 rounded-lg transition-all font-medium ${
            lang === l
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-white/30 hover:text-white/60'
          }`}
        >
          {FLAGS[l]} {LABELS[l]}
        </button>
      ))}
    </div>
  )
}
