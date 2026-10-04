/**
 * Image Similarity Engine (Round 2 - Reverse Prompt Engineering Duel)
 *
 * Compares the ORIGINAL target artwork against the AI-GENERATED canvas
 * entirely client-side (no backend, no external deps) by blending two
 * perceptual metrics:
 *   1. Structural hash (average + difference hash on downscaled grayscale)
 *      -> rewards a matching composition / layout.
 *   2. Colour histogram (normalized 3D RGB histogram)
 *      -> rewards a matching palette / atmosphere.
 *
 * The blended 0-100 score is mapped onto a casino multiplier so the round
 * can settle chip payouts based on how closely the AI recreated the image.
 */

export type SimilarityMethod = 'canvas' | 'fallback';

export interface SimilarityResult {
  similarity: number; // 0-100
  multiplier: number; // 0-5
  method: SimilarityMethod;
}

// ---- Tunable configuration ------------------------------------------------

/** Size (px) of the square image used for structural hashing. */
const HASH_SIZE = 32;
/** Size (px) of the square image used for the colour histogram. */
const COLOR_SIZE = 64;
/** Number of bins per RGB channel (4 -> 4x4x4 = 64 bins). */
const COLOR_BINS = 4;
/** Weight of the structural (layout) score in the final blend. */
const W_STRUCTURAL = 0.5;
/** Weight of the colour (palette) score in the final blend. */
const W_COLOR = 0.5;

/**
 * Multiplier tiers, ordered from highest similarity threshold down.
 * 100% -> 5x, 90% -> 4x, and so on (lower similarity => lower payout).
 */
export const MULTIPLIER_TIERS: ReadonlyArray<{ min: number; multiplier: number }> = [
  { min: 95, multiplier: 5 },
  { min: 85, multiplier: 4 },
  { min: 75, multiplier: 3 },
  { min: 65, multiplier: 2 },
  { min: 50, multiplier: 1 },
  { min: 0, multiplier: 0 },
];

/** Neutral result used whenever a comparison cannot be performed. */
const FALLBACK_RESULT: SimilarityResult = { similarity: 0, multiplier: 1, method: 'fallback' };

// ---- Public API -----------------------------------------------------------

/** Maps a 0-100 similarity score to its casino multiplier (0-5). */
export function similarityToMultiplier(similarity: number): number {
  const score = Math.max(0, Math.min(100, similarity));
  for (const tier of MULTIPLIER_TIERS) {
    if (score >= tier.min) return tier.multiplier;
  }
  return 0;
}

interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * Loads an image from a URL and returns its pixels drawn onto an offscreen
 * canvas. Fetching as a Blob first keeps the canvas untainted (so
 * getImageData never throws) and sidesteps cross-origin image issues.
 */
async function loadPixels(url: string, size: number): Promise<PixelData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status}) from ${url}`);
  }
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D canvas context unavailable');

  ctx.drawImage(bitmap, 0, 0, size, size);
  if (typeof bitmap.close === 'function') bitmap.close();

  return { data: ctx.getImageData(0, 0, size, size).data, width: size, height: size };
}

/** Converts RGBA pixels into a single luminance value per pixel (0-255). */
function toGrayscale(pixels: PixelData): number[] {
  const { data } = pixels;
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    // Rec. 601 luma
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return gray;
}

/**
 * Difference hash: records whether each pixel is brighter than its right
 * neighbour. Robust to scaling and minor edits.
 */
function differenceHash(gray: number[], width: number, height: number): number[] {
  const bits: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width - 1; x++) {
      bits.push(gray[y * width + x] > gray[y * width + x + 1] ? 1 : 0);
    }
  }
  return bits;
}

/** Average hash: records whether each pixel is brighter than the image mean. */
function averageHash(gray: number[]): number[] {
  const mean = gray.reduce((sum, value) => sum + value, 0) / Math.max(1, gray.length);
  return gray.map((value) => (value > mean ? 1 : 0));
}

/** Fraction of differing bits between two equal-length bit arrays (0..1). */
function hammingRatio(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  if (length === 0) return 1;
  let diff = 0;
  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) diff++;
  }
  return diff / length;
}

/**
 * Converts a raw hash distance (0..1, where ~0.5 means "unrelated") into a
 * 0-100 score where an identical hash = 100 and an unrelated one = 0.
 */
function hashDistanceToScore(distance: number): number {
  const UNRELATED = 0.5; // hashes of unrelated images differ on ~half their bits
  const score = (1 - distance / UNRELATED) * 100;
  return Math.max(0, Math.min(100, score));
}

/** Builds a normalized 3D RGB histogram (length COLOR_BINS^3). */
function colorHistogram(pixels: PixelData): number[] {
  const bins = COLOR_BINS;
  const histogram = new Array<number>(bins * bins * bins).fill(0);
  const { data } = pixels;
  const step = 256 / bins;
  const totalPixels = Math.max(1, data.length / 4);

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.min(bins - 1, Math.floor(data[i] / step));
    const g = Math.min(bins - 1, Math.floor(data[i + 1] / step));
    const b = Math.min(bins - 1, Math.floor(data[i + 2] / step));
    histogram[r * bins * bins + g * bins + b] += 1;
  }

  for (let i = 0; i < histogram.length; i++) histogram[i] /= totalPixels;
  return histogram;
}

/**
 * Bhattacharyya-style coefficient between two normalized histograms,
 * returned as a 0-100 score (identical distributions = 100).
 */
function histogramSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  if (length === 0) return 0;
  let coefficient = 0;
  for (let i = 0; i < length; i++) {
    coefficient += Math.sqrt(a[i] * b[i]);
  }
  return Math.max(0, Math.min(100, coefficient * 100));
}

/** Blends the structural and colour metrics into a rounded 0-100 score. */
function blend(structural: number, color: number): number {
  const totalWeight = W_STRUCTURAL + W_COLOR || 1;
  const score = (W_STRUCTURAL * structural + W_COLOR * color) / totalWeight;
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Compares the original target artwork against the AI-generated canvas and
 * returns the similarity percentage plus its multiplier. This never throws:
 * any failure (network, CORS, decode, canvas taint) resolves to a neutral
 * fallback so the round can always continue.
 */
export async function compareImages(
  originalUrl: string,
  generatedUrl: string
): Promise<SimilarityResult> {
  try {
    if (!originalUrl || !generatedUrl) return FALLBACK_RESULT;

    const [originalHash, generatedHash, originalColor, generatedColor] = await Promise.all([
      loadPixels(originalUrl, HASH_SIZE),
      loadPixels(generatedUrl, HASH_SIZE),
      loadPixels(originalUrl, COLOR_SIZE),
      loadPixels(generatedUrl, COLOR_SIZE),
    ]);

    const originalGray = toGrayscale(originalHash);
    const generatedGray = toGrayscale(generatedHash);

    const dHashScore = hashDistanceToScore(
      hammingRatio(
        differenceHash(originalGray, HASH_SIZE, HASH_SIZE),
        differenceHash(generatedGray, HASH_SIZE, HASH_SIZE)
      )
    );
    const aHashScore = hashDistanceToScore(
      hammingRatio(averageHash(originalGray), averageHash(generatedGray))
    );
    const structuralScore = (dHashScore + aHashScore) / 2;

    const colorScore = histogramSimilarity(
      colorHistogram(originalColor),
      colorHistogram(generatedColor)
    );

    const similarity = blend(structuralScore, colorScore);
    return { similarity, multiplier: similarityToMultiplier(similarity), method: 'canvas' };
  } catch (error) {
    console.warn('[imageSimilarity] Comparison failed, using neutral fallback:', error);
    return FALLBACK_RESULT;
  }
}
