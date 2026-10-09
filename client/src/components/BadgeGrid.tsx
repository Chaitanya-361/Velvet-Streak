import type { Badge } from '../types';
import AppIcon from './AppIcon';

interface BadgeGridProps {
  badges: Badge[];
}

export default function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-vs-text">Badges</h3>
        <span className="text-sm text-vs-muted">
          {badges.filter(b => b.earned).length} / {badges.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {badges.map(badge => (
          <div
            key={badge.key}
            className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              badge.earned
                ? 'hover:bg-vs-feather/10 hover:scale-105'
                : 'opacity-30 grayscale hover:opacity-50'
            }`}
            title={badge.earned ? `${badge.name} — earned ${badge.earnedAt}` : `${badge.name} — ${badge.unlockCondition}`}
          >
            <div className="w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-110">
              <AppIcon name={badge.key || badge.icon} size={32} />
            </div>
            <span className="text-[10px] text-vs-muted text-center leading-tight font-medium truncate w-full">
              {badge.name}
            </span>
            {badge.earned && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-vs-emerald flex items-center justify-center">
                <span className="text-[8px] text-white">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
