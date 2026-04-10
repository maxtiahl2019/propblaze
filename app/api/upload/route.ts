/**
 * POST /api/upload
 *
 * Handles file uploads to Supabase Storage.
 * Accepts multipart/form-data with:
 *   file    — the file to upload
 *   bucket  — storage bucket: "property-photos" | "property-docs"
 *   path?   — optional sub-path prefix (e.g. property id)
 *
 * Returns: { success, url, path }
 */

import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const ALLOWED_BUCKETS = ['property-photos', 'property-docs', 'avatars']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  try {
    // Demo mode — no Supabase configured
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.log('[upload] DEMO MODE — Supabase not configured')
      // Return a plausible fake URL for demo
      const fakeId = Math.random().toString(36).slice(2, 10)
      return NextResponse.json({
        success: true,
        demo: true,
        url: `https://placeholder.propblaze.com/uploads/${fakeId}`,
        path: `demo/${fakeId}`,
        message: 'Demo mode: file not stored. Add SUPABASE_* env vars to enable uploads.',
      })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) || 'property-photos'
    const pathPrefix = (formData.get('path') as string) || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: `Invalid bucket. Allowed: ${ALLOWED_BUCKETS.join(', ')}` }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB` }, { status: 400 })
    }

    // Build storage path
    const ext = file.name.split('.').pop() || 'bin'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const storagePath = pathPrefix ? `${pathPrefix}/${uniqueName}` : uniqueName

    // Upload via Supabase Storage REST API (no SDK dependency)
    const arrayBuffer = await file.arrayBuffer()
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${storagePath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: arrayBuffer,
      }
    )

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({ message: 'Upload failed' }))
      console.error('[upload] Supabase error:', err)
      return NextResponse.json({ error: err.message || 'Upload failed' }, { status: uploadRes.status })
    }

    // Build public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath,
      bucket,
      size: file.size,
      type: file.type,
    })
  } catch (err: any) {
    console.error('[upload] Exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Max body size for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}
