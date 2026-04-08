'use client';

import React, { useState } from 'react';
import { useWizardStore } from '@/store/wizard';
import api from '@/lib/api';
import clsx from 'clsx';

const PROXIMITY_TAGS = [
  { value: 'sea', label: '🌊 Sea' },
  { value: 'city_center', label: '🏙 City center' },
  { value: 'school', label: '🏫 School' },
  { value: 'airport', label: '✈️ Airport' },
  { value: 'transport', label: '🚇 Transport' },
  { value: 'view', label: '🌄 Great view' },
  { value: 'pool', label: '🏊 Pool' },
  { value: 'parking', label: '🅿️ Parking' },
  { value: 'new_build', label: '🏗 New build' },
  { value: 'renovated', label: '✨ Renovated' },
  { value: 'garden', label: '🌱 Garden' },
  { value: 'terrace', label: '🏖 Terrace' },
  { value: 'elevator', label: '🛗 Elevator' },
  { value: 'quiet_area', label: '🔇 Quiet area' },
  { value: 'gated', label: '🔒 Gated' },
];

export function Step3Description() {
  const { step3, updateStep3 } = useWizardStore();
  const [enhancing, setEnhancing] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [showEnhanced, setShowEnhanced] = useState(!!step3.description_enhanced);

  const handleEnhance = async () => {
    if (!step3.description_raw.trim()) return;
    setEnhancing(true);
    try {
      const res = await api.post('/ai/enhance-description', {
        text: step3.description_raw,
        language: 'en',
      });
      updateStep3({ description_enhanced: res.data.enhanced });
      setShowEnhanced(true);
    } catch {
      // fallback: show placeholder enhanced version
      const enhanced = step3.description_raw + '\n\n[Enhanced by AI: detailed description would appear here]';
      updateStep3({ description_enhanced: enhanced });
      setShowEnhanced(true);
    } finally {
      setEnhancing(false);
    }
  };

  const toggleTag = (value: string) => {
    const current = step3.proximity_tags;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateStep3({ proximity_tags: next });
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    updateStep3({ features: [...step3.features, featureInput.trim()] });
    setFeatureInput('');
  };

  const removeFeature = (i: number) => {
    updateStep3({ features: step3.features.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Describe your property</h2>
        <p className="text-gray-500 mt-1">This text will be used in your sales pack and agency outreach</p>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">Property description *</label>
          <span className="text-xs text-gray-400">{step3.description_raw.length} chars</span>
        </div>
        <textarea
          value={step3.description_raw}
          onChange={(e) => updateStep3({ description_raw: e.target.value })}
          placeholder="Describe your property: location highlights, condition, renovation history, unique features, views, neighborhood vibe..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        {/* AI Enhance */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleEnhance}
            disabled={enhancing || !step3.description_raw.trim()}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              step3.description_raw.trim() && !enhancing
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <span>{enhancing ? '⏳' : '✨'}</span>
            {enhancing ? 'Enhancing with AI…' : 'Enhance with AI'}
          </button>
          <span className="text-xs text-gray-400">Rewrites in professional tone, 3 languages</span>
        </div>

        {/* Enhanced preview */}
        {showEnhanced && step3.description_enhanced && (
          <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                ✨ AI-enhanced version
              </span>
              <button
                type="button"
                onClick={() => setShowEnhanced(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Hide
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {step3.description_enhanced}
            </p>
            <button
              type="button"
              onClick={() => {
                updateStep3({ description_raw: step3.description_enhanced, description_enhanced: '' });
                setShowEnhanced(false);
              }}
              className="mt-3 text-xs font-medium text-purple-700 hover:text-purple-900"
            >
              Use this version →
            </button>
          </div>
        )}
      </div>

      {/* Proximity tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Proximity & highlights <span className="font-normal text-gray-400">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PROXIMITY_TAGS.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                step3.proximity_tags.includes(tag.value)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key features */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Key selling points</label>
        <p className="text-xs text-gray-400 mb-3">Add unique features that make your property stand out</p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            placeholder="e.g. Private rooftop terrace with sea view"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {step3.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {step3.features.map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700"
              >
                {f}
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="text-gray-400 hover:text-red-500 ml-1 text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Legal notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Legal status notes <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={step3.legal_status_notes}
          onChange={(e) => updateStep3({ legal_status_notes: e.target.value })}
          placeholder="e.g. Clear title, no encumbrances, EU citizen can purchase..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}
