'use client';

import React, { useState, useEffect } from 'react';

interface DemoStep {
  title: string;
  time: number;
  content: string;
  type: 'text' | 'check' | 'loading' | 'success';
}

const DEMO_STEPS: DemoStep[] = [
  { title: 'Owner uploads property', time: 0, content: '📋 3-bed apartment, Belgrade', type: 'text' },
  { title: 'AI analyzes...', time: 1500, content: '🤖 Running matching engine...', type: 'loading' },
  { title: 'AI scores agencies', time: 3000, content: '✓ Analyzed 500 agencies', type: 'check' },
  { title: 'AI scores agencies', time: 3500, content: '✓ Located 10 perfect matches', type: 'check' },
  { title: 'AI scores agencies', time: 4000, content: '✓ Generated 3-language pitch', type: 'check' },
  { title: 'Sending to Wave 1', time: 5000, content: '📧 Contacting 10 agencies...', type: 'loading' },
  { title: 'Sending to Wave 1', time: 6500, content: '✓ AlpineRealty received offer', type: 'check' },
  { title: 'Sending to Wave 1', time: 7000, content: '✓ BeladeProp received offer', type: 'check' },
  { title: 'Sending to Wave 1', time: 7500, content: '✓ EastEurope received offer', type: 'check' },
  { title: 'Owner notified', time: 8500, content: '📬 Email + Telegram sent', type: 'success' },
  { title: 'Waiting for responses', time: 9500, content: '⏳ First leads in ~24h', type: 'text' },
];

export function DemoVideo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const totalDuration = 10000; // 10 seconds

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return p + 50;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    // Update current step based on progress
    const newStep = DEMO_STEPS.findIndex(step => step.time > progress) - 1;
    if (newStep >= 0 && newStep !== currentStep) {
      setCurrentStep(newStep);
    }
  }, [progress, currentStep]);

  const handleRestart = () => {
    setProgress(0);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const activeStep = DEMO_STEPS[currentStep] || DEMO_STEPS[0];
  const progressPercent = (progress / totalDuration) * 100;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <div style={{
        background: '#222',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#ef4444',
        }} />
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#f59e0b',
        }} />
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#22c55e',
        }} />
        <span style={{
          marginLeft: 8,
          fontSize: '0.75rem',
          color: '#64748b',
          fontFamily: 'monospace',
        }}>
          propblaze.com — AI Distribution Live Demo
        </span>
        <button
          onClick={handleRestart}
          disabled={isPlaying}
          style={{
            marginLeft: 'auto',
            background: isPlaying ? '#334155' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '4px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.5 : 1,
          }}
        >
          {isPlaying ? '⏳ Running...' : '▶ Run Again'}
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: '2rem',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Title & Description */}
        <div>
          <h3 style={{
            margin: '0 0 0.5rem',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'white',
          }}>
            {activeStep.title}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#94a3b8',
          }}>
            Real-time property distribution to 500+ EU agencies
          </p>
        </div>

        {/* Large Demo Content */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            animation: activeStep.type === 'loading' ? 'spin 1s linear infinite' : 'none',
          }}>
            {activeStep.type === 'loading' && '⚙️'}
            {activeStep.type === 'check' && '✅'}
            {activeStep.type === 'success' && '🚀'}
            {activeStep.type === 'text' && '📊'}
          </div>
          <p style={{
            fontSize: '1.125rem',
            color: 'white',
            margin: 0,
            fontWeight: 500,
          }}>
            {activeStep.content}
          </p>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{
            background: '#334155',
            height: 4,
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: '0.75rem',
          }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #dc2626, #ea580c)',
                width: `${progressPercent}%`,
                transition: 'width 0.05s linear',
                borderRadius: 2,
              }}
            />
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#64748b',
            margin: 0,
            textAlign: 'right',
          }}>
            {Math.floor((progress / totalDuration) * 100)}%
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
