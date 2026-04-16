/**
 * Shared in-memory stores across /api/* routes.
 * All route files should import from here to avoid TS global redeclaration conflicts.
 */

export type OfferStatus =
  | 'new' | 'accepted' | 'in_progress' | 'pending_docs' | 'closed' | 'declined'

export interface DocItem {
  id: string
  name: string
  requestedAt: string
  receivedAt?: string
  url?: string
}

export interface Offer {
  id: string
  ref: string
  receivedAt: string
  property: {
    type: string; address: string; city: string; country: string; flag: string
    sqm: number; beds: number; price: number; currency: string
    description: string; photos: number; photoUrls?: string[]
  }
  seller: { name: string; lang: string; respondsIn: string; email?: string }
  match: { score: number; wave: 1 | 2 | 3; reasons: string[] }
  status: OfferStatus
  statusHistory: { at: string; status: OfferStatus; note?: string }[]
  docs: DocItem[]
}

export interface FeedbackEvent {
  at: string
  offerId: string
  ref: string
  event: 'routed' | 'accepted' | 'declined' | 'in_progress' | 'pending_docs' | 'closed' | 'docs_requested' | 'docs_received' | 'new'
  score?: number
  city?: string
  country?: string
  note?: string
}

export interface Msg {
  id: string
  offerId: string
  from: 'agency' | 'owner' | 'seller'
  text: string
  at: string
}

export interface StoredUser {
  id: string
  email: string
  passwordHash: string
  full_name: string
  role: 'owner' | 'agency' | 'staff'
  status: 'active'
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __PB_OFFERS__: Offer[] | undefined
  // eslint-disable-next-line no-var
  var __PB_FEEDBACK__: FeedbackEvent[] | undefined
  // eslint-disable-next-line no-var
  var __PB_MSGS__: Record<string, Msg[]> | undefined
  // eslint-disable-next-line no-var
  var __PB_USERS__: StoredUser[] | undefined
  // eslint-disable-next-line no-var
  var __PB_TOKENS__: Record<string, string> | undefined
}

export function offersStore(): Offer[] {
  if (!global.__PB_OFFERS__) global.__PB_OFFERS__ = []
  return global.__PB_OFFERS__
}

export function feedbackStore(): FeedbackEvent[] {
  if (!global.__PB_FEEDBACK__) global.__PB_FEEDBACK__ = []
  return global.__PB_FEEDBACK__
}

export function msgsStore(): Record<string, Msg[]> {
  if (!global.__PB_MSGS__) global.__PB_MSGS__ = {}
  return global.__PB_MSGS__
}

export function usersStore(): StoredUser[] {
  if (!global.__PB_USERS__) global.__PB_USERS__ = []
  return global.__PB_USERS__
}

export function tokensStore(): Record<string, string> {
  if (!global.__PB_TOKENS__) global.__PB_TOKENS__ = {}
  return global.__PB_TOKENS__
}

export function logFeedback(ev: FeedbackEvent) {
  const fb = feedbackStore()
  fb.unshift(ev)
  if (fb.length > 500) fb.length = 500
}
