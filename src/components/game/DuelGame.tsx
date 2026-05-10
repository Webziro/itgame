'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startDuel, finishDuel } from '@logic/game-actions';
import { Timer, AlertCircle, Check, X } from 'lucide-react';
import { cn } from '@database/utils';

export default function DuelGame({ pledge }: { pledge: number }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'won' | 'lost' | 'error'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await startDuel(pledge);
        setQuestions(res.questions);
        setGameState('playing');
      } catch (err: any) {
        setGameState('error');
      }
    }
    init();
  }, [pledge]);

  useEffect(() => {
    if (gameState !== 'playing' || selectedOption !== null) return;

    if (timeLeft === 0) {
      handleLoss();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, selectedOption]);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const correct = index === questions[currentIndex].answerIndex;

    if (!correct) {
      setTimeout(() => handleLoss(), 1000);
    } else {
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSelectedOption(null);
          setTimeLeft(10);
        } else {
          handleWin();
        }
      }, 1000);
    }
  };

  const handleWin = async () => {
    setGameState('won');
    await finishDuel(pledge, true);
  };

  const handleLoss = async () => {
    setGameState('lost');
    await finishDuel(pledge, false);
  };

  if (gameState === 'loading') return <div className="text-center p-12">Starting Duel...</div>;
  if (gameState === 'error') return <div className="text-center p-12 text-red-500">Error starting game. Check balance.</div>;

  if (gameState === 'won') return (
    <div className="card-premium text-center p-12 border-green-200 bg-green-50">
      <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-green-700">Victory!</h2>
      <p className="text-green-600 mt-2">You won ₦{pledge * 2}</p>
      <button onClick={() => window.location.href = '/'} className="btn-primary mt-8">Back Home</button>
    </div>
  );

  if (gameState === 'lost') return (
    <div className="card-premium text-center p-12 border-red-200 bg-red-50">
      <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-red-700">Defeat</h2>
      <p className="text-red-600 mt-2">You lost ₦{pledge}</p>
      <button onClick={() => window.location.href = '/'} className="btn-primary mt-8 bg-slate-800">Back Home</button>
    </div>
  );

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-medium">Question {currentIndex + 1}/5</div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors",
          timeLeft <= 3 ? "bg-red-100 text-red-600 animate-pulse" : "bg-primary/10 text-primary"
        )}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium"
      >
        <h3 className="text-xl font-bold mb-8">{currentQuestion.content}</h3>
        <div className="grid gap-3">
          {currentQuestion.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              className={cn(
                "p-4 rounded-xl border-2 text-left font-medium transition-all",
                selectedOption === null ? "border-slate-100 hover:border-primary/20" : 
                idx === currentQuestion.answerIndex ? "border-green-500 bg-green-50" : 
                selectedOption === idx ? "border-red-500 bg-red-50" : "opacity-50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
