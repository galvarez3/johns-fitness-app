import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, CheckCircle } from 'lucide-react';
import { STRETCH_ROUTINE } from '../data/stretchRoutine.js';
import { useApp } from '../context/AppContext.jsx';
import { getNextWorkout } from '../engine/workoutGenerator.js';
import { NextSessionPreview } from '../components/SessionOverview.jsx';

export default function RecoveryPage() {
  const { state } = useApp();
  const nextWorkout = state.block ? getNextWorkout(state.block, state.blockStartDate) : null;
  const [current, setCurrent] = useState(0);
  const [side, setSide] = useState('left'); // 'left' | 'right' | null
  const [timeLeft, setTimeLeft] = useState(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState([]);
  const intervalRef = useRef(null);

  const stretch = STRETCH_ROUTINE[current];

  useEffect(() => {
    if (!stretch) return;
    const dur = stretch.durationSeconds;
    if (dur) setTimeLeft(dur);
    setRunning(false);
    setSide(stretch.sides ? 'left' : null);
    clearInterval(intervalRef.current);
  }, [current, stretch]);

  const startTimer = () => {
    if (!timeLeft) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(stretch.durationSeconds || null);
  };

  const handleNext = () => {
    if (stretch.sides && side === 'left') {
      // Switch to right side
      setSide('right');
      if (stretch.durationSeconds) setTimeLeft(stretch.durationSeconds);
      setRunning(false);
      clearInterval(intervalRef.current);
      return;
    }
    setCompleted(prev => [...prev, current]);
    if (current < STRETCH_ROUTINE.length - 1) {
      setCurrent(prev => prev + 1);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (current >= STRETCH_ROUTINE.length) {
    return (
      <div className="scroll-area flex flex-col items-center justify-center text-center px-6 py-12">
        <CheckCircle size={56} className="text-green-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">Recovery Complete</h2>
        <p className="text-slate-400 mt-2">15 minutes well spent. See you tomorrow for Upper B.</p>
      </div>
    );
  }

  const mins = Math.floor((timeLeft ?? 0) / 60);
  const secs = (timeLeft ?? 0) % 60;
  const timerDisplay = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${timeLeft ?? 0}s`;

  const progress = stretch.durationSeconds && timeLeft !== null
    ? 1 - timeLeft / stretch.durationSeconds
    : 0;

  return (
    <div className="scroll-area pb-6">
      <div className="px-4 pt-6 pb-2">
        <div className="text-slate-400 text-sm">Wednesday</div>
        <h1 className="display text-5xl text-white mt-1 leading-[0.9]">Active<br/>Recovery</h1>
        <div className="text-slate-500 text-sm mt-2">15 min stretch routine</div>
      </div>

      {/* Progress dots */}
      <div className="px-4 my-4 flex gap-1.5 flex-wrap">
        {STRETCH_ROUTINE.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              completed.includes(i) ? 'bg-green-500 w-4' :
              i === current ? 'bg-sky-500 w-4' :
              'bg-slate-700 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* Main stretch card */}
      <div className="px-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              {stretch.category}
            </span>
            <span className="text-slate-500 text-xs">{current + 1} / {STRETCH_ROUTINE.length}</span>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{stretch.name}</h2>

          {stretch.sides && (
            <div className="flex gap-2 mb-3">
              <SideChip active={side === 'left'} label="Left Side" />
              <SideChip active={side === 'right'} label="Right Side" />
            </div>
          )}

          <p className="text-slate-300 text-sm leading-relaxed mb-5">{stretch.description}</p>

          {/* Timer */}
          {stretch.durationSeconds ? (
            <div className="flex flex-col items-center gap-4">
              {/* Ring */}
              <div className="relative">
                <svg width="120" height="120" className="-rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={timeLeft === 0 ? '#22c55e' : '#6FE9F2'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={(1 - progress) * 2 * Math.PI * 50}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono text-white">
                  {timerDisplay}
                </span>
              </div>

              <div className="flex gap-3">
                <button onClick={resetTimer} className="btn-ghost p-2.5 rounded-xl">
                  <RotateCcw size={18} />
                </button>
                {running ? (
                  <button onClick={pauseTimer} className="btn-primary px-8 py-3">
                    <Pause size={18} />
                  </button>
                ) : (
                  <button onClick={startTimer} className="btn-primary px-8 py-3 flex items-center gap-2">
                    <Play size={18} fill="currentColor" />
                    {timeLeft === stretch.durationSeconds ? 'Start' : 'Resume'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <span className="text-white font-bold text-2xl">{stretch.reps} reps</span>
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          className="w-full btn-secondary mt-4 flex items-center justify-center gap-2"
        >
          {stretch.sides && side === 'left' ? 'Switch to Right Side' : 'Next Exercise'}
          <ChevronRight size={18} />
        </button>
      </div>

      {nextWorkout && (
        <div className="px-4 mt-7">
          <NextSessionPreview workout={nextWorkout} />
        </div>
      )}
    </div>
  );
}

function SideChip({ active, label }) {
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
      active ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
    }`}>
      {label}
    </div>
  );
}
