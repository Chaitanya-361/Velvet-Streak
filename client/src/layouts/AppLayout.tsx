import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart3, CheckSquare, User, Settings, Menu, X, Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FAB from '../components/FAB';

const LEVEL_TITLES = [
  'Hatchling', 'Fledgling', 'Feathered', 'Preening', 'Strutter',
  'Plume Bearer', 'Iridescent', 'Crowned', 'Resplendent', 'Grand Peacock',
];
const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/todos', icon: CheckSquare, label: 'To-Do' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const xpCurrent = (user?.xp || 0) - (LEVEL_THRESHOLDS[(user?.level || 1) - 1] || 0);
  const xpNeeded = (LEVEL_THRESHOLDS[user?.level || 1] || 35000) - (LEVEL_THRESHOLDS[(user?.level || 1) - 1] || 0);
  const xpPercent = xpNeeded > 0 ? Math.min(100, (xpCurrent / xpNeeded) * 100) : 0;
  const showFAB = !location.pathname.startsWith('/habits/');
  const levelTitle = LEVEL_TITLES[(user?.level || 1) - 1] || 'Hatchling';

  return (
    <div className="flex h-screen overflow-hidden bg-vs-deep">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-vs-border bg-vs-surface/50">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-vs-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vs-teal to-vs-feather flex items-center justify-center">
            <Feather className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg text-vs-text leading-tight">Velvet Streak</h1>
            <p className="text-xs text-vs-muted">Keep track of your streaks</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-vs-teal/20 text-vs-feather shadow-sm' : 'text-vs-muted hover:bg-vs-surface-hover hover:text-vs-text'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </NavLink>
          ))}
          <NavLink to="/settings"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-vs-teal/20 text-vs-feather shadow-sm' : 'text-vs-muted hover:bg-vs-surface-hover hover:text-vs-text'}`}>
            <Settings className="w-5 h-5" />Settings
          </NavLink>
        </nav>
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-vs-surface p-4 border border-vs-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vs-gold to-vs-feather flex items-center justify-center text-lg">🦚</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-vs-text truncate">{user?.displayName || 'User'}</p>
                <p className="text-xs text-vs-muted">Lv. {user?.level || 1} · {levelTitle}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-vs-muted"><span>{xpCurrent} XP</span><span>{xpNeeded} XP</span></div>
              <div className="h-2 bg-vs-deep rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-vs-gold to-vs-feather transition-all duration-700" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-72 bg-vs-surface border-r border-vs-border flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-vs-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vs-teal to-vs-feather flex items-center justify-center"><Feather className="w-4 h-4 text-white" /></div>
                <h1 className="font-heading font-bold text-vs-text">Velvet Streak</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-vs-muted hover:text-vs-text"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-vs-teal/20 text-vs-feather' : 'text-vs-muted hover:bg-vs-surface-hover hover:text-vs-text'}`}>
                  <item.icon className="w-5 h-5" />{item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-vs-border bg-vs-surface/50 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-vs-muted hover:text-vs-text rounded-lg hover:bg-vs-surface-hover transition-colors"><Menu className="w-5 h-5" /></button>
            <div className="lg:hidden flex items-center gap-2"><Feather className="w-5 h-5 text-vs-feather" /><span className="font-heading font-bold text-vs-text">Velvet Streak</span></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-vs-surface border border-vs-border">
              <span className="text-xs font-mono text-vs-gold font-medium">{(user?.xp || 0).toLocaleString()} XP</span>
              <div className="w-px h-4 bg-vs-border" />
              <span className="text-xs text-vs-feather font-medium">Lv.{user?.level || 1}</span>
            </div>
            <NavLink to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-vs-gold to-vs-feather flex items-center justify-center text-base hover:ring-2 hover:ring-vs-feather/50 transition-all">🦚</NavLink>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6"><Outlet /></main>
        <nav className="lg:hidden border-t border-vs-border bg-vs-surface/90 backdrop-blur-lg flex items-center justify-around py-2 shrink-0 safe-bottom">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs transition-all ${isActive ? 'text-vs-feather' : 'text-vs-muted'}`}>
              {({ isActive }) => (<><div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-vs-teal/20' : ''}`}><item.icon className="w-5 h-5" /></div><span className="font-medium">{item.label}</span></>)}
            </NavLink>
          ))}
        </nav>
      </div>
      {showFAB && <FAB />}
    </div>
  );
}
