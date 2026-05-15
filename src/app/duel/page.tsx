'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Zap, ArrowLeft, Wallet, Monitor, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@database/utils';

const DuelGame = dynamic(() => import('@/components/game/DuelGame'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen bg-brand-navy text-white">
    <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
  </div>
});

export default function DuelPage() {
  const [pledge, setPledge] = useState<number | null>(null);
  const [mode, setMode] = useState<'solo' | '1v1'>('1v1');
  const [confirmed, setConfirmed] = useState(false);

  const options = [100, 200, 500, 1000, 2000, 5000];

  if (confirmed && pledge) {
    return <DuelGame pledge={pledge} mode={mode} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-pink/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-brand-pink mb-8 font-black uppercase text-xs tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="glass-card p-8 sm:p-12 space-y-10 bg-white/5 border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
              <Zap className="text-brand-pink w-8 h-8 fill-brand-pink" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">Arena Selection</h1>
              <p className="font-bold text-white/40 uppercase text-[10px] tracking-[0.3em]">Choose your opponent and wager</p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2">Choose Arena Mode</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('1v1')}
                className={cn(
                  "p-8 rounded-[2.5rem] border-2 flex flex-col gap-4 transition-all text-left relative overflow-hidden group",
                  mode === '1v1' ? "border-brand-pink bg-brand-pink/5" : "border-white/5 bg-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                  mode === '1v1' ? "bg-brand-pink text-white shadow-[0_0_30px_rgba(255,51,255,0.4)]" : "bg-white/5 text-white/40 group-hover:text-white"
                )}>
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-black uppercase text-base tracking-tight text-white mb-1">Human Duel</div>
                  <div className="text-xs font-bold text-white/40">Battle real opponents 1v1</div>
                </div>
              </button>

              <button
                onClick={() => setMode('solo')}
                className={cn(
                  "p-8 rounded-[2.5rem] border-2 flex flex-col gap-4 transition-all text-left relative overflow-hidden group",
                  mode === 'solo' ? "border-brand-teal bg-brand-teal/5" : "border-white/5 bg-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                  mode === 'solo' ? "bg-brand-teal text-white shadow-[0_0_30px_rgba(79,209,197,0.4)]" : "bg-white/5 text-white/40 group-hover:text-white"
                )}>
                  <Monitor className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-black uppercase text-base tracking-tight text-white mb-1">The Computer</div>
                  <div className="text-xs font-bold text-white/40">Solo - Perfect score wins 2x</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2">Select Wager</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPledge(opt)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all text-center group",
                    pledge === opt 
                      ? 'border-brand-pink bg-brand-pink/10 text-white' 
                      : 'border-white/5 bg-white/5 hover:border-white/10 text-white/40'
                  )}
                >
                  <div className="text-xl font-black">₦{opt.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Potential Payout</div>
              <div className="text-4xl font-black text-brand-teal tracking-tighter">
                ₦{pledge ? (mode === 'solo' ? pledge * 2 : pledge * 1.8).toLocaleString() : '0'}
              </div>
            </div>
            <button
              disabled={!pledge}
              onClick={() => setConfirmed(true)}
              className={cn(
                "btn-fun px-12 py-5 text-xl w-full sm:w-auto shadow-2xl transition-all disabled:opacity-30 disabled:grayscale",
                mode === 'solo' ? "bg-brand-teal text-brand-navy" : "bg-brand-pink text-white shadow-brand-pink/40"
              )}
            >
              {mode === 'solo' ? 'Battle Bot' : 'Enter Arena'}
            </button>
          </div>

          <p className="text-[10px] text-center font-bold text-white/20 uppercase tracking-[0.2em] leading-relaxed">
            {mode === 'solo' 
              ? "Computer Arena: No house fee. Win 2x if you answer ALL correctly."
              : "1v1 Arena: 10% house fee. Winner takes the pot."}
          </p>
        </div>
      </div>
    </div>
  );
}
