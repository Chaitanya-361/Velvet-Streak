import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchWeeklyStats, fetchHeatmap } from '../api/stats';
import StatsCard from '../components/StatsCard';
import AnnualHeatmap from '../components/AnnualHeatmap';
import toast from 'react-hot-toast';

export default function StatsPage() {
  const [weekly, setWeekly] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyHistory, setWeeklyHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [w, hm] = await Promise.all([
          fetchWeeklyStats(0),
          fetchHeatmap(),
        ]);
        setWeekly(w);
        setHeatmapData(hm || []);

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
    week: w.weekLabel?.replace(/\d{4}-/, ''),
    score: w.consistencyScore || 0,
  }));

  const xpTrend = weeklyHistory.map(w => ({
    week: w.weekLabel?.replace(/\d{4}-/, ''),
    xp: w.totalXP || 0,
  }));



  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="font-heading font-bold text-2xl text-vs-text">Statistics</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard icon={<Calendar className="w-5 h-5 text-vs-feather" />} label="This Week" value={`${weekly?.consistencyScore || 0}%`} subtitle={weekly?.prevScore ? `${weekly.consistencyScore >= weekly.prevScore ? '+' : ''}${weekly.consistencyScore - weekly.prevScore}% vs last week` : ''} color="text-vs-feather" />
        <StatsCard icon={<Calendar className="w-5 h-5 text-vs-emerald" />} label="Check-ins" value={weekly?.totalCheckIns || 0} color="text-vs-emerald" />
        <StatsCard icon={<TrendingUp className="w-5 h-5 text-vs-gold" />} label="Perfect Habits" value={weekly?.perfectHabits || 0} color="text-vs-gold" />
        <StatsCard icon={<Zap className="w-5 h-5 text-vs-feather" />} label="XP Earned" value={weekly?.totalXP || 0} color="text-vs-feather" />
      </div>

      {/* Per-habit breakdown */}
      {weekly?.perHabit?.length > 0 && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
          <h2 className="font-heading font-semibold text-vs-text mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-vs-feather" />Per Habit This Week</h2>
          <div className="space-y-3">
            {weekly.perHabit.map((h: any) => (
              <div key={h.habitId} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{h.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-vs-text">{h.name}</span>
                    <span className="text-xs font-mono text-vs-muted">{h.checkInsDone}/{h.checkInsExpected}</span>
                  </div>
                  <div className="h-2 bg-vs-deep rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${h.completionRate}%`, backgroundColor: h.completionRate >= 100 ? 'var(--vs-emerald)' : h.completionRate >= 50 ? 'var(--vs-gold)' : 'var(--vs-rose)' }} />
                  </div>
                </div>
                <span className="text-sm font-semibold w-12 text-right" style={{ color: h.completionRate >= 100 ? 'var(--vs-emerald)' : h.completionRate >= 50 ? 'var(--vs-gold)' : 'var(--vs-rose)' }}>{h.completionRate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {weeklyHistory.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
            <h3 className="font-heading font-semibold text-vs-text mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-vs-feather" />Consistency Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={consistencyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(77,208,225,0.1)" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#002B2E', border: '1px solid rgba(77,208,225,0.2)', borderRadius: 12, color: '#e0f2f1' }} />
                <Line type="monotone" dataKey="score" stroke="#4DD0E1" strokeWidth={2} dot={{ fill: '#4DD0E1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
            <h3 className="font-heading font-semibold text-vs-text mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-vs-gold" />XP Per Week</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={xpTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(77,208,225,0.1)" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#002B2E', border: '1px solid rgba(77,208,225,0.2)', borderRadius: 12, color: '#e0f2f1' }} />
                <Bar dataKey="xp" fill="#FFD54F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
        <h2 className="font-heading font-semibold text-vs-text mb-4">Annual Activity</h2>
        <AnnualHeatmap data={heatmapData} />
      </div>

      {/* Empty state */}
      {!weekly && weeklyHistory.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-vs-muted font-medium">No stats yet</p>
          <p className="text-sm text-vs-muted/60">Create habits and check in to see your stats</p>
        </div>
      )}
    </div>
  );
}
