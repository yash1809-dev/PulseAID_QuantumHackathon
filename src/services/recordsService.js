/**
 * recordsService.js — Supabase CRUD for medical records + file storage.
 *
 * Table: medical_records
 * Bucket: medical-records (public)
 *
 * All functions are safe to call — they return { data, error } tuples.
 * Components should check error before using data.
 */

import { supabase } from '../lib/supabase';

const TABLE  = 'medical_records';
const BUCKET = 'medical-records';

// ── File Upload ───────────────────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL on success.
 *
 * @param {File}   file
 * @param {string} userId - mock user ID (e.g. 'u-001')
 * @returns {{ url: string|null, error: string|null }}
 */
export async function uploadFile(file, userId) {
  const ext       = file.name.split('.').pop() || 'bin';
  const timestamp = Date.now();
  const path      = `${userId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  console.log('[recordsService] 📤 Uploading to bucket:', BUCKET, 'path:', path);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (error) {
    console.error('[recordsService] ❌ Upload failed:', {
      message: error.message,
      status: error.status,
      error: error
    });
    return { url: null, error: error.message };
  }

  console.log('[recordsService] ✅ Upload success, getting public URL...');
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return { url: publicUrl, error: null };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Save an extracted medical record to the database.
 *
 * @param {object} record
 * @param {string} record.user_id
 * @param {string} record.file_url
 * @param {string} record.file_type   - 'image' | 'pdf'
 * @param {object} record.extracted   - structured fields from ocrService
 * @param {number} record.confidence  - 0.0–1.0
 * @param {boolean} record.verified   - user confirmed
 * @returns {{ data: object|null, error: string|null }}
 */
export async function saveRecord({ user_id, file_url, file_type, extracted, confidence, verified = false }) {
  console.log('[recordsService] 💾 Saving metadata to table:', TABLE, { user_id, file_type });
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      user_id,
      file_url,
      file_type,
      extracted,
      confidence,
      verified,
      raw_text: null,
    }])
    .select()
    .single();

  if (error) {
    console.error('[recordsService] ❌ saveRecord failed:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return { data: null, error: error.message };
  }
  console.log('[recordsService] ✅ Metadata saved:', data.id);
  return { data, error: null };
}

/**
 * Get all records for a user, newest first.
 *
 * @param {string} userId
 * @returns {{ data: object[]|null, error: string|null }}
 */
export async function getRecords(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, file_url, file_type, extracted, confidence, verified, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[recordsService] getRecords error:', error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

/**
 * Mark a record as verified by the user.
 *
 * @param {string} recordId - UUID
 * @param {object} updatedExtracted - user-edited extracted fields
 * @returns {{ data: object|null, error: string|null }}
 */
export async function verifyRecord(recordId, updatedExtracted) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ verified: true, extracted: updatedExtracted })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    console.error('[recordsService] verifyRecord error:', error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

/**
 * Delete a record (and optionally the storage file).
 *
 * @param {string} recordId
 * @returns {{ error: string|null }}
 */
export async function deleteRecord(recordId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('[recordsService] deleteRecord error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

export default { uploadFile, saveRecord, getRecords, verifyRecord, deleteRecord };
