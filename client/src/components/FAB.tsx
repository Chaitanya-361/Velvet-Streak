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
            className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl bg-vs-teal text-white shadow-lg shadow-vs-teal/30 hover:bg-vs-teal/90 transition-all group"
          >
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold whitespace-nowrap">Add Habit</span>
          </button>
          <button
            onClick={() => { navigate('/todos?add=true'); setOpen(false); }}
            className="flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl bg-vs-gold text-vs-deep shadow-lg shadow-vs-gold/30 hover:bg-vs-gold/90 transition-all group"
          >
            <ListTodo className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold whitespace-nowrap">Add Task</span>
          </button>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-vs-rose rotate-45 shadow-vs-rose/30'
            : 'bg-gradient-to-br from-vs-teal to-vs-feather shadow-vs-teal/30 hover:shadow-vs-feather/40 hover:scale-105'
        }`}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
}
