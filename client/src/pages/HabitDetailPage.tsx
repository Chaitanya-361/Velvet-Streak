import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Trophy, Moon, Trash2 } from 'lucide-react';
import { fetchHabit, fetchHabitCalendar, deleteHabit } from '../api/habits';
import { fetchCheckIns } from '../api/habits';
import Calendar from '../components/Calendar';
import toast from 'react-hot-toast';

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [habit, setHabit] = useState<any>(null);
  const [calendar, setCalendar] = useState<any>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [h, cal, cis] = await Promise.all([
          fetchHabit(id),
          fetchHabitCalendar(id, calendarMonth),
          fetchCheckIns({ habitId: id }),
        ]);
        setHabit(h);
        setCalendar(cal);
        setRecentCheckIns(cis.slice(0, 10));
      } catch { toast.error('Failed to load habit'); navigate('/'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, calendarMonth]);

  const handleDelete = async () => {
    if (!confirm('Delete this habit? All check-ins will be lost.')) return;
    try {
      await deleteHabit(id!);
      toast.success('Habit deleted');
      navigate('/');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="py-20 text-center text-vs-muted animate-fade-in">Loading habit...</div>;
  if (!habit) return null;

  const checkedDates = new Set<string>(calendar?.checkInDates || []);
  const restDates = new Set<string>(calendar?.restDayDates || []);

  const weeklyProgress = habit.habitType === 'quantitative' && habit.quantitative ? (() => {
    const weekCIs = recentCheckIns.filter(c => {
      const d = new Date(c.logicalDate);
      const now = new Date();
      const diff = Math.abs(now.getTime() - d.getTime()) / 86400000;
      return diff <= 7;
    });
    return weekCIs.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
  })() : undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl text-vs-muted hover:text-vs-feather hover:bg-vs-feather/10 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${habit.color}20` }}>{habit.icon}</div>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-2xl text-vs-text">{habit.name}</h1>
          <p className="text-sm text-vs-muted">{habit.category} · {habit.habitType} · {habit.schedule.type.replace(/_/g, ' ')}</p>
        </div>
        <button onClick={handleDelete} className="p-2 rounded-xl text-vs-muted hover:text-vs-rose hover:bg-vs-rose/10 transition-colors"><Trash2 className="w-5 h-5" /></button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-4 text-center">
          <Flame className="w-5 h-5 text-vs-gold mx-auto mb-1" />
          <p className="text-xl font-heading font-bold text-vs-text">{habit.currentStreak}</p>
          <p className="text-xs text-vs-muted">Current Streak</p>
        </div>
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-4 text-center">
          <Trophy className="w-5 h-5 text-vs-emerald mx-auto mb-1" />
          <p className="text-xl font-heading font-bold text-vs-text">{habit.longestStreak}</p>
          <p className="text-xs text-vs-muted">Longest Streak</p>
        </div>
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-4 text-center">
          <Moon className="w-5 h-5 text-vs-feather mx-auto mb-1" />
          <p className="text-xl font-heading font-bold text-vs-text">{habit.restDayConfig.allowed ? `${habit.restDayConfig.maxPerWeek}/wk` : '—'}</p>
          <p className="text-xs text-vs-muted">Rest Days</p>
        </div>
      </div>

      {/* Weekly Progress (quantitative) */}
      {habit.habitType === 'quantitative' && habit.quantitative && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
          <h3 className="font-semibold text-vs-text mb-3">Weekly Progress</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-vs-deep rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-vs-teal to-vs-feather transition-all duration-500" style={{ width: `${Math.min(100, ((weeklyProgress || 0) / habit.quantitative.weeklyTarget) * 100)}%` }} />
            </div>
            <span className="text-sm font-mono text-vs-muted">{weeklyProgress || 0} / {habit.quantitative.weeklyTarget} {habit.quantitative.targetUnit}</span>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
        <Calendar
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          checkInDates={checkedDates}
          restDayDates={restDates}
        />
      </div>

      {/* Recent Activity */}
      {recentCheckIns.length > 0 && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
          <h3 className="font-heading font-semibold text-vs-text mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {recentCheckIns.map((ci: any) => (
              <div key={ci._id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-vs-deep">
                <span className="text-vs-emerald text-lg">✓</span>
                <div className="flex-1">
                  <p className="text-sm text-vs-text">{ci.logicalDate}</p>
                  {ci.note && <p className="text-xs text-vs-muted">{ci.note}</p>}
                </div>
                {ci.amount && <span className="text-xs font-mono text-vs-feather">{ci.amount} {habit.quantitative?.targetUnit}</span>}
                <span className="text-xs text-vs-gold">+{ci.xpAwarded} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
