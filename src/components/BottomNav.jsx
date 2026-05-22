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
    <nav className="bg-slate-900 border-t border-slate-800 safe-bottom">
      <div className="flex">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors duration-150 ${
                isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
