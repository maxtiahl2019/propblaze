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

export default function TermsPage() {
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
          Terms of Use
        </h1>
        <p style={{ color: C.textMd, fontSize: '14px', marginBottom: '48px' }}>
          Last updated: April 2026
        </p>

        {/* Section 1 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            1. Introduction & Acceptance
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            Welcome to PropBlaze ("we," "us," "our," or "Company"). These Terms of Use ("Terms") govern your access to and use of the PropBlaze platform, including the website, application, and all services offered (collectively, the "Service").
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            By accessing or using PropBlaze, you agree to be bound by these Terms. If you do not agree to any part of these Terms, you must not use the Service. Your continued use of the Service constitutes your acceptance of these Terms and any updates or modifications we may make.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            2. Description of Service
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            PropBlaze is an AI-powered property distribution platform that enables property owners and sellers to submit property listings and have them intelligently matched and distributed to qualified real estate agencies across the European Union. Our service includes:
          </p>
          <ul style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}>AI-powered agency matching based on specialization, location, performance metrics, and property characteristics</li>
            <li style={{ marginBottom: '8px' }}>Automated distribution of property information to selected agencies</li>
            <li style={{ marginBottom: '8px' }}>Tracking and management of agency responses and offers</li>
            <li style={{ marginBottom: '8px' }}>Communication and negotiation support tools</li>
            <li>Analytics and reporting on distribution performance</li>
          </ul>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            The Service is provided on an "as-is" basis and is intended for lawful purposes only.
          </p>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            3. User Accounts & Registration
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            To use PropBlaze, you must create an account. When registering, you agree to:
          </p>
          <ul style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}>Provide accurate, truthful, and complete information</li>
            <li style={{ marginBottom: '8px' }}>Maintain the confidentiality of your password and account credentials</li>
            <li style={{ marginBottom: '8px' }}>Notify us immediately of any unauthorized access or security breach</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            PropBlaze reserves the right to suspend or terminate accounts that violate these Terms or that engage in fraudulent, illegal, or harmful activities.
          </p>
        </section>

        {/* Section 4 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            4. Property Owner Terms
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px', fontWeight: 600 }}>
            If you are a property owner or authorized representative submitting property listings:
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            <strong>Property Submission:</strong> You represent that you own or have the legal authority to list the property. You warrant that all information provided about the property is accurate, complete, and not misleading. You must not submit properties that you do not have the right to list.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            <strong>AI Packaging:</strong> PropBlaze will use AI technology to analyze and package your property information into compelling, market-ready descriptions and marketing materials. You grant PropBlaze a non-exclusive license to use AI-generated content derived from your property data for distribution purposes.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            <strong>Distribution Consent:</strong> By submitting a property, you consent to PropBlaze distributing your property information to matched agencies across the EU. You acknowledge that once distributed, the information will be shared with real estate professionals for the purpose of generating qualified offers.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            <strong>Accuracy Responsibility:</strong> You are responsible for the accuracy and legality of all property information you submit. PropBlaze is not liable for claims arising from inaccurate property data, misleading descriptions, or unlawful property listings.
          </p>
        </section>

        {/* Section 5 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            5. Agency Terms
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px', fontWeight: 600 }}>
            If you are a real estate agency receiving property listings through PropBlaze:
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            <strong>Commission Agreements:</strong> Any commissions or fees for services rendered are subject to direct negotiation between the property owner and the agency. PropBlaze does not collect or manage commissions, but may facilitate communication regarding fee structures.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            <strong>Professional Conduct:</strong> Agencies receiving listings agree to conduct all business in compliance with applicable EU real estate regulations, consumer protection laws, and professional standards. Agencies must respond to property owners professionally and in a timely manner.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            <strong>Data Protection:</strong> Agencies must comply with all data protection regulations, including GDPR, when handling property owner information and personal data shared through the Platform.
          </p>
        </section>

        {/* Section 6 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            6. AI-Generated Content Disclaimer
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            PropBlaze uses artificial intelligence to generate property descriptions, marketing materials, and matching recommendations. While we strive for accuracy, AI-generated content may contain errors, omissions, or inaccuracies. You acknowledge that:
          </p>
          <ul style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>AI-generated descriptions are intended as supplementary marketing tools, not legal documents</li>
            <li style={{ marginBottom: '8px' }}>Property owners remain responsible for verifying the accuracy of all distributed information</li>
            <li style={{ marginBottom: '8px' }}>Agencies should conduct independent due diligence on properties and property owners</li>
            <li>PropBlaze is not liable for claims arising from AI-generated content inaccuracies</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            7. Subscription & Payment Terms
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            PropBlaze offers tiered subscription plans including free, monthly, and annual options. Payment processing is handled through Stripe. By subscribing, you authorize PropBlaze to charge your payment method according to your selected plan:
          </p>
          <ul style={{ color: C.textMd, lineHeight: 1.7, paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}>Monthly subscriptions renew automatically each calendar month</li>
            <li style={{ marginBottom: '8px' }}>Annual subscriptions renew after 12 months from the subscription date</li>
            <li style={{ marginBottom: '8px' }}>Billing occurs automatically on the billing date unless cancelled beforehand</li>
            <li>You may upgrade or downgrade your plan at any time</li>
          </ul>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            <strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial months or unused service periods.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            <strong>Price Changes:</strong> PropBlaze may adjust subscription pricing with 30 days' notice. Continued use of the Service after the notice period constitutes acceptance of the new pricing.
          </p>
        </section>

        {/* Section 8 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            8. "Mark as Sold" & Automatic Billing
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            When a property is marked as "sold" or otherwise removed from active distribution, billing for that property ceases automatically. Property owners using subscription plans remain responsible for active properties and may continue to be billed for the plan if other properties remain listed. To fully stop all billing, you must cancel your subscription.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            Marking properties as sold does not automatically cancel your subscription plan.
          </p>
        </section>

        {/* Section 9 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            9. Data Processing & GDPR
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            PropBlaze collects, processes, and stores personal data in compliance with the General Data Protection Regulation (GDPR) and other applicable EU data protection laws. For detailed information about how we collect, use, and protect your data, please refer to our <Link href="/privacy" style={{ color: C.orange, textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link>.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            Your rights under GDPR, including the right to access, correct, delete, and port your data, are detailed in our Privacy Policy. PropBlaze acts as a Data Controller for certain personal data and a Data Processor for data shared with agencies.
          </p>
        </section>

        {/* Section 10 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            10. Intellectual Property
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            All content, features, and functionality of the PropBlaze Service, including the software, design, layout, and trademarks, are the exclusive property of PropBlaze or its licensors. You may not reproduce, distribute, or transmit any content without prior written permission.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            You retain ownership of the property data and information you submit. By submitting data to PropBlaze, you grant us a worldwide, non-exclusive license to use, copy, and distribute that data for the purpose of providing the Service and generating AI-enhanced marketing materials.
          </p>
        </section>

        {/* Section 11 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            11. Limitation of Liability
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            To the maximum extent permitted by law, PropBlaze shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunity, even if advised of the possibility of such damages.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            PropBlaze does not guarantee that the Service will be uninterrupted, error-free, or secure. We are not responsible for losses or damages resulting from service interruptions, data loss, or third-party conduct.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            Our total liability to you for any claim arising out of or related to these Terms shall not exceed the fees you paid to PropBlaze in the 12 months preceding the claim.
          </p>
        </section>

        {/* Section 12 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            12. Governing Law & Jurisdiction
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            These Terms are governed by and construed in accordance with the laws of Serbia, without regard to its conflict of law principles. For EU users, the substantive privacy and data protection laws of the EU and the respective member states shall apply to the extent required by the GDPR and other applicable EU regulations.
          </p>
          <p style={{ color: C.textMd, lineHeight: 1.7 }}>
            Any legal action or proceeding arising out of or related to these Terms shall be exclusively resolved through mutual agreement, mediation, or arbitration. Users from EU member states may also have the right to pursue claims in their local courts in accordance with applicable EU law.
          </p>
        </section>

        {/* Section 13 */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.orange, marginBottom: '12px' }}>
            13. Contact Information
          </h2>
          <p style={{ color: C.textMd, lineHeight: 1.7, marginBottom: '12px' }}>
            If you have questions about these Terms of Use, or if you wish to report a violation, please contact us at:
          </p>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
            <p style={{ color: C.text, marginBottom: '8px', fontWeight: 500 }}>
              PropBlaze Support
            </p>
            <p style={{ color: C.textMd, fontSize: '14px', lineHeight: 1.6 }}>
              Email: <a href="mailto:support@propblaze.eu" style={{ color: C.orange, textDecoration: 'none' }}>support@propblaze.eu</a><br/>
              Website: propblaze.eu
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
          <p>Last Updated: April 2026</p>
          <p>These Terms of Use are effective immediately upon acceptance.</p>
        </div>
      </article>
    </div>
  );
}
