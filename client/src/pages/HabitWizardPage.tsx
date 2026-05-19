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
  { key: 'interval', label: 'Every N days', desc: 'Interval-based' },
  { key: 'times_per_day', label: 'Multiple/day', desc: 'Several sessions' },
  { key: 'times_per_month', label: 'X times/month', desc: 'Monthly target' },
] as const;
const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'] as const;
const ICONS = ['🏃','🧘','📖','🎸','💧','✍️','🎯','💪','🧠','🌱','🎨','🏋️','🚴','📝','🍎','💤','🧹','📚','🎵','☕'];
const COLORS = ['#00838F','#4DD0E1','#FFD54F','#00C853','#F48FB1','#80CBC4','#FF8A65','#BA68C8','#7986CB','#A1887F'];

export default function HabitWizardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', icon: '🏃', color: '#00838F', category: 'Fitness' as string,
    description: '', habitType: 'binary' as 'binary'|'quantitative',
    targetUnit: '', weeklyTarget: 0,
    scheduleType: 'daily' as string, days: [] as string[],
    timesPerDay: 1, timesPerWeek: 3, timesPerMonth: 5, intervalDays: 7,
    restDaysAllowed: false, maxRestDays: 1,
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
          timesPerDay: form.timesPerDay,
          timeWindows: [],
          intervalDays: form.scheduleType === 'interval' ? form.intervalDays : null,
          timesPerWeek: form.scheduleType === 'times_per_week' ? form.timesPerWeek : null,
          timesPerMonth: form.scheduleType === 'times_per_month' ? form.timesPerMonth : null,
        },
        restDayConfig: {
          allowed: form.restDaysAllowed,
          maxPerWeek: form.restDaysAllowed ? form.maxRestDays : null,
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
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1,2,3,4,5].map(s => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s < step ? 'bg-vs-emerald text-white' : s === step ? 'bg-vs-teal text-white' : 'bg-vs-surface text-vs-muted border border-vs-border'
            }`}>{s < step ? <Check className="w-4 h-4" /> : s}</div>
            {s < 5 && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-vs-emerald' : 'bg-vs-border'}`} />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-vs-surface border border-vs-border p-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-heading font-bold text-xl text-vs-text">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium text-vs-text mb-1.5">Habit Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Morning Run" className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text placeholder-vs-muted/50 focus:border-vs-feather focus:ring-1 focus:ring-vs-feather" maxLength={80} />
            </div>
            <div>
              <label className="block text-sm font-medium text-vs-text mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">{ICONS.map(i => (
                <button key={i} onClick={() => update('icon', i)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === i ? 'bg-vs-teal/20 ring-2 ring-vs-feather scale-110' : 'bg-vs-deep hover:bg-vs-surface-hover'}`}>{i}</button>
              ))}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-vs-text mb-2">Color</label>
              <div className="flex flex-wrap gap-2">{COLORS.map(c => (
                <button key={c} onClick={() => update('color', c)} className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
              ))}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-vs-text mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">{CATEGORIES.map(c => (
                <button key={c} onClick={() => update('category', c)} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${form.category === c ? 'bg-vs-teal/20 text-vs-feather border-vs-feather border' : 'bg-vs-deep text-vs-muted border border-vs-border hover:border-vs-feather/30'}`}>{c}</button>
              ))}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-vs-text mb-1.5">Description (optional)</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Why is this habit important?" rows={2} className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text placeholder-vs-muted/50 focus:border-vs-feather focus:ring-1 focus:ring-vs-feather resize-none" maxLength={300} />
            </div>
          </div>
        )}

        {/* Step 2: Habit Type */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-heading font-bold text-xl text-vs-text">Habit Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => update('habitType', 'binary')} className={`p-5 rounded-2xl text-left transition-all border ${form.habitType === 'binary' ? 'bg-vs-teal/10 border-vs-feather' : 'bg-vs-deep border-vs-border hover:border-vs-feather/30'}`}>
                <span className="text-2xl">✓</span>
                <h3 className="font-semibold text-vs-text mt-2">Done / Not Done</h3>
                <p className="text-xs text-vs-muted mt-1">Simple completion tracking</p>
              </button>
              <button onClick={() => update('habitType', 'quantitative')} className={`p-5 rounded-2xl text-left transition-all border ${form.habitType === 'quantitative' ? 'bg-vs-teal/10 border-vs-feather' : 'bg-vs-deep border-vs-border hover:border-vs-feather/30'}`}>
                <span className="text-2xl">📊</span>
                <h3 className="font-semibold text-vs-text mt-2">Track Amount</h3>
                <p className="text-xs text-vs-muted mt-1">Log km, pages, minutes, etc.</p>
              </button>
            </div>
            {form.habitType === 'quantitative' && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-vs-text mb-1.5">Unit</label>
                  <input type="text" value={form.targetUnit} onChange={e => update('targetUnit', e.target.value)} placeholder="km, pages, min" className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text placeholder-vs-muted/50 focus:border-vs-feather focus:ring-1 focus:ring-vs-feather" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vs-text mb-1.5">Weekly Target</label>
                  <input type="number" value={form.weeklyTarget || ''} onChange={e => update('weeklyTarget', Number(e.target.value))} placeholder="25" className="w-full px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text placeholder-vs-muted/50 focus:border-vs-feather focus:ring-1 focus:ring-vs-feather" min={1} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-heading font-bold text-xl text-vs-text">Schedule</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCHEDULE_TYPES.map(st => (
                <button key={st.key} onClick={() => update('scheduleType', st.key)} className={`p-3 rounded-xl text-left transition-all border ${form.scheduleType === st.key ? 'bg-vs-teal/10 border-vs-feather' : 'bg-vs-deep border-vs-border hover:border-vs-feather/30'}`}>
                  <p className="text-sm font-medium text-vs-text">{st.label}</p>
                  <p className="text-xs text-vs-muted">{st.desc}</p>
                </button>
              ))}
            </div>
            {form.scheduleType === 'specific_days' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-vs-text mb-2">Select days</label>
                <div className="flex gap-2">{DAYS.map(d => (
                  <button key={d} onClick={() => toggleDay(d)} className={`w-11 h-11 rounded-xl text-xs font-semibold transition-all ${form.days.includes(d) ? 'bg-vs-teal text-white' : 'bg-vs-deep text-vs-muted border border-vs-border hover:border-vs-feather/30'}`}>{d.slice(0,2)}</button>
                ))}</div>
              </div>
            )}
            {form.scheduleType === 'times_per_week' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-vs-text mb-1.5">Times per week</label>
                <input type="number" value={form.timesPerWeek} onChange={e => update('timesPerWeek', Number(e.target.value))} min={1} max={7} className="w-32 px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text focus:border-vs-feather focus:ring-1 focus:ring-vs-feather" />
              </div>
            )}
            {form.scheduleType === 'interval' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-vs-text mb-1.5">Every N days</label>
                <input type="number" value={form.intervalDays} onChange={e => update('intervalDays', Number(e.target.value))} min={2} className="w-32 px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text focus:border-vs-feather focus:ring-1 focus:ring-vs-feather" />
              </div>
            )}
            {form.scheduleType === 'times_per_day' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-vs-text mb-1.5">Times per day</label>
                <input type="number" value={form.timesPerDay} onChange={e => update('timesPerDay', Number(e.target.value))} min={2} max={20} className="w-32 px-4 py-3 rounded-xl bg-vs-deep border border-vs-border text-vs-text focus:border-vs-feather focus:ring-1 focus:ring-vs-feather" />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Rest Days */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-heading font-bold text-xl text-vs-text">Rest Days</h2>
            <p className="text-sm text-vs-muted">Rest days let you skip without breaking your streak.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => update('restDaysAllowed', true)} className={`p-5 rounded-2xl text-left transition-all border ${form.restDaysAllowed ? 'bg-vs-teal/10 border-vs-feather' : 'bg-vs-deep border-vs-border hover:border-vs-feather/30'}`}>
                <span className="text-2xl">😴</span>
                <h3 className="font-semibold text-vs-text mt-2">Allow rest days</h3>
                <p className="text-xs text-vs-muted mt-1">Skip days without penalty</p>
              </button>
              <button onClick={() => update('restDaysAllowed', false)} className={`p-5 rounded-2xl text-left transition-all border ${!form.restDaysAllowed ? 'bg-vs-teal/10 border-vs-feather' : 'bg-vs-deep border-vs-border hover:border-vs-feather/30'}`}>
                <span className="text-2xl">💪</span>
                <h3 className="font-semibold text-vs-text mt-2">No rest days</h3>
                <p className="text-xs text-vs-muted mt-1">Stay accountable every day</p>
              </button>
            </div>
            {form.restDaysAllowed && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-vs-text mb-2">Max rest days per week</label>
                <div className="flex gap-2">{[1,2,3].map(n => (
                  <button key={n} onClick={() => update('maxRestDays', n)} className={`w-12 h-12 rounded-xl font-bold transition-all ${form.maxRestDays === n ? 'bg-vs-teal text-white' : 'bg-vs-deep text-vs-muted border border-vs-border'}`}>{n}</button>
                ))}</div>
                <p className="text-xs text-vs-muted mt-2">You can skip up to {form.maxRestDays} day(s) per week without breaking your streak.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="font-heading font-bold text-xl text-vs-text flex items-center gap-2"><Sparkles className="w-5 h-5 text-vs-gold" /> Review & Create</h2>
            <div className="rounded-xl bg-vs-deep p-5 space-y-3">
              <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${form.color}20` }}>{form.icon}</div><div><h3 className="font-semibold text-vs-text">{form.name || 'Unnamed Habit'}</h3><p className="text-xs text-vs-muted">{form.category} · {form.habitType}</p></div></div>
              <div className="border-t border-vs-border pt-3 space-y-2 text-sm">
                {form.habitType === 'quantitative' && <div className="flex justify-between"><span className="text-vs-muted">Target</span><span className="text-vs-text">{form.weeklyTarget} {form.targetUnit} / week</span></div>}
                <div className="flex justify-between"><span className="text-vs-muted">Schedule</span><span className="text-vs-text">{form.scheduleType.replace(/_/g, ' ')}{form.scheduleType === 'specific_days' ? `: ${form.days.join(', ')}` : ''}</span></div>
                <div className="flex justify-between"><span className="text-vs-muted">Rest days</span><span className="text-vs-text">{form.restDaysAllowed ? `${form.maxRestDays}/week` : 'Disabled'}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-vs-border">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-vs-muted hover:text-vs-text text-sm font-medium transition-colors"><ArrowLeft className="w-4 h-4" />{step > 1 ? 'Back' : 'Cancel'}</button>
          {step < 5 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-vs-teal text-white text-sm font-semibold hover:bg-vs-teal/90 transition-all disabled:opacity-40">Next <ArrowRight className="w-4 h-4" /></button>
          ) : (
            <button onClick={handleCreate} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-vs-teal to-vs-feather text-white text-sm font-semibold hover:shadow-lg hover:shadow-vs-teal/30 transition-all disabled:opacity-50"><Sparkles className="w-4 h-4" />{loading ? 'Creating...' : 'Create Habit'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
