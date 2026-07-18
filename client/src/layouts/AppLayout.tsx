import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart3, CheckSquare, User, Settings, Menu, X, Feather, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FAB from '../components/FAB';

const LEVEL_TITLES = [
  'Hatchling', 'Fledgling', 'Feathered', 'Preening', 'Strutter',
  'Plume Bearer', 'Iridescent', 'Crowned', 'Resplendent', 'Grand Peacock',
];


const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/todos', icon: CheckSquare, label: 'To-Do' },
  { to: '/zen', icon: Sparkles, label: 'Zen' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const showFAB = !location.pathname.startsWith('/habits/');
  const levelTitle = LEVEL_TITLES[(user?.level || 1) - 1] || 'Hatchling';

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-vs-bg via-vs-surface to-[#E0F2F1] text-vs-text">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-vs-border bg-vs-surface">
        <div className="flex items-center gap-3 px-8 py-10">
          <div className="w-10 h-10 rounded-xl bg-vs-teal flex items-center justify-center shadow-md shadow-vs-teal/20">
            <Feather className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg text-vs-text leading-tight">Velvet<br/>Streak</h1>
            <p className="text-[10px] text-vs-muted font-medium mt-1 uppercase tracking-wider">Keep track of<br/>your streaks</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => `flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-vs-teal text-white shadow-md' : 'text-vs-muted hover:bg-vs-surface-hover hover:text-vs-text'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4">
          <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-3 flex items-center gap-3 hover:border-vs-teal/30 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vs-teal/10 to-vs-feather/20 flex items-center justify-center text-lg shadow-inner overflow-hidden border border-vs-teal">
               {/* Could use an avatar image here if available, fallback to emoji */}
               <span>🦚</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-vs-text truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-vs-muted font-medium">Lv. {user?.level || 1} • {levelTitle}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-72 bg-vs-surface border-r border-vs-border flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-vs-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-vs-teal flex items-center justify-center shadow-md shadow-vs-teal/20"><Feather className="w-4 h-4 text-white" /></div>
                <h1 className="font-heading font-bold text-vs-text">Velvet Streak</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-vs-muted hover:text-vs-text"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-vs-teal text-white shadow-md' : 'text-vs-muted hover:bg-vs-surface-hover hover:text-vs-text'}`}>
                  <item.icon className="w-5 h-5" />{item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="lg:hidden h-16 border-b border-vs-border bg-vs-surface flex items-center px-4 shrink-0 justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-vs-text hover:bg-vs-surface-hover rounded-lg transition-colors"><Menu className="w-5 h-5" /></button>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-vs-surface border border-vs-border shadow-sm">
             <span className="text-xs font-bold text-vs-teal">{(user?.xp || 0).toLocaleString()} XP</span>
             <div className="w-px h-3 bg-vs-border" />
             <span className="text-xs text-vs-muted font-semibold">Lv.{user?.level || 1}</span>
           </div>
        </div>

        <main className="flex-1 overflow-y-auto px-4 lg:px-12 py-8 relative">
           {/* Desktop Floating XP Pill */}
           <div className="hidden lg:flex absolute top-8 left-12 items-center gap-3 px-4 py-2 rounded-full bg-vs-surface border border-vs-border shadow-sm">
             <span className="text-sm font-bold text-vs-teal">{(user?.xp || 0).toLocaleString()} XP</span>
             <div className="w-px h-4 bg-vs-border" />
             <span className="text-sm text-vs-muted font-semibold">Lv.{user?.level || 1}</span>
           </div>
           
           <div className="mt-14 lg:mt-24">
             <Outlet />
           </div>
        </main>
        
        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden border-t border-vs-border bg-vs-surface flex items-center justify-around py-2 shrink-0 safe-bottom">
          {navItems.filter(i => i.to !== '/settings').map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all ${isActive ? 'text-vs-teal' : 'text-vs-muted'}`}>
              {({ isActive }) => (<><item.icon className={`w-5 h-5 ${isActive ? 'fill-vs-teal/20' : ''}`} /><span className="font-semibold">{item.label}</span></>)}
            </NavLink>
          ))}
        </nav>
      </div>
      {showFAB && <FAB />}
    </div>
  );
}
