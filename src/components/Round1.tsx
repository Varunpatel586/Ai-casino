import { useState, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, Send } from 'lucide-react';
import { BetAmount } from '../types';
import BettingPanel from './BettingPanel';
import { generateImage, GeneratedImage } from '../services/huggingFaceService';
import { compareImages, SimilarityResult } from '../services/imageSimilarity';

interface Round1Props {
  currentChips: number;
  onComplete: (net: number) => void;
}

interface Appraisal {
  similarity: number;
  multiplier: number;
  net: number;
  method: SimilarityResult['method'];
}

// Original images for the challenge
const originalImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop',
    description: 'A beautiful landscape',
    keywords: ['landscape', 'mountain', 'lake', 'sunset', 'water', 'clouds', 'nature', 'beautiful', 'scenic']
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop',
    description: 'A cute animal',
    keywords: ['animal', 'fox', 'wildlife', 'cute', 'nature', 'orange', 'furry', 'forest', 'snow']
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&auto=format&fit=crop',
    description: 'A scenic view',
    keywords: ['scenic', 'view', 'field', 'green', 'grass', 'trees', 'sky', 'summer', 'meadow']
  },
  {
    id: 4,
    url: '/images/round1-img4.jpg',
    description: 'A beautiful ocean view with trees',
    keywords: ['blue', 'ocean', 'green', 'trees', 'clear', 'sky', 'white', 'clouds', 'sea', 'water', 'island']
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=500&auto=format&fit=crop',
    description: 'A peaceful setting',
    keywords: ['red', 'poppies', 'flower', 'field', 'green', 'grass', 'nature', 'sky', 'summer', 'meadow']
  }
];

export default function Round1({ currentChips, onComplete }: Round1Props) {
  const [phase, setPhase] = useState<'intro' | 'betting' | 'playing' | 'prompt' | 'generating' | 'comparison' | 'results'>('intro');
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [currentOriginalImage, setCurrentOriginalImage] = useState(originalImages[0]);
  const [promptTimeLeft, setPromptTimeLeft] = useState(60); // 1 minute for prompt phase
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isAppraising, setIsAppraising] = useState(false);

  // Timer for prompt phase
  useEffect(() => {
    if (phase === 'prompt' && promptTimeLeft > 0) {
      const timer = setInterval(() => {
        setPromptTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up - auto-submit with empty prompt or move to next phase
            if (userPrompt.trim()) {
              handlePromptSubmit();
            } else {
              handleNextRound();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, promptTimeLeft, userPrompt]);

  const handleBet = (amount: BetAmount) => {
    const bet = amount === 'ALL_IN' ? currentChips : amount;
    setCurrentBet(bet);
    setPhase('playing');
  };

  const handleImageSelect = () => {
    setPhase('prompt');
    setPromptTimeLeft(60); // Reset timer when entering prompt phase
  };

  const handlePromptSubmit = async () => {
    if (!userPrompt.trim()) return;

    setPhase('generating');

    try {
      const image = await generateImage(userPrompt, currentOriginalImage.id);
      setGeneratedImage(image);

      // Appraise the generated canvas against the original target artwork.
      setIsAppraising(true);
      const result = await compareImages(currentOriginalImage.url, image.data);
      setIsAppraising(false);

      const net = Math.round(currentBet * (result.multiplier - 1));
      setAppraisals((prev) => {
        const next = [...prev];
        next[currentImageIndex] = {
          similarity: result.similarity,
          multiplier: result.multiplier,
          net,
          method: result.method,
        };
        return next;
      });

      setPhase('comparison');
    } catch (error) {
      console.error('Failed to generate image:', error);
      setIsAppraising(false);
      // Move to comparison with a null generated image so the round can continue.
      setPhase('comparison');
    }
  };

  const handleNextRound = () => {
    if (currentImageIndex < originalImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setCurrentOriginalImage(originalImages[currentImageIndex + 1]);
      setUserPrompt('');
      setGeneratedImage(null);
      setPhase('playing');
    } else {
      setPhase('results');
    }
  };

  const handleFinishRound = () => {
    const netTotal = appraisals.reduce((sum, appraisal) => sum + (appraisal?.net ?? 0), 0);
    onComplete(netTotal);
  };

  if (phase === 'intro') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden select-none">
        <div className="max-w-xl w-full bg-[#12151E] border border-[#232938] rounded-2xl p-6 sm:p-8 shadow-2xl text-center my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-[#2B354D] text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <ImageIcon size={14} />
            <span>Event II • Visual Turing Challenge</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight uppercase mb-3">
            The Prompt Gambit
          </h1>

          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            You will be shown 5 target images. Study each image, then write a descriptive prompt to recreate it using neural generation. Higher keyword accuracy yields higher payouts.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8 text-left">
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Artworks</span>
              <span className="text-2xl font-mono font-black text-white">5 Total</span>
            </div>
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Prompt Window</span>
              <span className="text-2xl font-mono font-black text-amber-400">60 Sec</span>
            </div>
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Win Rate</span>
              <span className="text-2xl font-mono font-black text-emerald-400">+1x / Pic</span>
            </div>
          </div>

          <button
            onClick={() => setPhase('betting')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-lg uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>PLACE WAGER &amp; START</span>
          </button>

          {/* Development skip button for testing transitions */}
          <div className="mt-4">
            <button
              onClick={() => {
                handleFinishRound();
              }}
              className="text-xs font-mono text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Skip Round (Dev Test)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'betting') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden select-none">
        <div className="max-w-2xl w-full my-auto">
          <BettingPanel 
            currentChips={currentChips} 
            onBet={handleBet} 
            minBet={10}
            maxBet={Math.min(100, currentChips)}
          />
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg p-3 sm:p-5 flex flex-col justify-between max-w-4xl mx-auto overflow-hidden select-none">
        <div className="w-full">
          {/* Header Progress */}
          <div className="flex justify-between items-center mb-6 bg-[#12151E] border border-[#232938] rounded-xl px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400">
              <span className="text-amber-400 font-bold">Art Specimen</span>
              <span>•</span>
              <span className="text-white font-bold">{currentImageIndex + 1} of {originalImages.length}</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Active Wager: <span className="text-amber-400 font-bold">${currentBet}</span>
            </div>
          </div>

          {/* Exhibition Easel Card */}
          <div className="bg-[#12151E] border border-[#232938] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                Inspect The Original Image
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Study colors, subject matter, composition, and atmosphere. You will describe it from memory.
              </p>
            </div>

            <div className="aspect-video bg-black/60 rounded-xl overflow-hidden mb-6 border border-[#2E374D] shadow-inner">
              <img
                src={currentOriginalImage.url}
                alt="Target specimen"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleImageSelect}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                <span>I HAVE MEMORIZED THIS ARTWORK</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'prompt') {
    const minutes = Math.floor(promptTimeLeft / 60);
    const seconds = promptTimeLeft % 60;
    const isTimeRunningOut = promptTimeLeft <= 10;

    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg p-3 sm:p-5 flex flex-col justify-between max-w-4xl mx-auto overflow-hidden select-none">
        <div className="w-full">
          {/* Top Bar with Digital Countdown */}
          <div className="flex justify-between items-center mb-6 bg-[#12151E] border border-[#232938] rounded-xl px-5 py-3">
            <span className="text-xs font-mono uppercase text-slate-400">
              Challenge <span className="text-white font-bold">{currentImageIndex + 1}/{originalImages.length}</span>
            </span>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-sm font-bold border ${
              isTimeRunningOut 
                ? 'bg-rose-500/10 border-rose-500 text-rose-400 animate-pulse' 
                : 'bg-[#181D2A] border-[#2E374D] text-amber-400'
            }`}>
              <span className="text-xs uppercase text-slate-400">Time Left:</span>
              <span className="text-base tracking-wider">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Prompt Terminal Box */}
          <div className="bg-[#12151E] border border-[#232938] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                Synthesize Your Prompt
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Provide detailed descriptors for the AI to recreate the original canvas.
              </p>
            </div>

            <div className="mb-6">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe lighting, subject, landscape, atmosphere... (e.g. A serene mountain lake at sunset with crystal clear reflections and pine trees)"
                className="w-full h-36 p-4 bg-[#181D2A] border border-[#2E374D] focus:border-amber-400 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all resize-none"
                autoFocus
              />
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mt-2">
                <span>Accurate keywords match higher payout points.</span>
                <span>{userPrompt.length} chars</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handlePromptSubmit}
                disabled={!userPrompt.trim()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-display font-black text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                <Send size={18} />
                <span>GENERATE AI CANVAS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'generating') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden select-none">
        <div className="max-w-md w-full bg-[#12151E] border border-[#232938] rounded-2xl p-6 sm:p-8 text-center shadow-2xl my-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#181D2A] border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-amber-400 animate-spin" size={32} />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
            Synthesizing Canvas
          </h2>
          <p className="text-slate-400 text-sm font-mono mb-4">
            {isAppraising
              ? 'Appraising similarity against the target specimen...'
              : 'Routing through AI generation cascade...'}
          </p>
          <div className="w-full bg-[#181D2A] rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-400 h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'comparison') {
    const appraisal = appraisals[currentImageIndex];

    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg p-3 sm:p-5 flex flex-col justify-between max-w-4xl mx-auto overflow-hidden select-none">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-[#2B354D] text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
              <span>Specimen Appraisal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
              Compare Canvases
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Verify how closely your prompt directed the AI to match the original piece.
            </p>
          </div>

          {/* Appraisal Result */}
          {appraisal && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mb-6 bg-[#12151E] border border-amber-500/30 rounded-xl px-5 py-4">
              <div className="text-center">
                <span className="text-[11px] font-mono uppercase text-slate-500 block">Similarity</span>
                <span className="text-2xl font-mono font-black text-emerald-400">{appraisal.similarity}%</span>
              </div>
              <div className="w-px h-10 bg-[#232938] hidden sm:block" />
              <div className="text-center">
                <span className="text-[11px] font-mono uppercase text-slate-500 block">Multiplier</span>
                <span className="text-2xl font-mono font-black text-amber-400">{appraisal.multiplier}x</span>
              </div>
              <div className="w-px h-10 bg-[#232938] hidden sm:block" />
              <div className="text-center">
                <span className="text-[11px] font-mono uppercase text-slate-500 block">Payout</span>
                <span className={`text-2xl font-mono font-black ${appraisal.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {appraisal.net >= 0 ? `+$${appraisal.net}` : `-$${Math.abs(appraisal.net)}`}
                </span>
              </div>
            </div>
          )}

          {/* Dual Gallery Easels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Original */}
            <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Target Specimen</span>
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Original</span>
              </div>
              <div className="aspect-video bg-black/60 rounded-lg overflow-hidden mb-3 border border-[#283248]">
                <img
                  src={currentOriginalImage.url}
                  alt="Original image"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-mono text-slate-400 truncate">{currentOriginalImage.description}</p>
            </div>

            {/* AI Generated */}
            <div className="bg-[#12151E] border border-[#232938] rounded-xl p-5 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Generated Specimen</span>
                <span className="text-[11px] font-mono text-amber-400 uppercase">AI Output</span>
              </div>
              <div className="aspect-video bg-black/60 rounded-lg overflow-hidden mb-3 border border-[#283248] flex items-center justify-center">
                {generatedImage ? (
                  <img
                    src={generatedImage.data}
                    alt="AI generated image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 font-mono text-xs">
                    Image generation unavailable
                  </div>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 truncate">Prompt: "{userPrompt}"</p>
            </div>
          </div>

          {/* Next Button */}
          <div className="text-center">
            <button
              onClick={handleNextRound}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
            >
              <span>{currentImageIndex < originalImages.length - 1 ? 'NEXT ARTWORK' : 'FINALIZE ROUND 2'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const netTotal = appraisals.reduce((sum, appraisal) => sum + (appraisal?.net ?? 0), 0);
    const scoredCount = appraisals.filter(Boolean).length;

    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden select-none">
        <div className="max-w-md w-full bg-[#12151E] border border-[#232938] rounded-2xl p-6 sm:p-8 text-center shadow-2xl my-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#181D2A] border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={28} />
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
            Round 2 Complete
          </div>
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-6">
            Valuation Settled
          </h2>

          <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-slate-400">Artworks Appraised:</span>
              <span className="text-sm font-mono text-white font-bold">{scoredCount} / {originalImages.length}</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {originalImages.map((image, idx) => {
                const appraisal = appraisals[idx];
                return (
                  <div
                    key={image.id}
                    className="flex items-center justify-between bg-[#12151E] rounded-lg px-2.5 py-1.5 border border-[#232938] text-[11px] font-mono"
                  >
                    <span className="text-slate-300 truncate max-w-[110px]">Art #{idx + 1}</span>
                    <span className="text-slate-400">{appraisal ? `${appraisal.similarity}%` : '—'}</span>
                    <span className="text-amber-400 font-bold">{appraisal ? `${appraisal.multiplier}x` : '—'}</span>
                    <span className={appraisal && appraisal.net < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {appraisal ? (appraisal.net >= 0 ? `+$${appraisal.net}` : `-$${Math.abs(appraisal.net)}`) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 mt-3 border-t border-[#232938]">
              <span className="text-xs font-mono text-slate-400">Total Payout:</span>
              <span className={`text-xl font-mono font-black ${netTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netTotal >= 0 ? `+$${netTotal}` : `-$${Math.abs(netTotal)}`}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinishRound}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>COLLECT WINNINGS &amp; ENTER VAULT</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
