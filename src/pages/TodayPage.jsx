import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Play, CheckCircle, Dumbbell, Wind, Trophy, Bike, Clock, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { getTodaysWorkout } from '../engine/workoutGenerator.js';
import PelotonPage from './PelotonPage.jsx';

const SCHEME_COLORS = {
  foundation: 'bg-green-500/20 text-green-400 border-green-500/30',
  build:      'bg-sky-500/20 text-sky-400 border-sky-500/30',
  progress:   'bg-purple-500/20 text-purple-400 border-purple-500/30',
  peak:       'bg-red-500/20 text-red-400 border-red-500/30',
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

  // Peloton day
  if (today?.isPeloton) {
    return <PelotonPage weekNum={today.weekNum} dayKey={today.dayKey} />;
  }

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
          <div className="mt-2 flex items-center gap-2">
            <span className={`tag border ${SCHEME_COLORS[today.scheme] || 'bg-slate-700 text-slate-300'}`}>
              {today.schemeLabel}
            </span>
            <span className="text-slate-500 text-xs">{today.focus}</span>
            <span className="flex items-center gap-1 text-slate-600 text-xs ml-auto">
              <Clock size={10} />{today.durationMinutes} min
            </span>
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
                Start {today.workoutType} — {today.durationMinutes} min
              </button>
            )}
          </div>

          {/* Exercise list preview */}
          <div className="px-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Today's 3 Exercises</div>
            <div className="space-y-2">
              {today.exercises?.map((ex, i) => (
                <ExercisePreviewCard key={ex.id} exercise={ex} index={i} />
              ))}
            </div>
          </div>

          {/* 15-min structure explainer */}
          <div className="px-4 mt-4">
            <div className="card p-4 flex items-start gap-3">
              <Clock size={16} className="text-sky-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-white text-sm font-medium">15-Minute Structure</div>
                <div className="text-slate-400 text-xs mt-1">
                  3 exercises × 3 sets each. {today.schemeLabel === 'Foundation' || today.schemeLabel === 'Build' ? '60' : '75'}s rest between sets.
                  Focus on form — the weight will come back fast.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Week schedule */}
      <div className="px-4 mt-5">
        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">This Week</div>
        <WeekSchedule />
      </div>

      {/* PR Board */}
      <div className="px-4 mt-5">
        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Trophy size={12} className="text-amber-400" />
          Personal Records
        </div>
        <div className="card p-4 grid grid-cols-2 gap-3">
          {prs.map(([name, pr]) => (
            <div key={name}>
              <div className="text-slate-400 text-xs truncate">{name}</div>
              <div className="text-white font-bold text-lg leading-tight">
                {pr.estimated1RM}<span className="text-slate-400 text-sm font-normal"> lbs</span>
              </div>
              <div className="text-slate-500 text-xs">est. 1RM</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekSchedule() {
  const days = [
    { label: 'Mon', type: 'Strength A', icon: <Dumbbell size={12} /> },
    { label: 'Tue', type: 'Peloton', icon: <Bike size={12} /> },
    { label: 'Wed', type: 'Strength B', icon: <Dumbbell size={12} /> },
    { label: 'Thu', type: 'Peloton', icon: <Bike size={12} /> },
    { label: 'Fri', type: 'Strength C', icon: <Dumbbell size={12} /> },
    { label: 'Sat', type: 'Rest', icon: <Wind size={12} /> },
    { label: 'Sun', type: 'Rest', icon: <Wind size={12} /> },
  ];
  const todayIdx = new Date().getDay(); // 0=Sun
  const reordered = [
    days[1], days[2], days[3], days[4], days[5], days[6], days[0],
  ]; // Mon-Sun

  const currentDayLabel = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][todayIdx];

  return (
    <div className="flex gap-1.5">
      {reordered.map(d => {
        const isToday = d.label === currentDayLabel;
        const isPeloton = d.type === 'Peloton';
        const isRest = d.type === 'Rest';
        return (
          <div
            key={d.label}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-colors ${
              isToday
                ? isPeloton ? 'bg-orange-500/20 border border-orange-500/40'
                  : isRest ? 'bg-slate-800 border border-slate-700'
                  : 'bg-sky-500/20 border border-sky-500/40'
                : 'bg-slate-800/50'
            }`}
          >
            <span className={isToday ? isPeloton ? 'text-orange-400' : isRest ? 'text-slate-400' : 'text-sky-400' : 'text-slate-500'}>
              {d.icon}
            </span>
            <span className={`font-semibold ${isToday ? 'text-white' : 'text-slate-500'}`}>{d.label}</span>
          </div>
        );
      })}
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

function ExercisePreviewCard({ exercise, index }) {
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
        <div className="text-white text-sm font-semibold">{exercise.sets}×{repRange}</div>
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
        <div className="text-white font-semibold text-lg">Rest Day</div>
        <div className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
          Eat well, sleep 8+ hours. The work gets done Mon–Fri — weekends are for recovering from it.
        </div>
      </div>
    </div>
  );
}
