import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ListTodo, Sparkles } from 'lucide-react';

export default function FAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-6 z-40 flex flex-col items-end gap-3">
      {/* Menu items */}
      {open && (
        <div className="flex flex-col gap-2 animate-slide-up">
          <button
            onClick={() => { navigate('/habits/new'); setOpen(false); }}
            className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-vs-teal text-white shadow-lg hover:bg-vs-teal/90 transition-all group"
          >
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold whitespace-nowrap">Add Habit</span>
          </button>
          <button
            onClick={() => { navigate('/todos?add=true'); setOpen(false); }}
            className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-vs-surface text-vs-text shadow-lg hover:bg-vs-surface-hover transition-all group border border-vs-border"
          >
            <ListTodo className="w-5 h-5 text-vs-teal group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold whitespace-nowrap">Add Task</span>
          </button>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-vs-rose rotate-45 text-white'
            : 'bg-vs-teal text-white hover:scale-105'
        }`}
      >
        {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
