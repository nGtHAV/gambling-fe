'use client';

import { useAuth } from '@/contexts/AuthContext';
import { api, EducationContent } from '@/lib/api';
import { useState, useEffect } from 'react';

interface BankruptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BankruptModal({ isOpen, onClose }: BankruptModalProps) {
  const { user, refreshProfile } = useAuth();
  const [education, setEducation] = useState<EducationContent | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getEducation().then(setEducation).catch(console.error);
    }
  }, [isOpen]);

  const handleRequestCoins = async () => {
    setRequesting(true);
    setError('');
    try {
      await api.requestCoins(1000, 'I lost all my coins and want to try again.');
      setRequested(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request coins');
    }
    setRequesting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#1a1a2e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold text-white text-center">💸 You&apos;re Bankrupt!</h2>
          <p className="text-red-200 text-center mt-2">
            You&apos;ve lost all your coins. Here&apos;s why this was inevitable...
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats */}
          {user && (
            <div className="bg-[#0f0f23] rounded-xl p-4">
              <h3 className="text-xl font-bold text-red-400 mb-3">📊 Your Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Total Wagered:</span>
                  <span className="ml-2 text-white font-bold">{user.total_wagered.toLocaleString()} coins</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Lost:</span>
                  <span className="ml-2 text-red-400 font-bold">{user.total_lost.toLocaleString()} coins</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Won:</span>
                  <span className="ml-2 text-green-400 font-bold">{user.total_won.toLocaleString()} coins</span>
                </div>
                <div>
                  <span className="text-gray-400">Games Played:</span>
                  <span className="ml-2 text-white font-bold">{user.games_played}</span>
                </div>
              </div>
              {user.total_wagered > 0 && (
                <div className="mt-4 p-3 bg-red-900/30 rounded-lg">
                  <p className="text-red-300 text-sm">
                    💡 You lost <strong>{((user.total_lost / user.total_wagered) * 100).toFixed(1)}%</strong> of 
                    everything you wagered. This is the house edge in action.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Education Content */}
          {education && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-yellow-400">⚠️ {education.title}</h3>
              
              {education.sections.map((section, index) => (
                <div key={index} className="bg-[#0f0f23] rounded-xl p-4">
                  <h4 className="font-bold text-white mb-2">{section.title}</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-line">{section.content}</p>
                </div>
              ))}

              {/* Math Breakdown */}
              <div className="bg-[#0f0f23] rounded-xl p-4">
                <h4 className="font-bold text-white mb-3">🎰 House Edge in Our Games</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Game</th>
                        <th className="text-left py-2">Fair Edge</th>
                        <th className="text-left py-2">Our Edge</th>
                        <th className="text-left py-2">Your Loss/100 Bets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(education.math_breakdown).map(([game, data]) => (
                        <tr key={game} className="border-b border-gray-800">
                          <td className="py-2 capitalize font-medium">{game}</td>
                          <td className="py-2 text-gray-400">{data.base_house_edge}</td>
                          <td className="py-2 text-red-400 font-bold">{data.our_house_edge}</td>
                          <td className="py-2 text-red-400">{data.expected_loss_per_100_bets}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Request More Coins */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-4 border border-yellow-600/30">
            <h4 className="font-bold text-yellow-400 mb-2">🎁 Want More Coins?</h4>
            <p className="text-gray-300 text-sm mb-4">
              You can request more coins, but an admin must approve it. Remember, 
              continuing to gamble won&apos;t change the math – you&apos;ll eventually lose again.
            </p>
            
            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}
            
            {requested ? (
              <div className="bg-green-900/30 p-3 rounded-lg">
                <p className="text-green-400 text-sm">
                  ✅ Request submitted! An admin will review it shortly.
                </p>
              </div>
            ) : (
              <button
                onClick={handleRequestCoins}
                disabled={requesting}
                className="btn btn-secondary w-full"
              >
                {requesting ? 'Requesting...' : 'Request 1,000 Coins'}
              </button>
            )}
          </div>

          {/* Close Button */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                refreshProfile();
                onClose();
              }}
              className="btn btn-primary flex-1"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
