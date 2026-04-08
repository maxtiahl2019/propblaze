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
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="font-semibold text-gray-900">Add Property</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Save status */}
              <span className={clsx(
                'text-xs flex items-center gap-1 transition-all',
                saveStatus === 'saving' && 'text-blue-500',
                saveStatus === 'saved' && 'text-green-600',
                saveStatus === 'error' && 'text-red-500',
                saveStatus === 'idle' && 'text-gray-400',
              )}>
                {saveStatus === 'saving' && (
                  <><span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse inline-block" /> Saving…</>
                )}
                {saveStatus === 'saved' && (
                  <><span className="text-green-600">✓</span> {formatSaved()}</>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
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
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={autosave}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Save draft
            </button>
            <button
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              className={clsx(
                'px-6 py-2.5 rounded-xl font-medium text-sm transition-all',
                canGoNext && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
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
