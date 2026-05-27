import { NavLink } from 'react-router-dom';
import { Dumbbell, TrendingUp, Utensils, Settings } from 'lucide-react';

const tabs = [
  { to: '/',          label: 'Today',    Icon: Dumbbell    },
  { to: '/progress',  label: 'Progress', Icon: TrendingUp  },
  { to: '/nutrition', label: 'Nutrition',Icon: Utensils    },
  { to: '/settings',  label: 'Settings', Icon: Settings    },
];

export default function BottomNav() {
  return (
    <nav className="px-4 pt-2 pb-4 safe-bottom bg-transparent">
      <div className="flex items-center justify-between gap-1 bg-slate-900/80 backdrop-blur-xl border border-white/[0.06] rounded-[26px] px-2 py-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9)]">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2 rounded-[20px] text-[11px] font-semibold transition-all duration-200 select-none ${
                isActive
                  ? 'bg-sky-400 text-slate-950 shadow-glow'
                  : 'text-slate-500 hover:text-slate-300 active:scale-95'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
