'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Trophy, 
  Zap, 
  Users, 
  Plus, 
  ArrowUpRight, 
  History, 
  Gamepad2, 
  Star,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DepositButton from '@/components/game/DepositButton';
import axios from 'axios';

import { pusherClient } from '@/lib/pusher';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [activities, setActivities] = useState([
    { user: 'Bolu_01', prize: '₦5,000', type: 'Duel Win', initial: 'B' },
    { user: 'Ehis_Trade', prize: '₦12,400', type: 'Pool Entry', initial: 'E' },
    { user: 'Sarah_X', prize: '₦2,500', type: 'Duel Win', initial: 'S' },
  ]);

  useEffect(() => {
    if (session?.user) {
      axios.get('/api/user/balance')
        .then(res => {
          setBalance(res.data.balance);
          setLoadingBalance(false);
        })
        .catch(err => {
          console.error("Failed to fetch balance", err);
          setLoadingBalance(false);
        });

      // Listen for global events
      if (pusherClient) {
        const channel = pusherClient.subscribe('platform-events');
        channel.bind('global-activity', (data: any) => {
          setActivities(prev => [data, ...prev].slice(0, 5));
        });

        return () => {
          pusherClient.unsubscribe('platform-events');
        };
      }
    }
  }, [session]);

  if (status === 'loading') return null;

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const userInitial = session?.user?.name?.[0] || 'U';
  const userName = session?.user?.name || 'Player';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex">
      {/* Sidebar Navigation */}
      <aside className="w-24 lg:w-64 border-r border-brand-navy/5 bg-white/50 backdrop-blur-xl flex flex-col items-center py-8 z-20">
        <Link href="/" className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center mb-12 shadow-lg shadow-brand-navy/20">
          <Trophy className="text-white w-6 h-6" />
        </Link>

        <nav className="flex-1 flex flex-col gap-6">
          {[
            { icon: Gamepad2, label: 'Play', active: true },
            { icon: Wallet, label: 'Wallet' },
            { icon: History, label: 'Activity' },
            { icon: Trophy, label: 'Ranks' },
            { icon: Settings, label: 'Settings' },
          ].map((item, idx) => (
            <button 
              key={idx} 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                item.active ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/30' : 'text-brand-navy/40 hover:bg-brand-navy/5'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="hidden lg:block font-black uppercase text-xs tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-4 text-brand-pink hover:bg-brand-pink/10 rounded-2xl transition-all"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 section-padding relative overflow-y-auto">
        {/* Background Accents */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-1">
              <h2 className="text-4xl lg:text-5xl font-black text-brand-navy dark:text-white uppercase tracking-tighter">
                Welcome Back, <span className="text-brand-pink">{userName.split(' ')[0]}</span>
              </h2>
              <p className="text-xl font-bold opacity-40">Ready to secure the bag today?</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 glass-card flex items-center justify-center bg-white/80">
                <Bell className="w-5 h-5 text-brand-navy" />
              </button>
              <div className="glass-card flex items-center gap-3 pr-6 pl-2 py-2 bg-white/80">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-pink to-brand-orange flex items-center justify-center font-black text-white uppercase">
                  {userInitial}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-black text-brand-navy">{userName}</div>
                  <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">Player Tier</div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: Wallet & Games */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Wallet Card */}
              <div className="glass-card bg-brand-navy p-8 text-white relative overflow-hidden group">
                <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-brand-pink/20 blur-[80px] group-hover:scale-125 transition-transform duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 opacity-60 font-black uppercase text-xs tracking-widest">
                      <Wallet className="w-4 h-4" />
                      Nitro Balance
                    </div>
                    <div className="text-6xl font-black tracking-tighter">
                      ₦{loadingBalance ? "..." : balance.toLocaleString()}<span className="text-brand-teal text-2xl">.00</span>
                    </div>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                    <DepositButton />
                    <button className="btn-fun bg-white/10 hover:bg-white/20 text-white flex-1 md:flex-none py-3 px-8 text-sm backdrop-blur-md border border-white/10">
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              {/* Game Modes Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* 1v1 Duel Card */}
                <div className="glass-card p-8 bg-brand-pink/5 border-brand-pink/20 group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-20%] opacity-10 group-hover:scale-110 transition-transform">
                    <Zap className="w-48 h-48 text-brand-pink fill-brand-pink" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-brand-pink rounded-2xl flex items-center justify-center shadow-lg shadow-brand-pink/30">
                      <Zap className="text-white w-7 h-7 fill-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-brand-navy">THE DUEL</h3>
                      <p className="text-lg font-bold opacity-50 leading-tight">Instant 1v1 Wagering. Double your money in 60s.</p>
                    </div>
                    <button 
                      onClick={() => router.push('/duel')}
                      className="btn-fun btn-pink w-full py-4 text-sm"
                    >
                      Find Opponent
                    </button>
                  </div>
                </div>

                {/* Pool Card */}
                <div 
                  onClick={() => router.push('/pool')}
                  className="glass-card p-8 bg-brand-orange/5 border-brand-orange/20 group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-[-20%] right-[-20%] opacity-10 group-hover:scale-110 transition-transform">
                    <Trophy className="w-48 h-48 text-brand-orange fill-brand-orange" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/30">
                      <Trophy className="text-white w-7 h-7 fill-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-brand-navy uppercase italic">The Pool</h3>
                      <p className="text-lg font-bold opacity-50 leading-tight">Weekly Jackpot. Low entry, massive rewards.</p>
                    </div>
                    <div className="flex items-center gap-2 text-brand-orange font-black text-sm uppercase tracking-widest">
                      <Star className="w-4 h-4 fill-brand-orange" /> Next Pool: Fri 7PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Pulse & Stats */}
            <div className="lg:col-span-4 space-y-8">
              {/* Stats Card */}
              <div className="glass-card p-8 bg-brand-teal/5 border-brand-teal/20">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-6">Global Pulse</h4>
                <div className="space-y-6">
                  {activities.map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center font-black text-xs uppercase">
                          {item.initial}
                        </div>
                        <div>
                          <div className="text-sm font-black text-brand-navy">{item.user}</div>
                          <div className="text-[10px] uppercase font-bold opacity-40">{item.type}</div>
                        </div>
                      </div>
                      <div className="text-brand-teal font-black text-sm">+{item.prize}</div>
                    </motion.div>
                  ))}
                </div>
                <button className="w-full mt-8 py-4 border-2 border-brand-navy/5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-navy/5 transition-colors">
                  View Leaderboard
                </button>
              </div>

              {/* Bonus Tracker */}
              <div className="glass-card p-8 bg-white/80 overflow-hidden relative">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-pink/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                <h4 className="text-sm font-black text-brand-navy mb-4">Daily Streak Bonus</h4>
                <div className="flex gap-2 mb-6">
                  {[1, 1, 1, 0, 0, 0, 0].map((active, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full ${active ? 'bg-brand-pink' : 'bg-brand-navy/5'}`} />
                  ))}
                </div>
                <p className="text-xs font-bold opacity-50">Play 4 more days to unlock ₦500 bonus.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
