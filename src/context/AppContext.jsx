import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { generateBlock } from '../engine/workoutGenerator.js';
import { updateWorkingWeights, updatePRs, checkWeightGain } from '../engine/progressiveOverload.js';
import { appendWorkoutSession, appendBodyweight } from '../services/sheetsService.js';
import {
  sendSlackMessage,
  buildPRMessage,
  buildWeeklySummaryMessage,
  buildMissedSessionMessage,
  buildMilestoneMessage,
} from '../services/slackService.js';
import {
  STARTING_1RMS,
  STARTING_BODYWEIGHT,
  GOAL_BODYWEIGHT,
  STARTING_WORKING_WEIGHTS,
  BLOCK_START_DATE,
  STARTING_BLOCK,
  BW_MILESTONES,
} from '../data/startingData.js';

const STORAGE_KEY = 'johns_fitness_v1';

function buildInitialState() {
  return {
    settings: {
      slackWebhookUrl: '',
      sheetsId: '',
      sheetsToken: '',
      anthropicApiKey: '',
    },
    blockNum: STARTING_BLOCK,
    blockStartDate: BLOCK_START_DATE,
    block: null, // populated on init
    workingWeights: { ...STARTING_WORKING_WEIGHTS },
    oneRMs: { ...STARTING_1RMS },
    personalRecords: Object.fromEntries(
      Object.entries(STARTING_1RMS).map(([name, rm]) => [
        name,
        { weight: rm, reps: 1, estimated1RM: rm, date: BLOCK_START_DATE },
      ])
    ),
    bodyweightLog: [{ date: BLOCK_START_DATE, weight: STARTING_BODYWEIGHT }],
    goalWeight: GOAL_BODYWEIGHT,
    sessionLogs: [],
    streak: 0,
    notifications: [], // in-app toasts
    claudeBlockNotes: null,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function saveState(state) {
  try {
    // Don't persist transient UI state
    const { notifications, ...toSave } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) { /* ignore */ }
}

// --- Reducer ---
function reducer(state, action) {
  switch (action.type) {
    case 'INIT_BLOCK': {
      return { ...state, block: action.block };
    }

    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.settings } };
    }

    case 'LOG_SESSION': {
      const { session } = action;
      const { updatedPRs, newPRs } = updatePRs(state.personalRecords, session.exercises, session.date);
      const updatedWeights = updateWorkingWeights(state.workingWeights, session.exercises);

      // Rebuild block with fresh working weights
      const newBlock = generateBlock(state.blockNum, updatedWeights, state.oneRMs);
      newBlock.startDate = state.blockStartDate;

      // Carry over completed flags from old block
      if (state.block) {
        for (let wi = 0; wi < newBlock.weeks.length; wi++) {
          const oldWeek = state.block.weeks[wi];
          const newWeek = newBlock.weeks[wi];
          for (const day of ['monday', 'tuesday', 'thursday', 'friday']) {
            if (oldWeek?.workouts[day]?.completed) {
              newWeek.workouts[day].completed = true;
              newWeek.workouts[day].completedAt = oldWeek.workouts[day].completedAt;
            }
          }
        }
      }

      // Mark today's workout complete
      if (session.weekNum && session.dayKey && newBlock.weeks[session.weekNum - 1]) {
        const w = newBlock.weeks[session.weekNum - 1].workouts[session.dayKey];
        if (w) {
          w.completed = true;
          w.completedAt = session.date;
        }
      }

      // Update streak
      const streak = calculateStreak([...state.sessionLogs, session]);

      return {
        ...state,
        sessionLogs: [...state.sessionLogs, session],
        personalRecords: updatedPRs,
        workingWeights: updatedWeights,
        block: newBlock,
        streak,
        notifications: newPRs.length > 0
          ? [...state.notifications, { id: Date.now(), type: 'pr', prs: newPRs }]
          : state.notifications,
      };
    }

    case 'LOG_BODYWEIGHT': {
      const { entry } = action;
      const existing = state.bodyweightLog.filter(e => e.date !== entry.date);
      const log = [...existing, entry].sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, bodyweightLog: log };
    }

    case 'DISMISS_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
      };
    }

    case 'ADVANCE_BLOCK': {
      const newBlockNum = state.blockNum + 1;
      const newBlock = generateBlock(newBlockNum, state.workingWeights, state.oneRMs);
      const newStartDate = getNextMonday();
      newBlock.startDate = newStartDate;
      return {
        ...state,
        blockNum: newBlockNum,
        blockStartDate: newStartDate,
        block: newBlock,
      };
    }

    case 'SET_CLAUDE_NOTES': {
      return { ...state, claudeBlockNotes: action.notes };
    }

    default:
      return state;
  }
}

function calculateStreak(sessionLogs) {
  if (!sessionLogs.length) return 0;
  const completedWeeks = new Set(
    sessionLogs.map(s => `${s.blockNum}-${s.weekNum}`)
  );
  return completedWeeks.size;
}

function getNextMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// --- Context ---
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = loadState();
    const initial = buildInitialState();
    return saved ? { ...initial, ...saved, notifications: [] } : initial;
  });

  // Generate block on first load or when missing
  useEffect(() => {
    if (!state.block) {
      const block = generateBlock(state.blockNum, state.workingWeights, state.oneRMs);
      block.startDate = state.blockStartDate;
      dispatch({ type: 'INIT_BLOCK', block });
    }
  }, []); // eslint-disable-line

  // Persist to localStorage on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Check for missed sessions at 9pm (checked on page focus)
  const checkMissedSession = useCallback(() => {
    if (!state.settings.slackWebhookUrl) return;
    const now = new Date();
    const hour = now.getHours();
    if (hour < 21) return; // only after 9pm

    const today = now.toISOString().split('T')[0];
    const dayOfWeek = now.getDay();
    const dayTypes = { 1: 'Upper A', 2: 'Lower A', 4: 'Upper B', 5: 'Lower B' };
    const workoutType = dayTypes[dayOfWeek];
    if (!workoutType) return;

    const logged = state.sessionLogs.some(s => s.date === today);
    if (!logged) {
      sendSlackMessage(
        state.settings.slackWebhookUrl,
        buildMissedSessionMessage(workoutType, today)
      );
    }
  }, [state.settings.slackWebhookUrl, state.sessionLogs]);

  const actions = {
    updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', settings }),

    logSession: async (session) => {
      dispatch({ type: 'LOG_SESSION', session });

      // Side effects after dispatch
      const { newPRs } = updatePRs(state.personalRecords, session.exercises, session.date);

      if (newPRs.length > 0 && state.settings.slackWebhookUrl) {
        sendSlackMessage(state.settings.slackWebhookUrl, buildPRMessage(newPRs));
      }

      // Sheets sync
      if (state.settings.sheetsId && state.settings.sheetsToken) {
        appendWorkoutSession(state.settings.sheetsId, state.settings.sheetsToken, session);
      }

      // Friday weekly summary
      const day = new Date(session.date + 'T00:00:00').getDay();
      if (day === 5 && state.settings.slackWebhookUrl) {
        const summary = {
          weekNum: session.weekNum,
          blockNum: session.blockNum,
          liftsCompleted: state.sessionLogs.filter(
            s => s.blockNum === session.blockNum && s.weekNum === session.weekNum
          ).length + 1,
          bodyweight: state.bodyweightLog.at(-1)?.weight,
          prs: newPRs,
        };
        sendSlackMessage(state.settings.slackWebhookUrl, buildWeeklySummaryMessage(summary));
      }
    },

    logBodyweight: async (entry) => {
      dispatch({ type: 'LOG_BODYWEIGHT', entry });

      // Check milestones
      if (state.settings.slackWebhookUrl) {
        const already = state.bodyweightLog.map(e => e.weight);
        for (const milestone of BW_MILESTONES) {
          if (entry.weight >= milestone && !already.some(w => w >= milestone)) {
            sendSlackMessage(state.settings.slackWebhookUrl, buildMilestoneMessage(milestone));
          }
        }
      }

      // Sheets sync
      if (state.settings.sheetsId && state.settings.sheetsToken) {
        const trend = checkWeightGain(state.bodyweightLog);
        appendBodyweight(state.settings.sheetsId, state.settings.sheetsToken, {
          ...entry,
          weeklyGain: trend?.weeklyGain,
          status: trend?.status,
        });
      }
    },

    dismissNotification: (id) => dispatch({ type: 'DISMISS_NOTIFICATION', id }),

    advanceBlock: () => dispatch({ type: 'ADVANCE_BLOCK' }),

    setClaudeNotes: (notes) => dispatch({ type: 'SET_CLAUDE_NOTES', notes }),

    checkMissedSession,
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
