import { auth } from "@/auth";
import FreeGame from '@/components/game/FreeGame';
import { Trophy, Zap, Users, Play, Star } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[#f1f5f9] dark:bg-[#0f172a] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-pink/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-teal/10 blur-[120px] rounded-full" />
      
      {/* Floating Logo Elements */}
      <div className="floating-x top-20 left-[10%] select-none">X</div>
      <div className="floating-x bottom-40 right-[15%] select-none rotate-45 text-brand-orange opacity-10">X</div>

      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Trophy className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy dark:text-white tracking-tighter leading-none">
              HI IT'S<br/><span className="text-brand-pink">GAME</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {session ? (
            <Link href="/dashboard" className="btn-fun btn-pink">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className="font-bold text-brand-navy/60 hover:text-brand-pink transition-colors">
                Login
              </Link>
              <Link href="/auth/signup" className="btn-fun btn-pink">
                Start Winning
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="section-padding relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-6 py-2 rounded-full text-sm font-black tracking-widest uppercase border border-brand-orange/20">
              <Zap className="w-4 h-4 fill-brand-orange" />
              Level Up Your Wallet
            </div>
            
            <h2 className="text-6xl lg:text-8xl font-black text-brand-navy dark:text-white leading-[0.9] tracking-tight">
              Turn Skills <br/>
              Into <span className="text-gradient-pink">Hard Cash</span>
            </h2>
            
            <p className="text-2xl text-brand-navy/60 dark:text-white/60 max-w-xl leading-relaxed font-medium">
              Join 10k+ players competing for massive pools. Score <span className="text-brand-teal font-black">10/10</span> in the Hard Tier to grab your ₦1,000 bonus.
            </p>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 items-center">
              <div className="glass-card p-4 sm:p-6 flex items-center gap-3 sm:gap-4 bg-white/40">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-teal/20 rounded-full flex items-center justify-center shrink-0">
                  <Users className="text-brand-teal w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-brand-navy dark:text-white">10K+</div>
                  <div className="text-[10px] sm:text-xs uppercase font-black opacity-40">Live Players</div>
                </div>
              </div>

              <div className="glass-card p-4 sm:p-6 flex items-center gap-3 sm:gap-4 bg-white/40">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-orange/20 rounded-full flex items-center justify-center shrink-0">
                  <Star className="text-brand-orange w-5 h-5 sm:w-6 sm:h-6 fill-brand-orange" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-brand-navy dark:text-white">₦2.5M+</div>
                  <div className="text-[10px] sm:text-xs uppercase font-black opacity-40">Total Payouts</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Background Glow for Game */}
            <div className="absolute inset-0 bg-brand-pink/20 blur-[60px] rounded-full scale-90" />
            <div className="relative glass-card p-2 bg-white/30">
              <FreeGame />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-brand-navy text-white relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-[200%] h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path className="dashed-path" d="M0,0 C150,110 350,110 500,0 C650,110 850,110 1000,0 C1150,110 1350,110 1500,0 L1500,0 L0,0 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 pt-12">
          {[
            { 
              step: '01', 
              title: 'Free Mode', 
              desc: 'Sharpen your claws. Win your first bonus without spending a kobo.',
              color: 'brand-teal'
            },
            { 
              step: '02', 
              title: '1v1 Duel', 
              desc: 'Wager small, win big. Real-time validated duels with instant payouts.',
              color: 'brand-pink'
            },
            { 
              step: '03', 
              title: 'The Pool', 
              desc: 'Every Friday Night. High stakes, massive jackpots, legendary status.',
              color: 'brand-orange'
            }
          ].map((item, idx) => (
            <div key={idx} className="space-y-6 group cursor-default">
              <div className={`text-6xl font-black opacity-10 group-hover:opacity-30 transition-opacity`}>
                {item.step}
              </div>
              <h4 className="text-3xl font-black">{item.title}</h4>
              <p className="text-xl text-white/60 leading-relaxed">{item.desc}</p>
              <div className={`w-12 h-2 bg-${item.color} rounded-full`} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
