'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { joinDuel, submitDuelScore, joinSoloDuel, submitSoloScore, cancelDuel } from '@logic/duel-actions';
import { Timer, Check, X, Loader2, AlertCircle, Monitor, Users } from 'lucide-react';
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
          setQuestions(res.questions);
          setGameState('playing');
        } else {
          const res = await joinDuel(pledge);
          setDuelId(res.duelId);
          if (res.status === 'STARTED') {
            setQuestions(res.questions);
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

    const channel = pusherClient.subscribe(`user-${session.user.id}`);
    
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
      pusherClient.unsubscribe(`user-${session.user.id}`);
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

  const finishGame = async () => {
    if (mode === 'solo') {
      setGameState('loading');
      const res = await submitSoloScore(pledge, score);
      if (res.result === 'WIN') setGameState('won');
      else setGameState('lost');
    } else {
      if (!duelId) return;
      setGameState('waiting-opponent');
      await submitDuelScore(duelId, score, totalTime);
    }
  };

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
      setTimeLeft(10);
    } else {
      finishGame();
    }
  };

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

  if (gameState === 'loading') return <div className="text-center p-12"><Loader2 className="animate-spin mx-auto w-8 h-8 mb-4" /> Initializing...</div>;
  
  if (gameState === 'matchmaking') return (
    <div className="text-center p-12">
      <Loader2 className="animate-spin mx-auto w-12 h-12 text-primary mb-4" />
      <h2 className="text-2xl font-bold">Finding Opponent...</h2>
      <p className="text-slate-500 mt-2">Wager: ₦{pledge}</p>
      <button 
        onClick={handleCancel}
        className="mt-8 text-sm font-bold text-red-500 hover:underline"
      >
        Cancel and Refund
      </button>
    </div>
  );

  if (gameState === 'waiting-opponent') return (
    <div className="text-center p-12">
      <Loader2 className="animate-spin mx-auto w-12 h-12 text-primary mb-4" />
      <h2 className="text-2xl font-bold">Waiting for opponent to finish...</h2>
      <p className="text-slate-500 mt-2">Your Score: {score}/5</p>
    </div>
  );

  if (gameState === 'error') return (
    <div className="text-center p-12 text-red-500">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
      <h2 className="text-xl font-bold">Game Error</h2>
      <p className="mt-2">{errorMsg}</p>
      <button onClick={() => window.location.href = '/dashboard'} className="btn-primary mt-8">Back to Dashboard</button>
    </div>
  );

  if (gameState === 'won') return (
    <div className="card-premium text-center p-12 border-green-200 bg-green-50">
      <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-green-700">Victory!</h2>
      <p className="text-green-600 mt-2">You won ₦{mode === 'solo' ? pledge * 2 : pledge * 1.8}</p>
      <button onClick={() => window.location.href = '/'} className="btn-primary mt-8">Back Home</button>
    </div>
  );

  if (gameState === 'lost') return (
    <div className="card-premium text-center p-12 border-red-200 bg-red-50">
      <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-red-700">Defeat</h2>
      <p className="text-red-600 mt-2">
        {mode === 'solo' ? "You must answer ALL questions correctly to win against the computer." : "Your opponent played better this time."}
      </p>
      <button onClick={() => window.location.href = '/'} className="btn-primary mt-8 bg-slate-800">Back Home</button>
    </div>
  );

  if (gameState === 'draw') return (
    <div className="card-premium text-center p-12 border-blue-200 bg-blue-50">
      <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-blue-700">It's a Draw!</h2>
      <p className="text-blue-600 mt-2">Wager refunded: ₦{pledge}</p>
      <button onClick={() => window.location.href = '/'} className="btn-primary mt-8">Back Home</button>
    </div>
  );

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-medium">Question {currentIndex + 1}/{questions.length}</div>
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

