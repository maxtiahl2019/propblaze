import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Step1Data {
  property_type: string;
  seller_type: string;
  country: string;
  region: string;
  city: string;
  address: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  year_built: number | null;
  area_sqm: number | null;
  lot_size_sqm: number | null;
  floor: number | null;
  total_floors: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  condition: string;
  furnished_status: string;
}

export interface Step2Data {
  asking_price: number | null;
  currency: string;
  negotiable: boolean;
  exclusive_agreement: string; // 'yes' | 'no' | 'maybe'
  remote_viewing: boolean;
  target_buyer_types: string[];
}

export interface Step3Data {
  description_raw: string;
  description_enhanced: string;
  features: string[];
  proximity_tags: string[];
  legal_status_notes: string;
}

export interface Step4Data {
  mediaFiles: UploadedMedia[];
  video_url: string;
}

export interface UploadedMedia {
  id?: string;
  tempId: string;
  file?: File;
  url?: string;
  s3_key?: string;
  is_cover: boolean;
  sort_order: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export interface Step5Data {
  documents: UploadedDocument[];
  verification_consent: boolean;
}

export interface UploadedDocument {
  id?: string;
  tempId: string;
  file?: File;
  url?: string;
  doc_type: 'title_deed' | 'cadastral' | 'id_passport' | 'other';
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export interface Step6Data {
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  whatsapp_number: string;
  telegram_username: string;
  preferred_channels: string[];
  preferred_languages: string[];
  preferred_hours: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface WizardState {
  currentStep: WizardStep;
  propertyId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;

  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;

  setStep: (step: WizardStep) => void;
  setPropertyId: (id: string) => void;
  updateStep1: (data: Partial<Step1Data>) => void;
  updateStep2: (data: Partial<Step2Data>) => void;
  updateStep3: (data: Partial<Step3Data>) => void;
  updateStep4: (data: Partial<Step4Data>) => void;
  updateStep5: (data: Partial<Step5Data>) => void;
  updateStep6: (data: Partial<Step6Data>) => void;
  setSaveStatus: (status: SaveStatus) => void;
  resetWizard: () => void;
  autosave: () => Promise<void>;
  prefillContactsFromProfile: (profile: {
    full_name: string;
    phone: string;
    email: string;
    whatsapp_number: string;
    telegram_username: string;
    preferred_language: string;
  }) => void;
}

const defaultStep1: Step1Data = {
  property_type: '',
  seller_type: 'owner',
  country: '',
  region: '',
  city: '',
  address: '',
  postal_code: '',
  latitude: null,
  longitude: null,
  year_built: null,
  area_sqm: null,
  lot_size_sqm: null,
  floor: null,
  total_floors: null,
  bedrooms: null,
  bathrooms: null,
  condition: '',
  furnished_status: 'unfurnished',
};

const defaultStep2: Step2Data = {
  asking_price: null,
  currency: 'EUR',
  negotiable: false,
  exclusive_agreement: 'maybe',
  remote_viewing: true,
  target_buyer_types: [],
};

const defaultStep3: Step3Data = {
  description_raw: '',
  description_enhanced: '',
  features: [],
  proximity_tags: [],
  legal_status_notes: '',
};

const defaultStep4: Step4Data = {
  mediaFiles: [],
  video_url: '',
};

const defaultStep5: Step5Data = {
  documents: [],
  verification_consent: false,
};

const defaultStep6: Step6Data = {
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  whatsapp_number: '',
  telegram_username: '',
  preferred_channels: ['email'],
  preferred_languages: ['en'],
  preferred_hours: '',
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      propertyId: null,
      saveStatus: 'idle',
      lastSavedAt: null,

      step1: defaultStep1,
      step2: defaultStep2,
      step3: defaultStep3,
      step4: defaultStep4,
      step5: defaultStep5,
      step6: defaultStep6,

      setStep: (step) => set({ currentStep: step }),
      setPropertyId: (id) => set({ propertyId: id }),
      setSaveStatus: (status) => set({ saveStatus: status }),

      updateStep1: (data) =>
        set((s) => ({ step1: { ...s.step1, ...data } })),
      updateStep2: (data) =>
        set((s) => ({ step2: { ...s.step2, ...data } })),
      updateStep3: (data) =>
        set((s) => ({ step3: { ...s.step3, ...data } })),
      updateStep4: (data) =>
        set((s) => ({ step4: { ...s.step4, ...data } })),
      updateStep5: (data) =>
        set((s) => ({ step5: { ...s.step5, ...data } })),
      updateStep6: (data) =>
        set((s) => ({ step6: { ...s.step6, ...data } })),

      prefillContactsFromProfile: (profile) => {
        set((s) => ({
          step6: {
            ...s.step6,
            contact_name: profile.full_name || s.step6.contact_name,
            contact_phone: profile.phone || s.step6.contact_phone,
            contact_email: profile.email || s.step6.contact_email,
            whatsapp_number: profile.whatsapp_number || s.step6.whatsapp_number,
            telegram_username: profile.telegram_username || s.step6.telegram_username,
            preferred_languages: profile.preferred_language
              ? [profile.preferred_language]
              : s.step6.preferred_languages,
          },
        }));
      },

      autosave: async () => {
        const { propertyId, step1, step2, step3, step6, saveStatus } = get();
        if (saveStatus === 'saving') return;

        // ── DEMO MODE: skip all API calls, just mark as saved ────────────────
        if (DEMO_MODE) {
          set({ saveStatus: 'saving' });
          await new Promise(r => setTimeout(r, 400)); // simulate save
          if (!propertyId) set({ propertyId: 'demo-new-prop-' + Date.now() });
          set({ saveStatus: 'saved', lastSavedAt: new Date() });
          return;
        }

        set({ saveStatus: 'saving' });
        try {
          const payload = {
            property_type: step1.property_type || undefined,
            seller_type: step1.seller_type || undefined,
            country: step1.country || undefined,
            region: step1.region || undefined,
            city: step1.city || undefined,
            address: step1.address || undefined,
            postal_code: step1.postal_code || undefined,
            latitude: step1.latitude ?? undefined,
            longitude: step1.longitude ?? undefined,
            year_built: step1.year_built ?? undefined,
            area_sqm: step1.area_sqm ?? undefined,
            lot_size_sqm: step1.lot_size_sqm ?? undefined,
            bedrooms: step1.bedrooms ?? undefined,
            bathrooms: step1.bathrooms ?? undefined,
            condition: step1.condition || undefined,
            furnished_status: step1.furnished_status || undefined,
            asking_price: step2.asking_price ?? undefined,
            currency: step2.currency || undefined,
            negotiable: step2.negotiable,
            exclusive_agreement: step2.exclusive_agreement !== 'maybe'
              ? step2.exclusive_agreement === 'yes'
              : undefined,
            remote_viewing: step2.remote_viewing,
            target_buyer_types: step2.target_buyer_types,
            description_raw: step3.description_raw || undefined,
            features: step3.features,
            proximity_tags: step3.proximity_tags,
          };

          if (propertyId) {
            await api.patch(`/properties/${propertyId}`, payload);
          } else {
            const res = await api.post('/properties', payload);
            set({ propertyId: res.data.id });
          }

          set({ saveStatus: 'saved', lastSavedAt: new Date() });
        } catch {
          set({ saveStatus: 'error' });
        }
      },

      resetWizard: () =>
        set({
          currentStep: 0,
          propertyId: null,
          saveStatus: 'idle',
          lastSavedAt: null,
          step1: defaultStep1,
          step2: defaultStep2,
          step3: defaultStep3,
          step4: defaultStep4,
          step5: defaultStep5,
          step6: defaultStep6,
        }),
    }),
    {
      name: 'propseller-wizard',
      partialize: (state) => ({
        currentStep: state.currentStep,
        propertyId: state.propertyId,
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        step6: state.step6,
      }),
    }
  )
);
