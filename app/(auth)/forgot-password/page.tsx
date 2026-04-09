'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const C = {
  bg:        '#F4F6FA',
  surface:   '#FFFFFF',
  surface2:  '#EEF1F7',
  border:    '#DDE2EE',
  borderFoc: '#F97316',
  text:      '#1A1F2E',
  textMd:    '#6B7A99',
  textSm:    '#9BA8C0',
  orange:    '#F97316',
  orangeHov: '#EA580C',
  orangeLight: '#FFF3E8',
  red:       '#DC2626',
  redLight:  '#FEF2F2',
  redBorder: '#FECACA',
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 60);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!email.includes('@')) newErrors.email = 'Enter a valid email';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Simulate email sending
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'Inter, -apple-system, sans-serif',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
      }}>
        {/* Logo & Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36 }}>
                <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
                  <defs>
                    <linearGradient id="fbg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F97316"/>
                      <stop offset="100%" stopColor="#EA580C"/>
                    </linearGradient>
                  </defs>
                  <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#fbg)"/>
                  <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.25"/>
                </svg>
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>PropBlaze</span>
            </div>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.text, margin: '0 0 0.5rem' }}>Reset Password</h1>
          <p style={{ fontSize: '0.875rem', color: C.textMd, margin: 0 }}>
            {step === 'email' ? 'Enter your email to receive a reset link' : 'Check your email'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(30,40,80,0.08), 0 0 0 1px rgba(30,40,80,0.04)',
          marginBottom: '1rem',
        }}>
          {step === 'email' ? (
            /* Email Step */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    color: C.text,
                    background: C.surface,
                    border: `1px solid ${errors.email ? C.red : C.border}`,
                    borderRadius: 8,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    if (!errors.email) e.target.style.borderColor = C.borderFoc;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? C.red : C.border;
                  }}
                />
                {errors.email && (
                  <p style={{ fontSize: '0.75rem', color: C.red, marginTop: '0.25rem', margin: 0 }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1rem',
                  background: loading ? C.surface2 : `linear-gradient(135deg, ${C.orange}, ${C.orangeHov})`,
                  color: loading ? C.textMd : 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            /* Success Step */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                display: 'inline-block',
              }}>
                ✅
              </div>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: C.text,
                marginBottom: '0.5rem',
              }}>
                Check Your Email
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: C.textMd,
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}>
                We sent a password reset link to <strong>{email}</strong>. Click the link to create a new password.
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: C.textSm,
                marginBottom: 0,
              }}>
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => { setStep('email'); setEmail(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: C.orange,
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    fontWeight: 600,
                  }}
                >
                  try another email
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: C.textMd, margin: 0 }}>
            Remember your password?{' '}
            <Link href="/login" style={{
              color: C.orange,
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'color 0.2s',
            }}>
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
