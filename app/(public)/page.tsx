'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// âââ 2027 Dark Palette âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const C = {
  bg: '#F8F7F2',
  bgDark: '#0D0D1A',
  text: '#0D0D1A',
  textMid: '#4A5568',
  textLight: '#718096',
  white: '#FFFFFF',
  accent: '#1B4332',
  accentMid: '#2D6A4F',
  accentLight: '#52B788',
  gold: '#C9A227',
  border: 'rgba(0,0,0,0.08)',
  card: 'rgba(255,255,255,0.92)',
  glass: 'rgba(255,255,255,0.15)',
};
// âââ Cinematic Canvas Hero âââââââââââââââââââââââââââââââââââââââââââââââââââââ
function CinematicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    phase: 0,
    t: 0,
    nodes: [] as {x:number;y:number;vx:number;vy:number;r:number;a:number;pulse:number}[],
    waves: [] as {x:number;y:number;r:number;a:number;speed:number}[],
    particles: [] as {x:number;y:number;tx:number;ty:number;prog:number;speed:number;a:number}[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Init nodes (agency dots scattered across canvas)
    const initNodes = () => {
      stateRef.current.nodes = Array.from({length: 28}, (_, i) => ({
        x: 60 + Math.random() * (W() - 120),
        y: 40 + Math.random() * (H() - 80),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 2 + Math.random() * 3,
        a: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2,
      }));
    };
    initNodes();

    // Property node in center
    const propX = () => W() * 0.5;
    const propY = () => H() * 0.5;

    const draw = () => {
      const s = stateRef.current;
      s.t += 0.008;
      const w = W(), h = H();

      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const bgGrad = ctx.createRadialGradient(w*0.5, h*0.4, 0, w*0.5, h*0.4, w*0.8);
      bgGrad.addColorStop(0, '#0D0D2A');
      bgGrad.addColorStop(0.5, '#080814');
      bgGrad.addColorStop(1, '#050508');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Nebula glow center
      const nebulaGrad = ctx.createRadialGradient(propX(), propY(), 0, propX(), propY(), 200);
      nebulaGrad.addColorStop(0, 'rgba(245,194,0,0.08)');
      nebulaGrad.addColorStop(0.5, 'rgba(59,91,219,0.04)');
      nebulaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, w, h);

      // Connection lines from center to nodes
      s.nodes.forEach((node, i) => {
        const dist = Math.hypot(node.x - propX(), node.y - propY());
        const maxDist = Math.hypot(w, h) * 0.6;
        const alpha = Math.max(0, 1 - dist / maxDist) * 0.15;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(245,194,0,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(propX(), propY());
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        // Animated particle traveling along line
        const particlePos = (s.t * 0.4 + i * 0.13) % 1;
        const px = propX() + (node.x - propX()) * particlePos;
        const py = propY() + (node.y - propY()) * particlePos;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,194,0,${alpha * 4})`;
        ctx.fill();
      });

      // Node dots (agencies)
      s.nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.03;
        if (node.x < 20 || node.x > w - 20) node.vx *= -1;
        if (node.y < 20 || node.y > h - 20) node.vy *= -1;

        const pulse = Math.sin(node.pulse) * 0.4 + 0.6;

        // Glow
        const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 20);
        glowGrad.addColorStop(0, `rgba(245,194,0,${0.15 * pulse})`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = i < 10 ? `rgba(245,194,0,${0.8 * pulse})` : `rgba(100,130,255,${0.6 * pulse})`;
        ctx.fill();
      });

      // Center property node â large glowing orb
      const cx = propX(), cy = propY();

      // Outer ring pulse
      const ringR = 40 + Math.sin(s.t * 2) * 8;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245,194,0,${0.15 + Math.sin(s.t * 2) * 0.08})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const ringR2 = 28 + Math.sin(s.t * 2 + 1) * 5;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245,194,0,${0.25 + Math.sin(s.t * 2) * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      coreGrad.addColorStop(0, 'rgba(245,194,0,0.4)');
      coreGrad.addColorStop(0.3, 'rgba(245,194,0,0.15)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#F5C200';
      ctx.fill();

      // House icon in center
      ctx.fillStyle = '#080810';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 5);
      ctx.lineTo(cx - 6, cy + 2);
      ctx.lineTo(cx + 6, cy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(cx - 3, cy + 2, 6, 5);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.9 }}
    />
  );
}

// âââ Glass Card âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function GlassCard({ children, style = {}, glow = false }: { children: React.ReactNode; style?: React.CSSProperties; glow?: boolean }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${glow ? 'rgba(245,194,0,0.25)' : C.border}`,
      borderRadius: 20,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: glow ? '0 0 40px rgba(245,194,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// âââ Live Product Preview Card âââââââââââââââââââââââââââââââââââââââââââââââââ
// âââ Demo Data âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const DEMO_AGENCIES = [
  { initials: 'E&', name: 'Engel & Volkers',     city: 'Budva',            score: 97, status: 'replied',   statusColor: '#22C55E' },
  { initials: 'SR', name: "Sotheby's Realty",    city: 'Porto Montenegro', score: 94, status: 'opened',    statusColor: '#F5C200' },
  { initials: 'SI', name: 'Savills International',city: 'London',           score: 91, status: 'sent',      statusColor: '#3B5BDB' },
  { initials: 'KF', name: 'Knight Frank Serbia', city: 'Belgrade',         score: 88, status: 'sending...',  statusColor: '#6B7280' },
]
const DEMO_STAGES = ['matching', 'offer', 'signing', 'sent'] as const
type DemoStage = (typeof DEMO_STAGES)[number]
const DEMO_DURATIONS: Record<DemoStage, number> = { matching: 3500, offer: 3500, signing: 3200, sent: 3000 }

// âââ Stage: Matching âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function DemoStageMatching() {
  const [revealed, setRevealed] = useState(0)
  useEffect(() => {
    setRevealed(0)
    const timers = DEMO_AGENCIES.map((_, i) =>
      setTimeout(() => setRevealed(i + 1), 200 + i * 350)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ padding: '0 0 4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#F5C200', opacity: 0.9 }}>
          AI MATCHING - WAVE 1
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>4 / 18 agencies</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DEMO_AGENCIES.map((ag, i) => (
          <div key={ag.name} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
            background: i === 0 ? 'rgba(245,194,0,0.08)' : 'rgba(255,255,255,0.03)',
            border: '1px solid ' + (i === 0 ? 'rgba(245,194,0,0.2)' : 'rgba(255,255,255,0.06)'),
            opacity: revealed > i ? 1 : 0,
            transform: revealed > i ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
              {ag.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ag.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{ag.city}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F5C200', flexShrink: 0 }}>{ag.score}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: ag.statusColor + '22', color: ag.statusColor, flexShrink: 0 }}>
              {ag.status}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Distribution progress</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Wave 1 of 3</span>
      </div>
      <div style={{ marginTop: 4, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
        <div style={{ height: '100%', width: '32%', background: '#F5C200', borderRadius: 1 }} />
      </div>
    </div>
  )
}

// âââ Stage: Offer ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function DemoStageOffer() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px', gap: 14, opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245,194,0,0.12)', border: '1px solid rgba(245,194,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
        ð
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 4 }}>Exclusive Offer Ready</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          AI prepared a personalised offer for<br />
          <span style={{ color: '#F5C200' }}>18 top agencies</span> in 3 waves
        </div>
      </div>
      <div style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: '0.06em' }}>OFFER PREVIEW</div>
        {['Villa Sveti Stefan, Budva', 'EUR 485k - 210 sqm', 'Exclusive mandate - 90 days'].map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F5C200', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{line}</span>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', padding: '9px 0', borderRadius: 8, textAlign: 'center', background: 'linear-gradient(135deg, #F5C200, #F09000)', fontSize: 11, fontWeight: 700, color: '#0a0a0a' }}>
        Review &amp; Approve â
      </div>
    </div>
  )
}

// âââ Stage: Signing ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function DemoStageSigning() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setProgress(p => Math.min(p + 4, 100)), 80)
    return () => clearInterval(t)
  }, [])
  const done = progress >= 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px', gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: done ? 'rgba(34,197,94,0.12)' : 'rgba(59,91,219,0.12)', border: '1px solid ' + (done ? 'rgba(34,197,94,0.3)' : 'rgba(59,91,219,0.3)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, transition: 'all 0.4s ease' }}>
        {done ? 'â' : 'âï¸'}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 4 }}>{done ? 'Contract Signed!' : 'Owner Signing...'}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{done ? 'Distribution starts in 3 sec' : 'Exclusive agency mandate'}</div>
      </div>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Signing progress</span>
          <span style={{ fontSize: 9, color: done ? '#22C55E' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{progress}%</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
          <div style={{ height: '100%', borderRadius: 3, width: progress + '%', background: done ? '#22C55E' : 'linear-gradient(90deg, #3B5BDB, #7C3AED)', transition: 'width 0.08s linear, background 0.4s ease' }} />
        </div>
      </div>
      <div style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <svg width="100%" height="36" viewBox="0 0 200 36">
          <path
            d="M 10 28 C 30 10, 50 32, 70 18 C 90 4, 110 30, 130 16 C 150 2, 170 24, 190 20"
            fill="none"
            stroke={done ? '#22C55E' : '#F5C200'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset={220 - (220 * progress) / 100}
            style={{ transition: 'stroke-dashoffset 0.08s linear, stroke 0.4s ease' }}
          />
        </svg>
      </div>
    </div>
  )
}

// âââ Stage: Sent âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function DemoStageSent() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (count < 18) {
      const t = setTimeout(() => setCount(c => c + 1), 120)
      return () => clearTimeout(t)
    }
  }, [count])

  const waves = [
    { label: 'Wave 1', sent: Math.min(count, 10), total: 10, color: '#22C55E' },
    { label: 'Wave 2', sent: Math.max(0, Math.min(count - 10, 5)), total: 5, color: '#F5C200' },
    { label: 'Wave 3', sent: Math.max(0, Math.min(count - 15, 3)), total: 3, color: '#3B5BDB' },
  ]

  return (
    <div style={{ padding: '0 0 4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#22C55E' }}>
          â SENT - {count} AGENCIES
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>3 waves</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {waves.map(w => (
          <div key={w.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{w.label}</span>
              <span style={{ fontSize: 10, color: w.color, fontWeight: 600 }}>{w.sent}/{w.total} sent</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ height: '100%', borderRadius: 2, background: w.color, width: (w.total > 0 ? (w.sent / w.total) * 100 : 0) + '%', transition: 'width 0.12s ease' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: '8px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>New lead received!</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Engel &amp; Volkers - 2m ago</div>
        </div>
      </div>
    </div>
  )
}

// âââ ProductPreview ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function ProductPreview() {
  const [stageIdx, setStageIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const stage = DEMO_STAGES[stageIdx]

  useEffect(() => {
    const t = setTimeout(() => {
      setFading(true)
      setTimeout(() => {
        setStageIdx(i => (i + 1) % DEMO_STAGES.length)
        setFading(false)
      }, 250)
    }, DEMO_DURATIONS[stage])
    return () => clearTimeout(t)
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: 260, background: 'linear-gradient(145deg, #111118, #0d0d14)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}>
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {['#FF5F57','#FFBD2E','#28C840'].map(c => (
          <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 6, fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>PropBlaze AI</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
          {DEMO_STAGES.map((s, i) => (
            <div key={s} style={{ width: 6, height: 6, borderRadius: '50%', background: i === stageIdx ? '#F5C200' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s ease' }} />
          ))}
        </div>
      </div>
      {/* Property header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #1a2a3a, #0d1a2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>ð </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: '#F5C200', fontWeight: 700, letterSpacing: '0.08em' }}>VILLA - BUDVA</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>Sveti Stefan</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>EUR 485k - 210 sqm</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>AI Score</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#F5C200', lineHeight: 1 }}>97</div>
        </div>
      </div>
      {/* Stage content */}
      <div style={{ padding: '12px 14px', opacity: fading ? 0 : 1, transform: fading ? 'translateY(4px)' : 'translateY(0)', transition: 'opacity 0.25s ease, transform 0.25s ease', minHeight: 200 }}>
        {stage === 'matching' && <DemoStageMatching key={stageIdx} />}
        {stage === 'offer'    && <DemoStageOffer    key={stageIdx} />}
        {stage === 'signing'  && <DemoStageSigning  key={stageIdx} />}
        {stage === 'sent'     && <DemoStageSent     key={stageIdx} />}
      </div>
      {/* Bottom stage indicator */}
      <div style={{ padding: '6px 14px 10px', display: 'flex', justifyContent: 'center', gap: 4 }}>
        {DEMO_STAGES.map((s, i) => (
          <div key={s} style={{ height: 2, borderRadius: 1, flex: i === stageIdx ? 2 : 1, background: i === stageIdx ? '#F5C200' : 'rgba(255,255,255,0.12)', transition: 'all 0.3s ease' }} />
        ))}
      </div>
    </div>
  )
}

function AnimatedStat({ value, suffix = '', label }: { value: string; suffix?: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign:'center' }}>
      <div style={{
        fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:800,
        background: C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        lineHeight:1, marginBottom:6,
        opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
        transition:'all 0.6s ease',
      }}>
        {value}{suffix}
      </div>
      <div style={{ fontSize:'0.8rem', color:C.white60 }}>{label}</div>
    </div>
  );
}

// âââ Section fade in ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// âââ Step card ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function StepCard({ n, title, desc, icon }: { n: string; title: string; desc: string; icon: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:'relative', padding:28, borderRadius:20,
        background: hov ? C.surface2 : C.surface,
        border: `1px solid ${hov ? 'rgba(245,194,0,0.25)' : C.border}`,
        transition:'all 0.3s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(245,194,0,0.08)' : 'none',
        cursor:'default',
      }}>
      {/* Step number */}
      <div style={{ position:'absolute', top:16, right:20, fontSize:'0.65rem', fontWeight:700, color:C.white20, letterSpacing:'0.1em' }}>
        {n}
      </div>
      {/* Icon */}
      <div style={{
        width:48, height:48, borderRadius:14, marginBottom:20,
        background: hov ? 'rgba(245,194,0,0.15)' : 'rgba(245,194,0,0.08)',
        border: `1px solid rgba(245,194,0,${hov ? '0.3' : '0.15'})`,
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.3s ease',
      }}>
        {icon}
      </div>
      <div style={{ fontSize:'1.05rem', fontWeight:700, color:C.white, marginBottom:10 }}>{title}</div>
      <div style={{ fontSize:'0.82rem', color:C.white60, lineHeight:1.6 }}>{desc}</div>
    </div>
  );
}

// âââ Feature row ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function FeatureRow({ icon, title, desc, accent = false }: { icon: React.ReactNode; title: string; desc: string; accent?: boolean }) {
  return (
    <div style={{ display:'flex', gap:16, padding:'20px 24px', borderRadius:16, background: accent ? 'rgba(245,194,0,0.06)' : 'transparent', border:`1px solid ${accent ? 'rgba(245,194,0,0.15)' : 'transparent'}` }}>
      <div style={{
        width:42, height:42, borderRadius:12, flexShrink:0,
        background:'rgba(245,194,0,0.1)', border:'1px solid rgba(245,194,0,0.2)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:'0.9rem', fontWeight:700, color:C.white, marginBottom:5 }}>{title}</div>
        <div style={{ fontSize:'0.8rem', color:C.white60, lineHeight:1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

// âââ Pricing Card âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PricingCard({ name, price, desc, features, highlight = false }: {
  name: string; price: string; desc: string; features: string[]; highlight?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:32, borderRadius:24, flex:1, minWidth:260, maxWidth:340,
        background: highlight ? 'linear-gradient(160deg, rgba(245,194,0,0.12) 0%, rgba(245,194,0,0.04) 100%)' : C.surface,
        border:`1px solid ${highlight ? 'rgba(245,194,0,0.4)' : C.border}`,
        transform: hov ? 'translateY(-6px)' : (highlight ? 'translateY(-8px)' : 'none'),
        transition:'transform 0.3s ease',
        boxShadow: highlight ? '0 30px 80px rgba(245,194,0,0.12)' : 'none',
        position:'relative',
      }}>
      {highlight && (
        <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:C.yellow, borderRadius:8, padding:'4px 14px', fontSize:'0.65rem', fontWeight:800, color:C.bg, letterSpacing:'0.1em' }}>
          MOST POPULAR
        </div>
      )}
      <div style={{ fontSize:'0.7rem', fontWeight:700, color: highlight ? C.yellow : C.white60, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>{name}</div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:4, marginBottom:8 }}>
        <div style={{ fontSize:'2.5rem', fontWeight:800, color:C.white, lineHeight:1 }}>{price}</div>
        <div style={{ fontSize:'0.8rem', color:C.white40, marginBottom:6 }}>/mo</div>
      </div>
      <div style={{ fontSize:'0.8rem', color:C.white60, marginBottom:24, lineHeight:1.5 }}>{desc}</div>
      <div style={{ height:1, background:C.border, marginBottom:20 }}/>
      {features.map((f, i) => (
        <div key={i} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:2 }}>
            <circle cx="8" cy="8" r="7" fill={highlight ? 'rgba(245,194,0,0.15)' : 'rgba(255,255,255,0.06)'} stroke={highlight ? 'rgba(245,194,0,0.4)' : C.border}/>
            <path d="M5 8l2 2 4-4" stroke={highlight ? C.yellow : C.white60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize:'0.8rem', color:C.white80, lineHeight:1.5 }}>{f}</span>
        </div>
      ))}
      <Link href="/login" style={{
        display:'block', textAlign:'center', marginTop:24, padding:'13px 0',
        borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:'0.85rem',
        background: highlight ? C.grad1 : 'transparent',
        color: highlight ? C.bg : C.white80,
        border: highlight ? 'none' : `1px solid ${C.border2}`,
        transition:'all 0.2s ease',
      }}>
        Get started
      </Link>
    </div>
  );
}

// âââ Navbar âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function Navbar({ lang = 'EN', setLang = ()=>{} }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  const navBg = scrolled ? 'rgba(255,255,255,0.96)' : 'transparent';
  const navBorder = scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent';
  const logoColor = scrolled ? '#0D0D1A' : '#FFFFFF';
  const linkColor = scrolled ? '#4A5568' : 'rgba(255,255,255,0.88)';
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 68, display: 'flex', alignItems: 'center',
      padding: '0 max(24px,calc(50vw - 620px))',
      justifyContent: 'space-between',
      background: navBg, borderBottom: navBorder,
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'all 0.35s ease',
    }}>
      <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M15 2L28 10.5V28H20V19H10V28H2V10.5L15 2Z" fill="#1B4332"/>
          <path d="M15 7L24 13V23H20V16H10V23H6V13L15 7Z" fill="#52B788" opacity="0.75"/>
        </svg>
        <span style={{ fontWeight:800, fontSize:19, color:logoColor, letterSpacing:'-0.5px', transition:'color 0.35s' }}>PropBlaze</span>
      </a>
      <div style={{ display:'flex', alignItems:'center', gap:36 }}>
        {['Features','Agencies','Pricing'].map(l => (
          <a key={l} href={'#'+l.toLowerCase()} style={{
            color: linkColor, textDecoration:'none', fontSize:14, fontWeight:500,
            transition:'color 0.35s',
          }}>{l}</a>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{
          display:'flex', alignItems:'center', gap:2, padding:3, borderRadius:10,
          background: scrolled ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)',
          border: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.2)',
        }}>
          {['EN','RU','SR'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding:'5px 11px', borderRadius:7, border:'none', cursor:'pointer',
              fontSize:12, fontWeight:700, transition:'all 0.2s',
              background: lang===l ? '#FFFFFF' : 'transparent',
              color: lang===l ? '#0D0D1A' : linkColor,
              boxShadow: lang===l ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
            }}>{l}</button>
          ))}
        </div>
        <a href="/sign-in" style={{
          color: linkColor, textDecoration:'none', fontSize:14, fontWeight:500, transition:'color 0.35s',
        }}>Sign in</a>
        <a href="/sign-up" style={{
          background:'#1B4332', color:'#FFFFFF', padding:'10px 22px',
          borderRadius:10, textDecoration:'none', fontSize:14, fontWeight:700,
          boxShadow:'0 4px 14px rgba(27,67,50,0.45)', transition:'all 0.2s',
        }}>Get started</a>
      </div>
    </nav>
  );
}

// ===

export default function HomePage() {
  const [lang, setLang] = useState('EN');
  const T = {
    EN: {
      tag: 'AI-Powered Property Distribution',
      h1a: 'Sell Smarter.',
      h1b: 'Reach Every Agency.',
      sub: 'PropBlaze matches your property with the right agencies across Europe and sends a personalised offer — automatically, in minutes.',
      cta1: 'List your property',
      cta2: 'How it works',
      s1n: '500+', s1l: 'Agencies',
      s2n: '12', s2l: 'Countries',
      s3n: '5 min', s3l: 'To launch',
    },
    RU: {
      tag: 'AI-подбор агентств недвижимости',
      h1a: 'Ваш объект.',
      h1b: 'Лучшие агентства.',
      sub: 'PropBlaze подбирает агентства под ваш объект и отправляет персональное предложение — автоматически, за минуты.',
      cta1: 'Разместить объект',
      cta2: 'Как это работает',
      s1n: '500+', s1l: 'Агентств',
      s2n: '12', s2l: 'Стран',
      s3n: '5 мин', s3l: 'До запуска',
    },
    SR: {
      tag: 'AI distribucija nekretnina',
      h1a: 'Vasa nekretnina.',
      h1b: 'Prave agencije.',
      sub: 'PropBlaze pronalazi agencije za vasu nekretninu i salje personalizovanu ponudu automatski, za nekoliko minuta.',
      cta1: 'Oglasi nekretninu',
      cta2: 'Kako funkcionise',
      s1n: '500+', s1l: 'Agencija',
      s2n: '12', s2l: 'Zemalja',
      s3n: '5 min', s3l: 'Do starta',
    },
  };
  const tx = T[lang] || T.EN;
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif" }}>
      <Navbar lang={lang} setLang={setLang} />

      {/* ===== HERO ===== */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden' }}>
        <style>{`
          @keyframes kbZoom {
            0%   { transform: scale(1.0) translate(0px, 0px); }
            40%  { transform: scale(1.07) translate(-12px, -6px); }
            100% { transform: scale(1.12) translate(6px, -10px); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeUp2 {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* BG image with Ken Burns */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85"
            alt=""
            style={{
              width:'100%', height:'100%', objectFit:'cover',
              animation:'kbZoom 22s ease-in-out infinite alternate',
              transformOrigin:'center center',
            }}
          />
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(110deg, rgba(8,16,12,0.78) 0%, rgba(8,16,12,0.60) 52%, rgba(8,16,12,0.35) 100%)',
          }} />
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(to top, rgba(8,16,12,0.6) 0%, transparent 50%)',
          }} />
        </div>

        {/* Content grid */}
        <div style={{
          position:'relative', zIndex:2, width:'100%',
          maxWidth:1280, margin:'0 auto',
          padding:'130px max(32px,calc(50vw - 608px)) 90px',
          display:'grid', gridTemplateColumns:'1fr 520px',
          gap:64, alignItems:'center',
        }}>
          {/* Left col */}
          <div style={{ animation:'fadeUp 0.7s 0.1s ease both' }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'rgba(82,183,136,0.18)', border:'1px solid rgba(82,183,136,0.35)',
              borderRadius:100, padding:'7px 18px', marginBottom:30,
            }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#52B788', display:'inline-block', flexShrink:0 }} />
              <span style={{ color:'#A8EFC8', fontSize:12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{tx.tag}</span>
            </div>

            <h1 style={{ margin:'0 0 24px', lineHeight:1.06, fontWeight:800, letterSpacing:'-1.5px' }}>
              <span style={{ display:'block', fontSize:'clamp(44px,5.2vw,74px)', color:'#FFFFFF' }}>{tx.h1a}</span>
              <span style={{ display:'block', fontSize:'clamp(44px,5.2vw,74px)', color:'#52B788' }}>{tx.h1b}</span>
            </h1>

            <p style={{
              color:'rgba(255,255,255,0.72)', fontSize:18, lineHeight:1.7,
              margin:'0 0 42px', maxWidth:500, fontWeight:400,
            }}>{tx.sub}</p>

            <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:52 }}>
              <a href="/sign-up" style={{
                background:'#52B788', color:'#0A1410',
                padding:'16px 34px', borderRadius:12,
                textDecoration:'none', fontSize:16, fontWeight:800,
                display:'inline-flex', alignItems:'center', gap:10,
                boxShadow:'0 8px 28px rgba(82,183,136,0.45)',
              }}>
                {tx.cta1}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#features" style={{
                color:'rgba(255,255,255,0.88)',
                padding:'16px 28px', borderRadius:12,
                textDecoration:'none', fontSize:16, fontWeight:600,
                border:'1px solid rgba(255,255,255,0.28)',
                backdropFilter:'blur(8px)',
              }}>{tx.cta2}</a>
            </div>

            <div style={{ display:'flex', gap:40 }}>
              {[
                { n: tx.s1n, l: tx.s1l },
                { n: tx.s2n, l: tx.s2l },
                { n: tx.s3n, l: tx.s3l },
              ].map((st,i) => (
                <div key={i} style={{ borderLeft: i>0?'1px solid rgba(255,255,255,0.15)':'none', paddingLeft: i>0?40:0 }}>
                  <div style={{ color:'#FFFFFF', fontWeight:800, fontSize:22, letterSpacing:'-0.5px' }}>{st.n}</div>
                  <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginTop:3, fontWeight:500 }}>{st.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right col: ProductPreview */}
          <div style={{ animation:'fadeUp2 0.7s 0.25s ease both' }}>
            <ProductPreview />
          </div>
        </div>

        {/* Scroll line */}
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, opacity:0.5 }}>
          <div style={{ width:1, height:44, background:'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))' }} />
          <div style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.6)' }} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="features" style={{ padding:'100px max(40px,calc(50vw - 600px))' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:16 }}>
              From listing to agencies<br/>
              <span style={{ background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>in under 10 minutes</span>
            </h2>
            <p style={{ fontSize:'1rem', color:C.white60, maxWidth:500, margin:'0 auto' }}>Three simple steps. No agency calls, no chasing. Just results.</p>
          </div>
        </FadeIn>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          {[
            {
              n:'01', title:'Describe your property', icon:(
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 9V19H8V14H14V19H19V9L11 2Z" stroke={C.yellow} strokeWidth="1.5" strokeLinejoin="round"/></svg>
              ),
              desc:'Fill in our smart wizard in 5â10 minutes. Upload photos, set your price, and tell us your target buyer.',
            },
            {
              n:'02', title:'AI builds your sales pack', icon:(
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={C.yellow} strokeWidth="1.5"/><path d="M8 11l2 2 4-4" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>
              ),
              desc:'Our AI writes professional descriptions in 3 languages and selects the best-matching agencies from our database.',
            },
            {
              n:'03', title:'You approve, we distribute', icon:(
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 11L7 7L11 11" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/><path d="M7 7V17M11 11H19M15 7L19 11L15 15" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>
              ),
              desc:'Review the offer list, confirm, and watch 10â30 personalised emails reach top agencies. Every reply lands in your inbox.',
            },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 120}>
              <StepCard {...s} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* âââ FEATURES GRID ââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section style={{ background:C.bg2, padding:'100px max(40px,calc(50vw - 600px))' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', maxWidth:1200, margin:'0 auto' }}>
          {/* Left */}
          <FadeIn>
            <div>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>PLATFORM FEATURES</div>
              <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2, marginBottom:20 }}>
                Everything built<br/>for serious sellers
              </h2>
              <p style={{ fontSize:'0.95rem', color:C.white60, lineHeight:1.7, marginBottom:36 }}>
                Designed from the ground up for property owners who want professional exposure without the agency markup.
              </p>
              <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:'0.85rem', background:C.grad1, color:C.bg }}>
                Start for free
              </Link>
            </div>
          </FadeIn>

          {/* Right */}
          <FadeIn delay={150}>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={C.yellow} strokeWidth="1.5"/><path d="M6 9l2 2 4-4" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Owner-controlled approval', desc:'You see every agency before your offer goes out. Nothing sends without your confirmation.', accent:true },
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l3-6 3 12 3-6 2 0" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'AI matching engine', desc:'Hard filters + weighted scoring + LLM semantic boost ranks agencies by probability of sale.' },
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke={C.yellow} strokeWidth="1.5"/><path d="M5 8h8M5 11h5" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Multi-channel delivery', desc:'Email + WhatsApp Business + Telegram. Every agency reply forwarded to you instantly.' },
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke={C.yellow} strokeWidth="1.5"/></svg>, title:'3-wave distribution strategy', desc:'Top agencies first. If no response, expand automatically to wave 2 and 3. Maximum reach.' },
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M14 3H4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V4a1 1 0 00-1-1z" stroke={C.yellow} strokeWidth="1.5"/><path d="M7 9l2 2 4-4" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Mark as Sold â stops billing', desc:'One click marks your property sold. Subscription stops automatically. No manual cancellation.' },
              ].map((f, i) => (
                <FeatureRow key={i} {...f} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* âââ AGENCY NETWORK âââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section id="agencies" style={{ padding:'100px max(40px,calc(50vw - 600px))' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>AGENCY NETWORK</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:16 }}>
              500+ verified agencies.<br/>
              <span style={{ background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Across Europe & beyond.</span>
            </h2>
            <p style={{ fontSize:'1rem', color:C.white60, maxWidth:500, margin:'0 auto' }}>
              From boutique local specialists to global brands â our AI selects who's most likely to sell your property.
            </p>
          </div>
        </FadeIn>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {[
            { name:'Engel & Volkers', city:'Budva - Montenegro', score:97, speciality:'Luxury Adriatic', tags:['Luxury','HNWI','Cross-border'] },
            { name:"Sotheby's Realty", city:'Porto Montenegro', score:94, speciality:'Ultra-premium', tags:['HNWI','UK buyers'] },
            { name:'Savills International', city:'London - Global', score:91, speciality:'Investment grade', tags:['International','Balkans desk'] },
            { name:'Knight Frank', city:'Belgrade - Serbia', score:88, speciality:'Premium Balkans', tags:['Balkans','DACH'] },
            { name:'Win-Win Solution', city:'Belgrade - Serbia', score:96, speciality:'Local Expert', tags:['Belgrade','Fast response'] },
            { name:'Tranio Partners', city:'Berlin - Germany', score:85, speciality:'German-speaking buyers', tags:['Expats','Digital'] },
          ].map((ag, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                padding:20, borderRadius:16,
                background:C.surface, border:`1px solid ${C.border}`,
                transition:'all 0.3s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid rgba(245,194,0,0.3)`; (e.currentTarget as HTMLDivElement).style.background = C.surface2; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${C.border}`; (e.currentTarget as HTMLDivElement).style.background = C.surface; }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:'0.9rem', fontWeight:700, color:C.white, marginBottom:3 }}>{ag.name}</div>
                    <div style={{ fontSize:'0.7rem', color:C.white60 }}>{ag.city}</div>
                  </div>
                  <div style={{ background:'rgba(245,194,0,0.1)', border:'1px solid rgba(245,194,0,0.25)', borderRadius:8, padding:'4px 10px', fontSize:'0.75rem', fontWeight:800, color:C.yellow }}>
                    {ag.score}
                  </div>
                </div>
                <div style={{ fontSize:'0.75rem', color:C.yellow, marginBottom:10 }}>{ag.speciality}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {ag.tags.map(t => (
                    <span key={t} style={{ fontSize:'0.6rem', fontWeight:600, color:C.white60, padding:'3px 8px', borderRadius:6, background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}` }}>{t}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* âââ PRICING ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section id="pricing" style={{ background:C.bg2, padding:'100px max(40px,calc(50vw - 600px))' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>PRICING</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:16 }}>
              Simple, transparent.<br/>
              <span style={{ background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Cancel when sold.</span>
            </h2>
            <p style={{ fontSize:'1rem', color:C.white60, maxWidth:440, margin:'0 auto' }}>No commission. No per-agency fees. Pay monthly, stop the moment your property sells.</p>
          </div>
        </FadeIn>
        <div style={{ display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap', alignItems:'center' }}>
          <FadeIn delay={0}>
            <PricingCard
              name="Starter"
              price="EUR49"
              desc="Perfect for a single property. AI matching, email distribution, basic analytics."
              features={['1 active property','AI sales pack (3 languages)','Up to 15 agencies','Email distribution','Basic lead tracking','Mark as Sold']}
            />
          </FadeIn>
          <FadeIn delay={120}>
            <PricingCard
              name="Pro"
              price="EUR99"
              desc="More agencies, more channels, priority AI matching and full distribution analytics."
              highlight
              features={['1 active property','AI sales pack (3 languages)','Up to 30 agencies','Email + WhatsApp + Telegram','Full lead management','3-wave strategy','Priority AI matching','Distribution analytics']}
            />
          </FadeIn>
          <FadeIn delay={240}>
            <PricingCard
              name="Agency / Multi"
              price="EUR199"
              desc="For agents managing multiple listings. Bulk distribution, white-label options."
              features={['Up to 5 active properties','Everything in Pro','Bulk distribution','Agency portal access','White-label offers','API access (coming)']}
            />
          </FadeIn>
        </div>
      </section>

      {/* âââ FINAL CTA ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section style={{ position:'relative', padding:'120px max(40px,calc(50vw - 600px))', textAlign:'center', overflow:'hidden' }}>
        {/* Glow */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:400, borderRadius:'50%', background:'rgba(245,194,0,0.06)', filter:'blur(80px)', pointerEvents:'none' }}/>
        <FadeIn>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:20 }}>GET STARTED TODAY</div>
            <h2 style={{ fontSize:'clamp(2rem,5vw,4rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:20 }}>
              Reach every agency.<br/>
              <span style={{ background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Sell faster.</span>
            </h2>
            <p style={{ fontSize:'1.05rem', color:C.white60, maxWidth:460, margin:'0 auto 40px', lineHeight:1.7 }}>
              Join property owners across Europe who use PropBlaze to get professional agency exposure without paying per-agency fees.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/login" style={{
                display:'inline-flex', alignItems:'center', gap:8, padding:'16px 36px',
                borderRadius:14, textDecoration:'none', fontWeight:700, fontSize:'1rem',
                background:C.grad1, color:C.bg,
                boxShadow:'0 0 60px rgba(245,194,0,0.3)',
              }}>
                List your property â
              </Link>
              <Link href="/login" style={{
                display:'inline-flex', alignItems:'center', gap:8, padding:'16px 36px',
                borderRadius:14, textDecoration:'none', fontWeight:600, fontSize:'1rem',
                color:C.white80, background:C.surface, border:`1px solid ${C.border2}`,
              }}>
                View live demo
              </Link>
            </div>
            <p style={{ fontSize:'0.75rem', color:C.white40, marginTop:20 }}>No credit card required - Cancel anytime - GDPR compliant</p>
          </div>
        </FadeIn>
      </section>

      {/* âââ FOOTER âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <footer style={{ background:C.bg2, borderTop:`1px solid ${C.border}`, padding:'48px max(40px,calc(50vw - 600px))' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:24 }}>
          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg, #F5C200, #E07B00)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg viewBox="0 0 32 32" fill="none" width="16" height="16"><path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="white"/></svg>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:'0.85rem', color:C.white }}>PropBlaze</div>
              <div style={{ fontSize:'0.55rem', color:C.yellow, letterSpacing:'0.15em', textTransform:'uppercase' }}>AI Platform</div>
            </div>
          </div>

          {/* Links */}
          <div style={{ display:'flex', gap:28 }}>
            {[['Privacy','/privacy'],['Terms','/terms'],['Contact','mailto:hello@propblaze.com']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontSize:'0.78rem', color:C.white40, textDecoration:'none' }}>{l}</a>
            ))}
          </div>

          <div style={{ fontSize:'0.72rem', color:C.white40 }}>Â© 2026 PropBlaze - Built for EU property owners</div>
        </div>
      </footer>
    </div>
  );
}
