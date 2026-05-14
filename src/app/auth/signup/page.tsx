'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Mail, Lock, User, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { signUp } from '@/actions/auth';
import { useSearchParams, useRouter } from 'next/navigation';

import { Suspense } from 'react';

function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bonus = searchParams.get('bonus');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await signUp(formData, bonus);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        const email = formData.get('email');
        const password = formData.get('password');
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError(signInResult.error);
          setLoading(false);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-pink/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-teal/10 blur-[120px] rounded-full" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-navy rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-navy/20 transform rotate-12">
            <Trophy className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-brand-navy dark:text-white tracking-tighter uppercase">
            Join the <span className="text-brand-pink">Winners</span>
          </h1>
          <p className="text-lg font-bold opacity-40">The game is about to start.</p>
        </div>

        {bonus === "1000" && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-brand-teal/20 border-brand-teal/30 p-4 mb-8 text-center"
          >
            <div className="text-sm font-black text-brand-teal uppercase tracking-widest">
              🎁 Bonus Unlocked
            </div>
            <div className="text-2xl font-black text-brand-navy dark:text-white">
              ₦1,000 Sign-Up Bonus
            </div>
          </motion.div>
        )}

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
              Sign up with Google
            </button>
            
            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-brand-navy/10" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">OR WITH EMAIL</span>
              <div className="flex-1 h-px bg-brand-navy/10" />
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                <input 
                  name="name"
                  type="text" 
                  required
                  placeholder="Full Name"
                  className="w-full bg-white/50 border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-brand-pink outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder="Email Address"
                  className="w-full bg-white/50 border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-brand-pink outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                <input 
                  name="password"
                  type="password" 
                  required
                  placeholder="Create Password"
                  className="w-full bg-white/50 border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-brand-pink outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-fun btn-pink py-5 text-xl disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
            <ArrowRight className="w-6 h-6" />
          </button>

          <p className="text-center font-bold opacity-40 text-sm">
            Already have an account? <Link href="/auth/signin" className="text-brand-pink hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
