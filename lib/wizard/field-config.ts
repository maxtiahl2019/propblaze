/**
 * PropBlaze Wizard — Dynamic field configuration by property type
 *
 * Philosophy: show ONLY the fields that are relevant to each property type.
 * Fewer fields = better UX = higher completion rate.
 */

export type PropertyType = 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'new_build'
export type PropertyIntent = 'sell' | 'rent'

export interface FieldConfig {
  // Step 2: Basics
  show_price: boolean
  price_label: string          // "Asking price" vs "Monthly rent"
  show_size: boolean
  show_rooms: boolean
  show_bathrooms: boolean
  show_floor: boolean
  show_total_floors: boolean
  show_year_built: boolean
  show_condition: boolean
  show_plot_size: boolean      // Land only
  show_zoning: boolean         // Land + Commercial
  show_commercial_type: boolean // Commercial only
  show_furnished: boolean      // Apartments + Villas

  // Step 3: Features
  show_features: boolean
  available_features: string[]

  // Step 4: Media
  min_photos: number
  max_photos: number
  show_floor_plan: boolean
  show_cadastral_docs: boolean
  show_title_deed: boolean
  show_energy_cert: boolean
  show_rental_history: boolean // Rent intent only
  show_tenancy_agreement: boolean // Rent intent only

  // Step 5: AI Package
  show_sales_letter: boolean
  show_rental_pitch: boolean
  package_languages: number    // how many AI languages to generate
}

const ALL_FEATURES = [
  'Pool', 'Garage', 'Sea view', 'Mountain view', 'Garden', 'Terrace',
  'Balcony', 'Elevator', 'Parking', 'Storage', 'Air conditioning',
  'Underfloor heating', 'Smart home', 'Solar panels', 'Generator',
  'Security system', 'Concierge', 'Gym', 'Sauna', 'BBQ area',
]

const APARTMENT_FEATURES = [
  'Balcony', 'Terrace', 'Elevator', 'Parking', 'Storage', 'Pool',
  'Gym', 'Concierge', 'Air conditioning', 'Smart home', 'Sea view',
  'Mountain view', 'Furnished', 'Security system',
]

const LAND_FEATURES = [
  'Sea view', 'Mountain view', 'Road access', 'Utilities connected',
  'Water supply', 'Electricity', 'Building permit', 'Flat terrain',
  'Fenced', 'Fruit trees', 'Well', 'Pool possible',
]

const COMMERCIAL_FEATURES = [
  'Parking', 'Loading dock', 'Open plan', 'HVAC system', 'Generator',
  'Security system', 'High ceilings', 'Shop front', '3-phase power',
  'Server room', 'Meeting rooms', 'Canteen',
]

// ─── Base configs per type ─────────────────────────────────────────────────────

const BASE: Record<PropertyType, Partial<FieldConfig>> = {
  apartment: {
    show_floor: true,
    show_total_floors: true,
    show_rooms: true,
    show_bathrooms: true,
    show_furnished: true,
    show_plot_size: false,
    show_zoning: false,
    show_commercial_type: false,
    available_features: APARTMENT_FEATURES,
    min_photos: 3,
    show_floor_plan: true,
    show_energy_cert: true,
  },
  house: {
    show_floor: false,
    show_total_floors: true,
    show_rooms: true,
    show_bathrooms: true,
    show_furnished: false,
    show_plot_size: true,
    show_zoning: false,
    show_commercial_type: false,
    available_features: ALL_FEATURES,
    min_photos: 3,
    show_floor_plan: true,
    show_energy_cert: true,
  },
  villa: {
    show_floor: false,
    show_total_floors: true,
    show_rooms: true,
    show_bathrooms: true,
    show_furnished: false,
    show_plot_size: true,
    show_zoning: false,
    show_commercial_type: false,
    available_features: ALL_FEATURES,
    min_photos: 3,
    show_floor_plan: true,
    show_energy_cert: true,
  },
  land: {
    // Land — very minimal fields
    show_floor: false,
    show_total_floors: false,
    show_rooms: false,
    show_bathrooms: false,
    show_furnished: false,
    show_year_built: false,
    show_condition: false,
    show_plot_size: true,
    show_zoning: true,
    show_commercial_type: false,
    available_features: LAND_FEATURES,
    min_photos: 3,
    show_floor_plan: false,
    show_energy_cert: false,
  },
  commercial: {
    show_floor: true,
    show_total_floors: true,
    show_rooms: false,
    show_bathrooms: false,
    show_furnished: false,
    show_plot_size: true,
    show_zoning: true,
    show_commercial_type: true,
    available_features: COMMERCIAL_FEATURES,
    min_photos: 3,
    show_floor_plan: true,
    show_energy_cert: true,
  },
  new_build: {
    show_floor: true,
    show_total_floors: true,
    show_rooms: true,
    show_bathrooms: true,
    show_furnished: false,
    show_year_built: true,
    show_condition: false,   // It's always "new"
    show_plot_size: false,
    show_zoning: false,
    show_commercial_type: false,
    available_features: ALL_FEATURES,
    min_photos: 3,
    show_floor_plan: true,
    show_energy_cert: true,
  },
}

// ─── Main config resolver ──────────────────────────────────────────────────────

export function getFieldConfig(
  type: PropertyType,
  intent: PropertyIntent
): FieldConfig {
  const isRent = intent === 'rent'

  const base: FieldConfig = {
    show_price: true,
    price_label: isRent ? 'Monthly rent (€)' : 'Asking price (€)',
    show_size: true,
    show_rooms: true,
    show_bathrooms: true,
    show_floor: false,
    show_total_floors: false,
    show_year_built: true,
    show_condition: true,
    show_plot_size: false,
    show_zoning: false,
    show_commercial_type: false,
    show_furnished: false,
    show_features: true,
    available_features: ALL_FEATURES,
    min_photos: 3,
    max_photos: 30,
    show_floor_plan: false,
    show_cadastral_docs: !isRent,
    show_title_deed: !isRent,
    show_energy_cert: false,
    show_rental_history: isRent,
    show_tenancy_agreement: false,
    show_sales_letter: !isRent,
    show_rental_pitch: isRent,
    package_languages: 3,
  }

  // Merge type-specific config
  const typeConfig = BASE[type] ?? {}
  const merged = { ...base, ...typeConfig }

  // Intent overrides
  if (isRent) {
    merged.show_cadastral_docs = false
    merged.show_title_deed = false
    merged.show_rental_history = true
    merged.show_furnished = type === 'apartment' || type === 'villa'
    merged.show_tenancy_agreement = false
    merged.price_label = 'Monthly rent (€)'
  }

  return merged
}

// ─── Step label builder ────────────────────────────────────────────────────────

export function getWizardSteps(intent: PropertyIntent) {
  return [
    { id: 0, label: 'Goal', key: 'step_intent' },
    { id: 1, label: 'Basics', key: 'step_basics' },
    { id: 2, label: 'Details', key: 'step_details' },
    { id: 3, label: intent === 'sell' ? 'Photos & Docs' : 'Photos', key: 'step_media' },
    { id: 4, label: 'AI Package', key: 'step_package' },
    { id: 5, label: 'Preview', key: 'step_preview' },
    { id: 6, label: 'Activate', key: 'step_payment' },
  ]
}

// ─── Validation per type ───────────────────────────────────────────────────────

export function validateStep2(data: any, config: FieldConfig): string[] {
  const errors: string[] = []
  if (!data.price_eur || data.price_eur <= 0) errors.push('Price is required')
  if (config.show_size && (!data.size_m2 || data.size_m2 <= 0)) errors.push('Size is required')
  if (!data.country) errors.push('Country is required')
  if (!data.city) errors.push('City is required')
  return errors
}

export function validateStep4(photos: File[], config: FieldConfig): string[] {
  const errors: string[] = []
  if (photos.length < config.min_photos) {
    errors.push(`At least ${config.min_photos} photos required (you have ${photos.length})`)
  }
  return errors
}
