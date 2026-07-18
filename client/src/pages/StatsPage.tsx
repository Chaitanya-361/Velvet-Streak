import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Calendar, BarChart3, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { fetchWeeklyStats, fetchHeatmap } from '../api/stats';
import StatsCard from '../components/StatsCard';
import AnnualHeatmap from '../components/AnnualHeatmap';
import { fetchWeeklyZenTotal } from '../api/zen';
import toast from 'react-hot-toast';

function formatWeekLabel(label: string | undefined): string {
  if (!label) return '';
  const match = label.match(/^(\d{4})-W?(\d{1,2})$/);
  if (!match) return label.replace(/\d{4}-/, '');
  
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  
  const jan4 = new Date(year, 0, 4);
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - jan4.getDay()); // Sunday of week 1
  start.setDate(start.getDate() + (week - 1) * 7);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "MMM do")} - ${format(end, "do")}`;
  } else {
    return `${format(start, "MMM do")} - ${format(end, "MMM do")}`;
  }
}

export default function StatsPage() {
  const [weekly, setWeekly] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyHistory, setWeeklyHistory] = useState<any[]>([]);
  const [zenWeekTotal, setZenWeekTotal] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [w, hm, zenTotal] = await Promise.all([
          fetchWeeklyStats(0),
          fetchHeatmap(),
          fetchWeeklyZenTotal().catch(() => ({ totalSeconds: 0 })),
        ]);
        setWeekly(w);
        setHeatmapData(hm || []);
        setZenWeekTotal(zenTotal.totalSeconds || 0);

        // Load 8-week history for trend charts
        const history = [];
        for (let i = 7; i >= 0; i--) {
          try {
            const ws = await fetchWeeklyStats(i);
            history.push(ws);
          } catch { /* skip */ }
        }
        setWeeklyHistory(history);
      } catch { toast.error('Failed to load stats'); }
      finally { setLoading(false); }
    };
    loadStats();
  }, []);

  if (loading) return <div className="py-20 text-center text-vs-muted animate-fade-in"><div className="text-4xl mb-4 animate-float">📊</div>Loading stats...</div>;

  const consistencyTrend = weeklyHistory.map(w => ({
    week: formatWeekLabel(w.weekLabel),
    score: w.consistencyScore || 0,
  }));


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <h1 className="font-heading font-bold text-3xl text-vs-text">Statistics</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard icon={<Calendar className="w-5 h-5 text-vs-teal" />} label="This Week" value={`${weekly?.consistencyScore || 0}%`} subtitle={weekly?.prevScore ? `${weekly.consistencyScore >= weekly.prevScore ? '+' : ''}${weekly.consistencyScore - weekly.prevScore}% vs last week` : ''} color="#00838F" />
        <StatsCard icon={<Calendar className="w-5 h-5 text-vs-emerald" />} label="Check-ins" value={weekly?.totalCheckIns || 0} color="#10B981" />
        <StatsCard icon={<TrendingUp className="w-5 h-5 text-vs-gold" />} label="Perfect Habits" value={weekly?.perfectHabits || 0} color="#F59E0B" />
        <StatsCard icon={<Zap className="w-5 h-5 text-vs-teal" />} label="XP Earned" value={weekly?.totalXP || 0} color="#00838F" />
        <StatsCard icon={<Sparkles className="w-5 h-5 text-vs-feather" />} label="Zen Focus" value={zenWeekTotal >= 3600 ? `${Math.floor(zenWeekTotal / 3600)}h ${Math.floor((zenWeekTotal % 3600) / 60)}m` : zenWeekTotal >= 60 ? `${Math.floor(zenWeekTotal / 60)}m` : zenWeekTotal > 0 ? `${zenWeekTotal}s` : '0m'} subtitle="This week" color="#67bed9" />
      </div>

      {/* Per-habit breakdown */}
      {weekly?.perHabit?.length > 0 && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
          <h2 className="font-heading font-semibold text-vs-text text-xl mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-vs-teal" />Per Habit This Week</h2>
          <div className="space-y-4">
            {weekly.perHabit.map((h: any) => (
              <div key={h.habitId} className="flex items-center gap-4">
                <span className="text-2xl w-10 text-center bg-vs-bg rounded-xl py-1">{h.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-vs-text">{h.name}</span>
                    <span className="text-xs font-bold text-vs-muted tracking-wide">{h.checkInsDone}/{h.checkInsExpected}</span>
                  </div>
                  <div className="h-2.5 bg-vs-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${h.completionRate}%`, backgroundColor: h.completionRate >= 100 ? 'var(--vs-emerald)' : h.completionRate >= 50 ? 'var(--vs-gold)' : 'var(--vs-rose)' }} />
                  </div>
                </div>
                <span className="text-sm font-bold w-12 text-right" style={{ color: h.completionRate >= 100 ? 'var(--vs-emerald)' : h.completionRate >= 50 ? 'var(--vs-gold)' : 'var(--vs-rose)' }}>{h.completionRate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {weeklyHistory.length > 1 && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-vs-text mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-vs-teal" />Consistency Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={consistencyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#64748B" fontSize={12} tickMargin={10} />
              <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} tickMargin={10} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="score" stroke="#00838F" strokeWidth={3} dot={{ fill: '#00838F', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Heatmap */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
        <h2 className="font-heading font-semibold text-vs-text mb-6 text-xl">Annual Activity</h2>
        <AnnualHeatmap data={heatmapData} />
      </div>

      {/* Empty state */}
      {!weekly && weeklyHistory.length === 0 && (
        <div className="py-16 text-center bg-vs-surface rounded-2xl border border-vs-border shadow-sm">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-vs-text font-bold text-lg mb-1">No stats yet</p>
          <p className="text-sm text-vs-muted font-medium">Create habits and check in to see your stats</p>
        </div>
      )}
    </div>
  );
}
