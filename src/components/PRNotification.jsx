import { Trophy, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function PRNotification() {
  const { state, actions } = useApp();
  const notification = state.notifications[0];

  if (!notification || notification.type !== 'pr') return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-bounce-in">
      <div className="bg-amber-500/20 border border-amber-500/50 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Trophy size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-amber-400 text-sm">New PR{notification.prs.length > 1 ? 's' : ''}!</div>
              {notification.prs.map(pr => (
                <div key={pr.exerciseName} className="text-white text-sm mt-0.5">
                  <span className="font-semibold">{pr.exerciseName}</span>
                  <span className="text-slate-300"> — est. 1RM: </span>
                  <span className="font-bold text-amber-300">{pr.estimated1RM} lbs</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => actions.dismissNotification(notification.id)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
