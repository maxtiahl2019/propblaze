'use client';

import React, { useState, useEffect } from 'react';

/**
 * Hero Animation - Shows PropBlaze workflow visually
 * Like watching a video of the complete process
 */
export function HeroAnimation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % 5);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const phases = [
    {
      title: 'Upload your property',
      emoji: '📋',
      color: '#2563eb',
      description: '10 min to list',
    },
    {
      title: 'AI analyzes 500 agencies',
      emoji: '🤖',
      color: '#7c3aed',
      description: 'Deep matching',
    },
    {
      title: 'You approve the matches',
      emoji: '✅',
      color: '#16a34a',
      description: 'Full control',
    },
    {
      title: 'AI sends to agencies',
      emoji: '📧',
      color: '#ea580c',
      description: 'Multi-channel',
    },
    {
      title: 'Leads arrive automatically',
      emoji: '🏆',
      color: '#dc2626',
      description: 'First in 24h',
    },
  ];

  const activePhase = phases[phase];

  return (
    <div style={{
      perspective: '1000px',
      height: '100%',
      minHeight: 400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Background gradient animation */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${activePhase.color}20 0%, transparent 100%)`,
        transition: 'all 0.8s ease',
        zIndex: -1,
      }} />

      {/* Central animated circle */}
      <div style={{
        position: 'relative',
        width: 280,
        height: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Outer rotating ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          border: `3px solid ${activePhase.color}40`,
          borderRadius: '50%',
          animation: 'rotate 20s linear infinite',
        }} />

        {/* Middle ring */}
        <div style={{
          position: 'absolute',
          inset: 20,
          border: `2px solid ${activePhase.color}60`,
          borderRadius: '50%',
          animation: 'rotate 15s linear infinite reverse',
        }} />

        {/* Inner circle */}
        <div style={{
          position: 'absolute',
          inset: 40,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${activePhase.color}, ${activePhase.color}40)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 40px ${activePhase.color}40, inset 0 0 20px ${activePhase.color}20`,
          transition: 'all 0.8s ease',
        }}>
          {/* Emoji - Big and Animated */}
          <div style={{
            fontSize: '5rem',
            animation: 'bounce 2s ease-in-out infinite',
            textShadow: `0 0 20px ${activePhase.color}80`,
          }}>
            {activePhase.emoji}
          </div>
        </div>

        {/* Text above circle */}
        <div style={{
          position: 'absolute',
          top: -80,
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.25rem',
            transition: 'all 0.8s ease',
          }}>
            {activePhase.title}
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0,
            fontWeight: 500,
          }}>
            {activePhase.description}
          </p>
        </div>

        {/* Progress dots below */}
        <div style={{
          position: 'absolute',
          bottom: -60,
          display: 'flex',
          gap: 12,
        }}>
          {phases.map((p, idx) => (
            <div
              key={idx}
              style={{
                width: idx === phase ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: idx === phase ? activePhase.color : '#e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => setPhase(idx)}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
