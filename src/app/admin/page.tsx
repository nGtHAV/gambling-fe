'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api, CoinRequest } from '@/lib/api';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<CoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const data = await api.getPendingRequests();
      setRequests(data);
    } catch {
      console.error('Failed to load requests');
    }
    setLoadingRequests(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.user.is_staff) {
        router.push('/');
      } else {
        loadRequests();
      }
    }
  }, [user, loading, router, loadRequests]);

  const handleApprove = async (requestId: number) => {
    setProcessing(requestId);
    try {
      await api.approveRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Failed to approve', err);
    }
    setProcessing(null);
  };

  const handleDeny = async (requestId: number) => {
    setProcessing(requestId);
    try {
      await api.denyRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Failed to deny', err);
    }
    setProcessing(null);
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-[80vh]">Loading...</div>;
  }

  if (!user.user.is_staff) {
    return <div className="flex items-center justify-center min-h-[80vh]">Access Denied</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">👑 Admin Panel</h1>
        <p className="text-gray-400">Manage coin requests from bankrupt users</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Pending Coin Requests</h2>
        
        {loadingRequests ? (
          <div className="text-center py-8 text-gray-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No pending requests 🎉
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-[#0f0f23] rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white">{request.user.username}</div>
                    <div className="text-sm text-gray-400">{request.user.email}</div>
                    <div className="text-yellow-400 font-medium mt-1">
                      Requesting: {request.amount.toLocaleString()} coins
                    </div>
                    {request.reason && (
                      <div className="text-gray-500 text-sm mt-2 italic">
                        &ldquo;{request.reason}&rdquo;
                      </div>
                    )}
                    <div className="text-gray-500 text-xs mt-2">
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processing === request.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleDeny(request.id)}
                      disabled={processing === request.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      ❌ Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Stats */}
      <div className="card mt-6">
        <h2 className="text-xl font-bold mb-4">📊 Why This Site Exists</h2>
        <div className="text-gray-400 space-y-3">
          <p>
            This gambling demo site is designed to educate users about the mathematics 
            of gambling. Every game has a built-in house edge of 5-10%, ensuring that 
            over time, all players will lose their money.
          </p>
          <p>
            When users go bankrupt, they see an educational popup explaining:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>The concept of house edge</li>
            <li>Expected value calculations</li>
            <li>The gambler&apos;s fallacy</li>
            <li>Real statistics from their play session</li>
            <li>Resources for gambling addiction help</li>
          </ul>
          <p className="text-yellow-400">
            By approving coin requests, you&apos;re allowing users to continue their 
            educational journey. They will eventually lose again - that&apos;s the point!
          </p>
        </div>
      </div>
    </div>
  );
}
