import { X, Plus, Minus } from 'lucide-react';

const CIRCUMFERENCE = 2 * Math.PI * 44; // r=44

export default function RestTimer({ remaining, total, running, onStop, onAdd, onSubtract }) {
  if (!running && remaining === 0) return null;

  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${secs}s`;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-2xl px-6 py-4 shadow-2xl flex flex-col items-center gap-3 min-w-[200px]">
        <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Rest</div>

        <div className="relative flex items-center justify-center">
          <svg width="100" height="100" className="-rotate-90">
            <circle
              cx="50" cy="50" r="44"
              fill="none" stroke="#1e293b" strokeWidth="6"
            />
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke={remaining <= 10 ? '#ef4444' : '#0ea5e9'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <span className="absolute text-2xl font-bold font-mono text-white">{display}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSubtract?.(15)}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onStop}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={14} />
          </button>
          <button
            onClick={() => onAdd?.(15)}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
