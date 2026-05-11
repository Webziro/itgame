'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { submitPoolScore } from '@logic/pool-actions';
import { Timer, Check, Loader2 } from 'lucide-react';
import { cn } from '@database/utils';

export default function PoolGame({ 
  questions, 
  participantId 
}: { 
  questions: any[], 
  participantId: string 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // More time for hard questions
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing' || selectedOption !== null) return;

    if (timeLeft === 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, selectedOption]);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === questions[currentIndex].answerIndex;
    if (correct) setScore(prev => prev + 1);
    
    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(15);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('finished');
    await submitPoolScore(participantId, score, totalTime);
  };

  if (gameState === 'finished') return (
    <div className="card-premium text-center p-12">
      <Check className="w-16 h-16 text-brand-teal mx-auto mb-4" />
      <h2 className="text-3xl font-black text-brand-navy">Score Submitted!</h2>
      <p className="text-slate-500 mt-2">You scored {score}/{questions.length}</p>
      <p className="text-sm opacity-40 mt-1">Winners will be announced after the pool closes.</p>
      <button onClick={() => window.location.href = '/dashboard'} className="btn-fun bg-brand-navy text-white mt-8 px-12">Return to Dashboard</button>
    </div>
  );

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-black uppercase tracking-widest opacity-40">Hard Mode • Question {currentIndex + 1}/{questions.length}</div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full font-black transition-colors",
          timeLeft <= 5 ? "bg-red-100 text-red-600 animate-pulse" : "bg-brand-orange/10 text-brand-orange"
        )}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-premium p-8"
      >
        <h3 className="text-2xl font-black text-brand-navy mb-8 leading-tight">{currentQuestion.content}</h3>
        <div className="grid gap-4">
          {currentQuestion.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              className={cn(
                "p-5 rounded-2xl border-2 text-left font-bold transition-all text-lg",
                selectedOption === null ? "border-slate-100 hover:border-brand-orange/20" : 
                idx === currentQuestion.answerIndex ? "border-brand-teal bg-brand-teal/5 text-brand-teal" : 
                selectedOption === idx ? "border-brand-pink bg-brand-pink/5 text-brand-pink" : "opacity-30"
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
