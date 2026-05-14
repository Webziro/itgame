'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Loader2, X, Wallet, Zap } from 'lucide-react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

export default function DepositButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Prevent scroll on mobile
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [isOpen]);

  const QUICK_AMOUNTS = [1000, 2500, 5000, 10000];

  const handleDeposit = async () => {
    setError(null);
    const depositAmount = Number(amount);
    
    if (isNaN(depositAmount) || depositAmount < 100) {
      setError("Minimum deposit is ₦100");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/payments/initialize", {
        amount: depositAmount
      });

      const { authorization_url } = response.data;
      
      if (authorization_url) {
        window.location.href = authorization_url;
      } else {
        throw new Error("Failed to get checkout URL");
      }
    } catch (error) {
      console.error(error);
      setError("Payment initialization failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-fun btn-pink flex-1 md:flex-none py-3 px-8 text-sm shadow-lg shadow-brand-pink/20"
      >
        <Plus className="w-4 h-4" />
        Deposit
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto outline-none focus:outline-none">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-brand-navy/90 backdrop-blur-md"
                onClick={() => !loading && setIsOpen(false)}
              />
              
              {/* Modal Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white dark:bg-brand-navy border border-white/20 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] overflow-hidden"
              >
                {/* Header content... same as before but slightly cleaner */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-brand-pink/10 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-pink/20 flex items-center justify-center shadow-lg">
                      <Wallet className="w-6 h-6 text-brand-pink" />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-brand-navy dark:text-white uppercase tracking-tighter">Fund Wallet</h3>
                      <p className="text-[10px] font-black opacity-40 uppercase tracking-widest text-brand-navy dark:text-white/60">Instant Deposit</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => !loading && setIsOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-brand-navy/40 dark:text-white/40 tracking-[0.2em] pl-2">
                      Enter Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-brand-navy/20 dark:text-white/10 transition-colors">₦</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="1000"
                        className="w-full bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-brand-pink rounded-3xl py-6 pl-16 pr-6 text-4xl font-black text-brand-navy dark:text-white outline-none transition-all"
                      />
                    </div>
                    {error && (
                      <p className="text-sm font-bold text-brand-pink text-center bg-brand-pink/5 py-3 rounded-2xl border border-brand-pink/10">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {QUICK_AMOUNTS.map((quickAmount) => (
                      <button
                        key={quickAmount}
                        onClick={() => setAmount(quickAmount.toString())}
                        className={`py-4 px-4 rounded-2xl font-black text-base transition-all border-2
                          ${amount === quickAmount.toString() 
                            ? 'bg-brand-pink border-brand-pink text-white shadow-xl shadow-brand-pink/30 -translate-y-1' 
                            : 'bg-white dark:bg-white/5 border-brand-navy/5 dark:border-white/5 text-brand-navy/60 dark:text-white/60 hover:border-brand-pink/50'}`}
                      >
                        ₦{quickAmount.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleDeposit}
                    disabled={loading}
                    className="w-full btn-fun btn-pink py-6 text-xl disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-brand-pink/40"
                  >
                    {loading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-7 h-7 fill-white" />
                        Deposit Now
                      </>
                    )}
                  </button>

                  <p className="text-[10px] font-bold text-center opacity-30 uppercase tracking-widest text-brand-navy dark:text-white">
                    Redirects to Paystack Secure Checkout
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
