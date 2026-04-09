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

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ color: C.textMd, fontSize: '14px', marginBottom: '48px' }}>
          Last updated: April 2026
        </p>

        {/* Section 1 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            1. Data Controller Information
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            PropBlaze is a European proptech company committed to protecting your privacy. We process personal data in compliance with the General Data Protection Regulation (GDPR) and other applicable EU data protection laws.
          </p>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
            <p style={{ color: C.text, marginBottom: '8px', fontWeight: 500 }}>
              PropBlaze EU
            </p>
            <p style={{ color: C.textMd, fontSize: '14px', lineHeight: 1.6 }}>
              Data Controller for personal data processing<br/>
              Email: <a href="mailto:privacy@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>privacy@propblaze.eu</a><br/>
              Data Protection Officer: <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a>
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            2. What Data We Collect
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            We collect the following categories of personal data:
          </p>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Account & Registration Data:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              Name, email address, phone number, company name, billing address, and account preferences.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Property Data:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              Property location, price, features, images, legal documents (property deeds, titles), and ownership verification documents.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Communication Data:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              Messages, emails, and communications between property owners and agencies through our platform.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Payment & Billing Data:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              Billing address, transaction history, and payment method information (processed by Stripe—we do not store full credit card details).
            </p>
          </div>
          <div>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Usage & Technical Data:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              IP address, browser type, device information, pages visited, time spent on platform, and analytics data for service improvement.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            3. How We Use Your Data
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            We process your personal data for the following purposes:
          </p>
          <ul style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Service Delivery:</strong> Creating and managing your account, processing subscriptions, and delivering the PropBlaze service.</li>
            <li style={{ marginBottom: '8px' }}><strong>AI Matching & Distribution:</strong> Analyzing property data and using AI algorithms to match properties with appropriate agencies and distribute listings.</li>
            <li style={{ marginBottom: '8px' }}><strong>Communication:</strong> Facilitating communication between property owners and agencies, sending notifications, and responding to inquiries.</li>
            <li style={{ marginBottom: '8px' }}><strong>Billing & Payments:</strong> Processing subscription payments and managing billing records through our payment provider, Stripe.</li>
            <li style={{ marginBottom: '8px' }}><strong>Service Improvement:</strong> Analyzing usage patterns, conducting market research, and improving our algorithms and platform features.</li>
            <li style={{ marginBottom: '8px' }}><strong>Legal Compliance:</strong> Complying with legal obligations, resolving disputes, and enforcing agreements.</li>
            <li><strong>Security:</strong> Preventing fraud, protecting against unauthorized access, and maintaining platform security.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            4. Legal Basis for Data Processing (GDPR Article 6)
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            We rely on the following legal bases to process your personal data under GDPR:
          </p>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Contract (Article 6(1)(b)):</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              Processing is necessary to fulfill our service agreement with you, including account creation, service delivery, and billing.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Consent (Article 6(1)(a)):</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              We obtain your consent for marketing communications, cookies, and optional data processing beyond service delivery.
            </p>
          </div>
          <div>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Legitimate Interest (Article 6(1)(f)):</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              We process data for service improvement, fraud prevention, and platform security, where our interests are balanced against your rights.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            5. Data Sharing & Third Parties
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            We share your personal data with the following categories of recipients:
          </p>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Real Estate Agencies:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              When you submit a property, we share the property information and your contact details with matched agencies. You control the distribution through your account.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Payment Processor (Stripe):</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              We share billing information with Stripe to process payments. Stripe is certified under the EU-U.S. Data Privacy Framework.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Email Service Provider (Resend):</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              We use Resend for sending transactional and marketing emails. Email data is processed according to applicable data protection agreements.
            </p>
          </div>
          <div>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Legal & Regulatory Authorities:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              We may disclose data to courts, law enforcement, or regulatory authorities as required by law or to protect our legal rights.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            6. Data Retention Periods
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            We retain personal data only as long as necessary:
          </p>
          <ul style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Account Data:</strong> Retained for the duration of your account and 12 months after cancellation or deletion, unless longer retention is required by law.</li>
            <li style={{ marginBottom: '8px' }}><strong>Property Data:</strong> Retained while the property is listed and for 24 months after removal, for historical records and potential inquiries.</li>
            <li style={{ marginBottom: '8px' }}><strong>Payment Data:</strong> Retained for 7 years for tax and accounting purposes, in accordance with EU regulations.</li>
            <li style={{ marginBottom: '8px' }}><strong>Communication Data:</strong> Retained for 2 years after the last interaction, unless longer retention is required by law.</li>
            <li><strong>Usage & Technical Data:</strong> Retained for up to 12 months for analytics and service improvement purposes.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            7. Your GDPR Rights
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            Under the GDPR, you have the following rights concerning your personal data:
          </p>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Right of Access:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              You have the right to request a copy of all personal data we hold about you.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Right to Rectification:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              You can request correction of inaccurate or incomplete personal data.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Right to Erasure:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              You can request deletion of your personal data, subject to certain legal exceptions.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Right to Restrict Processing:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              You can request that we limit how we use your data while a complaint is being investigated.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Right to Data Portability:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              You can request your data in a machine-readable format and transfer it to another service provider.
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Right to Object:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              You can object to processing of your data for marketing, profiling, or legitimate interest purposes.
            </p>
          </div>
          <div>
            <p style={{ color: C.text, fontWeight: 600, marginBottom: '8px' }}>Right to Not Be Profiled:</p>
            <p style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '16px', borderLeft: `3px solid ${C.orange}` }}>
              You have the right to not be subject to automated decision-making, including profiling, that has a legal effect on you.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            8. Cookies & Tracking Technologies
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            PropBlaze uses minimal cookies and tracking technologies. We only use essential, functional cookies required for the platform to operate. We do not use marketing or tracking cookies. By using PropBlaze, you consent to essential cookies. You can manage cookie preferences in your browser settings.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            We comply with the ePrivacy Directive and GDPR cookie requirements, providing transparent information about all cookie usage.
          </p>
        </section>

        {/* Section 9 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            9. International Data Transfers
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            PropBlaze is based in Europe and primarily processes data within the EU/EEA. However, when necessary for service delivery (e.g., using Stripe or other international processors), we transfer data to countries outside the EU/EEA. We ensure such transfers are protected by:
          </p>
          <ul style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>Standard contractual clauses approved by the EU Commission</li>
            <li style={{ marginBottom: '8px' }}>Adequacy decisions recognizing equivalent data protection</li>
            <li>Your explicit consent to transfer where required</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            10. Exercising Your Rights
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            To exercise any of your GDPR rights, please submit a request to our Data Protection Officer:
          </p>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <p style={{ color: C.text, marginBottom: '8px', fontWeight: 500 }}>
              Data Protection Officer
            </p>
            <p style={{ color: C.textMd, fontSize: '14px', lineHeight: 1.6 }}>
              Email: <a href="mailto:dpo@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>dpo@propblaze.eu</a><br/>
              Or contact: <a href="mailto:privacy@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>privacy@propblaze.eu</a>
            </p>
          </div>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            We will respond to your request within 30 days. You also have the right to lodge a complaint with your national data protection authority if you believe your rights have been violated.
          </p>
        </section>

        {/* Section 11 */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            11. Changes to This Privacy Policy
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the platform. Your continued use of PropBlaze following such changes constitutes your acceptance of the updated Privacy Policy.
          </p>
        </section>

        <div style={{
          borderTop: `1px solid ${C.border}`,
          paddingTop: '32px',
          marginTop: '32px',
          textAlign: 'center',
          color: C.textSm,
          fontSize: '12px'
        }}>
          <p>Last Updated: April 2026</p>
          <p>For more information about your data rights, see our <Link href="/gdpr" style={{ color: C.orange, textDecoration: 'none' }}>GDPR Rights page</Link>.</p>
        </div>
      </article>
    </div>
  );
}
