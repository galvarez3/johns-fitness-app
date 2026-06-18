import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Layers, Clock, CalendarDays, Check, Play } from 'lucide-react';

export function buildOverview(exercises = []) {
  const sets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
  const seconds = exercises.reduce((sum, ex) => {
    const work = ex.isTimed ? (ex.defaultSeconds || 40) : 40;
    return sum + (ex.sets || 0) * (work + (ex.restSeconds || 90));
  }, 0);
  const equipment = [...new Set(exercises.map(ex => ex.equipment).filter(Boolean))];
  return {
    exercises: exercises.length,
    sets,
    minutes: Math.max(5, Math.round(seconds / 60)),
    equipment,
  };
}

function OverviewMetric({ icon, value, unit, label }) {
  return (
    <div className="flex flex-col items-center justify-center px-2">
      <div className="text-sky-400 mb-1.5">{icon}</div>
      <div className="flex items-baseline gap-0.5">
        <span className="stat-num text-2xl text-white">{value}</span>
        {unit && <span className="text-slate-500 text-[11px] font-semibold">{unit}</span>}
      </div>
      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

// Metrics + equipment summary for a workout
export function SessionOverview({ workout }) {
  const o = buildOverview(workout.exercises);
  return (
    <div className="card px-2 py-4">
      <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
        <OverviewMetric icon={<Dumbbell size={15} />} value={o.exercises} label="Exercises" />
        <OverviewMetric icon={<Layers size={15} />} value={o.sets} label="Total Sets" />
        <OverviewMetric icon={<Clock size={15} />} value={`~${o.minutes}`} unit="min" label="Est. Time" />
      </div>
      {(workout.focus || o.equipment.length > 0) && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] px-2 space-y-2.5">
          {workout.focus && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wide w-[68px] flex-shrink-0">Focus</span>
              <span className="text-slate-200 text-sm font-medium">{workout.focus}</span>
            </div>
          )}
          {o.equipment.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wide w-[68px] flex-shrink-0 mt-1">Equipment</span>
              <div className="flex flex-wrap gap-1.5">
                {o.equipment.map(eq => (
                  <span key={eq} className="tag bg-slate-800/70 border border-white/[0.06] text-slate-300">{eq}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Picker for choosing a strength session to do today (used on recovery/rest days)
export function WorkoutPicker({ block, weekNum, title = 'Lift Instead', subtitle = 'Got time to lift? Pick a strength session from this week.' }) {
  const navigate = useNavigate();
  if (!block || !weekNum) return null;
  const week = block.weeks?.[weekNum - 1];
  if (!week) return null;

  const entries = [
    ['monday',   week.workouts.monday],
    ['tuesday',  week.workouts.tuesday],
    ['thursday', week.workouts.thursday],
    ['friday',   week.workouts.friday],
  ].filter(([, w]) => Boolean(w));

  if (entries.length === 0) return null;

  return (
    <div className="card p-4">
      <div className="text-[11px] text-sky-400 uppercase tracking-[0.22em] font-bold mb-1.5">{title}</div>
      <div className="text-slate-400 text-sm mb-4">{subtitle}</div>
      <div className="grid grid-cols-2 gap-2.5">
        {entries.map(([dayKey, w]) => (
          <button
            key={dayKey}
            onClick={() => navigate('/workout', { state: { workout: { ...w, dayKey, weekNum } } })}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left active:scale-[0.98] transition-transform ${
              w.completed
                ? 'bg-green-500/10 border-green-500/25 text-green-300'
                : 'bg-slate-800/70 border-white/[0.06] text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-sm font-bold">{w.workoutType}</span>
            {w.completed ? <Check size={15} className="text-green-400" /> : <Play size={13} className="text-sky-400" fill="currentColor" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// "Next session" preview shown on rest / recovery days
export function NextSessionPreview({ workout }) {
  if (!workout) return null;

  const whenLabel = workout.daysAway === 1 ? 'Tomorrow' : format(workout.date, 'EEEE');

  return (
    <div className="space-y-3">
      <div className="card p-5">
        <div className="flex items-center gap-1.5 text-sky-400 text-[11px] font-bold uppercase tracking-[0.22em] mb-2">
          <CalendarDays size={13} />
          Next Session · {whenLabel}
        </div>
        <div className="display text-3xl text-white leading-none">{workout.workoutType}</div>
        {workout.schemeLabel && (
          <div className="text-slate-400 text-sm mt-2">{workout.schemeLabel} Week</div>
        )}
      </div>

      <SessionOverview workout={workout} />

      <div className="card divide-y divide-white/[0.06]">
        {workout.exercises?.map((ex, i) => {
          const repRange = ex.isTimed ? `${ex.defaultSeconds}s` : `${ex.repsMin}–${ex.repsMax}`;
          return (
            <div key={ex.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-sky-400/15 text-sky-400 flex items-center justify-center flex-shrink-0 stat-num text-xs">
                  {i + 1}
                </div>
                <span className="text-white text-sm font-medium truncate">{ex.name}</span>
              </div>
              <div className="text-right flex-shrink-0 pl-3">
                <div className="text-slate-300 text-sm font-semibold">{ex.sets}×{repRange}</div>
                <div className="text-slate-500 text-xs">{ex.isBodyweight ? 'Bodyweight' : `${ex.targetWeight} lbs`}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
