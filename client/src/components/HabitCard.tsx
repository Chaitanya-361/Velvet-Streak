import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Flame, ChevronRight, Pencil } from 'lucide-react';
import { createCheckIn } from '../api/habits';
import toast from 'react-hot-toast';

interface HabitCardProps {
  habit: any;
  onCheckIn?: () => void;
}

export default function HabitCard({ habit, onCheckIn }: HabitCardProps) {
  const [checked, setChecked] = useState(habit.todayStatus === 'completed');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isQuantitative = habit.habitType === 'quantitative';
  const isPending = habit.todayStatus === 'pending' || habit.todayStatus === 'completed';
  const isNotScheduled = habit.todayStatus === 'not_scheduled' || habit.todayStatus === 'rest_day';

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (checked || loading) return;
    setLoading(true);
    try {
      const result = await createCheckIn(habit._id, 0, isQuantitative ? undefined : undefined);
      setChecked(true);
      if (result.newBadges?.length > 0) {
        toast.success(`🦚 Badge unlocked: ${result.newBadges.join(', ')}!`, { duration: 4000 });
      } else {
        toast.success(`+${result.xpAwarded} XP! Streak: ${result.currentStreak} 🔥`);
      }
      if (result.levelledUp) {
        toast.success(`🎉 Level Up! You're now Level ${result.newLevel}!`, { duration: 5000 });
      }
      onCheckIn?.();
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const weeklyPercent = isQuantitative && habit.quantitative
    ? Math.min(100, ((habit.weeklyProgress || 0) / habit.quantitative.weeklyTarget) * 100)
    : 0;

  return (
    <div onClick={() => navigate(`/habits/${habit._id}`)}
      className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer card-hover overflow-hidden ${
        isNotScheduled ? 'bg-vs-surface/40 border-vs-border/50 opacity-60' : 'bg-vs-surface border-vs-border hover:border-vs-feather/30'
      }`}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: habit.color }} />
      <div className="p-4 pl-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105" style={{ backgroundColor: `${habit.color}20` }}>{habit.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-vs-text truncate">{habit.name}</h3>
            {(habit.currentStreak || 0) > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-mono text-vs-gold px-1.5 py-0.5 rounded-full bg-vs-gold/10">
                <Flame className="w-3 h-3" />{habit.currentStreak}
              </span>
            )}
          </div>
          {isQuantitative && habit.quantitative ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-vs-deep rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-vs-teal to-vs-feather transition-all duration-500" style={{ width: `${weeklyPercent}%` }} />
                </div>
                <span className="text-xs font-mono text-vs-muted whitespace-nowrap">{habit.weeklyProgress || 0} / {habit.quantitative.weeklyTarget} {habit.quantitative.targetUnit}</span>
              </div>
              <p className="text-xs text-vs-muted">{Math.round(weeklyPercent)}% this week</p>
            </div>
          ) : (
            <p className="text-xs text-vs-muted">{isNotScheduled ? 'Not scheduled today' : habit.description}</p>
          )}
        </div>
        {isPending && !isNotScheduled && (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleCheckIn} disabled={loading || checked}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                checked ? 'bg-vs-emerald text-white shadow-lg shadow-vs-emerald/30 scale-95'
                  : 'border-2 border-vs-border text-vs-muted hover:border-vs-feather hover:text-vs-feather hover:bg-vs-feather/5'
              } ${loading ? 'animate-pulse' : ''}`}>
              {checked ? <Check className="w-5 h-5 animate-scale-in" /> : isQuantitative ? <Pencil className="w-4 h-4" /> : <Check className="w-5 h-5" />}
            </button>
          </div>
        )}
        <ChevronRight className="w-4 h-4 text-vs-muted/50 shrink-0 group-hover:text-vs-feather transition-colors" />
      </div>
    </div>
  );
}
