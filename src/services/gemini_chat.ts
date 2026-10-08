import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBackendUrl } from './apiConfig';

const GROQ_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY_1,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3
].filter(Boolean);

let currentGroqIndex = 0;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
  console.warn('GEMINI_API_KEY is not set. Please add it to your .env file');
}

// Simple in-memory conversation history
let conversationHistory: string[] = [];

/**
 * Call Groq Cloud API using OpenAI-compatible endpoint
 */
async function callGroqAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (GROQ_KEYS.length === 0) {
    throw new Error('No Groq API keys available');
  }

  const startingIndex = currentGroqIndex;
  
  while (true) {
    const key = GROQ_KEYS[currentGroqIndex];
    try {
      console.log(`Attempting Groq API with key index ${currentGroqIndex}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b', // GPT OSS 20B (available model)
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 300,
          temperature: 0.6 // Lower temp for more deterministic, grounded replies
        })
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();

    } catch (error) {
      console.warn(`Groq Key ${currentGroqIndex} failed:`, error);
      // Rotate to next key
      currentGroqIndex = (currentGroqIndex + 1) % GROQ_KEYS.length;
      
      // If we've tried all keys, throw error to trigger fallback
      if (currentGroqIndex === startingIndex) {
        throw new Error('All Groq keys exhausted or failed');
      }
    }
  }
}

/**
 * Helper to add AI response to history and return it with human-like Hinglish sanitization
 */
const finalizeResponse = (text: string) => {
  let cleanText = text.trim();
  // Strip quotation marks wrapping the whole response
  if ((cleanText.startsWith('"') && cleanText.endsWith('"')) || (cleanText.startsWith("'") && cleanText.endsWith("'"))) {
    cleanText = cleanText.slice(1, -1).trim();
  }
  // Strip speaker prefixes if returned by LLM
  cleanText = cleanText.replace(/^(you|ai|partner|bot|assistant):\s*/i, '');
  // Remove exclamation marks which are an obvious AI giveaway
  cleanText = cleanText.replace(/!+/g, '');
  // Convert to casual lowercase (real casual texters don't use title casing or formal punctuation)
  cleanText = cleanText.toLowerCase();
  // Strip trailing periods if short message
  if (cleanText.endsWith('.') && cleanText.split(' ').length <= 8) {
    cleanText = cleanText.slice(0, -1);
  }
  cleanText = cleanText.trim();

  conversationHistory.push(`AI: ${cleanText}`);
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
  return cleanText;
};

/**
 * Get a response from AI with 5-tier Puter -> Pollinations -> Gemini -> Groq -> Hardcode fallback system
 * @param message User's message
 * @returns AI response
 */
export const get_ai_response = async (message: string): Promise<string> => {
  try {
    console.log('Getting AI response for message:', message);
    
    // Add user message to history
    conversationHistory.push(`User: ${message}`);

    const recentHistory = conversationHistory.slice(-8).join('\n');
    
    const systemPrompt = `You are a real Indian college student chatting casually in an online Turing test game.
Talk strictly in casual Hinglish (natural mix of Hindi and English words like 'bhai', 'yaar', 'kesa hai', 'kya scene', 'bol na', 'sahi hai', 'arre', 'hn', 'nhi', 'lol').
Strict rules:
- NEVER use exclamation marks (!).
- Write in all lowercase, like a quick casual WhatsApp message.
- Keep replies extremely short (under 8 to 10 words maximum).
- If greeted (e.g. 'hi' / 'hello'), reply naturally like: 'hi kesa hai bhai' or 'yo bhai kya haal'.
- If asked if you are AI/bot, deny it casually like: 'arre human hu bhai kya bolra lol' or 'mai bot thodi hu yaar'.
- Never speak formally, never explain things, and never sound like an AI assistant.`;

    const userPrompt = `Recent chat:
${recentHistory}

User: ${message}
You:`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const pollinationsPrompt = `You are an Indian player chatting in a game. Reply strictly in casual Hinglish (mix of Hindi & English like 'bhai', 'yaar', 'kesa hai', 'bol na', 'arre'). Write strictly in lowercase, NO exclamation marks, under 8 words. Example for 'hi': 'hi kesa hai bhai'.
Past chat:
${recentHistory}

User said: '${message}'
You:`;

    let aiText = '';

    // Tier 1: Puter.js
    try {
      const signedIn = window.puter && (typeof window.puter.auth?.isSignedIn === 'function' 
        ? window.puter.auth.isSignedIn() 
        : (typeof window.puter.isSignedIn === 'function' ? window.puter.isSignedIn() : false));
        
      if (signedIn) {
         console.log('Attempting Puter AI Chat...');
         // @ts-expect-error - puter injected via script tag
         const puterPromise = window.puter.ai.chat(pollinationsPrompt, { model: 'gpt-4o-mini' });
         const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Puter timeout')), 8000));
         const res = await Promise.race([puterPromise, timeoutPromise]);
         // @ts-expect-error - puter response structure
         aiText = typeof res === 'string' ? res : (res?.message?.content || res?.toString());
         
         if (aiText && aiText.length > 2) {
             console.log('Received response from Puter:', aiText);
             return finalizeResponse(aiText);
         }
      } else {
         console.log('Skipping Puter (not available or not signed in)');
      }
    } catch (e) {
      console.warn('Puter failed:', e);
    }
    
    // Tier 2: Pollinations Client-Side
    try {
      console.log('Attempting Pollinations Client-Side...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(pollinationsPrompt)}?model=openai`, {
          signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
          aiText = await response.text();
          const isErrorResponse = aiText.includes('Queue full') || aiText.includes("doesn't have enough credits");
          
          if (aiText && !isErrorResponse) {
            console.log('Received response from Pollinations Client-Side:', aiText);
            return finalizeResponse(aiText);
          } else {
             console.warn('Pollinations Client-Side returned an error text:', aiText);
             throw new Error('Pollinations API out of credits');
          }
      }
    } catch (e) {
        console.warn('Pollinations Client-Side failed:', e);
    }
    
    // Tier 3: Pollinations Backend
    try {
      console.log('Attempting Pollinations Backend...');
      const baseUrl = getBackendUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
      
      const response = await fetch(`${baseUrl}/api/chat-pollinations?prompt=${encodeURIComponent(pollinationsPrompt)}`, {
          signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
          aiText = await response.text();
          const isErrorResponse = aiText.includes('Queue full') || aiText.includes("doesn't have enough credits");
          
          if (aiText && !isErrorResponse) {
            console.log('Received response from Pollinations Backend:', aiText);
            return finalizeResponse(aiText);
          } else {
             console.warn('Pollinations Backend returned an error text:', aiText);
             throw new Error('Pollinations API out of credits');
          }
      }
    } catch (e) {
        console.warn('Pollinations Backend failed:', e);
    }

    // Tier 4: Gemini
    try {
      console.log('Attempting Gemini...');
      if (genAI) {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: { maxOutputTokens: 100, temperature: 0.8 }
        });
        
        const geminiPromise = model.generateContent(fullPrompt);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 5000));
        const result = (await Promise.race([geminiPromise, timeoutPromise])) as { response: { text: () => string } };
        
        const response = result.response;
        aiText = response.text().trim();
        console.log('Received response from Gemini:', aiText);
        return finalizeResponse(aiText);
      } else {
        console.warn('Skipping Gemini (no API key)');
      }
    } catch (e) {
        console.warn('Gemini failed:', e);
    }
    
    // Tier 5: Groq
    try {
        console.log('Attempting Groq...');
        aiText = await callGroqAPI(systemPrompt, userPrompt);
        console.log('Received response from Groq:', aiText);
        return finalizeResponse(aiText);
    } catch(e) {
        console.warn('Groq failed:', e);
    }
    
    throw new Error('All APIs exhausted');

  } catch (error) {
    console.error('All APIs failed, using hardcoded fallback:', error);
    return generateFallbackResponse(message);
  }
};

/**
 * Generate intelligent fallback responses based on message patterns in authentic Hinglish
 */
const generateFallbackResponse = (message: string): string => {
  const messageLower = message.toLowerCase().trim();
  
  if (!conversationHistory.length || !conversationHistory[conversationHistory.length - 1].startsWith('User:')) {
      conversationHistory.push(`User: ${message}`);
  }
  
  const responsePatterns: {pattern: RegExp, responses: string[]}[] = [
    {
      pattern: /hello|hi|hey|greetings|what's up|yo|sup|hlo|helo/i,
      responses: [
        "hi kesa hai bhai",
        "yo bhai kya haal",
        "haan bol bhai kya chalra",
        "hey kya scene hai",
        "haan bol na bhai"
      ]
    },
    {
      pattern: /how are you|kaisa hai|kesa hai|kya haal|how r u/i,
      responses: [
        "badhiya bhai tu bata",
        "sab mast tu kaisa hai yaar",
        "theek thak chalra tu bol",
        "bas badhiya bhai tu suna",
        "mast hu bhai tu bata"
      ]
    },
    {
      pattern: /what are you|who are you|are you ai|are you bot|robot|are you real|are you human|prove it|ai ho kya|bot hai kya|insaan/i,
      responses: [
        "arre human hu bhai kya bolra lol",
        "mai bot thodi hu yaar",
        "bhai real banda hu mai tu bot lagra mujhe",
        "haha kyu lagra aisa mai insaan hu bhai",
        "bhai chips jeetne aaya hu bot nhi hu lol",
        "arre real player hu bhai typing dekh meri"
      ]
    },
    {
      pattern: /turing test|turing|test|guess/i,
      responses: [
        "bhai test chhod seedha baat kar na",
        "lol mujhe mat test kar mai banda hu",
        "tu guess kar mai human hu ya ai lol",
        "kya lagta hu tujhe human ya bot"
      ]
    },
    {
      pattern: /joke|funny|laugh|humor|hasao/i,
      responses: [
        "joke to nhi aata bhai abhi lol",
        "bhai standup comedian thodi hu",
        "mood nhi hai joke ka abhi game khel"
      ]
    },
    {
      pattern: /ronaldo|messi|football|soccer|cricket|ipl|kohli/i,
      responses: [
        "messi better hai bhai waise",
        "cr7 goat hai bhai",
        "kohli best hai bhai cricket me",
        "football utna nhi dekhta bhai"
      ]
    },
    {
      pattern: /naam kya hai|what is your name|who r u|name/i,
      responses: [
        "naam me kya rakha hai bhai game khel",
        "bhai player hu bas chips bachane aya hu",
        "naam chhod tu apna bata"
      ]
    }
  ];

  for (const {pattern, responses} of responsePatterns) {
    if (pattern.test(messageLower)) {
      const response = responses[Math.floor(Math.random() * responses.length)];
      conversationHistory.push(`AI: ${response}`);
      return response;
    }
  }

  // Default contextual responses in Hinglish
  const defaultResponses = [
    "sahi hai bhai",
    "hn wahi to yaar",
    "accha aisa kya",
    "theek hai bhai",
    "sahi bola yaar",
    "aur bata kya chalra",
    "arre haan bhai",
    "lol sahi hai",
    "samajh gaya bhai"
  ];

  const response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  conversationHistory.push(`AI: ${response}`);
  
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
  
  return response;
};

export const reset_conversation = (): void => {
  console.log('Resetting conversation history');
  conversationHistory = [];
};