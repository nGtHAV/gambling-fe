'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api, MinesweeperResult } from '@/lib/api';
import { BetInput, GameMessage } from '@/components/GameComponents';
import BankruptModal from '@/components/BankruptModal';

export default function MinesweeperPage() {
  const { user, loading, updateCoins } = useAuth();
  const router = useRouter();
  const [bet, setBet] = useState(10);
  const [gridSize, setGridSize] = useState(5);
  const [numMines, setNumMines] = useState(5);
  const [gameState, setGameState] = useState<MinesweeperResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [showBankrupt, setShowBankrupt] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleCreate = async () => {
    setPlaying(true);
    setError('');
    try {
      const result = await api.playMinesweeper('create', bet, { gridSize, numMines });
      setGameState(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Game error');
    }
    setPlaying(false);
  };

  const handleReveal = async (index: number) => {
    if (!gameState || gameState.status !== 'playing') return;
    if (gameState.revealed.includes(index)) return;
    
    setPlaying(true);
    setError('');
    try {
      const result = await api.playMinesweeper('reveal', bet, { 
        tileIndex: index, 
        gameState 
      });
      setGameState(result);
      if (result.coins !== undefined) {
        updateCoins(result.coins);
        if (result.is_bankrupt) {
          setShowBankrupt(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Game error');
    }
    setPlaying(false);
  };

  const handleCashout = async () => {
    if (!gameState || gameState.status !== 'playing') return;
    
    setPlaying(true);
    setError('');
    try {
      const result = await api.playMinesweeper('cashout', bet, { gameState });
      setGameState(result);
      if (result.coins !== undefined) {
        updateCoins(result.coins);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Game error');
    }
    setPlaying(false);
  };

  const isGameOver = gameState && ['win', 'lose', 'cashout'].includes(gameState.status);

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-[80vh]">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BankruptModal isOpen={showBankrupt} onClose={() => setShowBankrupt(false)} />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">💣 Minesweeper</h1>
        <p className="text-gray-400">Reveal tiles to increase your multiplier, avoid the mines!</p>
      </div>

      {/* Game Grid */}
      {gameState && (
        <div className="card mb-6">
          {/* Multiplier Display */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-yellow-400">
              {gameState.multiplier}x
            </div>
            <div className="text-gray-400">Current Multiplier</div>
            {gameState.status === 'playing' && gameState.revealed.length > 0 && (
              <div className="text-green-400 text-sm mt-1">
                Potential Win: {(bet * gameState.multiplier - bet).toFixed(0)} coins
              </div>
            )}
          </div>

          {/* Grid */}
          <div 
            className="grid gap-2 mx-auto mb-6"
            style={{ 
              gridTemplateColumns: `repeat(${gameState.grid_size}, minmax(0, 1fr))`,
              maxWidth: `${gameState.grid_size * 58}px`
            }}
          >
            {Array.from({ length: gameState.total_tiles }, (_, i) => {
              const isRevealed = gameState.revealed.includes(i);
              const isMine = isGameOver && gameState.mine_positions.includes(i);
              const isHitMine = gameState.hit_mine === i;
              
              return (
                <button
                  key={i}
                  onClick={() => handleReveal(i)}
                  disabled={playing || isRevealed || gameState.status !== 'playing'}
                  className={`mine-tile ${
                    isHitMine ? 'mine animate-shake' :
                    isMine ? 'mine' :
                    isRevealed ? 'revealed' : ''
                  }`}
                >
                  {isHitMine ? '💥' :
                   isMine ? '💣' :
                   isRevealed ? '💎' : ''}
                </button>
              );
            })}
          </div>

          {/* Game Info */}
          <div className="flex justify-center gap-8 text-sm mb-4">
            <div>
              <span className="text-gray-400">Mines:</span>
              <span className="ml-2 text-red-400 font-bold">{gameState.num_mines}</span>
            </div>
            <div>
              <span className="text-gray-400">Safe Revealed:</span>
              <span className="ml-2 text-green-400 font-bold">{gameState.revealed.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Safe Remaining:</span>
              <span className="ml-2 text-blue-400 font-bold">
                {gameState.total_tiles - gameState.num_mines - gameState.revealed.length}
              </span>
            </div>
          </div>

          {/* Cashout Button */}
          {gameState.status === 'playing' && gameState.revealed.length > 0 && (
            <button
              onClick={handleCashout}
              disabled={playing}
              className="btn btn-primary w-full"
            >
              💰 Cash Out ({(bet * gameState.multiplier).toFixed(0)} coins)
            </button>
          )}

          {/* Result Message */}
          {isGameOver && (
            <GameMessage
              message={gameState.message}
              type={gameState.status === 'lose' ? 'lose' : 'win'}
            />
          )}
        </div>
      )}

      {/* Setup / New Game */}
      <div className="card">
        {!gameState || isGameOver ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Grid Size</label>
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="input"
                >
                  {[3, 4, 5, 6, 7].map(size => (
                    <option key={size} value={size}>{size}x{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Number of Mines</label>
                <select
                  value={numMines}
                  onChange={(e) => setNumMines(parseInt(e.target.value))}
                  className="input"
                >
                  {Array.from({ length: Math.min(gridSize * gridSize - 1, 20) }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} mines</option>
                  ))}
                </select>
              </div>
            </div>
            
            <BetInput value={bet} onChange={setBet} maxBet={user.coins} disabled={playing} />
            
            <button
              onClick={handleCreate}
              disabled={playing || bet > user.coins}
              className="btn btn-primary w-full"
            >
              {playing ? 'Starting...' : '🎮 Start Game'}
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            Click tiles to reveal them. Avoid the mines!
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
