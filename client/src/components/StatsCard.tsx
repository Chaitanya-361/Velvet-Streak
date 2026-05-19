import type { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'same';
  trendValue?: string;
  color?: string;
}

export default function StatsCard({ icon, label, value, subtitle, trend, trendValue, color }: StatsCardProps) {
  return (
    <div className="rounded-2xl bg-vs-surface border border-vs-border p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color ? `${color}20` : 'var(--vs-teal)20' }}
        >
          {icon}
        </div>
        {trend && trendValue && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-vs-emerald/10 text-vs-emerald' :
            trend === 'down' ? 'bg-vs-rose/10 text-vs-rose' :
            'bg-vs-muted/10 text-vs-muted'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '='} {trendValue}
          </span>
        )}
      </div>
      <p className="text-2xl font-heading font-bold text-vs-text">{value}</p>
      <p className="text-sm text-vs-muted mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-vs-muted/70 mt-1">{subtitle}</p>}
    </div>
  );
}
