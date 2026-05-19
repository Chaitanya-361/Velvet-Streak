import { useState } from 'react';
import { Check, Clock, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { Todo } from '../types';

interface TodoCardProps {
  todo: Todo;
}

const priorityConfig = {
  critical: { color: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-400', label: '🔴 Critical', pulse: true },
  high:     { color: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', label: '🟠 High', pulse: false },
  medium:   { color: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: '🟡 Medium', pulse: false },
  low:      { color: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400', label: '🟢 Low', pulse: false },
};

function getRelativeDeadline(deadline: string): { text: string; isOverdue: boolean } {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`, isOverdue: true };
  if (diffDays === 0) return { text: 'Due today', isOverdue: false };
  if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false };
  return { text: `Due in ${diffDays} days`, isOverdue: false };
}

export default function TodoCard({ todo }: TodoCardProps) {
  const [completed, setCompleted] = useState(todo.isCompleted);
  const [expanded, setExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState(todo.subtasks);
  const config = priorityConfig[todo.priority];
  const { text: deadlineText, isOverdue } = getRelativeDeadline(todo.deadline);

  const toggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s));
  };

  const completedSubtasks = subtasks.filter(s => s.isCompleted).length;

  return (
    <div
      className={`rounded-2xl border-l-4 bg-vs-surface border border-vs-border transition-all duration-300 ${config.color} ${
        completed ? 'opacity-50' : ''
      } ${config.pulse && !completed ? 'animate-pulse-glow' : ''}`}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => setCompleted(!completed)}
          className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            completed
              ? 'bg-vs-emerald border-vs-emerald text-white'
              : 'border-vs-border hover:border-vs-feather'
          }`}
        >
          {completed && <Check className="w-4 h-4 animate-scale-in" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-vs-text ${completed ? 'line-through text-vs-muted' : ''}`}>
            {todo.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text} font-medium`}>
              {config.label}
            </span>
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-vs-muted'}`}>
              {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {deadlineText}
            </span>
            {todo.category && (
              <span className="text-xs text-vs-muted/70 px-2 py-0.5 rounded-full bg-vs-deep/50">{todo.category}</span>
            )}
            {subtasks.length > 0 && (
              <span className="text-xs text-vs-muted">{completedSubtasks}/{subtasks.length} subtasks</span>
            )}
          </div>

          {/* Expanded section */}
          {expanded && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {todo.description && (
                <p className="text-sm text-vs-muted">{todo.description}</p>
              )}
              {subtasks.length > 0 && (
                <div className="space-y-1.5 pl-1">
                  {subtasks.map(st => (
                    <label key={st.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={st.isCompleted}
                        onChange={() => toggleSubtask(st.id)}
                        className="w-4 h-4 rounded border-vs-border bg-vs-deep text-vs-feather focus:ring-vs-feather"
                      />
                      <span className={`text-sm ${st.isCompleted ? 'line-through text-vs-muted' : 'text-vs-text'}`}>
                        {st.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {(todo.description || subtasks.length > 0) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-vs-muted hover:text-vs-feather hover:bg-vs-feather/10 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <button className="p-1.5 rounded-lg text-vs-muted/50 hover:text-vs-rose hover:bg-vs-rose/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
