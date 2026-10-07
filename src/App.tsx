import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GameScreen, Player, LeaderboardEntry } from './types';
import IntroScreen from './components/IntroScreen';
import RulesScreen from './components/RulesScreen';
import UsernameScreen from './components/UsernameScreen';
import ChipDisplay from './components/ChipDisplay';
import Round1 from './components/Round1';
import MultiplayerRound1 from './components/MultiplayerRound1';
import Round3 from './components/Round3';
import BonusRounds from './components/BonusRounds';
import Leaderboard from './components/Leaderboard';
import HostRound1Controller from './host/HostRound1Controller';
import HostChatInterface from './host/HostChatInterface';
import UnifiedHostView from './host/UnifiedHostView';
import OperatorSetup from './components/OperatorSetup';
import ErrorBoundary from './components/ErrorBoundary';
import { network_manager } from './services/network';
import { getBackendUrl } from './services/apiConfig';

const API_URL = getBackendUrl();

const getSessionPlayerId = (presetUsername?: string | null) => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const key = presetUsername ? `ai_casino_player_id_${presetUsername}` : 'ai_casino_player_id';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  }
  return `client-${Date.now()}`;
};

function App() {
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialUsername = queryParams?.get('username') || '';
  const initialRoom = (queryParams?.get('room') || 'table_01').toLowerCase().replace(/\s+/g, '-');

  const [screen, setScreen] = useState<GameScreen>('intro');
  const [roomId, setRoomId] = useState<string>(initialRoom);
  const [player, setPlayer] = useState<Player>({
    id: getSessionPlayerId(initialUsername || undefined),
    username: initialUsername,
    chips: 50,
    round1Score: 0,
    round2Score: 0,
    round3Score: 0,
    bonusEarnings: 0,
    currentRound: 1,
    gameState: {},
  });
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const playerRef = useRef(player);

  // Starting Lobby -> Player Name Insertion & Room Setup
  const handleStartGame = () => {
    setScreen('username');
  };

  // Player Name Insertion & Room Setup -> General Game Rules
  const handleUsernameSubmit = async (username: string, roomCode?: string) => {
    const selectedRoom = (roomCode || roomId || 'table_01').toLowerCase().replace(/\s+/g, '-');
    setRoomId(selectedRoom);

    try {
      // Connect / register player
      const res = await fetch(`${API_URL}/api/player/${username}`);
      const data = await res.json();
      
      if (data.success && data.player) {
        const loadedPlayer = {
          ...player,
          username,
          chips: 50, // Standard $50 tournament buy-in
          currentRound: 1,
          round1Score: 0,
          round2Score: 0,
          round3Score: 0,
          bonusEarnings: 0,
        };
        setPlayer(loadedPlayer);
        network_manager.set_username?.(username);
      } else {
        setPlayer({ ...player, username, chips: 50, currentRound: 1 });
        network_manager.set_username?.(username);
      }
    } catch (error) {
      console.error('Failed to connect to database. Falling back to local state:', error);
      setPlayer({ ...player, username, chips: 50, currentRound: 1 });
      network_manager.set_username?.(username);
    }

    // Advance to General Game Rules / Instructions
    setScreen('rules');
  };

  // General Game Rules -> Round 1 Multiplayer
  const handleContinueFromRules = () => {
    setScreen('round1');
  };

  const saveProgressToDB = async (playerState: Player) => {
    if (!playerState.username) return;
    try {
      await fetch(`${API_URL}/api/player/${playerState.username}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chips: playerState.chips,
          current_round: playerState.currentRound,
          round1_score: playerState.round1Score,
          round2_score: playerState.round2Score,
          round3_score: playerState.round3Score,
          bonus_earnings: playerState.bonusEarnings
        })
      });
    } catch (error) {
      console.error('Failed to save progress to database:', error);
    }
  };

  // Keep a live reference to the freshest player state so the debounced saver
  // always writes the latest balance (React state can lag behind rapid updates).
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Persist chip/state changes to the database. The bonus intermission only
  // mutates chips locally via onChipUpdate, so without this the bonus-round
  // balance never reaches the DB. Debounced to avoid spamming the API.
  useEffect(() => {
    if (!player.username) return;
    const timer = setTimeout(() => {
      saveProgressToDB(playerRef.current);
    }, 600);
    return () => clearTimeout(timer);
  }, [player.chips, player.currentRound, player.bonusEarnings, player.username]);

  const handleRound1Complete = (score: number, bet: number, totalFeeds = 10, finalChips?: number) => {
    let newChips = player.chips;
    let earnings = 0;
    if (typeof finalChips === 'number') {
      newChips = finalChips;
      earnings = finalChips - player.chips;
    } else {
      const correctCount = score;
      const wrongCount = Math.max(0, totalFeeds - correctCount);
      earnings = correctCount * bet - wrongCount * bet;
      newChips = Math.max(0, player.chips + earnings);
    }

    const updatedPlayer = {
      ...player,
      chips: newChips,
      round1Score: earnings,
      currentRound: 1.5, // Going to bonus round
    };
    setPlayer(updatedPlayer);
    saveProgressToDB(updatedPlayer);
    setScreen('bonus');
  };

  const handleBonus1Complete = (earnings: number) => {
    const current = playerRef.current;
    console.log('App: handleBonus1Complete called with earnings:', earnings);
    const finalChips = current.chips + earnings;
    console.log('App: Updating player chips from', current.chips, 'to', finalChips);
    const updatedPlayer = {
      ...current,
      chips: finalChips,
      bonusEarnings: current.bonusEarnings + earnings,
      currentRound: 2,
    };

    setPlayer(updatedPlayer);
    saveProgressToDB(updatedPlayer);
    setScreen('round2');
  };

  const handleRound2Complete = (net: number) => {
    const newChips = player.chips + net;
    const updatedPlayer = {
      ...player,
      chips: newChips,
      round2Score: net,
      currentRound: 2.5, // Going to bonus round
    };
    setPlayer(updatedPlayer);
    saveProgressToDB(updatedPlayer);
    setScreen('bonus');
  };

  const handleBonus2Complete = (earnings: number) => {
    const current = playerRef.current;
    const finalChips = current.chips + earnings;
    const updatedPlayer = {
      ...current,
      chips: finalChips,
      bonusEarnings: current.bonusEarnings + earnings,
      currentRound: 3,
    };

    setPlayer(updatedPlayer);
    saveProgressToDB(updatedPlayer);
    setScreen('round3');
  };

  const handleRound3Complete = (score: number, bet: number) => {
    const correctCount = score;
    const wrongCount = 3 - correctCount; // Round 3 has 3 subrounds
    const earnings = correctCount * bet - wrongCount * bet;

    const newChips = player.chips + earnings;
    const updatedPlayer = {
      ...player,
      chips: newChips,
      round3Score: earnings,
      currentRound: 4, // Final bonus phase
    };
    setPlayer(updatedPlayer);
    saveProgressToDB(updatedPlayer);
    setScreen('bonus');
  };

  const handleBonusComplete = async (earnings: number) => {
    const current = playerRef.current;
    const finalChips = current.chips + earnings;
    const updatedPlayer = {
      ...current,
      chips: finalChips,
      bonusEarnings: current.bonusEarnings + earnings,
    };

    setPlayer(updatedPlayer);
    await saveProgressToDB(updatedPlayer);

    try {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      const data = await res.json();
      if (data.success && data.leaderboard) {
        setLeaderboardEntries(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Fallback to local state if server fails
      const newEntry: LeaderboardEntry = {
        username: player.username,
        chips: finalChips,
        timestamp: Date.now(),
      };
      setLeaderboardEntries([...leaderboardEntries, newEntry]);
    }

    setScreen('leaderboard');
  };

  const handlePlayAgain = () => {
    setPlayer({
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    setPlayer(prev => {
      if (prev.chips === chips) return prev;
      return { ...prev, chips };
    });
  };

  const showChipDisplay = ['round1', 'round2', 'round3', 'bonus'].includes(screen);

  // Render the game screen based on the current screen state
  const renderGameScreen = () => {
    switch (screen) {
      case 'intro':
        return <IntroScreen onStart={handleStartGame} />;
      case 'username':
        return <UsernameScreen onSubmit={handleUsernameSubmit} defaultRoom={roomId.toUpperCase()} />;
      case 'rules':
        return <RulesScreen onContinue={handleContinueFromRules} />;
      case 'round1':
        return <MultiplayerRound1 player={player} roomId={roomId} onComplete={handleRound1Complete} onChipUpdate={handleChipUpdate} />;
      case 'round2':
        return <Round1 currentChips={player.chips} onComplete={handleRound2Complete} />;
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
    <div className="w-full h-full h-[100dvh] max-w-full max-h-full casino-table-bg text-slate-100 font-sans selection:bg-amber-500 selection:text-black antialiased overflow-hidden flex flex-col fixed inset-0">
      {/* Main game routes */}
      <Routes>
        <Route path="/" element={
          <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
            {showChipDisplay && <ChipDisplay chips={player.chips} username={player.username} />}
            <div className="flex-1 min-h-0 w-full h-full overflow-hidden flex flex-col">
              <ErrorBoundary>
                {renderGameScreen()}
              </ErrorBoundary>
            </div>
          </div>
        } />
        <Route path="/player" element={
          <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
            {showChipDisplay && <ChipDisplay chips={player.chips} username={player.username} />}
            <div className="flex-1 min-h-0 w-full h-full overflow-hidden flex flex-col">
              <ErrorBoundary>
                {renderGameScreen()}
              </ErrorBoundary>
            </div>
          </div>
        } />
        <Route path="/contestant" element={
          <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
            {showChipDisplay && <ChipDisplay chips={player.chips} username={player.username} />}
            <div className="flex-1 min-h-0 w-full h-full overflow-hidden flex flex-col">
              <ErrorBoundary>
                {renderGameScreen()}
              </ErrorBoundary>
            </div>
          </div>
        } />
        <Route path="/play" element={
          <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
            {showChipDisplay && <ChipDisplay chips={player.chips} username={player.username} />}
            <div className="flex-1 min-h-0 w-full h-full overflow-hidden flex flex-col">
              <ErrorBoundary>
                {renderGameScreen()}
              </ErrorBoundary>
            </div>
          </div>
        } />
        <Route path="/host" element={<UnifiedHostView />} />
        <Route path="/host/round1" element={<UnifiedHostView initialTab="round1" />} />
        <Route path="/host/round3" element={<UnifiedHostView initialTab="round3" />} />
        <Route path="/host/chat" element={<HostChatInterface />} />
        <Route path="/turing-host" element={<HostChatInterface />} />
        <Route path="/round1-host" element={<HostRound1Controller />} />
        <Route path="/operator-setup" element={<OperatorSetup />} />
        <Route path="*" element={
          <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
            {showChipDisplay && <ChipDisplay chips={player.chips} username={player.username} />}
            <div className="flex-1 min-h-0 w-full h-full overflow-hidden flex flex-col">
              {renderGameScreen()}
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
