'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import CoinRequestModal from './CoinRequestModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showCoinModal, setShowCoinModal] = useState(false);

  return (
    <>
      <CoinRequestModal 
        isOpen={showCoinModal} 
        onClose={() => setShowCoinModal(false)} 
        currentCoins={user?.coins || 0}
      />
      
      <nav className="bg-[#1a1a2e] border-b border-[#e94560]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎰</span>
              <span className="font-bold text-xl text-white">COSC <span className="text-[#e94560]">Casino</span></span>
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Coins - Clickable */}
                  <button
                    onClick={() => setShowCoinModal(true)}
                    className="coins-display cursor-pointer hover:scale-105 transition-transform active:scale-95"
                    title="Click to request more coins"
                  >
                    <span>🪙</span>
                    <span>{user.coins.toLocaleString()}</span>
                    <span className="text-xs opacity-75">+</span>
                  </button>

                  {/* User menu */}
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm hidden sm:block">
                      {user.user.username}
                    </span>
                    {user.user.is_staff && (
                      <Link
                        href="/admin"
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary text-sm py-2 px-4">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
