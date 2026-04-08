'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type View = 'chat' | 'support'

const QUICK_REPLIES = {
  en: ['How does it work?', 'Pricing plans', 'How many agencies?', 'Is it GDPR compliant?'],
  ru: ['Как это работает?', 'Тарифы', 'Сколько агентств?', 'Это соответствует GDPR?'],
  sr: ['Kako funkcioniše?', 'Cenovnik', 'Koliko agencija?', 'GDPR usklađenost?'],
  de: ['Wie funktioniert es?', 'Preise', 'Wie viele Agenturen?', 'GDPR-konform?'],
  es: ['¿Cómo funciona?', 'Precios', '¿Cuántas agencias?', '¿Cumple con GDPR?'],
}

const UI: Record<string, Record<string, string>> = {
  en: { title: 'Blaze AI', subtitle: 'PropBlaze Assistant', placeholder: 'Ask anything...', send: 'Send', support: 'Contact Support', supportTitle: 'Contact Support', name: 'Your name', email: 'Email address', message: 'Describe your issue...', submit: 'Send Message', back: '← Back to chat', sent: "✅ Message sent! We'll reply within 24h.", online: 'Online' },
  ru: { title: 'Blaze AI', subtitle: 'Ассистент PropBlaze', placeholder: 'Задайте вопрос...', send: 'Отправить', support: 'Написать в поддержку', supportTitle: 'Написать в поддержку', name: 'Ваше имя', email: 'Email адрес', message: 'Опишите вопрос...', submit: 'Отправить', back: '← Назад в чат', sent: '✅ Отправлено! Ответим в течение 24ч.', online: 'Онлайн' },
  sr: { title: 'Blaze AI', subtitle: 'PropBlaze Asistent', placeholder: 'Pitajte bilo šta...', send: 'Pošalji', support: 'Kontaktirajte podršku', supportTitle: 'Kontakt Podrška', name: 'Vaše ime', email: 'Email adresa', message: 'Opišite problem...', submit: 'Pošalji poruku', back: '← Nazad na chat', sent: '✅ Poslato! Odgovorićemo u roku od 24h.', online: 'Online' },
  de: { title: 'Blaze AI', subtitle: 'PropBlaze Assistent', placeholder: 'Frage stellen...', send: 'Senden', support: 'Support kontaktieren', supportTitle: 'Support kontaktieren', name: 'Ihr Name', email: 'E-Mail Adresse', message: 'Problem beschreiben...', submit: 'Nachricht senden', back: '← Zurück zum Chat', sent: '✅ Gesendet! Wir antworten in 24h.', online: 'Online' },
  es: { title: 'Blaze AI', subtitle: 'Asistente PropBlaze', placeholder: 'Pregunta algo...', send: 'Enviar', support: 'Contactar soporte', supportTitle: 'Contactar soporte', name: 'Tu nombre', email: 'Correo electrónico', message: 'Describe tu problema...', submit: 'Enviar mensaje', back: '← Volver al chat', sent: '✅ ¡Enviado! Te responderemos en 24h.', online: 'En línea' },
}

function detectLang(): string {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem('pb_lang')
  if (saved && UI[saved]) return saved
  const browser = navigator.language?.slice(0, 2)
  if (browser === 'ru') return 'ru'
  if (browser === 'sr') return 'sr'
  if (browser === 'de') return 'de'
  if (browser === 'es') return 'es'
  return 'en'
}

export default function PropBlazeAssistant() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('chat')
  const [lang, setLang] = useState('en')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [supportSent, setSupportSent] = useState(false)
  const [supportForm, setSupportForm] = useState({ name: '', email: '', message: '' })
  const [pulse, setPulse] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const ui = UI[lang] || UI.en
  const quickReplies = QUICK_REPLIES[lang as keyof typeof QUICK_REPLIES] || QUICK_REPLIES.en

  useEffect(() => {
    setLang(detectLang())
    const t = setTimeout(() => setPulse(true), 4000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = lang === 'ru'
        ? 'Привет! Я Blaze 🔥 ИИ-ассистент PropBlaze. Спрашивайте о платформе, тарифах, как работает подбор агентств — я здесь чтобы помочь!'
        : lang === 'sr'
        ? 'Zdravo! Ja sam Blaze 🔥 PropBlaze AI asistent. Pitajte me o platformi, cenama ili kako funkcioniše sistem agencija!'
        : "Hi! I'm Blaze 🔥 PropBlaze AI assistant. Ask me anything about the platform, pricing, how agency matching works, or getting started!"
      setMessages([{ role: 'assistant', content: greeting }])
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, lang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          language: lang,
        }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      const fallback = lang === 'ru'
        ? 'Извините, возникла ошибка. Пожалуйста, напишите нам на support@propblaze.com'
        : 'Sorry, I ran into an error. Please reach us at support@propblaze.com'
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
    }
  }, [input, messages, loading, lang])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendSupport = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'support@propblaze.com',
          subject: `[Support] ${supportForm.name} — ${supportForm.email}`,
          html: `<h2>New support request</h2><p><strong>From:</strong> ${supportForm.name} (${supportForm.email})</p><p><strong>Message:</strong></p><p>${supportForm.message}</p>`,
          replyTo: supportForm.email,
        }),
      })
    } catch {}
    setSupportSent(true)
  }

  const langs = ['en', 'ru', 'sr', 'de', 'es']

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => { setOpen(o => !o); setPulse(false) }}
        aria-label="Open PropBlaze AI Assistant"
        className={`
          fixed bottom-6 right-6 z-[9999]
          w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center
          transition-all duration-300
          ${pulse && !open ? 'animate-bounce' : ''}
          ${open ? 'scale-90' : 'hover:scale-110'}
        `}
        style={{
          background: 'linear-gradient(135deg, #c0392b 0%, #e67e22 100%)',
          boxShadow: '0 4px 20px rgba(192,57,43,0.5)',
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-gray-900 animate-pulse" />
        )}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[9998] flex flex-col"
          style={{
            width: 'min(380px, calc(100vw - 24px))',
            height: 'min(560px, calc(100vh - 120px))',
            background: '#111111',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #c0392b 0%, #e67e22 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🔥</div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">{ui.title}</div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-white/80 text-xs">{ui.online} · {ui.subtitle}</span>
                </div>
              </div>
            </div>
            {/* Lang switcher */}
            <div className="flex items-center gap-1">
              {langs.map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); localStorage.setItem('pb_lang', l) }}
                  className={`text-xs px-1.5 py-0.5 rounded font-medium transition-all ${lang === l ? 'bg-white text-red-600' : 'text-white/70 hover:text-white'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* View: Support Form */}
          {view === 'support' ? (
            <div className="flex-1 overflow-y-auto p-4">
              <button
                onClick={() => { setView('chat'); setSupportSent(false) }}
                className="text-xs text-gray-400 hover:text-white mb-4 transition-colors"
              >
                {ui.back}
              </button>
              {supportSent ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-white text-sm">{ui.sent}</p>
                </div>
              ) : (
                <form onSubmit={sendSupport} className="space-y-3">
                  <h3 className="text-white font-semibold text-sm mb-4">{ui.supportTitle}</h3>
                  <input
                    required type="text" placeholder={ui.name}
                    value={supportForm.name}
                    onChange={e => setSupportForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm border border-white/10 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <input
                    required type="email" placeholder={ui.email}
                    value={supportForm.email}
                    onChange={e => setSupportForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm border border-white/10 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <textarea
                    required rows={4} placeholder={ui.message}
                    value={supportForm.message}
                    onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm border border-white/10 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #c0392b 0%, #e67e22 100%)' }}
                  >
                    {ui.submit}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* View: Chat */
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full mr-2 flex-shrink-0 flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)' }}>🔥</div>
                    )}
                    <div
                      className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                      style={msg.role === 'user'
                        ? { background: 'linear-gradient(135deg,#c0392b,#e67e22)', color: 'white', borderBottomRightRadius: '6px' }
                        : { background: '#1e1e1e', color: '#e0e0e0', borderBottomLeftRadius: '6px' }
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full mr-2 flex-shrink-0 flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)' }}>🔥</div>
                    <div className="bg-[#1e1e1e] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              {messages.length <= 1 && !loading && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {quickReplies.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-gray-300 hover:border-orange-500 hover:text-white transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Support link */}
              <div className="px-4 pb-2 text-center">
                <button
                  onClick={() => setView('support')}
                  className="text-xs text-gray-500 hover:text-orange-400 transition-colors"
                >
                  {ui.support} →
                </button>
              </div>

              {/* Input */}
              <div className="px-4 pb-4 flex gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={ui.placeholder}
                  disabled={loading}
                  className="flex-1 bg-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-2.5 text-sm border border-white/10 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)' }}
                  aria-label={ui.send}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
