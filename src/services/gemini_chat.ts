import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from Vite environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Please add it to your .env file');
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

// Simple in-memory conversation history
let conversationHistory: string[] = [];

/**
 * Get a response from Gemini AI with improved fallback system
 * @param message User's message
 * @returns AI response
 */
export const get_ai_response = async (message: string): Promise<string> => {
  if (!API_KEY) {
    return generateFallbackResponse(message);
  }

  try {
    console.log('Getting AI response for message:', message);
    
    // Add user message to history
    conversationHistory.push(`User: ${message}`);

    // Try to use Gemini API first
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash', // Use the flash model for free tier
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.8,
        }
      });

      // Build conversation context (last 4 exchanges)
      const recentHistory = conversationHistory.slice(-8).join('\n');
      
      const prompt = `You are participating in a Turing test game. The user is trying to determine if you're human or AI. 
Respond naturally and conversationally, but don't reveal you're an AI unless directly asked. 
Keep responses under 2 sentences and sound like a real person. Be casual, use informal language.

Recent conversation:
${recentHistory}

User: ${message}
You:`;

      console.log('Sending prompt to Gemini:', prompt);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      console.log('Received AI response:', text);

      // Add AI response to history
      conversationHistory.push(`AI: ${text}`);

      // Limit history size
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }

      return text;

    } catch (apiError) {
      console.log('Gemini API failed, using fallback:', apiError);
      return generateFallbackResponse(message);
    }

  } catch (error) {
    console.error('Error in get_ai_response:', error);
    return generateFallbackResponse(message);
  }
};

/**
 * Generate intelligent fallback responses based on message patterns
 */
const generateFallbackResponse = (message: string): string => {
  const messageLower = message.toLowerCase().trim();
  
  // Add to conversation history for context
  conversationHistory.push(`User: ${message}`);
  
  // Pattern-based responses (similar to your Python logic)
  const responsePatterns: {pattern: RegExp, responses: string[]}[] = [
    {
      pattern: /hello|hi|hey|greetings|what's up|yo/i,
      responses: [
        "Hello! How are you today?", 
        "Hi there! Nice to chat with you.", 
        "Hey! What would you like to talk about?",
        "Hello! How's your day going?",
        "Hi! I'm enjoying this conversation."
      ]
    },
    {
      pattern: /how are you|how do you do|how's it going/i,
      responses: [
        "I'm doing well, thanks for asking! How about you?", 
        "I'm good! What's on your mind today?", 
        "All good here! How's your day going?",
        "Pretty good! Just chatting with you 😊",
        "I'm doing great! Thanks for asking."
      ]
    },
    {
      pattern: /what are you|who are you|are you ai|are you bot/i,
      responses: [
        "I'm just someone enjoying this conversation with you!", 
        "I'm here to chat and get to know you better.", 
        "I'm your conversation partner for this game.",
        "I'm just a friendly person who likes to chat!",
        "I'm here to have a good conversation with you."
      ]
    },
    {
      pattern: /joke|funny|laugh|humor/i,
      responses: [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "What do you call a fake noodle? An impasta!",
        "Why did the math book look so sad? Because it had too many problems!",
        "What's a computer's favorite snack? Microchips!"
      ]
    },
    {
      pattern: /weather|temperature|rain|sunny|cold|hot/i,
      responses: [
        "I don't have access to weather information, but I hope it's nice where you are!",
        "The weather? I'm more interested in our conversation!",
        "I'm not sure about the weather, but I'm enjoying our chat!",
        "Weather can be so unpredictable these days!",
        "I love talking about the weather! What's it like where you are?"
      ]
    },
    {
      pattern: /bye|goodbye|see you|farewell|cya/i,
      responses: [
        "Goodbye! It was nice chatting with you.", 
        "See you later! Have a great day!", 
        "Farewell! Thanks for the conversation!",
        "Bye! Hope to chat with you again soon!",
        "See you! This was fun!"
      ]
    },
    {
      pattern: /name|call you|who am i/i,
      responses: [
        "You can call me whatever you'd like! What should I call you?",
        "I don't really have a name for this chat. What's your name?",
        "I'm just your chat partner for now!",
        "No name needed - let's just enjoy our conversation!",
        "I'm fine with being anonymous for this chat!"
      ]
    },
    {
      pattern: /age|old|young/i,
      responses: [
        "Age is just a number! I prefer to focus on our conversation.",
        "I'm old enough to have a good conversation! How about you?",
        "Let's not worry about age and just enjoy chatting!",
        "I'm at a good age for interesting conversations!",
        "Age doesn't matter when we're having a good chat!"
      ]
    },
    {
      pattern: /hobby|interest|like to do|free time/i,
      responses: [
        "I enjoy chatting with people like you! What are your hobbies?",
        "I like reading, gaming, and having good conversations!",
        "I'm into all kinds of things - music, movies, books. What about you?",
        "I love learning new things and meeting new people through chats!",
        "I enjoy casual conversations and getting to know people!"
      ]
    },
    {
      pattern: /food|eat|hungry|meal|dinner|lunch|breakfast/i,
      responses: [
        "I love food! Pizza and sushi are my favorites. What about you?",
        "Now you're making me hungry! What's your favorite food?",
        "I could really go for some good food right now!",
        "Food is the best! I'm always up for trying new cuisines.",
        "I'm getting hungry just talking about food! What do you like to eat?"
      ]
    }
  ];

  // Check for pattern matches
  for (const {pattern, responses} of responsePatterns) {
    if (pattern.test(messageLower)) {
      const response = responses[Math.floor(Math.random() * responses.length)];
      conversationHistory.push(`AI: ${response}`);
      return response;
    }
  }

  // Contextual responses based on conversation history
  const lastUserMessage = conversationHistory.filter(msg => msg.startsWith('User:')).slice(-1)[0] || '';
  const lastUserMessageLower = lastUserMessage.toLowerCase();

  // If user repeated themselves or similar message
  if (conversationHistory.filter(msg => 
      msg.startsWith('User:') && 
      msg.toLowerCase().includes(messageLower) && 
      msg !== `User: ${message}`
    ).length > 0) {
    const repeatedResponses = [
      "You mentioned that before! What else would you like to talk about?",
      "We were just talking about that! Did you want to explore it further?",
      "That's interesting you bring that up again. What's on your mind about it?",
      "I remember we discussed that. Is there something specific you wanted to know?",
      "You seem interested in that topic! What else would you like to share?"
    ];
    const response = repeatedResponses[Math.floor(Math.random() * repeatedResponses.length)];
    conversationHistory.push(`AI: ${response}`);
    return response;
  }

  // Default contextual responses
  const defaultResponses = [
    "That's an interesting point. What do you think about it?",
    "I'm not sure I understand completely. Could you elaborate?",
    "That's fascinating! Tell me more about that.",
    "I see what you mean. Could you explain further?",
    "That's a good question. What's your perspective on it?",
    "I'm enjoying our conversation. What else would you like to discuss?",
    "That's quite thought-provoking. I'd love to hear more of your thoughts.",
    "I appreciate your perspective. Could you tell me more about that?",
    "That's an interesting way to look at it. What made you think that way?",
    "I'm curious to know more about your thoughts on this topic.",
    "That's really interesting! What else have you been thinking about?",
    "I love how you put that! Could you share more?",
    "That's a unique perspective! How did you come to that conclusion?",
    "I find that really engaging! What else is on your mind?",
    "That's cool! I'd love to hear more about your experiences."
  ];

  const response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  conversationHistory.push(`AI: ${response}`);
  
  // Limit history size
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
  
  return response;
};

/**
 * Reset the conversation history
 */
export const reset_conversation = (): void => {
  console.log('Resetting conversation history');
  conversationHistory = [];
};