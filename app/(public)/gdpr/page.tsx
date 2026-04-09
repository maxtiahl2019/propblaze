'use client';

import Link from 'next/link';

const C = {
  bg:        '#F4F6FA',
  surface:   '#FFFFFF',
  border:    '#DDE2EE',
  text:      '#1A1F2E',
  textMd:    '#6B7A99',
  textSm:    '#9BA8C0',
  orange:    '#F97316',
};

export default function GDPRPage() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: '24px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '820px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <svg viewBox="0 0 32 32" fill="none" width="24" height="24">
              <defs>
                <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316"/>
                  <stop offset="100%" stopColor="#EA580C"/>
                </linearGradient>
              </defs>
              <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#lg1)"/>
              <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.3"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '16px', color: C.text }}>PropBlaze</span>
          </Link>
          <Link href="/" style={{ color: C.textMd, textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
            Back to home
          </Link>
        </div>
      </div>

      {/* Content */}
      <article style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: '60px 32px',
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Your Data, Your Rights
        </h1>
        <p style={{ fontSize: '17px', color: C.textMd, lineHeight: 1.7, marginBottom: '48px' }}>
          Under the General Data Protection Regulation (GDPR), you have powerful rights over your personal data. This page explains your rights in simple terms.
        </p>

        {/* Section: What PropBlaze Does */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: C.orange, marginBottom: '20px' }}>
            What PropBlaze Does With Your Data
          </h2>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <ul style={{ listStyle: 'none', padding: 0, color: C.textMd, lineHeight: 1.8 }}>
              <li style={{ marginBottom: '14px', display: 'flex', gap: '12px' }}>
                <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span><strong>Creates your account</strong> — We store your email, name, and profile information so you can access PropBlaze.</span>
              </li>
              <li style={{ marginBottom: '14px', display: 'flex', gap: '12px' }}>
                <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span><strong>Processes property information</strong> — When you upload properties, we analyze them with AI to match them with agencies.</span>
              </li>
              <li style={{ marginBottom: '14px', display: 'flex', gap: '12px' }}>
                <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span><strong>Distributes to agencies</strong> — We share your property details with real estate agencies that might be interested.</span>
              </li>
              <li style={{ marginBottom: '14px', display: 'flex', gap: '12px' }}>
                <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span><strong>Processes payments</strong> — We securely handle billing through Stripe, but never store your full credit card details.</span>
              </li>
              <li style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span><strong>Improves the service</strong> — We analyze how people use PropBlaze to make it better and faster.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section: Your 8 GDPR Rights */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: C.orange, marginBottom: '20px' }}>
            Your 8 GDPR Rights
          </h2>

          {/* Right 1: Access */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
              1. Right of Access
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>What it means:</strong> You can request a copy of all your personal data that PropBlaze holds.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>How to use it:</strong> Email us at <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a> with "Data Access Request" in the subject line, and we'll send you everything we have about you within 30 days.
            </p>
          </div>

          {/* Right 2: Rectification */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
              2. Right to Rectification
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>What it means:</strong> You can ask us to correct any inaccurate or incomplete information about you.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>How to use it:</strong> Log into your account and update your information directly, or contact us at <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a> to correct data you can't edit yourself.
            </p>
          </div>

          {/* Right 3: Erasure */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
              3. Right to Erasure ("Right to Be Forgotten")
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>What it means:</strong> You can request deletion of your personal data from PropBlaze.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>When it applies:</strong> When your data is no longer necessary, you withdraw consent, or you object to processing.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>How to use it:</strong> Contact us at <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a> with "Data Deletion Request" and we'll remove your information within 30 days, except where we're required to keep it by law.
            </p>
          </div>

          {/* Right 4: Restrict Processing */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
              4. Right to Restrict Processing
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>What it means:</strong> You can ask us to limit how we use your data while a dispute is being resolved.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>When to use it:</strong> When the accuracy of your data is disputed, or while you lodge a complaint.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>How to use it:</strong> Email <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a> with "Restrict Processing Request" to pause data usage.
            </p>
          </div>

          {/* Right 5: Portability */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
              5. Right to Data Portability
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>What it means:</strong> You can get your data in a format you can move to another service.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>Useful for:</strong> Switching to a different proptech platform or keeping a backup of your information.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>How to use it:</strong> Request a data export by emailing <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a> and we'll provide your data in machine-readable format (CSV, JSON) within 30 days.
            </p>
          </div>

          {/* Right 6: Object */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
              6. Right to Object
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>What it means:</strong> You can object to certain ways we use your data.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>Examples:</strong> Opt out of marketing emails, stop profiling for agency matching, or withdraw consent for specific uses.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>How to use it:</strong> Update your preferences in account settings, or email <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a> with "Objection Request".
            </p>
          </div>

          {/* Right 7: Automated Decision-Making */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
              7. Right Not to Be Profiled
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>What it means:</strong> You have protection against automated decision-making that significantly affects you.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>In PropBlaze:</strong> Our AI matching is used to recommend agencies, not to make final decisions about your account or access.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>How to use it:</strong> If you want human review of any AI decision, contact <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a>.
            </p>
          </div>

          {/* Right 8: Complaint */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
              8. Right to Lodge a Complaint
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '10px' }}>
              <strong>What it means:</strong> You can file a complaint with your national data protection authority.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>When to use it:</strong> If you believe PropBlaze is not respecting your data rights.
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              <strong>How to use it:</strong> First contact us at <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a> to resolve the issue. If unsatisfied, you can file a complaint with your local data protection authority (DPA).
            </p>
          </div>
        </section>

        {/* Section: How to Delete Your Account */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: C.orange, marginBottom: '20px' }}>
            How to Delete Your Account & Data
          </h2>
          <div style={{
            background: '#F0F9FF',
            border: `1px solid #B3E5FC`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '14px' }}>
              Quick Delete (Self-Service)
            </h3>
            <ol style={{ color: C.textMd, lineHeight: 1.8, paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '10px' }}>Log into your PropBlaze account</li>
              <li style={{ marginBottom: '10px' }}>Go to Account Settings → Privacy & Data</li>
              <li style={{ marginBottom: '10px' }}>Click "Delete My Account"</li>
              <li>Confirm deletion — your data will be removed within 30 days</li>
            </ol>
            <p style={{ color: C.textMd, lineHeight: 1.7, fontSize: '14px' }}>
              Note: Some data may be retained longer if required by law (tax records, for example).
            </p>
          </div>
          <div style={{
            background: '#FAFAF0',
            border: `1px solid #DDD6CE`,
            borderRadius: '12px',
            padding: '24px',
            marginTop: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '14px' }}>
              Full Data Deletion (If You Prefer)
            </h3>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '14px' }}>
              Email us with "Account & Data Deletion Request" and we'll securely delete all your data:
            </p>
            <a href="mailto:dpo@propblaze.eu" style={{
              display: 'inline-block',
              background: C.orange,
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              Request Data Deletion
            </a>
          </div>
        </section>

        {/* Section: Cookies */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: C.orange, marginBottom: '20px' }}>
            About Cookies
          </h2>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
              <strong>Good news:</strong> PropBlaze uses minimal cookies. We only use essential cookies needed to run the platform.
            </p>
            <ul style={{ color: C.textMd, lineHeight: 1.8, paddingLeft: '20px', marginBottom: '12px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Functional cookies</strong> — Keep you logged in and remember your settings</li>
              <li><strong>Security cookies</strong> — Protect your account from unauthorized access</li>
            </ul>
            <p style={{ color: C.textMd, lineHeight: 1.7 }}>
              We <strong>do not</strong> use marketing or tracking cookies. You can manage cookies in your browser settings anytime.
            </p>
          </div>
        </section>

        {/* Section: Questions? */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: C.orange, marginBottom: '20px' }}>
            Questions About Your Data?
          </h2>
          <div style={{
            background: C.surface,
            border: `2px solid ${C.orange}`,
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center'
          }}>
            <p style={{ color: C.text, fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>
              Our Data Protection Officer is here to help
            </p>
            <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '20px' }}>
              Email us anytime with questions about your data, privacy, or GDPR rights.
            </p>
            <a href="mailto:dpo@propblaze.eu" style={{
              display: 'inline-block',
              background: C.orange,
              color: 'white',
              padding: '12px 28px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '14px'
            }}>
              Contact DPO
            </a>
            <p style={{ color: C.textMd, fontSize: '12px', marginTop: '14px' }}>
              Response time: 30 days or less
            </p>
          </div>
        </section>

        <div style={{
          borderTop: `1px solid ${C.border}`,
          paddingTop: '32px',
          marginTop: '32px',
          textAlign: 'center',
          color: C.textSm,
          fontSize: '12px'
        }}>
          <p style={{ marginBottom: '8px' }}>Last Updated: April 2026</p>
          <p>
            For the full legal details, see our <Link href="/privacy" style={{ color: C.orange, textDecoration: 'none' }}>Privacy Policy</Link>
          </p>
        </div>
      </article>
    </div>
  );
}
