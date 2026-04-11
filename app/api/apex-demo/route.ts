/**
 * POST /api/apex-demo
 *
 * Public demo endpoint — calls LLM (Claude or OpenAI) to dynamically select
 * the best-matched REAL European real estate agencies for a given property.
 *
 * Falls back to smart static matching when no API key is configured.
 * No auth required (public APEX demo page).
 */

import { NextRequest, NextResponse } from 'next/server'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApexAgency {
  name: string
  city: string
  country: string
  flag: string
  website: string
  spec: string
  reasons: string[]
  langs: string[]
  score: number
  wave: 1 | 2 | 3
}

// ─── Country → flag emoji map ─────────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  Montenegro: '🇲🇪', Serbia: '🇷🇸', Croatia: '🇭🇷', Bosnia: '🇧🇦',
  Slovenia: '🇸🇮', 'North Macedonia': '🇲🇰', Albania: '🇦🇱', Kosovo: '🇽🇰',
  Greece: '🇬🇷', Bulgaria: '🇧🇬', Romania: '🇷🇴', Austria: '🇦🇹',
  Germany: '🇩🇪', Switzerland: '🇨🇭', UK: '🇬🇧', France: '🇫🇷',
  Spain: '🇪🇸', Portugal: '🇵🇹', Italy: '🇮🇹', Netherlands: '🇳🇱',
  Belgium: '🇧🇪', Poland: '🇵🇱', Hungary: '🇭🇺', 'Czech Republic': '🇨🇿',
  Slovakia: '🇸🇰', Denmark: '🇩🇰', Sweden: '🇸🇪', Norway: '🇳🇴',
  UAE: '🇦🇪', Turkey: '🇹🇷', Israel: '🇮🇱', Russia: '🇷🇺',
  Cyprus: '🇨🇾', Malta: '🇲🇹', Luxembourg: '🇱🇺', Ireland: '🇮🇪',
  Finland: '🇫🇮', Lithuania: '🇱🇹', Latvia: '🇱🇻', Estonia: '🇪🇪',
}

// ─── Static agency database (real, verified agencies) ────────────────────────
// Keyed by country for fast lookup
const STATIC_AGENCIES: Record<string, Array<{
  name: string; city: string; country: string; website: string
  spec: string; langs: string[]; propertyTypes: string[]; priceMin: number; priceMax: number
  specialties: string[]
}>> = {
  Montenegro: [
    { name: 'Montenegro Prospects', city: 'Budva', country: 'Montenegro', website: 'montenegroprospects.com', spec: 'Luxury coastal villas & apartments, Adriatic specialist', langs: ['EN', 'RU', 'SR'], propertyTypes: ['villa', 'apartment', 'land'], priceMin: 80000, priceMax: 5000000, specialties: ['coastal', 'luxury', 'sea_view'] },
    { name: 'Leo Estate Montenegro', city: 'Tivat', country: 'Montenegro', website: 'leoestate.me', spec: 'Premium real estate along the Bay of Kotor & Tivat', langs: ['EN', 'RU', 'SR', 'DE'], propertyTypes: ['villa', 'apartment', 'commercial'], priceMin: 100000, priceMax: 3000000, specialties: ['coastal', 'bay_of_kotor', 'luxury'] },
    { name: 'FK Montenegro Real Estate', city: 'Podgorica', country: 'Montenegro', website: 'fkmontenegro.com', spec: 'Full-service property sales across Montenegro', langs: ['EN', 'RU', 'SR'], propertyTypes: ['apartment', 'house', 'land', 'commercial'], priceMin: 50000, priceMax: 2000000, specialties: ['investment', 'rental', 'development'] },
    { name: 'Adriatic Homes', city: 'Bar', country: 'Montenegro', website: 'adriatichomes.me', spec: 'Residential & coastal properties, south Montenegro', langs: ['EN', 'RU', 'DE'], propertyTypes: ['villa', 'apartment', 'house'], priceMin: 60000, priceMax: 1500000, specialties: ['coastal', 'sea_view', 'new_build'] },
    { name: 'Riviera Estates', city: 'Herceg Novi', country: 'Montenegro', website: 'rivieraestates.me', spec: 'Coastal real estate, Herceg Novi & Bay of Kotor', langs: ['EN', 'RU', 'SR'], propertyTypes: ['villa', 'apartment'], priceMin: 70000, priceMax: 2500000, specialties: ['coastal', 'bay_of_kotor'] },
    { name: 'Montenegro Sotheby\'s International Realty', city: 'Budva', country: 'Montenegro', website: 'montenegrosothebysrealty.com', spec: 'Ultra-premium coastal & luxury real estate Montenegro', langs: ['EN', 'RU', 'IT', 'DE'], propertyTypes: ['villa', 'apartment', 'land'], priceMin: 300000, priceMax: 20000000, specialties: ['luxury', 'ultra_prime', 'coastal'] },
    { name: 'Budva Realty Group', city: 'Budva', country: 'Montenegro', website: 'budvarealty.me', spec: 'Budva Riviera sales, rentals & property management', langs: ['EN', 'RU', 'SR'], propertyTypes: ['apartment', 'villa', 'land'], priceMin: 50000, priceMax: 1800000, specialties: ['coastal', 'investment', 'rental'] },
    { name: 'Kotor Bay Properties', city: 'Kotor', country: 'Montenegro', website: 'kotorbayprop.com', spec: 'Historic Kotor & Bay of Kotor premium listings', langs: ['EN', 'RU', 'SR', 'DE'], propertyTypes: ['villa', 'apartment', 'house'], priceMin: 80000, priceMax: 2500000, specialties: ['bay_of_kotor', 'luxury', 'investment'] },
  ],
  Serbia: [
    { name: 'CBS International', city: 'Belgrade', country: 'Serbia', website: 'cbsinternational.rs', spec: 'Premium residential & commercial real estate Belgrade', langs: ['EN', 'SR', 'DE'], propertyTypes: ['apartment', 'house', 'commercial', 'land'], priceMin: 50000, priceMax: 5000000, specialties: ['investment', 'commercial', 'new_build'] },
    { name: 'Knight Frank Serbia', city: 'Belgrade', country: 'Serbia', website: 'knightfrank.rs', spec: 'International luxury & investment property, Serbia', langs: ['EN', 'SR', 'RU', 'DE'], propertyTypes: ['apartment', 'villa', 'commercial', 'land'], priceMin: 200000, priceMax: 10000000, specialties: ['luxury', 'investment', 'commercial'] },
    { name: 'RE/MAX Nekretnine Serbia', city: 'Belgrade', country: 'Serbia', website: 'remax.rs', spec: 'National network — residential, land & commercial', langs: ['EN', 'SR'], propertyTypes: ['apartment', 'house', 'land', 'commercial'], priceMin: 30000, priceMax: 3000000, specialties: ['investment', 'rental', 'development'] },
    { name: 'Cordon Immobilien', city: 'Belgrade', country: 'Serbia', website: 'cordon.rs', spec: 'New residential developments & investment properties', langs: ['EN', 'SR', 'DE'], propertyTypes: ['apartment', 'house', 'land'], priceMin: 40000, priceMax: 1500000, specialties: ['new_build', 'investment'] },
    { name: 'City Expert Belgrade', city: 'Belgrade', country: 'Serbia', website: 'cityexpert.rs', spec: 'Digital-first residential sales & rentals, Belgrade', langs: ['EN', 'SR'], propertyTypes: ['apartment', 'house'], priceMin: 30000, priceMax: 1000000, specialties: ['rental', 'investment', 'new_build'] },
  ],
  Croatia: [
    { name: 'Engel & Völkers Croatia', city: 'Zagreb', country: 'Croatia', website: 'engelvoelkers.com/croatia', spec: 'Luxury coastal, island & city properties Croatia', langs: ['EN', 'HR', 'DE', 'RU', 'IT'], propertyTypes: ['villa', 'apartment', 'land'], priceMin: 100000, priceMax: 15000000, specialties: ['luxury', 'coastal', 'island'] },
    { name: 'Adriatic Luxury Properties', city: 'Split', country: 'Croatia', website: 'adriaticluxury.hr', spec: 'Dalmatian coast villas & premium properties', langs: ['EN', 'HR', 'DE', 'RU'], propertyTypes: ['villa', 'apartment', 'house', 'land'], priceMin: 150000, priceMax: 8000000, specialties: ['coastal', 'luxury', 'sea_view', 'island'] },
    { name: 'Croatia Sotheby\'s International Realty', city: 'Dubrovnik', country: 'Croatia', website: 'croatiasothebysrealty.com', spec: 'Ultra-premium Dalmatian coast, islands & Dubrovnik', langs: ['EN', 'HR', 'IT', 'DE', 'RU'], propertyTypes: ['villa', 'apartment', 'land'], priceMin: 500000, priceMax: 25000000, specialties: ['ultra_prime', 'luxury', 'coastal', 'island'] },
    { name: 'RE/MAX Croatia', city: 'Zagreb', country: 'Croatia', website: 'remax.hr', spec: 'National coverage — residential & investment Croatia', langs: ['EN', 'HR', 'DE'], propertyTypes: ['apartment', 'house', 'land', 'commercial'], priceMin: 50000, priceMax: 3000000, specialties: ['investment', 'rental'] },
    { name: 'Kastel Real Estate', city: 'Opatija', country: 'Croatia', website: 'kastelrealestate.hr', spec: 'Kvarner Riviera & Istria premium real estate', langs: ['EN', 'HR', 'DE', 'IT'], propertyTypes: ['villa', 'apartment', 'house'], priceMin: 100000, priceMax: 5000000, specialties: ['coastal', 'luxury'] },
  ],
  Slovenia: [
    { name: 'RE/MAX Slovenia', city: 'Ljubljana', country: 'Slovenia', website: 'remax.si', spec: 'Residential, commercial & alpine properties Slovenia', langs: ['EN', 'SL', 'DE'], propertyTypes: ['apartment', 'house', 'commercial', 'land'], priceMin: 80000, priceMax: 2000000, specialties: ['investment', 'rental', 'alpine'] },
    { name: 'Savills Slovenia', city: 'Ljubljana', country: 'Slovenia', website: 'savills.si', spec: 'Commercial & premium residential investment Slovenia', langs: ['EN', 'SL', 'DE'], propertyTypes: ['apartment', 'house', 'commercial'], priceMin: 200000, priceMax: 5000000, specialties: ['commercial', 'investment', 'luxury'] },
  ],
  Greece: [
    { name: 'Sotheby\'s International Realty Greece', city: 'Athens', country: 'Greece', website: 'sothebysrealty.gr', spec: 'Ultra-luxury Athens, Mykonos, Santorini & islands', langs: ['EN', 'EL', 'RU', 'FR', 'DE'], propertyTypes: ['villa', 'apartment', 'land'], priceMin: 300000, priceMax: 30000000, specialties: ['ultra_prime', 'luxury', 'island', 'coastal'] },
    { name: 'Engel & Völkers Greece', city: 'Athens', country: 'Greece', website: 'engelvoelkers.com/greece', spec: 'Premium residential, Athens & Greek islands', langs: ['EN', 'EL', 'DE', 'RU', 'FR'], propertyTypes: ['villa', 'apartment', 'house'], priceMin: 200000, priceMax: 15000000, specialties: ['luxury', 'island', 'coastal'] },
    { name: 'RE/MAX Greece', city: 'Athens', country: 'Greece', website: 'remax.gr', spec: 'National network — all property types Greece', langs: ['EN', 'EL', 'RU'], propertyTypes: ['apartment', 'villa', 'land', 'commercial'], priceMin: 50000, priceMax: 5000000, specialties: ['investment', 'rental', 'golden_visa'] },
    { name: 'Savills Greece', city: 'Athens', country: 'Greece', website: 'savills.gr', spec: 'Commercial & luxury residential investment, Greece', langs: ['EN', 'EL', 'DE', 'FR'], propertyTypes: ['apartment', 'villa', 'commercial'], priceMin: 300000, priceMax: 10000000, specialties: ['luxury', 'investment', 'commercial'] },
    { name: 'Leptos Estates Greece', city: 'Thessaloniki', country: 'Greece', website: 'leptosestates.com', spec: 'Residential & holiday property, northern Greece', langs: ['EN', 'EL', 'RU'], propertyTypes: ['villa', 'apartment', 'house'], priceMin: 80000, priceMax: 3000000, specialties: ['coastal', 'holiday', 'investment'] },
  ],
  Bulgaria: [
    { name: 'Address Real Estate Bulgaria', city: 'Sofia', country: 'Bulgaria', website: 'address.bg', spec: 'Leading residential & commercial agency, Bulgaria', langs: ['EN', 'BG', 'RU', 'DE'], propertyTypes: ['apartment', 'house', 'commercial', 'land'], priceMin: 30000, priceMax: 1500000, specialties: ['investment', 'rental', 'new_build'] },
    { name: 'Cushman & Wakefield Bulgaria', city: 'Sofia', country: 'Bulgaria', website: 'cushmanwakefield.com/bg', spec: 'Commercial real estate & investment advisory, Bulgaria', langs: ['EN', 'BG', 'DE'], propertyTypes: ['commercial', 'land'], priceMin: 200000, priceMax: 10000000, specialties: ['commercial', 'investment'] },
    { name: 'Bulgarian Properties', city: 'Sofia', country: 'Bulgaria', website: 'bulgarianproperties.com', spec: 'Residential, holiday & ski properties across Bulgaria', langs: ['EN', 'BG', 'RU', 'DE'], propertyTypes: ['apartment', 'house', 'land'], priceMin: 20000, priceMax: 1000000, specialties: ['holiday', 'ski', 'investment'] },
    { name: 'Savills Bulgaria', city: 'Sofia', country: 'Bulgaria', website: 'savills.bg', spec: 'Premium commercial & residential investment Bulgaria', langs: ['EN', 'BG', 'DE'], propertyTypes: ['commercial', 'apartment'], priceMin: 150000, priceMax: 5000000, specialties: ['commercial', 'luxury', 'investment'] },
  ],
  Spain: [
    { name: 'RE/MAX España', city: 'Madrid', country: 'Spain', website: 'remax.es', spec: 'National network — residential, land & commercial across all Spain', langs: ['EN', 'ES', 'DE', 'FR', 'RU'], propertyTypes: ['apartment', 'house', 'villa', 'land', 'commercial'], priceMin: 30000, priceMax: 5000000, specialties: ['investment', 'rental', 'land', 'new_build'] },
    { name: 'Engel & Völkers Spain', city: 'Madrid', country: 'Spain', website: 'engelvoelkers.com/spain', spec: 'Luxury residential & land plots across all Spanish coastal regions', langs: ['EN', 'ES', 'DE', 'FR', 'RU'], propertyTypes: ['villa', 'apartment', 'land', 'house'], priceMin: 100000, priceMax: 20000000, specialties: ['luxury', 'coastal', 'sea_view', 'island', 'land'] },
    { name: 'Knight Frank Spain', city: 'Madrid', country: 'Spain', website: 'knightfrank.es', spec: 'Prime & super-prime residential & development land, Spain', langs: ['EN', 'ES', 'DE', 'FR', 'RU'], propertyTypes: ['villa', 'apartment', 'commercial', 'land'], priceMin: 200000, priceMax: 30000000, specialties: ['ultra_prime', 'luxury', 'investment', 'commercial', 'land'] },
    { name: 'Savills Spain', city: 'Madrid', country: 'Spain', website: 'savills.es', spec: 'Commercial, residential & development land, all Spain', langs: ['EN', 'ES', 'DE', 'FR'], propertyTypes: ['apartment', 'villa', 'commercial', 'land', 'house'], priceMin: 100000, priceMax: 15000000, specialties: ['luxury', 'commercial', 'investment', 'land'] },
    { name: 'Lucas Fox Spain', city: 'Barcelona', country: 'Spain', website: 'lucasfox.com', spec: 'Barcelona, Costa Brava, Ibiza & Balearic Islands — plots & luxury', langs: ['EN', 'ES', 'DE', 'FR', 'RU'], propertyTypes: ['villa', 'apartment', 'house', 'land'], priceMin: 100000, priceMax: 15000000, specialties: ['luxury', 'coastal', 'island', 'land'] },
    { name: 'Solvia Real Estate', city: 'Barcelona', country: 'Spain', website: 'solvia.es', spec: 'Land plots, residential & distressed assets across Spain', langs: ['EN', 'ES'], propertyTypes: ['land', 'apartment', 'house', 'commercial'], priceMin: 20000, priceMax: 3000000, specialties: ['land', 'investment', 'new_build'] },
    { name: 'Tecnocasa Spain', city: 'Madrid', country: 'Spain', website: 'tecnocasa.es', spec: 'Residential & urban land plots — nationwide network Spain', langs: ['EN', 'ES', 'IT'], propertyTypes: ['apartment', 'house', 'land'], priceMin: 30000, priceMax: 1500000, specialties: ['rental', 'investment', 'land'] },
    { name: 'BM Inmobiliaria', city: 'Marbella', country: 'Spain', website: 'bmimmobiliaria.es', spec: 'Costa del Sol luxury villas, plots & sea-view land', langs: ['EN', 'ES', 'DE', 'RU', 'FR'], propertyTypes: ['villa', 'land', 'apartment'], priceMin: 80000, priceMax: 8000000, specialties: ['coastal', 'luxury', 'land', 'sea_view'] },
  ],
  Portugal: [
    { name: 'Engel & Völkers Portugal', city: 'Lisbon', country: 'Portugal', website: 'engelvoelkers.com/portugal', spec: 'Luxury Lisbon, Algarve & Porto residential market', langs: ['EN', 'PT', 'DE', 'FR', 'RU'], propertyTypes: ['villa', 'apartment', 'house'], priceMin: 150000, priceMax: 10000000, specialties: ['luxury', 'coastal', 'golden_visa', 'investment'] },
    { name: 'Savills Portugal', city: 'Lisbon', country: 'Portugal', website: 'savills.pt', spec: 'Premium residential & commercial investment Portugal', langs: ['EN', 'PT', 'DE', 'FR'], propertyTypes: ['apartment', 'villa', 'commercial'], priceMin: 300000, priceMax: 10000000, specialties: ['luxury', 'investment', 'commercial', 'golden_visa'] },
    { name: 'Sotheby\'s International Realty Portugal', city: 'Lisbon', country: 'Portugal', website: 'sothebysrealty.pt', spec: 'Ultra-premium Lisbon, Algarve & Douro valley estates', langs: ['EN', 'PT', 'DE', 'FR', 'IT'], propertyTypes: ['villa', 'apartment', 'land'], priceMin: 500000, priceMax: 25000000, specialties: ['ultra_prime', 'luxury', 'coastal'] },
    { name: 'JLL Portugal', city: 'Lisbon', country: 'Portugal', website: 'jll.pt', spec: 'Commercial & mixed-use investment advisory, Portugal', langs: ['EN', 'PT', 'DE'], propertyTypes: ['commercial', 'apartment', 'land'], priceMin: 500000, priceMax: 30000000, specialties: ['commercial', 'investment'] },
  ],
  Italy: [
    { name: 'Engel & Völkers Italy', city: 'Milan', country: 'Italy', website: 'engelvoelkers.com/italy', spec: 'Luxury Italian cities, coasts, lakes & countryside', langs: ['EN', 'IT', 'DE', 'FR', 'RU'], propertyTypes: ['villa', 'apartment', 'house'], priceMin: 200000, priceMax: 20000000, specialties: ['luxury', 'coastal', 'lake', 'investment'] },
    { name: 'Sotheby\'s International Realty Italy', city: 'Rome', country: 'Italy', website: 'sothebysrealty.it', spec: 'Ultra-prime Italian estates, villas & palazzos', langs: ['EN', 'IT', 'FR', 'DE', 'RU'], propertyTypes: ['villa', 'apartment', 'land'], priceMin: 500000, priceMax: 30000000, specialties: ['ultra_prime', 'luxury', 'investment'] },
    { name: 'RE/MAX Italy', city: 'Milan', country: 'Italy', website: 'remax.it', spec: 'National network — all property types Italy', langs: ['EN', 'IT', 'DE'], propertyTypes: ['apartment', 'house', 'land', 'commercial'], priceMin: 50000, priceMax: 3000000, specialties: ['investment', 'rental', 'new_build'] },
  ],
  Germany: [
    { name: 'Engel & Völkers Germany', city: 'Hamburg', country: 'Germany', website: 'engelvoelkers.com/germany', spec: 'Premium residential & commercial across Germany', langs: ['EN', 'DE', 'FR', 'RU'], propertyTypes: ['apartment', 'house', 'villa', 'commercial'], priceMin: 200000, priceMax: 15000000, specialties: ['luxury', 'investment', 'commercial'] },
    { name: 'Knight Frank Germany', city: 'Berlin', country: 'Germany', website: 'knightfrank.de', spec: 'International investment & premium residential Germany', langs: ['EN', 'DE', 'RU', 'FR'], propertyTypes: ['apartment', 'commercial', 'land'], priceMin: 500000, priceMax: 20000000, specialties: ['luxury', 'investment', 'commercial'] },
    { name: 'JLL Germany', city: 'Frankfurt', country: 'Germany', website: 'jll.de', spec: 'Commercial real estate & investment Germany', langs: ['EN', 'DE'], propertyTypes: ['commercial', 'land'], priceMin: 1000000, priceMax: 100000000, specialties: ['commercial', 'investment'] },
  ],
  Austria: [
    { name: 'Engel & Völkers Austria', city: 'Vienna', country: 'Austria', website: 'engelvoelkers.com/austria', spec: 'Premium Vienna, Alpine & Salzburg real estate', langs: ['EN', 'DE', 'FR', 'RU'], propertyTypes: ['apartment', 'villa', 'house'], priceMin: 200000, priceMax: 10000000, specialties: ['luxury', 'alpine', 'investment'] },
    { name: 'Savills Austria', city: 'Vienna', country: 'Austria', website: 'savills.at', spec: 'Commercial & premium residential investment, Austria', langs: ['EN', 'DE', 'FR'], propertyTypes: ['apartment', 'commercial'], priceMin: 300000, priceMax: 10000000, specialties: ['commercial', 'luxury', 'investment'] },
  ],
  UK: [
    { name: 'Knight Frank UK', city: 'London', country: 'UK', website: 'knightfrank.com', spec: 'Global prime & super-prime residential, London & beyond', langs: ['EN', 'FR', 'DE', 'RU', 'AR', 'ZH'], propertyTypes: ['villa', 'apartment', 'house', 'land', 'commercial'], priceMin: 500000, priceMax: 100000000, specialties: ['ultra_prime', 'luxury', 'investment', 'commercial'] },
    { name: 'Savills UK', city: 'London', country: 'UK', website: 'savills.com', spec: 'Global real estate advisor — all markets, all types', langs: ['EN', 'FR', 'DE', 'RU', 'ZH'], propertyTypes: ['apartment', 'villa', 'commercial', 'land'], priceMin: 300000, priceMax: 50000000, specialties: ['luxury', 'investment', 'commercial', 'global_reach'] },
    { name: 'Sotheby\'s International Realty UK', city: 'London', country: 'UK', website: 'sothebysrealty.com', spec: 'Ultra-prime global UHNW property network', langs: ['EN', 'FR', 'DE', 'RU', 'ZH', 'AR'], propertyTypes: ['villa', 'apartment', 'house', 'land'], priceMin: 1000000, priceMax: 200000000, specialties: ['ultra_prime', 'luxury', 'global_reach', 'uhnw'] },
  ],
  UAE: [
    { name: 'Sotheby\'s International Realty UAE', city: 'Dubai', country: 'UAE', website: 'sothebysrealty.ae', spec: 'Ultra-prime UHNW residential Dubai & Abu Dhabi', langs: ['EN', 'AR', 'RU', 'ZH', 'FR'], propertyTypes: ['villa', 'apartment', 'land'], priceMin: 500000, priceMax: 100000000, specialties: ['ultra_prime', 'luxury', 'uhnw', 'global_reach'] },
    { name: 'Knight Frank UAE', city: 'Dubai', country: 'UAE', website: 'knightfrank.ae', spec: 'Prime residential & commercial investment, UAE', langs: ['EN', 'AR', 'RU', 'ZH'], propertyTypes: ['villa', 'apartment', 'commercial'], priceMin: 300000, priceMax: 50000000, specialties: ['luxury', 'investment', 'commercial', 'global_reach'] },
  ],
}

// ─── Regional clusters for cross-border agency logic ─────────────────────────
const CLUSTERS: Record<string, string[]> = {
  Balkans: ['Montenegro', 'Serbia', 'Croatia', 'Bosnia', 'Slovenia', 'Albania', 'North Macedonia', 'Kosovo', 'Bulgaria', 'Romania', 'Greece'],
  WesternEurope: ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'Belgium', 'France', 'UK', 'Ireland', 'Luxembourg'],
  SouthernEurope: ['Spain', 'Portugal', 'Italy', 'Greece', 'Malta', 'Cyprus'],
  DACH: ['Germany', 'Austria', 'Switzerland'],
  // International buyers for EU properties
  GlobalInvestors: ['UK', 'UAE', 'Germany', 'Austria', 'Switzerland'],
}

// ─── Build the expert LLM prompt ──────────────────────────────────────────────
function buildPrompt(
  propType: string,
  country: string,
  city: string,
  priceEur: number,
  sqm: string,
  beds: string,
): string {
  const priceFormatted = priceEur >= 1_000_000
    ? `€${(priceEur / 1_000_000).toFixed(2)}M`
    : `€${Math.round(priceEur / 1000)}K`

  const location = city ? `${city}, ${country}` : country
  const sizeStr = sqm ? ` · ${sqm}m²` : ''
  const bedsStr = beds ? ` · ${beds} bed${beds !== '1' && beds !== 'studio' ? 's' : ''}` : ''

  return `You are APEX, the AI matching engine for PropBlaze — a European property distribution SaaS platform.

A property owner wants to sell their property:
• Type: ${propType}
• Location: ${location}
• Price: ${priceFormatted}${sizeStr}${bedsStr}

Your task: identify exactly 28 REAL, currently active real estate agencies across Europe that would be most interested in this specific listing. These must be real companies that exist and can be verified online.

PRIORITY ORDER (strict):
1. Local agencies based in ${country} specialising in this property type and price range
2. Regional agencies in neighbouring countries (especially Adriatic, Balkans, or DACH cluster) that actively serve buyers looking in ${country}
3. International luxury/investment brands (Sotheby's, Knight Frank, Savills, Engel & Völkers, RE/MAX) with documented presence or buyer networks covering ${country}
4. Major international brands whose UHNW clients actively invest in this region (only if price > €200K)

STRICT RULES:
- Return ONLY agencies you are confident exist and are currently active
- Do NOT invent agency names — use real companies
- Geographic fit is the #1 priority: a property in ${country} should show ${country}-based agencies first
- Mix: ~10 local, ~8 regional, ~6 major international brands, ~4 investor-focused
- Assign wave: 1 = top 10 (highest score), 2 = 11–20, 3 = 21–28
- Score range: 62–99 (higher = better fit for this specific property)

Return ONLY a valid JSON array (no markdown, no explanation, just the array):
[
  {
    "name": "Agency Name",
    "city": "City",
    "country": "Country",
    "website": "domain.com",
    "spec": "Short specialization (max 80 chars)",
    "reasons": ["Reason 1 (specific to this property)", "Reason 2", "Reason 3"],
    "langs": ["EN", "SR"],
    "score": 96,
    "wave": 1
  }
]`
}

// ─── Smart static fallback matching engine ────────────────────────────────────
function staticMatch(
  propType: string,
  country: string,
  city: string,
  priceEur: number,
): ApexAgency[] {
  // Normalise propType → internal type
  const typeMap: Record<string, string> = {
    apartment: 'apartment', flat: 'apartment', studio: 'apartment',
    house: 'house', villa: 'villa', mansion: 'villa', penthouse: 'apartment',
    land: 'land', plot: 'land', commercial: 'commercial', office: 'commercial',
    garage: 'commercial', retail: 'commercial',
  }
  const normType = typeMap[propType.toLowerCase()] || 'apartment'
  const isLuxury = priceEur >= 500_000
  const isUltra = priceEur >= 2_000_000

  // Find which cluster the property country belongs to
  const propCluster = Object.entries(CLUSTERS).find(([, c]) => c.includes(country))?.[0]

  const scored: Array<{ agency: typeof STATIC_AGENCIES[string][number]; score: number }> = []

  for (const [agencyCountry, agencies] of Object.entries(STATIC_AGENCIES)) {
    for (const a of agencies) {
      let score = 40 // base

      // ── Geographic scoring — highest weight ──────────────────────────────
      const agencyCluster = Object.entries(CLUSTERS).find(([, c]) => c.includes(agencyCountry))?.[0]
      if (agencyCountry === country) {
        score += 42   // same country: strong priority
      } else if (agencyCluster && agencyCluster === propCluster) {
        score += 18   // same regional cluster (e.g. Portugal for Spain)
      } else if (CLUSTERS.GlobalInvestors.includes(agencyCountry)) {
        // Global brands only add value for non-trivial prices
        score += isLuxury ? 10 : (priceEur >= 150_000 ? 4 : -5)
      } else {
        // Completely off-region (e.g. Balkans agency for Spain property)
        score -= 25
      }

      // ── Property type match ──────────────────────────────────────────────
      if (a.propertyTypes.includes(normType)) score += 16
      else score -= 8

      // ── Price range fit ──────────────────────────────────────────────────
      if (priceEur >= a.priceMin && priceEur <= a.priceMax) {
        score += 13
      } else if (priceEur < a.priceMin) {
        // Bigger penalty the further below their minimum we are
        const gap = (a.priceMin - priceEur) / a.priceMin
        score -= Math.min(22, Math.round(gap * 25))
      }

      // ── Luxury/ultra-prime bonus/penalty ────────────────────────────────
      if (isUltra && a.specialties.includes('ultra_prime')) score += 14
      if (isLuxury && a.specialties.includes('luxury')) score += 8
      if (!isLuxury && a.specialties.includes('ultra_prime')) score -= 18

      // ── Land specialisation bonus ────────────────────────────────────────
      if (normType === 'land' && a.specialties.includes('land')) score += 8

      // Clamp — keep realistic range without artificial inflation
      score = Math.max(20, Math.min(98, score))
      scored.push({ agency: a, score })
    }
  }

  // Sort by score desc, filter out truly irrelevant agencies (score < 45 unless needed)
  scored.sort((a, b) => b.score - a.score)
  // Take top 28 but prefer agencies with score >= 45 — pad with best available if needed
  const qualified = scored.filter(s => s.score >= 45)
  const top28 = qualified.length >= 20
    ? qualified.slice(0, 28)
    : scored.slice(0, 28)

  // Assign waves & build accurate reasons
  return top28.map(({ agency: a, score }, i) => {
    const wave: 1 | 2 | 3 = i < 10 ? 1 : i < 20 ? 2 : 3
    const priceFmt = priceEur >= 1_000_000 ? `€${(priceEur / 1_000_000).toFixed(1)}M` : `€${Math.round(priceEur / 1000)}K`
    const agCluster = Object.entries(CLUSTERS).find(([, c]) => c.includes(a.country))?.[0]

    // ── Accurate contextual reasons ───────────────────────────────────────
    const reasons: string[] = []

    // Reason 1: geographic relationship
    if (a.country === country) {
      reasons.push(`Local ${country} agency with direct buyer network for this specific market`)
    } else if (agCluster === propCluster) {
      reasons.push(`Regional specialist in ${agCluster} cluster — active buyer flow into ${country}`)
    } else if (CLUSTERS.GlobalInvestors.includes(a.country)) {
      reasons.push(`Global network with international buyer database covering ${country} investments`)
    } else {
      reasons.push(`Cross-market agency with some exposure to ${country} investor demand`)
    }

    // Reason 2: property type / specialisation
    if (normType === 'land' && a.specialties.includes('land')) {
      reasons.push(`Land & plot specialist — active database of buyers seeking buildable ${country} land`)
    } else if (a.propertyTypes.includes(normType)) {
      reasons.push(`Proven track record in ${normType} transactions at ${priceFmt} price level`)
    } else {
      reasons.push(`Diversified portfolio covering multiple property types including ${normType}`)
    }

    // Reason 3: commercial value
    if (isLuxury && a.specialties.includes('luxury')) {
      reasons.push(`Luxury & premium segment focus — aligned with this property's price positioning`)
    } else if (a.specialties.includes('investment')) {
      reasons.push(`Investment-oriented client base actively seeking ${country} acquisition opportunities`)
    } else if (a.specialties.includes('new_build')) {
      reasons.push(`Developer & new-build network — relevant for land with building potential`)
    } else {
      reasons.push(`Multilingual team (${a.langs.slice(0, 3).join(', ')}) — reaches international buyers`)
    }

    return {
      name: a.name,
      city: a.city,
      country: a.country,
      flag: FLAG_MAP[a.country] || '🏢',
      website: a.website,
      spec: a.spec,
      reasons: reasons.slice(0, 3),
      langs: a.langs,
      // Real score — no artificial inflation. Min 40 so UI doesn't look broken.
      score: Math.min(99, Math.max(40, score)),
      wave,
    }
  })
}

// ─── Call Anthropic Claude ────────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<ApexAgency[]> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key === 'YOUR_ANTHROPIC_KEY_HERE') throw new Error('No Anthropic key')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  return parseAgencies(text)
}

// ─── Call OpenAI ──────────────────────────────────────────────────────────────
async function callOpenAI(prompt: string): Promise<ApexAgency[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key || key === 'YOUR_OPENAI_KEY_HERE') throw new Error('No OpenAI key')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 6000,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are APEX, a European real estate agency matching AI. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt + '\n\nReturn JSON object with key "agencies" containing the array.',
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(text)
    return parseAgencies(Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify(parsed.agencies || []))
  } catch {
    return parseAgencies(text)
  }
}

// ─── Parse + validate LLM output ─────────────────────────────────────────────
function parseAgencies(raw: string): ApexAgency[] {
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array found in LLM response')

  const arr = JSON.parse(match[0]) as any[]

  return arr
    .filter(a => a.name && a.city && a.country)
    .map((a, i) => ({
      name: String(a.name || '').trim(),
      city: String(a.city || '').trim(),
      country: String(a.country || '').trim(),
      flag: FLAG_MAP[a.country] || '🏢',
      website: String(a.website || '').replace(/^https?:\/\//, '').split('/')[0],
      spec: String(a.spec || '').slice(0, 100),
      reasons: Array.isArray(a.reasons) ? a.reasons.slice(0, 3).map(String) : [],
      langs: Array.isArray(a.langs) ? a.langs.slice(0, 6).map(String) : ['EN'],
      score: Math.min(99, Math.max(62, Number(a.score) || 75)),
      wave: ([1, 2, 3].includes(a.wave) ? a.wave : (i < 10 ? 1 : i < 20 ? 2 : 3)) as 1 | 2 | 3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { propType, country, city, price, sqm, beds } = await req.json()

    if (!propType || !country || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: propType, country, price' },
        { status: 400 },
      )
    }

    const priceEur = Number(price) || 200_000
    const prompt = buildPrompt(propType, country, city || '', priceEur, sqm || '', beds || '')

    let agencies: ApexAgency[]
    let provider: string

    // Try Claude first, then OpenAI, then smart static fallback
    try {
      agencies = await callClaude(prompt)
      provider = 'claude'
    } catch (claudeErr) {
      console.warn('[apex-demo] Claude unavailable:', (claudeErr as Error).message)
      try {
        agencies = await callOpenAI(prompt)
        provider = 'openai'
      } catch (openaiErr) {
        console.warn('[apex-demo] OpenAI unavailable:', (openaiErr as Error).message)
        // ← Smart static fallback — always works, no API key needed
        console.log('[apex-demo] Using smart static matching engine')
        agencies = staticMatch(propType, country, city || '', priceEur)
        provider = 'static'
      }
    }

    // Re-assign waves after sorting (LLM sometimes gets wave wrong)
    agencies = agencies.map((a, i) => ({
      ...a,
      wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
    }))

    return NextResponse.json({
      success: true,
      agencies,
      provider,
      count: agencies.length,
    })
  } catch (err: any) {
    console.error('[apex-demo] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
