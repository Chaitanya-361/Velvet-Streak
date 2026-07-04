import { useState, useEffect, useMemo } from 'react';
import { Flame, Zap, Trophy, Sparkles } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import XPProgressBar from '../components/XPProgressBar';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard } from '../api/stats';
import toast from 'react-hot-toast';

const motivationalQuotes = [
  "Every day is a chance to build something great. 🦚",
  "Small steps lead to giant leaps. Keep going! 💪",
  "Consistency is the mother of mastery. 🔥",
  "Your streaks tell the story of your discipline. ✨",
  "The peacock's beauty comes from patience. So does yours. 🌟",
  "One more day, one more step closer to your goals. 🎯",
  "Don't break the chain. You're doing amazing! 🏆",
];

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
        <p className="text-vs-muted font-medium">Loading your habits...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Motivational Banner */}
      <div className="rounded-2xl bg-[#EEF2F6] border border-vs-border/50 py-4 px-6 flex items-center justify-center text-center">
        <p className="text-[15px] text-vs-text font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-vs-teal" />
          {quote}
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-6 flex flex-col items-center justify-center card-hover min-h-[140px]">
          <Flame className="w-6 h-6 text-vs-teal mb-3" />
          <p className="text-4xl font-heading font-bold text-vs-text leading-none mb-2">{longestStreak}</p>
          <p className="text-sm font-semibold text-vs-muted">Best Streak</p>
        </div>
        <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-6 flex flex-col items-center justify-center card-hover min-h-[140px]">
          <Zap className="w-6 h-6 text-vs-teal mb-3" />
          <p className="text-4xl font-heading font-bold text-vs-text leading-none mb-2">{habitsOnStreak}</p>
          <p className="text-sm font-semibold text-vs-muted">On Fire 🔥</p>
        </div>
        <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-6 flex flex-col items-center justify-center card-hover min-h-[140px]">
          <Trophy className="w-6 h-6 text-vs-teal mb-3" />
          <p className="text-4xl font-heading font-bold text-vs-text leading-none mb-2">{completedToday.length}/{habits.length}</p>
          <p className="text-sm font-semibold text-vs-muted">Today</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-8">
        <XPProgressBar currentXP={xp} levelStartXP={LEVEL_THRESHOLDS[level - 1] || 0} levelEndXP={LEVEL_THRESHOLDS[level] || 35000} level={level} title={LEVEL_TITLES[level - 1]} size="lg" />
      </div>

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">🦚</div>
          <h2 className="font-heading font-bold text-xl text-vs-text mb-2">No habits yet!</h2>
          <p className="text-sm text-vs-muted mb-6">Create your first habit to start building streaks.</p>
          <a href="/habits/new" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-vs-teal text-white font-bold hover:shadow-lg hover:shadow-vs-teal/30 hover:bg-vs-teal/90 transition-all">
            <Sparkles className="w-5 h-5" /> Create Your First Habit
          </a>
        </div>
      )}

      {/* Due Today */}
      {dueToday.length > 0 && (
        <section>
          <h2 className="font-heading font-semibold text-vs-text text-xl mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-vs-teal" />Due Today <span className="text-base text-vs-muted font-semibold">({dueToday.length})</span>
          </h2>
          <div className="space-y-4">{dueToday.map((h: any) => <HabitCard key={h._id} habit={h} onCheckIn={loadDashboard} />)}</div>
        </section>
      )}

      {completedToday.length > 0 && (
        <section className={dueToday.length === 0 ? "" : "pt-4"}>
          <h2 className="font-heading font-semibold text-vs-text text-xl mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-vs-emerald" />Completed Today <span className="text-base text-vs-muted font-semibold">({completedToday.length})</span>
          </h2>
          <div className="space-y-4">{completedToday.map((h: any) => <HabitCard key={h._id} habit={h} onCheckIn={loadDashboard} />)}</div>
        </section>
      )}

      {notScheduled.length > 0 && (
        <section className="pt-4">
          <h2 className="font-heading font-semibold text-vs-muted text-xl mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-vs-border" />
            Not Scheduled Today <span className="text-base font-semibold">({notScheduled.length})</span>
          </h2>
          <div className="space-y-4">{notScheduled.map((h: any) => <HabitCard key={h._id} habit={h} onCheckIn={loadDashboard} />)}</div>
        </section>
      )}
    </div>
  );
}
