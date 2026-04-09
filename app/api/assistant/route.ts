export const dynamic = "force-static";
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are Blaze, the AI assistant for PropBlaze — an AI-powered property distribution platform for property owners in Europe.

About PropBlaze:
- PropBlaze matches property owners to the best real estate agencies using AI
- Owners list their property, upload photos/documents, pay a subscription
- AI builds a professional sales package (cover letter, description, pitch deck) in 3 languages
- AI matches agencies from our database of 847+ verified agencies across 31 EU markets using 8 scoring dimensions
- Owner approves the final agency list and offer before anything is sent
- PropBlaze distributes the offer via email in waves: Wave 1 (top 10 agencies), Wave 2 (next 10 agencies after 48h of no response)
- Owner receives all replies forwarded to their email, Telegram, and WhatsApp
- Platform works for both SELL and RENT OUT intents
- GDPR-compliant, EU-hosted, encrypted document handling
- Owner contacts are NEVER shared — all communication goes through PropBlaze's agency ID system

Pricing:
- Starter: €49/month — 1 active property, up to 20 agencies per wave, Email + Telegram notifications
- Pro: €149/month — 5 active properties, up to 50 agencies per wave, all channels
- Agency: €499/month — unlimited properties, full API access
- 14-day free trial, billing stops automatically when marked as Sold

Supported languages: English, Russian, Serbian (platform interface)
Target markets: EU + neighboring countries (Montenegro, Serbia, Croatia, Bulgaria, Greece, Spain, Portugal, Italy, Germany, Austria, UK, UAE and more)
Property types: Apartment, House/Villa, Land, Commercial, Rental

Your personality:
- Professional but warm and direct
- Knowledgeable about European real estate and property sales
- Honest about what PropBlaze does and doesn't do
- Always guide users toward registering or listing their property
- If asked about support/help, tell them they can email support@propblaze.com
- Respond in the same language the user writes in (support EN, RU, SR, DE, ES)
- Keep answers concise — 3-5 sentences max unless a detailed explanation is needed
- Never make up features that don't exist
- If you don't know something specific, say so and direct them to support@propblaze.com`

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Try Anthropic first
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: messages.slice(-6), // Last 6 messages for context
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          reply: data.content[0]?.text || 'I had trouble generating a response.',
          provider: 'claude',
        })
      }
    }

    // Try OpenAI as fallback
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 512,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-6),
          ],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          reply: data.choices[0]?.message?.content || 'I had trouble generating a response.',
          provider: 'openai',
        })
      }
    }

    // Fallback: smart static responses
    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
    const lang = language || 'en'

    return NextResponse.json({
      reply: getStaticReply(userMessage, lang),
      provider: 'static',
    })
  } catch (error) {
    console.error('Assistant API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Smart static fallback when no LLM key is configured
function getStaticReply(msg: string, lang: string): string {
  const isRu = lang === 'ru' || /[а-яё]/i.test(msg)
  const isSr = lang === 'sr'

  // Pricing queries
  if (/price|cost|pricing|сколько|цена|тариф|plan|€|euro/i.test(msg)) {
    if (isRu) return 'Тарифы: Starter €49/мес (1 объект), Pro €149/мес (5 объектов), Agency €499/мес. Есть 14-дневный бесплатный период. Оплата автоматически останавливается при продаже объекта.'
    return 'Plans: Starter €49/mo (1 property), Pro €149/mo (5 properties), Agency €499/mo. 14-day free trial, no credit card required. Billing stops automatically when you mark as Sold.'
  }

  // How it works
  if (/how|work|work|process|как|работает|steps|wizard/i.test(msg)) {
    if (isRu) return 'PropBlaze работает за 5 шагов: 1) Загрузите объект с фото и документами, 2) ИИ создаёт продающий пакет на 3 языках, 3) ИИ подбирает лучшие агентства (до 20 за волну), 4) Вы одобряете список, 5) Рассылка запускается автоматически. Первые контакты от агентств — в течение 24 часов.'
    return 'PropBlaze works in 5 steps: 1) List your property with photos & docs, 2) AI builds a sales package in 3 languages, 3) AI matches best agencies (up to 20 per wave), 4) You approve the list, 5) Distribution fires automatically. First agency contacts typically arrive within 24 hours.'
  }

  // Agencies
  if (/agenc|partner|сколько агентств|агентств/i.test(msg)) {
    if (isRu) return 'В базе PropBlaze — 847+ верифицированных агентств в 31 рынке ЕС: Черногория, Сербия, Хорватия, Германия, Австрия, Испания, Великобритания, ОАЭ и другие. Все агентства проверены и оценены ИИ.'
    return 'PropBlaze has 847+ verified agencies across 31 EU markets including Montenegro, Serbia, Croatia, Germany, Austria, Spain, UK, UAE and more. All agencies are verified and AI-scored.'
  }

  // Support / contact
  if (/support|help|contact|issue|problem|помощь|поддержка/i.test(msg)) {
    if (isRu) return 'Наша поддержка: support@propblaze.com. Отвечаем в рабочее время (ЕС). Вы также можете написать нам через форму обратной связи на странице /contact.'
    return 'Our support team is at support@propblaze.com. We respond during EU business hours. You can also reach us via the contact form at propblaze.com/contact.'
  }

  // GDPR / security
  if (/gdpr|secure|privacy|данные|безопасност/i.test(msg)) {
    if (isRu) return 'PropBlaze полностью соответствует GDPR. Ваши документы зашифрованы, контакты собственника никогда не передаются агентствам напрямую. Вся коммуникация идёт через нашу платформу с вашего согласия.'
    return 'PropBlaze is fully GDPR-compliant. Your documents are encrypted, and your personal contact details are never shared with agencies. All communication goes through the platform with your explicit consent.'
  }

  // Default
  if (isRu) return 'Привет! Я Blaze, ИИ-ассистент PropBlaze 🔥 Я могу рассказать о тарифах, как работает платформа, о базе агентств или помочь начать листинг. Чем могу помочь?'
  if (isSr) return 'Zdravo! Ja sam Blaze, PropBlaze AI asistent 🔥 Mogu vam pomoći sa cenama, kako platforma funkcioniše, ili kako da listate vašu nekretninu. Šta vas zanima?'
  return "Hi! I'm Blaze, the PropBlaze AI assistant 🔥 I can help with pricing, how the platform works, our agency network, or getting your property listed. What would you like to know?"
}
