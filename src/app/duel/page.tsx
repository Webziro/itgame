'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Disable SSR for the complex game component
const DuelGame = dynamic(() => import('@/components/game/DuelGame'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
      <div className="w-12 h-12 border-4 border-[#ff006e] border-t-transparent rounded-full animate-spin" />
    </div>
  )
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
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold">
           ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0f172a] rounded-2xl flex items-center justify-center text-white text-2xl">
              ⚡
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter">Arena Selection</h1>
              <p className="font-bold opacity-40">Choose your opponent and wager</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-[0.2em] opacity-40 px-2">Choose Arena Mode</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('1v1')}
                className={`p-6 rounded-3xl border-2 flex items-center gap-4 transition-all text-left ${
                  mode === '1v1' ? "border-[#ff006e] bg-white shadow-xl shadow-[#ff006e]/10" : "border-slate-100 bg-white hover:border-[#ff006e]/30"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  mode === '1v1' ? "bg-[#ff006e] text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  👥
                </div>
                <div>
                  <div className="font-black uppercase text-sm tracking-tight text-[#0f172a]">1v1 Human Duel</div>
                  <div className="text-xs font-bold text-[#0f172a]/50">Battle real opponents</div>
                </div>
              </button>

              <button
                onClick={() => setMode('solo')}
                className={`p-6 rounded-3xl border-2 flex items-center gap-4 transition-all text-left ${
                  mode === 'solo' ? "border-[#0f172a] bg-[#0f172a] text-white shadow-xl shadow-[#0f172a]/30" : "border-slate-100 bg-white hover:border-[#0f172a]/30"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  mode === 'solo' ? "bg-white text-[#0f172a]" : "bg-slate-100 text-slate-400"
                }`}>
                  💻
                </div>
                <div>
                  <div className={`font-black uppercase text-sm tracking-tight ${mode === 'solo' ? "text-white" : "text-[#0f172a]"}`}>The Computer</div>
                  <div className={`text-xs font-bold ${mode === 'solo' ? "text-white/60" : "text-[#0f172a]/50"}`}>Solo - Perfect score wins 2x</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#0f172a]/30 px-2">Select Wager</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPledge(opt)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    pledge === opt 
                      ? 'border-[#ff006e] bg-[#ff006e]/5 text-[#ff006e] shadow-lg shadow-[#ff006e]/10' 
                      : 'border-slate-100 hover:border-slate-200 text-[#0f172a]'
                  }`}
                >
                  <div className="text-2xl font-black">₦{opt.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!pledge}
            onClick={() => setConfirmed(true)}
            className={`w-full py-5 text-lg font-black rounded-2xl shadow-2xl transition-all disabled:opacity-50 disabled:grayscale ${
              mode === 'solo' ? "bg-[#0f172a] text-white" : "bg-[#ff006e] text-white shadow-[#ff006e]/30"
            }`}
          >
            {mode === 'solo' ? 'Battle the Computer' : 'Enter 1v1 Arena'}
          </button>
        </div>
      </div>
    </div>
  );
}
