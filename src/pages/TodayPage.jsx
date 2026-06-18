import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Play, CheckCircle, Wind, Flame, Trophy, Target } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { getTodaysWorkout, getNextWorkout } from '../engine/workoutGenerator.js';
import { SessionOverview, NextSessionPreview, WorkoutPicker } from '../components/SessionOverview.jsx';
import RecoveryPage from './RecoveryPage.jsx';

const SCHEME_COLORS = {
  hypertrophy:      'bg-sky-500/15 text-sky-400 border-sky-500/30',
  strength:         'bg-red-500/15 text-red-400 border-red-500/30',
  volume:           'bg-green-500/15 text-green-400 border-green-500/30',
  hypertrophy_plus: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
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

  const nextWorkout = isRestDay && state.block
    ? getNextWorkout(state.block, state.blockStartDate)
    : null;

  // For rest days, compute the current calendar week so the Lift Instead picker
  // can offer this week's strength sessions.
  let restDayWeekNum = null;
  if (isRestDay && state.block && state.blockStartDate) {
    const start = new Date(state.blockStartDate + 'T00:00:00');
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((t - start) / 86400000);
    if (diffDays >= 0) {
      const w = Math.floor(diffDays / 7) + 1;
      if (w >= 1 && w <= 4) restDayWeekNum = w;
    }
  }

  return (
    <div className="scroll-area pb-6">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-[13px] font-medium tracking-wide">{todayDate}</div>
          <div className="text-[11px] text-slate-400 bg-slate-800/70 border border-white/[0.06] px-3 py-1 rounded-full font-semibold">
            {blockLabel}
          </div>
        </div>
        <h1 className="display text-[3.25rem] text-white mt-1">
          {isRestDay ? 'Rest Day' : today.workoutType}
        </h1>
        {!isRestDay && today.schemeLabel && (
          <div className="flex items-center gap-2 mt-1">
            <span className={`tag border ${SCHEME_COLORS[today.scheme] || 'bg-slate-700 text-slate-300'}`}>
              {today.schemeLabel} Week
            </span>
            <span className="text-slate-500 text-xs">{today.focus}</span>
          </div>
        )}
      </div>

      {isRestDay ? (
        <div className="px-4 space-y-5">
          <RestDayCard />
          {restDayWeekNum && <WorkoutPicker block={state.block} weekNum={restDayWeekNum} />}
          {nextWorkout && <NextSessionPreview workout={nextWorkout} />}
        </div>
      ) : (
        <>
          {/* Hero session CTA */}
          <div className="px-4 mb-5">
            {today.completed ? (
              <div className="card p-5 flex items-center gap-4 border-green-500/25">
                <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <div>
                  <div className="display text-2xl text-white">Session Done</div>
                  <div className="text-slate-400 text-sm mt-0.5">{today.workoutType} logged today</div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/workout', { state: { workout: today } })}
                className="w-full text-left card cta-glow p-5 flex items-center justify-between active:scale-[0.99] transition-transform overflow-hidden relative"
              >
                <div className="relative z-10">
                  <div className="text-sky-400 text-[11px] font-bold uppercase tracking-[0.22em] mb-2">
                    Today's Session
                  </div>
                  <div className="display text-3xl text-white leading-none">{today.workoutType}</div>
                  <div className="text-slate-400 text-sm mt-2">
                    {today.exercises?.length} exercises · {today.focus}
                  </div>
                </div>
                <div className="w-[68px] h-[68px] rounded-full bg-sky-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-glow relative z-10">
                  <Play size={28} fill="currentColor" className="ml-1" />
                </div>
                <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-sky-400/10 blur-2xl" />
              </button>
            )}
          </div>

          {/* Session overview */}
          <div className="px-4 mb-5">
            <SessionOverview workout={today} />
          </div>

          {/* Bento stats */}
          <div className="px-4 grid grid-cols-3 gap-3 mb-6">
            <StatTile label="Bodyweight" value={latestBW} unit="lbs" icon={<Flame size={14} />} />
            <StatTile label="Streak" value={state.streak} unit="wk" icon={<Flame size={14} className="text-amber-500" />} />
            <StatTile label="Goal" value={state.goalWeight} unit="lbs" icon={<Target size={14} className="text-sky-500" />} />
          </div>

          {/* Exercise list */}
          <div className="px-4">
            <SectionLabel>Today's Exercises</SectionLabel>
            <div className="space-y-2.5">
              {today.exercises?.map((ex, i) => (
                <ExercisePreviewCard key={ex.id} exercise={ex} index={i} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* PR Board */}
      <div className="px-4 mt-7">
        <SectionLabel icon={<Trophy size={12} className="text-amber-400" />}>Personal Records</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {prs.map(([name, pr]) => (
            <div key={name} className="card-light p-4">
              <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wide truncate">{name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="stat-num text-[2rem] text-slate-950">{pr.estimated1RM}</span>
                <span className="text-slate-400 text-xs font-semibold">lbs</span>
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">est. 1RM</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, icon }) {
  return (
    <div className="text-[11px] text-slate-500 uppercase tracking-[0.18em] font-bold mb-3 flex items-center gap-2">
      {icon}{children}
    </div>
  );
}

function StatTile({ label, value, unit, icon }) {
  return (
    <div className="card-light p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">{label}</span>
        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">{icon}</span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-1">
        <span className="stat-num text-[1.75rem] text-slate-950">{value}</span>
        {unit && <span className="text-slate-400 text-[11px] font-semibold">{unit}</span>}
      </div>
    </div>
  );
}

function ExercisePreviewCard({ exercise, index }) {
  const repRange = exercise.isTimed
    ? `${exercise.defaultSeconds}s`
    : `${exercise.repsMin}–${exercise.repsMax}`;

  return (
    <div className="card px-4 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-9 h-9 rounded-2xl bg-sky-400/15 text-sky-400 flex items-center justify-center flex-shrink-0 stat-num text-sm">
          {index + 1}
        </div>
        <div className="min-w-0">
          <div className="text-white text-[15px] font-semibold leading-tight truncate">{exercise.name}</div>
          <div className="text-slate-500 text-xs mt-0.5">{exercise.equipment}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 pl-3">
        <div className="text-right">
          <div className="text-white text-sm font-bold">{exercise.sets}×{repRange}</div>
          <div className="text-slate-500 text-xs">
            {exercise.isBodyweight ? 'Bodyweight' : `${exercise.targetWeight} lbs`}
          </div>
        </div>
      </div>
    </div>
  );
}

function RestDayCard() {
  return (
    <div>
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800/70 flex items-center justify-center mx-auto mb-4">
          <Wind size={30} className="text-sky-400" />
        </div>
        <div className="display text-2xl text-white">Recover</div>
        <div className="text-slate-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
          Today is a scheduled rest day. Eat well, sleep 8+ hours, and come back stronger tomorrow.
        </div>
      </div>
    </div>
  );
}
