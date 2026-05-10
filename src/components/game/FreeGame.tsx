'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { HARD_QUESTIONS } from '@/data/hard-questions';
import { Check, X, Timer, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@database/utils';

export default function FreeGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const router = useRouter();

  const currentQuestion = HARD_QUESTIONS[currentIndex];

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const correct = index === currentQuestion.answerIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
    }

    if (!correct && typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(200);
    }

    setTimeout(() => {
      if (currentIndex < HARD_QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setGameState('finished');
        const finalScore = score + (correct ? 1 : 0);
        if (finalScore === 10) {
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

  if (gameState === 'finished') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md mx-auto text-center py-12 px-6 bg-white/20"
      >
        <div className="w-24 h-24 bg-brand-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-brand-orange" />
        </div>
        <h2 className="text-4xl font-black mb-2 text-brand-navy dark:text-white">GAME OVER!</h2>
        <p className="text-2xl font-bold opacity-60 mb-8">
          Result: <span className="text-brand-pink">{score}/10</span>
        </p>
        
        {score === 10 ? (
          <div className="space-y-6">
            <div className="bg-brand-teal/20 text-brand-teal p-6 rounded-3xl border border-brand-teal/30">
              <p className="font-black text-xl">GOD LEVEL! 🏆</p>
              <p className="text-sm font-bold">Your ₦1,000 Bonus is ready to claim.</p>
            </div>
            <button 
              onClick={() => router.push('/auth/signup?bonus=1000')}
              className="btn-fun btn-pink w-full justify-center text-xl"
            >
              Claim Cash
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Only 10/10 wins the bonus</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-fun btn-orange w-full justify-center text-xl"
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
    <div className="max-w-xl mx-auto px-6 py-8 glass-card bg-white/10">
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-black text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">
          LVL <span className="text-brand-navy dark:text-white">{currentIndex + 1}</span> / {HARD_QUESTIONS.length}
        </div>
        <div className="px-4 py-1 bg-brand-pink text-white rounded-full text-xs font-black uppercase tracking-tighter shadow-lg shadow-brand-pink/30">
          Streak: {score}
        </div>
      </div>

      <div className="w-full bg-brand-navy/5 h-4 rounded-full mb-12 overflow-hidden border border-brand-navy/5">
        <motion.div 
          className="h-full bg-gradient-to-r from-brand-pink to-brand-orange"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / HARD_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-10"
        >
          <h3 className="text-2xl lg:text-3xl font-black text-brand-navy dark:text-white leading-[1.1]">
            {currentQuestion.content}
          </h3>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, index) => {
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
      </AnimatePresence>
    </div>
  );
}
