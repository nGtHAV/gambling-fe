'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api, PokerResult, Card } from '@/lib/api';
import PlayingCard, { BetInput, GameMessage } from '@/components/GameComponents';
import BankruptModal from '@/components/BankruptModal';

interface PokerGameState {
  hand: Card[];
  deck: Card[];
}

export default function PokerPage() {
  const { user, loading, updateCoins } = useAuth();
  const router = useRouter();
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<PokerResult | null>(null);
  const [savedState, setSavedState] = useState<PokerGameState | null>(null);
  const [holdIndices, setHoldIndices] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [showBankrupt, setShowBankrupt] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleDeal = async () => {
    setPlaying(true);
    setError('');
    setHoldIndices([]);
    try {
      const result = await api.playPoker('deal', bet);
      setGameState(result);
      setSavedState({ 
        hand: result.hand, 
        deck: (result as unknown as PokerGameState).deck || [] 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Game error');
    }
    setPlaying(false);
  };

  const handleDraw = async () => {
    if (!savedState) return;
    setPlaying(true);
    setError('');
    try {
      const result = await api.playPoker('draw', bet, holdIndices, savedState);
      setGameState(result);
      setSavedState(null);
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

  const toggleHold = (index: number) => {
    if (holdIndices.includes(index)) {
      setHoldIndices(holdIndices.filter(i => i !== index));
    } else {
      setHoldIndices([...holdIndices, index]);
    }
  };

  const isGameOver = gameState && ['win', 'lose'].includes(gameState.status);

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-[80vh]"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <BankruptModal isOpen={showBankrupt} onClose={() => setShowBankrupt(false)} />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">♠️ Video Poker</h1>
        <p className="text-gray-400">Jacks or Better - Hold your best cards and draw</p>
      </div>

      {/* Payout Table */}
      <div className="card mb-6 overflow-x-auto">
        <h3 className="font-bold mb-3">Payouts</h3>
        <div className="flex gap-4 text-sm">
          {[
            { hand: 'Royal Flush', payout: '250x' },
            { hand: 'Straight Flush', payout: '50x' },
            { hand: 'Four of a Kind', payout: '25x' },
            { hand: 'Full House', payout: '9x' },
            { hand: 'Flush', payout: '6x' },
            { hand: 'Straight', payout: '4x' },
            { hand: 'Three of a Kind', payout: '3x' },
            { hand: 'Two Pair', payout: '2x' },
            { hand: 'Jacks+', payout: '1x' },
          ].map(({ hand, payout }) => (
            <div key={hand} className="text-center whitespace-nowrap">
              <div className="text-yellow-400 font-bold">{payout}</div>
              <div className="text-gray-400 text-xs">{hand}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-6">
        {/* Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-400 mb-3">Your Hand</h3>
          <div className="flex gap-3 flex-wrap justify-center min-h-[120px] items-center">
            {gameState?.hand ? (
              gameState.hand.map((card, i) => (
                <PlayingCard 
                  key={i} 
                  card={card} 
                  index={i}
                  held={holdIndices.includes(i)}
                  onClick={!isGameOver ? () => toggleHold(i) : undefined}
                />
              ))
            ) : (
              <div className="text-gray-500">Place your bet and deal</div>
            )}
          </div>
          {gameState?.status === 'playing' && (
            <p className="text-center text-gray-400 text-sm mt-4">👆 Click cards to hold them</p>
          )}
        </div>

        {/* Result */}
        {gameState?.hand_type && isGameOver && (
          <GameMessage 
            message={`${gameState.hand_type.replace(/_/g, ' ').toUpperCase()}${gameState.multiplier && gameState.multiplier > 0 ? ` - ${gameState.multiplier}x!` : ''}`}
            type={gameState.status === 'win' ? 'win' : 'lose'}
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
              onClick={handleDeal}
              disabled={playing || bet > user.coins}
              className="btn btn-primary w-full text-lg py-4"
            >
              {playing ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner !w-5 !h-5"></div> Dealing...</span> : '🎴 Deal Cards'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleDraw}
            disabled={playing}
            className="btn btn-primary w-full text-lg py-4"
          >
            {playing ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner !w-5 !h-5"></div> Drawing...</span> : `🔄 Draw ${5 - holdIndices.length} Card${5 - holdIndices.length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </div>
  );
}
