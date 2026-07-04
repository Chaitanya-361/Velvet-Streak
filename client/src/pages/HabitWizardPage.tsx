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
    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1,2,3,4,5].map(s => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all ${
              s < step ? 'bg-vs-teal text-white' : s === step ? 'bg-vs-teal text-white ring-2 ring-vs-teal ring-offset-2 ring-offset-vs-surface' : 'bg-white text-vs-muted border border-vs-border/50'
            }`}>{s < step ? <Check className="w-4 h-4" /> : s}</div>
            {s < 5 && <div className={`flex-1 h-1 rounded-full ${s < step ? 'bg-vs-teal' : 'bg-vs-border/50'}`} />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-sm p-8">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text">Basic Info</h2>
            <div>
              <label className="block text-sm font-bold text-vs-text mb-2">Habit Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Morning Run" className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal font-medium" maxLength={80} />
            </div>
            <div>
              <label className="block text-sm font-bold text-vs-text mb-3">Icon</label>
              <div className="flex flex-wrap gap-3">{ICONS.map(i => (
                <button key={i} onClick={() => update('icon', i)} className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all shadow-sm ${form.icon === i ? 'bg-white border-2 border-vs-teal scale-110' : 'bg-vs-bg border border-vs-border hover:bg-vs-surface'}`}>{i}</button>
              ))}</div>
            </div>
            <div>
              <label className="block text-sm font-bold text-vs-text mb-3">Color</label>
              <div className="flex flex-wrap gap-3">{COLORS.map(c => (
                <button key={c} onClick={() => update('color', c)} className={`w-10 h-10 rounded-full transition-all shadow-sm ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-vs-surface ring-vs-teal scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
              ))}</div>
            </div>
            <div>
              <label className="block text-sm font-bold text-vs-text mb-3">Category</label>
              <div className="grid grid-cols-3 gap-3">{CATEGORIES.map(c => (
                <button key={c} onClick={() => update('category', c)} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${form.category === c ? 'bg-vs-teal text-white' : 'bg-vs-bg text-vs-muted border border-vs-border hover:border-vs-teal/30 hover:text-vs-text'}`}>{c}</button>
              ))}</div>
            </div>
            <div>
              <label className="block text-sm font-bold text-vs-text mb-2">Description (optional)</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Why is this habit important?" rows={2} className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal resize-none font-medium" maxLength={300} />
            </div>
          </div>
        )}

        {/* Step 2: Habit Type */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text">Habit Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => update('habitType', 'binary')} className={`p-6 rounded-2xl text-left transition-all border shadow-sm ${form.habitType === 'binary' ? 'bg-vs-teal/10 border-vs-teal' : 'bg-vs-bg border-vs-border hover:border-vs-teal/30'}`}>
                <span className="text-3xl">✓</span>
                <h3 className="font-bold text-vs-text mt-3 text-lg">Done / Not Done</h3>
                <p className="text-sm font-medium text-vs-muted mt-1">Simple completion tracking</p>
              </button>
              <button onClick={() => update('habitType', 'quantitative')} className={`p-6 rounded-2xl text-left transition-all border shadow-sm ${form.habitType === 'quantitative' ? 'bg-vs-teal/10 border-vs-teal' : 'bg-vs-bg border-vs-border hover:border-vs-teal/30'}`}>
                <span className="text-3xl">📊</span>
                <h3 className="font-bold text-vs-text mt-3 text-lg">Track Amount</h3>
                <p className="text-sm font-medium text-vs-muted mt-1">Log km, pages, minutes, etc.</p>
              </button>
            </div>
            {form.habitType === 'quantitative' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in pt-2">
                <div>
                  <label className="block text-sm font-bold text-vs-text mb-2">Unit</label>
                  <input type="text" value={form.targetUnit} onChange={e => update('targetUnit', e.target.value)} placeholder="km, pages, min" className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-vs-text mb-2">Weekly Target</label>
                  <input type="number" value={form.weeklyTarget || ''} onChange={e => update('weeklyTarget', Number(e.target.value))} placeholder="25" className="w-full px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text placeholder-vs-muted focus:border-vs-teal focus:ring-1 focus:ring-vs-teal font-medium" min={1} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text">Schedule</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SCHEDULE_TYPES.map(st => (
                <button key={st.key} onClick={() => update('scheduleType', st.key)} className={`p-4 rounded-xl text-left transition-all border shadow-sm ${form.scheduleType === st.key ? 'bg-vs-teal/10 border-vs-teal' : 'bg-vs-bg border-vs-border hover:border-vs-teal/30'}`}>
                  <p className="text-sm font-bold text-vs-text">{st.label}</p>
                  <p className="text-xs font-medium text-vs-muted mt-1">{st.desc}</p>
                </button>
              ))}
            </div>
            {form.scheduleType === 'specific_days' && (
              <div className="animate-fade-in pt-2">
                <label className="block text-sm font-bold text-vs-text mb-3">Select days</label>
                <div className="flex gap-3">{DAYS.map(d => (
                  <button key={d} onClick={() => toggleDay(d)} className={`w-12 h-12 rounded-xl text-sm font-bold shadow-sm transition-all ${form.days.includes(d) ? 'bg-vs-teal text-white' : 'bg-vs-bg text-vs-muted border border-vs-border hover:border-vs-teal/30'}`}>{d.slice(0,2)}</button>
                ))}</div>
              </div>
            )}
            {form.scheduleType === 'times_per_week' && (
              <div className="animate-fade-in pt-2">
                <label className="block text-sm font-bold text-vs-text mb-2">Times per week</label>
                <input type="number" value={form.timesPerWeek} onChange={e => update('timesPerWeek', Number(e.target.value))} min={1} max={7} className="w-32 px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text focus:border-vs-teal focus:ring-1 focus:ring-vs-teal font-medium" />
              </div>
            )}
            {form.scheduleType === 'interval' && (
              <div className="animate-fade-in pt-2">
                <label className="block text-sm font-bold text-vs-text mb-2">Every N days</label>
                <input type="number" value={form.intervalDays} onChange={e => update('intervalDays', Number(e.target.value))} min={2} className="w-32 px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text focus:border-vs-teal focus:ring-1 focus:ring-vs-teal font-medium" />
              </div>
            )}
            {form.scheduleType === 'times_per_day' && (
              <div className="animate-fade-in pt-2">
                <label className="block text-sm font-bold text-vs-text mb-2">Times per day</label>
                <input type="number" value={form.timesPerDay} onChange={e => update('timesPerDay', Number(e.target.value))} min={2} max={20} className="w-32 px-4 py-3.5 rounded-xl bg-vs-bg border border-vs-border shadow-sm text-vs-text focus:border-vs-teal focus:ring-1 focus:ring-vs-teal font-medium" />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Rest Days */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text">Rest Days</h2>
            <p className="text-sm font-medium text-vs-muted">Rest days let you skip without breaking your streak.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => update('restDaysAllowed', true)} className={`p-6 rounded-2xl text-left transition-all border shadow-sm ${form.restDaysAllowed ? 'bg-vs-teal/10 border-vs-teal' : 'bg-vs-bg border-vs-border hover:border-vs-teal/30'}`}>
                <span className="text-3xl">😴</span>
                <h3 className="font-bold text-vs-text mt-3 text-lg">Allow rest days</h3>
                <p className="text-sm font-medium text-vs-muted mt-1">Skip days without penalty</p>
              </button>
              <button onClick={() => update('restDaysAllowed', false)} className={`p-6 rounded-2xl text-left transition-all border shadow-sm ${!form.restDaysAllowed ? 'bg-vs-teal/10 border-vs-teal' : 'bg-vs-bg border-vs-border hover:border-vs-teal/30'}`}>
                <span className="text-3xl">💪</span>
                <h3 className="font-bold text-vs-text mt-3 text-lg">No rest days</h3>
                <p className="text-sm font-medium text-vs-muted mt-1">Stay accountable every day</p>
              </button>
            </div>
            {form.restDaysAllowed && (
              <div className="animate-fade-in pt-2">
                <label className="block text-sm font-bold text-vs-text mb-3">Max rest days per week</label>
                <div className="flex gap-3">{[1,2,3].map(n => (
                  <button key={n} onClick={() => update('maxRestDays', n)} className={`w-14 h-14 rounded-xl font-bold shadow-sm transition-all text-lg ${form.maxRestDays === n ? 'bg-vs-teal text-white' : 'bg-vs-bg text-vs-muted border border-vs-border'}`}>{n}</button>
                ))}</div>
                <p className="text-sm font-medium text-vs-muted mt-3">You can skip up to {form.maxRestDays} day(s) per week without breaking your streak.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-vs-text flex items-center gap-3"><Sparkles className="w-6 h-6 text-vs-gold" /> Review & Create</h2>
            <div className="rounded-2xl bg-vs-bg border border-vs-border/50 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-vs-border/50 bg-white">{form.icon}</div><div><h3 className="font-bold text-vs-text text-lg">{form.name || 'Unnamed Habit'}</h3><p className="text-xs font-bold text-vs-muted uppercase tracking-wider mt-1">{form.category} · {form.habitType}</p></div></div>
              <div className="border-t border-vs-border/50 pt-4 space-y-3 text-sm font-medium">
                {form.habitType === 'quantitative' && <div className="flex justify-between"><span className="text-vs-muted font-bold">Target</span><span className="text-vs-text font-bold">{form.weeklyTarget} {form.targetUnit} / week</span></div>}
                <div className="flex justify-between"><span className="text-vs-muted font-bold">Schedule</span><span className="text-vs-text font-bold">{form.scheduleType.replace(/_/g, ' ')}{form.scheduleType === 'specific_days' ? `: ${form.days.join(', ')}` : ''}</span></div>
                <div className="flex justify-between"><span className="text-vs-muted font-bold">Rest days</span><span className="text-vs-text font-bold">{form.restDaysAllowed ? `${form.maxRestDays}/week` : 'Disabled'}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-vs-border">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="flex items-center gap-2 px-5 py-3 rounded-xl text-vs-muted hover:text-vs-text hover:bg-vs-bg text-sm font-bold transition-colors"><ArrowLeft className="w-5 h-5" />{step > 1 ? 'Back' : 'Cancel'}</button>
          {step < 5 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-vs-teal text-white text-base font-bold hover:bg-vs-teal/90 shadow-sm transition-all disabled:opacity-40">Next <ArrowRight className="w-5 h-5" /></button>
          ) : (
            <button onClick={handleCreate} disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-vs-teal text-white text-base font-bold hover:shadow-lg hover:shadow-vs-teal/30 hover:bg-vs-teal/90 transition-all disabled:opacity-50"><Sparkles className="w-5 h-5" />{loading ? 'Creating...' : 'Create Habit'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
