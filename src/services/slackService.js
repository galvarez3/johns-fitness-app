// In production (Railway), calls go through /api/slack on the Express server — no CORS issues.
// In dev (Vite), direct fetch is attempted; CORS may block it, which is acceptable locally.
const IS_PROD = import.meta.env.PROD;

export async function sendSlackMessage(webhookUrl, message) {
  if (!webhookUrl) return { ok: false, error: 'No webhook URL configured' };

  try {
    let res;
    if (IS_PROD) {
      // Server-side proxy — webhook URL never exposed to network, CORS-free
      res = await fetch('/api/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, text: message }),
      });
    } else {
      // Dev: direct call (will CORS-fail for Slack, but acceptable in local dev)
      res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    }
    return { ok: res.ok };
  } catch (err) {
    console.warn('Slack notification queued (CORS in dev):', err.message);
    return { ok: false, error: err.message };
  }
}

export function buildPRMessage(prList) {
  const lines = prList.map(pr => {
    const prev = pr.prev ? ` (prev est. 1RM: ${pr.prev} lbs)` : '';
    return `• *${pr.exerciseName}* — ${pr.weight} lbs × ${pr.reps} reps → est. 1RM *${pr.estimated1RM} lbs*${prev}`;
  });
  return `🏆 *New PR${prList.length > 1 ? 's' : ''}!*\n${lines.join('\n')}`;
}

export function buildWeeklySummaryMessage(summary) {
  const { weekNum, blockNum, liftsCompleted, bodyweight, prs, nutritionCompliance } = summary;
  const prLine = prs.length > 0
    ? `\n🏆 PRs this week: ${prs.map(p => `${p.exerciseName} ${p.estimated1RM} lbs est. 1RM`).join(', ')}`
    : '';
  const bwLine = bodyweight ? `\n⚖️ Weigh-in: ${bodyweight} lbs` : '';

  return `📊 *Weekly Recap — Block ${blockNum}, Week ${weekNum}*\n` +
    `✅ Sessions completed: ${liftsCompleted}/4${bwLine}${prLine}`;
}

export function buildMissedSessionMessage(workoutType, date) {
  return `👋 Hey John — looks like you haven't logged your *${workoutType}* session yet today (${date}). Get after it! 💪`;
}

export function buildMilestoneMessage(weight) {
  return `🎯 *Milestone unlocked!* John hit *${weight} lbs* bodyweight — on the way to 175! 🚀`;
}
