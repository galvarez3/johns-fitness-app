import { useState } from 'react';
import { CheckCircle, Bike, Flame, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { PELOTON_RIDES } from '../data/exerciseLibrary.js';

export default function PelotonPage({ weekNum, dayKey }) {
  const { state, actions } = useApp();
  const [selectedRide, setSelectedRide] = useState(null);
  const [logged, setLogged] = useState(false);

  const rides = PELOTON_RIDES[dayKey] || PELOTON_RIDES.tuesday;
  const todayDate = new Date().toISOString().split('T')[0];
  const alreadyLogged = state.sessionLogs.some(
    s => s.date === todayDate && s.workoutType === 'Peloton'
  );

  const handleLog = async () => {
    const ride = selectedRide ?? rides[0];
    await actions.logSession({
      id: `session_${Date.now()}`,
      date: todayDate,
      blockNum: state.blockNum,
      weekNum,
      workoutType: 'Peloton',
      dayKey,
      rideType: ride.type,
      rideDuration: ride.duration,
      exercises: [],
      durationMinutes: ride.duration,
    });
    setLogged(true);
  };

  if (logged || alreadyLogged) {
    return (
      <div className="scroll-area flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-5">
          <CheckCircle size={40} className="text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Ride Logged</h2>
        <p className="text-slate-400 mt-2">Nice work. Rest up and come back strong tomorrow.</p>
      </div>
    );
  }

  return (
    <div className="scroll-area pb-6">
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <Bike size={20} className="text-orange-400" />
          <span className="text-slate-400 text-sm font-medium">Peloton Day</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Choose Your Ride</h1>
        <div className="text-slate-400 text-sm mt-0.5">Block {state.blockNum} · Week {weekNum}</div>
      </div>

      {/* Ride cards */}
      <div className="px-4 space-y-3 mb-6">
        {rides.map((ride, i) => (
          <button
            key={i}
            onClick={() => setSelectedRide(ride)}
            className={`w-full card p-4 text-left transition-all ${
              selectedRide === ride
                ? 'border-orange-500/60 bg-orange-500/5'
                : 'hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-white font-semibold">{ride.type}</span>
              <div className="flex items-center gap-1 text-slate-400 text-sm">
                <Clock size={13} />
                {ride.duration} min
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{ride.description}</p>
          </button>
        ))}
      </div>

      {/* Log button */}
      <div className="px-4">
        <button
          onClick={handleLog}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-colors"
          style={{ background: selectedRide ? '#f97316' : '#7c2d12', color: 'white' }}
        >
          <Flame size={20} />
          {selectedRide ? `Log ${selectedRide.type}` : 'Log Any Ride'}
        </button>
        <p className="text-center text-slate-500 text-xs mt-2">
          Tap a ride above to select it, or tap here to log any ride done.
        </p>
      </div>

      {/* Peloton tips */}
      <div className="px-4 mt-6">
        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Coming Back Tips</div>
        <div className="card p-4 space-y-3">
          <Tip icon="🎯" text="Start at 50-60% output — this week is about re-building the aerobic base, not crushing it." />
          <Tip icon="💧" text="Have 20oz water before you clip in. Hydration is key coming off a break." />
          <Tip icon="🦵" text="Stretch your hip flexors and quads after every ride — they'll be tight early on." />
          <Tip icon="📈" text="Output will climb fast the first 2-3 weeks as your body remembers. Let it happen naturally." />
        </div>
      </div>
    </div>
  );
}

function Tip({ icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
