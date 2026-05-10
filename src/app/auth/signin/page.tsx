'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Mail, Lock, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-orange/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-navy/10 blur-[120px] rounded-full" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-navy rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-navy/20 transform -rotate-12">
            <Trophy className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-brand-navy dark:text-white tracking-tighter uppercase">
            Welcome <span className="text-brand-orange">Back</span>
          </h1>
          <p className="text-lg font-bold opacity-40">Your wallet is waiting for you.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 bg-white/40 space-y-6">
          {error && (
            <div className="p-4 bg-brand-pink/10 text-brand-pink rounded-xl text-xs font-black uppercase text-center border border-brand-pink/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full btn-fun bg-white text-brand-navy border border-brand-navy/10 hover:bg-slate-50 shadow-sm"
            >
              <Globe className="w-5 h-5 text-brand-navy" />
              Continue with Google
            </button>
            
            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-brand-navy/10" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">OR WITH EMAIL</span>
              <div className="flex-1 h-px bg-brand-navy/10" />
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder="Email Address"
                  className="w-full bg-white/50 border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-brand-orange outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                <input 
                  name="password"
                  type="password" 
                  required
                  placeholder="Password"
                  className="w-full bg-white/50 border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-brand-orange outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-fun btn-orange py-5 text-xl disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
            <ArrowRight className="w-6 h-6" />
          </button>

          <p className="text-center font-bold opacity-40 text-sm">
            Don't have an account? <Link href="/auth/signup" className="text-brand-orange hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
