import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Sparkles, Send } from 'lucide-react';
import { BetAmount } from '../types';
import BettingPanel from './BettingPanel';
import { generateImage, GeneratedImage } from '../services/huggingFaceService';
import { compareImages, SimilarityResult } from '../services/imageSimilarity';

interface Round1Props {
  currentChips: number;
  onComplete: (net: number) => void;
  onBackToBonus?: () => void;
  onChipUpdate?: (chips: number) => void;
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

export default function Round1({ currentChips, onComplete, onBackToBonus, onChipUpdate: _onChipUpdate }: Round1Props) {
  const [phase, setPhase] = useState<'intro' | 'betting' | 'playing' | 'prompt' | 'generating' | 'comparison' | 'results'>('intro');
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [currentOriginalImage, setCurrentOriginalImage] = useState(originalImages[0]);
  const [promptTimeLeft, setPromptTimeLeft] = useState(60); // 1 minute for prompt phase
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isAppraising, setIsAppraising] = useState(false);

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

  const userPromptRef = useRef(userPrompt);
  userPromptRef.current = userPrompt;

  const handlePromptSubmitRef = useRef(handlePromptSubmit);
  handlePromptSubmitRef.current = handlePromptSubmit;

  const handleNextRoundRef = useRef(handleNextRound);
  handleNextRoundRef.current = handleNextRound;

  // Timer for prompt phase - runs continuously regardless of user typing
  useEffect(() => {
    if (phase !== 'prompt') return;

    const timer = setInterval(() => {
      setPromptTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time's up - auto-submit with prompt or move to next phase
          if (userPromptRef.current.trim()) {
            handlePromptSubmitRef.current();
          } else {
            handleNextRoundRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const handleFinishRound = () => {
    const netTotal = appraisals.reduce((sum, appraisal) => sum + (appraisal?.net ?? 0), 0);
    onComplete(netTotal);
  };

  if (phase === 'intro') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-xl w-full max-h-full casino-vip-card rounded-2xl p-4 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-center my-auto relative border border-amber-500/30 overflow-hidden flex flex-col justify-between">
          <div className="card-neon-edge" />
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-lowest/90 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
            <span className="text-amber-400">♦</span>
            <ImageIcon size={14} />
            <span>Event II • Visual Turing Challenge</span>
            <span className="text-amber-400">♦</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] tracking-wider uppercase mb-1.5 drop-shadow-[0_2px_12px_rgba(244,208,104,0.3)] shrink-0">
            The Prompt Gambit
          </h1>

          <p className="text-amber-200/70 text-xs sm:text-sm leading-relaxed mb-4 max-w-lg mx-auto font-sans shrink-0">
            You will be shown 5 target images. Study each image, then write a descriptive prompt to recreate it using neural generation. Higher keyword accuracy yields higher payouts.
          </p>

          <div className="grid grid-cols-3 gap-2.5 mb-4 text-left shrink-0">
            <div className="bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-3 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Artworks</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-white">5 Total</span>
            </div>
            <div className="bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-3 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Prompt Window</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-amber-400">60 Sec</span>
            </div>
            <div className="bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-3 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Win Rate</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">+1x / Pic</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => setPhase('betting')}
              className="btn-marquee-gold text-slate-950 font-display font-black inline-flex items-center justify-center gap-2 px-8 py-3 text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-tactile active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="text-slate-950 font-black">PLACE WAGER &amp; START</span>
            </button>
            {onBackToBonus && (
              <button
                type="button"
                onClick={onBackToBonus}
                className="py-3 px-6 bg-[#180c19] hover:bg-[#231225] border border-amber-400/35 hover:border-amber-400/70 text-amber-200/90 font-mono text-xs font-bold uppercase tracking-[0.16em] rounded-xl transition-all cursor-pointer shadow-sm active:translate-y-0.5"
              >
                ⬅ Back To Bonus Tables
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'betting') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-2xl w-full my-auto flex flex-col gap-2.5">
          {onBackToBonus && (
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={onBackToBonus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#180c19] hover:bg-[#241126] border border-amber-400/35 text-amber-300 font-mono text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                <span>⬅ Back To Bonus Tables</span>
              </button>
              <span className="text-[11px] font-mono text-amber-200/60">Intermission Side Action Available</span>
            </div>
          )}
          <BettingPanel 
            currentChips={currentChips} 
            onBet={handleBet} 
            minBet={10}
            maxBet={Math.max(10, Math.min(100, currentChips))}
            onBackToBonus={onBackToBonus}
          />
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg p-2 sm:p-3 flex flex-col justify-between max-w-4xl mx-auto overflow-hidden select-none">
        <div className="w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Header Progress */}
          <div className="flex justify-between items-center mb-2 bg-surface-lowest/95 border border-amber-500/25 rounded-xl px-4 py-2 shadow-md backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400">
              <span className="text-amber-400 font-bold">Art Specimen</span>
              <span>•</span>
              <span className="text-white font-bold">{currentImageIndex + 1} of {originalImages.length}</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Active Wager: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2CE] to-[#F4D068] font-bold">${currentBet}</span>
            </div>
          </div>

          {/* Exhibition Easel Card */}
          <div className="casino-vip-card rounded-2xl p-3 sm:p-5 shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-amber-500/30 relative flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            <div className="card-neon-edge" />
            <div className="text-center mb-1.5 shrink-0">
              <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider">
                Inspect The Original Image
              </h2>
              <p className="text-amber-200/60 text-xs mt-0.5 font-sans">
                Study colors, subject matter, composition, and atmosphere. You will describe it from memory.
              </p>
            </div>

            <div className="flex-1 min-h-0 max-h-[50vh] bg-surface-lowest rounded-xl overflow-hidden mb-2 sm:mb-3 border border-amber-500/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
              <img
                src={currentOriginalImage.url}
                alt="Target specimen"
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>

            <div className="text-center shrink-0">
              <button
                onClick={handleImageSelect}
                className="btn-marquee-gold text-slate-950 font-display font-black inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-tactile active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span className="text-slate-950 font-black">I HAVE MEMORIZED THIS ARTWORK</span>
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
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg p-2 sm:p-3 flex flex-col justify-between max-w-4xl mx-auto overflow-hidden select-none">
        <div className="w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Top Bar with Digital Countdown */}
          <div className="flex justify-between items-center mb-2 bg-surface-lowest/95 border border-amber-500/25 rounded-xl px-4 py-2 shadow-md backdrop-blur-sm shrink-0">
            <span className="text-xs font-mono uppercase text-amber-200/60">
              Challenge <span className="text-white font-bold">{currentImageIndex + 1}/{originalImages.length}</span>
            </span>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-2 px-3 py-0.5 rounded-lg font-mono text-xs font-bold border shadow-inner ${
              isTimeRunningOut 
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse' 
                : 'bg-surface-lowest border-amber-500/30 text-amber-400'
            }`}>
              <span className="text-[10px] uppercase text-slate-400">Time Left:</span>
              <span className="text-sm tracking-wider">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Prompt Terminal Box */}
          <div className="casino-vip-card rounded-2xl p-4 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-amber-500/30 relative flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            <div className="card-neon-edge" />
            <div className="text-center mb-2 shrink-0">
              <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider">
                Synthesize Your Prompt
              </h2>
              <p className="text-amber-200/60 text-xs mt-0.5 font-sans">
                Provide detailed descriptors for the AI to recreate the original canvas.
              </p>
            </div>

            <div className="my-auto flex-1 min-h-0 flex flex-col justify-center">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe lighting, subject, landscape, atmosphere... (e.g. A serene mountain lake at sunset with crystal clear reflections and pine trees)"
                className="w-full h-28 sm:h-36 p-3 sm:p-4 bg-surface-lowest border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-amber-200/40 font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all resize-none shadow-inner"
                autoFocus
              />
              <div className="flex justify-between items-center text-[10px] font-mono text-amber-200/50 mt-1.5">
                <span>Accurate keywords match higher payout points.</span>
                <span>{userPrompt.length} chars</span>
              </div>
            </div>

            <div className="text-center shrink-0 mt-2">
              <button
                onClick={handlePromptSubmit}
                disabled={!userPrompt.trim()}
                className="btn-marquee-gold text-slate-950 font-display font-black inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-tactile active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Send size={15} className="text-slate-950" />
                <span className="text-slate-950 font-black">GENERATE AI CANVAS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'generating') {
    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-md w-full casino-vip-card rounded-2xl p-6 sm:p-8 text-center border border-amber-500/30 relative shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto">
          <div className="card-neon-edge" />
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <Sparkles className="text-amber-400 animate-spin" size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider mb-1.5">
            Synthesizing Canvas
          </h2>
          <p className="text-amber-200/60 text-xs sm:text-sm font-mono mb-4">
            {isAppraising
              ? 'Appraising similarity against target specimen...'
              : 'Routing through AI generation cascade...'}
          </p>
          <div className="w-full bg-surface-lowest rounded-full h-2 overflow-hidden border border-amber-500/20 p-0.5">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full w-2/3 animate-pulse rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'comparison') {
    const appraisal = appraisals[currentImageIndex];

    return (
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg p-2 sm:p-3 flex flex-col justify-between max-w-4xl mx-auto overflow-hidden select-none">
        <div className="w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="text-center mb-1.5 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-lowest/90 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase mb-1 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <span className="text-amber-400">♦</span>
              <span>Specimen Appraisal</span>
              <span className="text-amber-400">♦</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider">
              Compare Canvases
            </h2>
          </div>

          {/* Appraisal Result */}
          {appraisal && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-2 bg-surface-lowest/95 border border-amber-500/30 rounded-xl px-4 py-2 shadow-md backdrop-blur-md shrink-0">
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Similarity</span>
                <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">{appraisal.similarity}%</span>
              </div>
              <div className="w-px h-8 bg-amber-500/20 hidden sm:block" />
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Multiplier</span>
                <span className="text-lg sm:text-xl font-mono font-black text-amber-400">{appraisal.multiplier}x</span>
              </div>
              <div className="w-px h-8 bg-amber-500/20 hidden sm:block" />
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase text-amber-200/50 block">Payout</span>
                <span className={`text-lg sm:text-xl font-mono font-black ${appraisal.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {appraisal.net >= 0 ? `+$${appraisal.net}` : `-$${Math.abs(appraisal.net)}`}
                </span>
              </div>
            </div>
          )}

          {/* Dual Gallery Easels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 flex-1 min-h-0 overflow-hidden">
            {/* Original */}
            <div className="casino-vip-card rounded-xl p-2.5 sm:p-3 shadow-md border border-amber-500/25 relative flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center mb-1 shrink-0">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">Target Specimen</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Original</span>
              </div>
              <div className="flex-1 min-h-0 max-h-[30vh] bg-surface-lowest rounded-lg overflow-hidden mb-1 border border-amber-500/25 shadow-inner flex items-center justify-center">
                <img
                  src={currentOriginalImage.url}
                  alt="Original image"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
              <p className="text-[10px] font-mono text-amber-200/60 truncate shrink-0">{currentOriginalImage.description}</p>
            </div>

            {/* AI Generated */}
            <div className="casino-vip-card rounded-xl p-2.5 sm:p-3 shadow-md border border-amber-500/25 relative flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center mb-1 shrink-0">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">Generated Specimen</span>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">AI Output</span>
              </div>
              <div className="flex-1 min-h-0 max-h-[30vh] bg-surface-lowest rounded-lg overflow-hidden mb-1 border border-amber-500/25 flex items-center justify-center shadow-inner">
                {generatedImage ? (
                  <img
                    src={generatedImage.data}
                    alt="AI generated image"
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                ) : (
                  <div className="text-slate-500 font-mono text-[11px]">
                    Image generation unavailable
                  </div>
                )}
              </div>
              <p className="text-[10px] font-mono text-amber-200/60 truncate shrink-0">Prompt: "{userPrompt}"</p>
            </div>
          </div>

          {/* Next Button */}
          <div className="text-center shrink-0">
            <button
              onClick={handleNextRound}
              className="btn-marquee-gold text-slate-950 font-display font-black inline-flex items-center justify-center gap-2 px-8 py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-tactile active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="text-slate-950 font-black">{currentImageIndex < originalImages.length - 1 ? 'NEXT ARTWORK' : 'FINALIZE ROUND 2'}</span>
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
      <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        <div className="max-w-md w-full max-h-full casino-vip-card rounded-2xl p-4 sm:p-6 text-center relative border border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto flex flex-col justify-between overflow-hidden">
          <div className="card-neon-edge" />
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0">
            <ImageIcon size={24} />
          </div>

          <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-400/70 mb-0.5 shrink-0">
            Round 2 Complete
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider mb-3 shrink-0">
            Valuation Settled
          </h2>

          <div className="bg-surface-lowest/90 border border-amber-500/25 rounded-xl p-3 mb-4 text-left shadow-inner flex-1 min-h-0 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2 shrink-0">
              <span className="text-[11px] font-mono text-amber-200/60">Artworks Appraised:</span>
              <span className="text-xs font-mono text-white font-bold">{scoredCount} / {originalImages.length}</span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1 flex-1 min-h-0">
              {originalImages.map((image, idx) => {
                const appraisal = appraisals[idx];
                return (
                  <div
                    key={image.id}
                    className="flex items-center justify-between bg-surface-lowest rounded-lg px-2 py-1 border border-amber-500/15 text-[10px] font-mono"
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

            <div className="flex justify-between items-center pt-2 mt-2 border-t border-amber-500/15 shrink-0">
              <span className="text-xs font-mono text-amber-200/60">Total Payout:</span>
              <span className={`text-lg font-mono font-black ${netTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netTotal >= 0 ? `+$${netTotal}` : `-$${Math.abs(netTotal)}`}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinishRound}
            className="btn-marquee-gold text-slate-950 font-display font-black w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-tactile active:translate-y-0.5 transition-all cursor-pointer shrink-0"
          >
            <span className="text-slate-950 font-black">COLLECT WINNINGS &amp; ENTER VAULT</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
