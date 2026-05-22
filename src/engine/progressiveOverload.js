// Round to the nearest plate increment
export function roundToPlate(weight, increment = 5) {
  return Math.round(weight / increment) * increment;
}

// Epley 1RM estimate
export function epley(weight, reps) {
  if (!weight || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// Determine whether all sets were completed at target reps
function allSetsCompleted(completedSets, targetRepsMin) {
  if (!completedSets || completedSets.length === 0) return false;
  return completedSets.every(s => s.reps >= targetRepsMin && s.formGood !== false);
}

// Determine whether any set missed reps
function anySetFailed(completedSets, targetRepsMin) {
  if (!completedSets || completedSets.length === 0) return false;
  return completedSets.some(s => s.reps < targetRepsMin);
}

// Upper body: +5 lbs on success, lower body: +10 lbs on success
export function calculateNextWeight(exercise, completedSets) {
  const current = exercise.targetWeight;
  const isLower = ['squat', 'hip_hinge'].includes(exercise.poolKey);
  const increment = isLower ? 10 : 5;

  const success = allSetsCompleted(completedSets, exercise.repsMin);
  const failed = anySetFailed(completedSets, exercise.repsMin);

  if (exercise.isBodyweight || exercise.isTimed || exercise.isCarry) {
    // For bodyweight: increase reps or add belt weight when ready
    // For carries: increase distance or weight by 5 lbs
    if (exercise.isCarry && success) return { weight: current + 5, reason: 'carry_progress' };
    return { weight: current, reason: 'bodyweight_hold' };
  }

  if (success) {
    return { weight: roundToPlate(current + increment), reason: 'completed_all', increment };
  }

  if (failed) {
    const newFailCount = (exercise.failCount || 0) + 1;
    if (newFailCount >= 2) {
      const deload = roundToPlate(current * 0.90);
      return { weight: deload, reason: 'deload', failCount: newFailCount, flag: true };
    }
    return { weight: current, reason: 'hold', failCount: newFailCount, flag: true };
  }

  return { weight: current, reason: 'partial' };
}

// Build the updated working weights map after a session is logged
export function updateWorkingWeights(existing, sessionExercises) {
  const updated = { ...existing };

  for (const ex of sessionExercises) {
    if (!ex.completedSets || ex.completedSets.length === 0) continue;
    const result = calculateNextWeight(ex, ex.completedSets);
    updated[ex.name] = result.weight;
  }

  return updated;
}

// Check if a set is a new PR for a given exercise
export function checkPR(exerciseName, weight, reps, existingPRs) {
  const currentPR = existingPRs[exerciseName];
  const newEstimated1RM = epley(weight, reps);

  if (!currentPR) {
    return { isPR: true, newEstimated1RM, prevEstimated1RM: null };
  }

  if (newEstimated1RM > currentPR.estimated1RM) {
    return { isPR: true, newEstimated1RM, prevEstimated1RM: currentPR.estimated1RM };
  }

  return { isPR: false };
}

// Build the updated PRs map after a session
export function updatePRs(existing, sessionExercises, date) {
  const updated = { ...existing };
  const newPRs = [];

  for (const ex of sessionExercises) {
    if (!ex.completedSets || ex.completedSets.length === 0) continue;

    for (const s of ex.completedSets) {
      if (!s.weight || !s.reps) continue;
      const check = checkPR(ex.name, s.weight, s.reps, updated);
      if (check.isPR) {
        updated[ex.name] = {
          weight: s.weight,
          reps: s.reps,
          estimated1RM: check.newEstimated1RM,
          date,
        };
        newPRs.push({ exerciseName: ex.name, ...updated[ex.name], prev: check.prevEstimated1RM });
      }
    }
  }

  return { updatedPRs: updated, newPRs };
}

// Check bodyweight trend and return recommendation
export function checkWeightGain(bodyweightLog) {
  if (!bodyweightLog || bodyweightLog.length < 2) return null;

  const sorted = [...bodyweightLog].sort((a, b) => new Date(a.date) - new Date(b.date));
  const recent = sorted.slice(-2);
  const weeklyGain = recent[1].weight - recent[0].weight;

  if (weeklyGain < 0.5) {
    return {
      status: 'under',
      weeklyGain,
      message: `Gained ${weeklyGain.toFixed(1)} lbs this week — below target. Add ~200 calories/day.`,
      calAdjust: +200,
    };
  }
  if (weeklyGain > 1.5) {
    return {
      status: 'over',
      weeklyGain,
      message: `Gained ${weeklyGain.toFixed(1)} lbs this week — above target. Cut ~200 calories/day.`,
      calAdjust: -200,
    };
  }
  return {
    status: 'on_track',
    weeklyGain,
    message: `On track — gained ${weeklyGain.toFixed(1)} lbs this week.`,
    calAdjust: 0,
  };
}
