import { Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            <Sparkles className="text-yellow-400 opacity-30" size={16} />
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div className="mb-8 animate-bounce">
          <div className="inline-flex items-center gap-4 text-8xl font-black">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
              AI
            </span>
            <span className="text-6xl">🎰</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">
              CASINO
            </span>
          </div>
        </div>

        <div className="mb-12 space-y-4">
          <p className="text-2xl text-white font-light tracking-wide animate-fade-in">
            Where Human Instinct Meets Artificial Intelligence
          </p>
          <p className="text-xl text-cyan-300 font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
