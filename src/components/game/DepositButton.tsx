'use client';

import React, { useState } from 'react';
import { Plus, Loader2, X, Wallet, Zap } from 'lucide-react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

export default function DepositButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [error, setError] = useState<string | null>(null);

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
        className="btn-fun btn-pink flex-1 md:flex-none py-3 px-8 text-sm"
      >
        <Plus className="w-4 h-4" />
        Deposit
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
              onClick={() => !loading && setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-brand-navy border-2 border-brand-navy/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-brand-navy/5 flex items-center justify-between bg-brand-pink/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-pink/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-brand-pink" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-brand-navy dark:text-white uppercase tracking-tight">Fund Wallet</h3>
                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Instant Deposit</p>
                  </div>
                </div>
                <button 
                  onClick={() => !loading && setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-navy/5 text-brand-navy/40 hover:text-brand-navy transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-brand-navy/40 tracking-widest pl-2">
                    Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-brand-navy/20">₦</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="1000"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-brand-navy/10 rounded-2xl py-4 pl-14 pr-6 text-3xl font-black text-brand-navy dark:text-white focus:border-brand-pink focus:ring-0 outline-none transition-all placeholder:text-brand-navy/20"
                    />
                  </div>
                  {error && (
                    <p className="text-sm font-bold text-brand-pink text-center">{error}</p>
                  )}
                </div>

                {/* Quick Amounts */}
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className={`py-3 px-4 rounded-xl font-black text-sm transition-all border-2
                        ${amount === quickAmount.toString() 
                          ? 'bg-brand-pink border-brand-pink text-white shadow-lg shadow-brand-pink/20' 
                          : 'bg-white border-brand-navy/10 text-brand-navy/60 hover:border-brand-pink/50 hover:text-brand-navy'}`}
                    >
                      ₦{quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Submit Button */}
                <button 
                  onClick={handleDeposit}
                  disabled={loading}
                  className="w-full btn-fun btn-pink py-4 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 fill-white" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
