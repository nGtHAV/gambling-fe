'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api, DiceResult } from '@/lib/api';
import { BetInput, GameMessage } from '@/components/GameComponents';
import BankruptModal from '@/components/BankruptModal';

// 3D Dice Face Component
function DiceFace({ value, isRolling }: { value: number; isRolling: boolean }) {
  const dots = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  };

  return (
    <div 
      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl shadow-2xl ${
        isRolling ? 'animate-dice3D' : 'animate-diceSettle'
      }`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #e8e8e8 100%)',
        boxShadow: isRolling 
          ? '0 10px 30px rgba(0,0,0,0.4), inset 0 2px 10px rgba(255,255,255,0.8)' 
          : '0 8px 25px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.8)',
        transformStyle: 'preserve-3d',
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {dots[value as keyof typeof dots]?.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="10"
            fill="#1f2937"
            className={isRolling ? '' : 'animate-dotAppear'}
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function DicePage() {
  const { user, loading, updateCoins } = useAuth();
  const router = useRouter();
  const [bet, setBet] = useState(10);
  const [betType, setBetType] = useState<string>('over');
  const [betValue, setBetValue] = useState<string | number>(7);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<[number, number]>([1, 1]);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [showBankrupt, setShowBankrupt] = useState(false);
  const rollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    return () => {
      if (rollInterval.current) {
        clearInterval(rollInterval.current);
      }
    };
  }, []);

  const handleRoll = async () => {
    setRolling(true);
    setShowResult(false);
    setError('');
    setResult(null);
    
    // Fast dice changing animation
    rollInterval.current = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 80);
    
    try {
      const res = await api.playDice(betType, betValue, bet);
      
      // Slow down and stop
      setTimeout(() => {
        if (rollInterval.current) clearInterval(rollInterval.current);
        
        // Quick transitions to final values
        const finalDice: [number, number] = [res.die1, res.die2];
        let step = 0;
        const slowInterval = setInterval(() => {
          step++;
          if (step >= 5) {
            clearInterval(slowInterval);
            setDisplayDice(finalDice);
            setResult(res);
            setShowResult(true);
            updateCoins(res.coins);
            if (res.is_bankrupt) {
              setShowBankrupt(true);
            }
            setRolling(false);
          } else {
            setDisplayDice([
              Math.floor(Math.random() * 6) + 1,
              Math.floor(Math.random() * 6) + 1
            ]);
          }
        }, 200);
      }, 1200);
      
    } catch (err) {
      if (rollInterval.current) clearInterval(rollInterval.current);
      setError(err instanceof Error ? err.message : 'Game error');
      setRolling(false);
    }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-[80vh]">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BankruptModal isOpen={showBankrupt} onClose={() => setShowBankrupt(false)} />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎲 Dice</h1>
        <p className="text-gray-400">Predict the outcome of two dice</p>
      </div>

      {/* Dice Display */}
      <div className="card mb-6 text-center">
        {/* Dice Table */}
        <div className="relative py-8">
          {/* Felt background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-900 rounded-xl opacity-50" />
          
          {/* Dice container */}
          <div className="relative flex justify-center gap-6 md:gap-10 mb-6">
            <div className={`transform ${rolling ? '' : 'hover:scale-105'} transition-transform duration-200`}>
              <DiceFace value={displayDice[0]} isRolling={rolling} />
            </div>
            <div className={`transform ${rolling ? '' : 'hover:scale-105'} transition-transform duration-200`} style={{ animationDelay: '0.1s' }}>
              <DiceFace value={displayDice[1]} isRolling={rolling} />
            </div>
          </div>
          
          {/* Rolling indicator */}
          {rolling && (
            <div className="flex justify-center gap-2 mb-4">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
        
        {/* Result */}
        {showResult && result && (
          <div className="animate-scaleIn">
            <div className={`text-4xl md:text-5xl font-bold mb-4 ${result.won ? 'animate-winPulse text-green-400' : 'animate-loseShake text-red-400'}`}>
              Total: <span className="text-yellow-400">{result.total}</span>
            </div>
            <GameMessage
              message={result.message}
              type={result.won ? 'win' : 'lose'}
            />
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Betting Options */}
      <div className="card mb-6">
        <h3 className="font-bold mb-4">Place Your Bet</h3>
        
        {/* Bet Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          <button
            onClick={() => { setBetType('over'); setBetValue(7); }}
            className={`p-3 rounded-lg font-medium transition-colors ${
              betType === 'over' ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
            }`}
          >
            Over (1x)
          </button>
          <button
            onClick={() => { setBetType('under'); setBetValue(7); }}
            className={`p-3 rounded-lg font-medium transition-colors ${
              betType === 'under' ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
            }`}
          >
            Under (1x)
          </button>
          <button
            onClick={() => { setBetType('seven'); setBetValue('seven'); }}
            className={`p-3 rounded-lg font-medium transition-colors ${
              betType === 'seven' ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
            }`}
          >
            Lucky 7 (4x)
          </button>
          <button
            onClick={() => { setBetType('odd_even'); setBetValue('odd'); }}
            className={`p-3 rounded-lg font-medium transition-colors ${
              betType === 'odd_even' ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
            }`}
          >
            Odd/Even (1x)
          </button>
          <button
            onClick={() => { setBetType('exact'); setBetValue(7); }}
            className={`p-3 rounded-lg font-medium transition-colors ${
              betType === 'exact' ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
            }`}
          >
            Exact (5-35x)
          </button>
        </div>

        {/* Value Selection */}
        <div className="mb-4">
          {betType === 'over' && (
            <div className="text-center">
              <p className="text-gray-400 mb-2">Betting that total will be over:</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {[6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setBetValue(n)}
                    className={`w-12 h-12 rounded-lg font-bold transition-all ${
                      betValue === n ? 'bg-[#e94560] scale-110' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {betType === 'under' && (
            <div className="text-center">
              <p className="text-gray-400 mb-2">Betting that total will be under:</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {[5, 6, 7, 8, 9].map(n => (
                  <button
                    key={n}
                    onClick={() => setBetValue(n)}
                    className={`w-12 h-12 rounded-lg font-bold transition-all ${
                      betValue === n ? 'bg-[#e94560] scale-110' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {betType === 'seven' && (
            <div className="text-center">
              <p className="text-yellow-400 text-lg">🎯 Betting that total will be exactly 7!</p>
              <p className="text-gray-400 text-sm">Pays 4x if you win</p>
            </div>
          )}

          {betType === 'odd_even' && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setBetValue('odd')}
                className={`w-24 h-16 rounded-lg font-bold ${
                  betValue === 'odd' ? 'bg-[#e94560]' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
                }`}
              >
                Odd
              </button>
              <button
                onClick={() => setBetValue('even')}
                className={`w-24 h-16 rounded-lg font-bold ${
                  betValue === 'even' ? 'bg-[#e94560]' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
                }`}
              >
                Even
              </button>
            </div>
          )}

          {betType === 'exact' && (
            <div className="text-center">
              <p className="text-gray-400 mb-2">Betting on exact total:</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {Array.from({ length: 11 }, (_, i) => i + 2).map(n => (
                  <button
                    key={n}
                    onClick={() => setBetValue(n)}
                    className={`w-12 h-12 rounded-lg font-bold ${
                      betValue === n ? 'bg-[#e94560]' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Payout: {betValue === 2 || betValue === 12 ? '35x' : 
                         betValue === 3 || betValue === 11 ? '17x' :
                         betValue === 4 || betValue === 10 ? '11x' :
                         betValue === 5 || betValue === 9 ? '8x' :
                         betValue === 6 || betValue === 8 ? '6x' : '5x'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bet Amount & Roll */}
      <div className="card">
        <BetInput value={bet} onChange={setBet} maxBet={user.coins} disabled={rolling} />
        <button
          onClick={handleRoll}
          disabled={rolling || bet > user.coins}
          className="btn btn-primary w-full mt-4"
        >
          {rolling ? 'Rolling...' : '🎲 Roll Dice!'}
        </button>
      </div>
    </div>
  );
}
