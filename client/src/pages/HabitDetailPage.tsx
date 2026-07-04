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

  if (loading) return <div className="py-20 text-center text-vs-muted font-medium animate-fade-in">Loading habit...</div>;
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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 bg-vs-surface p-4 rounded-2xl border border-vs-border shadow-sm">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl text-vs-muted hover:text-vs-teal hover:bg-vs-teal/10 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-vs-border/50 bg-white">{habit.icon}</div>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-2xl text-vs-text mb-1">{habit.name}</h1>
          <p className="text-xs font-bold text-vs-muted uppercase tracking-wider">{habit.category} · {habit.habitType} · {habit.schedule.type.replace(/_/g, ' ')}</p>
        </div>
        <button onClick={handleDelete} className="p-2 rounded-xl text-vs-muted hover:text-vs-rose hover:bg-vs-rose/10 transition-colors"><Trash2 className="w-5 h-5" /></button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-vs-gold/10 mx-auto flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 text-vs-gold" />
          </div>
          <p className="text-2xl font-heading font-bold text-vs-text">{habit.currentStreak}</p>
          <p className="text-[11px] font-bold text-vs-muted uppercase tracking-wider mt-1">Current Streak</p>
        </div>
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-vs-emerald/10 mx-auto flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5 text-vs-emerald" />
          </div>
          <p className="text-2xl font-heading font-bold text-vs-text">{habit.longestStreak}</p>
          <p className="text-[11px] font-bold text-vs-muted uppercase tracking-wider mt-1">Longest Streak</p>
        </div>
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-vs-teal/10 mx-auto flex items-center justify-center mb-3">
            <Moon className="w-5 h-5 text-vs-teal" />
          </div>
          <p className="text-2xl font-heading font-bold text-vs-text">{habit.restDayConfig.allowed ? `${habit.restDayConfig.maxPerWeek}/wk` : '—'}</p>
          <p className="text-[11px] font-bold text-vs-muted uppercase tracking-wider mt-1">Rest Days</p>
        </div>
      </div>

      {/* Weekly Progress (quantitative) */}
      {habit.habitType === 'quantitative' && habit.quantitative && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
          <h3 className="font-bold text-vs-text mb-4 text-lg">Weekly Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-vs-bg rounded-full overflow-hidden border border-vs-border/50">
              <div className="h-full rounded-full bg-vs-teal transition-all duration-500" style={{ width: `${Math.min(100, ((weeklyProgress || 0) / habit.quantitative.weeklyTarget) * 100)}%` }} />
            </div>
            <span className="text-sm font-bold text-vs-muted">{weeklyProgress || 0} / {habit.quantitative.weeklyTarget} {habit.quantitative.targetUnit}</span>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
        <Calendar
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          checkInDates={checkedDates}
          restDayDates={restDates}
        />
      </div>

      {/* Recent Activity */}
      {recentCheckIns.length > 0 && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
          <h3 className="font-heading font-bold text-vs-text mb-5 text-lg">Recent Activity</h3>
          <div className="space-y-3">
            {recentCheckIns.map((ci: any) => (
              <div key={ci._id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-vs-bg border border-vs-border/50 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-vs-emerald/10 flex items-center justify-center">
                  <span className="text-vs-emerald text-sm font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-vs-text">{new Date(ci.logicalDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  {ci.note && <p className="text-xs font-medium text-vs-muted mt-0.5">{ci.note}</p>}
                </div>
                {ci.amount && <span className="text-xs font-bold text-vs-teal bg-vs-teal/10 px-2 py-1 rounded-md">{ci.amount} {habit.quantitative?.targetUnit}</span>}
                <span className="text-xs font-bold text-vs-gold bg-vs-gold/10 px-2 py-1 rounded-md">+{ci.xpAwarded} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
