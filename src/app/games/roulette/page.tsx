'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api, RouletteResult } from '@/lib/api';
import { BetInput, GameMessage } from '@/components/GameComponents';
import BankruptModal from '@/components/BankruptModal';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Wheel numbers in order (European roulette)
const WHEEL_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

export default function RoulettePage() {
  const { user, loading, updateCoins } = useAuth();
  const router = useRouter();
  const [bet, setBet] = useState(10);
  const [betType, setBetType] = useState<string>('color');
  const [betValue, setBetValue] = useState<string | number>('red');
  const [result, setResult] = useState<RouletteResult | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [showBankrupt, setShowBankrupt] = useState(false);
  const pendingResult = useRef<RouletteResult | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSpin = async () => {
    setSpinning(true);
    setShowResult(false);
    setError('');
    setResult(null);
    
    try {
      // Get result from API first
      const res = await api.playRoulette(betType, betValue, bet);
      pendingResult.current = res;
      
      // Calculate target position based on result
      // The pointer is at the top (0 degrees), so we need to rotate the winning number to the top
      const resultIndex = WHEEL_NUMBERS.indexOf(typeof res.result === 'number' ? res.result : 0);
      const segmentAngle = 360 / WHEEL_NUMBERS.length;
      
      // To get number at index to appear at top, we need to rotate wheel by -(index * segmentAngle)
      // But we want to rotate forward (positive), so we use (360 - (index * segmentAngle))
      // Also add offset to center the segment under the pointer
      const targetAngle = 360 - (resultIndex * segmentAngle) - (segmentAngle / 2);
      
      // Spin wheel: multiple full rotations + target position
      const spins = 5 + Math.random() * 2; // 5-7 full rotations
      const finalRotation = Math.floor(wheelRotation / 360) * 360 + (spins * 360) + targetAngle;
      
      setWheelRotation(finalRotation);
      
      // Wait for animation to complete
      setTimeout(() => {
        setResult(res);
        setShowResult(true);
        updateCoins(res.coins);
        if (res.is_bankrupt) {
          setShowBankrupt(true);
        }
        setSpinning(false);
      }, 4000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Game error');
      setSpinning(false);
    }
  };

  const getNumberColor = (n: number | string): 'red' | 'black' | 'green' => {
    if (n === 0 || n === '00') return 'green';
    if (RED_NUMBERS.includes(n as number)) return 'red';
    return 'black';
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-[80vh]">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BankruptModal isOpen={showBankrupt} onClose={() => setShowBankrupt(false)} />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎰 Roulette</h1>
        <p className="text-gray-400">Place your bets and spin the wheel</p>
      </div>

      {/* Roulette Wheel */}
      <div className="card mb-6 text-center overflow-hidden">
        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Outer ring decoration */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-700 to-amber-900 shadow-2xl" />
          
          {/* Wheel */}
          <div 
            className="absolute inset-2 rounded-full overflow-hidden transition-transform"
            style={{ 
              transform: `rotate(${wheelRotation}deg)`,
              transitionDuration: spinning ? '4s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
            }}
          >
            {/* Wheel segments */}
            <div className="w-full h-full relative">
              {WHEEL_NUMBERS.map((num, i) => {
                const angle = (i * 360) / WHEEL_NUMBERS.length;
                const color = getNumberColor(num);
                return (
                  <div
                    key={i}
                    className="absolute w-full h-full flex items-start justify-center"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div 
                      className={`w-6 h-28 ${
                        color === 'red' ? 'bg-red-600' : 
                        color === 'green' ? 'bg-green-600' : 'bg-gray-900'
                      } flex items-start justify-center pt-1`}
                      style={{ 
                        clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)',
                      }}
                    >
                      <span className="text-white text-xs font-bold">{num}</span>
                    </div>
                  </div>
                );
              })}
              {/* Center */}
              <div className="absolute inset-1/4 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 shadow-inner flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-amber-400 shadow-lg" />
              </div>
            </div>
          </div>
          
          {/* Ball - fixed at top position */}
          <div 
            className={`absolute w-4 h-4 rounded-full bg-white shadow-lg z-10 ${spinning ? 'animate-pulse' : ''}`}
            style={{ 
              top: '12px',
              left: '50%',
              marginLeft: '-8px',
              boxShadow: '0 0 10px rgba(255,255,255,0.8), inset 0 0 3px rgba(0,0,0,0.3)'
            }}
          />
          
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-yellow-400 z-20 drop-shadow-lg" />
        </div>
        
        {/* Result Display */}
        {showResult && result && (
          <div className={`animate-scaleIn`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold mb-4 ${
              result.won ? 'animate-winPulse' : 'animate-loseShake'
            } ${
              result.color === 'red' ? 'bg-red-600' : 
              result.color === 'green' ? 'bg-green-600' : 'bg-gray-900'
            } shadow-lg`}>
              {result.result}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
          {[
            { type: 'color', label: 'Color', values: ['red', 'black'] },
            { type: 'odd_even', label: 'Odd/Even', values: ['odd', 'even'] },
            { type: 'high_low', label: 'High/Low', values: ['high', 'low'] },
            { type: 'dozen', label: 'Dozen', values: [1, 2, 3] },
          ].map(({ type, label }) => (
            <button
              key={type}
              onClick={() => {
                setBetType(type);
                setBetValue(type === 'color' ? 'red' : type === 'odd_even' ? 'odd' : type === 'high_low' ? 'high' : 1);
              }}
              className={`p-3 rounded-lg font-medium transition-colors ${
                betType === type ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              setBetType('number');
              setBetValue(0);
            }}
            className={`p-3 rounded-lg font-medium transition-colors ${
              betType === 'number' ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
            }`}
          >
            Number (35x)
          </button>
        </div>

        {/* Value Selection */}
        <div className="mb-6">
          {betType === 'color' && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setBetValue('red')}
                className={`w-24 h-24 rounded-lg text-xl font-bold transition-transform ${
                  betValue === 'red' ? 'ring-4 ring-white scale-105' : ''
                } bg-red-600`}
              >
                Red
              </button>
              <button
                onClick={() => setBetValue('black')}
                className={`w-24 h-24 rounded-lg text-xl font-bold transition-transform ${
                  betValue === 'black' ? 'ring-4 ring-white scale-105' : ''
                } bg-gray-900`}
              >
                Black
              </button>
            </div>
          )}

          {betType === 'odd_even' && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setBetValue('odd')}
                className={`w-24 h-24 rounded-lg text-xl font-bold transition-transform bg-[#2d2d44] ${
                  betValue === 'odd' ? 'ring-4 ring-[#e94560] scale-105' : ''
                }`}
              >
                Odd
              </button>
              <button
                onClick={() => setBetValue('even')}
                className={`w-24 h-24 rounded-lg text-xl font-bold transition-transform bg-[#2d2d44] ${
                  betValue === 'even' ? 'ring-4 ring-[#e94560] scale-105' : ''
                }`}
              >
                Even
              </button>
            </div>
          )}

          {betType === 'high_low' && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setBetValue('low')}
                className={`w-24 h-24 rounded-lg text-lg font-bold transition-transform bg-[#2d2d44] ${
                  betValue === 'low' ? 'ring-4 ring-[#e94560] scale-105' : ''
                }`}
              >
                Low<br/>(1-18)
              </button>
              <button
                onClick={() => setBetValue('high')}
                className={`w-24 h-24 rounded-lg text-lg font-bold transition-transform bg-[#2d2d44] ${
                  betValue === 'high' ? 'ring-4 ring-[#e94560] scale-105' : ''
                }`}
              >
                High<br/>(19-36)
              </button>
            </div>
          )}

          {betType === 'dozen' && (
            <div className="flex gap-4 justify-center">
              {[1, 2, 3].map(d => (
                <button
                  key={d}
                  onClick={() => setBetValue(d)}
                  className={`w-24 h-24 rounded-lg text-lg font-bold transition-transform bg-[#2d2d44] ${
                    betValue === d ? 'ring-4 ring-[#e94560] scale-105' : ''
                  }`}
                >
                  {d === 1 ? '1-12' : d === 2 ? '13-24' : '25-36'}
                </button>
              ))}
            </div>
          )}

          {betType === 'number' && (
            <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
              <button
                onClick={() => setBetValue(0)}
                className={`roulette-number roulette-green ${betValue === 0 ? 'ring-2 ring-white' : ''}`}
              >
                0
              </button>
              {Array.from({ length: 36 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setBetValue(n)}
                  className={`roulette-number roulette-${getNumberColor(n)} ${
                    betValue === n ? 'ring-2 ring-white' : ''
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bet Amount & Spin */}
      <div className="card">
        <BetInput value={bet} onChange={setBet} maxBet={user.coins} disabled={spinning} />
        <button
          onClick={handleSpin}
          disabled={spinning || bet > user.coins}
          className="btn btn-primary w-full mt-4"
        >
          {spinning ? 'Spinning...' : 'Spin!'}
        </button>
      </div>
    </div>
  );
}
