'use client';

import React, { useEffect, useState } from 'react';

/**
 * Premium Loading Screen - Luxury Real Estate Aesthetic
 * Like something from a high-end property platform
 */
export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simulate loading with elegant progression
    const interval = setInterval(() => {
      setProgress(p => {
        const nextVal = p + Math.random() * 30;
        if (nextVal >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowContent(true), 300);
          return 100;
        }
        return nextVal;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  if (showContent) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #faf5f0 0%, #fff9f7 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)',
    }}>
      {/* Premium minimal logo */}
      <div style={{
        marginBottom: '4rem',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 48,
          height: 48,
          background: 'linear-gradient(135deg, #dc2626, #ea580c)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.5rem',
          color: 'white',
          boxShadow: '0 8px 24px rgba(220, 38, 38, 0.2)',
        }}>
          🔥
        </div>
        <div style={{
          fontSize: '1.375rem',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.01em',
        }}>
          PropBlaze
        </div>
      </div>

      {/* Status text */}
      <h2 style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#0f172a',
        margin: '0 0 1rem',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        Initializing
      </h2>

      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        margin: '0 0 3rem',
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 1.6,
      }}>
        Connecting you to 500+ premium agencies across Europe
      </p>

      {/* Elegant progress bar */}
      <div style={{
        width: 240,
        height: 3,
        background: '#e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: '2rem',
      }}>
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #dc2626, #ea580c)',
            width: `${progress}%`,
            transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            borderRadius: 2,
          }}
        />
      </div>

      {/* Progress percentage */}
      <p style={{
        fontSize: '0.75rem',
        color: '#9ca3af',
        margin: 0,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {Math.floor(progress)}%
      </p>

      {/* Subtle loading indicators */}
      <div style={{
        position: 'absolute',
        bottom: '3rem',
        display: 'flex',
        gap: 8,
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: '#dc2626',
              opacity: Math.sin((progress + i * 20) / 100 * Math.PI) * 0.5 + 0.5,
              transition: 'opacity 0.2s',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
