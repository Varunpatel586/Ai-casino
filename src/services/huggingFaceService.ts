/**
 * Hugging Face API service for image generation
 */

interface HuggingFaceConfig {
  HF_TOKEN: string;
}

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
    throw new Error('Configuration file not found. Please add HF_TOKEN to .bolt/config.json');
  }
}

export interface GeneratedImage {
  data: string; // Base64 encoded image data
  prompt: string;
}

/**
 * Generate an image using Hugging Face Inference API
 */
export async function generateImage(prompt: string): Promise<GeneratedImage> {
  try {
    const config = await getConfig();

    if (!config.HF_TOKEN) {
      throw new Error('HF_TOKEN not found in config. Please add your Hugging Face token to .bolt/config.json');
    }

    console.log(`[HF] Generating image for prompt: ${prompt}`);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.HF_TOKEN}`,
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

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    // Get the image as blob and convert to base64
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return {
      data: `data:${blob.type};base64,${base64}`,
      prompt
    };

  } catch (error) {
    console.error('[HF] Generation failed:', error);
    throw error;
  }
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
