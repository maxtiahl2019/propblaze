'use client';

import React, { useState, useEffect } from 'react';

/**
 * Premium Demo Video - Luxury Real Estate Design
 * High-end aesthetic with sophisticated animations
 */
export function PremiumDemoVideo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const totalDuration = 12000; // 12 seconds for more refined pacing

  const steps = [
    {
      phase: 'Upload',
      emoji: '📋',
      title: 'Your property',
      description: '94m² apartment, Belgrade',
      color: '#2563eb',
      icon: '🏠',
    },
    {
      phase: 'Analysis',
      emoji: '🤖',
      title: 'AI analyzes agencies',
      description: 'Deep matching algorithm active',
      color: '#7c3aed',
      icon: '⚙️',
    },
    {
      phase: 'Matching',
      emoji: '🎯',
      title: 'Perfect matches found',
      description: '10 agencies perfectly aligned',
      color: '#16a34a',
      icon: '✅',
    },
    {
      phase: 'Generation',
      emoji: '✍️',
      title: 'Pitch generation',
      description: 'EN, RU, SR created instantly',
      color: '#ea580c',
      icon: '🌐',
    },
    {
      phase: 'Distribution',
      emoji: '📧',
      title: 'Distribution starts',
      description: 'Wave 1: 10 agencies contacted',
      color: '#dc2626',
      icon: '🚀',
    },
    {
      phase: 'Results',
      emoji: '🏆',
      title: 'Leads arriving',
      description: 'First responses in 24 hours',
      color: '#059669',
      icon: '⭐',
    },
  ];

  useEffect(() => {
    if (!isPlaying || !autoPlay) return;

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
  }, [isPlaying, autoPlay]);

  useEffect(() => {
    const stepIndex = Math.floor((progress / totalDuration) * steps.length);
    if (stepIndex < steps.length && stepIndex !== currentStep) {
      setCurrentStep(stepIndex);
    }
  }, [progress, currentStep, steps.length]);

  const handleRestart = () => {
    setProgress(0);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const activeStep = steps[currentStep] || steps[0];
  const progressPercent = (progress / totalDuration) * 100;

  return (
    <div
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
      style={{
        background: 'linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%)',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        position: 'relative',
      }}
    >
      {/* Elegant header */}
      <div
        style={{
          background: 'white',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            gap: 6,
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: ['#ef4444', '#f59e0b', '#22c55e'][i],
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              fontFamily: 'monospace',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            PROPBLAZE DISTRIBUTION ENGINE
          </span>
        </div>
        <button
          onClick={handleRestart}
          disabled={isPlaying && autoPlay}
          style={{
            background: isPlaying && autoPlay ? 'rgba(0,0,0,0.04)' : 'linear-gradient(135deg, #dc2626, #ea580c)',
            color: isPlaying && autoPlay ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: 8,
            padding: '6px 16px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: isPlaying && autoPlay ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isPlaying && autoPlay ? '⏳ Running' : '▶ Replay'}
        </button>
      </div>

      {/* Content area */}
      <div style={{ padding: '3rem 2rem', minHeight: 320, position: 'relative' }}>
        {/* Phase indicator */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-block',
              background: `${activeStep.color}15`,
              color: activeStep.color,
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {activeStep.phase}
          </div>
        </div>

        {/* Large visual area */}
        <div
          style={{
            textAlign: 'center',
            padding: '2rem 0 1rem',
            minHeight: 140,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '1rem',
              opacity: 0.9,
              transition: 'all 0.3s ease',
            }}
          >
            {activeStep.emoji}
          </div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.01em',
            }}
          >
            {activeStep.title}
          </h3>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#6b7280',
              margin: 0,
              maxWidth: 380,
            }}
          >
            {activeStep.description}
          </p>
        </div>

        {/* Step indicators */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginBottom: '2rem',
          }}
        >
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                height: 4,
                borderRadius: 2,
                background: idx <= currentStep ? '#dc2626' : '#e5e7eb',
                width: idx <= currentStep ? 24 : 8,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => {
                setProgress((idx / steps.length) * totalDuration);
                setCurrentStep(idx);
                setAutoPlay(false);
              }}
            />
          ))}
        </div>

        {/* Elegant progress bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              height: 2,
              background: '#e5e7eb',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${activeStep.color}, #dc2626)`,
                width: `${progressPercent}%`,
                transition: 'width 0.05s linear',
                borderRadius: 1,
              }}
            />
          </div>
        </div>

        {/* Time display */}
        <p
          style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            margin: 0,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.floor((progress / totalDuration) * 100)}%
        </p>
      </div>
    </div>
  );
}
