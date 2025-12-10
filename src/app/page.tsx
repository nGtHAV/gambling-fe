'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/games/blackjack');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="text-white">Welcome to </span>
          <span className="text-[#e94560]">COSC Casino</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          The ultimate online casino experience! 
          Start with 1,000 free coins and test your luck!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn btn-primary text-lg px-8 py-4">
            🎰 Start Playing
          </Link>
          <Link href="/login" className="btn btn-secondary text-lg px-8 py-4">
            Already have an account?
          </Link>
        </div>
      </div>

      {/* Games Preview */}
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-8">Available Games</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Blackjack', emoji: '🃏' },
            { name: 'Poker', emoji: '♠️' },
            { name: 'Roulette', emoji: '🎰' },
            { name: 'Dice', emoji: '🎲' },
            { name: 'Minesweeper', emoji: '💣' },
          ].map((game) => (
            <div key={game.name} className="card text-center hover:border-[#e94560] transition-colors">
              <div className="text-4xl mb-2">{game.emoji}</div>
              <h3 className="font-bold">{game.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
