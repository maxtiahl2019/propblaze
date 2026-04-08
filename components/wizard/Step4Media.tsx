'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useWizardStore, UploadedMedia } from '@/store/wizard';
import api from '@/lib/api';
import clsx from 'clsx';

const MAX_PHOTOS = 30;
const MIN_PHOTOS = 5;

export function Step4Media() {
  const { step4, updateStep4, propertyId } = useWizardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const uploadFile = async (file: File, tempId: string) => {
    // Mark as uploading
    updateStep4({
      mediaFiles: useWizardStore.getState().step4.mediaFiles.map((m) =>
        m.tempId === tempId ? { ...m, status: 'uploading' } : m
      ),
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('media_type', 'photo');
      if (propertyId) formData.append('property_id', propertyId);

      const res = await api.post('/properties/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateStep4({
        mediaFiles: useWizardStore.getState().step4.mediaFiles.map((m) =>
          m.tempId === tempId
            ? { ...m, id: res.data.id, url: res.data.url, s3_key: res.data.s3_key, status: 'done' }
            : m
        ),
      });
    } catch {
      // Use local object URL as fallback
      const url = URL.createObjectURL(file);
      updateStep4({
        mediaFiles: useWizardStore.getState().step4.mediaFiles.map((m) =>
          m.tempId === tempId ? { ...m, url, status: 'done' } : m
        ),
      });
    }
  };

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const current = useWizardStore.getState().step4.mediaFiles;
      const remaining = MAX_PHOTOS - current.length;
      const toAdd = Array.from(files).slice(0, remaining).filter((f) =>
        f.type.startsWith('image/')
      );

      const newMedia: UploadedMedia[] = toAdd.map((file, i) => ({
        tempId: `tmp-${Date.now()}-${i}`,
        file,
        url: URL.createObjectURL(file),
        is_cover: current.length === 0 && i === 0,
        sort_order: current.length + i,
        status: 'pending',
      }));

      updateStep4({ mediaFiles: [...current, ...newMedia] });

      for (const m of newMedia) {
        if (m.file) await uploadFile(m.file, m.tempId);
      }
    },
    [propertyId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const setCover = (tempId: string) => {
    updateStep4({
      mediaFiles: step4.mediaFiles.map((m) => ({
        ...m,
        is_cover: m.tempId === tempId,
      })),
    });
  };

  const removeMedia = (tempId: string) => {
    const updated = step4.mediaFiles
      .filter((m) => m.tempId !== tempId)
      .map((m, i) => ({ ...m, sort_order: i }));
    // If removed was cover, set first as cover
    if (updated.length > 0 && !updated.some((m) => m.is_cover)) {
      updated[0].is_cover = true;
    }
    updateStep4({ mediaFiles: updated });
  };

  const moveMedia = (tempId: string, direction: 'left' | 'right') => {
    const files = [...step4.mediaFiles];
    const idx = files.findIndex((m) => m.tempId === tempId);
    if (direction === 'left' && idx > 0) {
      [files[idx - 1], files[idx]] = [files[idx], files[idx - 1]];
    } else if (direction === 'right' && idx < files.length - 1) {
      [files[idx], files[idx + 1]] = [files[idx + 1], files[idx]];
    }
    updateStep4({ mediaFiles: files.map((m, i) => ({ ...m, sort_order: i })) });
  };

  const count = step4.mediaFiles.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Photos & media</h2>
        <p className="text-gray-500 mt-1">
          Add at least {MIN_PHOTOS} photos · Max {MAX_PHOTOS} · First photo = cover image
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          dragging
            ? 'border-blue-500 bg-blue-50'
            : count >= MAX_PHOTOS
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          disabled={count >= MAX_PHOTOS}
        />
        <div className="text-4xl mb-2">📸</div>
        {count >= MAX_PHOTOS ? (
          <p className="text-sm text-gray-400">Maximum {MAX_PHOTOS} photos reached</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              Drag & drop photos here, or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Auto-optimized · {count}/{MAX_PHOTOS} added</p>
          </>
        )}
      </div>

      {/* Progress indicator */}
      {count > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all',
                count >= MIN_PHOTOS ? 'bg-green-500' : 'bg-orange-400'
              )}
              style={{ width: `${Math.min((count / MIN_PHOTOS) * 100, 100)}%` }}
            />
          </div>
          <span className={clsx(
            'text-xs font-medium',
            count >= MIN_PHOTOS ? 'text-green-600' : 'text-orange-500'
          )}>
            {count >= MIN_PHOTOS ? `✓ ${count} photos` : `${count}/${MIN_PHOTOS} minimum`}
          </span>
        </div>
      )}

      {/* Photo grid */}
      {step4.mediaFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {step4.mediaFiles.map((media, idx) => (
            <div
              key={media.tempId}
              className={clsx(
                'relative rounded-xl overflow-hidden group aspect-square bg-gray-100',
                media.is_cover && 'ring-2 ring-blue-600 ring-offset-1'
              )}
            >
              {media.url && (
                <img
                  src={media.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}

              {/* Uploading overlay */}
              {media.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Cover badge */}
              {media.is_cover && (
                <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Cover
                </div>
              )}

              {/* Controls - show on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 gap-1">
                {!media.is_cover && (
                  <button
                    type="button"
                    onClick={() => setCover(media.tempId)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                    title="Set as cover"
                  >
                    Cover
                  </button>
                )}
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveMedia(media.tempId, 'left')}
                    className="text-xs bg-white/20 text-white px-2 py-1 rounded"
                  >
                    ←
                  </button>
                )}
                {idx < step4.mediaFiles.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveMedia(media.tempId, 'right')}
                    className="text-xs bg-white/20 text-white px-2 py-1 rounded"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(media.tempId)}
                  className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video link */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Video tour link <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="url"
          value={step4.video_url}
          onChange={(e) => updateStep4({ video_url: e.target.value })}
          placeholder="https://youtube.com/... or Vimeo link"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
