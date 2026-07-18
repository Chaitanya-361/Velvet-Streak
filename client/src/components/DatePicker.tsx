import { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  const startDay = startOfMonth(currentMonth).getDay();
  const padding = Array.from({ length: startDay });

  return (
    <div className="relative w-full" ref={ref}>
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 text-left rounded-xl bg-vs-bg border transition-colors flex items-center gap-3 font-medium
          ${open ? 'border-vs-teal ring-1 ring-vs-teal' : 'border-vs-border hover:border-vs-teal/50'}`}
      >
        <CalendarIcon className={`w-4 h-4 transition-colors ${open || selectedDate ? 'text-vs-teal' : 'text-vs-muted'}`} />
        <span className={selectedDate ? 'text-vs-text' : 'text-vs-muted'}>
          {selectedDate ? format(selectedDate, 'MMM do, yyyy') : placeholder}
        </span>
      </button>
      
      {open && (
        <div className="absolute z-20 w-[280px] mt-2 bg-vs-surface border border-vs-border rounded-2xl shadow-xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-vs-surface-hover rounded-xl transition-colors">
              <ChevronLeft className="w-4 h-4 text-vs-text" />
            </button>
            <span className="font-bold text-sm text-vs-text">{format(currentMonth, 'MMMM yyyy')}</span>
            <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-vs-surface-hover rounded-xl transition-colors">
              <ChevronRight className="w-4 h-4 text-vs-text" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-vs-muted uppercase tracking-wider">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {padding.map((_, i) => <div key={`pad-${i}`} />)}
            {daysInMonth.map(day => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrent = isToday(day);
              
              return (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={() => { onChange(format(day, 'yyyy-MM-dd')); setOpen(false); }}
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-semibold transition-all
                    ${isSelected ? 'bg-vs-teal text-white shadow-md scale-110' : 
                      isCurrent ? 'text-vs-teal bg-vs-teal/10 hover:bg-vs-teal/20' : 
                      'text-vs-text hover:bg-vs-surface-hover hover:scale-110'}`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
