// John's starting data — comeback program after several months off
// Block 3 begins fresh with lighter weights and 15-min focused sessions

export const STARTING_1RMS = {
  'Bench Press':   110,
  'Back Squat':    155,
  'Deadlift':      170,
  'Standing OHP':   65,
};

export const STARTING_BODYWEIGHT = 167;
export const GOAL_BODYWEIGHT = 175;

// Comeback start date — update this to the Monday John is starting
export const BLOCK_START_DATE = '2026-09-01';
export const STARTING_BLOCK = 3;
export const HEIGHT = "5'11\"";

// Comeback working weights — ~50% of 1RM, rounded to nearest 5
// These are intentionally light. Form first, weight follows.
export const STARTING_WORKING_WEIGHTS = {
  // Strength A — Push + Core
  'Bench Press':                55,
  'Incline DB Press':           20,  // per dumbbell
  'Low Angle DB Incline Press': 20,
  'Close Grip Bench Press':     45,
  'Standing OHP':               30,
  'Seated DB Press':            15,
  'Arnold Press':               12,
  'Push Press':                 35,

  // Strength B — Pull + Hinge
  'Bent Over BB Row':           55,
  'DB One Arm Row':             25,  // per dumbbell
  'Reverse Grip BB Row':        50,
  'Cable Row':                  45,
  'Lat Pulldown':               50,
  'Band Assisted Chin Ups':      0,
  'Chin Ups':                    0,  // bodyweight — track as +0 to start
  'Pull Ups':                    0,
  'Romanian Deadlift':          65,
  'DB Deadlift':                35,  // per dumbbell
  'Deadlift':                   85,
  'Sumo Deadlift':              75,

  // Strength C — Legs + Carry
  'Goblet Squat':               25,
  'DB Bulgarian Split Squat':   15,  // per dumbbell
  'Back Squat':                 75,
  'Leg Press':                 115,
  'Farmers Walk':               30,  // per hand
  'Suitcase Carry':             35,
  'Overhead Carry':             20,

  // Core (no weight needed)
  'Plank':                       0,
  'Dead Bug':                    0,
  'Bird Dog':                    0,
  'Ab Wheel':                    0,
  'Hollow Body Hold':            0,
  'Hanging Knee Raises':         0,
};

// Meal timing aligned with a regular office work day
export const MEAL_TIMING = [
  { time: '6:30 AM',  label: 'Meal 1 — Breakfast',    notes: 'High protein to start the day. Eggs, Greek yogurt, or protein shake.' },
  { time: '9:30 AM',  label: 'Meal 2 — Mid-Morning',  notes: 'Cottage cheese, hard-boiled eggs, or protein bar.' },
  { time: '12:00 PM', label: 'Meal 3 — Lunch',        notes: 'Lean protein + rice or potato + vegetables. Biggest meal.' },
  { time: '3:00 PM',  label: 'Meal 4 — Afternoon',    notes: 'Protein shake or Greek yogurt + fruit.' },
  { time: '5:30 PM',  label: 'Meal 5 — Pre-Workout',  notes: 'Light carbs + protein 60 min before training. Banana + protein.' },
  { time: '7:30 PM',  label: 'Meal 6 — Post-Workout', notes: 'Priority meal — 40-50g protein + fast carbs within 30 min.' },
  { time: '9:00 PM',  label: 'Meal 7 — Evening',      notes: 'Casein or cottage cheese before bed. Slow digesting protein.' },
  { time: '10:00 PM', label: 'Meal 8 — Optional',     notes: 'Only if behind on calories. Keep it light.' },
];

export const DAILY_TARGETS = {
  caloriesMin: 2800,
  caloriesMax: 3000,
  proteinMin: 170,
  meals: { min: 6, max: 8 },
};

// Bodyweight milestones that trigger Slack notifications
export const BW_MILESTONES = [170, 172.5, 175];
