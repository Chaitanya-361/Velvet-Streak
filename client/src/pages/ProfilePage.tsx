import { useState, useEffect } from 'react';
import { Flame, Trophy, Calendar, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, fetchBadges } from '../api/stats';
import { fetchHabits } from '../api/habits';
import XPProgressBar from '../components/XPProgressBar';
import BadgeGrid from '../components/BadgeGrid';
import toast from 'react-hot-toast';

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];
const LEVEL_TITLES = ['Hatchling','Fledgling','Feathered','Preening','Strutter','Plume Bearer','Iridescent','Crowned','Resplendent','Grand Peacock'];

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProfile().then(setProfile),
      fetchBadges().then(setBadges),
      fetchHabits().then(setHabits),
    ]).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-vs-muted font-medium animate-fade-in"><div className="text-4xl mb-4 animate-float">🦚</div>Loading profile...</div>;

  const level = profile?.level || user?.level || 1;
  const xp = profile?.xp || user?.xp || 0;
  const totalCheckIns = profile?.totalCheckIns || 0;
  const longestStreak = profile?.longestStreak || 0;
  const earnedCount = badges.filter((b: any) => b.earned).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-8 text-center shadow-sm">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-vs-teal/10 to-vs-feather/20 mx-auto flex items-center justify-center text-5xl mb-4 shadow-sm border border-vs-teal text-white">🦚</div>
        <h1 className="font-heading font-bold text-2xl text-vs-text">{profile?.displayName || user?.displayName}</h1>
        <p className="text-sm font-medium text-vs-muted mt-1">@{profile?.username || user?.username}</p>
        {profile?.bio && <p className="text-sm font-medium text-vs-text/80 mt-3 max-w-md mx-auto">{profile.bio}</p>}
      </div>

      {/* XP */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
        <XPProgressBar currentXP={xp} levelStartXP={LEVEL_THRESHOLDS[level - 1] || 0} levelEndXP={LEVEL_THRESHOLDS[level] || 35000} level={level} title={LEVEL_TITLES[level - 1]} size="lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Check-ins', value: totalCheckIns, color: 'text-vs-teal', bg: 'bg-vs-teal/10' },
          { icon: Flame, label: 'Best Streak', value: longestStreak, color: 'text-vs-gold', bg: 'bg-vs-gold/10' },
          { icon: Trophy, label: 'Habits', value: habits.length, color: 'text-vs-emerald', bg: 'bg-vs-emerald/10' },
          { icon: Award, label: 'Badges', value: `${earnedCount}/${badges.length}`, color: 'text-vs-rose', bg: 'bg-vs-rose/10' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-vs-surface border border-vs-border p-5 text-center shadow-sm card-hover hover:border-vs-teal/30">
            <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-heading font-bold text-vs-text">{s.value}</p>
            <p className="text-xs font-semibold text-vs-muted mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
        <h2 className="font-heading font-bold text-vs-text mb-6 flex items-center gap-2 text-xl"><Award className="w-5 h-5 text-vs-gold" />Badges</h2>
        <BadgeGrid badges={badges.map((b: any) => ({
          key: b.key,
          name: b.name,
          description: b.description,
          icon: b.icon,
          earned: b.earned,
          earnedAt: b.earnedAt,
          unlockCondition: b.unlockCondition,
        }))} />
      </div>

      {/* Habits Table */}
      {habits.length > 0 && (
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 shadow-sm">
          <h2 className="font-heading font-bold text-vs-text mb-6 flex items-center gap-2 text-xl"><Calendar className="w-5 h-5 text-vs-teal" />Your Habits</h2>
          <div className="space-y-4">
            {habits.map((h: any) => (
              <div key={h._id} className="flex items-center gap-4 p-4 rounded-xl bg-vs-bg border border-vs-border/50 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-vs-border/50 bg-white shadow-sm">{h.icon}</div>
                <div className="flex-1">
                  <p className="text-base font-bold text-vs-text mb-1">{h.name}</p>
                  <p className="text-[11px] font-bold text-vs-muted uppercase tracking-wider">{h.category} · {h.habitType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-vs-gold flex items-center justify-end gap-1"><Flame className="w-4 h-4" />{h.currentStreak}</p>
                  <p className="text-xs font-semibold text-vs-muted mt-1">{h.totalCheckIns} check-ins</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
