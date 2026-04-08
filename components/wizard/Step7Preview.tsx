'use client';

import React, { useState, useEffect } from 'react';
import { useWizardStore } from '@/store/wizard';
import clsx from 'clsx';

// ─── Language config ──────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'sr', label: 'Srpski', flag: '🇷🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

// ─── Demo AI-generated content ────────────────────────────────────────────────
function generateSalesPack(
  step1: any, step2: any, step3: any,
  lang: string
): { subject: string; description: string; highlights: string[] } {
  const type = step1.property_type || 'property';
  const city = step1.city || 'the city';
  const area = step1.area_sqm ? `${step1.area_sqm} m²` : '';
  const price = step2.asking_price
    ? `${step2.currency || 'EUR'} ${Number(step2.asking_price).toLocaleString()}`
    : '';
  const beds = step1.bedrooms ? `${step1.bedrooms}-bedroom ` : '';
  const desc = step3.description_enhanced || step3.description_raw || '';

  if (lang === 'en') {
    return {
      subject: `${beds}${type} for sale in ${city}${price ? ` — ${price}` : ''}`,
      description: desc
        ? `${desc}\n\nThis exceptional ${type} offers ${area ? `${area} of` : ''} well-designed living space${city ? ` in the heart of ${city}` : ''}. The property is in excellent condition and available for immediate viewing.`
        : `A remarkable ${beds}${type}${area ? ` of ${area}` : ''} located${city ? ` in ${city}` : ''}. ${step3.proximity_tags?.includes('sea') ? 'Stunning sea views. ' : ''}${step3.proximity_tags?.includes('city_center') ? 'Prime city centre location. ' : ''}This is a rare opportunity for discerning buyers and investors.`,
      highlights: [
        area && `${area} of living space`,
        step1.bedrooms && `${step1.bedrooms} bedrooms`,
        step1.bathrooms && `${step1.bathrooms} bathrooms`,
        price && `Asking price: ${price}`,
        step2.negotiable && 'Price negotiable',
        step1.condition && `Condition: ${step1.condition.replace(/_/g, ' ')}`,
        step3.proximity_tags?.includes('parking') && 'Parking included',
        step3.proximity_tags?.includes('pool') && 'Swimming pool',
        step2.remote_viewing && 'Remote viewing available',
      ].filter(Boolean) as string[],
    };
  }

  if (lang === 'ru') {
    return {
      subject: `${type === 'apartment' ? 'Квартира' : type === 'house' ? 'Дом' : type === 'villa' ? 'Вилла' : 'Недвижимость'} в ${city}${price ? ` — ${price}` : ''}`,
      description: desc
        ? `${desc}\n\nПредлагаем ${beds ? `${beds.trim()}-комнатную ` : ''}${type === 'apartment' ? 'квартиру' : 'недвижимость'}${area ? ` площадью ${area}` : ''}${city ? ` в ${city}` : ''}. Объект в отличном состоянии, готов к просмотру.`
        : `Превосходный объект${area ? ` площадью ${area}` : ''}${city ? ` в ${city}` : ''}. ${step3.proximity_tags?.includes('sea') ? 'Вид на море. ' : ''}${step3.proximity_tags?.includes('city_center') ? 'В центре города. ' : ''}Редкая возможность для взыскательных покупателей и инвесторов.`,
      highlights: [
        area && `Площадь: ${area}`,
        step1.bedrooms && `Спальни: ${step1.bedrooms}`,
        step1.bathrooms && `Санузлы: ${step1.bathrooms}`,
        price && `Цена: ${price}`,
        step2.negotiable && 'Цена договорная',
        step3.proximity_tags?.includes('parking') && 'Парковочное место',
        step3.proximity_tags?.includes('pool') && 'Бассейн',
        step2.remote_viewing && 'Дистанционный просмотр',
      ].filter(Boolean) as string[],
    };
  }

  if (lang === 'sr') {
    return {
      subject: `${type === 'apartment' ? 'Stan' : type === 'house' ? 'Kuća' : 'Nekretnina'} na prodaju u ${city}${price ? ` — ${price}` : ''}`,
      description: desc
        ? `${desc}\n\nNudimo ${type === 'apartment' ? 'stan' : 'nekretninu'}${area ? ` površine ${area}` : ''}${city ? ` u ${city}` : ''}. Objekat je u odličnom stanju i spreman za razgledanje.`
        : `Izvanredna nekretnina${area ? ` od ${area}` : ''}${city ? ` u ${city}` : ''}. ${step3.proximity_tags?.includes('sea') ? 'Pogled na more. ' : ''}${step3.proximity_tags?.includes('city_center') ? 'Centar grada. ' : ''}Retka prilika za zahtevne kupce i investitore.`,
      highlights: [
        area && `Površina: ${area}`,
        step1.bedrooms && `Spavaće sobe: ${step1.bedrooms}`,
        price && `Cena: ${price}`,
        step2.negotiable && 'Cena je pregovarljiva',
        step3.proximity_tags?.includes('parking') && 'Parking',
        step2.remote_viewing && 'Online razgledanje',
      ].filter(Boolean) as string[],
    };
  }

  if (lang === 'de') {
    return {
      subject: `${type === 'apartment' ? 'Wohnung' : type === 'house' ? 'Haus' : 'Immobilie'} zum Verkauf in ${city}${price ? ` — ${price}` : ''}`,
      description: `Außergewöhnliche Immobilie${area ? ` mit ${area}` : ''}${city ? ` in ${city}` : ''}. Exzellenter Zustand, sofort besichtigbar.`,
      highlights: [
        area && `Wohnfläche: ${area}`,
        step1.bedrooms && `Schlafzimmer: ${step1.bedrooms}`,
        price && `Kaufpreis: ${price}`,
      ].filter(Boolean) as string[],
    };
  }

  return { subject: '', description: '', highlights: [] };
}

function generateCoverLetter(step1: any, step2: any, step6: any, lang: string): string {
  const type = step1.property_type || 'property';
  const city = step1.city || '';
  const price = step2.asking_price
    ? `${step2.currency || 'EUR'} ${Number(step2.asking_price).toLocaleString()}`
    : '';
  const name = step6.contact_name || 'the owner';

  if (lang === 'en') return `Dear [Agency Name] team,

I hope this message finds you well. My name is ${name}, and I am the owner of a ${type}${city ? ` located in ${city}` : ''}${price ? ` priced at ${price}` : ''}.

I am reaching out because PropSeller AI has identified your agency as an excellent match for this listing based on your specialisation, buyer profile, and market presence.

**Why this property might interest your clients:**
• Competitive pricing with ${step2.negotiable ? 'flexible negotiation' : 'strong market value'}
• ${step2.target_buyer_types?.includes('foreign_investor') ? 'Suitable for foreign investors and diaspora buyers' : 'Broad buyer appeal'}
• All documentation prepared and verified

I would appreciate the opportunity to discuss this listing in more detail. The full property details, photos and documents are included below.

Commission structure: ${step2.commission_pct ? `${step2.commission_pct}% (negotiable)` : 'To be discussed'}

Kind regards,
${name}
${step6.contact_phone || ''}`;

  if (lang === 'ru') return `Уважаемые коллеги,

Меня зовут ${name}. Я являюсь собственником ${type === 'apartment' ? 'квартиры' : 'объекта недвижимости'}${city ? ` в ${city}` : ''}${price ? `, стоимостью ${price}` : ''}.

Обращаюсь к вам, поскольку платформа PropSeller AI определила ваше агентство как наиболее подходящего партнёра для реализации данного объекта на основе вашей специализации и портфеля покупателей.

**Почему этот объект может заинтересовать ваших клиентов:**
• ${step2.negotiable ? 'Гибкие условия и возможность торга' : 'Конкурентная рыночная цена'}
• ${step2.target_buyer_types?.includes('diaspora') ? 'Подходит для диаспоры и иностранных инвесторов' : 'Широкая аудитория покупателей'}
• Все документы подготовлены и проверены

Буду рад/рада обсудить детали. Полная информация об объекте, фотографии и документы прилагаются.

Комиссия: ${step2.commission_pct ? `${step2.commission_pct}% (по договорённости)` : 'По договорённости'}

С уважением,
${name}
${step6.contact_phone || ''}`;

  if (lang === 'sr') return `Poštovana agencijo,

Moje ime je ${name} i vlasnik/ca sam nekretnine${city ? ` u ${city}` : ''}${price ? ` u vrednosti ${price}` : ''}.

Obraćam vam se jer je PropSeller AI platforma identifikovala vašu agenciju kao odličan partner za prodaju ovog objekta.

**Zašto bi ovaj objekat mogao interesovati vaše klijente:**
• Konkurentna cena${step2.negotiable ? ', moguće pregovaranje' : ''}
• Sva dokumentacija je pripremljena i proverena

Komisija: ${step2.commission_pct ? `${step2.commission_pct}%` : 'Po dogovoru'}

Srdačan pozdrav,
${name}`;

  return '';
}

// ─── Listing modes ────────────────────────────────────────────────────────────
const LISTING_MODES = [
  { value: 'public', label: 'Public listing', desc: 'Visible on platform with full details', icon: '🌐' },
  { value: 'semi_private', label: 'Semi-private', desc: 'Visible without contact details', icon: '👁' },
  { value: 'hidden', label: 'Agency-only', desc: 'Only sent to matched agencies, not public', icon: '🔒' },
];

interface Step7PreviewProps {
  listingMode: string;
  setListingMode: (mode: string) => void;
}

export function Step7Preview({ listingMode, setListingMode }: Step7PreviewProps) {
  const { step1, step2, step3, step4, step6, updateStep6 } = useWizardStore();

  const [activeTab, setActiveTab] = useState<'pack' | 'cover' | 'email' | 'checklist'>('pack');
  const [activeLang, setActiveLang] = useState<string>('en');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Selected languages for the pack
  const selectedLanguages: string[] = step6.preferred_languages?.length
    ? step6.preferred_languages
    : ['en'];

  const toggleLanguage = (code: string) => {
    const current = selectedLanguages;
    if (current.includes(code)) {
      if (current.length === 1) return; // at least 1 required
      updateStep6({ preferred_languages: current.filter(l => l !== code) });
    } else {
      updateStep6({ preferred_languages: [...current, code] });
    }
    setActiveLang(code);
  };

  // Auto-generate on mount (demo simulation)
  useEffect(() => {
    if (!generated && (step1.property_type || step1.city || step2.asking_price)) {
      setGenerating(true);
      const t = setTimeout(() => {
        setGenerating(false);
        setGenerated(true);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const pack = generateSalesPack(step1, step2, step3, activeLang);
  const coverLetter = generateCoverLetter(step1, step2, step6, activeLang);

  const completionItems = [
    { label: 'Property type & location', done: !!(step1.property_type && step1.country && step1.city) },
    { label: 'Area & specifications', done: !!(step1.area_sqm) },
    { label: 'Asking price set', done: !!(step2.asking_price && step2.asking_price > 0) },
    { label: 'Property description', done: step3.description_raw.length > 30 },
    { label: 'Photos uploaded (min 5)', done: step4.mediaFiles.length >= 5 },
    { label: 'Contact details', done: !!(step6.contact_name && step6.contact_email) },
    { label: 'Languages selected', done: selectedLanguages.length >= 1 },
  ];
  const completionScore = completionItems.filter(i => i.done).length;
  const isReady = completionScore >= 5;

  const handleCopyEmail = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  // Build email preview HTML
  const emailPreviewText = [
    `Subject: ${pack.subject}`,
    '',
    coverLetter,
    '',
    '---',
    pack.description,
    '',
    pack.highlights.map(h => `• ${h}`).join('\n'),
    '',
    '---',
    `Photos: ${step4.mediaFiles.length} attached`,
    `Sent via PropSeller AI Platform`,
  ].join('\n');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Sales Pack & Publish</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Review your multilingual sales pack, cover letter and email preview before activating distribution
        </p>
      </div>

      {/* ── Language selector ─────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Generate sales pack in these languages
          <span className="ml-2 text-xs text-blue-600 font-normal">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => toggleLanguage(lang.code)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {isSelected && <span className="text-blue-500">✓</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Each agency receives the pitch in their preferred language. You always approve before sending.
        </p>
      </div>

      {/* ── AI Generation status ─────────────────────────────────────── */}
      {generating ? (
        <div className="p-5 rounded-xl border border-blue-200 bg-blue-50 flex items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-700">Generating AI Sales Pack…</p>
            <p className="text-xs text-blue-500 mt-0.5">Creating multilingual descriptions and cover letters from your property data</p>
          </div>
        </div>
      ) : generated ? (
        <div className="p-3 rounded-xl border border-green-200 bg-green-50 flex items-center gap-3">
          <span className="text-green-600 text-lg">✅</span>
          <p className="text-sm font-semibold text-green-700">
            AI Sales Pack generated in {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''}
            <span className="font-normal text-green-600 ml-2">— review below before publishing</span>
          </p>
        </div>
      ) : null}

      {/* ── Tab navigation ────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 gap-1">
        {[
          { key: 'pack', label: '📄 Sales Pack' },
          { key: 'cover', label: '✉️ Cover Letter' },
          { key: 'email', label: '📧 Email Preview' },
          { key: 'checklist', label: '✅ Checklist' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Language tab switcher (inside content) ───────────────────── */}
      {(activeTab === 'pack' || activeTab === 'cover' || activeTab === 'email') && (
        <div className="flex gap-1.5">
          {selectedLanguages.map(code => {
            const lang = LANGUAGES.find(l => l.code === code);
            if (!lang) return null;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setActiveLang(code)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-semibold border transition-all',
                  activeLang === code
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                )}
              >
                {lang.flag} {lang.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── SALES PACK tab ───────────────────────────────────────────── */}
      {activeTab === 'pack' && (
        <div className="space-y-4">
          {/* Subject line */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email subject line</div>
            <div className="font-semibold text-gray-800">
              {pack.subject || (
                <span className="text-gray-400 italic">Fill in property details to generate…</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI-generated description</div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {pack.description || (
                <span className="text-gray-400 italic">Fill in property details to generate description…</span>
              )}
            </p>
          </div>

          {/* Highlights */}
          {pack.highlights.length > 0 && (
            <div className="p-4 rounded-xl border border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key highlights</div>
              <div className="grid grid-cols-2 gap-1.5">
                {pack.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 font-bold mt-0.5">✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos count */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Attached to outreach</div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>📷 {step4.mediaFiles.length} photos</span>
              <span>📋 {step2.commission_pct ? `${step2.commission_pct}% commission` : 'Commission TBD'}</span>
              <span>🌍 {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── COVER LETTER tab ─────────────────────────────────────────── */}
      {activeTab === 'cover' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-amber-50 border-amber-200">
            <p className="text-xs text-amber-700 font-medium">
              💡 This is the personalised cover letter sent to each agency. [Agency Name] is replaced automatically for each recipient.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white">
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {coverLetter || (
                <span className="text-gray-400 italic">Fill in contact details to generate cover letter…</span>
              )}
            </pre>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleCopyEmail(coverLetter)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
            >
              {emailCopied ? '✓ Copied' : '📋 Copy'}
            </button>
            <span className="text-xs text-gray-400 self-center">
              The actual letter is personalised per agency before sending
            </span>
          </div>
        </div>
      )}

      {/* ── EMAIL PREVIEW tab ────────────────────────────────────────── */}
      {activeTab === 'email' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {/* Email header */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 space-y-2">
              <div className="flex gap-3 text-sm">
                <span className="text-gray-400 w-12 flex-shrink-0">From:</span>
                <span className="text-gray-700">PropSeller AI &lt;outreach@propseller.eu&gt; on behalf of {step6.contact_name || 'Owner'}</span>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-gray-400 w-12 flex-shrink-0">To:</span>
                <span className="text-gray-700">[Agency Email] — personalised per recipient</span>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-gray-400 w-12 flex-shrink-0">Reply-to:</span>
                <span className="text-blue-600">{step6.contact_email || 'your@email.com'}</span>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-gray-400 w-12 flex-shrink-0">Subject:</span>
                <span className="font-semibold text-gray-800">{pack.subject || '—'}</span>
              </div>
            </div>

            {/* Email body */}
            <div className="p-5 bg-white">
              {/* Agency greeting */}
              <p className="text-sm text-gray-700 mb-4">Dear [Agency Name],</p>

              {/* Intro paragraph */}
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {step6.contact_name || 'The owner'} is selling a{' '}
                <strong>{step1.property_type || 'property'}</strong>
                {step1.city ? ` in ${step1.city}` : ''}{' '}
                {step2.asking_price
                  ? `priced at ${step2.currency || 'EUR'} ${Number(step2.asking_price).toLocaleString()}`
                  : ''}. PropSeller AI matched your agency based on your specialisation and buyer profile.
              </p>

              {/* Property card */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                    {step1.property_type === 'apartment' ? '🏢' : step1.property_type === 'villa' ? '🏡' : '🏠'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {step1.bedrooms ? `${step1.bedrooms}-bed ` : ''}{step1.property_type || 'Property'}
                      {step1.city ? `, ${step1.city}` : ''}
                    </p>
                    {step2.asking_price && (
                      <p className="text-blue-700 font-bold text-base">
                        {step2.currency || 'EUR'} {Number(step2.asking_price).toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      {step1.area_sqm && <span>📐 {step1.area_sqm} m²</span>}
                      {step1.bedrooms && <span>🛏 {step1.bedrooms} bed</span>}
                      {step4.mediaFiles.length > 0 && <span>📷 {step4.mediaFiles.length} photos</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover letter excerpt */}
              <div className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-line line-clamp-6">
                {pack.description || 'See attached property details.'}
              </div>

              {/* Commission */}
              {step2.commission_pct && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium mb-4">
                  💰 Commission: {step2.commission_pct}%
                  {step2.negotiable ? ' (negotiable)' : ''}
                </div>
              )}

              {/* Reply CTA */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Reply directly to this email to reach the owner. All replies are forwarded instantly to{' '}
                  <strong>{step6.contact_email || 'owner'}</strong>.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sent via PropSeller AI Platform · GDPR compliant · Unsubscribe
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCopyEmail(emailPreviewText)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
          >
            {emailCopied ? '✓ Copied' : '📋 Copy full email text'}
          </button>
        </div>
      )}

      {/* ── CHECKLIST tab ────────────────────────────────────────────── */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          {/* Completion */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Listing completeness</span>
              <span className={clsx('text-sm font-bold', completionScore >= 5 ? 'text-green-600' : 'text-orange-500')}>
                {completionScore}/{completionItems.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className={clsx('h-full rounded-full transition-all', completionScore >= 5 ? 'bg-green-500' : 'bg-orange-400')}
                style={{ width: `${(completionScore / completionItems.length) * 100}%` }}
              />
            </div>
            <div className="space-y-1.5">
              {completionItems.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={item.done ? 'text-green-500' : 'text-gray-300'}>{item.done ? '✓' : '○'}</span>
                  <span className={clsx('text-sm', item.done ? 'text-gray-700' : 'text-gray-400')}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div className="space-y-2">
            {[
              { n: '1', title: 'Payment activation', desc: 'Choose Starter (€49/mo) or Professional (€129/mo) to activate distribution' },
              { n: '2', title: 'AI prepares your offer', desc: `Sales pack generated in ${selectedLanguages.length} language${selectedLanguages.length > 1 ? 's' : ''} · 10–30 agencies matched by score` },
              { n: '3', title: 'You review & approve', desc: 'See full agency list with scores — nothing sent without your click' },
              { n: '4', title: 'Wave distribution', desc: 'Wave 1 sent via Email + WhatsApp + Telegram · Replies forwarded to you instantly' },
              { n: '5', title: 'Mark as Sold', desc: 'Billing stops automatically the moment you mark the property sold' },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Listing visibility ───────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Listing visibility</label>
        <div className="space-y-2">
          {LISTING_MODES.map(mode => (
            <label
              key={mode.value}
              className={clsx(
                'flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
                listingMode === mode.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input type="radio" name="listing_mode" value={mode.value} checked={listingMode === mode.value} onChange={() => setListingMode(mode.value)} className="accent-blue-600" />
              <span className="text-lg">{mode.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{mode.label}</p>
                <p className="text-xs text-gray-500">{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Publish status ───────────────────────────────────────────── */}
      {isReady ? (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <p className="text-sm text-green-700 font-semibold">
            ✅ Ready to publish · Sales pack generated in {selectedLanguages.map(l => LANGUAGES.find(x => x.code === l)?.flag).join(' ')}
          </p>
          <p className="text-xs text-green-600 mt-1">After publishing, choose a plan to activate agency distribution</p>
        </div>
      ) : (
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-sm text-orange-700 font-medium">
            ⚠️ Complete at least 5 sections to publish your listing ({completionScore}/{completionItems.length} done)
          </p>
        </div>
      )}
    </div>
  );
}
