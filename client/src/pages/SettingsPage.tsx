import { useState } from 'react';
import { ArrowLeft, Globe, Clock, Calendar, Shield, Trash2, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateSettings, deleteAccount } from '../api/stats';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dayBoundary, setDayBoundary] = useState(user?.preferences.dayBoundaryTime || '03:00');
  const [weekStart, setWeekStart] = useState(user?.preferences.weekStartDay || 'MON');
  const [timezone, setTimezone] = useState(user?.preferences.timezone || 'UTC');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ timezone, dayBoundaryTime: dayBoundary, weekStartDay: weekStart });
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="p-2 rounded-xl text-vs-muted hover:text-vs-teal hover:bg-vs-teal/10 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-heading font-bold text-3xl text-vs-text">Settings</h1>
      </div>

      {/* Day Boundary */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-vs-teal/10 flex items-center justify-center"><Clock className="w-6 h-6 text-vs-teal" /></div>
          <div><h3 className="font-bold text-vs-text text-lg">Day Boundary</h3><p className="text-sm font-medium text-vs-muted mt-0.5">When does your new day start?</p></div>
        </div>
        <select value={dayBoundary} onChange={e => setDayBoundary(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border text-vs-text focus:border-vs-teal focus:ring-1 focus:ring-vs-teal font-medium">
          {['00:00','01:00','02:00','03:00','04:00','05:00','06:00'].map(t => (
            <option key={t} value={t}>{t} {t === '03:00' ? '(recommended)' : ''}</option>
          ))}
        </select>
      </div>

      {/* Timezone */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-vs-teal/10 flex items-center justify-center"><Globe className="w-6 h-6 text-vs-teal" /></div>
          <div><h3 className="font-bold text-vs-text text-lg">Timezone</h3></div>
        </div>
        <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border text-vs-text focus:border-vs-teal focus:ring-1 focus:ring-vs-teal font-medium" />
      </div>

      {/* Week Start */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-vs-teal/10 flex items-center justify-center"><Calendar className="w-6 h-6 text-vs-teal" /></div>
          <div><h3 className="font-bold text-vs-text text-lg">Week Starts On</h3></div>
        </div>
        <div className="flex gap-3">
          {(['MON','SUN'] as const).map(d => (
            <button key={d} onClick={() => setWeekStart(d)} className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${weekStart === d ? 'bg-vs-teal text-white shadow-md' : 'bg-vs-bg text-vs-muted border border-vs-border hover:border-vs-teal/30 hover:text-vs-text'}`}>
              {d === 'MON' ? 'Monday' : 'Sunday'}
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-vs-teal/10 flex items-center justify-center"><Shield className="w-6 h-6 text-vs-teal" /></div>
          <h3 className="font-bold text-vs-text text-lg">Account</h3>
        </div>
        <button onClick={handleLogout} className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold text-vs-muted hover:bg-vs-bg transition-colors flex items-center gap-3"><LogOut className="w-5 h-5" /> Sign Out</button>
        <div className="border-t border-vs-border pt-3">
          <button onClick={handleDeleteAccount} className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold text-vs-rose hover:bg-vs-rose/10 transition-colors flex items-center gap-3"><Trash2 className="w-5 h-5" /> Delete Account</button>
        </div>
      </div>

      <div className="pt-4">
        <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-full bg-vs-teal text-white font-bold hover:shadow-lg hover:shadow-vs-teal/30 hover:bg-vs-teal/90 transition-all disabled:opacity-50 text-lg">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
