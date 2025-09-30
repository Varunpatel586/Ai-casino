import { useState } from 'react';
import { MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { round3Conversations } from '../gameData';
import { BetAmount } from '../types';
import BettingPanel from './BettingPanel';

interface Round3Props {
  currentChips: number;
  onComplete: (score: number, bet: number) => void;
}

export default function Round3({ currentChips, onComplete }: Round3Props) {
  const [phase, setPhase] = useState<'intro' | 'betting' | 'playing' | 'results'>('intro');
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [currentConvoIndex, setCurrentConvoIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleBet = (amount: BetAmount) => {
    const bet = amount === 'ALL_IN' ? currentChips : amount;
    setCurrentBet(bet);
    setPhase('playing');
  };

  const handleAnswer = (choice: 'option1' | 'option2') => {
    const currentConvo = round3Conversations[currentConvoIndex];
    const isCorrect = choice === currentConvo.correctAnswer;

    setAnswers([...answers, choice]);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      if (currentConvoIndex < round3Conversations.length - 1) {
        setCurrentConvoIndex(currentConvoIndex + 1);
      } else {
        setPhase('results');
      }
    }, 3000);
  };

  const handleFinishRound = () => {
    const correctCount = answers.filter((answer, idx) => {
      return answer === round3Conversations[idx].correctAnswer;
    }).length;
    onComplete(correctCount, currentBet);
  };

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-3xl text-center">
          <div className="mb-8">
            <MessageCircle className="text-pink-400 mx-auto mb-4" size={64} />
            <h1 className="text-6xl font-black text-white mb-4">ROUND 3</h1>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
              The Turing Table
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
            <p className="text-xl text-white/80 mb-4">
              Read 5 conversation responses. Your challenge: determine which response is from a human and which is from AI.
            </p>
            <p className="text-lg text-pink-400">
              Listen to your gut. Humans have quirks AI can't quite replicate!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 text-white">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl font-bold text-pink-400">5</div>
              <div className="text-sm">Questions</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400">2</div>
              <div className="text-sm">Responses</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-3xl font-bold text-cyan-400">8</div>
              <div className="text-sm">Minutes</div>
            </div>
          </div>

          <button
            onClick={() => setPhase('betting')}
            className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,0,255,0.6)]"
          >
            CONTINUE
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'betting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 flex items-center justify-center px-4 pt-24">
        <div className="max-w-2xl w-full">
          <h2 className="text-4xl font-black text-white text-center mb-8">Place Your Bet</h2>
          <BettingPanel currentChips={currentChips} onBet={handleBet} />
        </div>
      </div>
    );
  }

  if (phase === 'playing') {
    const currentConvo = round3Conversations[currentConvoIndex];
    const hasAnswered = answers[currentConvoIndex] !== undefined;
    const isCorrect = hasAnswered && answers[currentConvoIndex] === currentConvo.correctAnswer;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="text-white">
              <span className="text-2xl font-bold">
                Question {currentConvoIndex + 1} / {round3Conversations.length}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <MessageCircle className="text-pink-400 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold text-white mb-4">Question:</h3>
              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-semibold">
                "{currentConvo.question}"
              </p>
            </div>

            <p className="text-white/60 text-center text-lg">Which response sounds more human?</p>
          </div>

          {showResult ? (
            <div className={`bg-gradient-to-r ${isCorrect ? 'from-green-900/50 to-blue-900/50 border-green-500/30' : 'from-red-900/50 to-orange-900/50 border-red-500/30'} border rounded-2xl p-8 text-center`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="text-green-400 mx-auto mb-4" size={64} />
                  <p className="text-3xl font-bold text-green-400 mb-4">Correct!</p>
                  <p className="text-white/80 text-lg">
                    Response {currentConvo.correctAnswer === 'option1' ? '1' : '2'} was written by a human
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="text-red-400 mx-auto mb-4" size={64} />
                  <p className="text-3xl font-bold text-red-400 mb-4">Wrong!</p>
                  <p className="text-white/80 text-lg">
                    Response {currentConvo.correctAnswer === 'option1' ? '1' : '2'} was actually from a human
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => handleAnswer('option1')}
                className="w-full text-left px-8 py-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 rounded-2xl hover:border-blue-400 hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xl">1</div>
                  <p className="text-white text-lg flex-1 pt-1">{currentConvo.responses.option1}</p>
                </div>
              </button>

              <button
                onClick={() => handleAnswer('option2')}
                className="w-full text-left px-8 py-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-2xl hover:border-purple-400 hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500 text-white font-bold px-4 py-2 rounded-lg text-xl">2</div>
                  <p className="text-white text-lg flex-1 pt-1">{currentConvo.responses.option2}</p>
                </div>
              </button>
            </div>
          )}

          <div className="mt-6 flex gap-2 justify-center">
            {round3Conversations.map((_, idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full ${
                  idx < currentConvoIndex
                    ? 'bg-green-400'
                    : idx === currentConvoIndex
                    ? 'bg-pink-400 animate-pulse'
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
    const correctCount = answers.filter((answer, idx) => {
      return answer === round3Conversations[idx].correctAnswer;
    }).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-5xl font-black text-white mb-8">Round 3 Complete!</h2>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
            <div className="text-6xl font-black text-pink-400 mb-4">{correctCount}/5</div>
            <div className="text-white/60 text-xl mb-6">Correct Identifications</div>

            <div className="space-y-3">
              {round3Conversations.map((convo, idx) => {
                const isCorrect = answers[idx] === convo.correctAnswer;

                return (
                  <div key={idx} className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Question {idx + 1}</span>
                      {isCorrect ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle size={20} />
                          <span className="font-bold">Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <XCircle size={20} />
                          <span className="font-bold">Wrong</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white/60 text-sm text-left">
                      Human response was option {convo.correctAnswer === 'option1' ? '1' : '2'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleFinishRound}
            className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,0,0.6)]"
          >
            VIEW FINAL RESULTS
          </button>
        </div>
      </div>
    );
  }

  return null;
}
