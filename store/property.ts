import { create } from 'zustand';
import api from '@/lib/api';
import { Property } from '@/lib/types';

interface PropertyStore {
  currentProperty: Property | null;
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  setCurrentProperty: (property: Property | null) => void;
  fetchProperties: () => Promise<void>;
  fetchProperty: (id: string) => Promise<void>;
  createProperty: (data: Partial<Property>) => Promise<Property>;
  updateProperty: (id: string, data: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProperty = create<PropertyStore>((set) => ({
  currentProperty: null,
  properties: [],
  isLoading: false,
  error: null,

  setCurrentProperty: (property) => {
    set({ currentProperty: property });
  },

  fetchProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/properties', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ properties: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch properties';
      set({ error: message, isLoading: false });
    }
  },

  fetchProperty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get(`/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ currentProperty: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch property';
      set({ error: message, isLoading: false });
    }
  },

  createProperty: async (data: Partial<Property>) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.post('/properties', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        properties: [...state.properties, response.data],
        currentProperty: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create property';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateProperty: async (id: string, data: Partial<Property>) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.patch(`/properties/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        properties: state.properties.map((p) =>
          p.id === id ? response.data : p
        ),
        currentProperty: state.currentProperty?.id === id ? response.data : state.currentProperty,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update property';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteProperty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id),
        currentProperty: state.currentProperty?.id === id ? null : state.currentProperty,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to delete property';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
