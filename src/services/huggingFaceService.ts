/**
 * Hugging Face API service for image generation with multi-key support
 */

interface HuggingFaceConfig {
  HF_TOKENS: string[];
}

// Key management class for cycling through API keys
class HuggingFaceKeyManager {
  private keys: string[] = [];
  private currentKeyIndex: number = 0;
  private failedKeys: Set<number> = new Set();

  constructor(keys: string[]) {
    this.keys = [...keys]; // Create a copy to avoid mutations
  }

  getCurrentKey(): string {
    return this.keys[this.currentKeyIndex];
  }

  getNextAvailableKey(): string | null {
    // Find the next key that hasn't failed recently
    for (let i = 0; i < this.keys.length; i++) {
      const keyIndex = (this.currentKeyIndex + i + 1) % this.keys.length;
      if (!this.failedKeys.has(keyIndex)) {
        this.currentKeyIndex = keyIndex;
        return this.keys[keyIndex];
      }
    }
    return null; // All keys have failed
  }

  markCurrentKeyFailed(): void {
    this.failedKeys.add(this.currentKeyIndex);
    console.log(`[HF] Marked key ${this.currentKeyIndex} as failed`);
  }

  resetFailedKeys(): void {
    this.failedKeys.clear();
    this.currentKeyIndex = 0;
    console.log('[HF] Reset all failed keys');
  }

  getAvailableKeysCount(): number {
    return this.keys.length - this.failedKeys.size;
  }
}

// Global key manager instance
let keyManager: HuggingFaceKeyManager | null = null;

// Get config from .bolt/config.json
async function getConfig(): Promise<HuggingFaceConfig> {
  try {
    const response = await fetch('/.bolt/config.json');
    if (!response.ok) {
      throw new Error('Failed to load config');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading config:', error);
    throw new Error('Configuration file not found. Please add HF_TOKENS array to .bolt/config.json');
  }
}

// Initialize the key manager
async function initializeKeyManager(): Promise<void> {
  if (!keyManager) {
    try {
      // Try to load keys from localStorage first (development)
      let keys = getStoredApiKeys();

      // If no keys in localStorage, fall back to config file
      if (keys.length === 0) {
        const config = await getConfig();
        if (!config.HF_TOKENS || !Array.isArray(config.HF_TOKENS) || config.HF_TOKENS.length === 0) {
          throw new Error('HF_TOKENS array not found or empty in config. Please add your Hugging Face tokens to .bolt/config.json');
        }
        keys = config.HF_TOKENS;
      }

      keyManager = new HuggingFaceKeyManager(keys);
      console.log(`[HF] Initialized with ${keys.length} API keys`);
    } catch (error) {
      console.error('[HF] Failed to initialize key manager:', error);
      throw error;
    }
  }
}

export interface GeneratedImage {
  data: string; // Base64 encoded image data
  prompt: string;
}

/**
 * Generate an image using Hugging Face Inference API with automatic key fallback
 */
export async function generateImage(prompt: string): Promise<GeneratedImage> {
  await initializeKeyManager();

  if (!keyManager) {
    throw new Error('Key manager not initialized');
  }

  let lastError: Error | null = null;

  // Try with current key first, then cycle through available keys
  for (let attempt = 0; attempt < keyManager.getAvailableKeysCount(); attempt++) {
    const currentKey = keyManager.getCurrentKey();

    try {
      console.log(`[HF] Generating image with key ${keyManager['currentKeyIndex']} for prompt: ${prompt}`);

      const response = await fetch(
        `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            options: {
              wait_for_model: true
            }
          }),
        }
      );

      if (response.ok) {
        // Success - reset failed keys since this one worked
        keyManager.resetFailedKeys();

        // Get the image as blob and convert to base64
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        return {
          data: `data:${blob.type};base64,${base64}`,
          prompt
        };
      }

      // Handle specific error cases
      if (response.status === 429) {
        // Rate limit exceeded - mark key as failed and try next
        console.log(`[HF] Rate limit exceeded for key ${keyManager['currentKeyIndex']}`);
        keyManager.markCurrentKeyFailed();
        lastError = new Error(`Rate limit exceeded for API key`);
      } else if (response.status === 401 || response.status === 403) {
        // Invalid or expired token - mark as failed
        console.log(`[HF] Invalid token for key ${keyManager['currentKeyIndex']}`);
        keyManager.markCurrentKeyFailed();
        lastError = new Error(`Invalid API key`);
      } else {
        // Other errors - still try next key
        console.log(`[HF] API error ${response.status} for key ${keyManager['currentKeyIndex']}`);
        keyManager.markCurrentKeyFailed();
        lastError = new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Try next key
      const nextKey = keyManager.getNextAvailableKey();
      if (!nextKey) {
        break; // No more keys to try
      }

    } catch (error) {
      console.error(`[HF] Network error with key ${keyManager['currentKeyIndex']}:`, error);
      keyManager.markCurrentKeyFailed();
      lastError = error as Error;

      // Try next key
      const nextKey = keyManager.getNextAvailableKey();
      if (!nextKey) {
        break; // No more keys to try
      }
    }
  }

  // All keys failed or no keys available
  const availableKeys = keyManager.getAvailableKeysCount();
  if (availableKeys === 0) {
    throw new Error('All Hugging Face API keys have been exhausted or are invalid. Please check your configuration.');
  }

  throw lastError || new Error('All available API keys failed');
}

/**
 * Generate multiple images for a round
 */
export async function generateRoundImages(prompts: string[]): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];

  for (const prompt of prompts) {
    try {
      const image = await generateImage(prompt);
      images.push(image);
    } catch (error) {
      console.error(`Failed to generate image for prompt: ${prompt}`, error);
      // Create a fallback image (you could also use a default image URL)
      images.push({
        data: await createFallbackImage(),
        prompt
      });
    }
  }

  return images;
}

/**
 * Create a fallback image when generation fails
 */
async function createFallbackImage(): Promise<string> {
  // Create a simple SVG fallback image
  const svg = `
    <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#323232"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#ccc" text-anchor="middle" dy=".3em">
        Image not available
      </text>
    </svg>
  `;

  const encoder = new TextEncoder();
  const data = encoder.encode(svg);
  const base64 = btoa(String.fromCharCode(...data));

  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Add a new API key to the configuration
 * This function can be called from the browser console for easy key management
 */
export async function addApiKey(newKey: string): Promise<void> {
  try {
    // For development, we'll use localStorage as a temporary key store
    // In production, this should be handled server-side
    const existingKeys = getStoredApiKeys();
    if (!existingKeys.includes(newKey)) {
      existingKeys.push(newKey);
      localStorage.setItem('hf_api_keys', JSON.stringify(existingKeys));

      // Update the key manager if it exists
      if (keyManager) {
        keyManager = new HuggingFaceKeyManager(existingKeys);
        console.log(`[HF] Added new API key. Total keys: ${existingKeys.length}`);
      }
    } else {
      console.log('[HF] Key already exists in configuration');
    }
  } catch (error) {
    console.error('[HF] Error adding API key:', error);
  }
}

/**
 * Get API keys from localStorage (development) or config file (production)
 */
function getStoredApiKeys(): string[] {
  try {
    // Try localStorage first (for development)
    const stored = localStorage.getItem('hf_api_keys');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('[HF] Could not load keys from localStorage');
  }

  // Fallback to config file
  // Note: In a real application, this should be handled server-side
  console.log('[HF] Using keys from config file');
  return [];
}
