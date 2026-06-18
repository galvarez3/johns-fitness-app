// John's starting data — pre-loaded at first install
// Block 2 begins May 19, 2026 (Week 5 of training)

export const STARTING_1RMS = {
  'Bench Press':   110,
  'Back Squat':    155,
  'Deadlift':      170,
  'Standing OHP':   65,
};

export const STARTING_BODYWEIGHT = 167;
export const GOAL_BODYWEIGHT = 175;

export const BLOCK_START_DATE = '2026-05-18'; // Monday (block weeks roll Mon-Sun)
export const STARTING_BLOCK = 2;
export const HEIGHT = "5'11\"";

// Estimated working weights for Block 2 Week 1 (hypertrophy — 72% 1RM, rounded to nearest 5)
export const STARTING_WORKING_WEIGHTS = {
  'Bench Press':             85,
  'Incline DB Press':        35,  // per dumbbell
  'Low Angle DB Incline Press': 35,
  'Close Grip Bench Press':  75,
  'Bent Over BB Row':        95,
  'DB One Arm Row':          50,  // per dumbbell
  'Reverse Grip BB Row':     90,
  'Cable Row':               70,
  'Standing OHP':            50,
  'Seated DB Press':         30,
  'Arnold Press':            25,
  'Push Press':              65,
  'Chin Ups':                0,   // bodyweight — track as +0 to start
  'Pull Ups':                0,
  'Lat Pulldown':            70,
  'Band Assisted Chin Ups':  0,   // band-assisted, weight is assist level
  'Back Squat':             115,
  'Goblet Squat':            50,
  'DB Bulgarian Split Squat': 25, // per dumbbell
  'Leg Press':              180,
  'Deadlift':               125,
  'Romanian Deadlift':      100,
  'Sumo Deadlift':          115,
  'DB Deadlift':             60,  // per dumbbell
  'Farmers Walk':            50,  // per hand, lbs
  'Suitcase Carry':          55,
  'Overhead Carry':          35,
  'BB Curl':                 55,
  'DB Zottman Curl':         20,
  'Hammer Curl':             25,
  'Concentration Curl':      20,
  'Reverse Grip Curl':       35,
  'Skullcrushers':           45,
  'Tricep Dips':              0,  // bodyweight
  'Tricep Pushdowns':        40,
  'Overhead Tricep Extension': 30,
  'Close Grip Bench Press':  75,
  'DB Lateral Raises':       15,
  'Rear Delt Flies':         15,
  'DB Shrugs':               50,
  'Face Pulls':              30,
  'Plank':                    0,  // timed — weight irrelevant
  'Dead Bug':                 0,
  'Bird Dog':                 0,
  'Ab Wheel':                 0,
  'Hollow Body Hold':         0,
  'Hanging Knee Raises':      0,
};

// Meal timing aligned with a regular office work day
export const MEAL_TIMING = [
  { time: '6:30 AM',  label: 'Meal 1 — Breakfast',    notes: 'Pre-workout if morning session. High protein, moderate carbs.' },
  { time: '9:30 AM',  label: 'Meal 2 — Mid-Morning',  notes: 'Greek yogurt, cottage cheese, or protein shake + fruit.' },
  { time: '12:00 PM', label: 'Meal 3 — Lunch',        notes: 'Largest meal of the day. Lean protein + rice/potato + veg.' },
  { time: '3:00 PM',  label: 'Meal 4 — Afternoon',    notes: 'Protein shake or hard-boiled eggs + crackers.' },
  { time: '5:30 PM',  label: 'Meal 5 — Pre-Workout',  notes: 'Light carbs + protein 60 min before gym. Banana + protein bar.' },
  { time: '7:30 PM',  label: 'Meal 6 — Post-Workout', notes: 'Priority meal. 50g protein minimum + fast carbs within 30 min.' },
  { time: '9:00 PM',  label: 'Meal 7 — Evening',      notes: 'Casein protein or cottage cheese before bed.' },
  { time: '10:00 PM', label: 'Meal 8 — Optional',     notes: 'Only if behind on calories/protein. Light snack.' },
];

export const DAILY_TARGETS = {
  caloriesMin: 2800,
  caloriesMax: 3000,
  proteinMin: 170,
  meals: { min: 6, max: 8 },
};

// Bodyweight milestones that trigger Slack notifications
export const BW_MILESTONES = [170, 172.5, 175];
