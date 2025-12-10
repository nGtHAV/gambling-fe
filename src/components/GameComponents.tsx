'use client';

import { Card } from '@/lib/api';

interface PlayingCardProps {
  card: Card;
  hidden?: boolean;
  animate?: boolean;
  index?: number;
  held?: boolean;
  onClick?: () => void;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export default function PlayingCard({ card, hidden, animate = true, index = 0, held, onClick }: PlayingCardProps) {
  const delay = index * 100;
  
  if (hidden) {
    return (
      <div 
        className={`playing-card hidden ${animate ? 'card-deal' : ''}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <span className="text-3xl">🂠</span>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const symbol = suitSymbols[card.suit];

  return (
    <div 
      className={`playing-card relative ${isRed ? 'red' : 'black'} ${animate ? 'card-deal' : ''} ${held ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#1a1a2e]' : ''} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold">{card.rank}</span>
        <span className="text-2xl">{symbol}</span>
      </div>
      {held && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          HOLD
        </div>
      )}
    </div>
  );
}

// Bet input component
interface BetInputProps {
  value: number;
  onChange: (value: number) => void;
  maxBet: number;
  disabled?: boolean;
}

export function BetInput({ value, onChange, maxBet, disabled }: BetInputProps) {
  const presets = [10, 50, 100, 500];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input (user is clearing the field)
    if (inputValue === '') {
      onChange(0);
      return;
    }
    
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
      onChange(Math.min(Math.max(0, numValue), maxBet));
    }
  };

  const handleBlur = () => {
    // Ensure minimum bet of 1 when leaving the field
    if (value < 1) {
      onChange(1);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="select-label !mb-0">Bet Amount</label>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-yellow-400 text-xl">🪙</span>
        <input
          type="number"
          value={value || ''}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input flex-1 text-lg font-bold"
          min={1}
          max={maxBet}
          disabled={disabled}
          placeholder="Enter bet"
        />
        <span className="text-gray-400 text-sm whitespace-nowrap">/ {maxBet.toLocaleString()}</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(Math.min(preset, maxBet))}
            disabled={disabled || preset > maxBet}
            className={`px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all hover:scale-105 active:scale-95 ${
              value === preset ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
            }`}
          >
            {preset}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(Math.floor(maxBet / 2))}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all hover:scale-105 active:scale-95 ${
            value === Math.floor(maxBet / 2) ? 'bg-[#e94560] text-white' : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
          }`}
        >
          ½
        </button>
        <button
          type="button"
          onClick={() => onChange(maxBet)}
          disabled={disabled}
          className="px-4 py-2 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e94560] rounded-lg text-sm font-semibold disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          MAX
        </button>
      </div>
    </div>
  );
}

// Game result message
interface GameMessageProps {
  message: string;
  type: 'win' | 'lose' | 'info';
  payout?: number;
}

export function GameMessage({ message, type, payout }: GameMessageProps) {
  const colors = {
    win: 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500 text-green-300',
    lose: 'bg-gradient-to-r from-red-900/50 to-rose-900/50 border-red-500 text-red-300',
    info: 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500 text-blue-300',
  };

  const icons = {
    win: '🎉',
    lose: '😢',
    info: '💡',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colors[type]} ${type === 'win' ? 'win-pulse' : type === 'lose' ? 'lose-shake' : 'animate-scaleIn'}`}>
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <p className="font-bold text-lg">{message}</p>
        <span className="text-2xl">{icons[type]}</span>
      </div>
      {payout !== undefined && payout !== 0 && (
        <p className={`text-center mt-2 text-xl font-bold ${payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {payout > 0 ? '+' : ''}{payout.toLocaleString()} 🪙
        </p>
      )}
    </div>
  );
}

// Dice component with animation
interface DiceProps {
  value: number;
  rolling?: boolean;
}

export function Dice({ value, rolling }: DiceProps) {
  const dots: Record<number, string> = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅',
  };

  return (
    <div className={`dice ${rolling ? 'animate-rollDice' : 'animate-scaleIn'}`}>
      <span className="text-4xl">{dots[value] || value}</span>
    </div>
  );
}
