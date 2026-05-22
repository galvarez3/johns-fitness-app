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

// Epley formula: 1RM = weight × (1 + reps/30)
export function epley(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// Calculate working weight from 1RM and intensity
export function workingWeightFrom1RM(oneRM, intensity) {
  return roundToPlate(oneRM * intensity, 5);
}

// Get the exercise from a pool for a given block/week/slot (no two consecutive weeks repeat)
function pickExercise(pool, poolKey, blockNum, weekNum, slotOffset = 0) {
  const size = pool.length;
  const idx = ((blockNum - 1) + (weekNum - 1) + slotOffset) % size;
  return { ...pool[idx], poolKey, slotIdx: idx };
}

// Determine sets/reps based on role and scheme
function getSetsReps(role, scheme) {
  const s = SCHEMES[scheme];
  if (role === 'main') {
    return { sets: s.sets, repsMin: s.repsMin, repsMax: s.repsMax };
  }
  if (role === 'secondary') {
    // Secondary compound: lighter, more reps
    return { sets: 3, repsMin: 8, repsMax: 12 };
  }
  // Accessory: consistent moderate volume regardless of week
  return { sets: 3, repsMin: 10, repsMax: 15 };
}

// Build a single exercise entry for the workout
function buildExercise(slotDef, blockNum, weekNum, scheme, workingWeights, oneRMs) {
  const pool = slotDef.pool in COMPOUND_POOLS
    ? COMPOUND_POOLS[slotDef.pool]
    : ACCESSORY_POOLS[slotDef.pool];

  const exercise = pickExercise(pool, slotDef.pool, blockNum, weekNum, slotDef.slotOffset || 0);
  const { sets, repsMin, repsMax } = getSetsReps(slotDef.role, scheme);

  // Determine target weight
  let targetWeight = workingWeights[exercise.name] ?? STARTING_WORKING_WEIGHTS[exercise.name] ?? 0;

  // For primary lifts with a known 1RM, recalculate from intensity if no working weight recorded
  if (slotDef.role === 'main' && oneRMs[exercise.name]) {
    const schemeIntensity = slotDef.role === 'secondary'
      ? SCHEMES.hypertrophy.intensity
      : SCHEMES[scheme].intensity;
    const fromRM = workingWeightFrom1RM(oneRMs[exercise.name], schemeIntensity);
    // Use working weight if it exists and is reasonable, otherwise use 1RM-derived
    if (!workingWeights[exercise.name]) targetWeight = fromRM;
  }

  return {
    id: `${exercise.name.replace(/\s+/g, '_').toLowerCase()}_${blockNum}_${weekNum}`,
    name: exercise.name,
    equipment: exercise.equipment,
    poolKey: slotDef.pool,
    role: slotDef.role,
    label: slotDef.label,
    sets,
    repsMin,
    repsMax,
    targetWeight,
    restSeconds: slotDef.role === 'main' ? SCHEMES[scheme].restSeconds : exercise.restSeconds,
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

// Generate a single workout
export function generateWorkout(workoutType, blockNum, weekNum, scheme, workingWeights = {}, oneRMs = {}) {
  const template = WORKOUT_TEMPLATES[workoutType];
  const exercises = template.slots.map(slot =>
    buildExercise(slot, blockNum, weekNum, scheme, workingWeights, oneRMs)
  );

  return {
    id: `block${blockNum}_w${weekNum}_${workoutType.replace(/\s/g, '')}`,
    workoutType,
    label: template.label,
    focus: template.focus,
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

// Generate a full 4-week block
export function generateBlock(blockNum, workingWeights = {}, oneRMs = {}) {
  const weeks = [];

  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const scheme = WEEK_SCHEMES[weekNum - 1];
    weeks.push({
      weekNum,
      scheme,
      schemeLabel: SCHEMES[scheme].label,
      workouts: {
        monday:   generateWorkout('Upper A', blockNum, weekNum, scheme, workingWeights, oneRMs),
        tuesday:  generateWorkout('Lower A', blockNum, weekNum, scheme, workingWeights, oneRMs),
        wednesday: null,  // active recovery
        thursday: generateWorkout('Upper B', blockNum, weekNum, scheme, workingWeights, oneRMs),
        friday:   generateWorkout('Lower B', blockNum, weekNum, scheme, workingWeights, oneRMs),
      },
    });
  }

  return {
    blockNum,
    startDate: null, // set at app level
    weeks,
  };
}

// Given a date, determine which workout to show
export function getTodaysWorkout(block, blockStartDate) {
  if (!block || !blockStartDate) return null;

  const start = new Date(blockStartDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;

  const weekNum = Math.floor(diffDays / 7) + 1; // 1-indexed
  if (weekNum > 4) return null; // block complete

  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const workoutType = DAY_MAP[dayOfWeek];

  if (!workoutType) {
    return dayOfWeek === 3 ? { isRecovery: true, weekNum } : null;
  }

  const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
  const weekData = block.weeks[weekNum - 1];
  if (!weekData) return null;

  return {
    ...weekData.workouts[dayKey],
    weekNum,
    dayOfWeek,
    dayKey,
    isRecovery: false,
  };
}
