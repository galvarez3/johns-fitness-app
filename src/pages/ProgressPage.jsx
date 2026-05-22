import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Trophy, TrendingUp, Flame, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { epley } from '../engine/progressiveOverload.js';
import { PRIMARY_LIFTS } from '../data/exerciseLibrary.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#1e293b',
      borderWidth: 1,
      titleColor: '#94a3b8',
      bodyColor: '#f1f5f9',
    },
  },
  scales: {
    x: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { size: 10 } },
    },
    y: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { size: 10 } },
    },
  },
};

function buildLiftHistory(sessionLogs, exerciseName) {
  const points = [];
  for (const session of sessionLogs) {
    for (const ex of session.exercises) {
      if (ex.name !== exerciseName) continue;
      const bestSet = ex.completedSets.reduce((best, s) => {
        const rm = s.weight && s.reps ? epley(s.weight, s.reps) : 0;
        return rm > best ? rm : best;
      }, 0);
      if (bestSet > 0) {
        points.push({ date: session.date, estimated1RM: bestSet });
      }
    }
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export default function ProgressPage() {
  const { state } = useApp();
  const { sessionLogs, bodyweightLog, personalRecords, goalWeight, streak, blockNum } = state;

  const latestBW = bodyweightLog.at(-1)?.weight ?? 167;
  const goalPct = Math.min(100, Math.round(((latestBW - 167) / (goalWeight - 167)) * 100));
  const sessionsThisBlock = sessionLogs.filter(s => s.blockNum === blockNum).length;

  // Bodyweight chart
  const bwLabels = bodyweightLog.map(e => e.date.slice(5));
  const bwData = {
    labels: bwLabels,
    datasets: [
      {
        label: 'Bodyweight',
        data: bodyweightLog.map(e => e.weight),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#0ea5e9',
      },
      {
        label: 'Goal',
        data: bodyweightLog.map(() => goalWeight),
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="scroll-area pb-6">
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <div className="text-slate-400 text-sm mt-0.5">Block {blockNum} · {sessionsThisBlock} sessions logged</div>
      </div>

      {/* Summary stats */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={<Flame size={14} className="text-amber-400" />} label="Streak" value={`${streak}wk`} />
        <StatCard icon={<Calendar size={14} className="text-sky-400" />} label="Sessions" value={sessionsThisBlock} />
        <StatCard icon={<TrendingUp size={14} className="text-green-400" />} label="To Goal" value={`${(goalWeight - latestBW).toFixed(1)} lbs`} />
      </div>

      {/* Goal progress bar */}
      <div className="px-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-semibold">Bodyweight Goal</span>
            <span className="text-sky-400 font-bold">{latestBW} / {goalWeight} lbs</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">{goalPct}% of goal</div>
        </div>
      </div>

      {/* Bodyweight chart */}
      <div className="px-4 mb-6">
        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Bodyweight History</div>
        <div className="card p-4">
          <div className="h-44">
            {bodyweightLog.length > 1 ? (
              <Line data={bwData} options={CHART_OPTS} />
            ) : (
              <EmptyChart message="Log your Monday weigh-ins to see the trend" />
            )}
          </div>
        </div>
      </div>

      {/* Strength charts — one per primary lift */}
      <div className="px-4 mb-6">
        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Estimated 1RM History</div>
        <div className="space-y-4">
          {PRIMARY_LIFTS.map(lift => (
            <LiftChart key={lift} lift={lift} sessionLogs={sessionLogs} pr={personalRecords[lift]} />
          ))}
        </div>
      </div>

      {/* PR Board */}
      <div className="px-4">
        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Trophy size={12} className="text-amber-400" />
          Personal Records
        </div>
        <div className="card divide-y divide-slate-800">
          {PRIMARY_LIFTS.map(lift => {
            const pr = personalRecords[lift];
            return (
              <div key={lift} className="px-4 py-3 flex items-center justify-between">
                <span className="text-white font-medium">{lift}</span>
                <div className="text-right">
                  <div className="text-amber-400 font-bold">{pr?.estimated1RM ?? '—'} lbs</div>
                  <div className="text-slate-500 text-xs">est. 1RM · {pr?.date?.slice(5) ?? 'N/A'}</div>
                </div>
              </div>
            );
          })}
          {Object.entries(state.personalRecords)
            .filter(([name]) => !PRIMARY_LIFTS.includes(name))
            .map(([name, pr]) => (
              <div key={name} className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-300 text-sm">{name}</span>
                <div className="text-right">
                  <div className="text-slate-200 font-semibold">{pr.estimated1RM} lbs</div>
                  <div className="text-slate-500 text-xs">est. 1RM</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function LiftChart({ lift, sessionLogs, pr }) {
  const history = buildLiftHistory(sessionLogs, lift);

  // Prepend the starting PR as the first data point
  const allPoints = pr
    ? [{ date: pr.date, estimated1RM: pr.estimated1RM }, ...history].slice(0, 20)
    : history;

  const colors = {
    'Bench Press':   '#0ea5e9',
    'Back Squat':    '#22c55e',
    'Deadlift':      '#f59e0b',
    'Standing OHP':  '#a855f7',
  };
  const color = colors[lift] || '#0ea5e9';

  const data = {
    labels: allPoints.map(p => p.date.slice(5)),
    datasets: [{
      data: allPoints.map(p => p.estimated1RM),
      borderColor: color,
      backgroundColor: color + '22',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: color,
    }],
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold text-sm">{lift}</span>
        <span className="text-slate-400 text-sm">{pr?.estimated1RM ?? '—'} lbs est. 1RM</span>
      </div>
      <div className="h-32">
        {allPoints.length > 1 ? (
          <Line data={data} options={CHART_OPTS} />
        ) : (
          <EmptyChart message="Log sessions to see progress" />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1 text-slate-400 text-xs">{icon}{label}</div>
      <div className="text-white font-bold text-xl">{value}</div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-full flex items-center justify-center text-slate-600 text-xs text-center px-4">
      {message}
    </div>
  );
}
