import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, CheckCircle, Circle, ListChecks } from 'lucide-react';
import { fetchTodos, createTodo, deleteTodo, toggleTodoComplete, toggleSubtask } from '../api/todos';
import toast from 'react-hot-toast';

type Tab = 'today' | 'upcoming' | 'all' | 'completed';

export default function TodoPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>('today');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: '', deadline: '', priority: 'medium', category: '' });

  const loadTodos = async () => {
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch { toast.error('Failed to load todos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTodos(); }, []);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = todos.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    switch (tab) {
      case 'today': return !t.isCompleted && t.deadline.slice(0, 10) <= today;
      case 'upcoming': return !t.isCompleted && t.deadline.slice(0, 10) > today;
      case 'completed': return t.isCompleted;
      default: return true;
    }
  });

  const overdue = filtered.filter(t => !t.isCompleted && t.deadline.slice(0, 10) < today);
  const due = filtered.filter(t => !t.isCompleted && t.deadline.slice(0, 10) >= today);
  const completed = filtered.filter(t => t.isCompleted);

  const handleAdd = async () => {
    if (!newTodo.title || !newTodo.deadline) { toast.error('Title and deadline required'); return; }
    try {
      await createTodo({ ...newTodo, deadline: new Date(newTodo.deadline).toISOString() } as any);
      toast.success('Task added!');
      setNewTodo({ title: '', deadline: '', priority: 'medium', category: '' });
      setShowAdd(false);
      loadTodos();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleToggle = async (id: string) => {
    try { await toggleTodoComplete(id); loadTodos(); } catch { toast.error('Failed to toggle'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteTodo(id); toast.success('Deleted'); loadTodos(); } catch { toast.error('Failed to delete'); }
  };

  const handleSubtask = async (todoId: string, subtaskId: string) => {
    try { await toggleSubtask(todoId, subtaskId); loadTodos(); } catch { toast.error('Failed'); }
  };

  const priorityColors: Record<string, string> = { critical: 'text-vs-rose border-vs-rose', high: 'text-vs-gold border-vs-gold', medium: 'text-amber-400 border-amber-400', low: 'text-vs-emerald border-vs-emerald' };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'all', label: 'All Tasks' },
    { key: 'completed', label: 'Completed' },
  ];

  if (loading) return <div className="py-20 text-center text-vs-muted">Loading todos...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-vs-text">To-Do</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-vs-teal to-vs-feather text-white text-sm font-semibold hover:shadow-lg hover:shadow-vs-teal/30 transition-all">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-vs-surface border border-vs-border p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-vs-teal/20 text-vs-feather' : 'text-vs-muted hover:text-vs-text'}`}>{t.label}</button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vs-muted" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-vs-surface border border-vs-border text-vs-text placeholder-vs-muted/50 focus:border-vs-feather focus:ring-1 focus:ring-vs-feather" />
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div className="rounded-2xl bg-vs-surface border border-vs-feather/30 p-5 space-y-4 animate-fade-in">
          <h3 className="font-heading font-semibold text-vs-text">New Task</h3>
          <input type="text" value={newTodo.title} onChange={e => setNewTodo(p => ({ ...p, title: e.target.value }))} placeholder="Task title" className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text placeholder-vs-muted/50 focus:border-vs-feather" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={newTodo.deadline} onChange={e => setNewTodo(p => ({ ...p, deadline: e.target.value }))} className="px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text focus:border-vs-feather" />
            <select value={newTodo.priority} onChange={e => setNewTodo(p => ({ ...p, priority: e.target.value }))} className="px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text focus:border-vs-feather">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm text-vs-muted hover:text-vs-text">Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 rounded-xl bg-vs-teal text-white text-sm font-semibold">Add</button>
          </div>
        </div>
      )}

      {/* Task Lists */}
      {overdue.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-vs-rose mb-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-vs-rose" />Overdue ({overdue.length})</h2>
          <div className="space-y-2">{overdue.map(t => <TodoItem key={t._id} todo={t} onToggle={handleToggle} onDelete={handleDelete} onSubtask={handleSubtask} priorityColors={priorityColors} />)}</div>
        </section>
      )}

      {due.length > 0 && (
        <section>
          <div className="space-y-2">{due.map(t => <TodoItem key={t._id} todo={t} onToggle={handleToggle} onDelete={handleDelete} onSubtask={handleSubtask} priorityColors={priorityColors} />)}</div>
        </section>
      )}

      {completed.length > 0 && tab !== 'today' && tab !== 'upcoming' && (
        <section>
          <div className="space-y-2">{completed.map(t => <TodoItem key={t._id} todo={t} onToggle={handleToggle} onDelete={handleDelete} onSubtask={handleSubtask} priorityColors={priorityColors} />)}</div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center"><ListChecks className="w-12 h-12 text-vs-muted/30 mx-auto mb-3" /><p className="text-vs-muted font-medium">No tasks here</p><p className="text-sm text-vs-muted/60">Add a task to get started</p></div>
      )}
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, onSubtask, priorityColors }: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-2xl bg-vs-surface border transition-all card-hover ${todo.isCompleted ? 'border-vs-border/50 opacity-60' : 'border-vs-border'}`}>
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => onToggle(todo._id)} className="shrink-0">
          {todo.isCompleted ? <CheckCircle className="w-6 h-6 text-vs-emerald" /> : <Circle className="w-6 h-6 text-vs-muted hover:text-vs-feather transition-colors" />}
        </button>
        <div className="flex-1 min-w-0" onClick={() => todo.subtasks?.length > 0 && setExpanded(!expanded)}>
          <p className={`font-medium ${todo.isCompleted ? 'line-through text-vs-muted' : 'text-vs-text'}`}>{todo.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[todo.priority] || 'text-vs-muted border-vs-border'}`}>{todo.priority}</span>
            {todo.category && <span className="text-xs text-vs-muted">{todo.category}</span>}
          </div>
        </div>
        <button onClick={() => onDelete(todo._id)} className="p-1.5 text-vs-muted hover:text-vs-rose transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
      {expanded && todo.subtasks?.length > 0 && (
        <div className="px-4 pb-4 pt-0 border-t border-vs-border/50 mt-0 space-y-2">
          {todo.subtasks.map((s: any) => (
            <button key={s.id} onClick={() => onSubtask(todo._id, s.id)} className="flex items-center gap-2 w-full text-left text-sm">
              {s.isCompleted ? <CheckCircle className="w-4 h-4 text-vs-emerald shrink-0" /> : <Circle className="w-4 h-4 text-vs-muted shrink-0" />}
              <span className={s.isCompleted ? 'line-through text-vs-muted' : 'text-vs-text'}>{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
