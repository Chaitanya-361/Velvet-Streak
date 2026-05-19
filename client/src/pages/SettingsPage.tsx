import { useState } from 'react';
import { ArrowLeft, Moon, Sun, Globe, Clock, Calendar, Shield, Trash2, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateSettings, deleteAccount } from '../api/stats';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'dark'|'light'>(user?.preferences.theme || 'dark');
  const [dayBoundary, setDayBoundary] = useState(user?.preferences.dayBoundaryTime || '03:00');
  const [weekStart, setWeekStart] = useState(user?.preferences.weekStartDay || 'MON');
  const [timezone, setTimezone] = useState(user?.preferences.timezone || 'UTC');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ timezone, dayBoundaryTime: dayBoundary, weekStartDay: weekStart, theme });
      toast.success('Settings saved!');
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all data.')) return;
    try {
      await deleteAccount();
      await logout();
      navigate('/login');
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete account'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="p-2 rounded-xl text-vs-muted hover:text-vs-feather hover:bg-vs-feather/10 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-heading font-bold text-2xl text-vs-text">Settings</h1>
      </div>

      {/* Day Boundary */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-vs-teal/10 flex items-center justify-center"><Clock className="w-5 h-5 text-vs-feather" /></div>
          <div><h3 className="font-semibold text-vs-text">Day Boundary</h3><p className="text-xs text-vs-muted">When does your new day start?</p></div>
        </div>
        <select value={dayBoundary} onChange={e => setDayBoundary(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text focus:border-vs-feather focus:ring-1 focus:ring-vs-feather">
          {['00:00','01:00','02:00','03:00','04:00','05:00','06:00'].map(t => (
            <option key={t} value={t}>{t} {t === '03:00' ? '(recommended)' : ''}</option>
          ))}
        </select>
      </div>

      {/* Timezone */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-vs-teal/10 flex items-center justify-center"><Globe className="w-5 h-5 text-vs-feather" /></div>
          <div><h3 className="font-semibold text-vs-text">Timezone</h3></div>
        </div>
        <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text focus:border-vs-feather focus:ring-1 focus:ring-vs-feather" />
      </div>

      {/* Week Start */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-vs-teal/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-vs-feather" /></div>
          <div><h3 className="font-semibold text-vs-text">Week Starts On</h3></div>
        </div>
        <div className="flex gap-2">
          {(['MON','SUN'] as const).map(d => (
            <button key={d} onClick={() => setWeekStart(d)} className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${weekStart === d ? 'bg-vs-teal/20 text-vs-feather border border-vs-feather' : 'bg-vs-deep text-vs-muted border border-vs-border hover:border-vs-feather/30'}`}>
              {d === 'MON' ? 'Monday' : 'Sunday'}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-vs-teal/10 flex items-center justify-center">{theme === 'dark' ? <Moon className="w-5 h-5 text-vs-feather" /> : <Sun className="w-5 h-5 text-vs-gold" />}</div>
          <div><h3 className="font-semibold text-vs-text">Theme</h3></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTheme('dark')} className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-vs-teal/20 text-vs-feather border border-vs-feather' : 'bg-vs-deep text-vs-muted border border-vs-border'}`}><Moon className="w-4 h-4" /> Dark</button>
          <button onClick={() => setTheme('light')} className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${theme === 'light' ? 'bg-vs-teal/20 text-vs-feather border border-vs-feather' : 'bg-vs-deep text-vs-muted border border-vs-border'}`}><Sun className="w-4 h-4" /> Light</button>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-vs-teal/10 flex items-center justify-center"><Shield className="w-5 h-5 text-vs-feather" /></div>
          <h3 className="font-semibold text-vs-text">Account</h3>
        </div>
        <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm text-vs-muted hover:bg-vs-surface-hover transition-colors flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</button>
        <div className="border-t border-vs-border pt-3">
          <button onClick={handleDeleteAccount} className="w-full text-left px-4 py-3 rounded-xl text-sm text-vs-rose hover:bg-vs-rose/10 transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete Account</button>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-vs-teal to-vs-feather text-white font-semibold hover:shadow-lg hover:shadow-vs-teal/30 transition-all disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
