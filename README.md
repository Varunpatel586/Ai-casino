# AI Casino 🎰🤖

An interactive casino-style game featuring AI image generation challenges. Test your ability to distinguish AI-generated images from real ones and compete across multiple rounds!

## 🎮 Game Features

- **Round 1**: AI Image Challenge - Compare original images with AI-generated ones based on your prompts
- **Round 2**: Reality Check - Identify real vs AI-generated videos
- **Round 3**: Turing Test - Chat with AI or human partners and guess which is which
- **Interactive Gameplay**: Place bets, generate custom AI images, and compete for the highest score
- **Modern UI**: Beautiful gradient design with smooth animations and responsive layout
- **Hugging Face Integration**: Uses state-of-the-art AI models for image generation
- **Multi-Key Support**: Automatic API key rotation when limits are reached

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Hugging Face API token(s) (for image generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-casino
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up API keys**
   - Copy `.bolt/config.json` and add your Hugging Face API token(s):
   ```json
   {
     "template": "bolt-vite-react-ts",
     "HF_TOKENS": [
       "hf_your_first_api_key_here",
       "hf_your_second_api_key_here"
     ],
     "VITE_SUPABASE_URL": "https://zspcmfvkezyohtfgovew.supabase.co",
     "VITE_SUPABASE_ANON_KEY": "your_supabase_key_here"
   }
   ```

4. **Get your Hugging Face API token**
   - Visit: https://huggingface.co/settings/tokens
   - Create a new token with read permissions
   - Add it to the `HF_TOKENS` array in `.bolt/config.json`

5. **Start the servers**

   **Terminal 1 - Start the Host Server:**
   ```bash
   npm run host
   ```
   - This starts the WebSocket server for human chat functionality
   - Access at: `http://localhost:5174/host`

   **Terminal 2 - Start the Game Client:**
   ```bash
   npm run dev
   ```
   - This starts the main game application
   - Access at: `http://localhost:5173`

6. **Open your browser**
   - Navigate to `http://localhost:5173` to play the game
   - Use `http://localhost:5174/host` for the host interface (for Round 3 human chat)

## 🎯 How to Play

### Round 1: AI Image Challenge
1. **View an original image** and understand what you see
2. **Write a creative prompt** describing what you want the AI to generate (60 seconds)
3. **Watch the AI generate** an image based on your prompt
4. **Compare the results** - How well did the AI match your expectations?
5. **Continue through all images** to complete the round

### Round 2: Reality Check
1. **Watch videos** and identify which are real vs AI-generated
2. **Race against time** - Guess as many as possible in 60 seconds total
3. **Score based on accuracy** - Correct identifications earn points

### Round 3: Turing Test
1. **Chat with an unknown partner** (AI or human)
2. **Send messages** within the time limit
3. **Guess whether you were talking to AI or human**
4. **Earn points** for correct guesses

### Development Testing
- **Skip Round 1**: Look for the "Skip Round 1 (Dev)" button in the Round 1 intro screen (below the main "Start Round 1" button)
- **Quick Testing**: This allows you to bypass image generation and jump directly to results for faster development testing

## 🛠️ Available Scripts

- `npm run dev` - Start development server (game client)
- `npm run host` - Start WebSocket host server (for human chat)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking

## 🏗️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Hugging Face API** - AI image generation
- **WebSocket** - Real-time communication for human chat
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Round1.tsx       # Main game round with AI image generation
│   ├── Round2.tsx       # Video identification round
│   ├── Round3.tsx       # Turing test chat round
│   ├── BettingPanel.tsx # Betting interface
│   ├── BonusRounds.tsx  # Bonus mini-games
│   └── chat/           # Chat components
├── services/            # API services
│   ├── huggingFaceService.ts # Hugging Face API integration (multi-key)
│   └── network.ts       # WebSocket communication
├── types/               # TypeScript type definitions
├── gameData.ts         # Game configuration and data
└── host/               # Host interface components
```

## 🔧 Configuration

The game uses `.bolt/config.json` for configuration:

```json
{
  "template": "bolt-vite-react-ts",
  "HF_TOKENS": [
    "hf_your_first_api_key_here",
    "hf_your_second_api_key_here"
  ],
  "VITE_SUPABASE_URL": "your_supabase_url",
  "VITE_SUPABASE_ANON_KEY": "your_supabase_anon_key"
}
```

### Multi-Key API System
- **Automatic Fallback**: When one API key hits rate limits, the system automatically switches to the next available key
- **Easy Scaling**: Add more keys to the `HF_TOKENS` array to handle increased usage
- **Development Support**: Can add keys programmatically during development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---
