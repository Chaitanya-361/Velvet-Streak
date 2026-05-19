# 🦚 Velvet Streak
## *Keep track of your streaks*
### Product Requirements Document (PRD)
**Version:** 4.0
**Date:** May 2026
**Status:** Draft
**Changes from v3:** Infrastructure simplified for student/portfolio build. All product features unchanged.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Users](#3-target-users)
4. [Tech Stack & Architecture](#4-tech-stack--architecture)
5. [Design Language — Peacock Theme](#5-design-language--peacock-theme)
6. [App Navigation & Page Structure](#6-app-navigation--page-structure)
7. [User Authentication & Accounts](#7-user-authentication--accounts)
8. [Day Boundary System](#8-day-boundary-system)
9. [Habit Management](#9-habit-management)
10. [Habit Types](#10-habit-types)
11. [Habit Scheduling System](#11-habit-scheduling-system)
12. [Rest Days](#12-rest-days)
13. [Habit Tracking & Check-In](#13-habit-tracking--check-in)
14. [Statistics & Analytics](#14-statistics--analytics)
15. [Calendar View & Streaks](#15-calendar-view--streaks)
16. [Gamification & Experience System](#16-gamification--experience-system)
17. [User Profile Page](#17-user-profile-page)
18. [To-Do List Module](#18-to-do-list-module)
19. [API Design](#19-api-design)
20. [Database Schema](#20-database-schema)
21. [Non-Functional Requirements](#21-non-functional-requirements)
22. [Milestones & Roadmap](#22-milestones--roadmap)
23. [Android App — v2 Scope](#23-android-app--v2-scope)

---

## 1. Executive Summary

**Velvet Streak** is a full-stack habit and productivity tracking web app that helps users build rock-solid streaks, track their habits with complete scheduling flexibility, visualize their progress through rich analytics, and manage their tasks — all inside a vibrant, motivating peacock-themed UI.

Users earn **XP (Experience Points)**, level up through 10 peacock-themed tiers (each with a distinct evolving avatar), unlock badges, and are motivated by streaks, weekly/monthly analytics, and personalized encouragement. Habits can be either a simple **done/not-done** check or a **quantitative tracker** with a weekly target (e.g., running kilometres, pages read). The app is split into clean, dedicated pages: Home (habits), Stats, To-Do, and Profile.

**v1 delivers** the complete web application (React + Node.js + MongoDB), deployed for free using Vercel (frontend) and Render (backend). **v2 adds** an Android app (React Native/Expo) with full feature parity.

---

## 2. Product Vision & Goals

### Vision
*"Keep track of your streaks — every day counts, every streak matters."*

### Primary Goals
- Give users complete flexibility in scheduling habits (daily, weekly, specific days, intervals, multiple times a day, etc.)
- Support two distinct habit types: binary (done/not done) and quantitative (progress toward a weekly target)
- Show meaningful, motivating statistics weekly and monthly
- Reward consistency through a gamified XP and leveling system with an evolving peacock avatar
- Provide a clean, dedicated To-Do module with priority and deadline management
- Sync seamlessly across devices via a unified backend

### Success Metrics
- DAU/MAU ratio > 40%
- Average streak length > 7 days within 30 days of signup
- 70%+ of users complete at least one habit check-in within 24 hours of signup
- To-Do task completion rate > 60%

---

## 3. Target Users

| Persona | Description |
|---|---|
| **The Self-Improver** | Tracks fitness, reading, meditation — wants consistency and accountability |
| **The Creative** | Journaling, painting, music practice — needs flexible, non-rigid schedules |
| **The Planner** | Relies heavily on the To-Do module alongside habits |
| **The Competitor** | Motivated by XP, levels, badges, and the evolving peacock avatar |
| **The Casual User** | Wants a lightweight tracker without overwhelm |

---

## 4. Tech Stack & Architecture

### Simplification Philosophy

This is a portfolio/resume project. The stack is chosen to minimise setup friction and running cost while delivering every product feature. All hosted services used in v1 have free tiers that require no credit card or have a clear free path. Complexity that exists purely for enterprise scale (Redis, Docker, GitHub Actions pipelines, Sentry, OAuth providers) is deferred to v2 or dropped entirely.

### Frontend — Web (v1)

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18+ (with Vite) | |
| State Management | Redux Toolkit + RTK Query | |
| Styling | Tailwind CSS + custom CSS variables (peacock theme) | |
| Charts | Recharts | |
| Calendar | Custom-built calendar component | |
| Date utilities | date-fns (with timezone support) | |
| Forms | React Hook Form + Zod (validation) | |
| Routing | React Router v6 | |
| Toast Notifications | react-hot-toast | |
| Auth token storage | HTTP-only cookies (secure) | |

### Backend (v1)

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js 20+ | |
| Framework | Express.js | |
| Database | MongoDB Atlas | M0 free tier — no credit card |
| ODM | Mongoose | |
| Authentication | JWT + Refresh tokens (HTTP-only cookies) | Email/password only in v1 |
| Email (transactional only) | Nodemailer + Gmail App Password | Free, no account setup beyond Gmail; used for account verification and password reset only |
| Scheduling / Cron | node-cron | Streak evaluation, day-boundary resets |
| Validation | Zod | |
| Rate Limiting | express-rate-limit | In-memory; no Redis needed |
| Logging | Winston + Morgan | Console + file output; no external service |

> **Authentication note:** Google OAuth is **not included in v1**. Email + password registration is the only login method. OAuth adds significant setup complexity (Google Cloud Console project, callback URL registration, Passport.js configuration) that is not justified for a portfolio build. It can be added cleanly in v2.

> **Email note:** Nodemailer with a Gmail App Password replaces SendGrid. No third-party email account needed — just enable App Passwords on an existing Gmail account and paste the credentials into your `.env`. This covers account verification and password reset only. No weekly digests or notification emails.

### DevOps & Infrastructure (v1 — simplified)

| Component | Technology | Cost | Notes |
|---|---|---|---|
| Hosting (Frontend) | Vercel | Free | Connect GitHub repo; auto-deploys on every `git push` to `main` |
| Hosting (API) | Render | Free | Connect GitHub repo; auto-deploys on every `git push` to `main` |
| Database | MongoDB Atlas | Free (M0) | No credit card required |
| Keep-alive | UptimeRobot | Free | Pings the Render API every 5 minutes to prevent free-tier spin-down |
| Error visibility | Winston logs | Free | Server logs visible in the Render dashboard |

> **Deployment is just `git push`.**  Both Vercel and Render connect directly to your GitHub repository. Every push to `main` triggers an automatic build and deploy — no CLI tools, no Docker, no CI/CD pipeline to configure.

> **Render free tier note:** Render's free web service spins down after 15 minutes of inactivity, causing a cold start (~30 seconds) on the next request. For a portfolio/demo, configure a free UptimeRobot monitor to ping your API's `/health` endpoint every 5 minutes. This keeps the instance warm at zero cost.

### Architecture Overview (v1)

```
[React Web App (Vercel)]
         │
         │  HTTPS (REST + HTTP-only cookies)
         ▼
[Node.js / Express API (Render — free tier)]
         │
    ┌────┴────┐
    ▼         ▼
[MongoDB    [Gmail via
 Atlas]      Nodemailer]
 (M0 free)   (verification +
              password reset)
```

### Project Structure (v1)

```
velvet-streak/
├── client/          # React 18 + Vite web app
├── server/          # Node.js + Express backend
└── README.md
```

No monorepo tooling (no npm workspaces, no Turborepo). `client/` and `server/` are independent npm projects. This is the simplest structure to understand, run, and deploy separately.

### Mobile — Android (v2 — planned)

| Layer | Technology |
|---|---|
| Framework | React Native (Expo — bare workflow) |
| Navigation | React Navigation v6 |
| State | Redux Toolkit (shared logic with web) |
| Offline | Redux Persist + AsyncStorage |
| Secure Storage | Expo SecureStore (tokens) |
| Build | EAS Build (Expo) |

---

## 5. Design Language — Peacock Theme

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--vs-deep` | `#003D40` | App background, nav bar |
| `--vs-teal` | `#00838F` | Primary actions, buttons, active states |
| `--vs-blue` | `#006064` | Sidebar, card backgrounds |
| `--vs-gold` | `#FFD54F` | XP bars, streaks, highlights |
| `--vs-feather` | `#4DD0E1` | Accent color, links, hover states |
| `--vs-emerald` | `#00C853` | Completed habits, success states |
| `--vs-rose` | `#F48FB1` | Missed days, overdue warnings |
| `--vs-surface` | `#1A2E35` | Card surfaces |
| `--vs-text` | `#E0F7FA` | Primary text |
| `--vs-muted` | `#80CBC4` | Secondary / caption text |

### Typography
- **Headings:** `Poppins` (700, 600)
- **Body:** `Inter` (400, 500)
- **Stats / Numbers:** `JetBrains Mono`

### Visual Identity
- Peacock feather SVG patterns as card accents and background textures
- Iridescent shimmer animation on XP bars and level-up events
- "Eye of the peacock" motif used in badges and achievement icons
- Feather burst particle animation on habit completion and level-up
- App logo: stylized peacock tail forming the letters "VS"

### Peacock Avatar System (Level-Tied)
The user's avatar is a peacock illustration that visually evolves as they level up. There are no custom photo uploads — the avatar is earned through progress. Avatars are **SVG illustrations rendered inline** — no external image hosting needed.

| Level | Avatar State | Description |
|---|---|---|
| 1 | Hatchling | A tiny chick pecking at the ground |
| 2 | Fledgling | A young bird with stubby tail feathers |
| 3 | Feathered | Juvenile peacock with small tail visible |
| 4 | Preening | Peacock grooming, tail starting to spread |
| 5 | Strutter | Proud bird, tail half-fanned |
| 6 | Plume Bearer | Full tail displayed, some eye-spots |
| 7 | Iridescent | Shimmering feathers, full tail fan |
| 8 | Crowned | Golden crown added, blue-green shimmer |
| 9 | Resplendent | Full display with animated shimmer overlay |
| 10 | Grand Peacock | Legendary — animated iridescent full display with feather glow |

- Each level unlock triggers a dramatic avatar reveal animation
- Avatar is displayed prominently on the Profile page and in the nav bar

### Dark Mode
- App is dark-first (deep teal/navy base)
- Light mode: ivory/white base with peacock teal accents (toggle in settings)

---

## 6. App Navigation & Page Structure

The app uses a **side navigation** on desktop and a **bottom navigation bar** on smaller viewports, with five primary sections:

```
┌────────────────────────────────────────────────────┐
│  🦚 Velvet Streak            [Avatar Icon]         │
├──────────┬──────────┬──────────┬──────────┬────────┤
│  🏠 Home │ 📊 Stats │ ✅ To-Do │ 👤 Profile│  +    │
└──────────┴──────────┴──────────┴──────────┴────────┘
```

### Page Breakdown

| Page | Route | Description |
|---|---|---|
| **Home** | `/` | Today's habit list, streak overview, quick check-in |
| **Stats** | `/stats` | Weekly/monthly analytics, heatmaps, trends |
| **To-Do** | `/todos` | Task list with priorities and deadlines |
| **Profile** | `/profile` | Peacock avatar, XP, badges, all-time stats, settings |
| **Habit Detail** | `/habits/:id` | Per-habit calendar, streak history, check-in log |
| **Add Habit** | `/habits/new` | Multi-step habit creation wizard |
| **Settings** | `/settings` | Account, day boundary time, theme |

### Global FAB (Floating Action Button)
- Visible on all pages except Habit Detail
- Tap → shows "Add Habit" and "Add Task" quick-options

---

## 7. User Authentication & Accounts

### 7.1 Sign Up
- Email + password registration only (no OAuth in v1)
- Email verification required before full access
- Username selection (unique, 3–20 chars, alphanumeric + underscores)

### 7.2 Login
- Email/password login
- "Remember me" checkbox for persistent sessions
- JWT access token (15 min expiry) + Refresh token (30 days, HTTP-only cookie)
- Refresh token rotation on every use

### 7.3 Password & Security
- Forgot password → reset email link sent via Nodemailer + Gmail (expires in 1 hour)
- Password requirements: min 8 chars, 1 uppercase, 1 number
- Rate limiting on login: 5 attempts → 15-minute lockout (in-memory, resets on server restart — acceptable for portfolio scale)
- Active session list (device name, last seen) visible in Settings

### 7.4 Account Deletion
- User can request account deletion from Profile > Settings
- 7-day grace period before all data is permanently purged
- Confirmation email sent on request and on final deletion

### 7.5 Multi-Device Sync
- All data stored server-side in MongoDB
- On login from any device, full state is fetched via REST API
- v1: polling on app foreground resume (every 60 seconds)

---

## 8. Day Boundary System

This is a critical system that governs when a "new day" begins for habit tracking purposes. Unlike standard apps that reset at midnight, Velvet Streak uses a configurable **day boundary time**.

### 8.1 Default Boundary
- **Default:** 3:00 AM (user's local timezone)
- Rationale: night-owl users finishing activities after midnight shouldn't have their streak broken; late-night check-ins at 1:00 AM or 2:00 AM still count for the current day

### 8.2 User-Configurable Boundary
- Users can set their own day boundary time in **Settings → Day Boundary**
- Range: 12:00 AM – 6:00 AM
- Default recommended: 3:00 AM
- Example: if boundary is set to 4:00 AM, any check-in between 4:00 AM Monday and 3:59 AM Tuesday is counted as "Monday"

### 8.3 How It Works
- All "today" calculations on the server use the user's stored `dayBoundaryTime` + `timezone`
- A "logical day" in the database is identified by the date label of the boundary start
- Server uses UTC storage; all boundary logic converts via the user's timezone on read

### 8.4 No Backdating Policy
- Users **cannot** log a check-in for any past date — even yesterday
- Check-ins are only accepted for the **current logical day** (per the boundary system above)
- This is enforced both on the client (UI shows no past dates as tappable) and the server (validation rejects any date outside the current logical day window)
- Rationale: prevents retroactive data manipulation and keeps streaks honest

### 8.5 Missed Day Handling
- If the day boundary passes and no check-in was recorded, the day is automatically marked as **Missed**
- A cron job (node-cron, server-side) runs every minute and processes all users whose boundary window just closed, evaluating missed days and resetting streaks accordingly

> **Render free tier note:** If the Render instance is spun down, the cron job is not running. The UptimeRobot keep-alive ping (configured separately, see §4) prevents spin-down and ensures the cron job stays active. If a user's streak is incorrectly preserved due to a missed cron window, the correct streak is recalculated on the next API call by the streak recalculation service.

---

## 9. Habit Management

### 9.1 Habit Creation Wizard

Habit creation is a **multi-step wizard** (step-by-step flow, not a single long form):

```
Step 1: Basic Info      → Name, Icon, Color, Category, Description
Step 2: Habit Type      → Binary or Quantitative (see Section 10)
Step 3: Schedule        → Schedule type and configuration (see Section 11)
Step 4: Rest Days       → Allow rest days? If yes, how many per week? (see Section 12)
Step 5: Review & Save   → Plain-English summary of all settings
```

### 9.2 Habit Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | ✅ | Habit name (e.g., "Morning Run") |
| `icon` | Emoji / icon picker | ✅ | Visual identifier |
| `color` | Color picker | ✅ | Personal color coding |
| `category` | Enum | ✅ | Fitness, Creative, Learning, Wellness, Social, Other |
| `description` | String | ❌ | Optional personal note |
| `type` | Enum | ✅ | `binary` or `quantitative` (see Section 10) |
| `schedule` | Object | ✅ | Full scheduling config (see Section 11) |
| `restDays` | Object | ✅ | Rest day config (see Section 12) |
| `targetUnit` | String | Type 2 only | "km", "pages", "minutes", "reps", etc. |
| `weeklyTarget` | Number | Type 2 only | Total target amount per week |
| `startDate` | Date | Auto | **Always set to the date the habit is created — not user-configurable** |

> **Note on Start Date:** The start date is automatically set to today (the current logical day, per the day boundary) when the habit is saved. The user is not asked for a start date. This ensures streaks are always measured from real usage, not aspirational future dates.

### 9.3 Editing a Habit
- All fields editable except `startDate` (which is fixed at creation)
- Schedule changes apply from the **next occurrence** — historical data is not retroactively altered
- Type change (binary ↔ quantitative) is allowed only if the habit has zero check-ins

### 9.4 Deleting a Habit
- Permanent delete — no archive/restore
- User must confirm with a dialog: *"This will permanently delete [Habit Name] and all its history. This cannot be undone."*
- All associated check-in records are also deleted (cascade)

### 9.5 Habit List (Home Page)
- Card-based list, one habit per card
- Groups: "Due Today", "Completed Today", "Not Scheduled Today"
- Sort: drag-to-reorder (custom order saved per user)
- Each card shows:
  - Habit icon + name + color strip
  - Type indicator: ✓ icon (binary) or progress bar (quantitative)
  - Current streak with fire emoji 🔥
  - Today's status: pending / done / missed / rest day
  - Quick check-in button (one tap for binary; tap → input for quantitative)

---

## 10. Habit Types

### Type 1: Binary (Done / Not Done)

Used for habits where completion is absolute — either you did it or you didn't.

**Examples:** Took a bath, Meditated, Journaled, Called a friend, Took vitamins

**Check-in experience:**
- Single tap on the check-in button → marked as Done ✅
- No additional input required
- Tap again (undo) → reverts to Pending (allowed within current logical day only)

**Streak logic:**
- Day counts as complete if the habit was checked in once (or per all required slots for multi-per-day)
- Day counts as missed if no check-in before day boundary

---

### Type 2: Quantitative (Progress Tracking)

Used for habits where the user tracks an amount, with a **weekly target** to work toward.

**Examples:** Running (weekly target: 20 km), Reading (weekly target: 100 pages), Strength training (weekly target: 150 reps)

**Fields exclusive to Type 2:**

| Field | Description | Example |
|---|---|---|
| `targetUnit` | The unit of measurement | "km", "pages", "minutes", "reps", "glasses" |
| `weeklyTarget` | Total amount to reach in one week | 20 |

**Check-in experience:**
- Tap → input field appears: *"How many [km] today?"*
- User enters amount → saved as check-in with value
- Multiple check-ins per day are summed together for that day
- The weekly total accumulates across all days of the week

**Weekly Progress Display:**
- Progress ring or bar showing current week total vs weekly target
  - Example: *"14.2 / 20 km this week — 71%"*
- Daily breakdown: small bar chart showing contribution per day
- Week resets on the user's configured week start day (default: Monday)

**Streak logic for Type 2:**
- A day counts as "active" if the user logged **any** amount that day (even 0.1 km counts)
- The streak measures consistency of logging, not target achievement
- Weekly target completion is tracked separately as a "Target Hit" metric — does not affect streak but awards bonus XP

**Stats unique to Type 2:**
- Weekly target hit rate (e.g., 3 out of 4 weeks)
- Personal best single-day amount
- Personal best single-week total
- All-time cumulative total (e.g., "Total: 847 km since you started")
- Rolling 4-week average

---

## 11. Habit Scheduling System

The scheduling system gives users complete control over when their habits are expected. All schedule types can be configured in the creation wizard.

### 11.1 Schedule Types

#### A. Daily
Every single day, no exceptions (rest days aside).
> *Example: "Meditate every day"*

#### B. Specific Days of the Week
Multi-select toggle: Mon / Tue / Wed / Thu / Fri / Sat / Sun.
> *Example: "Go to the gym — Mon, Wed, Fri"*

#### C. X Times Per Week (Flexible Days)
A weekly count target, but on any days the user chooses.
> *Example: "Read a book — 4 times this week (any days)"*

Streak logic: streak is maintained as long as the weekly count target is met by end of week.

#### D. Interval-Based
Every N days, from the start date.
> *Example: "Deep clean room — every 7 days"*
> *Example: "Car maintenance check — every 30 days"*

The app calculates and shows the exact next due date.

#### E. Multiple Times Per Day
A count per day, optionally tied to named time windows.
- Simple: "2× per day" (any time)
- Advanced: "2× per day — Morning window (6–12 AM) and Evening window (6–10 PM)"

> *Example: "Drink water — 8× a day"*
> *Example: "Practice scales — 2× a day (morning + evening)"*

Each time window shows as a separate slot in the check-in UI. All slots must be completed for the day to count as Done.

#### F. X Times Per Month
A count target within a calendar month, on any days.
> *Example: "Go hiking — 3 times this month"*

Streak resets if the month ends without the target being hit.

#### G. Weekdays Only / Weekends Only
Shortcut presets:
- Weekdays: Mon–Fri automatically selected
- Weekends: Sat–Sun automatically selected

### 11.2 Schedule Display
- The wizard always shows a plain-English summary before saving:
  > *"You'll be due every Monday, Wednesday, and Friday. That's 3 sessions per week."*
- A "Next 7 occurrences" preview list is shown before confirming

### 11.3 Schedule Storage (Database Shape)

```json
{
  "type": "specific_days",
  "days": ["MON", "WED", "FRI"],
  "timesPerDay": 1,
  "timeWindows": [],
  "intervalDays": null,
  "timesPerWeek": null,
  "timesPerMonth": null
}
```

---

## 12. Rest Days

Rest days allow users to take planned breaks without breaking their streak. This is configured per habit during the creation wizard (Step 4).

### 12.1 Creation Flow (Step 4 of Wizard)

**Question 1:** *"Do you want to allow rest days for this habit?"*
- Option A: **Yes, allow rest days**
- Option B: **No — I want to stay accountable every scheduled day**

**Question 2 (only if Yes):** *"How many rest days per week are allowed?"*
- Slider or number picker: 1 to 3
- Default: 1 rest day per week
- Max: 3 rest days per week (capped to prevent abuse)
- Plain-English note shown: *"You can skip up to [N] day(s) per week without breaking your streak."*

### 12.2 How Rest Days Work

- Users can mark any scheduled day as a **Rest Day** via a button in the check-in UI
- Marking rest day:
  - Does **not** break the streak
  - Does **not** award XP
  - Does **not** count toward weekly completion count
  - Shows on calendar as a grey "ZZZ" or rest icon
- Once a rest day is used, the count decrements (e.g., "1 of 2 rest days used this week")
- Rest day budget resets at the start of each new week
- Users cannot "bank" unused rest days — they reset every week

### 12.3 Rest Day Limit Enforcement
- If rest day budget for the week is exhausted, the "Mark as Rest Day" button is hidden
- Remaining rest days shown as small pill badge on each habit card

### 12.4 Habits with Rest Days Disabled
- No rest day option shown in the check-in UI
- Missing a day = streak broken, no exceptions
- This setting is shown prominently on the habit detail page to remind the user of their commitment

---

## 13. Habit Tracking & Check-In

### 13.1 Home Page Check-In Flow

The Home page is the primary interaction surface. Today's habits are displayed as cards.

**For Binary habits:**
1. Tap the check-in button (circle/checkmark icon) on the habit card
2. Button animates → turns green with a checkmark ✅
3. XP awarded → shown as a small "+10 XP" toast notification
4. Streak count updates in real-time on the card

**For Quantitative habits:**
1. Tap the check-in button on the habit card
2. A modal appears: *"How many km did you run today?"*
3. User enters amount → taps "Log It"
4. Weekly progress bar updates immediately
5. XP awarded based on amount logged

### 13.2 Multi-Slot Check-In (Multiple Times Per Day)
- Habit card shows slot indicators: e.g., [Morning ✓] [Evening ○]
- Tapping the card expands to show each slot
- Each slot has its own check-in button
- Full XP only when all slots are completed

### 13.3 No Backdating
- The check-in UI only allows logging for the **current logical day** (as defined by the day boundary in Section 8)
- No calendar picker for past dates is shown
- Server rejects any check-in timestamp outside the current logical day window

### 13.4 Undo Check-In
- A completed check-in can be **undone** by tapping the completed habit card and selecting "Undo check-in"
- Undo is only available within the **current logical day** — once the day boundary passes, check-ins are locked
- Undo removes the XP that was awarded for that check-in

### 13.5 Quick Note on Check-In (Optional)
- After completing a check-in, a small prompt appears (dismissable):
  > *"Add a note? (optional)"*
- Text field, max 200 characters
- Note is stored with the check-in record and visible in the habit detail log

---

## 14. Statistics & Analytics

All stats are available on the dedicated **Stats page** (`/stats`). Some summary stats also appear on the Home page and Profile page.

### 14.1 Weekly Stats

**Summary card (top of Stats page):**
- Week label (e.g., "Week of May 12–18")
- **Consistency Score** (0–100) — see formula below
- vs Last Week: ↑ Better / ↓ Worse / = Same
- Total check-ins across all habits
- Habits with 100% completion this week
- Total XP earned this week

**Consistency Score Formula:**
```
Score = (Total check-ins logged / Total check-ins expected) × 100
Bonus: +5 per habit with 100% completion this week
Penalty: -3 per habit with 0% check-ins this week
Range: 0 – 100 (capped)
```

**Per-Habit Weekly Breakdown:**
- For each habit: name, completion rate (%), check-ins done / expected, streak this week
- Color-coded: green (≥ 80%), amber (50–79%), red (< 50%)
- Sorted by completion rate ascending (most struggling shown first for attention)

**Motivational Weekly Summary Message:**
Auto-generated text shown at the top of the weekly section (hardcoded templates, rotated based on score range):
- *"You crushed it this week 🦚 — 5/5 habits on fire!"*
- *"4/7 days consistent — slightly better than last week. Keep the momentum!"*
- *"This week was tough. Every streak starts with Day 1. You've got this 💪"*

### 14.2 Monthly Stats

- Full-month heatmap: each day coloured by number of habits completed (light → dark teal)
- Month-over-month comparison: consistency score change %
- Best streak of the month per habit
- "Personal Best" callout if it's the user's best month ever for any habit
- Total XP earned that month
- **Type 2 specific:** Total cumulative amount logged for the month per quantitative habit (e.g., "You ran 87 km in May")

### 14.3 Trends & Charts (Stats Page)

| Chart | Description |
|---|---|
| Weekly Consistency Line Chart | 8-week rolling trend of consistency score |
| Per-Habit Completion Bar Chart | Side-by-side comparison of all habits' weekly rates |
| Type 2 Progress Chart | Line chart of weekly totals vs weekly target over time |
| Streak Length History | Bar chart of each habit's streak over time |
| XP Earned Per Week | Bar chart of XP over the past 8 weeks |

### 14.4 All-Time Stats (Stats Page)
- Total check-ins ever
- Total XP earned (all time)
- Longest streak ever (which habit, how long)
- Total active days vs total days since signup
- Most consistent habit of all time (highest win rate)
- GitHub-style 365-day contribution heatmap (all habits combined)

### 14.5 Improvement Indicators
- "Better than last week" green badge with ↑ arrow
- "Needs improvement" amber badge with ↓ arrow, shown with encouragement text
- "Best week ever! 🏆" banner when personal consistency score record is broken

---

## 15. Calendar View & Streaks

Accessible from the **Habit Detail page** (`/habits/:id`).

### 15.1 Calendar Display

Full monthly grid for a single habit:

| Day State | Visual Indicator |
|---|---|
| **Completed** | Bright filled circle — teal/gold glow (the "bright spot") |
| **Missed (scheduled)** | Faint rose/red empty circle |
| **Not scheduled** | No marker; cell is greyed and dimmed |
| **Rest Day** | Soft grey circle with a "ZZZ" or wave icon |
| **Today (pending)** | Outlined teal circle (pulsing) |

- Completed days have a satisfying filled glow — the brighter the streak, the more vivid the color
- Tap any completed day → see check-in details (amount for Type 2, note if added)
- Navigate months with left/right arrows or a month picker dropdown

### 15.2 Streak Display

Prominently shown at the top of the Habit Detail page:

```
┌──────────────────────────────────────────┐
│  🔥 Current Streak: 14 days              │
│  🏆 Longest Streak: 21 days              │
│  Rest days remaining this week: 1 of 2   │
└──────────────────────────────────────────┘
```

- Fire animation when streak > 7 days
- Streak milestone pop-ups: 7, 14, 21, 30, 60, 90, 180, 365 days
- Streak shown on Home page habit cards (compact: "🔥 14")

### 15.3 Annual Contribution Map (Profile & Stats Pages)
- GitHub-style 52-week × 7-day grid
- Each cell = one day; color intensity = number of habits completed
- Hovering/tapping a cell shows the date and count
- This is the "trophy wall" — a visual record of all activity

---

## 16. Gamification & Experience System

### 16.1 XP (Experience Points)

| Action | XP |
|---|---|
| Complete a binary habit check-in | +10 XP |
| Log any amount for a quantitative habit | +10 XP |
| Complete all habits due today | +25 XP (daily bonus) |
| Reach a 7-day streak on any habit | +50 XP |
| Reach a 30-day streak on any habit | +200 XP |
| Perfect week (100% on all habits) | +75 XP |
| Perfect month | +500 XP |
| Hit weekly quantitative target | +30 XP (per habit, per week) |
| Add a note to a check-in | +3 XP |
| Complete a To-Do task (any priority) | +5 XP |
| Complete a Critical To-Do task | +20 XP total (Critical bonus stacks) |
| First habit created (one-time) | +20 XP |
| Daily login | +5 XP |

### 16.2 Levels & Peacock Avatar Tiers

| Level | XP Needed | Title | Avatar Description |
|---|---|---|---|
| 1 | 0 | Hatchling | Tiny chick, fluffy and curious |
| 2 | 200 | Fledgling | Young bird, small nub of a tail |
| 3 | 500 | Feathered | Juvenile with a short fan |
| 4 | 1,000 | Preening | Grooming, tail starting to spread |
| 5 | 2,000 | Strutter | Confident, tail half-displayed |
| 6 | 4,000 | Plume Bearer | Full tail visible, some iridescent eye-spots |
| 7 | 7,000 | Iridescent | Shimmering tail fan, deep colour palette |
| 8 | 12,000 | Crowned | Golden crown added, radiant display |
| 9 | 20,000 | Resplendent | Animated shimmer overlay, full glory |
| 10 | 35,000 | Grand Peacock | Legendary animated display — the final form |

- Level-up triggers: full-screen feather burst animation + avatar morph transition
- Current level and progress bar visible on Home page (top bar), Profile page, and avatar badge

### 16.3 Badges & Achievements

| Badge | Icon | Trigger |
|---|---|---|
| First Feather | 🦚 | Complete first habit check-in |
| On Fire | 🔥 | Any habit reaches a 7-day streak |
| Diamond Habit | 💎 | Any habit reaches a 30-day streak |
| Century | 🏆 | 100 total check-ins ever |
| Perfect Week | ✨ | 100% completion on all habits for a full week |
| Perfect Month | 🌟 | 100% completion all month |
| Rainbow | 🌈 | Complete check-ins in 5 different categories |
| Athlete | 🏃 | 50 check-ins in the Fitness category |
| Creator | 🎨 | 50 check-ins in the Creative category |
| Scholar | 📖 | 50 check-ins in the Learning category |
| Zen Master | 🧘 | 50 check-ins in the Wellness category |
| Comeback King | ⚡ | Resume a habit after a 7+ day gap |
| Milestone 365 | 📅 | Any habit reaches a 365-day streak |
| To-Do Hero | ✅ | Complete 50 To-Do tasks |
| Night Owl | 🦉 | Check-in logged between 12 AM–3 AM (day boundary range) |
| Target Crusher | 🎯 | Hit weekly quantitative target 4 weeks in a row |
| Overachiever | 🚀 | Hit 150%+ of weekly quantitative target in a week |

- Badge showcase on Profile page (unlocked = vibrant, locked = greyed silhouette)
- Badge earned notification: in-app toast + animation (no push notification)

### 16.4 Weekly Challenge
- Auto-generated each Monday — one challenge per week
- Examples:
  - *"Complete every habit 5 days this week"*
  - *"Log a note on at least 3 check-ins"*
  - *"Hit your weekly running target"*
- Completing the challenge awards +100 XP + a "Challenge Cleared" badge flash

### 16.5 Motivational Banner
- Rotating motivational quotes shown as a banner on the Home page (updated daily from a hardcoded list)
- In-app streak-at-risk indicator: when habits are still pending and it's within 2 hours of the day boundary, a banner appears on the Home page: *"⚠ Day ends in 2 hours — you have 2 habits pending!"*

---

## 17. User Profile Page

The Profile page (`/profile`) is the user's personal "trophy room" — a complete view of their identity, progress, and achievements in the app.

### 17.1 Layout

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│            [Peacock Avatar — Level 5]                │
│           Level 5 · Strutter                         │
│           @username · Joined March 2026              │
│                                                      │
│  ████████████████████░░░░  XP: 2,340 / 4,000        │
│                                                      │
├──────────────────────────────────────────────────────┤
│  ALL-TIME STATS                                      │
│  Total Check-ins: 284    Active Days: 67             │
│  Longest Streak: 🔥 21 days  (Morning Run)           │
│  Total XP Earned: 4,120   Habits Created: 6          │
│  Consistency Score (all-time avg): 78/100            │
├──────────────────────────────────────────────────────┤
│  THIS MONTH                                          │
│  Check-ins: 51   XP Earned: 820   Best Streak: 14   │
│  Monthly Consistency: 84/100  ↑ +6 from last month  │
├──────────────────────────────────────────────────────┤
│  BADGES (12 / 19 unlocked)                          │
│  [🦚] [🔥] [💎] [🏆] [✨] [🌈] [🏃] [📖] ...     │
│  [locked] [locked] [locked]...                       │
├──────────────────────────────────────────────────────┤
│  ANNUAL ACTIVITY MAP (365-day heatmap)               │
│  ░░▒▒▓█▓▒░░▒▓█████▓▒░░...                           │
├──────────────────────────────────────────────────────┤
│  [Edit Profile]  [Settings]  [Export Data]           │
└──────────────────────────────────────────────────────┘
```

### 17.2 Profile Stats Displayed

**All-Time:**
- Total check-ins (all habits combined)
- Total active days
- Longest streak ever (habit name + count)
- Total XP earned
- Current level + XP to next level
- Habits created (total)
- Average all-time consistency score
- To-Do tasks completed (total)

**This Month:**
- Check-ins this month
- XP earned this month
- Best streak this month
- Monthly consistency score + vs last month delta

**Per-Habit Summary Table:**
- A compact table showing each habit, its current streak, longest streak, total check-ins, and win rate %

### 17.3 Avatar Showcase
- Avatar is displayed large and centered at the top of the profile
- Animated shimmer/idle animation for higher level avatars
- A small "Next level at X XP" label beneath the avatar
- Tapping the avatar shows a "Level progression" modal: all 10 avatar stages shown as a roadmap, with current position highlighted

### 17.4 Badge Showcase
- Grid of all badges (unlocked = full color, locked = greyed out with silhouette)
- Tapping any badge shows its name, description, and unlock condition
- Unlocked badges show the date earned

### 17.5 Profile Editing
- Display name (shown on profile)
- Username (unique, used in URLs)
- Short bio (max 160 chars)
- No custom photo upload — avatar is system-assigned based on level

### 17.6 Settings (accessible from Profile)
- **Day Boundary Time:** Time picker (12:00 AM – 6:00 AM)
- **Timezone:** Auto-detected, manually overridable
- **Week Start Day:** Monday or Sunday
- **Theme:** Dark (default) / Light
- **Account:** Change password, active sessions, Delete account

---

## 18. To-Do List Module

A fully independent module on the **To-Do page** (`/todos`). Separate from habits — tasks are one-off items with deadlines, not recurring patterns.

### 18.1 Creating a Task

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | String | ✅ | Task name |
| `description` | String | ❌ | Detailed notes |
| `deadline` | DateTime | ✅ | Due date + optional time |
| `priority` | Enum | ✅ | Critical 🔴, High 🟠, Medium 🟡, Low 🟢 |
| `category` | String | ❌ | Work, Personal, Learning, Health, Other |
| `subtasks` | Array | ❌ | Checklist items nested inside a task |

### 18.2 Priority System

| Level | Color | Description | XP on Completion |
|---|---|---|---|
| Critical 🔴 | Red pulsing border | Must be done, time-sensitive | +20 XP |
| High 🟠 | Orange left border | Important but not urgent | +10 XP |
| Medium 🟡 | Yellow left border | Normal priority | +5 XP |
| Low 🟢 | Green left border | Nice to do | +5 XP |

### 18.3 Task Views

| View | Description |
|---|---|
| **Today** | Tasks due today + overdue tasks |
| **Upcoming** | Tasks due in next 7 days, grouped by day |
| **All Tasks** | Full list with sort and filter |
| **Completed** | Read-only archive of finished tasks (last 30 days) |

### 18.4 Task Interactions
- Tap checkbox → task completes, struck-through, XP awarded
- Swipe left → delete (with undo toast for 5 seconds)
- Tap task title → expand to see description, subtasks, deadline, edit options
- Subtask checkboxes inside expanded view
- Overdue tasks: red "X days overdue" tag on card
- Critical tasks: subtle red pulsing animation on the card border

### 18.5 Sorting & Filtering
- Sort by: deadline (default), priority, creation date
- Filter by: priority level, category, overdue only
- Search bar across all task titles

### 18.6 To-Do Stats (visible on Stats page)
- Tasks completed this week vs last week
- Completion rate by priority level
- Overdue rate (% of tasks past deadline at time of completion)

---

## 19. API Design

### Base URL
```
https://api.velvetstreak.app/v1
```

All endpoints require `Authorization: Bearer <access_token>` except auth routes.

### 19.1 Auth Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login → returns access token + sets refresh cookie |
| POST | `/auth/logout` | Clear refresh token cookie |
| POST | `/auth/refresh` | Exchange refresh cookie for new access token |
| POST | `/auth/forgot-password` | Send reset email via Nodemailer + Gmail |
| POST | `/auth/reset-password` | Submit new password with reset token |
| GET | `/auth/verify-email` | Verify email from link clicked in email |

> **No OAuth endpoints in v1.** Google Sign-In is deferred to v2.

### 19.2 User Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/users/me` | Get full current user profile |
| PATCH | `/users/me` | Update display name, username, bio |
| PATCH | `/users/me/settings` | Update day boundary, timezone, theme |
| GET | `/users/me/stats` | All-time stats aggregation |
| GET | `/users/me/badges` | List of earned badges with dates |
| GET | `/users/me/export` | Export all user data as JSON |
| DELETE | `/users/me` | Request account deletion |

### 19.3 Habit Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/habits` | List all habits for current user |
| POST | `/habits` | Create a new habit |
| GET | `/habits/:id` | Get full habit detail |
| PATCH | `/habits/:id` | Edit habit settings |
| DELETE | `/habits/:id` | Permanently delete habit + all check-ins |
| PATCH | `/habits/:id/reorder` | Update sort order position |
| GET | `/habits/:id/calendar?month=YYYY-MM` | Calendar check-in data for one month |
| GET | `/habits/:id/stats?range=week\|month\|all` | Habit-specific stats |

### 19.4 Check-In Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/checkins` | Create a check-in for current logical day |
| GET | `/checkins?habitId=&date=YYYY-MM-DD` | Get check-ins for a specific day |
| PATCH | `/checkins/:id/note` | Update note on an existing check-in |
| DELETE | `/checkins/:id` | Undo a check-in (current logical day only, enforced server-side) |

### 19.5 Rest Day Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/restdays` | Mark today as a rest day for a habit |
| DELETE | `/restdays/:id` | Undo a rest day marking (current day only) |

### 19.6 To-Do Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/todos` | List tasks (supports `?view=today\|upcoming\|all\|completed`) |
| POST | `/todos` | Create a task |
| GET | `/todos/:id` | Get single task with subtasks |
| PATCH | `/todos/:id` | Edit task |
| DELETE | `/todos/:id` | Delete task |
| PATCH | `/todos/:id/complete` | Mark task as complete (awards XP) |
| PATCH | `/todos/:id/subtasks/:subId` | Toggle a subtask |

### 19.7 Stats Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/stats/dashboard` | Home page summary (today's habits, streak snapshot, XP) |
| GET | `/stats/weekly?week=YYYY-WXX` | Full weekly stats (all habits) |
| GET | `/stats/monthly?month=YYYY-MM` | Full monthly stats |
| GET | `/stats/heatmap?year=YYYY` | 365-day activity data for contribution map |

---

## 20. Database Schema

### 20.1 Users Collection

```json
{
  "_id": "ObjectId",
  "username": "string (unique, indexed)",
  "email": "string (unique, indexed)",
  "passwordHash": "string",
  "displayName": "string",
  "bio": "string",
  "xp": "number (default: 0)",
  "level": "number (default: 1)",
  "badgesEarned": [
    { "badgeKey": "string", "earnedAt": "Date" }
  ],
  "preferences": {
    "timezone": "string (e.g. Asia/Kolkata)",
    "dayBoundaryTime": "string (HH:MM, default: 03:00)",
    "weekStartDay": "enum: [MON, SUN] (default: MON)",
    "theme": "enum: [dark, light] (default: dark)"
  },
  "refreshTokens": [
    { "tokenHash": "string", "device": "string", "createdAt": "Date", "expiresAt": "Date" }
  ],
  "isEmailVerified": "boolean (default: false)",
  "emailVerifyToken": "string | null",
  "emailVerifyExpiry": "Date | null",
  "passwordResetToken": "string | null",
  "passwordResetExpiry": "Date | null",
  "deletionRequestedAt": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

> **Removed from v3:** `oauthProviders` (no OAuth in v1), `fcmTokens` (no push notifications in v1), `quietHoursStart/End` (no notifications in v1).

### 20.2 Habits Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "name": "string",
  "icon": "string (emoji or icon key)",
  "color": "string (hex)",
  "category": "enum: [Fitness, Creative, Learning, Wellness, Social, Other]",
  "description": "string",
  "habitType": "enum: [binary, quantitative]",
  "quantitative": {
    "targetUnit": "string (e.g. km, pages, minutes)",
    "weeklyTarget": "number"
  },
  "schedule": {
    "type": "enum: [daily, specific_days, times_per_week, interval, times_per_day, times_per_month]",
    "days": ["MON", "WED", "FRI"],
    "timesPerDay": "number (default: 1)",
    "timeWindows": [{ "label": "string", "windowStart": "HH:MM", "windowEnd": "HH:MM" }],
    "intervalDays": "number | null",
    "timesPerWeek": "number | null",
    "timesPerMonth": "number | null"
  },
  "restDayConfig": {
    "allowed": "boolean",
    "maxPerWeek": "number (1–3, null if not allowed)"
  },
  "sortOrder": "number",
  "startDate": "Date (set at creation, never editable)",
  "currentStreak": "number (default: 0)",
  "longestStreak": "number (default: 0)",
  "totalCheckIns": "number (default: 0)",
  "lastCheckInLogicalDate": "string (YYYY-MM-DD, local day label)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

> **Removed from v3:** `reminderTimes` (no push notifications in v1).

### 20.3 CheckIns Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "habitId": "ObjectId (ref: Habits, indexed)",
  "logicalDate": "string (YYYY-MM-DD — the day label in user's timezone, indexed)",
  "slotIndex": "number (0 for single slot, 0/1/2... for multi-per-day)",
  "amount": "number | null (quantitative only)",
  "note": "string | null",
  "xpAwarded": "number",
  "createdAt": "Date (actual UTC timestamp of logging)"
}
```

### 20.4 RestDays Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "habitId": "ObjectId (ref: Habits, indexed)",
  "logicalDate": "string (YYYY-MM-DD)",
  "weekLabel": "string (YYYY-WXX, for weekly budget tracking)",
  "createdAt": "Date"
}
```

### 20.5 Todos Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "title": "string",
  "description": "string | null",
  "deadline": "Date (indexed)",
  "priority": "enum: [critical, high, medium, low]",
  "category": "string | null",
  "subtasks": [
    { "id": "string", "title": "string", "isCompleted": "boolean" }
  ],
  "isCompleted": "boolean (default: false, indexed)",
  "completedAt": "Date | null",
  "xpAwarded": "number | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 20.6 Badges Collection (Static Seed Data)

```json
{
  "_id": "ObjectId",
  "key": "string (unique, e.g. on_fire)",
  "name": "string",
  "description": "string",
  "icon": "string (emoji)",
  "unlockCondition": "string (human-readable description)",
  "triggerKey": "string (server-side evaluation key)",
  "xpReward": "number"
}
```

### 20.7 Key Database Indexes

```
Users:          email (unique), username (unique)
Habits:         userId, userId + sortOrder
CheckIns:       userId + habitId + logicalDate + slotIndex (compound, unique)
RestDays:       userId + habitId + logicalDate (compound, unique)
Todos:          userId, userId + deadline, userId + isCompleted
```

---

## 21. Non-Functional Requirements

### 21.1 Performance
- API response time < 500ms (P95) for standard CRUD operations — slightly relaxed vs v3 to account for Render free tier cold starts; warm instance target is still < 300ms
- Stats aggregation endpoint < 2 seconds
- Page load (LCP) < 2.5s on desktop
- Check-in action round-trip < 600ms on warm instance

### 21.2 Scalability
- MongoDB compound indexes on all hot query paths
- In-process stats caching (Map-based TTL, 5-min)
- Single Render instance is sufficient for portfolio/demo scale

### 21.3 Security
- All endpoints require valid JWT (except auth routes)
- HTTPS enforced everywhere (Vercel and Render both provide this automatically)
- HTTP-only, SameSite=Strict, Secure cookies for refresh tokens
- Input validation via Zod on all routes
- CORS: allowlist of known origins only (Vercel deployment URL)
- Rate limits: 100 req/min (global), 5/min (auth routes), 30/min (check-in routes) — all in-memory via express-rate-limit
- Refresh token stored as bcrypt hash in DB; raw token only sent to client once

### 21.4 Day Boundary Integrity
- Server always determines the current logical day — never trusts client-supplied date for check-ins
- Cron job for streak evaluation runs every minute via node-cron
- UptimeRobot keep-alive ensures the Render instance stays warm and the cron job keeps running
- Streak recalculation service corrects any streak that was missed due to a server-down window

### 21.5 Reliability
- Target uptime: ~99% (Render free tier, maintained warm by UptimeRobot)
- Render free tier instances are restarted on deploy and may spin down only if UptimeRobot is misconfigured

### 21.6 Accessibility
- WCAG 2.1 AA compliance on web
- Minimum contrast ratio 4.5:1 (critical given dark theme)
- All interactive elements keyboard-accessible
- ARIA labels on icon-only buttons and status indicators

### 21.7 Privacy
- GDPR-aware data handling
- Full data export available in JSON format from Profile > Settings
- Account deletion purges all user data within 7 days of request
- No third-party advertising or data sharing

---

## 22. Milestones & Roadmap

### v1 — Web Application

#### Phase 1 — Foundation (Weeks 1–4)
- [ ] Project setup: `/client` (Vite + React) and `/server` (Node + Express) as two independent folders
- [ ] MongoDB Atlas cluster setup + all Mongoose models
- [ ] Auth system: register, login, JWT, refresh token rotation
- [ ] Email verification + password reset via Nodemailer + Gmail App Password
- [ ] Day boundary system (server-side logical day calculation)
- [ ] Basic habit CRUD (no scheduling engine yet)
- [ ] Simple binary check-in (no stats)
- [ ] Home page with today's habits list
- [ ] Deploy client to Vercel, server to Render, set up UptimeRobot

#### Phase 2 — Core Habit Engine (Weeks 5–9)
- [ ] Full scheduling engine (all 7 schedule types)
- [ ] Quantitative habit type + weekly target tracking
- [ ] Rest day system (creation config + weekly budget)
- [ ] No-backdate enforcement (client + server)
- [ ] Streak calculation + cron-based missed day evaluation
- [ ] Calendar view per habit
- [ ] Delete habit with cascade

#### Phase 3 — Stats & Gamification (Weeks 10–15)
- [ ] Weekly stats page + consistency score
- [ ] Monthly stats page + heatmap
- [ ] All-time stats + 365-day contribution map
- [ ] XP system + level progression
- [ ] Peacock avatar SVG set (10 levels)
- [ ] Badge system + server-side trigger evaluation
- [ ] To-Do module (full CRUD + priorities + subtasks)

#### Phase 4 — Polish & Profile (Weeks 16–19)
- [ ] Full Profile page (avatar, stats, badges, annual map)
- [ ] Motivational messages (hardcoded template rotation)
- [ ] Peacock theme UI polish + all animations (feather burst, level-up, completion)
- [ ] In-app streak-at-risk banner (2 hours before boundary)
- [ ] Settings page (day boundary, theme, week start)
- [ ] Data export (JSON)
- [ ] Final deployment check + custom domain (optional, free on Vercel)

---

### v2 — Android App (Planned)

#### Phase 5 — Android App (Weeks 20–27)
- [ ] React Native / Expo bare workflow project setup with shared Redux store
- [ ] Full feature parity with web (all pages and interactions)
- [ ] Offline mode with sync queue (check-ins)
- [ ] Google OAuth (can now be added to both web and Android together)
- [ ] Biometric authentication
- [ ] Push notifications via FCM (habits, streaks, badges)
- [ ] App shortcuts (long-press icon)
- [ ] EAS Build + Google Play Store submission

#### Phase 6 — Optimization (Weeks 28–32)
- [ ] iOS app scoping
- [ ] Weekly challenge system
- [ ] Performance profiling
- [ ] Redis caching for dashboard and stats endpoints (if scale warrants)

---

## 23. Android App — v2 Scope

The Android app is planned for v2. It will have full feature parity with the web app, built using React Native (Expo bare workflow).

**Key Android features (v2):**
- All habit management, check-in, stats, To-Do, and gamification features
- Offline mode with sync queue (check-ins queued while offline, synced on reconnect)
- Google OAuth added to both web and Android simultaneously
- Biometric authentication (fingerprint / face recognition)
- Push notifications via Firebase Cloud Messaging (FCM) — habit reminders, streak-at-risk nudges, badge alerts
- App shortcuts (long-press icon): "Quick Check-In", "Add Task"
- EAS Build for APK/AAB; distributed via Google Play Store

---

## Appendix A — What Changed from PRD v3

| Area | v3 | v4 (this document) | Reason |
|---|---|---|---|
| Auth | Email + Google OAuth | Email + password only | OAuth requires Google Cloud Console setup, Passport.js config, and callback URL registration — unnecessary for a portfolio build. Can be added cleanly in v2. |
| Email provider | SendGrid | Nodemailer + Gmail App Password | No third-party account needed. Enable Gmail App Passwords (2 minutes), paste credentials into `.env`. |
| API hosting | Railway (hobby, $5/mo) | Render (free tier) | Render's free tier requires no credit card. Functionally identical for this scale. |
| Keep-alive | Not needed (Railway stays warm) | UptimeRobot (free) | Render free tier spins down after inactivity. UptimeRobot pings every 5 min to keep it warm at zero cost. |
| Project structure | npm workspaces monorepo (`/packages/web`, `/packages/api`, `/packages/shared`) | Two plain folders (`/client`, `/server`) | npm workspaces add complexity without benefit at this scale. Shared types are minimal and can be duplicated. |
| CI/CD | GitHub Actions workflows | None needed | Vercel and Render both auto-deploy on `git push` to `main`. That IS the deployment pipeline. |
| Error monitoring | Sentry | Winston logs only (visible in Render dashboard) | Sentry requires account setup, SDK config, and source map uploads. Winston file logs + Render's built-in log viewer is sufficient. |
| OAuth providers | Google (v1) | None (v1), Google (v2) | See auth row above. |

**No product features were changed.** Every habit type, schedule, gamification mechanic, stat, badge, and UI interaction from PRD v3 is preserved exactly.

---

## Appendix B — Glossary

| Term | Definition |
|---|---|
| Logical Day | A "day" as perceived by the user — starts at their configured day boundary time, not midnight |
| Day Boundary | The configurable time at which the app rolls over to a new day (default 3:00 AM) |
| Check-In | Recording completion of a habit session for the current logical day |
| Binary Habit | A habit that is either done or not done — no measurement involved |
| Quantitative Habit | A habit where an amount is logged (km, pages, etc.) with a weekly target |
| Weekly Target | The total amount a user aims to log across a full week for a quantitative habit |
| Streak | Consecutive scheduled days where the habit was completed (or covered by a rest day) |
| Rest Day | A planned skip day that does not break the streak — budget-limited per week |
| XP | Experience Points — earned through check-ins, milestones, and tasks |
| Consistency Score | A weekly 0–100 score measuring overall habit adherence across all habits |
| UptimeRobot | Free monitoring service used to ping the Render API and prevent free-tier spin-down |
| Render | Free cloud hosting platform for the Node.js API server |
| Vercel | Free cloud hosting platform for the React web app |
| FCM | Firebase Cloud Messaging — push notification service (v2 only) |
| EAS | Expo Application Services — build and OTA update distribution for React Native (v2 only) |
| Logical Date | A YYYY-MM-DD string representing the user's local day (used in all DB records) |

---

*Document Owner: Product Team*
*App Name: Velvet Streak*
*Tagline: Keep track of your streaks*
*Version: 4.0 — May 2026*
*Previous Version: 3.0*
*Next Review: June 2026*
