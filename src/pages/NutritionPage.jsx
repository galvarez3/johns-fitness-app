import { useState } from 'react';
import { format, isMonday } from 'date-fns';
import { Scale, Utensils, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { checkWeightGain } from '../engine/progressiveOverload.js';
import { MEAL_TIMING, DAILY_TARGETS } from '../data/startingData.js';

export default function NutritionPage() {
  const { state, actions } = useApp();
  const { bodyweightLog, goalWeight } = state;
  const [bwInput, setBwInput] = useState('');
  const [bwSaved, setBwSaved] = useState(false);
  const [showAllMeals, setShowAllMeals] = useState(false);

  const latestBW = bodyweightLog.at(-1)?.weight ?? 167;
  const trend = checkWeightGain(bodyweightLog);
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLogged = bodyweightLog.some(e => e.date === todayDate);
  const isMondayToday = isMonday(new Date());

  const handleLogBW = () => {
    const w = parseFloat(bwInput);
    if (!w || w < 100 || w > 400) return;
    actions.logBodyweight({ date: todayDate, weight: w });
    setBwInput('');
    setBwSaved(true);
    setTimeout(() => setBwSaved(false), 3000);
  };

  const displayMeals = showAllMeals ? MEAL_TIMING : MEAL_TIMING.slice(0, 6);

  return (
    <div className="scroll-area pb-6">
      <div className="px-4 pt-6 pb-4">
        <h1 className="display text-5xl text-white">Nutrition</h1>
        <div className="text-slate-400 text-sm mt-1.5">Daily targets & meal timing</div>
      </div>

      {/* Daily targets */}
      <div className="px-4 mb-5">
        <div className="card p-4">
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Daily Targets</div>
          <div className="grid grid-cols-3 gap-4">
            <TargetCard
              label="Calories"
              value={`${DAILY_TARGETS.caloriesMin}–${DAILY_TARGETS.caloriesMax}`}
              unit="kcal"
              color="text-amber-400"
            />
            <TargetCard
              label="Protein"
              value={`${DAILY_TARGETS.proteinMin}g+`}
              unit="per day"
              color="text-sky-400"
            />
            <TargetCard
              label="Meals"
              value={`${DAILY_TARGETS.meals.min}–${DAILY_TARGETS.meals.max}`}
              unit="per day"
              color="text-green-400"
            />
          </div>
        </div>
      </div>

      {/* Weight trend alert */}
      {trend && trend.status !== 'on_track' && (
        <div className="px-4 mb-5">
          <div className={`rounded-2xl p-4 flex items-start gap-3 border ${
            trend.status === 'under'
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <AlertTriangle size={18} className={trend.status === 'under' ? 'text-amber-400 mt-0.5' : 'text-red-400 mt-0.5'} />
            <div>
              <div className={`font-semibold text-sm ${trend.status === 'under' ? 'text-amber-400' : 'text-red-400'}`}>
                {trend.status === 'under' ? 'Under-gaining' : 'Over-gaining'}
              </div>
              <div className="text-slate-300 text-sm mt-0.5">{trend.message}</div>
            </div>
          </div>
        </div>
      )}

      {trend?.status === 'on_track' && (
        <div className="px-4 mb-5">
          <div className="rounded-2xl p-4 flex items-center gap-3 bg-green-500/10 border border-green-500/30">
            <CheckCircle size={18} className="text-green-400" />
            <div className="text-green-300 text-sm font-medium">{trend.message}</div>
          </div>
        </div>
      )}

      {/* Weekly weigh-in */}
      <div className="px-4 mb-5">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale size={16} className="text-sky-400" />
            <span className="text-white font-semibold text-sm">Monday Weigh-In</span>
            {!isMondayToday && (
              <span className="text-xs text-slate-500 ml-auto">Log on Mondays</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="text-3xl font-bold text-white">{latestBW}</div>
            <div className="text-slate-400">lbs</div>
            <div className="ml-auto text-slate-500 text-sm">goal: {goalWeight} lbs</div>
          </div>

          {/* Bodyweight log history */}
          <div className="space-y-1.5 mb-4 max-h-36 overflow-y-auto">
            {[...bodyweightLog].reverse().map(e => (
              <div key={e.date} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{e.date.slice(5)}</span>
                <span className="text-white font-medium">{e.weight} lbs</span>
              </div>
            ))}
          </div>

          {bwSaved ? (
            <div className="flex items-center justify-center gap-2 text-green-400 font-medium py-2">
              <CheckCircle size={16} /> Saved!
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                className="input-field flex-1 text-center"
                placeholder="Today's weight"
                value={bwInput}
                onChange={e => setBwInput(e.target.value)}
                inputMode="decimal"
              />
              <button onClick={handleLogBW} className="btn-primary px-5 flex-shrink-0">
                Log
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meal timing */}
      <div className="px-4">
        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Utensils size={12} />
          Meal Timing
        </div>
        <div className="card divide-y divide-slate-800/50">
          {displayMeals.map((meal, i) => (
            <MealRow key={i} meal={meal} />
          ))}
        </div>
        <button
          onClick={() => setShowAllMeals(p => !p)}
          className="w-full flex items-center justify-center gap-1 text-sky-400 text-sm font-medium py-3"
        >
          {showAllMeals ? (<><ChevronUp size={14} /> Show less</>) : (<><ChevronDown size={14} /> Show meals 7 & 8</>)}
        </button>
      </div>

      {/* Protein targets by meal */}
      <div className="px-4 mt-2">
        <div className="card p-4">
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Protein Strategy</div>
          <div className="space-y-2">
            <ProteinRow label="Each main meal (3×)" target="35–40g" note="chicken, beef, eggs" />
            <ProteinRow label="Protein shakes (2×)" target="25–30g" note="whey or casein" />
            <ProteinRow label="Snacks (2×)" target="15–20g" note="Greek yogurt, cottage cheese" />
            <div className="border-t border-slate-800 pt-2 flex justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-sky-400 font-bold">170–180g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TargetCard({ label, value, unit, color }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-slate-400 text-xs">{unit}</div>
      <div className="text-slate-500 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function MealRow({ meal }) {
  const now = new Date();
  const [mealHour, mealMin] = meal.time.replace(' AM', '').replace(' PM', '').split(':').map(Number);
  const isPM = meal.time.includes('PM') && mealHour !== 12;
  const mealH = isPM ? mealHour + 12 : mealHour;
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const isCurrent = currentH === mealH || (currentH === mealH - 1 && currentM >= 30);

  return (
    <div className={`px-4 py-3 ${isCurrent ? 'bg-sky-500/5' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`text-xs font-mono font-semibold w-16 flex-shrink-0 ${isCurrent ? 'text-sky-400' : 'text-slate-500'}`}>
            {meal.time}
          </div>
          <div>
            <div className={`text-sm font-medium ${isCurrent ? 'text-sky-300' : 'text-white'}`}>{meal.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{meal.notes}</div>
          </div>
        </div>
        {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />}
      </div>
    </div>
  );
}

function ProteinRow({ label, target, note }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white text-sm">{label}</div>
        <div className="text-slate-500 text-xs">{note}</div>
      </div>
      <div className="text-sky-400 font-semibold text-sm">{target}</div>
    </div>
  );
}
