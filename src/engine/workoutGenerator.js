import {
  COMPOUND_POOLS,
  ACCESSORY_POOLS,
  SCHEMES,
  WEEK_SCHEMES,
  WORKOUT_TEMPLATES,
  DAY_MAP,
} from '../data/exerciseLibrary.js';
import { STARTING_WORKING_WEIGHTS } from '../data/startingData.js';
import { roundToPlate } from './progressiveOverload.js';

export function epley(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function workingWeightFrom1RM(oneRM, intensity) {
  return roundToPlate(oneRM * intensity, 5);
}

function pickExercise(pool, blockNum, weekNum, slotOffset = 0) {
  const size = pool.length;
  const idx = ((blockNum - 1) + (weekNum - 1) + slotOffset) % size;
  return { ...pool[idx] };
}

function getSetsReps(role, scheme) {
  const s = SCHEMES[scheme];
  if (role === 'main') {
    return { sets: s.sets, repsMin: s.repsMin, repsMax: s.repsMax };
  }
  // Accessory (core): consistent moderate volume
  return { sets: 3, repsMin: 10, repsMax: 15 };
}

function buildExercise(slotDef, blockNum, weekNum, scheme, workingWeights, oneRMs) {
  const pool = slotDef.pool in COMPOUND_POOLS
    ? COMPOUND_POOLS[slotDef.pool]
    : ACCESSORY_POOLS[slotDef.pool];

  const exercise = pickExercise(pool, blockNum, weekNum, slotDef.slotOffset || 0);
  const { sets, repsMin, repsMax } = getSetsReps(slotDef.role, scheme);

  let targetWeight = workingWeights[exercise.name] ?? STARTING_WORKING_WEIGHTS[exercise.name] ?? 0;

  return {
    id: `${exercise.name.replace(/\s+/g, '_').toLowerCase()}_b${blockNum}_w${weekNum}`,
    name: exercise.name,
    equipment: exercise.equipment,
    poolKey: slotDef.pool,
    role: slotDef.role,
    label: slotDef.label,
    sets,
    repsMin,
    repsMax,
    targetWeight,
    restSeconds: slotDef.role === 'main' ? SCHEMES[scheme].restSeconds : (exercise.restSeconds || 45),
    isBodyweight: exercise.isBodyweight || false,
    isCarry: exercise.isCarry || false,
    isTimed: exercise.isTimed || false,
    defaultSeconds: exercise.defaultSeconds || null,
    isPrimary: exercise.isPrimary || false,
    completedSets: [],
    failed: false,
    failCount: 0,
  };
}

export function generateWorkout(workoutType, blockNum, weekNum, scheme, workingWeights = {}, oneRMs = {}) {
  const template = WORKOUT_TEMPLATES[workoutType];
  if (!template) return null;

  const exercises = template.slots.map(slot =>
    buildExercise(slot, blockNum, weekNum, scheme, workingWeights, oneRMs)
  );

  return {
    id: `block${blockNum}_w${weekNum}_${workoutType.replace(/\s/g, '')}`,
    workoutType,
    label: template.label,
    focus: template.focus,
    durationMinutes: template.durationMinutes || 15,
    blockNum,
    weekNum,
    scheme,
    schemeLabel: SCHEMES[scheme].label,
    exercises,
    completed: false,
    startedAt: null,
    completedAt: null,
    notes: '',
  };
}

export function generateBlock(blockNum, workingWeights = {}, oneRMs = {}) {
  const weeks = [];

  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const scheme = WEEK_SCHEMES[weekNum - 1];
    weeks.push({
      weekNum,
      scheme,
      schemeLabel: SCHEMES[scheme].label,
      workouts: {
        monday:    generateWorkout('Strength A', blockNum, weekNum, scheme, workingWeights, oneRMs),
        tuesday:   'peloton',
        wednesday: generateWorkout('Strength B', blockNum, weekNum, scheme, workingWeights, oneRMs),
        thursday:  'peloton',
        friday:    generateWorkout('Strength C', blockNum, weekNum, scheme, workingWeights, oneRMs),
        saturday:  null,
        sunday:    null,
      },
    });
  }

  return { blockNum, startDate: null, weeks };
}

// Resolve the workout (if any) scheduled for a specific date
export function getWorkoutForDate(block, blockStartDate, date) {
  if (!block || !blockStartDate) return null;

  const start = new Date(blockStartDate + 'T00:00:00');
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((d - start) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;

  const weekNum = Math.floor(diffDays / 7) + 1;
  if (weekNum > 4) return null;

  const dayOfWeek = d.getDay();
  const workoutType = DAY_MAP[dayOfWeek];
  if (!workoutType) return null;

  const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
  const weekData = block.weeks[weekNum - 1];
  if (!weekData) return null;

  const workout = weekData.workouts[dayKey];
  return workout ? { ...workout, weekNum, dayOfWeek, dayKey } : null;
}

// Find the next upcoming workout within the next two weeks
export function getNextWorkout(block, blockStartDate) {
  for (let i = 1; i <= 14; i++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);
    const workout = getWorkoutForDate(block, blockStartDate, date);
    if (workout) return { ...workout, date, daysAway: i };
  }
  return null;
}
export function getTodaysWorkout(block, blockStartDate) {
  if (!block || !blockStartDate) return null;

  const start = new Date(blockStartDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;

  const weekNum = Math.floor(diffDays / 7) + 1;
  if (weekNum > 4) return null;

  const dayOfWeek = today.getDay(); // 0=Sun … 6=Sat
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = dayKeys[dayOfWeek];

  const workoutType = DAY_MAP[dayOfWeek];

  if (workoutType === 'Peloton') {
    return { isPeloton: true, weekNum, dayOfWeek, dayKey };
  }

  if (!workoutType) {
    return null; // weekend rest day
  }

  const weekData = block.weeks[weekNum - 1];
  if (!weekData) return null;

  const workout = weekData.workouts[dayKey];
  if (!workout || workout === 'peloton') return null;

  return { ...workout, weekNum, dayOfWeek, dayKey, isRecovery: false, isPeloton: false };
}
