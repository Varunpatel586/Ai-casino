export const round1Images = [
  {
    id: 1,
    theme: 'A futuristic city at sunset with flying cars',
    referencePrompt: 'futuristic city sunset flying cars neon lights cyberpunk',
  },
  {
    id: 2,
    theme: 'A serene mountain lake with reflections',
    referencePrompt: 'serene mountain lake crystal clear reflections peaceful nature',
  },
  {
    id: 3,
    theme: 'A magical forest with glowing mushrooms',
    referencePrompt: 'magical enchanted forest glowing bioluminescent mushrooms fantasy',
  },
  {
    id: 4,
    theme: 'A steampunk robot in a Victorian workshop',
    referencePrompt: 'steampunk robot victorian workshop brass gears vintage',
  },
  {
    id: 5,
    theme: 'An underwater coral reef with colorful fish',
    referencePrompt: 'underwater coral reef colorful tropical fish ocean life',
  },
];

export const round2Videos = [
  {
    id: 1,
    title: 'Person walking in park',
    isAI: false,
    thumbnail: 'https://images.pexels.com/photos/1054289/pexels-photo-1054289.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2,
    title: 'Dancing animation',
    isAI: true,
    thumbnail: 'https://images.pexels.com/photos/416676/pexels-photo-416676.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3,
    title: 'Nature landscape',
    isAI: false,
    thumbnail: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 4,
    title: 'Abstract motion',
    isAI: true,
    thumbnail: 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 5,
    title: 'Street interview',
    isAI: false,
    thumbnail: 'https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const round3Conversations = [
  {
    id: 1,
    question: "What's your favorite thing about rainy days?",
    responses: {
      option1: "I love the sound of rain on windows. It's so cozy and makes me want to curl up with a book and hot tea.",
      option2: "Rainy days provide an optimal environment for indoor activities and can be quite refreshing for the ecosystem.",
    },
    correctAnswer: 'option1',
  },
  {
    id: 2,
    question: "If you could travel anywhere right now, where would you go?",
    responses: {
      option1: "Based on current travel trends and popular destinations, locations such as Paris, Tokyo, or New York offer diverse experiences.",
      option2: "Oh man, I'd love to go to New Zealand! The landscapes look absolutely breathtaking, plus I'm a huge LOTR nerd.",
    },
    correctAnswer: 'option2',
  },
  {
    id: 3,
    question: "What makes you laugh?",
    responses: {
      option1: "Humor can be derived from various sources including wordplay, situational comedy, and unexpected juxtapositions.",
      option2: "My cat does this thing where she misjudges jumps and slides off furniture. Gets me every time, even though I feel bad laughing!",
    },
    correctAnswer: 'option2',
  },
  {
    id: 4,
    question: "How do you deal with stress?",
    responses: {
      option1: "I usually go for a run or bake something. There's something therapeutic about kneading dough when you're anxious.",
      option2: "Stress management techniques include exercise, meditation, proper sleep hygiene, and maintaining a balanced lifestyle.",
    },
    correctAnswer: 'option1',
  },
  {
    id: 5,
    question: "What's the best advice you've ever received?",
    responses: {
      option1: "Valuable advice often includes principles like perseverance, maintaining a positive mindset, and continuous learning.",
      option2: "My grandma told me 'done is better than perfect.' Changed how I approach everything. I used to overthink stuff way too much.",
    },
    correctAnswer: 'option2',
  },
];

export const wheelOptions = [
  { label: 'Double Chips!', multiplier: 2, color: '#FFD700' },
  { label: 'Lose $10', multiplier: -10, color: '#FF4444' },
  { label: '+50% Bet', multiplier: 1.5, color: '#4CAF50' },
  { label: 'AI Hint', multiplier: 0, color: '#2196F3', special: 'hint' },
  { label: '+$25', multiplier: 25, color: '#9C27B0' },
  { label: 'Lose $15', multiplier: -15, color: '#FF4444' },
  { label: 'Triple Chips!', multiplier: 3, color: '#FFD700' },
  { label: 'Nothing', multiplier: 0, color: '#757575' },
];

export const dataDashPatterns = [
  { sequence: '101_101', answer: '0', difficulty: 'easy' },
  { sequence: '110_110', answer: '1', difficulty: 'easy' },
  { sequence: '10110_10', answer: '1', difficulty: 'medium' },
  { sequence: '11001_001', answer: '1', difficulty: 'medium' },
  { sequence: '101101_01101', answer: '1', difficulty: 'hard' },
];
