'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { joinDuel, submitDuelScore, joinSoloDuel, submitSoloScore, cancelDuel } from '@logic/duel-actions';
import { Timer, Check, X, Loader2, AlertCircle, Monitor, Users, Zap } from 'lucide-react';
import { cn } from '@database/utils';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@database/pusher';
import { useRouter } from 'next/navigation';

export default function DuelGame({ pledge, mode }: { pledge: number, mode: 'solo' | '1v1' }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState<'loading' | 'matchmaking' | 'playing' | 'waiting-opponent' | 'won' | 'lost' | 'draw' | 'error'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        if (mode === 'solo') {
          const res = await joinSoloDuel(pledge);
          if (!res || !res.questions) return;
          setQuestions(res.questions as any[]);
          setGameState('playing');
        } else {
          const res = await joinDuel(pledge);
          if (!res) return;
          setDuelId(res.duelId);
          if (res.status === 'STARTED' && res.questions) {
            setQuestions(res.questions as any[]);
            setGameState('playing');
          } else {
            setGameState('matchmaking');
          }
        }
      } catch (err: any) {
        setGameState('error');
        setErrorMsg(err.message || "Something went wrong");
      }
    }
    if (session?.user?.id) init();
  }, [pledge, session, mode]);

  useEffect(() => {
    if (mode === 'solo' || !session?.user?.id || !pusherClient) return;

    const channel = pusherClient.subscribe(`user-${session?.user?.id}`);
    
    channel.bind('duel-started', (data: { duelId: string, questions: any[] }) => {
      setDuelId(data.duelId);
      setQuestions(data.questions);
      setGameState('playing');
    });

    channel.bind('duel-resolved', (data: { result: 'WIN' | 'LOSS' | 'DRAW' }) => {
      if (data.result === 'WIN') setGameState('won');
      else if (data.result === 'LOSS') setGameState('lost');
      else setGameState('draw');
    });

    return () => {
      if (session?.user?.id) {
        pusherClient?.unsubscribe(`user-${session.user.id}`);
      }
    };
  }, [session, mode]);

  const handleCancel = async () => {
    if (!duelId) return;
    try {
      await cancelDuel(duelId);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const finishGame = async (finalScore: number) => {
    if (mode === 'solo') {
      setGameState('loading');
      const res = await submitSoloScore(pledge, finalScore);
      if (res.result === 'WIN') setGameState('won');
      else setGameState('lost');
    } else {
      if (!duelId) return;
      setGameState('waiting-opponent');
      await submitDuelScore(duelId, finalScore, totalTime);
    }
  };

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (!questions[currentIndex]) return;
    const correct = index === questions[currentIndex].answerIndex;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    
    setTimeout(() => {
      handleNextQuestion(newScore);
    }, 1000);
  };

  const handleNextQuestion = (currentScore: number) => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(10);
    } else {
      finishGame(currentScore);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing' || selectedOption !== null) return;

    if (timeLeft === 0) {
      handleNextQuestion(score);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, selectedOption]);



  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-pink/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-teal/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-xl z-10">
        <AnimatePresence mode="wait">
          {gameState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Initializing Arena</h2>
              <p className="text-white/40 font-bold uppercase text-xs tracking-widest mt-2">Preparing questions...</p>
            </motion.div>
          )}

          {gameState === 'matchmaking' && (
            <motion.div
              key="matchmaking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="glass-card p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <Users className="w-10 h-10 text-brand-pink" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4">Finding<br/>Opponent</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-8">
                  <div className="w-2 h-2 bg-brand-pink rounded-full animate-ping" />
                  <span className="text-xs font-black text-white/60 uppercase tracking-widest">Searching Arena...</span>
                </div>
                <p className="text-white/40 font-bold text-sm uppercase tracking-widest">Pledge: ₦{pledge}</p>
                <button 
                  onClick={handleCancel}
                  className="mt-12 text-xs font-black text-white/30 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
                >
                  Cancel and Refund
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center px-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Question</div>
                  <div className="text-2xl font-black text-white">{currentIndex + 1} / {questions.length}</div>
                </div>
                <div className={cn(
                  "px-6 py-3 rounded-2xl glass-card flex items-center gap-3 font-black transition-all",
                  timeLeft <= 3 ? "border-brand-pink text-brand-pink animate-pulse" : "text-brand-teal"
                )}>
                  <Timer className="w-5 h-5" />
                  <span className="text-xl tabular-nums">{timeLeft}s</span>
                </div>
              </div>

              <div className="glass-card p-8 sm:p-12 relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Zap className="w-32 h-32 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white leading-tight mb-12 relative z-10">{currentQuestion.content}</h3>
                <div className="grid gap-4">
                  {currentQuestion.options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={selectedOption !== null}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-left font-black transition-all transform active:scale-[0.98]",
                        selectedOption === null 
                          ? "border-white/5 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/10" 
                          : idx === currentQuestion.answerIndex 
                            ? "border-brand-teal bg-brand-teal/20 text-brand-teal shadow-[0_0_30px_rgba(0,245,212,0.2)]" 
                            : selectedOption === idx 
                              ? "border-brand-pink bg-brand-pink/20 text-brand-pink" 
                              : "border-white/5 opacity-30 grayscale"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {selectedOption !== null && idx === currentQuestion.answerIndex && <Check className="w-5 h-5" />}
                        {selectedOption === idx && idx !== currentQuestion.answerIndex && <X className="w-5 h-5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'waiting-opponent' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-6">Round<br/>Complete</h2>
              <p className="text-white/60 font-bold text-lg">Score: <span className="text-brand-teal">{score} / 5</span></p>
              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs font-black text-white/40 uppercase tracking-widest">Waiting for opponent to finish...</p>
              </div>
            </motion.div>
          )}

          {['won', 'lost', 'draw', 'error'].includes(gameState) && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "glass-card p-12 text-center relative overflow-hidden",
                gameState === 'won' ? "border-brand-teal/30" : gameState === 'lost' ? "border-brand-pink/30" : ""
              )}
            >
              {gameState === 'won' && (
                <>
                  <div className="w-24 h-24 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(0,245,212,0.3)]">
                    <Check className="w-12 h-12 text-brand-teal" />
                  </div>
                  <h2 className="text-5xl font-black text-brand-teal uppercase tracking-tighter mb-2">Victory</h2>
                  <p className="text-white/60 font-bold uppercase tracking-widest mb-8">Nigeria's Finest Trivia King</p>
                  <div className="text-4xl font-black text-white mb-12">₦{(mode === 'solo' ? pledge * 2 : pledge * 1.8).toLocaleString()}</div>
                </>
              )}

              {gameState === 'lost' && (
                <>
                  <div className="w-24 h-24 bg-brand-pink/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <X className="w-12 h-12 text-brand-pink" />
                  </div>
                  <h2 className="text-5xl font-black text-brand-pink uppercase tracking-tighter mb-4">Defeat</h2>
                  <p className="text-white/60 font-bold mb-12 leading-relaxed">
                    {mode === 'solo' 
                      ? "The computer was too smart this time. Remember, you need 5/5 to win solo!" 
                      : "Your opponent played better this time. Refocus and go again!"}
                  </p>
                </>
              )}

              {gameState === 'draw' && (
                <>
                  <AlertCircle className="w-20 h-20 text-brand-orange mx-auto mb-8" />
                  <h2 className="text-5xl font-black text-brand-orange uppercase tracking-tighter mb-4">Draw</h2>
                  <p className="text-white/60 font-bold mb-12">Wager of ₦{pledge.toLocaleString()} refunded.</p>
                </>
              )}

              {gameState === 'error' && (
                <>
                  <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-8" />
                  <h2 className="text-5xl font-black text-red-500 uppercase tracking-tighter mb-4">Arena Error</h2>
                  <p className="text-white/60 font-bold mb-12">{errorMsg}</p>
                </>
              )}

              <button 
                onClick={() => router.push('/dashboard')}
                className={cn(
                  "btn-fun w-full py-5 text-xl",
                  gameState === 'won' ? "bg-brand-teal text-brand-navy" : "bg-white text-brand-navy"
                )}
              >
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

