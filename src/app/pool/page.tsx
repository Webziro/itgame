'use client';

import React, { useState, useEffect } from 'react';
import { getActivePool, joinPool } from '@logic/pool-actions';
import PoolGame from '@/components/game/PoolGame';
import { Trophy, ArrowLeft, Users, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PoolPage() {
  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [gameData, setGameData] = useState<{ questions: any[], participantId: string } | null>(null);

  useEffect(() => {
    async function fetchPool() {
      try {
        const p = await getActivePool();
        setPool(p);
      } catch (err) {
        console.error("Failed to fetch pool:", err);
        setPool(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPool();
  }, []);

  const handleJoin = async () => {
    if (!pool) return;
    setJoining(true);
    try {
      const res = await joinPool(pool.id);
      setGameData(res);
    } catch (err: any) {
      alert(err.message || "Failed to join pool");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-12 h-12 text-brand-orange" /></div>;

  if (gameData) {
    return <PoolGame questions={gameData.questions} participantId={gameData.participantId} />;
  }

  return (
    <div className="min-h-screen bg-[#fdf8f4] p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-orange mb-8 font-black uppercase text-xs tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {pool ? (
          <div className="space-y-8">
            <div className="card-premium p-12 bg-white relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] opacity-5">
                <Trophy className="w-64 h-64 text-brand-orange fill-brand-orange" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-brand-orange rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-orange/20">
                    <Trophy className="text-white w-10 h-10 fill-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black text-brand-navy tracking-tighter">THE WEEKLY POOL</h1>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="badge bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Star className="w-3 h-3 fill-brand-orange" /> Live Now
                      </span>
                      <span className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                        <Users className="w-4 h-4" /> {pool._count.participants} Joined
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-brand-navy text-white space-y-1">
                    <div className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Current Jackpot</div>
                    <div className="text-4xl font-black">₦{pool.totalStaked.toLocaleString()}</div>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-slate-100 space-y-1">
                    <div className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Entry Fee</div>
                    <div className="text-4xl font-black text-brand-navy">₦{pool.entryFee.toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-40 px-2">Prize Distribution</h3>
                  <div className="grid gap-3">
                    {[
                      { rank: '1st Place', share: '60%', color: 'text-brand-orange' },
                      { rank: '2nd Place', share: '20%', color: 'text-slate-600' },
                      { rank: '3rd Place', share: '10%', color: 'text-slate-500' },
                    ].map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-black text-brand-navy">{p.rank}</span>
                        <span className={`font-black ${p.color}`}>{p.share} of Pot</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="btn-fun bg-brand-orange hover:bg-brand-orange-dark text-white w-full py-6 text-xl shadow-2xl shadow-brand-orange/30 flex items-center justify-center gap-3"
                >
                  {joining ? <Loader2 className="animate-spin w-6 h-6" /> : 'Enter Jackpot Pool'}
                </button>
                <p className="text-center text-xs font-bold opacity-30 italic">Warning: 10 Hard questions. 15 seconds each. Speed matters.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-premium p-12 text-center space-y-6">
            <Trophy className="w-20 h-20 text-slate-200 mx-auto" />
            <h2 className="text-3xl font-black text-brand-navy">No Active Pool</h2>
            <p className="text-slate-500 max-w-md mx-auto">The Weekly Jackpot Pool goes live every Friday at 7:00 PM. Make sure your notifications are on!</p>
            <div className="inline-block px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-brand-navy">
              Next Launch: Friday, 19:00 (WAT)
            </div>
            <br />
            <Link href="/dashboard" className="btn-fun bg-brand-navy text-white inline-block mt-8 px-12">Return to Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
}
