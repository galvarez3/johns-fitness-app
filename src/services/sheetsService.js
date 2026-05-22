// Google Sheets integration via Sheets API v4
// Requires a spreadsheet with two sheets: "Workouts" and "Bodyweight"
// Auth: uses a personal OAuth token stored in settings (configure via Settings page)

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

const WORKOUT_HEADERS = ['Date', 'Block', 'Week', 'Day', 'Exercise', 'Sets', 'Reps', 'Weight (lbs)', 'Est. 1RM', 'Form OK', 'Notes'];
const BW_HEADERS = ['Date', 'Bodyweight (lbs)', 'Weekly Gain', 'Status'];

export async function appendWorkoutSession(sheetsId, token, session) {
  if (!sheetsId || !token) return { ok: false, error: 'Sheets not configured' };

  const rows = [];
  for (const ex of session.exercises) {
    if (!ex.completedSets || ex.completedSets.length === 0) continue;
    const setsStr = ex.completedSets.length.toString();
    const repsStr = ex.completedSets.map(s => s.reps).join('/');
    const weightStr = ex.completedSets.map(s => s.weight || 'BW').join('/');
    const formStr = ex.completedSets.every(s => s.formGood !== false) ? 'Yes' : 'No';
    const bestSet = ex.completedSets.reduce((best, s) => {
      const rm = s.weight && s.reps ? Math.round(s.weight * (1 + s.reps / 30)) : 0;
      return rm > best ? rm : best;
    }, 0);

    rows.push([
      session.date,
      session.blockNum,
      session.weekNum,
      session.workoutType,
      ex.name,
      setsStr,
      repsStr,
      weightStr,
      bestSet || '',
      formStr,
      ex.notes || '',
    ]);
  }

  return appendRows(sheetsId, token, 'Workouts', rows);
}

export async function appendBodyweight(sheetsId, token, entry) {
  if (!sheetsId || !token) return { ok: false, error: 'Sheets not configured' };
  const row = [entry.date, entry.weight, entry.weeklyGain ?? '', entry.status ?? ''];
  return appendRows(sheetsId, token, 'Bodyweight', [row]);
}

async function appendRows(sheetsId, token, sheetName, rows) {
  try {
    const url = `${SHEETS_BASE}/${sheetsId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    });
    if (!res.ok) {
      const err = await res.json();
      return { ok: false, error: err.error?.message || 'Sheets API error' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function ensureSheetHeaders(sheetsId, token) {
  if (!sheetsId || !token) return;
  // Only writes headers if row 1 is empty — safe to call on every launch
  await setRowIfEmpty(sheetsId, token, 'Workouts', WORKOUT_HEADERS);
  await setRowIfEmpty(sheetsId, token, 'Bodyweight', BW_HEADERS);
}

async function setRowIfEmpty(sheetsId, token, sheetName, headers) {
  try {
    const getUrl = `${SHEETS_BASE}/${sheetsId}/values/${encodeURIComponent(sheetName + '!A1:Z1')}`;
    const res = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.values || data.values.length === 0) {
      const putUrl = `${SHEETS_BASE}/${sheetsId}/values/${encodeURIComponent(sheetName + '!A1')}?valueInputOption=USER_ENTERED`;
      await fetch(putUrl, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [headers] }),
      });
    }
  } catch (e) {
    // Non-fatal
  }
}
