'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { Check, X, Timer, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@database/utils';

export default function FreeGame() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'rules' | 'playing' | 'finished' | 'blocked'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [blockedMessage, setBlockedMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function initGame() {
      try {
        // 1. Check IP Status
        const ipRes = await fetch('/api/auth/check-ip');
        const ipData = await ipRes.json();
        if (ipData.isBlocked) {
          setBlockedMessage(ipData.message);
          setGameState('blocked');
          return;
        }

        // 2. Fetch Questions
        const res = await fetch('/api/questions/free');
        const data = await res.json();
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          const { HARD_QUESTIONS } = await import('@/data/hard-questions');
          setQuestions(HARD_QUESTIONS);
        }
        setGameState('rules');
      } catch (err) {
        console.error("Failed to initialize game", err);
        setGameState('rules');
      }
    }
    initGame();
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft === 0) {
      handleOptionClick(-1); // Fail on timeout
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    if (gameState !== 'playing') return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setGameState('finished');
        setScore(0); // Reset score on cheat attempt
        alert("🚨 CHEAT DETECTED: Quiz ended because you switched tabs.");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameState]);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null || gameState !== 'playing') return;
    
    setSelectedOption(index);
    const correct = index === currentQuestion?.answerIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setTimeLeft(10); // Reset timer for next question
      } else {
        setGameState('finished');
        const finalScore = score + (correct ? 1 : 0);
        
        // Log the attempt (success or failure) to track IP
        fetch('/api/auth/log-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: finalScore === questions.length })
        });

        if (finalScore === questions.length) {
          document.cookie = "victory_bonus=1000; path=/; max-age=86400; SameSite=Lax";
          
          const duration = 3 * 1000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#FF33FF', '#FFA500']
            });
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#2B5292', '#4FD1C5']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        }
      }
    }, 1500);
  };

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Fetching Arena Questions...</p>
      </div>
    );
  }

  if (gameState === 'blocked') {
    return (
      <div className="glass-card max-w-md mx-auto text-center py-12 px-6 bg-red-500/10 border-red-500/20">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black mb-4 text-white uppercase">Access Restricted</h2>
        <p className="text-white/60 font-bold leading-relaxed mb-6">
          {blockedMessage || "You have reached the maximum number of attempts for this game."}
        </p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn-fun bg-white/10 text-white w-full justify-center"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (gameState === 'rules') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md mx-auto p-8 bg-white/5 border-white/10"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-brand-pink/20 rounded-2xl flex items-center justify-center">
            <Trophy className="text-brand-pink w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Arena Rules</h2>
            <p className="text-xs font-bold text-white/40 tracking-widest uppercase">Read before you start</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {[
            { icon: <Timer className="w-4 h-4" />, text: "10 seconds per question" },
            { icon: <Check className="w-4 h-4" />, text: "No tab switching (Automatic end)" },
            { icon: <X className="w-4 h-4" />, text: "No copying or right-clicks" },
            { icon: <Trophy className="w-4 h-4" />, text: "3/3 correct = ₦1,000 Signup Bonus" },
            { icon: <ArrowRight className="w-4 h-4" />, text: "3 failed attempts = 3 month ban" }
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-brand-pink">{rule.icon}</div>
              <span className="text-sm font-bold text-white/80">{rule.text}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => {
            setGameState('playing');
            setTimeLeft(10);
          }}
          className="btn-fun btn-pink w-full justify-center text-xl py-6"
        >
          I Accept, Start Quiz
          <ArrowRight className="w-6 h-6" />
        </button>
      </motion.div>
    );
  }

  if (gameState === 'finished') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md mx-auto text-center py-12 px-6 bg-white/5 border-white/10"
      >
        <div className="w-24 h-24 bg-brand-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-brand-orange" />
        </div>
        <h2 className="text-4xl font-black mb-2 text-white uppercase tracking-tighter">GAME OVER!</h2>
        <p className="text-2xl font-bold opacity-60 mb-8 text-white/60">
          Result: <span className="text-brand-pink">{score}/{questions.length}</span>
        </p>
        
        {score === questions.length ? (
          <div className="space-y-6">
            <div className="bg-brand-teal/20 text-brand-teal p-6 rounded-3xl border border-brand-teal/30">
              <p className="font-black text-xl tracking-tighter">GOD LEVEL! 🏆</p>
              <p className="text-sm font-bold">Your ₦1,000 Bonus is ready to claim.</p>
            </div>
            <button 
              onClick={() => router.push('/auth/signup?bonus=1000')}
              className="btn-fun btn-pink w-full justify-center text-xl py-6"
            >
              Claim Cash
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-bold opacity-40 uppercase tracking-widest text-white/40">Only {questions.length}/{questions.length} wins the bonus</p>
            <p className="text-xs font-black text-brand-pink uppercase">Warning: Too many fails lead to an IP ban.</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-fun btn-orange w-full justify-center text-xl py-6"
            >
              Retry Level
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="max-w-xl mx-auto px-6 py-8 glass-card bg-white/5 border-white/10 select-none"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-black text-white/40 uppercase tracking-widest">
          LVL <span className="text-white">{currentIndex + 1}</span> / {questions.length}
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl flex items-center gap-2 font-black text-sm transition-all",
          timeLeft <= 3 ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white"
        )}>
          <Timer className="w-4 h-4" />
          00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </div>
      </div>

      <div className="w-full bg-white/5 h-3 rounded-full mb-12 overflow-hidden border border-white/5">
        <motion.div 
          className="h-full bg-gradient-to-r from-brand-pink via-brand-orange to-brand-teal"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>


      <AnimatePresence mode="wait">
        {currentQuestion && currentQuestion.options && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <h3 className="text-2xl lg:text-3xl font-black text-white leading-[1.1]">
              {currentQuestion.content}
            </h3>

            <div className="grid gap-4">
              {currentQuestion.options.map((option: string, index: number) => {
              const isSelected = selectedOption === index;
              const isCorrectAnswer = index === currentQuestion.answerIndex;
              
              return (
                <motion.button
                  key={index}
                  whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                  whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                  onClick={() => handleOptionClick(index)}
                  disabled={selectedOption !== null}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border-2 transition-all flex justify-between items-center font-black text-lg",
                    selectedOption === null 
                      ? "border-brand-navy/10 bg-white/50 hover:border-brand-pink hover:text-brand-pink"
                      : isSelected
                        ? isCorrect 
                          ? "border-brand-teal bg-brand-teal/20 text-brand-teal" 
                          : "border-brand-pink bg-brand-pink/20 text-brand-pink"
                        : isCorrectAnswer
                          ? "border-brand-teal bg-brand-teal/20 text-brand-teal"
                          : "border-transparent opacity-20"
                  )}
                >
                  {option}
                  {selectedOption !== null && isCorrectAnswer && <Check className="w-6 h-6" />}
                  {isSelected && !isCorrectAnswer && <X className="w-6 h-6" />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

