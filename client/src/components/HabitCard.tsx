import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Flame, ChevronRight, Pencil, X } from 'lucide-react';
import { createCheckIn, undoCheckIn } from '../api/habits';
import Modal from './Modal';
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

  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    if (checked) {
      setLoading(true);
      try {
        if (!habit.todayCheckInId) {
          toast.error('Cannot uncheck: Missing check-in ID');
          setLoading(false);
          return;
        }
        await undoCheckIn(habit.todayCheckInId);
        setChecked(false);
        toast.success('Check-in undone');
        onCheckIn?.();
      } catch (err: any) {
        toast.error(err.message || 'Action failed');
      } finally {
        setLoading(false);
      }
    } else {
      if (isQuantitative) {
        setShowModal(true);
        setInputValue('');
      } else {
        submitCheckIn();
      }
    }
  };

  const submitCheckIn = async (amount?: number) => {
    setLoading(true);
    try {
      const result = await createCheckIn(habit._id, 0, amount);
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
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const weeklyPercent = isQuantitative && habit.quantitative
    ? Math.min(100, ((habit.weeklyProgress || 0) / habit.quantitative.weeklyTarget) * 100)
    : 0;

  return (
    <>
      <div onClick={() => navigate(`/habits/${habit._id}`)}
        className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md ${
          isNotScheduled ? 'bg-vs-bg border-dashed border-vs-border opacity-75' : 'bg-vs-surface border-vs-border hover:border-vs-teal/30'
        }`}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ backgroundColor: habit.color || '#006064' }} />
        <div className="p-4 pl-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105 border border-vs-border/50 shadow-sm" style={{ backgroundColor: `${habit.color}15` || '#00606415' }}>{habit.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-vs-text truncate text-base">{habit.name}</h3>
              {(habit.currentStreak || 0) > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-vs-gold px-2 py-0.5 rounded-full bg-vs-gold/10 uppercase tracking-wider">
                  <Flame className="w-3 h-3" />{habit.currentStreak}
                </span>
              )}
            </div>
            {isQuantitative && habit.quantitative ? (
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-vs-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-vs-teal transition-all duration-500" style={{ width: `${weeklyPercent}%` }} />
                  </div>
                  <span className="text-xs font-bold text-vs-muted whitespace-nowrap">{habit.weeklyProgress || 0} / {habit.quantitative.weeklyTarget} {habit.quantitative.targetUnit}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-vs-muted font-medium">{isNotScheduled ? 'Not scheduled today' : habit.description}</p>
            )}
          </div>
          {isPending && !isNotScheduled && (
            <div className="flex items-center gap-2 shrink-0 pl-2">
              <button onClick={handleCheckIn} disabled={loading}
                className={`group/btn w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  checked ? 'bg-vs-teal text-white shadow-md shadow-vs-teal/30 scale-95 hover:bg-red-500 hover:shadow-red-500/30'
                    : 'border-2 border-vs-border text-vs-muted hover:border-vs-teal hover:text-vs-teal hover:bg-vs-teal/5'
                } ${loading ? 'animate-pulse' : ''}`}>
                {checked ? (
                  <>
                    <Check className="w-6 h-6 animate-scale-in stroke-[3] group-hover/btn:hidden" />
                    <X className="w-6 h-6 animate-scale-in stroke-[3] hidden group-hover/btn:block" />
                  </>
                ) : isQuantitative ? (
                  <Pencil className="w-5 h-5" />
                ) : (
                  <Check className="w-6 h-6 stroke-[2.5]" />
                )}
              </button>
            </div>
          )}
          <ChevronRight className="w-5 h-5 text-vs-border shrink-0 group-hover:text-vs-teal transition-colors ml-2" />
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Progress">
        <div className="space-y-4">
          <p className="text-sm text-vs-text">
            How many <span className="font-bold">{habit.quantitative?.targetUnit}</span> did you complete?
          </p>
          <input
            type="number"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue) {
                const amount = Number(inputValue);
                if (!isNaN(amount) && amount > 0) submitCheckIn(amount);
                else toast.error('Please enter a valid amount');
              }
            }}
            className="w-full bg-vs-bg border border-vs-border rounded-xl px-4 py-3 text-vs-text focus:outline-none focus:border-vs-teal focus:ring-1 focus:ring-vs-teal"
            placeholder="Enter amount..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-vs-muted hover:text-vs-text hover:bg-vs-surface-hover transition-colors">Cancel</button>
            <button
              onClick={() => {
                const amount = Number(inputValue);
                if (!isNaN(amount) && amount > 0) submitCheckIn(amount);
                else toast.error('Please enter a valid amount');
              }}
              disabled={loading || !inputValue}
              className="px-5 py-2.5 rounded-xl font-bold bg-vs-teal text-white hover:bg-vs-teal/90 hover:shadow-lg hover:shadow-vs-teal/30 transition-all disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
