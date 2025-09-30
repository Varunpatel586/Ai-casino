import { useState } from 'react';
import { GameScreen, Player, LeaderboardEntry } from './types';
import IntroScreen from './components/IntroScreen';
import RulesScreen from './components/RulesScreen';
import UsernameScreen from './components/UsernameScreen';
import ChipDisplay from './components/ChipDisplay';
import Round1 from './components/Round1';
import Round2 from './components/Round2';
import Round3 from './components/Round3';
import BonusRounds from './components/BonusRounds';
import Leaderboard from './components/Leaderboard';

function App() {
  const [screen, setScreen] = useState<GameScreen>('intro');
  const [player, setPlayer] = useState<Player>({
    id: crypto.randomUUID(),
    username: '',
    chips: 50,
    round1Score: 0,
    round2Score: 0,
    round3Score: 0,
    bonusEarnings: 0,
    currentRound: 1,
    gameState: {},
  });
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);

  const handleStartGame = () => {
    setScreen('rules');
  };

  const handleContinueFromRules = () => {
    setScreen('username');
  };

  const handleUsernameSubmit = (username: string) => {
    setPlayer({ ...player, username });
    setScreen('round1');
  };

  const handleRound1Complete = (score: number, bet: number) => {
    const correctCount = score;
    const wrongCount = 5 - correctCount;
    const earnings = correctCount * bet - wrongCount * bet;

    setPlayer({
      ...player,
      chips: player.chips + earnings,
      round1Score: earnings,
      currentRound: 2,
    });
    setScreen('round2');
  };

  const handleRound2Complete = (score: number, bet: number) => {
    const correctCount = score;
    const wrongCount = 5 - correctCount;
    const earnings = correctCount * bet - wrongCount * bet;

    setPlayer({
      ...player,
      chips: player.chips + earnings,
      round2Score: earnings,
      currentRound: 3,
    });
    setScreen('round3');
  };

  const handleRound3Complete = (score: number, bet: number) => {
    const correctCount = score;
    const wrongCount = 5 - correctCount;
    const earnings = correctCount * bet - wrongCount * bet;

    setPlayer({
      ...player,
      chips: player.chips + earnings,
      round3Score: earnings,
      currentRound: 4,
    });
    setScreen('bonus');
  };

  const handleBonusComplete = (earnings: number) => {
    const finalChips = player.chips + earnings;
    const updatedPlayer = {
      ...player,
      chips: finalChips,
      bonusEarnings: earnings,
    };

    setPlayer(updatedPlayer);

    const newEntry: LeaderboardEntry = {
      username: player.username,
      chips: finalChips,
      timestamp: Date.now(),
    };
    setLeaderboardEntries([...leaderboardEntries, newEntry]);

    setScreen('leaderboard');
  };

  const handlePlayAgain = () => {
    setPlayer({
      id: crypto.randomUUID(),
      username: '',
      chips: 50,
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      bonusEarnings: 0,
      currentRound: 1,
      gameState: {},
    });
    setScreen('intro');
  };

  const showChipDisplay = ['round1', 'round2', 'round3', 'bonus'].includes(screen);

  return (
    <>
      {showChipDisplay && <ChipDisplay chips={player.chips} username={player.username} />}

      {screen === 'intro' && <IntroScreen onStart={handleStartGame} />}
      {screen === 'rules' && <RulesScreen onContinue={handleContinueFromRules} />}
      {screen === 'username' && <UsernameScreen onSubmit={handleUsernameSubmit} />}
      {screen === 'round1' && (
        <Round1 currentChips={player.chips} onComplete={handleRound1Complete} />
      )}
      {screen === 'round2' && (
        <Round2 currentChips={player.chips} onComplete={handleRound2Complete} />
      )}
      {screen === 'round3' && (
        <Round3 currentChips={player.chips} onComplete={handleRound3Complete} />
      )}
      {screen === 'bonus' && (
        <BonusRounds currentChips={player.chips} onComplete={handleBonusComplete} />
      )}
      {screen === 'leaderboard' && (
        <Leaderboard
          entries={leaderboardEntries}
          currentPlayer={{ username: player.username, chips: player.chips }}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}

export default App;
