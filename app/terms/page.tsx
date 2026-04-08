'use client';

import Link from 'next/link';

export default function TermsPage() {
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
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Terms of Service</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Last updated: April 2026</p>

        <div style={{ lineHeight: 1.8, color: '#374151', space: '2rem' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>1. Agreement to Terms</h2>
            <p>By accessing and using PropBlaze, you agree to be bound by these Terms of Service. If you disagree with any part, you may not use our service.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>2. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must be at least 18 years old to use PropBlaze.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>3. Property Information</h2>
            <p>You warrant that all property information you provide is accurate, current, and complete. PropBlaze is not responsible for inaccuracies or omissions in property data. You retain all rights to your property information.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>4. Agency Distribution</h2>
            <p>PropBlaze uses AI matching to identify relevant agencies. You must approve all agencies before distribution. You acknowledge that PropBlaze acts as your agent for communication purposes only.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>5. Payment Terms</h2>
            <p>Billing is monthly and renews automatically. You may cancel at any time. If you mark a property as sold, billing pauses immediately. Refunds are not provided for partial months.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>6. Limitation of Liability</h2>
            <p>PropBlaze provides the service "as is" without warranties. We are not liable for indirect, incidental, or consequential damages. Our liability is limited to the amount you paid us in the past month.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>7. Governing Law</h2>
            <p>These Terms are governed by the laws of the European Union and the GDPR. Any disputes shall be resolved under EU law.</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>8. Contact</h2>
            <p>For terms questions, contact us at legal@propblaze.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
