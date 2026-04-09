'use client';

import React, { useEffect, useCallback } from 'react';
import { WizardProgress } from './WizardProgress';
import { useWizardStore, WizardStep } from '@/store/wizard';
import clsx from 'clsx';

const STEPS = [
  { id: 'basics', label: 'Location' },
  { id: 'pricing', label: 'Price' },
  { id: 'description', label: 'Details' },
  { id: 'media', label: 'Photos' },
  { id: 'documents', label: 'Docs' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'preview', label: 'Publish' },
];

interface WizardShellProps {
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  canGoNext?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

export function WizardShell({
  children,
  onNext,
  onBack,
  canGoNext = true,
  isLastStep = false,
  isSubmitting = false,
}: WizardShellProps) {
  const { currentStep, saveStatus, lastSavedAt, autosave } = useWizardStore();

  // Autosave every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      autosave();
    }, 30_000);
    return () => clearInterval(interval);
  }, [autosave]);

  const formatSaved = useCallback(() => {
    if (!lastSavedAt) return '';
    const diff = Math.round((Date.now() - new Date(lastSavedAt).getTime()) / 1000);
    if (diff < 5) return 'Just saved';
    if (diff < 60) return `Saved ${diff}s ago`;
    return `Saved ${Math.round(diff / 60)}m ago`;
  }, [lastSavedAt]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>Add Property</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Save status */}
              <span className={clsx(
                'text-xs flex items-center gap-1 transition-all',
                saveStatus === 'saving' && 'text-orange-500',
                saveStatus === 'saved' && 'text-green-600',
                saveStatus === 'error' && 'text-red-500',
                saveStatus === 'idle' && 'text-gray-400',
              )} style={{
                color: saveStatus === 'saving' ? 'var(--primary)' : saveStatus === 'saved' ? 'var(--green)' : saveStatus === 'error' ? 'var(--red)' : 'var(--text-tertiary)',
              }}>
                {saveStatus === 'saving' && (
                  <><span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: 'var(--primary)' }} /> Saving…</>
                )}
                {saveStatus === 'saved' && (
                  <><span>✓</span> {formatSaved()}</>
                )}
                {saveStatus === 'error' && '⚠ Not saved'}
                {saveStatus === 'idle' && 'Draft'}
              </span>
            </div>
          </div>
          <WizardProgress steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-2xl shadow-sm p-6 md:p-8">
          {children}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onBack}
            disabled={currentStep === 0}
            className={clsx(
              'px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
              currentStep === 0
                ? 'cursor-not-allowed'
                : 'hover:bg-gray-100'
            )}
            style={{
              color: currentStep === 0 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            }}
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={autosave}
              className="text-xs transition-colors"
              style={{
                color: 'var(--text-tertiary)',
              }}
            >
              Save draft
            </button>
            <button
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
              style={{
                background: (canGoNext && !isSubmitting) ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'var(--surface-2)',
                color: (canGoNext && !isSubmitting) ? 'white' : 'var(--text-tertiary)',
                cursor: (!canGoNext || isSubmitting) ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting
                ? 'Publishing…'
                : isLastStep
                ? 'Publish & Activate →'
                : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
