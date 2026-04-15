'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type Status = 'new' | 'accepted' | 'in_progress' | 'pending_docs' | 'closed' | 'declined';

interface DocItem { id: string; name: string; requestedAt: string; receivedAt?: string; url?: string }
interface Offer {
  id: string; ref: string; receivedAt: string;
  property: { type: string; address: string; city: string; country: string; flag: string; sqm: number; beds: number; price: number; currency: string; description: string; photos: number };
  seller: { name: string; lang: string; respondsIn: string; email?: string };
  match: { score: number; wave: 1 | 2 | 3; reasons: string[] };
  status: Status;
  statusHistory: { at: string; status: Status; note?: string }[];
  docs: DocItem[];
}
interface Msg { id: string; offerId: string; from: 'agency' | 'owner' | 'seller'; text: string; at: string }

const TABS: { key: Status | 'all'; label: string; color: string }[] = [
  { key: 'new',          label: 'Новые',       color: 'bg-orange-500/20 text-orange-200 border-orange-400/40' },
  { key: 'accepted',     label: 'Приняты',     color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' },
  { key: 'in_progress',  label: 'В работе',    color: 'bg-blue-500/20 text-blue-200 border-blue-400/40' },
  { key: 'pending_docs', label: 'Ждём доки',   color: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40' },
  { key: 'closed',       label: 'Закрыты',     color: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40' },
  { key: 'declined',     label: 'Отклонены',   color: 'bg-rose-500/20 text-rose-300 border-rose-400/40' },
];

const DOC_CATALOG_KEYS = [
  { key: 'title_deed',    label: 'Свидетельство о собственности' },
  { key: 'id',            label: 'ID / Паспорт владельца' },
  { key: 'cadastral',     label: 'Кадастровая выписка' },
  { key: 'energy',        label: 'Энергопаспорт' },
  { key: 'floor_plan',    label: 'Планировка' },
  { key: 'utility_bills', label: 'Коммуналка (3 мес)' },
  { key: 'tax',           label: 'Налог на недвижимость' },
  { key: 'hoa',           label: 'HOA / condo fees' },
];

export default function AgencyDemo() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [tab, setTab] = useState<Status | 'all'>('new');
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [docModal, setDocModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Poll offers (full list, so status changes reflect)
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch('/api/agency-feed', { cache: 'no-store' });
        const j = await r.json();
        if (!stop && j.offers) setOffers(j.offers);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  // Chat polling
  useEffect(() => {
    if (!active) return;
    setMsgs([]);
    let stop = false;
    let lastTs = '';
    const load = async () => {
      const url = lastTs ? `/api/agency-chat?offerId=${active}&since=${encodeURIComponent(lastTs)}` : `/api/agency-chat?offerId=${active}`;
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
        lastTs = j.serverTime;
      } catch {}
    };
    load();
    const id = setInterval(load, 2000);
    return () => { stop = true; clearInterval(id); };
  }, [active]);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  const updateStatus = async (id: string, status: Status, note?: string) => {
    const r = await fetch('/api/agency-feed', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, note }) });
    const j = await r.json();
    if (j.offer) setOffers(prev => prev.map(o => o.id === id ? j.offer : o));
  };

  const send = async () => {
    if (!draft.trim() || !active || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft('');
    try {
      const r = await fetch('/api/agency-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId: active, text }) });
      const j = await r.json();
      if (j.messages) setMsgs(prev => { const seen = new Set(prev.map(m => m.id)); return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))]; });
      const o = offers.find(x => x.id === active);
      if (o && o.status === 'accepted') updateStatus(active, 'in_progress');
    } finally { setSending(false); }
  };

  const requestDocs = async () => {
    if (!active) return;
    const docs = Object.entries(selectedDocs).filter(([, v]) => v).map(([k]) => k);
    if (docs.length === 0) return;
    const r = await fetch('/api/agency-docs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId: active, docs }) });
    const j = await r.json();
    if (j.offer) setOffers(prev => prev.map(o => o.id === active ? j.offer : o));
    if (j.messages) setMsgs(prev => { const seen = new Set(prev.map(m => m.id)); return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))]; });
    setDocModal(false);
    setSelectedDocs({});
  };

  const simulateNewOffer = async () => {
    setSimulating(true);
    try {
      const seed = SAMPLE_PROPS[Math.floor(Math.random() * SAMPLE_PROPS.length)];
      const r = await fetch('/api/agency-feed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seed) });
      const j = await r.json();
      if (j.offer) setOffers(prev => [j.offer, ...prev]);
    } finally { setSimulating(false); }
  };

  const filtered = useMemo(() => tab === 'all' ? offers : offers.filter(o => o.status === tab), [offers, tab]);
  const activeOffer = offers.find(o => o.id === active);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const o of offers) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [offers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">PropBlaze</Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-200 uppercase tracking-wider">Agency Cabinet · Sellers Pipeline</span>
          </div>
          <button onClick={simulateNewOffer} disabled={simulating} className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 disabled:opacity-50 text-sm font-semibold">
            {simulating ? 'Маршрутизация…' : '⚡ Симулировать Seller из APEX'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {TABS.map(t => (
            <button key={t.key as string} onClick={() => setTab(t.key as Status | 'all')} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${tab === t.key ? t.color : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}>
              {t.label} <span className="opacity-70 ml-1">{counts[t.key as string] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Sellers · {TABS.find(t => t.key === tab)?.label || 'Все'}</h2>
            <span className="text-xs text-white/50">{filtered.length}</span>
          </div>
          {filtered.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/50 text-sm">
              Пусто. {tab === 'new' ? 'Ждём новых Sellers от APEX-движка…' : 'Переключите вкладку, чтобы увидеть других.'}
            </div>
          )}
          {filtered.map(o => (
            <button key={o.id} onClick={() => setActive(o.id)} className={`w-full text-left rounded-xl border p-4 transition ${active === o.id ? 'border-orange-400 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{o.property.flag}</span>
                  <span className="font-semibold text-sm">{o.property.type} · {o.property.city}</span>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="text-xs text-white/60 mb-1">👤 {o.seller.name} · {o.seller.lang}</div>
              <div className="text-xs text-white/50 mb-2">{o.property.address}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-white/80">€{o.property.price.toLocaleString()}</span>
                <span className="text-white/40">score {o.match.score} · {timeAgo(o.receivedAt)}</span>
              </div>
            </button>
          ))}
        </aside>

        <main className="col-span-12 lg:col-span-8 space-y-4">
          {!activeOffer && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-white/50">
              ← Выберите Seller слева, чтобы открыть карточку объекта и чат
            </div>
          )}

          {activeOffer && (
            <>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                      <span>Ref · {activeOffer.ref}</span>
                      <StatusBadge status={activeOffer.status} />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{activeOffer.property.flag} {activeOffer.property.type} · {activeOffer.property.city}</h3>
                    <div className="text-white/70 text-sm">{activeOffer.property.address}, {activeOffer.property.country}</div>
                    <div className="text-white/60 text-xs mt-1">👤 Seller: {activeOffer.seller.name} · {activeOffer.seller.lang} · ~{activeOffer.seller.respondsIn}</div>
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
                  <Stat label="Match" value={`${activeOffer.match.score} · W${activeOffer.match.wave}`} />
                </div>

                <p className="text-sm text-white/80 mb-4 leading-relaxed">{activeOffer.property.description}</p>

                <div className="border-t border-white/10 pt-4 mb-4">
                  <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Почему вам</div>
                  <div className="flex flex-wrap gap-2">
                    {activeOffer.match.reasons.map((r, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200">{r}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  {activeOffer.status === 'new' && (
                    <>
                      <button onClick={() => updateStatus(activeOffer.id, 'accepted')} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold">✓ Accept</button>
                      <button onClick={() => updateStatus(activeOffer.id, 'declined', 'Не наш профиль')} className="px-4 py-2 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-sm font-semibold">✗ Decline</button>
                    </>
                  )}
                  {(activeOffer.status === 'accepted' || activeOffer.status === 'in_progress' || activeOffer.status === 'pending_docs') && (
                    <>
                      <button onClick={() => setDocModal(true)} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold">📋 Запросить документы</button>
                      <button onClick={() => updateStatus(activeOffer.id, 'closed', 'Deal done')} className="px-4 py-2 rounded-lg bg-zinc-600 hover:bg-zinc-500 text-white text-sm font-semibold">🏁 Close deal</button>
                    </>
                  )}
                  {(activeOffer.status === 'closed' || activeOffer.status === 'declined') && (
                    <button onClick={() => updateStatus(activeOffer.id, 'new', 'Reopened')} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">↩ Reopen</button>
                  )}
                </div>

                {activeOffer.docs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Документы ({activeOffer.docs.length})</div>
                    <div className="space-y-1">
                      {activeOffer.docs.map(d => (
                        <div key={d.id} className="flex items-center justify-between text-xs bg-white/5 rounded px-3 py-2">
                          <span className="flex items-center gap-2">
                            <span>{d.receivedAt ? '✅' : '⏳'}</span>
                            <span className="text-white/80">{d.name}</span>
                          </span>
                          {d.url ? <a className="text-blue-300 underline" href={d.url}>открыть</a> : <span className="text-white/50">запрошен</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 flex flex-col h-[480px]">
                <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Переписка с Seller</div>
                    <div className="text-xs text-white/50">{activeOffer.seller.name} · {activeOffer.seller.lang}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">● live</span>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {msgs.length === 0 && <div className="text-center text-white/40 text-sm py-8">Загрузка диалога…</div>}
                  {msgs.map(m => (
                    <div key={m.id} className={`flex ${m.from === 'agency' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${m.from === 'agency' ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white rounded-br-sm' : 'bg-white/10 text-white/95 rounded-bl-sm'}`}>
                        <div className="text-xs opacity-70 mb-0.5">{m.from === 'agency' ? 'Вы (агентство)' : activeOffer.seller.name}</div>
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
                    placeholder={activeOffer.status === 'new' ? 'Сначала Accept, потом пишите Seller-у…' : 'Напишите Seller-у…'}
                    disabled={activeOffer.status === 'new' || activeOffer.status === 'declined'}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-400/50 disabled:opacity-50"
                  />
                  <button onClick={send} disabled={!draft.trim() || sending || activeOffer.status === 'new' || activeOffer.status === 'declined'} className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 disabled:opacity-40 text-sm font-semibold">
                    {sending ? '…' : 'Отправить'}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {docModal && activeOffer && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDocModal(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-1">Запрос документов</h3>
            <div className="text-xs text-white/50 mb-4">Seller получит уведомление и пришлёт ссылки в чате</div>
            <div className="space-y-2 mb-5">
              {DOC_CATALOG_KEYS.map(d => (
                <label key={d.key} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                  <input type="checkbox" checked={!!selectedDocs[d.key]} onChange={e => setSelectedDocs(p => ({ ...p, [d.key]: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm">{d.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDocModal(false)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">Отмена</button>
              <button onClick={requestDocs} disabled={Object.values(selectedDocs).every(v => !v)} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 disabled:opacity-40 text-sm font-semibold">Запросить</button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-xs text-white/40 border-t border-white/10 mt-8">
        PropBlaze Agency Cabinet · Sellers pipeline · engine feedback loop enabled
      </footer>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    new:           'bg-orange-500/20 text-orange-200 border-orange-400/40',
    accepted:      'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
    in_progress:   'bg-blue-500/20 text-blue-200 border-blue-400/40',
    pending_docs:  'bg-yellow-500/20 text-yellow-200 border-yellow-400/40',
    closed:        'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
    declined:      'bg-rose-500/20 text-rose-300 border-rose-400/40',
  };
  const label: Record<Status, string> = {
    new: 'новое', accepted: 'принято', in_progress: 'в работе', pending_docs: 'ждём доки', closed: 'закрыто', declined: 'отклонено',
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${map[status]}`}>{label[status]}</span>;
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
  { type: 'Apartment', address: 'Calle Serrano 84', city: 'Madrid', country: 'Spain', flag: '🇪🇸', sqm: 95, beds: 3, price: 720000, sellerName: 'C. García', sellerLang: 'ES', score: 91, wave: 1, reasons: ['Geo: Madrid centro ✓', 'Premium price band ✓', 'EN+ES owner ✓'], description: 'Renovated piso in Salamanca district. Concierge, garage, balcony.', photos: 14 },
  { type: 'Villa', address: 'Praia da Marinha 7', city: 'Lagoa', country: 'Portugal', flag: '🇵🇹', sqm: 280, beds: 5, price: 1850000, sellerName: 'M. Costa', sellerLang: 'PT', score: 96, wave: 1, reasons: ['Algarve coast ✓', 'Luxury segment ✓', 'Foreign-buyer ready ✓'], description: 'Cliff-top villa, infinity pool, 180° ocean view, 12 min to Carvoeiro.', photos: 22 },
  { type: 'Apartment', address: 'Bd Saint-Germain 142', city: 'Paris', country: 'France', flag: '🇫🇷', sqm: 78, beds: 2, price: 1290000, sellerName: 'L. Dubois', sellerLang: 'FR', score: 92, wave: 1, reasons: ['6e arrondissement ✓', 'Prime €/m² band ✓', 'Move-in ready ✓'], description: 'Haussmannien 4ème étage, parquet, cheminée, ascenseur.', photos: 11 },
  { type: 'Loft', address: 'Bergmannstr 11', city: 'Berlin', country: 'Germany', flag: '🇩🇪', sqm: 132, beds: 3, price: 695000, sellerName: 'S. Schneider', sellerLang: 'DE', score: 88, wave: 1, reasons: ['Kreuzberg loft ✓', 'Investor-ready ✓', 'Strong rental yield ✓'], description: 'Industrial loft in Bergmannkiez, exposed brick, 4m ceilings.', photos: 18 },
  { type: 'Villa', address: 'Camí de Cala Comte 3', city: 'Ibiza', country: 'Spain', flag: '🇪🇸', sqm: 340, beds: 6, price: 4200000, sellerName: 'A. Marí', sellerLang: 'ES', score: 95, wave: 1, reasons: ['Sant Josep coastline ✓', 'Ultra-luxury ✓', 'Sunset-view plot ✓'], description: 'Modernist villa, infinity pool, direct cala access, fully licensed.', photos: 28 },
];
