import { NextRequest, NextResponse } from 'next/server'

interface DistributeAgency {
  id: string; name: string; email: string; city: string; country: string
  flag?: string; phone?: string; wave: 1 | 2 | 3; apex_score?: number
}

interface PropertyData {
  type: string; city: string; country: string; areaSqm: number; price: number
  currency?: string; bedrooms?: number; bathrooms?: number; description?: string
  address?: string; parcelNumber?: string; cadastralMunicipality?: string
  listNepokretnosti?: string; ownershipShare?: string; noLiens?: boolean
}

interface DistributeRequest {
  property: PropertyData; agencies: DistributeAgency[]
  ownerName: string; ownerEmail: string; ownerPhone?: string
  letterLanguage?: string; customLetter?: string
  demoMode?: boolean  // legacy: route all to DEMO_EMAIL
  testMode?: boolean  // domain warmup: 1 real test email, rest simulated in UI only
}

export async function POST(req: NextRequest) {
  try {
    const body: DistributeRequest = await req.json()
    const { property, agencies, ownerName, ownerEmail, ownerPhone, customLetter, demoMode, testMode } = body

    if (!agencies?.length || !property) {
      return NextResponse.json({ error: 'Missing property or agencies' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const DEMO_EMAIL = 'contact@win-winsolution.com'
    const results: { agency_id: string; agency_name: string; email: string; status: 'sent' | 'failed'; simulated?: boolean; error?: string }[] = []

    for (let i = 0; i < agencies.length; i++) {
      const agency = agencies[i]
      const subject = buildSubject(property, agency)
      const htmlBody = buildEmailHTML(property, agency, ownerName, ownerEmail, ownerPhone, customLetter)

      // testMode: only send first agency as real (to DEMO_EMAIL for verification),
      // rest are logged as "sent" in UI without actual API call (domain warmup)
      const isTestOnly = testMode && i > 0
      const isFull     = !demoMode && !testMode

      if (isTestOnly) {
        // Simulate: add 150ms delay so UI progress feels real, no Resend call
        await new Promise(r => setTimeout(r, 150))
        results.push({ agency_id: agency.id, agency_name: agency.name, email: agency.email, status: 'sent', simulated: true })
        continue
      }

      // Real send: testMode idx=0 → DEMO_EMAIL, demoMode → DEMO_EMAIL, full → real email
      const recipientEmail = (demoMode || testMode) ? DEMO_EMAIL : agency.email

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'PropBlaze Platform <onboarding@resend.dev>',
            to: [recipientEmail],
            reply_to: ownerEmail || DEMO_EMAIL,
            bcc: isFull && ownerEmail !== DEMO_EMAIL ? [DEMO_EMAIL] : undefined,
            subject: testMode ? `[TEST] ${subject}` : subject,
            html: htmlBody,
          }),
        })
        if (res.ok) {
          results.push({ agency_id: agency.id, agency_name: agency.name, email: agency.email, status: 'sent' })
        } else {
          const err = await res.json().catch(() => ({ message: 'Unknown' }))
          results.push({ agency_id: agency.id, agency_name: agency.name, email: agency.email, status: 'failed', error: err.message })
        }
        await new Promise(r => setTimeout(r, 600))
      } catch (e: any) {
        results.push({ agency_id: agency.id, agency_name: agency.name, email: agency.email, status: 'failed', error: e.message })
      }
    }

    // Telegram notification
    const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN
    const tgChat  = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID  || process.env.TELEGRAM_CHAT_ID
    const sent      = results.filter(r => r.status === 'sent').length
    const failed    = results.filter(r => r.status === 'failed').length
    const simulated = results.filter(r => r.simulated).length

    if (tgToken && tgChat) {
      const modeLabel = demoMode ? '⚠️ DEMO MODE' : testMode ? `🧪 TEST MODE (1 real + ${simulated} simulated)` : '✅ Full real send'
      const msg = [
        `🚀 <b>APEX Distribution launched!</b>`,
        `📍 <b>${property.type}</b> · ${property.city}, ${property.country}`,
        property.areaSqm ? `📐 ${property.areaSqm} m²` : '',
        property.price ? `💶 €${property.price.toLocaleString('de-DE')}` : '',
        property.parcelNumber ? `📜 Parcela ${property.parcelNumber}, KO ${property.cadastralMunicipality || ''}` : '',
        ``,
        `📡 <b>Sent: ${sent}</b> (${agencies.length} total)${failed > 0 ? ` | ⚠️ Failed: ${failed}` : ''}`,
        `📨 Replies → ${ownerEmail}`,
        modeLabel,
      ].filter(Boolean).join('\n')
      try {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: tgChat, text: msg, parse_mode: 'HTML' }),
        })
      } catch {}
    }

    // ── Owner summary email ────────────────────────────────────────────────────
    // Send a confirmation to the owner after distribution completes
    if (!demoMode && ownerEmail && sent > 0) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      const ownerSummaryHtml = buildOwnerSummaryEmail(property, ownerName, sent, failed, simulated, agencies)
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: `PropBlaze Platform <${fromEmail}>`,
            to: [ownerEmail],
            reply_to: 'hello@propblaze.com',
            subject: testMode
              ? `[TEST] Your property was distributed to ${sent} agencies`
              : `✅ Your property was distributed to ${sent} agencies — PropBlaze`,
            html: ownerSummaryHtml,
          }),
        })
      } catch {}
    }

    return NextResponse.json({ success: true, sent, failed, simulated, total: agencies.length, results, test_mode: testMode ?? false, demo_mode: demoMode ?? false })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function buildSubject(p: PropertyData, a: DistributeAgency): string {
  const price = p.price ? `€${p.price.toLocaleString('de-DE')}` : ''
  const area  = p.areaSqm ? `${p.areaSqm} m²` : ''
  const c = a.country?.toUpperCase()
  if (['DE','AT','CH'].includes(c)) return `${p.type} zum Verkauf – ${p.city} ${area} ${price} | PropBlaze APEX`
  if (['GB','US','AU'].includes(c)) return `${p.type} for Sale – ${p.city}, ${p.country} ${area} ${price} | PropBlaze APEX`
  if (['RU','UA','BY'].includes(c)) return `${p.type} на продажу – ${p.city} ${area} ${price} | PropBlaze APEX`
  return `PONUDA: ${p.type} za prodaju – ${p.city}, ${p.country} ${area} ${price} | PropBlaze APEX`
}

function buildEmailHTML(p: PropertyData, a: DistributeAgency, ownerName: string, ownerEmail: string, ownerPhone?: string, customLetter?: string): string {
  const price = p.price ? `€${p.price.toLocaleString('de-DE')}` : 'Na upit'
  const area  = p.areaSqm ? `${p.areaSqm} m²` : '—'
  const loc   = [p.address || p.city, p.country].filter(Boolean).join(', ')
  const letter = customLetter
    ? customLetter.replace(/\[AGENCIJA\]/gi, a.name).replace(/\[GRAD\]/gi, a.city||'').replace(/\[IME\]/gi, ownerName)
    : buildDefaultLetter(p, a, ownerName, ownerEmail, ownerPhone)

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#F8FAFC;color:#0F172A}
.w{max-width:620px;margin:0 auto;background:#fff}
.hdr{background:linear-gradient(135deg,#16A34A,#15803D);padding:28px 32px;color:#fff}
.hdr h1{font-size:20px;font-weight:800;letter-spacing:-0.02em}
.hdr p{font-size:12px;opacity:.75;margin-top:2px}
.badge{display:inline-block;background:rgba(255,255,255,.2);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin-top:10px;letter-spacing:.05em}
.card{margin:24px 32px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px}
.card h2{font-size:18px;font-weight:800;margin-bottom:4px}
.card .sub{font-size:13px;color:#64748B;margin-bottom:16px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.gi{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:10px 14px}
.gi .l{font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.08em}
.gi .v{font-size:15px;font-weight:800;color:#0F172A;margin-top:2px}
.gi .v.g{color:#16A34A}
.score{margin:0 32px 20px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:12px}
.sn{font-size:28px;font-weight:900;color:#3B82F6;flex-shrink:0}
.st{font-size:12px;color:#3B5BDB;line-height:1.5}
.body{margin:0 32px;font-size:14px;line-height:1.8;color:#334155;white-space:pre-wrap}
.cbox{margin:24px 32px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:18px}
.ctitle{font-size:11px;font-weight:700;color:#16A34A;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
.crow{font-size:13px;color:#166534;margin-bottom:5px}
.foot{margin:24px 32px 32px;padding-top:20px;border-top:1px solid #E2E8F0}
.foot p{font-size:11px;color:#94A3B8;line-height:1.6}
</style></head><body><div class="w">
  <div class="hdr">
    <h1>PropBlaze</h1>
    <p>APEX AI Distribution Platform · EU Property</p>
    <div class="badge">🚀 APEX Match · Wave ${a.wave}</div>
  </div>
  <div class="card">
    <h2>${p.type} · ${area}</h2>
    <div class="sub">📍 ${loc}</div>
    <div class="grid">
      <div class="gi"><div class="l">Price</div><div class="v g">${price}</div></div>
      <div class="gi"><div class="l">Area</div><div class="v">${area}</div></div>
      ${p.parcelNumber ? `<div class="gi"><div class="l">Parcel №</div><div class="v">${p.parcelNumber}</div></div>` : ''}
      ${p.listNepokretnosti ? `<div class="gi"><div class="l">List nepokr.</div><div class="v">${p.listNepokretnosti}</div></div>` : ''}
      ${p.ownershipShare ? `<div class="gi"><div class="l">Ownership</div><div class="v">${p.ownershipShare}</div></div>` : ''}
      ${p.noLiens !== undefined ? `<div class="gi"><div class="l">Liens</div><div class="v" style="color:${p.noLiens?'#16A34A':'#DC2626'}">${p.noLiens ? '✓ None' : '⚠️ Check'}</div></div>` : ''}
    </div>
  </div>
  ${a.apex_score ? `<div class="score"><div class="sn">${a.apex_score}</div><div class="st"><strong>APEX Match Score</strong><br>Selected from Wave ${a.wave} agencies by AI matching engine.</div></div>` : ''}
  <div class="body">${letter}</div>
  <div class="cbox">
    <div class="ctitle">📞 Owner Direct Contact</div>
    <div class="crow">👤 <strong>${ownerName}</strong></div>
    <div class="crow">✉️ <a href="mailto:${ownerEmail}" style="color:#166534">${ownerEmail}</a></div>
    ${ownerPhone ? `<div class="crow">📱 <a href="tel:${ownerPhone}" style="color:#166534">${ownerPhone}</a></div>` : ''}
  </div>
  <div class="foot">
    <p>Sent via <strong>PropBlaze APEX</strong> · owner-approved distribution · replies go to ${ownerEmail}</p>
    <p style="margin-top:8px;font-size:10px;color:#CBD5E1">To unsubscribe reply with subject "unsubscribe"</p>
  </div>
</div></body></html>`
}

function buildOwnerSummaryEmail(p: PropertyData, ownerName: string, sent: number, failed: number, simulated: number, agencies: DistributeAgency[]): string {
  const price = p.price ? `€${p.price.toLocaleString('de-DE')}` : ''
  const area  = p.areaSqm ? `${p.areaSqm} m²` : ''
  const topAgencies = agencies.slice(0, 5).map(a => `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#e2e8f0">${a.flag || ''} ${a.name}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#94a3b8">${a.city}, ${a.country}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#f97316;font-weight:700;text-align:center">Wave ${a.wave}</td>
  </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#fff;padding:40px 20px;margin:0">
  <div style="max-width:580px;margin:0 auto">
    <div style="margin-bottom:28px">
      <span style="font-size:20px;font-weight:800">Prop<span style="color:#f97316">Blaze</span></span>
    </div>

    <div style="background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.25);border-radius:16px;padding:24px;margin-bottom:28px">
      <p style="font-size:22px;font-weight:900;margin:0 0 8px">✅ Distribution Complete!</p>
      <p style="color:rgba(255,255,255,.5);margin:0;font-size:14px">Your property has been sent to <strong style="color:#fff">${sent} agencies</strong> from our registered network.</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:28px">
      <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:16px;text-align:center">
        <p style="font-size:28px;font-weight:900;color:#22c55e;margin:0">${sent}</p>
        <p style="font-size:11px;color:rgba(255,255,255,.4);margin:4px 0 0;text-transform:uppercase;letter-spacing:.05em">Sent</p>
      </div>
      <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:16px;text-align:center">
        <p style="font-size:28px;font-weight:900;color:#f97316;margin:0">${simulated}</p>
        <p style="font-size:11px;color:rgba(255,255,255,.4);margin:4px 0 0;text-transform:uppercase;letter-spacing:.05em">Simulated</p>
      </div>
      <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:16px;text-align:center">
        <p style="font-size:28px;font-weight:900;color:${failed > 0 ? '#ef4444' : '#64748b'};margin:0">${failed}</p>
        <p style="font-size:11px;color:rgba(255,255,255,.4);margin:4px 0 0;text-transform:uppercase;letter-spacing:.05em">Failed</p>
      </div>
    </div>

    <div style="background:rgba(255,255,255,.04);border-radius:14px;padding:20px;margin-bottom:24px">
      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.4);margin:0 0 4px">Property</p>
      <p style="font-size:18px;font-weight:800;margin:0 0 4px">${p.type} · ${area} · ${price}</p>
      <p style="color:rgba(255,255,255,.5);font-size:13px;margin:0">📍 ${[p.address || p.city, p.country].filter(Boolean).join(', ')}</p>
    </div>

    ${topAgencies ? `<div style="margin-bottom:24px">
      <p style="font-size:13px;font-weight:700;color:rgba(255,255,255,.6);margin:0 0 12px">Agencies contacted (top 5):</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;background:rgba(255,255,255,.03);border-radius:10px;overflow:hidden">
        ${topAgencies}
      </table>
    </div>` : ''}

    <div style="background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.15);border-radius:12px;padding:16px;margin-bottom:24px">
      <p style="font-size:13px;color:rgba(255,255,255,.6);margin:0">📨 <strong style="color:#f97316">Replies go directly to you</strong> — agencies will contact you at this email address. Expect responses within 24–72 hours from the best matches.</p>
    </div>

    <p style="text-align:center;color:rgba(255,255,255,.2);font-size:12px">PropBlaze · hello@propblaze.com · propblaze.com</p>
  </div>
</body>
</html>`
}

function buildDefaultLetter(p: PropertyData, a: DistributeAgency, ownerName: string, ownerEmail: string, ownerPhone?: string): string {
  const price = p.price ? `€${p.price.toLocaleString('de-DE')}` : ''
  const area  = p.areaSqm ? `${p.areaSqm} m²` : ''
  const c = a.country?.toUpperCase()

  if (['DE','AT','CH'].includes(c)) return `Sehr geehrte Damen und Herren von ${a.name},\n\nals Eigentümer einer Liegenschaft in ${p.city}, ${p.country} wende ich mich an Ihre Agentur.\n\nOBJEKTDATEN:\n  Art: ${p.type}\n  Fläche: ${area}\n  Preis: ${price}\n${p.parcelNumber ? `  Parzelle: ${p.parcelNumber}\n` : ''}${p.noLiens ? '  Lasten: Keine\n' : ''}\nVollständige Dokumentation liegt vor. Direktverkauf vom Eigentümer.\n\nMit freundlichen Grüßen,\n${ownerName}\n${ownerPhone||''}\n${ownerEmail}`

  if (['RU','UA','BY'].includes(c)) return `Уважаемые коллеги из ${a.name},\n\nКак владелец недвижимости в ${p.city}, ${p.country}, предлагаю сотрудничество по продаже объекта.\n\nДАННЫЕ ОБЪЕКТА:\n  Тип: ${p.type}\n  Площадь: ${area}\n  Цена: ${price}\n${p.parcelNumber ? `  Участок: ${p.parcelNumber}\n` : ''}${p.noLiens ? '  Обременений: нет\n' : ''}\nДокументы в порядке. Прямая продажа от собственника.\n\nС уважением,\n${ownerName}\n${ownerPhone||''}\n${ownerEmail}`

  return `Dear ${a.name},\n\nI am the owner of a property in ${p.city}, ${p.country} and would like to explore cooperation for its sale.\n\nPROPERTY:\n  Type: ${p.type}\n  Area: ${area}\n  Price: ${price}\n${p.parcelNumber ? `  Parcel: ${p.parcelNumber}\n` : ''}${p.noLiens ? '  Liens: None\n' : ''}\nFull documentation available. Direct owner sale.\n\nBest regards,\n${ownerName}\n${ownerPhone||''}\n${ownerEmail}`
}
