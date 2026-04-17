/**
 * emergencySnapshotService.js — Emergency Medical Snapshot manager.
 *
 * Maintains ONE snapshot per user in the `emergency_snapshot` table.
 * Called after every verified record upload to merge new fields in.
 * Called at ambulance dispatch to attach snapshotId to the alert.
 *
 * Table: emergency_snapshot (user_id UNIQUE)
 */

import { supabase } from '../lib/supabase';

const TABLE = 'emergency_snapshot';

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Merge two arrays, deduplicating by lowercase comparison.
 */
function mergeUnique(existing = [], incoming = []) {
  const set = new Set((existing || []).map(s => s.toLowerCase()));
  const result = [...(existing || [])];
  for (const item of (incoming || [])) {
    if (!set.has(item.toLowerCase())) {
      result.push(item);
      set.add(item.toLowerCase());
    }
  }
  return result;
}

/**
 * Merge medications, deduplicating by name (case-insensitive).
 */
function mergeMedications(existing = [], incoming = []) {
  const nameSet = new Set((existing || []).map(m => m.name?.toLowerCase()));
  const result = [...(existing || [])];
  for (const med of (incoming || [])) {
    if (!nameSet.has(med.name?.toLowerCase())) {
      // Strip internal 'suggested' field before persisting
      const { suggested, ...clean } = med;
      result.push(clean);
      nameSet.add(med.name?.toLowerCase());
    }
  }
  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Upsert (create or update) the snapshot for a user.
 * Merges new extracted fields with any existing snapshot data.
 *
 * @param {string} userId          - mock user ID
 * @param {object} extractedFields - from ocrService (after user verification)
 * @param {string} sourceRecordId  - UUID of the medical_record that sourced this
 * @returns {{ data: object|null, error: string|null }}
 */
export async function upsertSnapshot(userId, extractedFields, sourceRecordId) {
  // Fetch existing snapshot first
  const { data: existing } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Build merged snapshot
  const merged = {
    user_id:             userId,
    blood_group:         extractedFields.blood_group || existing?.blood_group || null,
    allergies:           mergeUnique(existing?.allergies, extractedFields.allergies),
    chronic_diseases:    mergeUnique(existing?.chronic_diseases, extractedFields.chronic_diseases),
    current_medications: mergeMedications(existing?.current_medications, extractedFields.current_medications),
    previous_surgeries:  mergeUnique(existing?.previous_surgeries, extractedFields.previous_surgeries),
    last_updated:        new Date().toISOString(),
    source_record_ids:   [
      ...(existing?.source_record_ids || []),
      sourceRecordId,
    ].filter(Boolean),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(merged, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[emergencySnapshotService] upsertSnapshot error:', error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

/**
 * Get the snapshot for a user (for the patient's own view + pre-dispatch lookup).
 *
 * @param {string} userId
 * @returns {{ data: object|null, error: string|null }}
 */
export async function getSnapshotByUserId(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[emergencySnapshotService] getSnapshotByUserId error:', error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

/**
 * Get a snapshot by its UUID (for doctor / hospital views via snapshotId in alert).
 *
 * @param {string} snapshotId - UUID
 * @returns {{ data: object|null, error: string|null }}
 */
export async function getSnapshotById(snapshotId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', snapshotId)
    .maybeSingle();

  if (error) {
    console.error('[emergencySnapshotService] getSnapshotById error:', error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

/**
 * Check if a user has an emergency snapshot.
 * Lightweight — only fetches id + last_updated.
 */
export async function hasSnapshot(userId) {
  const { data } = await supabase
    .from(TABLE)
    .select('id, last_updated')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export default { upsertSnapshot, getSnapshotByUserId, getSnapshotById, hasSnapshot };
