import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';
import type { DayState } from '../types';

interface CalendarProps {
  habitStartDate?: string;
  checkInDates: Set<string>; // YYYY-MM-DD
  missedDates?: Set<string>;
  scheduledDates?: Set<string>;
  month?: string; // YYYY-MM
  onMonthChange?: (month: string) => void;
  onDayClick?: (date: string) => void;
}

function getDayState(
  dateStr: string,
  isCurrentMonth: boolean,
  checkIns: Set<string>,
  missed: Set<string>,
  scheduled: Set<string>,
): DayState {
  if (!isCurrentMonth) return 'not_scheduled';
  if (isToday(new Date(dateStr))) {
    if (checkIns.has(dateStr)) return 'completed';
    return 'today_pending';
  }
  if (checkIns.has(dateStr)) return 'completed';
  if (missed.has(dateStr)) return 'missed';
  if (isBefore(new Date(dateStr), new Date())) {
    if (scheduled.has(dateStr)) return 'missed';
    return 'not_scheduled';
  }
  return 'future';
}

const dayStateStyles: Record<DayState, string> = {
  completed: 'bg-vs-teal text-white shadow-md shadow-vs-teal/30',
  missed: 'bg-vs-rose/20 text-vs-rose border border-vs-rose/30',
  not_scheduled: 'text-vs-muted/30',
  today_pending: 'border-2 border-vs-feather text-vs-feather animate-pulse-glow',
  future: 'text-vs-muted/50',
};

export default function Calendar({ checkInDates, missedDates = new Set(), scheduledDates = new Set(), month, onMonthChange, onDayClick }: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState(new Date());

  const currentMonth = month ? new Date(month + '-01T00:00:00') : internalMonth;

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const prevMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (onMonthChange) onMonthChange(format(next, 'yyyy-MM'));
    else setInternalMonth(next);
  };
  
  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (onMonthChange) onMonthChange(format(next, 'yyyy-MM'));
    else setInternalMonth(next);
  };

  return (
    <div className="vs-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl text-vs-muted hover:text-vs-feather hover:bg-vs-feather/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-heading font-semibold text-vs-text">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl text-vs-muted hover:text-vs-feather hover:bg-vs-feather/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-vs-muted py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMo = isSameMonth(day, currentMonth);
          const state = getDayState(dateStr, isCurrentMo, checkInDates, missedDates, scheduledDates);

          return (
            <button
              key={dateStr}
              onClick={() => state === 'completed' && onDayClick?.(dateStr)}
              disabled={state === 'not_scheduled' || state === 'future'}
              className={`aspect-square rounded-xl flex items-center justify-center text-sm font-mono transition-all duration-200 ${dayStateStyles[state]} ${
                state === 'completed' ? 'cursor-pointer hover:scale-110' : ''
              } ${!isCurrentMo ? 'invisible' : ''}`}
            >
              {isCurrentMo && format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-vs-border">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-vs-teal" /><span className="text-xs text-vs-muted">Completed</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-vs-rose/30 border border-vs-rose/40" /><span className="text-xs text-vs-muted">Missed</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-vs-feather" /><span className="text-xs text-vs-muted">Today</span></div>
      </div>
    </div>
  );
}
