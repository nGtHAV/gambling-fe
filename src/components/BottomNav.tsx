'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const games = [
    { name: 'Blackjack', path: '/games/blackjack', emoji: '🃏' },
    { name: 'Poker', path: '/games/poker', emoji: '♠️' },
    { name: 'Roulette', path: '/games/roulette', emoji: '🎰' },
    { name: 'Dice', path: '/games/dice', emoji: '🎲' },
    { name: 'Mines', path: '/games/minesweeper', emoji: '💣' },
  ];

  return (
    <nav className="bottom-nav md:hidden">
      {games.map((game) => (
        <Link
          key={game.path}
          href={game.path}
          className={`bottom-nav-item ${pathname === game.path ? 'active' : ''}`}
        >
          <span className="text-xl">{game.emoji}</span>
          <span>{game.name}</span>
        </Link>
      ))}
    </nav>
  );
}
