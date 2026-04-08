export interface User {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'superadmin';
  status: 'active' | 'inactive' | 'suspended';
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  whatsapp_number: string;
  telegram_username: string;
  country_of_residence: string;
  preferred_language: string;
  preferred_contact_hours: string;
}

export interface Property {
  id: string;
  user_id: string;
  status: PropertyStatus;
  property_type: PropertyType;
  seller_type: string;
  country: string;
  region: string;
  city: string;
  address: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  year_built: number;
  area_sqm: number;
  lot_size_sqm: number;
  bedrooms: number;
  bathrooms: number;
  condition: string;
  furnished_status: string;
  asking_price: number;
  currency: string;
  negotiable: boolean;
  exclusive_agreement: boolean;
  remote_viewing: boolean;
  target_buyer_type: string;
  target_buyer_types?: string[];
  target_languages?: string[];
  description?: string;
  description_raw: string;
  listing_mode: string;
  sold_at: string | null;
  sold_price: number | null;
  created_at: string;
  updated_at: string;
}

export type PropertyStatus =
  | 'draft'
  | 'onboarding'
  | 'awaiting_review'
  | 'reviewing'
  | 'approved'
  | 'packaging'
  | 'matching'
  | 'pending_verification'
  | 'ready_for_payment'
  | 'offer_preparation'
  | 'awaiting_approval'
  | 'ready_for_distribution'
  | 'active'
  | 'in_distribution'
  | 'distributing'
  | 'distributed'
  | 'paused'
  | 'completed'
  | 'sold'
  | 'archived';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'commercial'
  | 'land'
  | 'villa'
  | 'townhouse'
  | 'studio';

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: 'photo' | 'video' | 'floor_plan' | 'drone';
  s3_key: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
}

export interface Agency {
  id: string;
  name: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  whatsapp_available: boolean;
  telegram_available: boolean;
  contact_policy: string;
  quality_score: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
}

export interface MatchScore {
  id: string;
  property_id: string;
  agency_id: string;
  agency_name?: string;
  total_score: number;
  rule_score: number;
  llm_boost: number;
  wave_number: number;
  explanation?: string;
  explanation_json?: Record<string, any>;
  dimension_scores?: Record<string, number>;
}

export interface OfferDraft {
  id: string;
  property_id: string;
  sales_pack_id: string;
  subject_line: string;
  short_pitch: string;
  full_pitch: string;
  selected_media_ids: string[];
  primary_language: 'en' | 'ru' | 'sr';
  status: 'draft' | 'ready_for_review' | 'pending_approval' | 'approved' | 'rejected';
  version: number;
}

export interface DistributionCampaign {
  id: string;
  property_id: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';
  total_agencies: number;
  waves_planned: number;
  started_at: string | null;
  completed_at: string | null;
  total_sent?: number;
  total_delivered?: number;
  total_opened?: number;
  total_replied?: number;
  waves?: DistributionWave[];
}

export interface DistributionWave {
  id: string;
  campaign_id: string;
  property_id?: string;
  wave_number: number;
  status: 'pending' | 'scheduled' | 'active' | 'sent' | 'completed';
  agencies_count?: number;
  agency_count?: number;
  reply_count?: number;
  scheduled_at: string | null;
  sent_at: string | null;
}

export interface DeliveryAttempt {
  id: string;
  wave_id: string;
  agency_id: string;
  channel: 'email' | 'whatsapp' | 'telegram';
  status: 'pending' | 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed';
  opened: boolean;
  clicked: boolean;
  sent_at: string | null;
}

export interface Lead {
  id: string;
  property_id: string;
  agency_id: string;
  agency_name?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  channel?: 'email' | 'whatsapp' | 'telegram';
  reply_channel?: 'email' | 'whatsapp' | 'telegram';
  lead_type?: string;
  status: 'new' | 'interested' | 'follow_up' | 'no_response' | 'not_fit';
  summary?: string;
  raw_message?: string;
  notes: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  interval?: string;
  status: string;
  billing_status?: 'active' | 'past_due' | 'canceled' | 'paused' | 'trial';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  trial_end: string | null;
  canceled_at: string | null;
  // Usage stats
  active_listings?: number;
  listing_limit?: number;
  matches_used?: number;
  matches_limit?: number;
  distributions_sent?: number;
  distributions_limit?: number;
}

export interface Notification {
  id: string;
  type: 'new_lead' | 'inbound_message' | 'campaign_update';
  property_id: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}
