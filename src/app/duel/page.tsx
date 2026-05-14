'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const DuelGame = dynamic(() => import('@/components/game/DuelGame'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen bg-brand-navy text-white">
    <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
  </div>
});

import { Zap, ArrowLeft, Wallet, Monitor, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@database/utils';

export default function DuelPage() {
  const [pledge, setPledge] = useState<number | null>(null);
  const [mode, setMode] = useState<'solo' | '1v1'>('1v1');
  const [confirmed, setConfirmed] = useState(false);

  const options = [100, 200, 500, 1000, 2000, 5000];

  if (confirmed && pledge) {
    return <DuelGame pledge={pledge} mode={mode} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="card-premium p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center">
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-brand-navy uppercase tracking-tighter">Arena Selection</h1>
              <p className="font-bold opacity-40">Choose your opponent and wager</p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-[0.2em] opacity-40 px-2">Choose Arena Mode</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('1v1')}
                className={cn(
                  "p-6 rounded-3xl border-2 flex items-center gap-4 transition-all text-left group",
                  mode === '1v1' ? "border-brand-pink bg-white shadow-xl shadow-brand-pink/10" : "border-slate-100 bg-white hover:border-brand-pink/30"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  mode === '1v1' ? "bg-brand-pink text-white" : "bg-slate-100 text-slate-400 group-hover:bg-brand-pink/10 group-hover:text-brand-pink"
                )}>
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black uppercase text-sm tracking-tight text-brand-navy">1v1 Human Duel</div>
                  <div className="text-xs font-bold text-brand-navy/50">Battle real opponents</div>
                </div>
              </button>

              <button
                onClick={() => setMode('solo')}
                className={cn(
                  "p-6 rounded-3xl border-2 flex items-center gap-4 transition-all text-left group",
                  mode === 'solo' ? "border-brand-navy bg-brand-navy text-white shadow-xl shadow-brand-navy/30" : "border-slate-100 bg-white hover:border-brand-navy/30"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  mode === 'solo' ? "bg-white text-brand-navy" : "bg-slate-100 text-slate-400 group-hover:bg-brand-navy/10 group-hover:text-brand-navy"
                )}>
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <div className={cn("font-black uppercase text-sm tracking-tight", mode === 'solo' ? "text-white" : "text-brand-navy")}>The Computer</div>
                  <div className={cn("text-xs font-bold", mode === 'solo' ? "text-white/60" : "text-brand-navy/50")}>Solo - Perfect score wins 2x</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-navy/30 px-2">Select Wager</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPledge(opt)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    pledge === opt 
                      ? 'border-brand-pink bg-brand-pink/5 text-brand-pink shadow-lg shadow-brand-pink/10' 
                      : 'border-slate-100 hover:border-slate-200 text-brand-navy'
                  }`}
                >
                  <div className="text-2xl font-black">₦{opt.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-slate-600 font-bold">
                <Wallet className="w-5 h-5" />
                Potential Win:
              </div>
              <div className="text-2xl font-black text-brand-teal">
                ₦{pledge ? (mode === 'solo' ? pledge * 2 : pledge * 1.8).toLocaleString() : '0'}
              </div>
            </div>
            <p className="text-xs text-slate-400">
              {mode === 'solo' 
                ? "Computer Arena: No house fee. Win 2x if you answer ALL correctly. Lose if any are wrong."
                : "1v1 Arena: 10% house fee. Winner takes the pot. Refund available if no opponent found."}
            </p>
          </div>

          <button
            disabled={!pledge}
            onClick={() => setConfirmed(true)}
            className={cn(
              "btn-fun w-full py-5 text-lg shadow-2xl transition-all disabled:opacity-50 disabled:grayscale",
              mode === 'solo' ? "bg-brand-navy text-white" : "bg-brand-pink text-white shadow-brand-pink/30"
            )}
          >
            {mode === 'solo' ? 'Battle the Computer' : 'Enter 1v1 Arena'}
          </button>
        </div>
      </div>
    </div>
  );
}

