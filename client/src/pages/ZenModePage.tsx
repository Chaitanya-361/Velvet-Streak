import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Clock, Flame } from 'lucide-react';
import { saveZenSession, fetchWeeklyZenSessions } from '../api/zen';
import type { ZenWeeklyDay } from '../types';
import toast from 'react-hot-toast';

function formatTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds === 0) return '0m';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export default function ZenModePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [weeklyData, setWeeklyData] = useState<ZenWeeklyDay[]>([]);
  const [weekTotal, setWeekTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadWeeklyData = useCallback(async () => {
    try {
      const data = await fetchWeeklyZenSessions();
      setWeeklyData(data.days || []);
      setWeekTotal(data.weekTotalSeconds || 0);
    } catch {
      // Silently fail — data is supplementary
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeeklyData();
  }, [loadWeeklyData]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStart = () => {
    startTimeRef.current = new Date().toISOString();
    setElapsed(0);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  };

  const handleStop = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);

    const endedAt = new Date().toISOString();
    const durationSeconds = elapsed;

    if (durationSeconds < 1 || !startTimeRef.current) return;

    try {
      await saveZenSession({
        startedAt: startTimeRef.current,
        endedAt,
        durationSeconds,
      });
      toast.success(`Focus session saved — ${formatDuration(durationSeconds)}`, {
        icon: '🧘',
      });
      setElapsed(0);
      startTimeRef.current = null;
      loadWeeklyData();
    } catch {
      toast.error('Failed to save focus session');
    }
  };

  // Calculate max daily seconds for bar chart scaling
  const maxDaySeconds = Math.max(...weeklyData.map(d => d.totalSeconds), 1);
  const todayStr = new Date().toISOString().split('T')[0];

  // Progress ring calculations
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  // Show a subtle progress ring based on elapsed time (full circle at 60 min)
  const progressFraction = Math.min(elapsed / 3600, 1);
  const strokeDashoffset = circumference * (1 - progressFraction);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <h1 className="font-heading font-bold text-3xl text-vs-text mb-4">Zen Mode</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Stopwatch Area */}
        <div className="flex-1">
          <div className="rounded-3xl bg-vs-surface border border-vs-border shadow-sm p-6 lg:p-8 flex flex-col items-center relative overflow-hidden">
            {/* Ambient background glow when active */}
            {isRunning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.07] animate-pulse-glow"
                  style={{ background: 'radial-gradient(circle, var(--vs-teal), transparent 70%)' }}
                />
              </div>
            )}

            {/* Status label */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 transition-all duration-500 ${
              isRunning
                ? 'bg-vs-teal/10 text-vs-teal border border-vs-teal/20'
                : 'bg-vs-surface-hover text-vs-muted border border-vs-border'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-vs-teal animate-pulse' : 'bg-vs-muted/40'}`} />
              {isRunning ? 'Focusing...' : 'Ready to focus'}
            </div>

            {/* Circular timer */}
            <div className="relative mb-6">
              <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx="120" cy="120" r={radius}
                  fill="none"
                  stroke="var(--vs-border)"
                  strokeWidth="5"
                />
                {/* Progress ring */}
                <circle
                  cx="120" cy="120" r={radius}
                  fill="none"
                  stroke="var(--vs-teal)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                  style={{ opacity: isRunning || elapsed > 0 ? 1 : 0.15 }}
                />
                {/* Glow effect when running */}
                {isRunning && (
                  <circle
                    cx="120" cy="120" r={radius}
                    fill="none"
                    stroke="var(--vs-teal)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                    style={{ opacity: 0.15, filter: 'blur(8px)' }}
                  />
                )}
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-4xl lg:text-5xl font-bold text-vs-text tracking-tight tabular-nums">
                  {formatTime(elapsed)}
                </span>
                {isRunning && elapsed > 0 && (
                  <span className="text-sm text-vs-muted font-medium mt-2 animate-fade-in">
                    {formatDuration(elapsed)} of focus
                  </span>
                )}
              </div>
            </div>

            {/* Start/Stop button */}
            <button
              onClick={isRunning ? handleStop : handleStart}
              className={`group flex items-center gap-3 px-8 py-3 rounded-2xl text-base font-bold transition-all duration-300 shadow-lg ${
                isRunning
                  ? 'bg-vs-rose text-white shadow-vs-rose/25 hover:shadow-vs-rose/40 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-vs-teal text-white shadow-vs-teal/25 hover:shadow-vs-teal/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  Stop Focus
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Start Focus
                </>
              )}
            </button>

          </div>
        </div>

        {/* Side Panel — Weekly Breakdown */}
        <div className="lg:w-80 shrink-0">
          <div className="rounded-3xl bg-vs-surface border border-vs-border shadow-sm p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-vs-teal/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-vs-teal" />
              </div>
              <h2 className="font-heading font-bold text-vs-text text-lg">This Week</h2>
            </div>

            {loading ? (
              <div className="py-10 text-center text-vs-muted text-sm animate-fade-in">
                <div className="text-2xl mb-2 animate-float">🧘</div>
                Loading...
              </div>
            ) : (
              <>
                {/* Daily bars */}
                <div className="space-y-3 mb-6">
                  {weeklyData.map((day) => {
                    const isToday = day.date === todayStr;
                    const barWidth = maxDaySeconds > 0 ? Math.max((day.totalSeconds / maxDaySeconds) * 100, day.totalSeconds > 0 ? 8 : 0) : 0;

                    return (
                      <div key={day.date} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            isToday ? 'text-vs-teal' : 'text-vs-muted'
                          }`}>
                            {day.label}
                            {isToday && (
                              <span className="ml-1.5 text-[10px] bg-vs-teal/10 text-vs-teal px-1.5 py-0.5 rounded-full font-semibold normal-case">
                                today
                              </span>
                            )}
                          </span>
                          <span className={`text-xs font-semibold ${
                            day.totalSeconds > 0 ? 'text-vs-text' : 'text-vs-muted/40'
                          }`}>
                            {day.totalSeconds > 0 ? formatDuration(day.totalSeconds) : '—'}
                          </span>
                        </div>
                        <div className="h-2 bg-vs-border/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              isToday ? 'bg-vs-teal' : 'bg-vs-teal/60'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Week total */}
                <div className="border-t border-vs-border pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-vs-teal" />
                      <span className="text-sm font-semibold text-vs-muted">Week Total</span>
                    </div>
                    <span className="text-lg font-heading font-bold text-vs-text">
                      {formatDuration(weekTotal)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
