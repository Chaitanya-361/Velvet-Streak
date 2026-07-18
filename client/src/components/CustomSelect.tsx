import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}

export default function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 text-left rounded-xl bg-vs-bg border transition-colors flex items-center justify-between font-medium
          ${open ? 'border-vs-teal ring-1 ring-vs-teal' : 'border-vs-border hover:border-vs-teal/50'}`}
      >
        <span className={selected ? 'text-vs-text' : 'text-vs-muted'}>
          {selected?.label || 'Select...'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180 text-vs-teal' : 'text-vs-muted'}`} />
      </button>
      
      {open && (
        <div className="absolute z-20 w-full mt-2 bg-vs-surface border border-vs-border rounded-xl shadow-xl py-1.5 animate-fade-in overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-between
                ${opt.value === value ? 'text-vs-teal bg-vs-teal/10' : 'text-vs-text'}
                hover:text-vs-teal hover:bg-vs-teal/10 hover:[text-shadow:0_0_12px_rgba(103,190,217,0.6)] hover:pl-5`}
            >
              {opt.label}
              {opt.value === value && <div className="w-1.5 h-1.5 rounded-full bg-vs-teal" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
