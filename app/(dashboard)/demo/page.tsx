'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Mock property ────────────────────────────────────────────────────────────
const DEMO_PROPERTY = {
  title: '3-bedroom apartment, Vracar',
  city: 'Belgrade',
  country: 'Serbia',
  price: 210000,
  currency: 'EUR',
  area: 94,
  property_type: 'apartment',
  commission_pct: 3,
  target_buyers: ['local_buyer', 'diaspora', 'foreign_investor'],
  is_cross_border: true,
  languages: ['en', 'ru', 'sr'],
};

// ─── Mock agencies ────────────────────────────────────────────────────────────
const AGENCIES = [
  { id: 'a1', name: 'BelgradeProperties Pro', city: 'Belgrade', country: 'Serbia', specializations: ['apartment', 'luxury'], buyer_profiles: ['local_buyer', 'diaspora'], languages: ['sr', 'ru', 'en'], response_rate: 87, conversion_rate: 12, cross_border: true, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a2', name: 'Balkans Realty Group', city: 'Belgrade', country: 'Serbia', specializations: ['apartment', 'house'], buyer_profiles: ['local_buyer', 'foreign_investor'], languages: ['sr', 'en', 'de'], response_rate: 74, conversion_rate: 9, cross_border: true, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a3', name: 'DiasporaHome Serbia', city: 'Novi Sad', country: 'Serbia', specializations: ['apartment'], buyer_profiles: ['diaspora', 'foreign_investor'], languages: ['sr', 'ru', 'de', 'en'], response_rate: 92, conversion_rate: 18, cross_border: true, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a4', name: 'Vracar Exclusive', city: 'Belgrade', country: 'Serbia', specializations: ['apartment', 'luxury'], buyer_profiles: ['local_buyer'], languages: ['sr', 'en'], response_rate: 65, conversion_rate: 8, cross_border: false, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a5', name: 'EastEurope Invest', city: 'Vienna', country: 'Austria', specializations: ['apartment', 'commercial'], buyer_profiles: ['foreign_investor', 'diaspora'], languages: ['de', 'en', 'ru'], response_rate: 81, conversion_rate: 14, cross_border: true, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a6', name: 'Adriatic Homes', city: 'Zagreb', country: 'Croatia', specializations: ['apartment', 'villa'], buyer_profiles: ['foreign_investor'], languages: ['hr', 'en', 'de'], response_rate: 70, conversion_rate: 11, cross_border: true, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a7', name: 'Moskovskaya Недвижимость', city: 'Moscow', country: 'Russia', specializations: ['apartment', 'house'], buyer_profiles: ['diaspora', 'foreign_investor'], languages: ['ru', 'en'], response_rate: 88, conversion_rate: 16, cross_border: true, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a8', name: 'Belgrade Central Estates', city: 'Belgrade', country: 'Serbia', specializations: ['apartment'], buyer_profiles: ['local_buyer'], languages: ['sr'], response_rate: 55, conversion_rate: 6, cross_border: false, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a9', name: 'Danube Property Partners', city: 'Budapest', country: 'Hungary', specializations: ['apartment', 'house'], buyer_profiles: ['foreign_investor', 'diaspora'], languages: ['hu', 'en', 'ru'], response_rate: 76, conversion_rate: 13, cross_border: true, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
  { id: 'a10', name: 'Savski Venac Realty', city: 'Belgrade', country: 'Serbia', specializations: ['apartment', 'luxury'], buyer_profiles: ['local_buyer', 'diaspora'], languages: ['sr', 'ru'], response_rate: 69, conversion_rate: 10, cross_border: false, rule_score: 0, llm_boost: 0, total: 0, wave: 0, explanation: '' },
];

// ─── LLM explanations ─────────────────────────────────────────────────────────
const LLM_EXPLANATIONS: Record<string, { boost: number; text: string }> = {
  a1: { boost: 24, text: 'Strong local presence in Vracar district. Proven diaspora buyer network. Russian-language capability aligns with cross-border demand.' },
  a2: { boost: 18, text: 'Active foreign investor pipeline from Western Europe. Commission structure competitive at 3%. Good language coverage.' },
  a3: { boost: 28, text: 'Exceptional specialisation in diaspora buyers from CIS region. Highest response rate in dataset. Cross-border deal history strong.' },
  a4: { boost: 12, text: 'Hyperlocal Vracar expertise is valuable. However, limited buyer diversity and no cross-border experience reduces fit for this listing.' },
  a5: { boost: 22, text: 'Vienna-based with active Russian/CIS investor clientele. Premium cross-border positioning matches property price band.' },
  a6: { boost: 14, text: 'Foreign investor focus is relevant but Croatian market focus may reduce Belgrade-specific buyer pipeline.' },
  a7: { boost: 26, text: 'Direct access to Russian-speaking buyer segment. Very high response rate. Cross-border specialist with significant EU property transactions.' },
  a8: { boost: 8, text: 'Serbian-only language limits buyer reach. No cross-border capability. Local volume agency — lower strategic fit for this listing.' },
  a9: { boost: 20, text: 'Hungarian base provides EU investor access. Strong diaspora connections across Balkans. Multilingual staff a plus.' },
  a10: { boost: 15, text: 'Belgrade presence and Russian-language capability helpful. Moderate performance metrics. Limited cross-border experience reduces overall score.' },
};

type Stage =
  | 'idle'
  | 'hard_filter'
  | 'rule_scoring'
  | 'llm_boost'
  | 'ranking'
  | 'waves'
  | 'done';

interface AgencyResult {
  id: string;
  name: string;
  city: string;
  country: string;
  rule_score: number;
  llm_boost: number;
  total: number;
  wave: number;
  passed_filter: boolean;
  explanation: string;
  languages: string[];
  response_rate: number;
  buyer_profiles: string[];
}

const STAGE_LABELS: Record<Stage, string> = {
  idle: 'Ready',
  hard_filter: 'Step 1 — Applying hard filters',
  rule_scoring: 'Step 2 — Rule-based scoring (80%)',
  llm_boost: 'Step 3 — LLM semantic boost (20%)',
  ranking: 'Step 4 — Ranking & sorting',
  waves: 'Step 5 — Assigning distribution waves',
  done: 'Complete',
};

function computeRuleScore(agency: typeof AGENCIES[0]): number {
  let score = 0;
  // Geo match (20%)
  if (agency.country === DEMO_PROPERTY.country) score += 20;
  else if (agency.cross_border) score += 12;
  // Specialisation (18%)
  if (agency.specializations.includes(DEMO_PROPERTY.property_type)) score += 18;
  // Buyer profile fit (20%)
  const bpOverlap = DEMO_PROPERTY.target_buyers.filter(b => agency.buyer_profiles.includes(b)).length;
  score += Math.round((bpOverlap / DEMO_PROPERTY.target_buyers.length) * 20);
  // Language (15%)
  const langOverlap = DEMO_PROPERTY.languages.filter(l => agency.languages.includes(l)).length;
  score += Math.round((langOverlap / DEMO_PROPERTY.languages.length) * 15);
  // Cross-border specialist (12%)
  if (agency.cross_border && DEMO_PROPERTY.is_cross_border) score += 12;
  // Response rate (10%)
  score += Math.round((agency.response_rate / 100) * 10);
  // Conversion (5%)
  score += Math.round((agency.conversion_rate / 20) * 5);
  return Math.min(score, 100);
}

export default function DemoAIMatchingPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [agencies, setAgencies] = useState<AgencyResult[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [currentLLMIdx, setCurrentLLMIdx] = useState(-1);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, msg]);
    setTimeout(() => logRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runDemo = async () => {
    setStage('idle');
    setAgencies([]);
    setLog([]);
    setCurrentLLMIdx(-1);
    await sleep(200);

    // STAGE 1 — Hard filters
    setStage('hard_filter');
    addLog('⚙️  Starting AI Matching Engine v2.1...');
    addLog(`📍 Property: ${DEMO_PROPERTY.title} · ${DEMO_PROPERTY.price.toLocaleString()} ${DEMO_PROPERTY.currency}`);
    addLog(`🎯 Target buyers: ${DEMO_PROPERTY.target_buyers.join(', ')}`);
    addLog(`🌍 Cross-border target: YES`);
    addLog('');
    addLog('━━━ STEP 1: Hard Filters ━━━');
    await sleep(600);

    const filtered: AgencyResult[] = [];
    for (const ag of AGENCIES) {
      await sleep(120);
      const passes = ag.languages.some(l => DEMO_PROPERTY.languages.includes(l));
      if (passes) {
        addLog(`  ✓ ${ag.name} — passed (language: ${ag.languages.filter(l => DEMO_PROPERTY.languages.includes(l)).join(', ')})`);
        filtered.push({ ...ag, rule_score: 0, llm_boost: 0, total: 0, wave: 0, passed_filter: true, explanation: '' });
      } else {
        addLog(`  ✗ ${ag.name} — filtered out (no matching language)`);
      }
    }
    addLog(`\n→ ${filtered.length}/${AGENCIES.length} agencies passed hard filters`);
    setAgencies(filtered.map(a => ({ ...a })));
    await sleep(700);

    // STAGE 2 — Rule scoring
    setStage('rule_scoring');
    addLog('\n━━━ STEP 2: Rule-Based Scoring (weight: 80%) ━━━');
    const withRules = filtered.map(ag => {
      const rs = computeRuleScore(AGENCIES.find(a => a.id === ag.id)!);
      return { ...ag, rule_score: rs };
    });
    for (const ag of withRules) {
      await sleep(150);
      addLog(`  ${ag.name}: rule_score = ${ag.rule_score}/100`);
    }
    setAgencies([...withRules]);
    await sleep(600);

    // STAGE 3 — LLM boost
    setStage('llm_boost');
    addLog('\n━━━ STEP 3: LLM Semantic Boost (weight: 20%) ━━━');
    addLog('  Model: gpt-4o-mini · Prompt: property context + agency profile');
    addLog('  Processing top agencies...\n');
    await sleep(500);

    const withLLM = [...withRules];
    for (let i = 0; i < withLLM.length; i++) {
      setCurrentLLMIdx(i);
      await sleep(350);
      const boost = LLM_EXPLANATIONS[withLLM[i].id]?.boost ?? 15;
      const explanation = LLM_EXPLANATIONS[withLLM[i].id]?.text ?? 'Adequate match for property profile.';
      withLLM[i] = { ...withLLM[i], llm_boost: boost, explanation };
      addLog(`  🤖 ${withLLM[i].name}`);
      addLog(`     boost: +${boost}/30 · "${explanation.slice(0, 80)}..."`);
      setAgencies([...withLLM]);
    }
    setCurrentLLMIdx(-1);
    await sleep(600);

    // STAGE 4 — Ranking
    setStage('ranking');
    addLog('\n━━━ STEP 4: Final Ranking ━━━');
    addLog('  Formula: total = rule_score × 0.8 + llm_boost × 0.2');
    await sleep(400);

    const ranked = withLLM
      .map(ag => ({ ...ag, total: Math.round(ag.rule_score * 0.8 + ag.llm_boost * 0.2) }))
      .sort((a, b) => b.total - a.total);

    for (const ag of ranked) {
      addLog(`  ${ag.total.toFixed(0).padStart(3)}pts  ${ag.name}`);
    }
    setAgencies([...ranked]);
    await sleep(700);

    // STAGE 5 — Waves
    setStage('waves');
    addLog('\n━━━ STEP 5: Distribution Waves ━━━');
    await sleep(400);

    const waved = ranked.map((ag, i) => ({
      ...ag,
      wave: i < 3 ? 1 : i < 6 ? 2 : 3,
    }));

    addLog(`  Wave 1 (send now):   ${waved.filter(a => a.wave === 1).map(a => a.name).join(', ')}`);
    await sleep(300);
    addLog(`  Wave 2 (+48h):       ${waved.filter(a => a.wave === 2).map(a => a.name).join(', ')}`);
    await sleep(300);
    addLog(`  Wave 3 (+96h):       ${waved.filter(a => a.wave === 3).map(a => a.name).join(', ')}`);
    setAgencies([...waved]);
    await sleep(600);

    // Done
    setStage('done');
    addLog('\n✅ Matching complete!');
    addLog(`   ${waved.length} agencies matched · 3 distribution waves · ready for owner approval`);
  };

  const stageColors: Record<Stage, string> = {
    idle: '#6b7280',
    hard_filter: '#d97706',
    rule_scoring: '#2563eb',
    llm_boost: '#7c3aed',
    ranking: '#0891b2',
    waves: '#16a34a',
    done: '#16a34a',
  };

  const waveColor = (wave: number) =>
    wave === 1 ? '#2563eb' : wave === 2 ? '#7c3aed' : '#6b7280';

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '0.75rem' }}>
          ← Back to dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              🤖 AI Matching Engine — Live Demo
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Watch how the engine finds the right agencies for a real property listing
            </p>
          </div>
          <button
            onClick={runDemo}
            disabled={stage !== 'idle' && stage !== 'done'}
            style={{
              background: stage === 'idle' || stage === 'done' ? 'var(--blue)' : 'var(--border)',
              color: stage === 'idle' || stage === 'done' ? 'white' : 'var(--text-tertiary)',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: '0.9375rem',
              fontWeight: 700,
              cursor: stage === 'idle' || stage === 'done' ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {stage === 'idle' ? '▶ Run AI Matching' : stage === 'done' ? '↺ Run Again' : '⏳ Running…'}
          </button>
        </div>
      </div>

      {/* Property card */}
      <div style={{
        background: 'var(--blue-light)',
        border: '1.5px solid var(--blue-border)',
        borderRadius: 12,
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Input property</div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{DEMO_PROPERTY.title}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{DEMO_PROPERTY.city}, {DEMO_PROPERTY.country} · {DEMO_PROPERTY.area}m² · €{DEMO_PROPERTY.price.toLocaleString()}</div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Commission', value: `${DEMO_PROPERTY.commission_pct}%` },
            { label: 'Target buyers', value: DEMO_PROPERTY.target_buyers.join(', ') },
            { label: 'Languages', value: DEMO_PROPERTY.languages.join(', ').toUpperCase() },
            { label: 'Cross-border', value: '✅ Yes' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
        {/* Stage indicator */}
        {stage !== 'idle' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: stageColors[stage],
              boxShadow: stage !== 'done' ? `0 0 0 3px ${stageColors[stage]}33` : 'none',
              animation: stage !== 'done' && stage !== 'idle' ? 'pulse 1s infinite' : 'none',
            }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: stageColors[stage] }}>
              {STAGE_LABELS[stage]}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Left — log */}
        <div>
          <div style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: '1rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            lineHeight: 1.7,
            color: '#94a3b8',
            height: 480,
            overflowY: 'auto',
            border: '1px solid #1e293b',
          }} ref={logRef}>
            {log.length === 0 ? (
              <span style={{ color: '#475569' }}>Press ▶ Run AI Matching to start the demo…</span>
            ) : (
              log.map((line, i) => (
                <div key={i} style={{
                  color: line.startsWith('━') ? '#f1f5f9' :
                    line.startsWith('✅') ? '#4ade80' :
                    line.startsWith('  ✓') ? '#34d399' :
                    line.startsWith('  ✗') ? '#f87171' :
                    line.startsWith('  🤖') ? '#c084fc' :
                    line.startsWith('  Wave') ? '#60a5fa' :
                    line.startsWith('📍') || line.startsWith('🎯') || line.startsWith('🌍') ? '#fbbf24' :
                    line.startsWith('⚙️') ? '#e2e8f0' :
                    line.startsWith('→') ? '#38bdf8' : '#94a3b8',
                  fontWeight: line.startsWith('━') || line.startsWith('✅') ? 600 : 400,
                }}>
                  {line || '\u00a0'}
                </div>
              ))
            )}
            {stage !== 'idle' && stage !== 'done' && (
              <span style={{ color: '#7c3aed', animation: 'blink 1s infinite' }}>█</span>
            )}
          </div>
        </div>

        {/* Right — results table */}
        <div>
          <div style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            height: 480,
            overflowY: 'auto',
          }}>
            {agencies.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                Results will appear here…
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Agency</th>
                    <th style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Rule</th>
                    <th style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>LLM</th>
                    <th style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Total</th>
                    <th style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Wave</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((ag, idx) => (
                    <tr key={ag.id} style={{
                      borderBottom: '1px solid var(--border)',
                      background: idx === currentLLMIdx ? 'var(--purple-light)' : 'transparent',
                      transition: 'background 0.3s',
                    }}>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{ag.name}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem', marginTop: 1 }}>{ag.city}, {ag.country}</div>
                        {ag.explanation && (
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginTop: 3, fontStyle: 'italic', lineHeight: 1.4 }}>
                            "{ag.explanation.slice(0, 70)}…"
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                        {ag.rule_score > 0 ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{ag.rule_score}</div>
                            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 3, width: 36, margin: '3px auto 0' }}>
                              <div style={{ height: '100%', width: `${ag.rule_score}%`, background: 'var(--blue)', borderRadius: 2 }} />
                            </div>
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                        {ag.llm_boost > 0 ? (
                          <span style={{ color: 'var(--purple)', fontWeight: 700 }}>+{ag.llm_boost}</span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                        {ag.total > 0 ? (
                          <span style={{
                            background: ag.total >= 70 ? 'var(--green-light)' : ag.total >= 50 ? 'var(--blue-light)' : 'var(--surface-2)',
                            color: ag.total >= 70 ? 'var(--green)' : ag.total >= 50 ? 'var(--blue)' : 'var(--text-secondary)',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: '0.8125rem',
                          }}>{ag.total}</span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                        {ag.wave > 0 ? (
                          <span style={{
                            background: `${waveColor(ag.wave)}1a`,
                            color: waveColor(ag.wave),
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                          }}>W{ag.wave}</span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Summary after done */}
      {stage === 'done' && (
        <div style={{
          marginTop: '1.25rem',
          background: 'var(--green-light)',
          border: '1.5px solid var(--green-border)',
          borderRadius: 12,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--green)' }}>
              ✅ Matching complete — {agencies.length} agencies found
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Top match: <strong>{agencies[0]?.name}</strong> · Score: {agencies[0]?.total} ·
              Wave 1 ready to send after owner approval
            </div>
          </div>
          <Link href="/properties/new" style={{
            background: 'var(--green)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.875rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            → List your property now
          </Link>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
