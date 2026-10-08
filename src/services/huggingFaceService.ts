export interface GeneratedImage {
  data: string; // URL or base64 to the image
  prompt: string;
}

// Ensure puter is available globally
declare global {
  interface Window {
    puter?: {
      ai?: {
        chat?: (prompt: string, options?: { model?: string }) => Promise<unknown>;
        txt2img?: (prompt: string, options?: { model?: string }) => Promise<HTMLImageElement | string>;
      };
      auth?: {
        isSignedIn?: () => boolean;
        getUser?: () => Promise<{ username?: string }>;
        signIn?: () => Promise<void>;
        signOut?: () => Promise<void>;
      };
      isSignedIn?: () => boolean;
      getUser?: () => Promise<{ username?: string }>;
      signIn?: () => Promise<void>;
      signOut?: () => Promise<void>;
    };
  }
}

// Timeout helper
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};



// 1. Puter (Primary)
async function generateWithPuter(prompt: string): Promise<string> {
  if (!window.puter || !window.puter.ai || !window.puter.ai.txt2img) {
    throw new Error('Puter.js not loaded or txt2img not available');
  }
  
  const signedIn = typeof window.puter.auth?.isSignedIn === 'function' 
    ? window.puter.auth.isSignedIn() 
    : (typeof window.puter.isSignedIn === 'function' ? window.puter.isSignedIn() : false);
    
  if (!signedIn) {
    throw new Error('Puter requires sign-in, skipping to avoid popup');
  }

  // Capture current DOM nodes attached to body to clean up Puter popups on failure
  const childNodesBefore = Array.from(document.body.childNodes);

  try {
    const res = await window.puter.ai.txt2img(prompt, { model: 'black-forest-labs/flux-1.1-pro' });
    if (!res) throw new Error("Puter returned an empty response");
    return typeof res === 'string' ? res : res.src;
  } catch (error) {
    // If Puter fails (e.g. low balance), it dynamically injects an iframe popup. We aggressively remove it.
    const currentNodes = Array.from(document.body.childNodes);
    currentNodes.forEach(node => {
      if (!childNodesBefore.includes(node)) {
        try { document.body.removeChild(node); } catch { /* ignore */ }
      }
    });
    
    // Fallback: Remove any element with 'puter' in its ID or class that isn't the main script
    document.querySelectorAll('[id*="puter"], [class*="puter"]').forEach(el => {
      if (el.tagName !== 'SCRIPT') {
        try { el.remove(); } catch { /* ignore */ }
      }
    });
    
    throw error;
  }
}

// 2. Pollinations (Client-Side Direct - Fastest and avoids server rate limits)
async function generateWithPollinationsClientSide(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&nologo=true&model=turbo`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Pollinations Client-side error: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

import { getBackendUrl } from './apiConfig';

// 3. Pollinations (Backend Proxy)
async function generateWithPollinationsBackend(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  const baseUrl = getBackendUrl();
  const url = `${baseUrl}/api/generate-pollinations?prompt=${encodedPrompt}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Pollinations Backend error: ${response.status} ${response.statusText}`);
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

let hfKeyIndex = 0;
// 4. Hugging Face (Client-side)
async function generateWithHuggingFace(prompt: string): Promise<string> {
  const keys = [
    import.meta.env.VITE_HF_API_KEY_1,
    import.meta.env.VITE_HF_API_KEY_2,
    import.meta.env.VITE_HF_API_KEY_3,
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error('No HuggingFace keys configured on client');
  }

  const key = keys[hfKeyIndex % keys.length];
  hfKeyIndex++;

  // Hugging Face has been deprecating free tier models rapidly today.
  // We will loop through a list of fallback models that are typically available on the free tier.
  const models = [
    'prompthero/openjourney',
    'stabilityai/stable-diffusion-2-1',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'CompVis/stable-diffusion-v1-4',
    'runwayml/stable-diffusion-v1-5',
    'SG161222/Realistic_Vision_V1.4'
  ];

  let lastError = '';

  for (const model of models) {
    try {
      const url = `https://router.huggingface.co/hf-inference/models/${model}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) {
        let errorText = response.statusText;
        try {
          const errJson = await response.json();
          errorText = errJson.error || errorText;
        } catch { /* ignore */ }
        throw new Error(`Status ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : String(e);
      console.warn(`[ImageGen] HF Model ${model} failed:`, errMessage);
      lastError = errMessage;
      // Continue to next model
    }
  }

  throw new Error(`All HF models failed. Last error: ${lastError}`);
}

// 5. Hardcoded Fallbacks
function getHardcodedFallback(imageId?: number): string {
  if (imageId && imageId >= 1 && imageId <= 5) {
    return `/fallback-images/image${imageId}.jpg`;
  }
  const fallbacks = [
    '/fallback-images/mountains.jpg',
    '/fallback-images/sunset.jpg',
    '/fallback-images/hills.jpg'
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// 6. SVG Fallback
function createFallbackSVG(): string {
  const svg = `
    <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#323232"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#ccc" text-anchor="middle" dy=".3em">
        Image generation failed. Enjoy this placeholder!
      </text>
    </svg>
  `;
  const encoder = new TextEncoder();
  const data = encoder.encode(svg);
  const base64 = btoa(String.fromCharCode(...data));
  return `data:image/svg+xml;base64,${base64}`;
}

export async function generateImage(prompt: string, imageId?: number): Promise<GeneratedImage> {
  try {
    console.log(`[ImageGen] Tier 1: Trying Puter...`);
    const imageUrl = await withTimeout(generateWithPuter(prompt), 20000);
    return { data: imageUrl, prompt };
  } catch (error) {
    console.warn(`[ImageGen] Tier 1 Puter failed:`, error);
  }

  try {
    console.log(`[ImageGen] Tier 2: Trying Pollinations Client-Side...`);
    const imageUrl = await withTimeout(generateWithPollinationsClientSide(prompt), 15000);
    return { data: imageUrl, prompt };
  } catch (error) {
    console.warn(`[ImageGen] Tier 2 Pollinations Client-Side failed:`, error);
  }

  try {
    console.log(`[ImageGen] Tier 3: Trying Pollinations Backend...`);
    const imageUrl = await withTimeout(generateWithPollinationsBackend(prompt), 20000);
    return { data: imageUrl, prompt };
  } catch (error) {
    console.warn(`[ImageGen] Tier 3 Pollinations Backend failed:`, error);
  }

  try {
    console.log(`[ImageGen] Tier 4: Trying Hugging Face...`);
    const imageUrl = await withTimeout(generateWithHuggingFace(prompt), 20000);
    return { data: imageUrl, prompt };
  } catch (error) {
    console.warn(`[ImageGen] Tier 4 Hugging Face failed:`, error);
  }

  try {
    console.log(`[ImageGen] Tier 5: Using Hardcoded fallback`);
    return { data: getHardcodedFallback(imageId), prompt };
  } catch (error) {
    console.warn(`[ImageGen] Tier 5 Hardcoded failed:`, error);
  }

  console.log(`[ImageGen] Tier 6: Using SVG placeholder`);
  return { data: createFallbackSVG(), prompt };
}

// Optional Auth Helper for Puter (can be called on mount if needed)
export async function ensurePuterAuth() {
  if (window.puter) {
    const signedIn = typeof window.puter.auth?.isSignedIn === 'function' ? window.puter.auth.isSignedIn() : (window.puter.isSignedIn?.() ?? false);
    if (!signedIn) {
      try {
        if (typeof window.puter.auth?.signIn === 'function') {
          await window.puter.auth.signIn();
        } else {
          await window.puter.signIn?.();
        }
      } catch (e) {
        console.warn("Puter sign-in failed or was cancelled.", e);
        alert("Puter sign-in failed. Check the console for details.");
      }
    } else {
      alert("Already signed in to Puter!");
    }
  } else {
    alert("Puter script not loaded yet.");
  }
}

/**
 * Signs the current player out of Puter after the game completes so that
 * the next player's image generation runs under their own free-tier account
 * and doesn't drain the previous player's credits.
 */
export async function signOutPuter(): Promise<void> {
  try {
    if (window.puter) {
      if (typeof window.puter.auth?.signOut === 'function') {
        await window.puter.auth.signOut();
      } else if (typeof window.puter.signOut === 'function') {
        await window.puter.signOut();
      }
    }

    // Clear any puter auth caches/tokens in storage to prevent token reuse
    if (typeof window !== 'undefined') {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.toLowerCase().includes('puter')) {
            localStorage.removeItem(key);
          }
        }
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (key && key.toLowerCase().includes('puter')) {
            sessionStorage.removeItem(key);
          }
        }
      } catch {
        // storage cleanup failure is non-fatal
      }
    }

    console.log('[Puter] Player signed out successfully.');
  } catch (e) {
    // Non-fatal — log and continue so the game flow isn't blocked
    console.warn('[Puter] Sign-out failed (non-fatal):', e);
  }
}
