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

function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'en'
  const l = navigator.language?.toLowerCase() ?? 'en'
  if (l.startsWith('de')) return 'de'
  if (l.startsWith('ru')) return 'ru'
  if (l.startsWith('uk')) return 'ua'
  if (l.startsWith('es')) return 'es'
  return 'en'
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    // Check localStorage first, then browser language
    const stored = localStorage.getItem('pb_lang') as Lang | null
    setLangState(stored ?? detectBrowserLang())
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
