'use client';

/**
 * AgreementTemplate
 * -----------------
 * Renders the standard PropSeller agency mandate agreement as formatted HTML/JSX.
 * Pre-fills all known data from property + owner + agency.
 * Supports two modes:
 *   - "preview" — read-only, formatted
 *   - "sign"    — adds consent checkbox + digital signature block
 */

import React, { useState } from 'react';
import clsx from 'clsx';

export interface AgreementParty {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
}

export interface AgreementProperty {
  title: string;
  address: string;
  city: string;
  country: string;
  property_type: string;
  area_sqm?: number;
  asking_price: number;
  currency: string;
  min_acceptable_price?: number;
  commission_pct: number;
  commission_included: boolean;
  notary_pct?: number;
  notary_who_pays?: string;
}

export interface AgreementData {
  agreement_number: string;
  date: string;
  valid_until?: string;   // mandate end date
  seller: AgreementParty;
  agency: AgreementParty & { license_number?: string };
  property: AgreementProperty;
  exclusive: boolean;
  governing_law: string;   // e.g. "Serbia"
  language: 'en' | 'ru' | 'sr';
}

interface Props {
  data: AgreementData;
  mode?: 'preview' | 'sign';
  onSign?: (signatureData: { full_name: string; timestamp: string; ip_hint?: string }) => Promise<void>;
  alreadySigned?: boolean;
  signedAt?: string;
}

// ─── Translation strings ─────────────────────────────────────────────────────
const T = {
  en: {
    title: 'REAL ESTATE MANDATE AGREEMENT',
    between: 'entered into between:',
    seller_label: 'SELLER (Mandator)',
    agency_label: 'AGENCY (Mandatee)',
    property_label: 'PROPERTY',
    terms_title: 'TERMS & CONDITIONS',
    sign_title: 'DIGITAL SIGNATURE',
    sign_consent: 'I confirm that I have read and understood this agreement and agree to its terms.',
    sign_name_placeholder: 'Type your full legal name to sign',
    sign_btn: 'Sign Agreement',
    signed_badge: '✅ Digitally signed',
    clause: [
      { num: '1.', title: 'Subject of Agreement', text: (d: AgreementData) =>
        `The Seller appoints the Agency to act as ${d.exclusive ? 'an exclusive' : 'a non-exclusive'} mandatee to market and sell the Property described herein. The mandate period is from ${d.date} until ${d.valid_until || '12 months from the date of signing'}.`
      },
      { num: '2.', title: 'Commission', text: (d: AgreementData) =>
        `The Agency commission is ${d.property.commission_pct}% of the final sale price, ${d.property.commission_included ? 'already included in the listed asking price' : 'payable on top of the sale price by the buyer'}. Commission is payable upon successful completion of a sale and receipt of the sale proceeds.`
      },
      { num: '3.', title: 'Transaction Costs', text: (d: AgreementData) =>
        `Notary fees and transfer taxes (approximately ${d.property.notary_pct || 'TBD'}% of the sale price) shall be paid by the ${d.property.notary_who_pays || 'buyer'}, unless otherwise agreed in the purchase contract. The Agency shall assist in coordinating with local notary services.`
      },
      { num: '4.', title: 'Agency Obligations', text: () =>
        `The Agency undertakes to: (a) actively market the property to qualified buyers; (b) arrange and conduct property viewings (including remote/online viewings where requested); (c) conduct pre-qualification of potential buyers; (d) facilitate negotiations and assist in transaction documentation; (e) maintain professional confidentiality regarding the Seller's minimum acceptable price and personal data.`
      },
      { num: '5.', title: 'Seller Obligations', text: () =>
        `The Seller undertakes to: (a) provide accurate and complete property information and documentation; (b) make the property available for viewings with reasonable notice; (c) not conclude a sale with a buyer introduced by the Agency without paying the agreed commission; (d) notify the Agency immediately upon receipt of any offer.`
      },
      { num: '6.', title: 'Confidentiality', text: () =>
        `Both parties agree to maintain strict confidentiality regarding: (a) the Seller's minimum acceptable price; (b) personal contact information of both parties; (c) any terms of offers received. Buyer contact data shared with the Seller shall not be used for direct contact outside this mandate.`
      },
      { num: '7.', title: 'Data Protection (GDPR)', text: () =>
        `Both parties confirm compliance with the EU General Data Protection Regulation (GDPR). Personal data shared under this agreement shall be used solely for the purpose of completing the property transaction described herein and shall not be disclosed to third parties without explicit consent.`
      },
      { num: '8.', title: 'Termination', text: (d: AgreementData) =>
        `Either party may terminate this agreement with 14 days written notice. In case of termination, the commission remains payable if a sale is completed within 6 months with a buyer introduced by the Agency during the mandate period. ${d.exclusive ? 'During the exclusive mandate period, early termination by the Seller may incur a cancellation fee equal to 50% of the agreed commission.' : ''}`
      },
      { num: '9.', title: 'Governing Law & Disputes', text: (d: AgreementData) =>
        `This agreement shall be governed by the laws of ${d.governing_law}. Any disputes shall be resolved by mutual negotiation, failing which through the competent courts of ${d.governing_law}. The parties agree to attempt mediation before commencing litigation.`
      },
    ],
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
export function AgreementTemplate({ data, mode = 'preview', onSign, alreadySigned, signedAt }: Props) {
  const t = (T as Record<string, typeof T.en>)[data.language] ?? T.en;
  const [signName, setSignName] = useState('');
  const [consented, setConsented] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');

  const handleSign = async () => {
    if (!signName.trim() || !consented) return;
    if (signName.trim().toLowerCase() !== data.seller.full_name.toLowerCase()) {
      setSignError(`Name must match exactly: "${data.seller.full_name}"`);
      return;
    }
    setSigning(true);
    setSignError('');
    try {
      await onSign?.({
        full_name: signName.trim(),
        timestamp: new Date().toISOString(),
      });
    } catch {
      setSignError('Signing failed. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="bg-white text-gray-800 font-serif">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-6 mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-sm font-sans text-gray-400 uppercase tracking-widest">PropSeller AI Platform</span>
        </div>
        <h1 className="text-2xl font-bold tracking-wide uppercase">{t.title}</h1>
        <p className="text-sm text-gray-500 mt-2">
          Agreement No. <strong>{data.agreement_number}</strong> · Date: <strong>{data.date}</strong>
        </p>
      </div>

      {/* Preamble */}
      <p className="text-sm text-gray-600 mb-6 italic">
        This Real Estate Mandate Agreement ({t.between})
      </p>

      {/* Parties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Seller */}
        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t.seller_label}</p>
          <p className="font-bold text-gray-900">{data.seller.full_name}</p>
          <p className="text-sm text-gray-600 mt-1">{data.seller.email}</p>
          {data.seller.phone && <p className="text-sm text-gray-600">{data.seller.phone}</p>}
          {data.seller.address && <p className="text-sm text-gray-500 mt-1">{data.seller.address}</p>}
          {data.seller.country && <p className="text-sm text-gray-500">{data.seller.country}</p>}
        </div>

        {/* Agency */}
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">{t.agency_label}</p>
          <p className="font-bold text-gray-900">{data.agency.full_name}</p>
          {data.agency.license_number && (
            <p className="text-xs text-gray-500 mt-0.5">License: {data.agency.license_number}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">{data.agency.email}</p>
          {data.agency.phone && <p className="text-sm text-gray-600">{data.agency.phone}</p>}
          {data.agency.address && <p className="text-sm text-gray-500 mt-1">{data.agency.address}</p>}
        </div>
      </div>

      {/* Property */}
      <div className="border border-gray-200 rounded-xl p-5 mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t.property_label}</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {[
            ['Property', data.property.title],
            ['Type', data.property.property_type],
            ['Address', `${data.property.address}, ${data.property.city}, ${data.property.country}`],
            data.property.area_sqm ? ['Area', `${data.property.area_sqm} m²`] : null,
            ['Asking price', `${data.property.currency} ${data.property.asking_price.toLocaleString()}`],
            ['Agency commission', `${data.property.commission_pct}% (${data.property.commission_included ? 'included in price' : 'on top of price'})`],
            data.property.notary_pct ? ['Notary / transfer tax', `${data.property.notary_pct}% — paid by ${data.property.notary_who_pays || 'buyer'}`] : null,
            data.property.min_acceptable_price ? ['Min. acceptable price', `${data.property.currency} ${data.property.min_acceptable_price.toLocaleString()} (confidential)`] : null,
          ].filter((row): row is [string, string] => Array.isArray(row)).map(([label, value]) => (
            <React.Fragment key={label}>
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mandate type badge */}
      <div className={clsx(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8',
        data.exclusive ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
      )}>
        {data.exclusive ? '🔒 Exclusive mandate' : '🤝 Non-exclusive mandate'}
        {data.valid_until && <span className="font-normal opacity-70">· until {data.valid_until}</span>}
      </div>

      {/* Clauses */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">{t.terms_title}</p>
        <div className="space-y-5">
          {t.clause.map((clause: { num: string; title: string; text: (d: AgreementData) => string }) => (
            <div key={clause.num} className="flex gap-4">
              <span className="text-sm font-bold text-gray-400 flex-shrink-0 w-5">{clause.num}</span>
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">{clause.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{clause.text(data)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature block */}
      {mode === 'sign' && (
        <div className="border-t-2 border-gray-800 pt-8 mt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-center text-gray-500 mb-6">
            {t.sign_title}
          </p>

          {alreadySigned ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✅</div>
              <p className="font-bold text-green-700 text-lg">{t.signed_badge}</p>
              <p className="text-sm text-gray-500">
                Signed by <strong>{data.seller.full_name}</strong>
                {signedAt && <> on <strong>{new Date(signedAt).toLocaleString()}</strong></>}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Agreement No. {data.agreement_number} — This digital signature has legal validity
                under eIDAS regulation and Serbian/EU electronic signature laws.
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-sm text-gray-600 text-center">
                By signing below, you confirm your identity as <strong>{data.seller.full_name}</strong>
                and agree to all terms in this agreement.
              </p>

              {/* Consent */}
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-gray-600">{t.sign_consent}</span>
              </label>

              {/* Signature name input */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                  Type your full legal name to sign
                </label>
                <input
                  type="text"
                  value={signName}
                  onChange={(e) => { setSignName(e.target.value); setSignError(''); }}
                  placeholder={data.seller.full_name}
                  className={clsx(
                    'w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-colors',
                    signError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                  )}
                  style={{ fontFamily: 'cursive', fontSize: '1rem' }}
                />
                {signError && <p className="text-xs text-red-600 mt-1">{signError}</p>}
              </div>

              <button
                onClick={handleSign}
                disabled={!consented || !signName.trim() || signing}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {signing ? 'Signing...' : `✍️ ${t.sign_btn}`}
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                This digital signature is legally valid under EU eIDAS regulation.
                A timestamped copy will be sent to both parties by email.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 mt-8 text-center">
        <p className="text-xs text-gray-400">
          Generated by PropSeller AI Platform · propsellerai.eu
          {' '}· Agreement {data.agreement_number}
          {' '}· All data processed in accordance with GDPR
        </p>
      </div>
    </div>
  );
}
