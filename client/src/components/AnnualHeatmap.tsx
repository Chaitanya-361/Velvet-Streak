import { useMemo } from 'react';
import { format, eachDayOfInterval, getDay } from 'date-fns';
import type { HeatmapDay } from '../types';

interface AnnualHeatmapProps {
  data: HeatmapDay[];
  year?: number;
}

function getIntensityColor(count: number): string {
  if (count === 0) return 'var(--vs-surface)';
  if (count === 1) return 'rgba(103, 190, 217, 0.3)';
  if (count === 2) return 'rgba(103, 190, 217, 0.55)';
  if (count === 3) return 'rgba(103, 190, 217, 0.8)';
  return 'var(--vs-teal)';
}

export default function AnnualHeatmap({ data, year = 2026 }: AnnualHeatmapProps) {
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(d => map.set(d.date, d.count));
    return map;
  }, [data]);

  type DayData = { date: Date; dateStr: string; count: number; dayOfWeek: number; empty?: boolean };

  const monthGroups = Array.from({ length: 12 }, (_, monthIdx) => {
    const monthStart = new Date(year, monthIdx, 1);
    const monthEnd = new Date(year, monthIdx + 1, 0);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    // Pad first week
    const startDayOfWeek = getDay(monthStart);
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: monthStart, dateStr: '', count: 0, dayOfWeek: i, empty: true });
    }
    
    monthDays.forEach(day => {
      const dayOfWeek = getDay(day);
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = dataMap.get(dateStr) || 0;
      
      currentWeek.push({ date: day, dateStr, count, dayOfWeek });
      
      if (dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Pad last week
    if (currentWeek.length > 0) {
      const lastDay = getDay(monthEnd);
      for (let i = lastDay + 1; i <= 6; i++) {
        currentWeek.push({ date: monthEnd, dateStr: '', count: 0, dayOfWeek: i, empty: true });
      }
      weeks.push(currentWeek);
    }
    
    // Pad to 6 weeks so every month is exactly identical in size
    while (weeks.length < 6) {
      const emptyWeek: DayData[] = [];
      for (let i = 0; i <= 6; i++) {
        emptyWeek.push({ date: monthEnd, dateStr: '', count: 0, dayOfWeek: i, empty: true });
      }
      weeks.push(emptyWeek);
    }
    
    return {
      monthIdx,
      monthName: format(monthStart, 'MMM'),
      weeks
    };
  });

  const cellSize = 14;

  return (
    <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 w-full shadow-sm">
      <h3 className="font-heading font-semibold text-vs-text mb-6">Activity Map — {year}</h3>

      <div 
        className="overflow-x-auto pb-4 w-full [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-4 min-w-max w-full p-1">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] shrink-0 mt-[26px]">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] text-vs-muted font-medium leading-none flex items-center justify-center" style={{ height: cellSize, width: cellSize }}>
                {d}
              </div>
            ))}
          </div>

          {/* Month blocks */}
          <div className="flex gap-6 pr-4">
            {monthGroups.map((mg, mi) => (
              <div key={mi} className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-vs-muted uppercase tracking-wider h-4 flex items-center">{mg.monthName}</span>
                <div className="flex gap-1">
                  {mg.weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }, (_, dayIdx) => {
                        const dayData = week.find(d => d.dayOfWeek === dayIdx);
                        if (!dayData || dayData.empty) {
                          return <div key={dayIdx} style={{ width: cellSize, height: cellSize }} />;
                        }
                        return (
                          <div
                            key={dayIdx}
                            className="rounded-[4px] border border-vs-border transition-all hover:scale-110 hover:shadow-sm hover:border-vs-teal cursor-pointer"
                            style={{
                              width: cellSize,
                              height: cellSize,
                              backgroundColor: getIntensityColor(dayData.count),
                            }}
                            title={`${dayData.dateStr}: ${dayData.count} check-in${dayData.count !== 1 ? 's' : ''}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-vs-border/50">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-vs-muted mr-1">Less</span>
        {[0, 1, 2, 3, 4].map(n => (
          <div
            key={n}
            className="w-3.5 h-3.5 rounded-[3px] border border-vs-border"
            style={{ backgroundColor: getIntensityColor(n) }}
          />
        ))}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-vs-muted ml-1">More</span>
      </div>
    </div>
  );
}
