'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#1f2937' }}>
      {/* Nav */}
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #dc2626, #ea580c)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem', color: 'white' }}>
            🔥
          </div>
          <span style={{ fontWeight: 800, color: '#0f172a' }}>PropBlaze</span>
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Privacy Policy</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Last updated: April 2026</p>

        <div style={{ lineHeight: 1.8, color: '#374151' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>1. Data We Collect</h2>
            <p style={{ marginBottom: '0.75rem' }}>We collect:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Account information (name, email, phone)</li>
              <li>Property details you provide</li>
              <li>Usage analytics and logs</li>
              <li>Payment information (processed by Stripe)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>2. How We Use Your Data</h2>
            <p style={{ marginBottom: '0.75rem' }}>Your data is used to:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Operate and improve PropBlaze</li>
              <li>Match properties to agencies (with your consent)</li>
              <li>Send you service notifications</li>
              <li>Process billing and payments</li>
              <li>Prevent fraud and comply with law</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>3. GDPR Compliance</h2>
            <p>PropBlaze is fully GDPR compliant. You have the right to:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Access your personal data</li>
              <li>Request corrections</li>
              <li>Request deletion (right to be forgotten)</li>
              <li>Export your data (data portability)</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>4. Agency Data Sharing</h2>
            <p>When you approve agencies for distribution, we share your property details and contact information (only if you consent). Agencies must comply with GDPR and our data processing agreement.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>5. Data Security</h2>
            <p>We use encryption (TLS/SSL), secure databases, and access controls. Your payment data is never stored on our servers — Stripe handles all payment processing.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>6. Cookies</h2>
            <p>We use essential cookies for authentication and analytics (non-identifying). You can disable non-essential cookies in your browser.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>7. Third Parties</h2>
            <p>We work with trusted vendors (Stripe, AWS, SendGrid) that are GDPR compliant. We never sell your data to advertisers.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>8. Contact</h2>
            <p>For privacy questions, contact us at privacy@propblaze.com or submit a GDPR request via your account settings.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
