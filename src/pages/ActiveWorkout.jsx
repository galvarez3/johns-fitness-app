import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle, X, Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useTimer } from '../hooks/useTimer.js';
import RestTimer from '../components/RestTimer.jsx';
import { epley } from '../engine/progressiveOverload.js';

export default function ActiveWorkout() {
  const { state: locState } = useLocation();
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const timer = useTimer();

  const workout = locState?.workout;
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [exercises, setExercises] = useState(() =>
    (workout?.exercises || []).map(ex => ({
      ...ex,
      completedSets: [],
    }))
  );
  const [currentSetInput, setCurrentSetInput] = useState({ weight: '', reps: '', formGood: true });
  const [startTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);

  if (!workout) {
    return (
      <div className="scroll-area flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="text-slate-400">No workout data. Go back and try again.</div>
        <button onClick={() => navigate('/')} className="btn-secondary mt-4">Back</button>
      </div>
    );
  }

  const exercise = exercises[exerciseIdx];

  const handleLogSet = useCallback(() => {
    const w = parseFloat(currentSetInput.weight);
    const r = parseInt(currentSetInput.reps, 10);
    if ((!w && !exercise.isBodyweight) || !r || r <= 0) return;

    const newSet = {
      setNum: exercise.completedSets.length + 1,
      weight: w || 0,
      reps: r,
      formGood: currentSetInput.formGood,
      estimated1RM: w && r ? epley(w, r) : null,
      loggedAt: new Date().toISOString(),
    };

    const updated = exercises.map((ex, i) =>
      i === exerciseIdx
        ? { ...ex, completedSets: [...ex.completedSets, newSet] }
        : ex
    );
    setExercises(updated);
    setCurrentSetInput({ weight: currentSetInput.weight, reps: '', formGood: true });

    // Start rest timer
    timer.start(exercise.restSeconds || 90);
  }, [currentSetInput, exercise, exerciseIdx, exercises, timer]);

  const handleFinish = useCallback(async () => {
    timer.stop();
    const today = new Date().toISOString().split('T')[0];
    const session = {
      id: `session_${Date.now()}`,
      date: today,
      blockNum: workout.blockNum,
      weekNum: workout.weekNum,
      workoutType: workout.workoutType,
      dayKey: workout.dayKey,
      exercises,
      durationMinutes: Math.round((Date.now() - startTime) / 60000),
    };
    await actions.logSession(session);
    setFinished(true);
  }, [exercises, workout, actions, timer, startTime]);

  if (finished) {
    return <WorkoutComplete exercises={exercises} workout={workout} onDone={() => navigate('/')} />;
  }

  const canGoBack = exerciseIdx > 0;
  const canGoNext = exerciseIdx < exercises.length - 1;
  const setsRemaining = exercise.sets - exercise.completedSets.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white p-1 -ml-1">
          <X size={22} />
        </button>
        <div className="text-center">
          <div className="text-white font-semibold">{workout.workoutType}</div>
          <div className="text-slate-500 text-xs">Block {workout.blockNum} · Week {workout.weekNum}</div>
        </div>
        <button
          onClick={handleFinish}
          className="text-sky-400 hover:text-sky-300 text-sm font-semibold"
        >
          Done
        </button>
      </div>

      {/* Exercise nav */}
      <div className="px-4 flex gap-1.5 mb-3 flex-shrink-0 overflow-x-auto pb-1">
        {exercises.map((ex, i) => (
          <button
            key={ex.id}
            onClick={() => setExerciseIdx(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              i === exerciseIdx
                ? 'bg-sky-500 text-white'
                : ex.completedSets.length >= ex.sets
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-slate-800 text-slate-400'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="scroll-area px-4 pb-4">
        {/* Exercise header */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{exercise.name}</h2>
              <div className="text-slate-400 text-sm mt-0.5">{exercise.equipment}</div>
            </div>
            <div className="text-right">
              <div className="text-sky-400 font-bold text-lg">{exercise.sets}×{exercise.repsMin}–{exercise.repsMax}</div>
              <div className="text-slate-500 text-xs flex items-center justify-end gap-1">
                <Clock size={10} />{exercise.restSeconds}s rest
              </div>
            </div>
          </div>

          {/* Target weight badge */}
          {!exercise.isBodyweight && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-slate-400 text-xs">Target</span>
              <span className="text-white font-bold">{exercise.targetWeight} lbs</span>
            </div>
          )}
        </div>

        {/* Completed sets */}
        {exercise.completedSets.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Completed Sets</div>
            <div className="space-y-2">
              {exercise.completedSets.map((s) => (
                <div key={s.setNum} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
                      {s.setNum}
                    </div>
                    <span className="text-white font-semibold">
                      {s.weight ? `${s.weight} lbs` : 'BW'} × {s.reps} reps
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs">
                    {s.estimated1RM ? `~${s.estimated1RM} 1RM` : ''}
                    {s.formGood ? '' : ' ⚠'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log next set */}
        {setsRemaining > 0 && (
          <div className="card p-4 mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
              Set {exercise.completedSets.length + 1} of {exercise.sets}
            </div>

            <div className="flex gap-3 mb-4">
              {!exercise.isBodyweight && (
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Weight (lbs)</label>
                  <input
                    type="number"
                    className="input-field text-center text-2xl font-bold"
                    placeholder="—"
                    value={currentSetInput.weight}
                    onChange={e => setCurrentSetInput(p => ({ ...p, weight: e.target.value }))}
                    inputMode="decimal"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Reps</label>
                <input
                  type="number"
                  className="input-field text-center text-2xl font-bold"
                  placeholder="—"
                  value={currentSetInput.reps}
                  onChange={e => setCurrentSetInput(p => ({ ...p, reps: e.target.value }))}
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Form check */}
            <button
              onClick={() => setCurrentSetInput(p => ({ ...p, formGood: !p.formGood }))}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium mb-4 transition-colors ${
                currentSetInput.formGood
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {currentSetInput.formGood ? <Check size={16} /> : <X size={16} />}
              Form Good
            </button>

            <button
              onClick={handleLogSet}
              className="w-full btn-primary py-4 text-base"
              disabled={!currentSetInput.reps}
            >
              Log Set
            </button>
          </div>
        )}

        {setsRemaining === 0 && (
          <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 rounded-2xl py-4 text-green-400 font-semibold mb-4">
            <CheckCircle size={18} />
            Exercise Complete
          </div>
        )}

        {/* Prev / Next nav */}
        <div className="flex gap-3">
          <button
            onClick={() => canGoBack && setExerciseIdx(i => i - 1)}
            disabled={!canGoBack}
            className="flex-1 btn-secondary flex items-center justify-center gap-1 disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Prev
          </button>
          <button
            onClick={() => canGoNext && setExerciseIdx(i => i + 1)}
            disabled={!canGoNext}
            className="flex-1 btn-secondary flex items-center justify-center gap-1 disabled:opacity-30"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Rest timer overlay */}
      <RestTimer
        remaining={timer.remaining}
        total={timer.total}
        running={timer.running}
        onStop={timer.stop}
        onAdd={timer.addTime}
        onSubtract={timer.addTime.bind(null, -15)}
      />
    </div>
  );
}

function WorkoutComplete({ exercises, workout, onDone }) {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);
  const totalReps = exercises.reduce(
    (sum, ex) => sum + ex.completedSets.reduce((s, set) => s + set.reps, 0),
    0
  );

  return (
    <div className="scroll-area flex flex-col items-center text-center px-6 py-10">
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-5">
        <CheckCircle size={40} className="text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">Session Complete!</h2>
      <div className="text-slate-400 mt-1">{workout.workoutType} · {format(new Date(), 'MMMM d')}</div>

      <div className="grid grid-cols-2 gap-4 w-full mt-8 max-w-xs">
        <div className="card p-4">
          <div className="text-2xl font-bold text-white">{totalSets}</div>
          <div className="text-slate-400 text-sm">Total Sets</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-white">{totalReps}</div>
          <div className="text-slate-400 text-sm">Total Reps</div>
        </div>
      </div>

      <div className="w-full mt-6 space-y-2 max-w-xs text-left">
        {exercises.map(ex => (
          ex.completedSets.length > 0 && (
            <div key={ex.id} className="card px-4 py-2.5 flex items-center justify-between">
              <span className="text-white text-sm font-medium">{ex.name}</span>
              <span className="text-slate-400 text-sm">
                {ex.completedSets.length}×{ex.completedSets.map(s => s.reps).join('/')}
                {ex.completedSets[0]?.weight ? ` @ ${ex.completedSets[0].weight}` : ''}
              </span>
            </div>
          )
        ))}
      </div>

      <button onClick={onDone} className="btn-primary w-full max-w-xs mt-8 py-4">
        Back to Home
      </button>
    </div>
  );
}
