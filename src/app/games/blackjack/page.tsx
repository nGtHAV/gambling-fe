'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api, BlackjackResult, Card } from '@/lib/api';
import PlayingCard, { BetInput, GameMessage } from '@/components/GameComponents';
import BankruptModal from '@/components/BankruptModal';

interface GameState {
  deck: Card[];
  player_hand: Card[];
  full_dealer_hand: Card[];
}

export default function BlackjackPage() {
  const { user, loading, updateCoins } = useAuth();
  const router = useRouter();
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<BlackjackResult | null>(null);
  const [savedState, setSavedState] = useState<GameState | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [showBankrupt, setShowBankrupt] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleAction = async (action: string) => {
    setPlaying(true);
    setError('');
    try {
      const result = await api.playBlackjack(action, bet, savedState || undefined);
      setGameState(result);
      
      if (result.status === 'playing') {
        // Save state for next action
        const newState: GameState = {
          deck: (result as unknown as GameState).deck || [],
          player_hand: result.player_hand,
          full_dealer_hand: (result as unknown as GameState).full_dealer_hand || [],
        };
        setSavedState(newState);
      } else {
        setSavedState(null);
        if (result.coins !== undefined) {
          updateCoins(result.coins);
          if (result.is_bankrupt) {
            setShowBankrupt(true);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Game error');
    }
    setPlaying(false);
  };

  const isGameOver = gameState && ['win', 'lose', 'bust', 'blackjack', 'push'].includes(gameState.status);

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-[80vh]"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <BankruptModal isOpen={showBankrupt} onClose={() => setShowBankrupt(false)} />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🃏 Blackjack</h1>
        <p className="text-gray-400">Get as close to 21 as possible without going over</p>
      </div>

      <div className="card mb-6">
        {/* Dealer's Hand */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-400 mb-3">
            Dealer&apos;s Hand 
            {isGameOver && gameState?.dealer_value && <span className="ml-2 text-white">({gameState.dealer_value})</span>}
            {!isGameOver && gameState?.dealer_visible && <span className="ml-2 text-white">({gameState.dealer_visible})</span>}
          </h3>
          <div className="flex gap-3 flex-wrap justify-center min-h-[100px] items-center">
            {gameState?.dealer_hand ? (
              <>
                {gameState.dealer_hand.map((card, i) => (
                  <PlayingCard key={i} card={card} index={i} />
                ))}
                {!isGameOver && gameState.dealer_hand.length === 1 && (
                  <PlayingCard card={{ suit: 'spades', rank: '' }} hidden index={1} />
                )}
              </>
            ) : (
              <div className="text-gray-500">Deal to start</div>
            )}
          </div>
        </div>

        {/* Player's Hand */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-400 mb-3">
            Your Hand
            {gameState?.player_value && <span className="ml-2 text-white">({gameState.player_value})</span>}
          </h3>
          <div className="flex gap-3 flex-wrap justify-center min-h-[100px] items-center">
            {gameState?.player_hand ? (
              gameState.player_hand.map((card, i) => (
                <PlayingCard key={i} card={card} index={i} />
              ))
            ) : (
              <div className="text-gray-500">Place your bet and deal</div>
            )}
          </div>
        </div>

        {/* Message */}
        {gameState?.message && (
          <GameMessage 
            message={gameState.message}
            type={gameState.status === 'win' || gameState.status === 'blackjack' ? 'win' : 
                  gameState.status === 'playing' || gameState.status === 'push' ? 'info' : 'lose'}
            payout={gameState.payout}
          />
        )}

        {error && (
          <div className="mt-4 bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg animate-shake">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="card">
        {!gameState || isGameOver ? (
          <div className="space-y-4">
            <BetInput value={bet} onChange={setBet} maxBet={user.coins} disabled={playing} />
            <button
              onClick={() => handleAction('deal')}
              disabled={playing || bet > user.coins}
              className="btn btn-primary w-full text-lg py-4"
            >
              {playing ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner !w-5 !h-5"></div> Dealing...</span> : '🎴 Deal Cards'}
            </button>
          </div>
        ) : (
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => handleAction('hit')}
              disabled={playing}
              className="btn btn-primary flex-1 min-w-[120px] py-4 text-lg"
            >
              {playing ? '...' : '👆 Hit'}
            </button>
            <button
              onClick={() => handleAction('stand')}
              disabled={playing}
              className="btn btn-secondary flex-1 min-w-[120px] py-4 text-lg"
            >
              {playing ? '...' : '✋ Stand'}
            </button>
            {gameState.player_hand.length === 2 && user.coins >= bet && (
              <button
                onClick={() => handleAction('double')}
                disabled={playing}
                className="btn btn-secondary flex-1 min-w-[120px] py-4 text-lg"
              >
                {playing ? '...' : '⬆️ Double'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
