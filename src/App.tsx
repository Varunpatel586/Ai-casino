import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import HostChatInterface from './host/HostChatInterface';
import { network_manager } from './services/network';

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
    // Ensure username is sent to server for chat
    network_manager.set_username?.(username);
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
      currentRound: 1.5, // Going to bonus round
    });
    setScreen('bonus');
  };

  const handleBonus1Complete = (earnings: number) => {
    console.log('App: handleBonus1Complete called with earnings:', earnings);
    const finalChips = player.chips + earnings;
    console.log('App: Updating player chips from', player.chips, 'to', finalChips);
    const updatedPlayer = {
      ...player,
      chips: finalChips,
      bonusEarnings: player.bonusEarnings + earnings,
      currentRound: 2,
    };

    setPlayer(updatedPlayer);
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
      currentRound: 2.5, // Going to bonus round
    });
    setScreen('bonus');
  };

  const handleBonus2Complete = (earnings: number) => {
    const finalChips = player.chips + earnings;
    const updatedPlayer = {
      ...player,
      chips: finalChips,
      bonusEarnings: player.bonusEarnings + earnings,
      currentRound: 3,
    };

    setPlayer(updatedPlayer);
    setScreen('round3');
  };

  const handleRound3Complete = (score: number, bet: number) => {
    const correctCount = score;
    const wrongCount = 3 - correctCount; // Round 3 has 3 subrounds
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
      bonusEarnings: player.bonusEarnings + earnings,
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

  const handleChipUpdate = (chips: number) => {
    setPlayer(prev => ({ ...prev, chips }));
  };

  const showChipDisplay = ['round1', 'round2', 'round3', 'bonus'].includes(screen);

  // Render the game screen based on the current screen state
  const renderGameScreen = () => {
    switch (screen) {
      case 'intro':
        return <IntroScreen onStart={handleStartGame} />;
      case 'rules':
        return <RulesScreen onContinue={handleContinueFromRules} />;
      case 'username':
        return <UsernameScreen onSubmit={handleUsernameSubmit} />;
      case 'round1':
        return <Round1 currentChips={player.chips} onComplete={handleRound1Complete} />;
      case 'round2':
        return <Round2 currentChips={player.chips} onComplete={handleRound2Complete} />;
      case 'round3':
        return <Round3 currentChips={player.chips} onComplete={handleRound3Complete} username={player.username} />;
      case 'bonus':
        // Check if this is bonus after round 1, round 2, or round 3
        if (player.currentRound === 1.5) {
          return <BonusRounds currentChips={player.chips} onComplete={handleBonus1Complete} onChipUpdate={handleChipUpdate} currentRound={1.5} />;
        } else if (player.currentRound === 2.5) {
          return <BonusRounds currentChips={player.chips} onComplete={handleBonus2Complete} onChipUpdate={handleChipUpdate} currentRound={2.5} />;
        } else {
          return <BonusRounds currentChips={player.chips} onComplete={handleBonusComplete} onChipUpdate={handleChipUpdate} currentRound={3.5} />;
        }
      case 'leaderboard':
        return (
          <Leaderboard
            entries={leaderboardEntries}
            currentPlayer={{ username: player.username, chips: player.chips }}
            onPlayAgain={handlePlayAgain}
          />
        );
      default:
        return <IntroScreen onStart={handleStartGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 text-white">
      {/* Main game routes */}
      <Routes>
        <Route path="/" element={
          <>
            {showChipDisplay && <ChipDisplay chips={player.chips} username={player.username} />}
            {renderGameScreen()}
          </>
        } />
        <Route path="/host" element={<HostChatInterface />} />
      </Routes>
    </div>
  );
}

export default App;
