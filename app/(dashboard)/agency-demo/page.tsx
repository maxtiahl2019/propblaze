'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Offer {
  id: string; ref: string; receivedAt: string;
  property: { type: string; address: string; city: string; country: string; flag: string; sqm: number; beds: number; price: number; currency: string; description: string; photos: number };
  owner: { name: string; lang: string; respondsIn: string };
  match: { score: number; wave: 1 | 2 | 3; reasons: string[] };
  status: 'new' | 'viewed' | 'replied' | 'declined';
}

interface Msg { id: string; offerId: string; from: 'agency' | 'owner'; text: string; at: string }

export default function AgencyDemo() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [lastFeedTs, setLastFeedTs] = useState<string>('');
  const [lastChatTs, setLastChatTs] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initial load + poll for new offers every 5s
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const url = lastFeedTs ? `/api/agency-feed?since=${encodeURIComponent(lastFeedTs)}` : '/api/agency-feed';
      try {
        const r = await fetch(url, { cache: 'no-store' });
        const j = await r.json();
        if (stop) return;
        if (j.offers?.length) {
          setOffers(prev => {
            const seen = new Set(prev.map((o: Offer) => o.id));
            const fresh = j.offers.filter((o: Offer) => !seen.has(o.id));
            return [...fresh, ...prev];
          });
        }
        setLastFeedTs(j.serverTime);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { stop = true; clearInterval(id); };
  }, [lastFeedTs]);

  // Load chat for active offer + poll new messages every 2s
  useEffect(() => {
    if (!active) return;
    setMsgs([]);
    setLastChatTs('');
    let stop = false;
    const load = async () => {
      const url = lastChatTs
        ? `/api/agency-chat?offerId=${active}&since=${encodeURIComponent(lastChatTs)}`
        : `/api/agency-chat?offerId=${active}`;
      try {
        const r = await fetch(url, { cache: 'no-store' });
        const j = await r.json();
        if (stop) return;
        if (j.messages?.length) {
          setMsgs(prev => {
            const seen = new Set(prev.map(m => m.id));
            return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))];
          });
        }
        setLastChatTs(j.serverTime);
      } catch {}
    };
    load();
    const id = setInterval(load, 2000);
    return () => { stop = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Auto-scroll chat
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  const send = async () => {
    if (!draft.trim() || !active || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft('');
    try {
      const r = await fetch('/api/agency-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: active, text }),
      });
      const j = await r.json();
      if (j.messages) {
        setMsgs(prev => {
          const seen = new Set(prev.map(m => m.id));
          return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))];
        });
      }
    } finally { setSending(false); }
  };

  // Simulate APEX engine routing a new object to this agency
  const simulateNewOffer = async () => {
    setSimulating(true);
    try {
      // 1) call the real engine to get a realistic property
      const seedProperty = SAMPLE_PROPS[Math.floor(Math.random() * SAMPLE_PROPS.length)];
      const r = await fetch('/api/agency-feed', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seedProperty),
      });
      const j = await r.json();
      if (j.offer) setOffers(prev => [j.offer, ...prev]);
    } finally { setSimulating(false); }
  };

  const activeOffer = offers.find(o => o.id === active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              PropBlaze
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-200 uppercase tracking-wider">Agency Cabinet · Live Demo</span>
          </div>
          <button
            onClick={simulateNewOffer}
            disabled={simulating}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 disabled:opacity-50 text-sm font-semibold transition"
          >
            {simulating ? 'Маршрутизация…' : '⚡ Симулировать новый объект из APEX'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        {/* Inbox */}
        <aside className="col-span-12 lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Входящие объекты</h2>
            <span className="text-xs text-white/50">{offers.length} active</span>
          </div>
          {offers.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/50 text-sm">
              Ожидание объектов от APEX-движка…
            </div>
          )}
          {offers.map(o => (
            <button
              key={o.id}
              onClick={() => setActive(o.id)}
              className={`w-full text-left rounded-xl border p-4 transition ${
                active === o.id
                  ? 'border-orange-400 bg-orange-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{o.property.flag}</span>
                  <span className="font-semibold text-sm">{o.property.type} · {o.property.city}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  o.match.wave === 1 ? 'bg-green-500/20 text-green-300 border border-green-400/40'
                  : o.match.wave === 2 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                }`}>W{o.match.wave} · {o.match.score}</span>
              </div>
              <div className="text-xs text-white/60 mb-2">{o.property.address}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-white/80">€{o.property.price.toLocaleString()}</span>
                <span className="text-white/40">{timeAgo(o.receivedAt)}</span>
              </div>
            </button>
          ))}
        </aside>

        {/* Property + Chat */}
        <main className="col-span-12 lg:col-span-8 space-y-4">
          {!activeOffer && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-white/50">
              ← Выберите объект слева, чтобы открыть детали и переписку с владельцем
            </div>
          )}

          {activeOffer && (
            <>
              {/* Property card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-white/50 mb-1">Ref · {activeOffer.ref}</div>
                    <h3 className="text-2xl font-bold mb-1">{activeOffer.property.flag} {activeOffer.property.type} · {activeOffer.property.city}</h3>
                    <div className="text-white/70 text-sm">{activeOffer.property.address}, {activeOffer.property.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-400">€{activeOffer.property.price.toLocaleString()}</div>
                    <div className="text-xs text-white/50 mt-1">€{Math.round(activeOffer.property.price / activeOffer.property.sqm).toLocaleString()}/m²</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                  <Stat label="Площадь" value={`${activeOffer.property.sqm} m²`} />
                  <Stat label="Спальни" value={String(activeOffer.property.beds)} />
                  <Stat label="Фото" value={String(activeOffer.property.photos)} />
                  <Stat label="Owner reply" value={`~${activeOffer.owner.respondsIn}`} />
                </div>
                <p className="text-sm text-white/80 mb-4 leading-relaxed">{activeOffer.property.description}</p>
                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Почему вам</div>
                  <div className="flex flex-wrap gap-2">
                    {activeOffer.match.reasons.map((r, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200">{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="rounded-2xl border border-white/10 bg-white/5 flex flex-col h-[480px]">
                <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Переписка с владельцем</div>
                    <div className="text-xs text-white/50">{activeOffer.owner.name} · отвечает в течение {activeOffer.owner.respondsIn} · {activeOffer.owner.lang}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">● live</span>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {msgs.length === 0 && (
                    <div className="text-center text-white/40 text-sm py-8">Загрузка диалога…</div>
                  )}
                  {msgs.map(m => (
                    <div key={m.id} className={`flex ${m.from === 'agency' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        m.from === 'agency'
                          ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white rounded-br-sm'
                          : 'bg-white/10 text-white/95 rounded-bl-sm'
                      }`}>
                        <div className="text-xs opacity-70 mb-0.5">{m.from === 'agency' ? 'Вы (агентство)' : activeOffer.owner.name}</div>
                        <div>{m.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
                <div className="border-t border-white/10 p-3 flex gap-2">
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Напишите владельцу…"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-400/50"
                  />
                  <button
                    onClick={send}
                    disabled={!draft.trim() || sending}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 disabled:opacity-40 text-sm font-semibold"
                  >
                    {sending ? '…' : 'Отправить'}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <footer className="text-center py-6 text-xs text-white/40 border-t border-white/10 mt-8">
        Real-time agency cabinet · powered by APEX matching engine · Claude+OpenAI+Gemini
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 py-2">
      <div className="text-xs text-white/50">{label}</div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${sec}s назад`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m назад`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h назад`;
  return `${Math.floor(sec / 86400)}d назад`;
}

const SAMPLE_PROPS = [
  { type: 'Apartment', address: 'Calle Serrano 84', city: 'Madrid', country: 'Spain', flag: '🇪🇸', sqm: 95, beds: 3, price: 720000, ownerName: 'C. García', ownerLang: 'ES', score: 91, wave: 1, reasons: ['Geo: Madrid centro ✓', 'Premium price band ✓', 'EN+ES owner ✓'], description: 'Renovated piso in Salamanca district. Concierge, garage, balcony.', photos: 14 },
  { type: 'Villa', address: 'Praia da Marinha 7', city: 'Lagoa', country: 'Portugal', flag: '🇵🇹', sqm: 280, beds: 5, price: 1850000, ownerName: 'M. Costa', ownerLang: 'PT', score: 96, wave: 1, reasons: ['Algarve coast ✓', 'Luxury segment ✓', 'Foreign-buyer ready ✓'], description: 'Cliff-top villa, infinity pool, 180° ocean view, 12 min to Carvoeiro.', photos: 22 },
  { type: 'Apartment', address: 'Bd Saint-Germain 142', city: 'Paris', country: 'France', flag: '🇫🇷', sqm: 78, beds: 2, price: 1290000, ownerName: 'L. Dubois', ownerLang: 'FR', score: 92, wave: 1, reasons: ['6e arrondissement ✓', 'Prime €/m² band ✓', 'Move-in ready ✓'], description: 'Haussmannien 4ème étage, parquet, cheminée, ascenseur.', photos: 11 },
  { type: 'Loft', address: 'Bergmannstr 11', city: 'Berlin', country: 'Germany', flag: '🇩🇪', sqm: 132, beds: 3, price: 695000, ownerName: 'S. Schneider', ownerLang: 'DE', score: 88, wave: 1, reasons: ['Kreuzberg loft ✓', 'Investor-ready ✓', 'Strong rental yield ✓'], description: 'Industrial loft in Bergmannkiez, exposed brick, 4m ceilings.', photos: 18 },
  { type: 'Villa', address: 'Camí de Cala Comte 3', city: 'Ibiza', country: 'Spain', flag: '🇪🇸', sqm: 340, beds: 6, price: 4200000, ownerName: 'A. Marí', ownerLang: 'ES', score: 95, wave: 1, reasons: ['Sant Josep coastline ✓', 'Ultra-luxury ✓', 'Sunset-view plot ✓'], description: 'Modernist villa, infinity pool, direct cala access, fully licensed.', photos: 28 },
];
