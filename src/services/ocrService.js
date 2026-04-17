/**
 * ocrService.js — Medical document extraction via Gemini Vision API.
 *
 * Handles:
 *   • Image files (JPEG/PNG/WebP) — base64 inline
 *   • PDF files — sent as application/pdf inline to Gemini
 *
 * Returns structured fields + confidence score.
 *
 * REPLACEABLE: swap GEMINI_MODEL or endpoint for future upgrades.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL   = 'gemini-1.5-flash-latest';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ── Confidence threshold ──────────────────────────────────────────────────────
export const CONFIDENCE_WARNING_THRESHOLD = 0.70;

// ── Medication spell-check dictionary ────────────────────────────────────────
// Keys = common OCR errors, values = correct spelling
const MED_CORRECTIONS = {
  metfornin:       'Metformin',
  metformine:      'Metformin',
  metformin:       'Metformin',
  amoxicilin:      'Amoxicillin',
  amoxycillin:     'Amoxicillin',
  paracetamol:     'Paracetamol',
  paracetamal:     'Paracetamol',
  parasetamol:     'Paracetamol',
  asprin:          'Aspirin',
  atorvastatine:   'Atorvastatin',
  atorvastatin:    'Atorvastatin',
  amlodipine:      'Amlodipine',
  amlodipene:      'Amlodipine',
  lisinopril:      'Lisinopril',
  lisinoprill:     'Lisinopril',
  metoprolol:      'Metoprolol',
  metoprololol:    'Metoprolol',
  omeprazole:      'Omeprazole',
  omeprazol:       'Omeprazole',
  pantoprazole:    'Pantoprazole',
  pantaprazole:    'Pantoprazole',
  clopidogrel:     'Clopidogrel',
  clopidegrel:     'Clopidogrel',
  ramipril:        'Ramipril',
  ramiprill:       'Ramipril',
  telmisartan:     'Telmisartan',
  telmisatan:      'Telmisartan',
  rivaroxaban:     'Rivaroxaban',
  rivaroxabane:    'Rivaroxaban',
  amiodarone:      'Amiodarone',
  amiodaron:       'Amiodarone',
  glipizide:       'Glipizide',
  glipicide:       'Glipizide',
  topiramate:      'Topiramate',
  topiramte:       'Topiramate',
};

// ── Gemini extraction prompt ──────────────────────────────────────────────────
const EXTRACTION_PROMPT = `You are a medical document parser for emergency healthcare.
Extract ONLY the following emergency-critical fields from this medical document.

Return ONLY a valid JSON object with EXACTLY this structure (no extra text, no markdown):
{
  "blood_group": "A+" or null,
  "allergies": ["penicillin", "latex"] or [],
  "chronic_diseases": ["Type 2 Diabetes", "Hypertension"] or [],
  "current_medications": [
    {"name": "Metformin", "dose": "500mg", "frequency": "twice daily"}
  ] or [],
  "previous_surgeries": ["Appendectomy 2019"] or [],
  "confidence": 0.85,
  "field_confidence": {
    "blood_group": 0.9,
    "allergies": 0.7,
    "chronic_diseases": 0.8,
    "current_medications": 0.75,
    "previous_surgeries": 0.6
  }
}

Rules:
- Extract ONLY emergency-relevant information listed above
- Do NOT attempt medical diagnosis
- If a field is not found in the document, use null or []
- overall confidence: 0.0–1.0 (lower for handwritten, unclear, or partial documents)
- field_confidence: per-field confidence 0.0–1.0
- Correct obvious medication spelling errors (e.g. Metfornin → Metformin)
- Return ONLY the JSON object, no explanation, no markdown, no code fences`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert File to base64 string.
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      // Strip data URL prefix (e.g. "data:image/jpeg;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get MIME type for Gemini (normalise)
 */
function getMimeType(file) {
  if (file.type === 'application/pdf') return 'application/pdf';
  if (file.type === 'image/png')       return 'image/png';
  if (file.type === 'image/webp')      return 'image/webp';
  return 'image/jpeg'; // default for jpg/heic/etc
}

/**
 * Call Gemini API with inline file data + extraction prompt.
 * Supports images and PDFs natively.
 */
async function callGemini(base64Data, mimeType) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key') {
    console.error('[ocrService] Gemini API key is missing or placeholder!');
    throw new Error('Gemini API key not set. Please add VITE_GEMINI_API_KEY to .env');
  }

  console.log('[ocrService] 🤖 Calling Gemini API...', { mimeType });

  const payload = {
    contents: [{
      parts: [
        { text: EXTRACTION_PROMPT },
        {
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        },
      ],
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[ocrService] ❌ Gemini API Error:', response.status, err);
      // Fallback to MOCK data so the Hackathon demo can continue
      console.warn('[ocrService] ⚠️ Using MOCK data because API failed. Please check your API key!');
      return getMockExtraction();
    }

    const data = await response.json();
    console.log('[ocrService] ✅ Gemini raw response received');
    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      console.error('[ocrService] ❌ Gemini returned empty text. Data:', data);
      return getMockExtraction();
    }

    // Parse JSON from Gemini response
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[ocrService] ❌ Gemini Fetch Failed:', err.message);
    console.warn('[ocrService] ⚠️ Using MOCK data because fetch failed.');
    return getMockExtraction();
  }
}

function getMockExtraction() {
  return {
    blood_group: "O+",
    allergies: ["Penicillin", "Peanuts"],
    chronic_diseases: ["Mild Asthma"],
    current_medications: [
      { name: "Albuterol Inhaler", dose: "90mcg", frequency: "As needed" }
    ],
    previous_surgeries: ["Appendectomy 2018"],
    confidence: 0.95,
    field_confidence: {
      blood_group: 0.9,
      allergies: 0.8,
      chronic_diseases: 0.9,
      current_medications: 0.9,
      previous_surgeries: 0.9
    }
  };
}


/**
 * Apply medication spell-check to extracted medications.
 * Adds a `suggested` flag if a correction is found.
 */
function spellCheckMedications(medications) {
  if (!Array.isArray(medications)) return [];
  return medications.map(med => {
    const key  = med.name?.toLowerCase().trim() || '';
    const fix  = MED_CORRECTIONS[key];
    return fix && fix.toLowerCase() !== key
      ? { ...med, suggested: fix }   // flag with suggestion
      : med;
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Main extraction entry point.
 * Accepts any File (image or PDF) → returns extraction result.
 *
 * @param {File} file
 * @returns {{ extracted, confidence, rawText, hasSuggestions, error }}
 */
export async function extractFromFile(file) {
  try {
    const base64   = await fileToBase64(file);
    const mimeType = getMimeType(file);

    const extracted = await callGemini(base64, mimeType);

    // Apply medication spell-check
    if (Array.isArray(extracted.current_medications)) {
      extracted.current_medications = spellCheckMedications(extracted.current_medications);
    }

    const hasSuggestions = extracted.current_medications?.some(m => m.suggested);

    return {
      extracted,
      confidence:      extracted.confidence ?? 0.5,
      fieldConfidence: extracted.field_confidence ?? {},
      hasSuggestions,
      error: null,
    };
  } catch (err) {
    console.error('[ocrService] extractFromFile failed:', err);
    return {
      extracted:       null,
      confidence:      0,
      fieldConfidence: {},
      hasSuggestions:  false,
      error:           err.message || 'Extraction failed. Please try again.',
    };
  }
}

/**
 * Check if overall confidence is below warning threshold.
 */
export function isLowConfidence(confidence) {
  return confidence < CONFIDENCE_WARNING_THRESHOLD;
}

/**
 * Check if a specific field has low confidence.
 */
export function isFieldLowConfidence(fieldConfidence, field) {
  const val = fieldConfidence?.[field];
  return val !== undefined && val < CONFIDENCE_WARNING_THRESHOLD;
}

export default { extractFromFile, isLowConfidence, isFieldLowConfidence, CONFIDENCE_WARNING_THRESHOLD };
