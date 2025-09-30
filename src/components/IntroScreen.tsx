import { Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
        minHeight: '100vh'
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(88, 28, 135, 0.5) 50%, rgba(15, 23, 42, 0.5) 100%)',
          backdropFilter: 'blur(4px)'
        }}
      ></div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div className="mb-8 animate-bounce">
          <div className="inline-flex items-center gap-4 text-8xl font-black">
            <span className="text-white text-8xl font-black drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
              AI
            </span>
            <span className="text-6xl">🎰</span>
            <span className="text-white text-8xl font-black drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">
              CASINO
            </span>
          </div>
        </div>

        <div className="mb-12 space-y-4">
          <p className="text-2xl text-white font-light tracking-wide animate-fade-in">
            Where Human Instinct Meets Artificial Intelligence
          </p>
          <p className="text-xl text-white font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
            High Stakes • Perception • Creativity • Chance
          </p>
        </div>

        <div className="mb-8 flex justify-center gap-8 text-white/70">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">$50</div>
            <div className="text-sm">Starting Chips</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">3</div>
            <div className="text-sm">Main Rounds</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-400">40-45</div>
            <div className="text-sm">Minutes</div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="group relative px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 rounded-full overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_50px_rgba(255,215,0,0.8)] animate-pulse"
        >
          <span className="relative z-10">ENTER THE CASINO</span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        <div className="mt-8 text-sm text-white/50">
          <p>Can you outsmart the machine?</p>
        </div>
      </div>
    </div>
  );
}
