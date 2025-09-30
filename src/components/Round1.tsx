import { useState, useEffect } from 'react';
import { Image, Sparkles, Clock } from 'lucide-react';
import { round1Images } from '../gameData';
import { BetAmount } from '../types';
import BettingPanel from './BettingPanel';

interface Round1Props {
  currentChips: number;
  onComplete: (score: number, bet: number) => void;
}

export default function Round1({ currentChips, onComplete }: Round1Props) {
  const [phase, setPhase] = useState<'intro' | 'betting' | 'playing' | 'results'>('intro');
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [scores, setScores] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, timeLeft]);

  const handleBet = (amount: BetAmount) => {
    const bet = amount === 'ALL_IN' ? currentChips : amount;
    setCurrentBet(bet);
    setPhase('playing');
  };

  const calculateSimilarity = (userPrompt: string, referencePrompt: string): number => {
    const userWords = userPrompt.toLowerCase().split(/\s+/);
    const refWords = referencePrompt.toLowerCase().split(/\s+/);
    const matches = userWords.filter((word) => refWords.includes(word)).length;
    const similarity = (matches / refWords.length) * 100;
    return Math.min(Math.round(similarity), 100);
  };

  const handleSubmitPrompt = () => {
    if (!userPrompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const currentImage = round1Images[currentImageIndex];
      const score = calculateSimilarity(userPrompt, currentImage.referencePrompt);
      setScores([...scores, score]);
      setIsGenerating(false);
      setUserPrompt('');

      if (currentImageIndex < round1Images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      } else {
        setPhase('results');
      }
    }, 2000);
  };

  const handleFinishRound = () => {
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const correctCount = scores.filter((s) => s >= 60).length;
    onComplete(correctCount, currentBet);
  };

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-3xl text-center">
          <div className="mb-8">
            <Image className="text-yellow-400 mx-auto mb-4" size={64} />
            <h1 className="text-6xl font-black text-white mb-4">ROUND 1</h1>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
              The Prompt Gambit
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
            <p className="text-xl text-white/80 mb-4">
              We'll show you 5 themed images. Your challenge: craft the perfect prompt to recreate each image using AI.
            </p>
            <p className="text-lg text-cyan-400">
              The closer your prompt matches our reference, the higher your score!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 text-white">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl font-bold text-yellow-400">5</div>
              <div className="text-sm">Images</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl font-bold text-cyan-400">2</div>
              <div className="text-sm">Minutes Each</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl font-bold text-pink-400">60%+</div>
              <div className="text-sm">To Win</div>
            </div>
          </div>

          <button
            onClick={() => setPhase('betting')}
            className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-yellow-500 to-pink-500 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,215,0,0.6)]"
          >
            CONTINUE
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'betting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 pt-24">
        <div className="max-w-2xl w-full">
          <h2 className="text-4xl font-black text-white text-center mb-8">Place Your Bet</h2>
          <BettingPanel currentChips={currentChips} onBet={handleBet} />
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    const currentImage = round1Images[currentImageIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="text-white">
              <span className="text-2xl font-bold">
                Image {currentImageIndex + 1} / {round1Images.length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2">
              <Clock className="text-cyan-400" size={20} />
              <span className="text-white font-bold text-xl">{timeLeft}s</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-white mb-4">Theme:</h3>
            <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 font-bold">
              {currentImage.theme}
            </p>
          </div>

          {scores[currentImageIndex] !== undefined ? (
            <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/30 rounded-2xl p-8 text-center">
              <div className="text-6xl font-black text-green-400 mb-4">{scores[currentImageIndex]}%</div>
              <p className="text-white text-xl">
                {scores[currentImageIndex] >= 60 ? '✓ Great match!' : '✗ Could be better'}
              </p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <label className="block text-white text-xl font-bold mb-4">Your AI Prompt:</label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe the image in detail... be creative and specific!"
                className="w-full h-32 px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 resize-none"
                disabled={isGenerating}
              />

              <button
                onClick={handleSubmitPrompt}
                disabled={!userPrompt.trim() || isGenerating}
                className="mt-4 w-full px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="animate-spin" size={24} />
                    Generating...
                  </>
                ) : (
                  'Generate & Score'
                )}
              </button>
            </div>
          )}

          <div className="mt-6 flex gap-2 justify-center">
            {round1Images.map((_, idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full ${
                  idx < currentImageIndex
                    ? 'bg-green-400'
                    : idx === currentImageIndex
                    ? 'bg-yellow-400 animate-pulse'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const correctCount = scores.filter((s) => s >= 60).length;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-5xl font-black text-white mb-8">Round 1 Complete!</h2>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-5xl font-black text-green-400 mb-2">{correctCount}/5</div>
                <div className="text-white/60">Correct Matches</div>
              </div>
              <div>
                <div className="text-5xl font-black text-cyan-400 mb-2">{avgScore}%</div>
                <div className="text-white/60">Average Score</div>
              </div>
            </div>

            <div className="space-y-2">
              {scores.map((score, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-black/30 rounded-lg p-3">
                  <span className="text-white font-bold">Image {idx + 1}:</span>
                  <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-white font-bold">{score}%</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleFinishRound}
            className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,0,0.6)]"
          >
            CONTINUE TO ROUND 2
          </button>
        </div>
      </div>
    );
  }

  return null;
}
