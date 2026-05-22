import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import PRNotification from './components/PRNotification.jsx';
import TodayPage from './pages/TodayPage.jsx';
import ActiveWorkout from './pages/ActiveWorkout.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import NutritionPage from './pages/NutritionPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <>
      <PRNotification />
      <Routes>
        {/* Full-screen workout session — no bottom nav */}
        <Route path="/workout" element={<ActiveWorkout />} />

        {/* Shell with bottom nav */}
        <Route path="/*" element={<ShellLayout />} />
      </Routes>
    </>
  );
}

function ShellLayout() {
  return (
    <div className="flex flex-col h-full safe-top">
      <div className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route path="/"          element={<TodayPage />} />
          <Route path="/progress"  element={<ProgressPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
