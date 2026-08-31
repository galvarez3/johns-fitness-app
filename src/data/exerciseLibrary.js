// Compound movement pools — 4 exercises each ensures clean weekly rotation within a block
export const COMPOUND_POOLS = {
  horizontal_push: [
    { name: 'Bench Press', equipment: 'Barbell', restSeconds: 60, isPrimary: true },
    { name: 'Incline DB Press', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Low Angle DB Incline Press', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Close Grip Bench Press', equipment: 'Barbell', restSeconds: 60 },
  ],
  horizontal_pull: [
    { name: 'Bent Over BB Row', equipment: 'Barbell', restSeconds: 60 },
    { name: 'DB One Arm Row', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Reverse Grip BB Row', equipment: 'Barbell', restSeconds: 60 },
    { name: 'Cable Row', equipment: 'Cable', restSeconds: 60 },
  ],
  vertical_push: [
    { name: 'Standing OHP', equipment: 'Barbell', restSeconds: 60, isPrimary: true },
    { name: 'Seated DB Press', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Arnold Press', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Push Press', equipment: 'Barbell', restSeconds: 60 },
  ],
  vertical_pull: [
    { name: 'Lat Pulldown', equipment: 'Cable', restSeconds: 60 },
    { name: 'Band Assisted Chin Ups', equipment: 'Band', restSeconds: 60, isBodyweight: true },
    { name: 'Chin Ups', equipment: 'Bodyweight', restSeconds: 60, isBodyweight: true },
    { name: 'Pull Ups', equipment: 'Bodyweight', restSeconds: 60, isBodyweight: true },
  ],
  squat: [
    { name: 'Goblet Squat', equipment: 'Dumbbell', restSeconds: 60 },
    { name: 'DB Bulgarian Split Squat', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Back Squat', equipment: 'Barbell', restSeconds: 75, isPrimary: true },
    { name: 'Leg Press', equipment: 'Machine', restSeconds: 60 },
  ],
  hip_hinge: [
    { name: 'Romanian Deadlift', equipment: 'Barbell', restSeconds: 60 },
    { name: 'DB Deadlift', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Deadlift', equipment: 'Barbell', restSeconds: 75, isPrimary: true },
    { name: 'Sumo Deadlift', equipment: 'Barbell', restSeconds: 75 },
  ],
  carry: [
    { name: 'Farmers Walk', equipment: 'Dumbbells', restSeconds: 60, isCarry: true },
    { name: 'Suitcase Carry', equipment: 'Dumbbell', restSeconds: 60, isCarry: true },
    { name: 'Overhead Carry', equipment: 'Dumbbell', restSeconds: 60, isCarry: true },
  ],
};

export const ACCESSORY_POOLS = {
  core: [
    { name: 'Plank', equipment: 'Bodyweight', restSeconds: 45, isTimed: true, defaultSeconds: 30 },
    { name: 'Dead Bug', equipment: 'Bodyweight', restSeconds: 45 },
    { name: 'Bird Dog', equipment: 'Bodyweight', restSeconds: 45 },
    { name: 'Ab Wheel', equipment: 'Wheel', restSeconds: 45 },
    { name: 'Hollow Body Hold', equipment: 'Bodyweight', restSeconds: 45, isTimed: true, defaultSeconds: 20 },
    { name: 'Hanging Knee Raises', equipment: 'Bar', restSeconds: 45 },
  ],
};

// Comeback rep schemes — rebuilding from months off
// Intensity relative to stored 1RMs
export const SCHEMES = {
  foundation: { label: 'Foundation', repsMin: 12, repsMax: 15, sets: 3, intensity: 0.50, restSeconds: 60 },
  build:      { label: 'Build',      repsMin: 10, repsMax: 12, sets: 3, intensity: 0.60, restSeconds: 60 },
  progress:   { label: 'Progress',   repsMin: 8,  repsMax: 10, sets: 3, intensity: 0.65, restSeconds: 75 },
  peak:       { label: 'Peak',       repsMin: 8,  repsMax: 10, sets: 3, intensity: 0.70, restSeconds: 75 },
};

export const WEEK_SCHEMES = ['foundation', 'build', 'progress', 'peak'];

// 15-minute workout templates — 3 exercises, focused and efficient
export const WORKOUT_TEMPLATES = {
  'Strength A': {
    label: 'Strength A',
    focus: 'Push + Core',
    durationMinutes: 15,
    slots: [
      { pool: 'horizontal_push', role: 'main',      label: 'Horizontal Push' },
      { pool: 'vertical_push',   role: 'main',      label: 'Overhead Push' },
      { pool: 'core',            role: 'accessory', label: 'Core' },
    ],
  },
  'Strength B': {
    label: 'Strength B',
    focus: 'Pull + Hinge',
    durationMinutes: 15,
    slots: [
      { pool: 'horizontal_pull', role: 'main', label: 'Horizontal Pull' },
      { pool: 'hip_hinge',       role: 'main', label: 'Hip Hinge' },
      { pool: 'vertical_pull',   role: 'main', label: 'Vertical Pull' },
    ],
  },
  'Strength C': {
    label: 'Strength C',
    focus: 'Legs + Carry',
    durationMinutes: 15,
    slots: [
      { pool: 'squat',  role: 'main',      label: 'Squat Pattern' },
      { pool: 'carry',  role: 'main',      label: 'Carry' },
      { pool: 'core',   role: 'accessory', label: 'Core', slotOffset: 2 },
    ],
  },
};

// 5-day schedule: Mon/Wed/Fri strength, Tue/Thu Peloton
export const DAY_MAP = {
  1: 'Strength A',  // Monday
  2: 'Peloton',     // Tuesday
  3: 'Strength B',  // Wednesday
  4: 'Peloton',     // Thursday
  5: 'Strength C',  // Friday
};

// Main lifts tracked for 1RM and PR purposes
export const PRIMARY_LIFTS = ['Bench Press', 'Back Squat', 'Deadlift', 'Standing OHP'];

// Peloton ride suggestions by day
export const PELOTON_RIDES = {
  tuesday: [
    { type: 'Endurance Ride', duration: 20, description: '20 min at 60–70% max HR. Conversational pace — you should be able to talk.' },
    { type: 'Low Impact Ride', duration: 20, description: '20 min low impact. Great for active recovery while keeping legs moving.' },
    { type: 'Power Zone Ride', duration: 30, description: '30 min Power Zone endurance. Keep output in Zone 2 the whole time.' },
  ],
  thursday: [
    { type: 'HIIT Ride', duration: 20, description: '20 min HIIT. Short hard intervals (20s on / 40s off). Go hard when it\'s time.' },
    { type: 'Tabata Ride', duration: 20, description: '20 min Tabata format. 8 rounds of 20s max effort / 10s rest per block.' },
    { type: 'Climb Ride', duration: 25, description: '25 min climb. Heavy resistance, seated power. Great for leg strength carry-over.' },
  ],
};
