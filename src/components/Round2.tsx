import { useState, useEffect, useRef } from 'react';
import { Video, CheckCircle, XCircle } from 'lucide-react';
import { round2Videos } from '../gameData';
import { BetAmount } from '../types';
import BettingPanel from './BettingPanel';

interface Round2Props {
  currentChips: number;
  onComplete: (score: number, bet: number) => void;
}

export default function Round2({ currentChips, onComplete }: Round2Props) {
  // State declarations at the top
  const [phase, setPhase] = useState<'intro' | 'betting' | 'playing' | 'results'>('intro');
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Timer effect
  useEffect(() => {
    if (phase === 'playing') {
      if (roundTimeLeft === 0) {
        setPhase('results');
        return;
      }
      
      const timer = setInterval(() => {
        setRoundTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [phase, roundTimeLeft]);
  
  // Video cleanup effect
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const handleBet = (amount: BetAmount) => {
    const bet = amount === 'ALL_IN' ? currentChips : amount;
    setCurrentBet(bet);
    setPhase('playing');
    setRoundTimeLeft(60); // Reset timer when starting the round
  };

  const handleAnswer = (answer: 'real' | 'ai') => {
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setShowResult(true);
    setIsPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.pause();
    }

    const nextVideoIndex = currentVideoIndex + 1;
    const hasMoreVideos = nextVideoIndex < round2Videos.length;

    setTimeout(() => {
      setShowResult(false);
      if (hasMoreVideos) {
        setCurrentVideoIndex(nextVideoIndex);
        // The video will auto-play from the video element's autoplay prop
      } else {
        setPhase('results');
      }
    }, 2000);
  };

  const handleFinishRound = () => {
    const correctCount = answers.filter((answer, idx) => {
      const video = round2Videos[idx];
      return (answer === 'ai' && video.isAI) || (answer === 'real' && !video.isAI);
    }).length;
    onComplete(correctCount, currentBet);
  };

  if (phase === 'intro') {
    return (
      <div className="w-full h-full flex-1 min-h-0 overflow-hidden casino-table-bg flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-2xl w-full bg-[#12151E] border border-[#232938] rounded-2xl p-5 sm:p-7 shadow-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D2A] border border-[#2B354D] text-blue-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <Video size={14} />
            <span>Event I • Video Detection Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight uppercase mb-2">
            The Reality Bet
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5 max-w-lg mx-auto">
            You will inspect 5 rapid-fire video feeds. Your objective: distinguish genuine camera footage from synthetic AI generations. Trust subtle physical cues, lighting, and anatomy.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5 text-left">
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-3 sm:p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Surveillance</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-white">5 Feeds</span>
            </div>
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-3 sm:p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Round Timer</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-blue-400">60 Sec</span>
            </div>
            <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-3 sm:p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Payout</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">1x / Clip</span>
            </div>
          </div>

          <button
            onClick={() => setPhase('betting')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <span>PLACE WAGER &amp; START</span>
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'betting') {
    return (
      <div className="w-full h-full flex-1 min-h-0 overflow-hidden casino-table-bg flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-2xl w-full">
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
    const currentVideo = round2Videos[currentVideoIndex];
    const hasAnswered = answers[currentVideoIndex] !== undefined;
    const isCorrect = hasAnswered &&
      ((answers[currentVideoIndex] === 'ai' && currentVideo.isAI) ||
       (answers[currentVideoIndex] === 'real' && !currentVideo.isAI));
    const minutes = Math.floor(roundTimeLeft / 60);
    const seconds = roundTimeLeft % 60;
    const isTimeRunningOut = roundTimeLeft <= 10;

    return (
      <div className="w-full h-full flex-1 min-h-0 overflow-hidden casino-table-bg flex flex-col justify-between items-center p-3 sm:p-4">
        <div className="w-full max-w-3xl flex-1 min-h-0 flex flex-col justify-between mx-auto">
          {/* Header Bar */}
          <div className="flex-shrink-0 flex justify-between items-center mb-2 bg-[#12151E] border border-[#232938] rounded-xl px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-white font-bold">Surveillance Feed {currentVideoIndex + 1} of {round2Videos.length}</span>
            </div>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-lg font-mono text-xs sm:text-sm font-bold border ${
              isTimeRunningOut 
                ? 'bg-rose-500/10 border-rose-500 text-rose-400 animate-pulse' 
                : 'bg-[#181D2A] border-[#2E374D] text-amber-400'
            }`}>
              <span className="text-[11px] uppercase text-slate-400">Clock:</span>
              <span className="text-sm tracking-wider">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Surveillance Theater Screen */}
          <div className="flex-1 min-h-0 bg-[#12151E] border border-[#232938] rounded-2xl p-3 sm:p-4 mb-2 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex-1 min-h-0 w-full bg-black rounded-xl overflow-hidden border border-[#2E374D] flex items-center justify-center shadow-inner relative max-h-[46vh]">
              <video
                ref={videoRef}
                src={`/Videos/${currentVideo.isAI ? 'AI' : 'REAL'} ${currentVideoIndex + 1}.mp4`}
                className="w-full h-full object-contain"
                playsInline
                autoPlay
                muted
                loop={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="absolute top-2.5 left-2.5 bg-[#090A0F]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-[#232938]">
                FEED #{currentVideoIndex + 1} • {currentVideo.title}
              </div>
            </div>

            <p className="flex-shrink-0 text-slate-400 text-[11px] font-mono text-center mt-1.5">
              {isPlaying ? '▶ Feed streaming in real-time' : 'Feed paused • Select classification below'}
            </p>
          </div>

          {/* Results Badge or Decision Buttons */}
          <div className="flex-shrink-0 mb-2">
            {showResult ? (
              <div className={`border rounded-xl p-3.5 text-center transition-all ${
                isCorrect 
                  ? 'bg-[#0E2018] border-emerald-500/40 text-emerald-400' 
                  : 'bg-[#220E14] border-rose-500/40 text-rose-400'
              }`}>
                <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-display font-black uppercase mb-0.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle size={20} />
                      <span>Correct Analysis!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      <span>Incorrect Classification!</span>
                    </>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-300">
                  This footage was verified as: <span className="font-bold uppercase text-white">{currentVideo.isAI ? 'AI' : 'REAL'}</span>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => handleAnswer('real')}
                  className="flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-4 bg-gradient-to-b from-[#163826] to-[#0D2418] hover:from-[#1E4D34] hover:to-[#123322] border-2 border-emerald-500/40 hover:border-emerald-400 rounded-xl text-white font-display font-black text-base sm:text-lg uppercase tracking-wider shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
                >
                  <CheckCircle size={20} className="text-emerald-400" />
                  <span>REAL LIFE</span>
                </button>

                <button
                  onClick={() => handleAnswer('ai')}
                  className="flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-4 bg-gradient-to-b from-[#3D141E] to-[#260B12] hover:from-[#521B29] hover:to-[#330F19] border-2 border-rose-500/40 hover:border-rose-400 rounded-xl text-white font-display font-black text-base sm:text-lg uppercase tracking-wider shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
                >
                  <Video size={20} className="text-rose-400" />
                  <span>AI GENERATED</span>
                </button>
              </div>
            )}
          </div>

          {/* Progress Pips */}
          <div className="flex-shrink-0 flex gap-2 justify-center py-1">
            {round2Videos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx < currentVideoIndex
                    ? 'w-7 bg-emerald-500'
                    : idx === currentVideoIndex
                    ? 'w-9 bg-amber-400 animate-pulse'
                    : 'w-5 bg-[#232938]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const correctCount = answers.filter((answer, idx) => {
      const video = round2Videos[idx];
      return (answer === 'ai' && video.isAI) || (answer === 'real' && !video.isAI);
    }).length;

    return (
      <div className="w-full h-full flex-1 min-h-0 overflow-hidden casino-table-bg flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-2xl w-full max-h-[92vh] flex flex-col bg-[#12151E] border border-[#232938] rounded-2xl p-5 sm:p-7 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#181D2A] border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3 flex-shrink-0">
            <Video size={24} />
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1 flex-shrink-0">
            Round 1 Complete
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight mb-4 flex-shrink-0">
            Reality Screening Settled
          </h2>

          <div className="bg-[#181D2A] border border-[#283248] rounded-xl p-4 mb-4 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <span className="text-xs font-mono text-slate-400">Total Accuracy:</span>
              <span className="text-xl font-mono font-black text-amber-400">{correctCount} / 5 Correct</span>
            </div>

            <div className="space-y-2 text-xs font-mono text-left flex-1 min-h-0 overflow-y-auto pr-1">
              {round2Videos.map((video, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = (userAnswer === 'ai' && video.isAI) || (userAnswer === 'real' && !video.isAI);

                return (
                  <div key={idx} className="flex items-center justify-between bg-[#12151E] rounded-lg p-2.5 border border-[#232938]">
                    <span className="text-slate-300 truncate max-w-[200px]">{video.title}</span>
                    <div className="flex items-center gap-3">
                      <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        Pick: {userAnswer ? userAnswer.toUpperCase() : 'SKIPPED'}
                      </span>
                      <span className="text-slate-500">
                        Actual: {video.isAI ? 'AI' : 'REAL'}
                      </span>
                      {userAnswer && (
                        isCorrect ? <CheckCircle size={15} className="text-emerald-400" /> : <XCircle size={15} className="text-rose-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleFinishRound}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-tactile active:shadow-tactile-pressed active:translate-y-0.5 transition-all duration-150 cursor-pointer"
            >
              <span>CONTINUE TO ROUND 3</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
