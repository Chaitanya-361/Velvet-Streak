import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { createHabit } from '../api/habits';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fitness', 'Creative', 'Learning', 'Wellness', 'Social', 'Other'] as const;
const SCHEDULE_TYPES = [
  { key: 'daily', label: 'Every day', desc: 'No exceptions' },
  { key: 'specific_days', label: 'Specific days', desc: 'Pick your days' },
  { key: 'times_per_week', label: 'X times/week', desc: 'Flexible days' },
] as const;
const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'] as const;
const ICONS = ['🏃','🧘','📖','🎸','💧','✍️','🎯','💪','🧠','🌱','🎨','🏋️','🚴','📝','🍎','💤','🧹','📚','🎵','☕'];
const COLORS = ['#00838F','#4DD0E1','#FFD54F','#00C853','#F48FB1','#80CBC4','#FF8A65','#BA68C8','#7986CB','#A1887F'];
const TOTAL_STEPS = 4;

export default function HabitWizardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', icon: '🏃', color: '#00838F', category: 'Fitness' as string,
    description: '', habitType: 'binary' as 'binary'|'quantitative',
    targetUnit: '', weeklyTarget: 0,
    scheduleType: 'daily' as string, days: [] as string[],
    timesPerWeek: 3,
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleDay = (d: string) => update('days', form.days.includes(d) ? form.days.filter(x => x !== d) : [...form.days, d]);
  const canNext = () => {
    if (step === 1) return form.name.length >= 1;
    return true;
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createHabit({
        name: form.name,
        icon: form.icon,
        color: form.color,
        category: form.category as any,
        description: form.description,
        habitType: form.habitType as any,
        quantitative: form.habitType === 'quantitative' ? { targetUnit: form.targetUnit, weeklyTarget: form.weeklyTarget } : undefined,
        schedule: {
          type: form.scheduleType as any,
          days: form.days as any,
          timesPerWeek: form.scheduleType === 'times_per_week' ? form.timesPerWeek : undefined,
        },
      } as any);
      toast.success(`"${form.name}" created! 🦚`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all ${
              s < step ? 'bg-vs-teal text-white' : s === step ? 'bg-vs-teal text-white ring-2 ring-vs-teal ring-offset-2 ring-offset-vs-surface' : 'bg-white text-vs-muted border border-vs-border/50'
            }`}>{s < step ? <Check className="w-4 h-4" /> : s}</div>
            {s < TOTAL_STEPS && <div className={`flex-1 h-1 rounded-full ${s < step ? 'bg-vs-teal' : 'bg-vs-border/50'}`} />}
          </div>
        ))}
      </div>

      <div className="vs-card p-8">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text">Basic Info</h2>
            <div>
              <label className="vs-label">Habit Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Morning Run" className="vs-input" maxLength={80} />
            </div>
            <div>
              <label className="vs-label mb-3">Icon</label>
              <div className="flex flex-wrap gap-3">{ICONS.map(i => (
                <button key={i} onClick={() => update('icon', i)} className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all shadow-sm ${form.icon === i ? 'bg-white border-2 border-vs-teal scale-110' : 'bg-vs-bg border border-vs-border hover:bg-vs-surface'}`}>{i}</button>
              ))}</div>
            </div>
            <div>
              <label className="vs-label mb-3">Color</label>
              <div className="flex flex-wrap gap-3">{COLORS.map(c => (
                <button key={c} onClick={() => update('color', c)} className={`w-10 h-10 rounded-full transition-all shadow-sm ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-vs-surface ring-vs-teal scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
              ))}</div>
            </div>
            <div>
              <label className="vs-label mb-3">Category</label>
              <div className="grid grid-cols-3 gap-3">{CATEGORIES.map(c => (
                <button key={c} onClick={() => update('category', c)} className={`vs-chip ${form.category === c ? 'vs-chip-active' : 'vs-chip-inactive'}`}>{c}</button>
              ))}</div>
            </div>
            <div>
              <label className="vs-label">Description (optional)</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Why is this habit important?" rows={2} className="vs-input resize-none" maxLength={300} />
            </div>
          </div>
        )}

        {/* Step 2: Habit Type */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text">Habit Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => update('habitType', 'binary')} className={`vs-option-card ${form.habitType === 'binary' ? 'vs-option-card-active' : 'vs-option-card-inactive'}`}>
                <span className="text-3xl">✓</span>
                <h3 className="font-bold text-vs-text mt-3 text-lg">Done / Not Done</h3>
                <p className="text-sm font-medium text-vs-muted mt-1">Simple completion tracking</p>
              </button>
              <button onClick={() => update('habitType', 'quantitative')} className={`vs-option-card ${form.habitType === 'quantitative' ? 'vs-option-card-active' : 'vs-option-card-inactive'}`}>
                <span className="text-3xl">📊</span>
                <h3 className="font-bold text-vs-text mt-3 text-lg">Track Amount</h3>
                <p className="text-sm font-medium text-vs-muted mt-1">Log km, pages, minutes, etc.</p>
              </button>
            </div>
            {form.habitType === 'quantitative' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in pt-2">
                <div>
                  <label className="vs-label">Unit</label>
                  <input type="text" value={form.targetUnit} onChange={e => update('targetUnit', e.target.value)} placeholder="km, pages, min" className="vs-input" />
                </div>
                <div>
                  <label className="vs-label">Weekly Target</label>
                  <input type="number" value={form.weeklyTarget || ''} onChange={e => update('weeklyTarget', Number(e.target.value))} placeholder="25" className="vs-input" min={1} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text">Schedule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SCHEDULE_TYPES.map(st => (
                <button key={st.key} onClick={() => update('scheduleType', st.key)} className={`p-4 rounded-xl text-left transition-all border shadow-sm ${form.scheduleType === st.key ? 'bg-vs-teal/10 border-vs-teal' : 'bg-vs-bg border-vs-border hover:border-vs-teal/30'}`}>
                  <p className="text-sm font-bold text-vs-text">{st.label}</p>
                  <p className="text-xs font-medium text-vs-muted mt-1">{st.desc}</p>
                </button>
              ))}
            </div>
            {form.scheduleType === 'specific_days' && (
              <div className="animate-fade-in pt-2">
                <label className="vs-label mb-3">Select days</label>
                <div className="flex gap-3">{DAYS.map(d => (
                  <button key={d} onClick={() => toggleDay(d)} className={`w-12 h-12 rounded-xl text-sm font-bold shadow-sm transition-all ${form.days.includes(d) ? 'bg-vs-teal text-white' : 'bg-vs-bg text-vs-muted border border-vs-border hover:border-vs-teal/30'}`}>{d.slice(0,2)}</button>
                ))}</div>
              </div>
            )}
            {form.scheduleType === 'times_per_week' && (
              <div className="animate-fade-in pt-2">
                <label className="vs-label">Times per week</label>
                <input type="number" value={form.timesPerWeek} onChange={e => update('timesPerWeek', Number(e.target.value))} min={1} max={7} className="vs-input w-32" />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text flex items-center gap-3"><Sparkles className="w-6 h-6 text-vs-gold" /> Review & Create</h2>
            <div className="rounded-2xl bg-vs-bg border border-vs-border/50 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-vs-border/50 bg-white">{form.icon}</div><div><h3 className="font-bold text-vs-text text-lg">{form.name || 'Unnamed Habit'}</h3><p className="text-xs font-bold text-vs-muted uppercase tracking-wider mt-1">{form.category} · {form.habitType}</p></div></div>
              <div className="border-t border-vs-border/50 pt-4 space-y-3 text-sm font-medium">
                {form.habitType === 'quantitative' && <div className="flex justify-between"><span className="text-vs-muted font-bold">Target</span><span className="text-vs-text font-bold">{form.weeklyTarget} {form.targetUnit} / week</span></div>}
                <div className="flex justify-between"><span className="text-vs-muted font-bold">Schedule</span><span className="text-vs-text font-bold">{form.scheduleType.replace(/_/g, ' ')}{form.scheduleType === 'specific_days' ? `: ${form.days.join(', ')}` : ''}{form.scheduleType === 'times_per_week' ? `: ${form.timesPerWeek}x` : ''}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-vs-border">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="vs-btn-ghost flex items-center gap-2"><ArrowLeft className="w-5 h-5" />{step > 1 ? 'Back' : 'Cancel'}</button>
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="vs-btn-primary flex items-center gap-2 disabled:opacity-40">Next <ArrowRight className="w-5 h-5" /></button>
          ) : (
            <button onClick={handleCreate} disabled={loading} className="vs-btn-primary flex items-center gap-2 hover:shadow-lg hover:shadow-vs-teal/30 disabled:opacity-50"><Sparkles className="w-5 h-5" />{loading ? 'Creating...' : 'Create Habit'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
