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

  if (loading) return <div className="py-20 text-center text-vs-muted animate-fade-in"><div className="text-4xl mb-4 animate-float">🦚</div>Loading profile...</div>;

  const level = profile?.level || user?.level || 1;
  const xp = profile?.xp || user?.xp || 0;
  const totalCheckIns = profile?.totalCheckIns || 0;
  const longestStreak = profile?.longestStreak || 0;
  const earnedCount = badges.filter((b: any) => b.earned).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-vs-gold to-vs-feather mx-auto flex items-center justify-center text-5xl mb-4 shadow-lg shadow-vs-teal/20">🦚</div>
        <h1 className="font-heading font-bold text-2xl text-vs-text">{profile?.displayName || user?.displayName}</h1>
        <p className="text-sm text-vs-muted">@{profile?.username || user?.username}</p>
        {profile?.bio && <p className="text-sm text-vs-text/70 mt-2 max-w-md mx-auto">{profile.bio}</p>}
      </div>

      {/* XP */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
        <XPProgressBar currentXP={xp} levelStartXP={LEVEL_THRESHOLDS[level - 1] || 0} levelEndXP={LEVEL_THRESHOLDS[level] || 35000} level={level} title={LEVEL_TITLES[level - 1]} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: TrendingUp, label: 'Check-ins', value: totalCheckIns, color: 'text-vs-feather' },
          { icon: Flame, label: 'Best Streak', value: longestStreak, color: 'text-vs-gold' },
          { icon: Trophy, label: 'Habits', value: habits.length, color: 'text-vs-emerald' },
          { icon: Award, label: 'Badges', value: `${earnedCount}/${badges.length}`, color: 'text-vs-rose' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-vs-surface border border-vs-border p-4 text-center card-hover">
            <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
            <p className="text-xl font-heading font-bold text-vs-text">{s.value}</p>
            <p className="text-xs text-vs-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
        <h2 className="font-heading font-semibold text-vs-text mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-vs-gold" />Badges</h2>
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
        <div className="rounded-2xl bg-vs-surface border border-vs-border p-5">
          <h2 className="font-heading font-semibold text-vs-text mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-vs-feather" />Your Habits</h2>
          <div className="space-y-3">
            {habits.map((h: any) => (
              <div key={h._id} className="flex items-center gap-3 p-3 rounded-xl bg-vs-deep">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${h.color}20` }}>{h.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-vs-text">{h.name}</p>
                  <p className="text-xs text-vs-muted">{h.category} · {h.habitType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-vs-gold flex items-center gap-1"><Flame className="w-3 h-3" />{h.currentStreak}</p>
                  <p className="text-xs text-vs-muted">{h.totalCheckIns} total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
