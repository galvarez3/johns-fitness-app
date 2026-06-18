import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, ChevronRight, CheckCircle, X } from 'lucide-react';
import { STRETCH_ROUTINE } from '../data/stretchRoutine.js';
import { useApp } from '../context/AppContext.jsx';
import { getNextWorkout, getTodaysWorkout } from '../engine/workoutGenerator.js';
import { NextSessionPreview, WorkoutPicker } from '../components/SessionOverview.jsx';

export default function RecoveryPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const nextWorkout = state.block ? getNextWorkout(state.block, state.blockStartDate) : null;
  const todayInfo = state.block ? getTodaysWorkout(state.block, state.blockStartDate) : null;
  const currentWeekNum = todayInfo?.weekNum ?? null;
  const [current, setCurrent] = useState(0);
  const [side, setSide] = useState('left'); // 'left' | 'right' | null
  const [timeLeft, setTimeLeft] = useState(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [startTime] = useState(Date.now());
  const loggedRef = useRef(false);
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
    setCompleted(prev => (prev.includes(current) ? prev : [...prev, current]));
    setCurrent(prev => prev + 1); // advance past last index to trigger completion view
  };

  const handleFinish = useCallback(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    clearInterval(intervalRef.current);
    const todayInfo = state.block ? getTodaysWorkout(state.block, state.blockStartDate) : null;
    const today = new Date().toISOString().split('T')[0];
    const stretchesCompleted = completed.length + (current < STRETCH_ROUTINE.length && !completed.includes(current) ? 1 : 0);
    const session = {
      id: `session_${Date.now()}`,
      date: today,
      blockNum: state.blockNum,
      weekNum: todayInfo?.weekNum ?? null,
      workoutType: 'Active Recovery',
      dayKey: 'wednesday',
      exercises: [],
      stretchesCompleted,
      totalStretches: STRETCH_ROUTINE.length,
      durationMinutes: Math.max(1, Math.round((Date.now() - startTime) / 60000)),
      isRecovery: true,
    };
    actions.logSession(session);
    setCurrent(STRETCH_ROUTINE.length); // jump to completion view
  }, [actions, state.block, state.blockStartDate, state.blockNum, completed, current, startTime]);

  // Auto-log when user reaches natural completion via Next
  useEffect(() => {
    if (current >= STRETCH_ROUTINE.length && !loggedRef.current) {
      handleFinish();
    }
  }, [current, handleFinish]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (current >= STRETCH_ROUTINE.length) {
    const elapsedMin = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const doneCount = completed.length || STRETCH_ROUTINE.length;
    return (
      <div className="scroll-area flex flex-col items-center text-center px-6 pt-12 pb-6">
        <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mb-5">
          <CheckCircle size={42} className="text-green-400" />
        </div>
        <h2 className="display text-4xl text-white">Recovery Logged</h2>
        <p className="text-slate-400 mt-2 max-w-xs">Session saved. Nice work resetting the body.</p>

        <div className="grid grid-cols-2 gap-4 w-full mt-8 max-w-xs">
          <div className="card-light p-4">
            <div className="stat-num text-3xl text-slate-950">{doneCount}</div>
            <div className="text-slate-500 text-sm">Stretches</div>
          </div>
          <div className="card-light p-4">
            <div className="stat-num text-3xl text-slate-950">{elapsedMin}</div>
            <div className="text-slate-500 text-sm">Minutes</div>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="btn-primary w-full max-w-xs mt-8 py-4 cta-glow">
          Back to Home
        </button>

        {nextWorkout && (
          <div className="w-full mt-10">
            <NextSessionPreview workout={nextWorkout} />
          </div>
        )}
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
      <div className="px-4 pt-6 pb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-slate-400 text-sm">Wednesday</div>
          <h1 className="display text-5xl text-white mt-1 leading-[0.9]">Active<br/>Recovery</h1>
          <div className="text-slate-500 text-sm mt-2">15 min stretch routine</div>
        </div>
        <button
          onClick={handleFinish}
          className="flex items-center gap-1.5 bg-slate-800/70 border border-white/[0.06] text-slate-200 text-xs font-semibold rounded-full px-3.5 py-2 active:scale-95 transition-transform"
        >
          <X size={14} />
          End Session
        </button>
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

      {currentWeekNum && (
        <div className="px-4 mt-6">
          <WorkoutPicker block={state.block} weekNum={currentWeekNum} />
        </div>
      )}

      {nextWorkout && (
        <div className="px-4 mt-6">
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
