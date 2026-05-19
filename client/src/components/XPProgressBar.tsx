interface XPProgressBarProps {
  currentXP: number;
  levelStartXP: number;
  levelEndXP: number;
  level: number;
  title: string;
  size?: 'sm' | 'lg';
}

export default function XPProgressBar({ currentXP, levelStartXP, levelEndXP, level, title, size = 'sm' }: XPProgressBarProps) {
  const progress = levelEndXP > levelStartXP
    ? ((currentXP - levelStartXP) / (levelEndXP - levelStartXP)) * 100
    : 100;

  const xpRemaining = levelEndXP - currentXP;
  const barHeight = size === 'lg' ? 'h-4' : 'h-2.5';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🦚</span>
          <span className={`font-heading font-bold text-vs-text ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
            Level {level}
          </span>
          <span className="text-vs-feather text-sm font-medium">· {title}</span>
        </div>
        <span className="text-xs font-mono text-vs-muted">
          {currentXP.toLocaleString()} / {levelEndXP.toLocaleString()} XP
        </span>
      </div>

      <div className={`${barHeight} bg-vs-deep rounded-full overflow-hidden relative`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-vs-gold via-vs-feather to-vs-teal transition-all duration-1000 relative overflow-hidden"
          style={{ width: `${Math.min(100, progress)}%` }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      <p className="text-xs text-vs-muted">
        {xpRemaining > 0 ? `${xpRemaining.toLocaleString()} XP to next level` : 'Max level reached!'}
      </p>
    </div>
  );
}
