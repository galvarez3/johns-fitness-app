import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Play, CheckCircle, Dumbbell, Wind, Calendar, Flame, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { getTodaysWorkout } from '../engine/workoutGenerator.js';
import RecoveryPage from './RecoveryPage.jsx';

const SCHEME_COLORS = {
  hypertrophy:      'bg-sky-500/20 text-sky-400 border-sky-500/30',
  strength:         'bg-red-500/20 text-red-400 border-red-500/30',
  volume:           'bg-green-500/20 text-green-400 border-green-500/30',
  hypertrophy_plus: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function TodayPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  const today = state.block
    ? getTodaysWorkout(state.block, state.blockStartDate)
    : null;

  const todayDate = format(new Date(), 'EEEE, MMMM d');
  const blockLabel = `Block ${state.blockNum} · Week ${today?.weekNum ?? '—'}`;
  const latestBW = state.bodyweightLog.at(-1)?.weight ?? '—';
  const prs = Object.entries(state.personalRecords);

  if (today?.isRecovery) return <RecoveryPage />;

  const isRestDay = !today;

  return (
    <div className="scroll-area pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="text-slate-400 text-sm font-medium">{todayDate}</div>
        <div className="flex items-center justify-between mt-0.5">
          <h1 className="text-2xl font-bold text-white">
            {isRestDay ? 'Rest Day' : today.workoutType}
          </h1>
          <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full font-medium">
            {blockLabel}
          </div>
        </div>
        {!isRestDay && today.schemeLabel && (
          <div className="mt-2">
            <span className={`tag border ${SCHEME_COLORS[today.scheme] || 'bg-slate-700 text-slate-300'}`}>
              {today.schemeLabel} Week
            </span>
            <span className="text-slate-500 text-xs ml-2">{today.focus}</span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-4">
        <StatCard label="Bodyweight" value={`${latestBW} lbs`} icon={<Flame size={14} />} />
        <StatCard label="Streak" value={`${state.streak}wk`} icon={<Flame size={14} className="text-amber-400" />} />
        <StatCard label="Goal" value={`${state.goalWeight} lbs`} icon={<Trophy size={14} className="text-amber-400" />} />
      </div>

      {isRestDay ? (
        <RestDayCard />
      ) : (
        <>
          {/* Start workout button */}
          <div className="px-4 mb-4">
            {today.completed ? (
              <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 rounded-2xl py-4 text-green-400 font-semibold">
                <CheckCircle size={20} />
                Session Complete
              </div>
            ) : (
              <button
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base"
                onClick={() => navigate('/workout', { state: { workout: today } })}
              >
                <Play size={20} fill="currentColor" />
                Start {today.workoutType}
              </button>
            )}
          </div>

          {/* Exercise list preview */}
          <div className="px-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Today's Exercises</div>
            <div className="space-y-2">
              {today.exercises?.map((ex, i) => (
                <ExercisePreviewCard key={ex.id} exercise={ex} index={i} pr={state.personalRecords[ex.name]} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* PR Board */}
      <div className="px-4 mt-6">
        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Trophy size={12} className="text-amber-400" />
          Personal Records
        </div>
        <div className="card p-4 grid grid-cols-2 gap-3">
          {prs.map(([name, pr]) => (
            <div key={name}>
              <div className="text-slate-400 text-xs truncate">{name}</div>
              <div className="text-white font-bold text-lg leading-tight">{pr.estimated1RM}<span className="text-slate-400 text-sm font-normal"> lbs</span></div>
              <div className="text-slate-500 text-xs">est. 1RM</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1 text-slate-400 text-xs">{icon}{label}</div>
      <div className="text-white font-bold text-lg leading-tight">{value}</div>
    </div>
  );
}

function ExercisePreviewCard({ exercise, index, pr }) {
  const repRange = exercise.isTimed
    ? `${exercise.defaultSeconds}s`
    : `${exercise.repsMin}–${exercise.repsMax}`;

  return (
    <div className="card px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div>
          <div className="text-white text-sm font-medium">{exercise.name}</div>
          <div className="text-slate-500 text-xs">{exercise.equipment}</div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-white text-sm font-semibold">
          {exercise.sets}×{repRange}
        </div>
        <div className="text-slate-500 text-xs">
          {exercise.isBodyweight ? 'Bodyweight' : `${exercise.targetWeight} lbs`}
        </div>
      </div>
    </div>
  );
}

function RestDayCard() {
  return (
    <div className="px-4">
      <div className="card p-6 text-center">
        <Wind size={32} className="text-slate-600 mx-auto mb-3" />
        <div className="text-white font-semibold text-lg">Rest & Recover</div>
        <div className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
          Today is a scheduled rest day. Eat well, sleep 8+ hours, and come back stronger tomorrow.
        </div>
      </div>
    </div>
  );
}
