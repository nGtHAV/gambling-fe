'use client';

import { useState, useEffect } from 'react';
import { api, CoinRequest } from '@/lib/api';

interface CoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
}

export default function CoinRequestModal({ isOpen, onClose, currentCoins }: CoinRequestModalProps) {
  const [amount, setAmount] = useState(1000);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [myRequests, setMyRequests] = useState<CoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const loadMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const requests = await api.getMyCoinRequests();
      setMyRequests(requests);
    } catch {
      // Ignore error
    }
    setLoadingRequests(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadMyRequests();
      setSuccess(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.requestCoins(amount, reason);
      setSuccess(true);
      setReason('');
      loadMyRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    }
    setLoading(false);
  };

  const hasPendingRequest = myRequests.some(r => r.status === 'pending');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-[#e94560]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🪙 Request Coins</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-gray-400 mt-2">
            Current balance: <span className="text-yellow-400 font-bold">{currentCoins.toLocaleString()}</span> coins
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Request Submitted!</h3>
              <p className="text-gray-400 mb-6">
                Your request has been sent to the admin for approval.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="btn btn-secondary"
              >
                Request More
              </button>
            </div>
          ) : hasPendingRequest ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Pending Request</h3>
              <p className="text-gray-400 mb-4">
                You already have a pending coin request. Please wait for admin approval.
              </p>
              {myRequests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} className="bg-[#2d2d44] rounded-lg p-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-yellow-400 font-bold">{req.amount.toLocaleString()} 🪙</span>
                  </div>
                  {req.reason && (
                    <div className="mt-2 text-sm text-gray-500">
                      Reason: {req.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount Selection */}
              <div>
                <label className="select-label">Amount to Request</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[500, 1000, 2000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-3 rounded-lg font-bold transition-all ${
                        amount === amt 
                          ? 'bg-[#e94560] text-white' 
                          : 'bg-[#2d2d44] hover:bg-[#3d3d54]'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(100, parseInt(e.target.value) || 0))}
                  className="input"
                  min={100}
                  max={10000}
                />
              </div>

              {/* Reason */}
              <div>
                <label className="select-label">Reason (Optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input min-h-[80px] resize-none"
                  placeholder="Why do you need more coins?"
                  maxLength={200}
                />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || amount < 100}
                className="btn btn-primary w-full py-4 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="loading-spinner !w-5 !h-5"></div>
                    Submitting...
                  </span>
                ) : (
                  `Request ${amount.toLocaleString()} Coins`
                )}
              </button>
            </form>
          )}

          {/* Request History */}
          {myRequests.length > 0 && !success && (
            <div className="mt-6 pt-6 border-t border-[#e94560]/20">
              <h3 className="font-bold mb-3 text-sm text-gray-400">Recent Requests</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {loadingRequests ? (
                  <div className="text-center py-4">
                    <div className="loading-spinner mx-auto"></div>
                  </div>
                ) : (
                  myRequests.slice(0, 5).map(req => (
                    <div 
                      key={req.id} 
                      className="flex items-center justify-between bg-[#2d2d44] rounded-lg p-3 text-sm"
                    >
                      <div>
                        <span className="text-yellow-400 font-bold">{req.amount.toLocaleString()}</span>
                        <span className="text-gray-500 ml-2">coins</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        req.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                        req.status === 'denied' ? 'bg-red-900/50 text-red-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
