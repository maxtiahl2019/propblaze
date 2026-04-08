'use client';

import React, { useRef } from 'react';
import { useWizardStore, UploadedDocument } from '@/store/wizard';
import api from '@/lib/api';
import clsx from 'clsx';

const DOC_TYPES = [
  {
    value: 'title_deed',
    label: 'Title deed',
    desc: 'Proof of ownership document',
    icon: '📋',
    required: true,
  },
  {
    value: 'cadastral',
    label: 'Cadastral extract',
    desc: 'Property registration document',
    icon: '🗺',
    required: false,
  },
  {
    value: 'id_passport',
    label: 'ID / Passport',
    desc: 'Identity verification (protected)',
    icon: '🪪',
    required: false,
    sensitive: true,
  },
  {
    value: 'other',
    label: 'Other documents',
    desc: 'Plans, permits, energy certificate',
    icon: '📁',
    required: false,
  },
];

export function Step5Documents() {
  const { step5, updateStep5, propertyId } = useWizardStore();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const uploadDoc = async (file: File, tempId: string) => {
    updateStep5({
      documents: useWizardStore.getState().step5.documents.map((d) =>
        d.tempId === tempId ? { ...d, status: 'uploading' } : d
      ),
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', useWizardStore.getState().step5.documents.find(d => d.tempId === tempId)?.doc_type || 'other');
      if (propertyId) formData.append('property_id', propertyId);

      const res = await api.post('/properties/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateStep5({
        documents: useWizardStore.getState().step5.documents.map((d) =>
          d.tempId === tempId
            ? { ...d, id: res.data.id, url: res.data.url, status: 'done' }
            : d
        ),
      });
    } catch {
      updateStep5({
        documents: useWizardStore.getState().step5.documents.map((d) =>
          d.tempId === tempId ? { ...d, status: 'done', url: 'local://' + file.name } : d
        ),
      });
    }
  };

  const handleFileSelect = async (docType: string, files: FileList | null) => {
    if (!files?.length) return;

    const newDocs: UploadedDocument[] = Array.from(files).map((file, i) => ({
      tempId: `doc-${Date.now()}-${i}`,
      file,
      doc_type: docType as UploadedDocument['doc_type'],
      status: 'pending' as const,
    }));

    const current = useWizardStore.getState().step5.documents;
    updateStep5({ documents: [...current, ...newDocs] });

    for (const doc of newDocs) {
      if (doc.file) await uploadDoc(doc.file, doc.tempId);
    }
  };

  const removeDoc = (tempId: string) => {
    updateStep5({
      documents: step5.documents.filter((d) => d.tempId !== tempId),
    });
  };

  const getDocsOfType = (type: string) =>
    step5.documents.filter((d) => d.doc_type === type);

  const hasTitleDeed = getDocsOfType('title_deed').length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Documents & verification</h2>
        <p className="text-gray-500 mt-1">
          Upload ownership documents to get a Verified badge — agencies trust verified listings more
        </p>
      </div>

      {/* Trust badge preview */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
        <div className="text-3xl">🛡</div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Verified listing badge</p>
          <p className="text-xs text-gray-500">Agencies respond 3× more to verified listings. Documents are encrypted and never shared without consent.</p>
        </div>
      </div>

      {/* Document upload zones */}
      <div className="space-y-4">
        {DOC_TYPES.map((docType) => {
          const docs = getDocsOfType(docType.value);
          return (
            <div
              key={docType.value}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{docType.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{docType.label}</p>
                      {docType.required && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Recommended</span>
                      )}
                      {docType.sensitive && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          🔒 Encrypted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{docType.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {docs.length > 0 && (
                    <span className="text-xs text-green-600 font-medium">✓ {docs.length} file{docs.length > 1 ? 's' : ''}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => inputRefs.current[docType.value]?.click()}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    + Upload
                  </button>
                  <input
                    ref={(el) => { inputRefs.current[docType.value] = el; }}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileSelect(docType.value, e.target.files)}
                  />
                </div>
              </div>

              {/* Uploaded files */}
              {docs.length > 0 && (
                <div className="p-3 space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.tempId}
                      className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100"
                    >
                      <span className="text-lg">
                        {doc.status === 'uploading' ? '⏳' : doc.status === 'done' ? '✅' : '📄'}
                      </span>
                      <span className="text-xs text-gray-700 flex-1 truncate">
                        {doc.file?.name || doc.url?.split('/').pop() || 'Document'}
                      </span>
                      {doc.status === 'uploading' && (
                        <span className="text-xs text-blue-500">Uploading…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeDoc(doc.tempId)}
                        className="text-gray-300 hover:text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Consent */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={step5.verification_consent}
            onChange={(e) => updateStep5({ verification_consent: e.target.checked })}
            className="w-4 h-4 accent-blue-600 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-gray-700">
            I consent to PropSeller AI processing my documents for property verification purposes.
            Documents are encrypted at rest and will not be shared with third parties without my
            explicit approval. I can withdraw consent at any time.
          </span>
        </label>
      </div>

      {/* Skip note */}
      {!hasTitleDeed && (
        <p className="text-xs text-gray-400 text-center">
          You can skip this step and add documents later from your property dashboard
        </p>
      )}
    </div>
  );
}
