import { useState, useEffect, useMemo } from 'react';
import { Flame, Zap, Trophy, Sparkles } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import XPProgressBar from '../components/XPProgressBar';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard } from '../api/stats';
import { motivationalQuotes } from '../data/mockData';
import toast from 'react-hot-toast';

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];
const LEVEL_TITLES = ['Hatchling','Fledgling','Feathered','Preening','Strutter','Plume Bearer','Iridescent','Crowned','Resplendent','Grand Peacock'];

export default function HomePage() {
  const { user, refreshUser } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const data = await fetchDashboard();
      setHabits(data.habits || []);
      refreshUser(); // Sync XP/level
    } catch (err: any) {
      toast.error('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const dueToday = habits.filter((h: any) => h.todayStatus === 'pending');
  const completedToday = habits.filter((h: any) => h.todayStatus === 'completed');
  const notScheduled = habits.filter((h: any) => h.todayStatus === 'not_scheduled' || h.todayStatus === 'rest_day');

  const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);
  const longestStreak = habits.length > 0 ? Math.max(...habits.map((h: any) => h.currentStreak || 0)) : 0;
  const habitsOnStreak = habits.filter((h: any) => (h.currentStreak || 0) >= 7).length;

  const level = user?.level || 1;
  const xp = user?.xp || 0;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="text-4xl animate-float mb-4">🦚</div>
        <p className="text-vs-muted">Loading your habits...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Motivational Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-vs-teal/20 to-vs-feather/10 border border-vs-feather/20 p-5">
        <p className="text-sm text-vs-feather font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-vs-gold" />{quote}
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-4 text-center card-hover">
          <div className="flex justify-center mb-2"><div className="w-9 h-9 rounded-xl bg-vs-gold/10 flex items-center justify-center"><Flame className="w-5 h-5 text-vs-gold" /></div></div>
          <p className="text-xl font-heading font-bold text-vs-text">{longestStreak}</p>
          <p className="text-xs text-vs-muted">Best Streak</p>
        </div>
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-4 text-center card-hover">
          <div className="flex justify-center mb-2"><div className="w-9 h-9 rounded-xl bg-vs-feather/10 flex items-center justify-center"><Zap className="w-5 h-5 text-vs-feather" /></div></div>
          <p className="text-xl font-heading font-bold text-vs-text">{habitsOnStreak}</p>
          <p className="text-xs text-vs-muted">On Fire 🔥</p>
        </div>
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-4 text-center card-hover">
          <div className="flex justify-center mb-2"><div className="w-9 h-9 rounded-xl bg-vs-emerald/10 flex items-center justify-center"><Trophy className="w-5 h-5 text-vs-emerald" /></div></div>
          <p className="text-xl font-heading font-bold text-vs-text">{completedToday.length}/{habits.length}</p>
          <p className="text-xs text-vs-muted">Today</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
        <XPProgressBar currentXP={xp} levelStartXP={LEVEL_THRESHOLDS[level - 1] || 0} levelEndXP={LEVEL_THRESHOLDS[level] || 35000} level={level} title={LEVEL_TITLES[level - 1]} />
      </div>

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-12 text-center">
          <div className="text-5xl mb-4">🦚</div>
          <h2 className="font-heading font-bold text-xl text-vs-text mb-2">No habits yet!</h2>
          <p className="text-sm text-vs-muted mb-4">Create your first habit to start building streaks.</p>
          <a href="/habits/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-vs-teal to-vs-feather text-white font-semibold hover:shadow-lg hover:shadow-vs-teal/30 transition-all">
            <Sparkles className="w-4 h-4" /> Create Your First Habit
          </a>
        </div>
      )}

      {/* Due Today */}
      {dueToday.length > 0 && (
        <section>
          <h2 className="font-heading font-semibold text-vs-text mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-vs-feather animate-pulse" />Due Today <span className="text-sm text-vs-muted font-normal">({dueToday.length})</span>
          </h2>
          <div className="space-y-3">{dueToday.map((h: any) => <HabitCard key={h._id} habit={h} onCheckIn={loadDashboard} />)}</div>
        </section>
      )}

      {completedToday.length > 0 && (
        <section>
          <h2 className="font-heading font-semibold text-vs-text mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-vs-emerald" />Completed Today <span className="text-sm text-vs-muted font-normal">({completedToday.length})</span>
          </h2>
          <div className="space-y-3">{completedToday.map((h: any) => <HabitCard key={h._id} habit={h} onCheckIn={loadDashboard} />)}</div>
        </section>
      )}

      {notScheduled.length > 0 && (
        <section>
          <h2 className="font-heading font-semibold text-vs-muted mb-3 flex items-center gap-2">Not Scheduled Today <span className="text-sm font-normal">({notScheduled.length})</span></h2>
          <div className="space-y-3">{notScheduled.map((h: any) => <HabitCard key={h._id} habit={h} onCheckIn={loadDashboard} />)}</div>
        </section>
      )}
    </div>
  );
}
