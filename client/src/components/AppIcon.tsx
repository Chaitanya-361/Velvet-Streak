import React from 'react';
import { Icon } from '@iconify/react';

// Pre-configured mappings from old emojis / keys to user-selected modern icons
export const ICON_MAP: Record<string, string> = {
  // Habits (20)
  '🏃': 'flat-color-icons:sports-mode',
  '🧘': 'fluent-emoji-flat:person-in-lotus-position',
  '📖': 'fluent-emoji-flat:open-book',
  '🎸': 'flat-color-icons:music',
  '💧': 'fluent-emoji-flat:droplet',
  '✍️': 'fluent-emoji-flat:writing-hand',
  '🎯': 'fluent-emoji-flat:bullseye',
  '💪': 'fluent-emoji-flat:flexed-biceps',
  '🧠': 'fluent-emoji-flat:brain',
  '🌱': 'fluent-emoji-flat:seedling',
  '🎨': 'fluent-emoji-flat:artist-palette',
  '🏋️': 'fluent-emoji-flat:person-lifting-weights',
  '🚴': 'fluent-emoji-flat:person-biking',
  '📝': 'fluent-emoji-flat:memo',
  '🍎': 'fluent-emoji-flat:red-apple',
  '💤': 'fluent-emoji-flat:zzz',
  '🧹': 'fluent-emoji-flat:broom',
  '📚': 'fluent-emoji-flat:books',
  '🎵': 'fluent-emoji-flat:musical-note',
  '☕': 'fluent-emoji-flat:hot-beverage',

  // Badges Keys & Emoji Fallbacks (17)
  'first_feather': 'fluent-emoji-flat:peacock',
  'on_fire': 'fluent-emoji-flat:fire',
  'diamond_habit': 'fluent-emoji-flat:gem-stone',
  'century': 'fluent-emoji-flat:trophy',
  'perfect_week': 'fluent-emoji-flat:sparkles',
  'perfect_month': 'fluent-emoji-flat:glowing-star',
  'rainbow': 'fluent-emoji-flat:rainbow',
  'athlete': 'fluent-emoji-flat:person-running',
  'creator': 'fluent-emoji-flat:artist-palette',
  'scholar': 'fluent-emoji-flat:open-book',
  'zen_master': 'fluent-emoji-flat:person-in-lotus-position',
  'comeback_king': 'fluent-emoji-flat:high-voltage',
  'milestone_365': 'fluent-emoji-flat:calendar',
  'todo_hero': 'fluent-emoji-flat:check-mark-button',
  'night_owl': 'fluent-emoji-flat:owl',
  'target_crusher': 'fluent-emoji-flat:bullseye',
  'overachiever': 'fluent-emoji-flat:rocket',

  // Emoji Badges
  '🦚': 'fluent-emoji-flat:peacock',
  '🔥': 'fluent-emoji-flat:fire',
  '💎': 'fluent-emoji-flat:gem-stone',
  '🏆': 'fluent-emoji-flat:trophy',
  '✨': 'fluent-emoji-flat:sparkles',
  '🌟': 'fluent-emoji-flat:glowing-star',
  '🌈': 'fluent-emoji-flat:rainbow',
  '⚡': 'fluent-emoji-flat:high-voltage',
  '📅': 'fluent-emoji-flat:calendar',
  '✅': 'fluent-emoji-flat:check-mark-button',
  '🦉': 'fluent-emoji-flat:owl',
  '🚀': 'fluent-emoji-flat:rocket',

  // UI / Priority dots
  '🔴': 'fluent-emoji-flat:red-circle',
  '🟠': 'fluent-emoji-flat:orange-circle',
  '🟡': 'fluent-emoji-flat:yellow-circle',
  '🟢': 'fluent-emoji-flat:green-circle',
  'priority_critical': 'fluent-emoji-flat:red-circle',
  'priority_high': 'fluent-emoji-flat:orange-circle',
  'priority_medium': 'fluent-emoji-flat:yellow-circle',
  'priority_low': 'fluent-emoji-flat:green-circle',

  // Stats / Brand
  '📊': 'fluent-emoji-flat:bar-chart',
  'peacock': 'fluent-emoji-flat:peacock',
  'party': 'fluent-emoji-flat:party-popper',
};

// Available icons for habit creation in HabitWizard
export const AVAILABLE_HABIT_ICONS = [
  { id: 'flat-color-icons:sports-mode', label: 'Running / Fitness' },
  { id: 'fluent-emoji-flat:person-in-lotus-position', label: 'Yoga / Meditation' },
  { id: 'fluent-emoji-flat:open-book', label: 'Reading' },
  { id: 'flat-color-icons:music', label: 'Music / Guitar' },
  { id: 'fluent-emoji-flat:droplet', label: 'Hydration' },
  { id: 'fluent-emoji-flat:writing-hand', label: 'Journaling' },
  { id: 'fluent-emoji-flat:bullseye', label: 'Focus / Target' },
  { id: 'fluent-emoji-flat:flexed-biceps', label: 'Strength' },
  { id: 'fluent-emoji-flat:brain', label: 'Mindset' },
  { id: 'fluent-emoji-flat:seedling', label: 'Growth' },
  { id: 'fluent-emoji-flat:artist-palette', label: 'Creative / Art' },
  { id: 'fluent-emoji-flat:person-lifting-weights', label: 'Gym / Weights' },
  { id: 'fluent-emoji-flat:person-biking', label: 'Cycling' },
  { id: 'fluent-emoji-flat:memo', label: 'Notes' },
  { id: 'fluent-emoji-flat:red-apple', label: 'Nutrition' },
  { id: 'fluent-emoji-flat:zzz', label: 'Sleep' },
  { id: 'fluent-emoji-flat:broom', label: 'Cleaning' },
  { id: 'fluent-emoji-flat:books', label: 'Study' },
  { id: 'fluent-emoji-flat:musical-note', label: 'Melody' },
  { id: 'fluent-emoji-flat:hot-beverage', label: 'Coffee / Routine' },
];

interface AppIconProps {
  name: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders an icon from an icon ID or transparently translates legacy emojis to new vector icons
 */
export default function AppIcon({ name, size = 24, className = '', style }: AppIconProps) {
  if (!name) return null;

  // Resolve icon ID (check direct map or treat as direct iconify icon if contains colon)
  const resolved = ICON_MAP[name] || (name.includes(':') ? name : null);

  if (resolved) {
    return (
      <Icon
        icon={resolved}
        width={size}
        height={size}
        className={`inline-block shrink-0 ${className}`}
        style={style}
      />
    );
  }

  // Fallback to plain text/emoji if no match
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: typeof size === 'number' ? `${size}px` : size, ...style }}
    >
      {name}
    </span>
  );
}
