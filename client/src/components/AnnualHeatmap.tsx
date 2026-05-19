import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfYear, getDay } from 'date-fns';
import type { HeatmapDay } from '../types';

interface AnnualHeatmapProps {
  data: HeatmapDay[];
  year?: number;
}

function getIntensityColor(count: number): string {
  if (count === 0) return 'var(--vs-surface)';
  if (count === 1) return '#00535a';
  if (count === 2) return '#006d75';
  if (count === 3) return '#00838F';
  if (count === 4) return '#26a5b0';
  return '#4DD0E1';
}

export default function AnnualHeatmap({ data, year = 2026 }: AnnualHeatmapProps) {
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(d => map.set(d.date, d.count));
    return map;
  }, [data]);

  const yearStart = startOfYear(new Date(year, 0, 1));
  const today = new Date();
  const yearEnd = today.getFullYear() === year ? today : new Date(year, 11, 31);
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Group days by week
  const weeks: { date: Date; dateStr: string; count: number; dayOfWeek: number }[][] = [];
  let currentWeek: typeof weeks[0] = [];

  allDays.forEach(day => {
    const dayOfWeek = (getDay(day) + 6) % 7; // Mon=0, Sun=6
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = dataMap.get(dateStr) || 0;

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push({ date: day, dateStr, count, dayOfWeek });
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const cellSize = 14;
  const cellGap = 3;
  const totalWidth = weeks.length * (cellSize + cellGap);

  return (
    <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
      <h3 className="font-heading font-semibold text-vs-text mb-4">Activity Map — {year}</h3>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1" style={{ minWidth: totalWidth }}>
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-2 shrink-0" style={{ paddingTop: 0 }}>
            {['M', '', 'W', '', 'F', '', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] text-vs-muted leading-none" style={{ height: cellSize }}>
                <span className="flex items-center h-full">{d}</span>
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const dayData = week.find(d => d.dayOfWeek === dayIdx);
                if (!dayData) {
                  return <div key={dayIdx} style={{ width: cellSize, height: cellSize }} />;
                }
                return (
                  <div
                    key={dayIdx}
                    className="rounded-[3px] transition-colors hover:ring-1 hover:ring-vs-feather/50 cursor-pointer"
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

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-xs text-vs-muted mr-1">Less</span>
        {[0, 1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            className="w-3 h-3 rounded-[2px]"
            style={{ backgroundColor: getIntensityColor(n) }}
          />
        ))}
        <span className="text-xs text-vs-muted ml-1">More</span>
      </div>
    </div>
  );
}
