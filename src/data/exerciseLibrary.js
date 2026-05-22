// Compound movement pools — 4 exercises each ensures clean weekly rotation within a block
export const COMPOUND_POOLS = {
  horizontal_push: [
    { name: 'Bench Press', equipment: 'Barbell', restSeconds: 120, isPrimary: true },
    { name: 'Incline DB Press', equipment: 'Dumbbells', restSeconds: 90 },
    { name: 'Low Angle DB Incline Press', equipment: 'Dumbbells', restSeconds: 90 },
    { name: 'Close Grip Bench Press', equipment: 'Barbell', restSeconds: 120 },
  ],
  horizontal_pull: [
    { name: 'Bent Over BB Row', equipment: 'Barbell', restSeconds: 120 },
    { name: 'DB One Arm Row', equipment: 'Dumbbells', restSeconds: 90 },
    { name: 'Reverse Grip BB Row', equipment: 'Barbell', restSeconds: 120 },
    { name: 'Cable Row', equipment: 'Cable', restSeconds: 90 },
  ],
  vertical_push: [
    { name: 'Standing OHP', equipment: 'Barbell', restSeconds: 120, isPrimary: true },
    { name: 'Seated DB Press', equipment: 'Dumbbells', restSeconds: 90 },
    { name: 'Arnold Press', equipment: 'Dumbbells', restSeconds: 90 },
    { name: 'Push Press', equipment: 'Barbell', restSeconds: 120 },
  ],
  vertical_pull: [
    { name: 'Chin Ups', equipment: 'Bodyweight', restSeconds: 120, isBodyweight: true },
    { name: 'Pull Ups', equipment: 'Bodyweight', restSeconds: 120, isBodyweight: true },
    { name: 'Lat Pulldown', equipment: 'Cable', restSeconds: 90 },
    { name: 'Band Assisted Chin Ups', equipment: 'Band', restSeconds: 90, isBodyweight: true },
  ],
  squat: [
    { name: 'Back Squat', equipment: 'Barbell', restSeconds: 150, isPrimary: true },
    { name: 'Goblet Squat', equipment: 'Dumbbell', restSeconds: 90 },
    { name: 'DB Bulgarian Split Squat', equipment: 'Dumbbells', restSeconds: 90 },
    { name: 'Leg Press', equipment: 'Machine', restSeconds: 120 },
  ],
  hip_hinge: [
    { name: 'Deadlift', equipment: 'Barbell', restSeconds: 150, isPrimary: true },
    { name: 'Romanian Deadlift', equipment: 'Barbell', restSeconds: 120 },
    { name: 'Sumo Deadlift', equipment: 'Barbell', restSeconds: 150 },
    { name: 'DB Deadlift', equipment: 'Dumbbells', restSeconds: 90 },
  ],
  carry: [
    { name: 'Farmers Walk', equipment: 'Dumbbells', restSeconds: 90, isCarry: true },
    { name: 'Suitcase Carry', equipment: 'Dumbbell', restSeconds: 90, isCarry: true },
    { name: 'Overhead Carry', equipment: 'Dumbbell', restSeconds: 90, isCarry: true },
  ],
};

export const ACCESSORY_POOLS = {
  bicep: [
    { name: 'BB Curl', equipment: 'Barbell', restSeconds: 60 },
    { name: 'DB Zottman Curl', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Hammer Curl', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Concentration Curl', equipment: 'Dumbbell', restSeconds: 60 },
    { name: 'Reverse Grip Curl', equipment: 'Barbell', restSeconds: 60 },
  ],
  tricep: [
    { name: 'Skullcrushers', equipment: 'Barbell', restSeconds: 60 },
    { name: 'Tricep Dips', equipment: 'Bodyweight', restSeconds: 60, isBodyweight: true },
    { name: 'Tricep Pushdowns', equipment: 'Cable', restSeconds: 60 },
    { name: 'Overhead Tricep Extension', equipment: 'Dumbbell', restSeconds: 60 },
    { name: 'Close Grip Bench Press', equipment: 'Barbell', restSeconds: 90 },
  ],
  shoulder: [
    { name: 'DB Lateral Raises', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Rear Delt Flies', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'DB Shrugs', equipment: 'Dumbbells', restSeconds: 60 },
    { name: 'Face Pulls', equipment: 'Cable', restSeconds: 60 },
  ],
  core: [
    { name: 'Plank', equipment: 'Bodyweight', restSeconds: 60, isTimed: true, defaultSeconds: 45 },
    { name: 'Dead Bug', equipment: 'Bodyweight', restSeconds: 60 },
    { name: 'Bird Dog', equipment: 'Bodyweight', restSeconds: 60 },
    { name: 'Ab Wheel', equipment: 'Wheel', restSeconds: 60 },
    { name: 'Hollow Body Hold', equipment: 'Bodyweight', restSeconds: 60, isTimed: true, defaultSeconds: 30 },
    { name: 'Hanging Knee Raises', equipment: 'Bar', restSeconds: 60 },
  ],
};

// Rep schemes by week
export const SCHEMES = {
  hypertrophy:      { label: 'Hypertrophy',   repsMin: 8,  repsMax: 12, sets: 4, intensity: 0.72, restSeconds: 90  },
  strength:         { label: 'Strength',       repsMin: 3,  repsMax: 5,  sets: 5, intensity: 0.83, restSeconds: 150 },
  volume:           { label: 'Volume',         repsMin: 15, repsMax: 20, sets: 3, intensity: 0.62, restSeconds: 60  },
  hypertrophy_plus: { label: 'Hypertrophy+',   repsMin: 8,  repsMax: 10, sets: 4, intensity: 0.75, restSeconds: 90  },
};

export const WEEK_SCHEMES = ['hypertrophy', 'strength', 'volume', 'hypertrophy_plus'];

// Workout day templates — each slot specifies pool and role
export const WORKOUT_TEMPLATES = {
  'Upper A': {
    label: 'Upper A',
    focus: 'Push + Pull',
    slots: [
      { pool: 'horizontal_push', role: 'main',       label: 'Horizontal Push' },
      { pool: 'horizontal_pull', role: 'main',        label: 'Horizontal Pull' },
      { pool: 'tricep',          role: 'accessory',   label: 'Triceps' },
      { pool: 'bicep',           role: 'accessory',   label: 'Biceps' },
      { pool: 'shoulder',        role: 'accessory',   label: 'Shoulders' },
    ],
  },
  'Upper B': {
    label: 'Upper B',
    focus: 'Press + Pull',
    slots: [
      { pool: 'vertical_push',   role: 'main',        label: 'Vertical Push' },
      { pool: 'vertical_pull',   role: 'main',        label: 'Vertical Pull' },
      { pool: 'carry',           role: 'main',        label: 'Carry' },
      { pool: 'bicep',           role: 'accessory',   label: 'Biceps', slotOffset: 2 },
      { pool: 'tricep',          role: 'accessory',   label: 'Triceps', slotOffset: 3 },
    ],
  },
  'Lower A': {
    label: 'Lower A',
    focus: 'Squat + Hinge',
    slots: [
      { pool: 'squat',           role: 'main',        label: 'Squat Pattern' },
      { pool: 'hip_hinge',       role: 'secondary',   label: 'Hip Hinge' },
      { pool: 'core',            role: 'accessory',   label: 'Core A' },
      { pool: 'core',            role: 'accessory',   label: 'Core B', slotOffset: 3 },
    ],
  },
  'Lower B': {
    label: 'Lower B',
    focus: 'Hinge + Carry',
    slots: [
      { pool: 'hip_hinge',       role: 'main',        label: 'Hip Hinge' },
      { pool: 'squat',           role: 'secondary',   label: 'Squat Pattern' },
      { pool: 'carry',           role: 'main',        label: 'Carry', slotOffset: 1 },
      { pool: 'core',            role: 'accessory',   label: 'Core', slotOffset: 2 },
    ],
  },
};

// Maps training day to workout type
export const DAY_MAP = {
  1: 'Upper A',   // Monday
  2: 'Lower A',   // Tuesday
  3: null,        // Wednesday — active recovery
  4: 'Upper B',   // Thursday
  5: 'Lower B',   // Friday
};

// Main lifts tracked for 1RM and PR purposes
export const PRIMARY_LIFTS = ['Bench Press', 'Back Squat', 'Deadlift', 'Standing OHP'];
