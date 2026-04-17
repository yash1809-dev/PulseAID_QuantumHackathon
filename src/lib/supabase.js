/**
 * supabase.js — Supabase client singleton with graceful no-op fallback.
 *
 * When VITE_SUPABASE_URL is not set (placeholder or missing), returns a
 * mock client that no-ops all operations rather than crashing.
 *
 * Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to activate.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== 'your-supabase-project-url' &&
  supabaseUrl.startsWith('http');

if (!isConfigured) {
  console.warn(
    '[supabase] Not configured. Medical records will not persist.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'
  );
}

// ── No-op mock client used when Supabase is not configured ────────────────────
const noopResponse = { data: null, error: { message: 'Supabase not configured' } };
const noopChain    = () => ({
  select:  noopChain,
  insert:  noopChain,
  update:  noopChain,
  upsert:  noopChain,
  delete:  noopChain,
  eq:      noopChain,
  order:   noopChain,
  single:  ()       => Promise.resolve(noopResponse),
  maybeSingle: ()   => Promise.resolve({ data: null, error: null }),
  then:    (resolve) => Promise.resolve(noopResponse).then(resolve),
});

const mockStorageChain = () => ({
  upload:    () => Promise.resolve(noopResponse),
  getPublicUrl: () => ({ data: { publicUrl: '' } }),
});

const noopClient = {
  from: () => noopChain(),
  storage: {
    from: () => mockStorageChain(),
  },
};

// ── Real client (only created when properly configured) ───────────────────────
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : noopClient;

export const isSupabaseConfigured = isConfigured;

export default supabase;
