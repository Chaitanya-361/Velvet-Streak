# Velvet Streak — Technical Requirements Document (TRD)
**Version:** 3.0
**Date:** May 2026
**Status:** Draft
**Based on:** PRD v4.0
**Changes from v2:** Infrastructure simplified for student/portfolio build. All technical specifications for product features unchanged.

---

## Table of Contents

1. [Document Purpose & Scope](#1-document-purpose--scope)
2. [System Architecture](#2-system-architecture)
3. [Environment & Infrastructure Requirements](#3-environment--infrastructure-requirements)
4. [Frontend — Web (React)](#4-frontend--web-react)
5. [Backend — API (Node.js / Express)](#5-backend--api-nodejs--express)
6. [Database (MongoDB)](#6-database-mongodb)
7. [Authentication & Session Management](#7-authentication--session-management)
8. [Day Boundary Engine](#8-day-boundary-engine)
9. [Habit Scheduling Engine](#9-habit-scheduling-engine)
10. [Streak Calculation Engine](#10-streak-calculation-engine)
11. [Gamification Engine (XP, Levels, Badges)](#11-gamification-engine-xp-levels-badges)
12. [Statistics & Analytics Engine](#12-statistics--analytics-engine)
13. [To-Do Module](#13-to-do-module)
14. [API Contracts](#14-api-contracts)
15. [Security Requirements](#15-security-requirements)
16. [Performance Requirements](#16-performance-requirements)
17. [Error Handling & Logging](#17-error-handling--logging)
18. [Testing Requirements](#18-testing-requirements)
19. [Deployment & DevOps](#19-deployment--devops)
20. [Accessibility Requirements](#20-accessibility-requirements)
21. [Data Privacy & Compliance](#21-data-privacy--compliance)
22. [Android App — v2 Technical Scope](#22-android-app--v2-technical-scope)
23. [Open Technical Decisions](#23-open-technical-decisions)

---

## 1. Document Purpose & Scope

This Technical Requirements Document (TRD) translates the Velvet Streak PRD v4.0 into concrete, implementable engineering specifications. It defines every system, subsystem, interface, constraint, and behavior that developers must satisfy to deliver a correct, performant, and secure application.

### 1.1 Audience
- Frontend engineers (Web)
- Backend engineers
- The solo developer building this as a portfolio project

### 1.2 v1 Scope (this document)
Full v1 scope covers:
- Web application (React 18 + Vite)
- REST API (Node.js 20 + Express)
- MongoDB data layer
- All cross-cutting concerns: auth, cron jobs, analytics, gamification

### 1.3 Out of Scope for v1
The following are **explicitly excluded from v1** and planned for v2:

| Feature | Reason | Planned For |
|---|---|---|
| Android app (React Native / Expo) | Separate development phase | v2 |
| Google OAuth / Social Login | Requires Google Cloud Console setup, Passport.js — unjustified complexity for v1 | v2 |
| Push notifications (FCM) | Requires mobile app | v2 |
| Weekly email digest / notification emails | Not needed for core experience | v2 (re-evaluate) |
| Home screen widget | Requires native Android | v2 |
| Offline sync queue | Web handles connectivity natively | v2 (Android) |
| Redis caching layer | Overkill at portfolio scale | v2 (if scale warrants) |
| WebSocket / real-time sync | Polling sufficient for v1 | v2 |
| iOS application | Out of scope | v3 |
| Social / friends / leaderboard | Under consideration | v3 |
| Sentry error monitoring | Overkill for portfolio build; Winston logs + Render dashboard sufficient | v2 |
| GitHub Actions CI/CD | Not needed; Vercel + Render auto-deploy on `git push` | v2 (if team grows) |
| Docker / containerisation | Not needed for Render deployment | v2 (if self-hosting) |

**Email scope:** Nodemailer + Gmail App Password is used only for transactional emails: account verification and password reset. No weekly digest, no notification emails.

---

## 2. System Architecture

### 2.1 High-Level Topology (v1)

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                           │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │         React Web App (Vite / Vercel)               │   │
│   └──────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼───────────────────────────────────┘
                           │  HTTPS (REST + HTTP-only cookies)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                         API TIER                             │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Node.js 20 + Express  (Render — free tier)        │   │
│   └───────────────┬─────────────────┬───────────────────┘   │
└───────────────────┼─────────────────┼─────────────────────────┘
                    │                 │
                    ▼                 ▼
          ┌──────────────┐  ┌──────────────────────┐
          │ MongoDB      │  │ Gmail via Nodemailer  │
          │ Atlas (M0)   │  │ (verification +       │
          │ Primary DB   │  │  password reset only) │
          └──────────────┘  └──────────────────────┘

              ▲
              │ keep-alive ping every 5 min
          ┌──────────┐
          │UptimeRobot│
          │  (free)   │
          └──────────┘
```

### 2.2 Deployment Targets (v1)

| Component | Platform | Tier | Notes |
|---|---|---|---|
| Web frontend | Vercel | Free | Auto-deploys on `git push` to `main` |
| API server | Render | Free | Auto-deploys on `git push` to `main`; kept warm by UptimeRobot |
| Database | MongoDB Atlas | M0 (Free) | No credit card required |
| Keep-alive | UptimeRobot | Free | Pings `/health` every 5 min; prevents Render spin-down |

### 2.3 Project Structure (v1)

```
velvet-streak/
├── client/                # React 18 + Vite web app
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js + Express backend
│   ├── src/
│   ├── package.json
│   └── .env.example
└── README.md
```

`client/` and `server/` are fully independent npm projects. They are deployed to separate platforms (Vercel and Render respectively) and have no shared build process. This is the simplest structure to understand, develop, and deploy independently.

> **Why not a monorepo?** npm workspaces and Turborepo add meaningful complexity — root-level package management, cross-package script orchestration, shared tsconfig inheritance — without a meaningful benefit when there are only two packages and a solo developer. If the project grows to a team or adds a mobile app, evaluate monorepo tooling at that point.

### 2.4 How Deployment Works

Deployment requires zero manual steps after initial setup:

1. Push code to `main` branch on GitHub
2. Vercel detects the push → builds and deploys `client/` automatically
3. Render detects the push → builds and deploys `server/` automatically
4. No CLI, no Docker, no pipelines to configure or maintain

Initial setup per platform:
- **Vercel:** Connect GitHub repo, set root directory to `client/`, add environment variables (API URL)
- **Render:** Connect GitHub repo, set root directory to `server/`, set build command (`npm install && npm run build`), set start command (`npm start`), add environment variables
- **UptimeRobot:** Create a free monitor → HTTP monitor → URL: `https://your-render-url.onrender.com/health` → check every 5 minutes

---

## 3. Environment & Infrastructure Requirements

### 3.1 Runtime Requirements

| Component | Minimum Version | Notes |
|---|---|---|
| Node.js | 20 LTS | API server & build tooling |
| npm | 9+ | Package management |
| MongoDB | 6.0+ | Atlas-managed |
| React | 18.2+ | Web |

### 3.2 Environment Variables

All secrets managed via `.env` files locally (never committed — add to `.gitignore`). For production, secrets are entered directly in the Render dashboard (server) and Vercel dashboard (client) as environment variables.

**Server environment variables (`server/.env`):**

```bash
# Server
NODE_ENV=production
PORT=8080

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/velvetstreak

# Auth
JWT_ACCESS_SECRET=<256-bit random string>
JWT_REFRESH_SECRET=<256-bit random string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Email — Gmail App Password (NOT your regular Gmail password)
# Setup: Google Account → Security → App Passwords → create one for "Mail"
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=noreply@velvetstreak.app

# Security
CORS_ALLOWED_ORIGINS=https://velvetstreak.vercel.app
COOKIE_SECRET=<256-bit random string>
BCRYPT_ROUNDS=12
```

**Client environment variables (`client/.env`):**

```bash
VITE_API_BASE_URL=https://your-render-url.onrender.com/v1
```

> **Generating secrets:** In Node.js: `require('crypto').randomBytes(32).toString('hex')`. Run this once for each secret and store the output in your `.env` and in the Render/Vercel dashboard.

### 3.3 Gmail App Password Setup

This replaces SendGrid entirely. Takes about 2 minutes:

1. Go to your Google Account → Security
2. Enable 2-Step Verification (required for App Passwords)
3. Go to Security → App Passwords
4. Select app: "Mail", select device: "Other" → type "Velvet Streak"
5. Copy the 16-character password shown → paste into `GMAIL_APP_PASSWORD` in your `.env`

The app will send emails from your Gmail address. For a portfolio project, this is entirely appropriate.

### 3.4 MongoDB Atlas Configuration

| Setting | Value |
|---|---|
| Cluster tier | M0 (free) — no credit card required |
| Region | Choose closest to your Render region |
| TLS | Enforced (Atlas default) |
| IP allowlist | Add `0.0.0.0/0` (allow all IPs) for Render free tier — Render does not provide static IPs on free tier |

> **Note on IP allowlist:** Allowing all IPs (`0.0.0.0/0`) is acceptable for a portfolio/demo project. MongoDB authentication (username + password in the connection string) still protects the database. For a production product, use Render's static IP add-on or upgrade Atlas to restrict IPs.

---

## 4. Frontend — Web (React)

### 4.1 Project Setup

```bash
# Scaffold the client
npm create vite@latest client --template react-ts
cd client && npm install

# Core dependencies
npm install react-router-dom@6 @reduxjs/toolkit react-redux
npm install -D tailwindcss @tailwindcss/forms
npm install date-fns date-fns-tz
npm install react-hook-form @hookform/resolvers zod
npm install recharts
npm install react-hot-toast
npm install axios
```

### 4.2 State Management Architecture

Redux Toolkit is the sole state manager. No local component state for server data — all server state flows through RTK Query.

**Store slices:**

| Slice | Responsibility |
|---|---|
| `authSlice` | Current user, token state, auth status |
| `habitsSlice` | Habit list, today's status, reorder position |
| `checkInsSlice` | Today's check-in records, pending actions |
| `statsSlice` | Weekly/monthly analytics cache |
| `todosSlice` | To-do task list and filters |
| `uiSlice` | Modal state, active tab, loading indicators |

**RTK Query API definition** (`client/src/api/velvetApi.ts`):
All data-fetching hooks generated from a single `createApi` base. Cache invalidation tags: `Habit`, `CheckIn`, `Todo`, `Stats`, `User`.

### 4.3 Routing Structure

```typescript
// React Router v6 route tree
<BrowserRouter>
  <Routes>
    <Route path="/" element={<AuthGuard />}>
      <Route index element={<HomePage />} />
      <Route path="stats" element={<StatsPage />} />
      <Route path="todos" element={<TodoPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="habits/new" element={<HabitWizard />} />
      <Route path="habits/:id" element={<HabitDetailPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </Routes>
</BrowserRouter>
```

`AuthGuard` checks for a valid access token; if absent, redirects to `/login`.

### 4.4 CSS / Theming

Tailwind CSS configured with the custom peacock design token palette as CSS variables in `globals.css`. Tailwind's config extends these tokens via `theme.extend.colors`. Dark mode uses Tailwind's `class` strategy (toggled via JS on `<html>`).

```css
/* client/src/globals.css */
:root {
  --vs-deep:    #003D40;
  --vs-teal:    #00838F;
  --vs-blue:    #006064;
  --vs-gold:    #FFD54F;
  --vs-feather: #4DD0E1;
  --vs-emerald: #00C853;
  --vs-rose:    #F48FB1;
  --vs-surface: #1A2E35;
  --vs-text:    #E0F7FA;
  --vs-muted:   #80CBC4;
}
```

Google Fonts loaded via `<link>` in `index.html`: Poppins (600, 700), Inter (400, 500), JetBrains Mono (400).

### 4.5 Habit Creation Wizard — Component Structure

The wizard is a stateful multi-step form managed by `react-hook-form` with a persisted draft in Redux (survives navigation).

```
<HabitWizard>
  ├── <WizardStep1_BasicInfo />     name, icon, color, category, desc
  ├── <WizardStep2_HabitType />     binary | quantitative + unit + weeklyTarget
  ├── <WizardStep3_Schedule />      schedule type picker + config panel
  ├── <WizardStep4_RestDays />      allow rest days toggle + slider
  └── <WizardStep5_Review />        plain-English summary + next 7 occurrences
```

Zod validation schemas are defined once per step in `client/src/validation/habitSchemas.ts` and reused in both the wizard form and server-side validation (schema is duplicated in `server/src/validation/habitSchemas.ts` — acceptable for a two-package project).

### 4.6 Calendar Component

Custom-built monthly calendar (no third-party calendar library). Requirements:

- Pure React + date-fns, no external dependencies
- Renders a 6×7 grid of day cells
- Each cell receives a `DayState` prop: `completed | missed | not_scheduled | rest_day | today_pending | future`
- Visual indicators per state as specified in PRD §15.1
- Navigation: prev/next month arrows + month/year dropdown
- Tapping a completed day fires `onDaySelect(date)` callback → shows check-in detail modal
- Fully keyboard navigable (arrow keys move focus between days, Enter selects)

### 4.7 Charts & Visualizations

All charts use **Recharts**. Required chart components:

| Component | Chart Type | Data Source |
|---|---|---|
| `WeeklyConsistencyChart` | LineChart (8-week rolling) | `/stats/weekly` |
| `HabitCompletionChart` | BarChart (side-by-side) | `/stats/weekly` |
| `QuantProgressChart` | LineChart (weekly totals vs target) | `/habits/:id/stats` |
| `StreakHistoryChart` | BarChart | `/habits/:id/stats` |
| `XPPerWeekChart` | BarChart | `/stats/weekly` |
| `AnnualHeatmap` | Custom SVG grid (52×7) | `/stats/heatmap` |
| `MonthlyHeatmap` | Custom calendar overlay | `/stats/monthly` |

The 365-day `AnnualHeatmap` is a custom SVG component (not Recharts) using `date-fns/eachDayOfInterval` to generate cells colored by intensity.

### 4.8 Peacock Avatar System

Ten SVG avatar illustrations stored inline as React components in `client/src/assets/avatars/`. Each is a self-contained SVG with named layers for animation hooks. No external image hosting required.

- Avatars 1–6: static SVG
- Avatars 7–9: CSS keyframe shimmer animation on `<animate>` elements
- Avatar 10 (Grand Peacock): CSS keyframe driven, full particle effect on render

Level-up transition: triggered by Redux state change `xp >= level.threshold`. A full-screen overlay `<LevelUpCelebration>` mounts, plays the feather burst particle animation (CSS keyframes), then unmounts after 3 seconds.

### 4.9 In-App Streak-at-Risk Banner

With no push notifications in v1, the Home page displays an in-app warning banner when:
- It is within 2 hours of the user's day boundary, AND
- There are uncompleted habits due today

```typescript
// Evaluated client-side on a 1-minute interval
const minutesUntilBoundary = getMinutesUntilBoundary(user.preferences);
const pendingHabits = habits.filter(h => h.todayStatus === 'pending');

if (minutesUntilBoundary <= 120 && pendingHabits.length > 0) {
  showStreakAtRiskBanner(
    `⚠ Day ends in ${minutesUntilBoundary} min — ${pendingHabits.length} habit(s) pending!`
  );
}
```

---

## 5. Backend — API (Node.js / Express)

### 5.1 Project Setup

```bash
# Scaffold the server
mkdir server && cd server
npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken cookie-parser
npm install nodemailer
npm install zod express-rate-limit cors helmet morgan winston node-cron
npm install -D typescript @types/node @types/express @types/bcryptjs
npm install -D @types/jsonwebtoken @types/cookie-parser @types/nodemailer
npm install -D @types/morgan @types/cors ts-node nodemon
```

### 5.2 Project Structure

```
server/
├── src/
│   ├── app.ts              # Express app factory
│   ├── server.ts           # HTTP server entry point
│   ├── config/
│   │   ├── env.ts          # Validated env vars (Zod)
│   │   └── db.ts           # Mongoose connection
│   ├── middleware/
│   │   ├── auth.ts         # JWT verification middleware
│   │   ├── rateLimiter.ts  # express-rate-limit configs
│   │   ├── errorHandler.ts # Global error handler
│   │   └── validate.ts     # Zod request validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── habit.routes.ts
│   │   ├── checkin.routes.ts
│   │   ├── restday.routes.ts
│   │   ├── todo.routes.ts
│   │   └── stats.routes.ts
│   ├── controllers/        # Route handlers (thin — delegate to services)
│   ├── services/           # Business logic (pure, testable)
│   │   ├── dayBoundary.service.ts
│   │   ├── scheduling.service.ts
│   │   ├── streak.service.ts
│   │   ├── gamification.service.ts
│   │   ├── stats.service.ts
│   │   └── email.service.ts
│   ├── models/             # Mongoose schemas
│   ├── cron/
│   │   └── streakEvaluator.cron.ts
│   ├── utils/
│   └── types/
├── .env
├── .env.example
└── package.json
```

### 5.3 Email Service — Nodemailer + Gmail

```typescript
// server/src/services/email.service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Velvet Streak" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your Velvet Streak account',
    html: `
      <h2>Welcome to Velvet Streak 🦚</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Velvet Streak" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your Velvet Streak password',
    html: `
      <h2>Password Reset 🔑</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });
}
```

### 5.4 Middleware Stack (in order)

```typescript
app.use(helmet());                    // Security headers
app.use(cors(corsOptions));           // CORS allowlist
app.use(cookieParser(COOKIE_SECRET)); // Signed cookies
app.use(express.json({ limit: '10kb' })); // Body parsing + size limit
app.use(morgan('combined', { stream: winstonStream })); // HTTP logging
app.use(globalRateLimiter);           // 100 req/min global
// Routes mounted here
app.use(errorHandler);                // Must be last
```

### 5.5 Request Validation Pattern

Every route uses a `validate(schema)` middleware that runs a Zod schema against `req.body`, `req.params`, and `req.query`. Validation failure returns HTTP 422 with structured error details.

```typescript
router.post('/habits',
  authenticate,
  validate(createHabitSchema),
  habitController.create
);
```

### 5.6 Rate Limiting Configuration

All rate limiting is in-memory via `express-rate-limit`. Counter resets on server restart — acceptable for a portfolio project.

| Limiter | Scope | Limit | Window |
|---|---|---|---|
| `globalLimiter` | All routes | 100 req | 1 min |
| `authLimiter` | `/auth/*` | 5 req | 15 min |
| `checkinLimiter` | `/checkins` | 30 req | 1 min |

### 5.7 Error Response Format

All errors follow a consistent envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "name", "issue": "Required" }
    ]
  }
}
```

**Standard error codes:**

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Zod schema failed |
| `UNAUTHORIZED` | 401 | Missing / invalid token |
| `FORBIDDEN` | 403 | Valid token, insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource (e.g. username taken) |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `BACKDATE_REJECTED` | 422 | Check-in date is outside current logical day |
| `REST_DAY_BUDGET_EXCEEDED` | 422 | Weekly rest day cap reached |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## 6. Database (MongoDB)

### 6.1 Connection Management

```typescript
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

Connection established once on server startup. App waits for confirmed connection before binding the HTTP server.

### 6.2 Schema Definitions

All schemas enforce strict mode (`{ strict: true, timestamps: true }`).

#### Users

```typescript
const UserSchema = new Schema({
  username:        { type: String, required: true, unique: true, minlength: 3, maxlength: 20, match: /^[a-zA-Z0-9_]+$/ },
  email:           { type: String, required: true, unique: true, lowercase: true },
  passwordHash:    { type: String, required: true },
  displayName:     { type: String, required: true },
  bio:             { type: String, maxlength: 160, default: '' },
  xp:              { type: Number, default: 0, min: 0 },
  level:           { type: Number, default: 1, min: 1, max: 10 },
  badgesEarned:    [{ badgeKey: String, earnedAt: Date }],
  preferences: {
    timezone:           { type: String, default: 'UTC' },
    dayBoundaryTime:    { type: String, default: '03:00' },
    weekStartDay:       { type: String, enum: ['MON','SUN'], default: 'MON' },
    theme:              { type: String, enum: ['dark','light'], default: 'dark' },
  },
  // No oauthProviders in v1 — added in v2 with Google OAuth
  // No fcmTokens in v1 — added in v2 with push notifications
  refreshTokens:      [{ tokenHash: String, device: String, createdAt: Date, expiresAt: Date }],
  isEmailVerified:    { type: Boolean, default: false },
  emailVerifyToken:   { type: String, default: null },
  emailVerifyExpiry:  { type: Date, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetExpiry:{ type: Date, default: null },
  deletionRequestedAt:{ type: Date, default: null },
}, { timestamps: true });
```

#### Habits

```typescript
const HabitSchema = new Schema({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:       { type: String, required: true, maxlength: 80 },
  icon:       { type: String, required: true },
  color:      { type: String, required: true, match: /^#[0-9A-Fa-f]{6}$/ },
  category:   { type: String, enum: ['Fitness','Creative','Learning','Wellness','Social','Other'], required: true },
  description:{ type: String, maxlength: 300 },
  habitType:  { type: String, enum: ['binary','quantitative'], required: true },
  quantitative: {
    targetUnit:   String,
    weeklyTarget: Number,
  },
  schedule: {
    type:           { type: String, enum: ['daily','specific_days','times_per_week','interval','times_per_day','times_per_month'], required: true },
    days:           [{ type: String, enum: ['MON','TUE','WED','THU','FRI','SAT','SUN'] }],
    timesPerDay:    { type: Number, default: 1, min: 1, max: 20 },
    timeWindows:    [{ label: String, windowStart: String, windowEnd: String }],
    intervalDays:   Number,
    timesPerWeek:   Number,
    timesPerMonth:  Number,
  },
  restDayConfig: {
    allowed:    { type: Boolean, required: true },
    maxPerWeek: { type: Number, min: 1, max: 3, default: null },
  },
  // No reminderTimes in v1 — added in v2 with push notifications
  sortOrder:           { type: Number, default: 0 },
  startDate:           { type: Date, required: true, immutable: true },
  currentStreak:       { type: Number, default: 0 },
  longestStreak:       { type: Number, default: 0 },
  totalCheckIns:       { type: Number, default: 0 },
  lastCheckInLogicalDate: String,
}, { timestamps: true });

HabitSchema.index({ userId: 1, sortOrder: 1 });
```

#### CheckIns

```typescript
const CheckInSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  habitId:     { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
  logicalDate: { type: String, required: true, index: true },  // YYYY-MM-DD
  slotIndex:   { type: Number, default: 0 },
  amount:      Number,    // quantitative only
  note:        { type: String, maxlength: 200 },
  xpAwarded:   { type: Number, default: 0 },
}, { timestamps: true });

CheckInSchema.index({ userId: 1, habitId: 1, logicalDate: 1, slotIndex: 1 }, { unique: true });
```

#### RestDays

```typescript
const RestDaySchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  habitId:     { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  logicalDate: { type: String, required: true },
  weekLabel:   { type: String, required: true },   // ISO week: YYYY-WXX
}, { timestamps: true });

RestDaySchema.index({ userId: 1, habitId: 1, logicalDate: 1 }, { unique: true });
```

#### Todos

```typescript
const TodoSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true, maxlength: 200 },
  description: String,
  deadline:    { type: Date, required: true, index: true },
  priority:    { type: String, enum: ['critical','high','medium','low'], required: true },
  category:    String,
  subtasks:    [{ id: String, title: String, isCompleted: { type: Boolean, default: false } }],
  // No reminder field in v1 — added in v2 with push notifications
  isCompleted: { type: Boolean, default: false, index: true },
  completedAt: Date,
  xpAwarded:   Number,
}, { timestamps: true });

TodoSchema.index({ userId: 1, deadline: 1 });
TodoSchema.index({ userId: 1, isCompleted: 1 });
```

### 6.3 Data Integrity Rules

- `startDate` on Habit is set `immutable: true` — Mongoose rejects any PATCH that attempts to change it
- `logicalDate` in CheckIns is always validated server-side against the user's current logical day before write
- Cascade delete on Habit: when a Habit document is deleted, a Mongoose `post('deleteOne')` hook fires a bulk delete on CheckIns and RestDays for that `habitId`
- Refresh tokens stored as bcrypt hash (12 rounds); raw token only sent to client once
- Email verification and password reset tokens stored as bcrypt hashes; only the raw token is sent via email

---

## 7. Authentication & Session Management

### 7.1 Registration Flow

```
Client                          Server
  │── POST /auth/register ──────▶│
  │   { email, password,         │  1. Validate input (Zod)
  │     username, displayName }  │  2. Check email + username uniqueness
  │                              │  3. bcrypt hash password (12 rounds)
  │                              │  4. Create User document
  │                              │  5. Generate email verification token
  │                              │     (crypto.randomBytes(32).toString('hex'))
  │                              │  6. Hash token → store in user doc with 24hr expiry
  │                              │  7. Send verification email (Nodemailer + Gmail)
  │◀── 201 { message } ──────────│
```

### 7.2 Login Flow

```
Client                          Server
  │── POST /auth/login ──────────▶│
  │   { email, password }         │  1. Find user by email
  │                               │  2. Check isEmailVerified — reject with 403 if false
  │                               │  3. bcrypt.compare(password, hash)
  │                               │  4. Generate access token (JWT, 15m)
  │                               │  5. Generate refresh token (random 48 bytes)
  │                               │  6. Hash refresh token → store in user.refreshTokens[]
  │                               │  7. Set refresh token as HTTP-only cookie
  │◀── 200 { accessToken, user } ─│
  │    Set-Cookie: rt=<token>      │
```

Access token payload:
```json
{ "sub": "<userId>", "iat": 1234567890, "exp": 1234568790 }
```

### 7.3 Token Refresh Flow

```
Client                          Server
  │── POST /auth/refresh ─────────▶│
  │   Cookie: rt=<refreshToken>    │  1. Read refresh token from cookie
  │                                │  2. Find matching hash in user.refreshTokens[]
  │                                │  3. Verify not expired
  │                                │  4. Rotate: delete old token, generate new pair
  │                                │  5. Set new refresh cookie
  │◀── 200 { accessToken } ────────│
```

### 7.4 Email Verification

- Token: `crypto.randomBytes(32).toString('hex')`
- Stored hashed in the User document with 24-hour expiry
- Unverified users can log in but see a persistent banner prompting verification
- Sensitive actions (account deletion, data export) require verified email
- Verification link: `https://velvetstreak.vercel.app/verify-email?token=<raw>`

### 7.5 Password Reset

- Reset token: `crypto.randomBytes(32).toString('hex')`, stored hashed, 1-hour expiry
- Rate-limited: max 3 reset requests per email per hour (in-memory counter)
- Reset link: `https://velvetstreak.vercel.app/reset-password?token=<raw>`

### 7.6 Session List (Active Devices)

`user.refreshTokens[]` stores `device` string (User-Agent parsed to readable name) and `createdAt`. Settings page calls `GET /users/me` to render the list. `DELETE /auth/sessions/:tokenId` invalidates a specific session.

> **No Google OAuth in v1.** This entire subsection is removed. OAuth will be added in v2 alongside the Android app, where it makes more sense to support it on both platforms simultaneously.

---

## 8. Day Boundary Engine

This is the most critical correctness requirement in the system.

### 8.1 Core Logic

```typescript
// server/src/services/dayBoundary.service.ts

import { parseISO, format, addDays, setHours, setMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

interface UserPrefs {
  timezone: string;        // IANA tz string e.g. "Asia/Kolkata"
  dayBoundaryTime: string; // "HH:MM" e.g. "03:00"
}

/**
 * Returns the current logical date label (YYYY-MM-DD) for a user.
 */
export function getCurrentLogicalDate(prefs: UserPrefs, nowUtc: Date = new Date()): string {
  const [boundaryHour, boundaryMin] = prefs.dayBoundaryTime.split(':').map(Number);
  const tz = prefs.timezone;

  const localNow = toZonedTime(nowUtc, tz);

  const todayBoundaryStart = setMinutes(setHours(new Date(localNow), boundaryHour), boundaryMin);
  todayBoundaryStart.setSeconds(0, 0);

  if (localNow < todayBoundaryStart) {
    const yesterday = addDays(localNow, -1);
    return format(yesterday, 'yyyy-MM-dd');
  }

  return format(localNow, 'yyyy-MM-dd');
}

/**
 * Returns the UTC timestamps [start, end) for the current logical day window.
 */
export function getLogicalDayWindow(prefs: UserPrefs, nowUtc: Date = new Date()): { start: Date; end: Date } {
  const logicalDate = getCurrentLogicalDate(prefs, nowUtc);
  const tz = prefs.timezone;

  const windowStartLocal = parseISO(`${logicalDate}T${prefs.dayBoundaryTime}:00`);
  const windowStartUtc = fromZonedTime(windowStartLocal, tz);

  const nextDate = format(addDays(parseISO(logicalDate), 1), 'yyyy-MM-dd');
  const windowEndLocal = parseISO(`${nextDate}T${prefs.dayBoundaryTime}:00`);
  const windowEndUtc = fromZonedTime(windowEndLocal, tz);

  return { start: windowStartUtc, end: windowEndUtc };
}
```

### 8.2 Server-Side Check-In Validation

Every `POST /checkins` request runs:

```typescript
const computedDate = getCurrentLogicalDate(user.preferences);
const requestedDate = req.body.logicalDate; // YYYY-MM-DD from client

if (requestedDate !== computedDate) {
  throw new AppError('BACKDATE_REJECTED', 422,
    'Check-ins can only be logged for the current logical day.');
}
```

The server independently computes the correct date and rejects mismatches. The server never trusts the client's date.

### 8.3 Cron Job — Streak Evaluation

A single `node-cron` job runs every minute:

```typescript
// server/src/cron/streakEvaluator.cron.ts
import cron from 'node-cron';

cron.schedule('* * * * *', async () => {
  const nowUtc = new Date();
  const users = await User.find({ /* boundary-time matching query */ });

  for (const user of users) {
    const yesterday = getPreviousLogicalDate(user.preferences, nowUtc);
    const habits = await Habit.find({ userId: user._id });

    for (const habit of habits) {
      const wasScheduled = isHabitScheduledForDate(habit, yesterday);
      if (!wasScheduled) continue;

      const checkIn = await CheckIn.findOne({ habitId: habit._id, logicalDate: yesterday });
      const restDay = await RestDay.findOne({ habitId: habit._id, logicalDate: yesterday });

      if (!checkIn && !restDay) {
        await Habit.updateOne({ _id: habit._id }, { $set: { currentStreak: 0 } });
      }
    }
  }
});
```

### 8.4 Streak Recovery After Server Downtime

Because Render free tier can occasionally spin down (if UptimeRobot fails to ping), a streak recovery check runs on every `GET /stats/dashboard` call:

```typescript
// Recalculate streak for any habit where lastCheckInLogicalDate is unexpectedly old
// This corrects any streaks that were missed by the cron job during downtime
async function recalculateStreakIfNeeded(habit: Habit, userPrefs: UserPrefs): Promise<void> {
  const today = getCurrentLogicalDate(userPrefs);
  const yesterday = getPreviousLogicalDate(userPrefs);

  if (habit.currentStreak > 0 &&
      habit.lastCheckInLogicalDate !== today &&
      habit.lastCheckInLogicalDate !== yesterday) {
    // Gap detected — streak should have been reset
    await Habit.updateOne({ _id: habit._id }, { $set: { currentStreak: 0 } });
  }
}
```

---

## 9. Habit Scheduling Engine

### 9.1 `isHabitScheduledForDate(habit, date): boolean`

Returns whether a given habit is scheduled on a given logical date. Used by: streak evaluator, home page filtering, calendar rendering, stats calculation.

```typescript
export function isHabitScheduledForDate(habit: Habit, logicalDate: string): boolean {
  const date = parseISO(logicalDate);
  const dayOfWeek = format(date, 'EEE').toUpperCase(); // 'MON', 'TUE', etc.

  switch (habit.schedule.type) {
    case 'daily':
      return true;

    case 'specific_days':
      return habit.schedule.days.includes(dayOfWeek);

    case 'weekdays':
      return ['MON','TUE','WED','THU','FRI'].includes(dayOfWeek);

    case 'weekends':
      return ['SAT','SUN'].includes(dayOfWeek);

    case 'interval': {
      const startDate = parseISO(format(habit.startDate, 'yyyy-MM-dd'));
      const diff = differenceInCalendarDays(date, startDate);
      return diff >= 0 && diff % habit.schedule.intervalDays === 0;
    }

    case 'times_per_week':
    case 'times_per_month':
      return true; // Flexible — every day is potentially schedulable

    case 'times_per_day':
      return true;

    default:
      return false;
  }
}
```

### 9.2 Weekly / Monthly Flexible Schedule Evaluation

For `times_per_week` and `times_per_month`, the streak is evaluated per-period:

- **times_per_week:** At end of week boundary, count check-ins for that ISO week. If count >= `timesPerWeek`, streak increments by 1. If not, streak resets.
- **times_per_month:** At end of calendar month, count check-ins for that month. If count >= `timesPerMonth`, streak increments. If not, streak resets.

### 9.3 Next Occurrence Calculation

Used in the wizard "Next 7 occurrences" preview:

```typescript
export function getNextOccurrences(habit: Partial<Habit>, count: number, fromDate: Date): Date[] {
  const results: Date[] = [];
  let cursor = fromDate;

  while (results.length < count) {
    cursor = addDays(cursor, 1);
    const label = format(cursor, 'yyyy-MM-dd');
    if (isHabitScheduledForDate(habit as Habit, label)) {
      results.push(cursor);
    }
    if (differenceInCalendarDays(cursor, fromDate) > 1000) break; // safety
  }

  return results;
}
```

---

## 10. Streak Calculation Engine

### 10.1 Streak Increment (at Check-In Time)

When a check-in is successfully saved (completing all required slots for the day):

```typescript
async function handleStreakOnCheckIn(habitId: string, logicalDate: string) {
  const habit = await Habit.findById(habitId);
  const yesterday = getPreviousLogicalDate(habit.userId, logicalDate);
  const previousDayCovered = await isDayCovered(habitId, yesterday);

  const isFirstDay = !habit.lastCheckInLogicalDate;
  const streakContinues = isFirstDay || previousDayCovered ||
                          !isHabitScheduledForDate(habit, yesterday);

  const newStreak = streakContinues ? habit.currentStreak + 1 : 1;

  await Habit.updateOne({ _id: habitId }, {
    $set: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, habit.longestStreak),
      lastCheckInLogicalDate: logicalDate,
    },
    $inc: { totalCheckIns: 1 }
  });
}
```

`isDayCovered(habitId, date)` returns true if a CheckIn or RestDay record exists for that date.

---

## 11. Gamification Engine (XP, Levels, Badges)

### 11.1 XP Award Service

```typescript
// server/src/services/gamification.service.ts

export async function awardXP(userId: string, amount: number, reason: string): Promise<void> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: amount } },
    { new: true }
  );

  await checkLevelUp(user);
  await checkBadges(user, reason);
}
```

### 11.2 Level-Up Check

```typescript
const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];

async function checkLevelUp(user: User): Promise<void> {
  const newLevel = LEVEL_THRESHOLDS.filter(t => user.xp >= t).length;

  if (newLevel > user.level) {
    await User.updateOne({ _id: user._id }, { $set: { level: newLevel } });
    // levelledUp: true is included in the check-in API response
    // Client reads this and triggers the full-screen feather burst animation
  }
}
```

### 11.3 Badge Evaluation

```typescript
const BADGE_EVALUATORS: Record<string, (user: User, context: string) => Promise<boolean>> = {
  'first_feather':    async (u) => await CheckIn.countDocuments({ userId: u._id }) === 1,
  'on_fire':          async (u) => await Habit.exists({ userId: u._id, currentStreak: { $gte: 7 } }),
  'diamond_habit':    async (u) => await Habit.exists({ userId: u._id, currentStreak: { $gte: 30 } }),
  'century':          async (u) => (await aggregateTotalCheckIns(u._id)) >= 100,
  'night_owl':        async (u, ctx) => ctx === 'late_checkin',
  // ... all badge evaluators
};

async function checkBadges(user: User, context: string): Promise<void> {
  const earnedKeys = user.badgesEarned.map(b => b.badgeKey);
  const allBadges = await Badge.find({ key: { $nin: earnedKeys } });

  for (const badge of allBadges) {
    const evaluator = BADGE_EVALUATORS[badge.triggerKey];
    if (!evaluator) continue;

    const earned = await evaluator(user, context);
    if (earned) {
      await User.updateOne(
        { _id: user._id },
        { $push: { badgesEarned: { badgeKey: badge.key, earnedAt: new Date() } } }
      );
    }
  }
}
```

### 11.4 Daily Bonus — "All Habits Done Today"

After every check-in, the server checks if all habits scheduled for today are now complete. If yes, award `+25 XP` daily bonus — idempotent, stored per `userId + logicalDate` to prevent double-awarding.

### 11.5 Event Communication to Client (v1)

With no push notifications in v1, events are communicated via:
1. **API response payload**: the check-in `POST` response includes `levelledUp: boolean`, `newBadges: Badge[]`, and `xpAwarded: number`
2. **Client-side in-app UI**: the client reads these fields and triggers animations/toasts
3. **Polling**: `GET /stats/dashboard` (called on page focus / every 60 seconds) surfaces events between sessions

---

## 12. Statistics & Analytics Engine

### 12.1 Consistency Score Calculation

```typescript
export async function calculateWeeklyConsistencyScore(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<number> {
  const habits = await Habit.find({ userId, startDate: { $lte: weekEnd } });

  let totalExpected = 0, totalLogged = 0, perfectHabits = 0, zeroHabits = 0;

  for (const habit of habits) {
    const scheduledDays = getScheduledDaysInRange(habit, weekStart, weekEnd);
    const checkIns = await CheckIn.find({ habitId: habit._id, logicalDate: { $in: scheduledDays } });
    const restDays = await RestDay.find({ habitId: habit._id, logicalDate: { $in: scheduledDays } });

    const covered = new Set([
      ...checkIns.map(c => c.logicalDate),
      ...restDays.map(r => r.logicalDate)
    ]).size;

    totalExpected += scheduledDays.length;
    totalLogged += covered;

    if (covered === scheduledDays.length && scheduledDays.length > 0) perfectHabits++;
    if (covered === 0 && scheduledDays.length > 0) zeroHabits++;
  }

  if (totalExpected === 0) return 100;

  const base = (totalLogged / totalExpected) * 100;
  const bonus = perfectHabits * 5;
  const penalty = zeroHabits * 3;

  return Math.min(100, Math.max(0, Math.round(base + bonus - penalty)));
}
```

### 12.2 Stats Caching

Stats endpoints that perform heavy aggregation are cached in-process using a `Map<string, { data, expiresAt }>` keyed on `userId + params`. Cache TTL: 5 minutes. Cache is stored in the Node.js process memory — it resets on server restart, which is fine for a portfolio project.

### 12.3 Annual Heatmap Data

`GET /stats/heatmap?year=YYYY` returns an array of 365 entries:

```json
[
  { "date": "2026-01-01", "count": 3 },
  { "date": "2026-01-02", "count": 0 },
  ...
]
```

`count` = number of distinct habits with a check-in on that date. Queried via MongoDB aggregation pipeline.

---

## 13. To-Do Module

### 13.1 Business Rules

- A task's `deadline` is required and must be a future date at creation time
- `subtasks` array max length: 20 items
- Completing a task with incomplete subtasks: allowed — subtasks are informational
- XP is awarded once per task on `PATCH /todos/:id/complete`; subsequent toggles do not re-award
- Completed tasks are retained for 30 days then soft-deleted (a nightly cron sets `isArchived: true`)
- The `reminder` field is **not included in v1** — added in v2 with push notifications

### 13.2 View Queries

| View | Query |
|---|---|
| Today | `deadline <= end_of_today OR (isCompleted=false AND deadline < now)` |
| Upcoming | `deadline > end_of_today AND deadline <= now+7days AND isCompleted=false` |
| All | All non-archived, sorted by deadline ASC |
| Completed | `isCompleted=true`, last 30 days |

---

## 14. API Contracts

### 14.1 Standard Response Envelope

All successful responses:
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "total": 42 }
}
```

### 14.2 Key Request / Response Schemas

**POST /habits (Create Habit)**

Request body:
```json
{
  "name": "Morning Run",
  "icon": "🏃",
  "color": "#00838F",
  "category": "Fitness",
  "description": "5km before work",
  "habitType": "quantitative",
  "quantitative": { "targetUnit": "km", "weeklyTarget": 25 },
  "schedule": {
    "type": "specific_days",
    "days": ["MON","WED","FRI","SAT"],
    "timesPerDay": 1
  },
  "restDayConfig": { "allowed": true, "maxPerWeek": 1 }
}
```

Response 201:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "startDate": "2026-05-18",
    "currentStreak": 0
  }
}
```

**POST /checkins (Log Check-In)**

Request body:
```json
{
  "habitId": "...",
  "logicalDate": "2026-05-18",
  "slotIndex": 0,
  "amount": 6.2,
  "note": "Felt great today"
}
```

Response 201:
```json
{
  "success": true,
  "data": {
    "checkIn": { "_id": "...", "xpAwarded": 10 },
    "habit": { "currentStreak": 15, "longestStreak": 21 },
    "user": { "xp": 1420, "level": 5, "levelledUp": false },
    "newBadges": []
  }
}
```

**GET /stats/dashboard**

Response 200:
```json
{
  "success": true,
  "data": {
    "logicalDate": "2026-05-18",
    "habits": {
      "dueToday": [],
      "completedToday": [],
      "notScheduledToday": []
    },
    "streakSnapshot": {
      "longestCurrentStreak": 15,
      "habitsOnStreak": 3
    },
    "xp": { "total": 1420, "level": 5, "toNextLevel": 580 },
    "todayXPEarned": 45
  }
}
```

---

## 15. Security Requirements

### 15.1 Transport Security
- HTTPS enforced everywhere — Vercel and Render both provide TLS automatically, no configuration needed

### 15.2 Cookie Security
```
Set-Cookie: rt=<token>; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=2592000
```

### 15.3 HTTP Security Headers (via Helmet)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`: Strict policy, whitelist only known origins
- `Referrer-Policy: no-referrer`

### 15.4 Input Sanitization
- Zod validates all request bodies before any business logic executes
- `maxlength` constraints enforced at both Zod schema and Mongoose schema levels
- No `$where` queries; typed Mongoose queries prevent MongoDB injection

### 15.5 CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};
```

### 15.6 Secrets Management
- No secrets in source code or committed `.env` files
- `.env` is in `.gitignore` from day one
- Production secrets entered in Render dashboard (server) and Vercel dashboard (client)
- `.env.example` committed with placeholder values so other developers can see what's needed

---

## 16. Performance Requirements

| Metric | Target | Notes |
|---|---|---|
| API P95 response (CRUD, warm) | < 300ms | Warm Render instance |
| API P95 response (cold start) | < 35 seconds | Render free tier spin-up; acceptable for portfolio |
| Stats aggregation endpoint | < 1,000ms | |
| Web LCP (desktop) | < 2,500ms | |
| Check-in round-trip (warm) | < 500ms | |

> The cold start penalty on Render free tier is the main UX degradation point. UptimeRobot mitigates this for regular users. For demo/interview situations, open the app once yourself before showing it so the instance is warm.

### 16.1 Database Query Optimization
- All queries use indexed fields
- `CheckIn` queries always include `userId + habitId` to hit the compound index
- Stats aggregation pipelines use `$match` as early stage before `$group`
- Pagination on all list endpoints (default page size: 50)

### 16.2 Asset Optimization
- Vite code-splitting per route; each page chunk < 100KB gzipped
- Avatar SVGs inlined at build time (no runtime fetch)
- Fonts loaded with `font-display: swap`

---

## 17. Error Handling & Logging

### 17.1 Global Error Handler (Express)

```typescript
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const appError = err instanceof AppError ? err : new AppError('INTERNAL_ERROR', 500, err.message);

  logger.error({
    code: appError.code,
    status: appError.statusCode,
    message: appError.message,
    path: req.path,
    method: req.method,
    userId: (req as any).user?._id,
    stack: appError.statusCode === 500 ? err.stack : undefined,
  });

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details ?? [],
    }
  });
}
```

> **No Sentry in v1.** All errors are logged by Winston. Server logs are visible in real-time in the Render dashboard (under "Logs" tab). This is entirely sufficient for a portfolio project. Sentry can be added in v2 if you want to monitor a production audience.

### 17.2 Winston Logger Configuration

```typescript
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
```

> File transports are omitted for Render deployment — Render's ephemeral filesystem does not persist between deploys. Console transport is sufficient; Render captures and displays all stdout/stderr in its dashboard log viewer.

### 17.3 Health Check Endpoint

```
GET /health
→ 200 { "status": "ok", "db": "connected", "uptime": 3600 }
```

Used by UptimeRobot for keep-alive pings.

---

## 18. Testing Requirements

### 18.1 Backend Testing

**Framework:** Jest + Supertest

| Test Type | Coverage Target | Notes |
|---|---|---|
| Unit tests | 80%+ statements | Services, utilities, day boundary logic |
| Integration tests | All API routes | Supertest with in-memory MongoDB (mongodb-memory-server) |
| Cron job tests | Streak evaluation scenarios | Time-mocking with `jest.useFakeTimers` |

**Critical test scenarios — Day Boundary Engine:**
- User in UTC+5:30, boundary 03:00 → check-in at 01:00 local = still yesterday
- User in UTC-8, boundary 02:00 → check-in at 23:59 local = today (pre-boundary)
- DST transition dates (spring forward / fall back)

**Critical test scenarios — Streak Engine:**
- Streak continues across non-scheduled days
- Streak breaks when scheduled day is missed
- Rest day preserves streak, consumes budget
- Streak resets to 1 (not 0) on first check-in after break

### 18.2 Frontend Testing

**Framework:** Vitest + React Testing Library

| Test Type | Coverage Target |
|---|---|
| Component unit tests | All shared UI components |
| Wizard flow tests | Full 5-step habit creation happy path + validation errors |
| RTK Query mock tests | All data-fetching hooks with mocked responses |

> Playwright E2E tests are optional for v1. The testing overhead is acceptable to skip for a solo portfolio project. Add them in v2 if the project grows.

---

## 19. Deployment & DevOps

### 19.1 One-Time Setup Checklist

This is the complete infrastructure setup. Do it once, then deployment is automatic forever after.

**Step 1 — MongoDB Atlas**
1. Create a free account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free M0 cluster (choose a region close to your Render region)
3. Create a database user (username + password) → save these
4. Under Network Access → add IP `0.0.0.0/0` (allow all)
5. Get your connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/velvetstreak`

**Step 2 — Gmail App Password**
1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords → create one → copy the 16-character password

**Step 3 — GitHub**
1. Create a GitHub repository
2. Push your project (`client/` and `server/` folders in the root)

**Step 4 — Vercel (frontend)**
1. Sign up at [vercel.com](https://vercel.com) with your GitHub account
2. Click "New Project" → import your GitHub repo
3. Set Root Directory to `client`
4. Add environment variable: `VITE_API_BASE_URL` = your Render URL (you'll get this in step 5)
5. Deploy — Vercel gives you a URL like `https://velvetstreak.vercel.app`

**Step 5 — Render (backend)**
1. Sign up at [render.com](https://render.com) with your GitHub account
2. Click "New Web Service" → connect your GitHub repo
3. Set Root Directory to `server`
4. Build command: `npm install && npm run build`
5. Start command: `node dist/server.js`
6. Add all server environment variables from §3.2
7. Set `CORS_ALLOWED_ORIGINS` to your Vercel URL from step 5
8. Deploy — Render gives you a URL like `https://velvetstreak.onrender.com`
9. Go back to Vercel and update `VITE_API_BASE_URL` to this Render URL → redeploy

**Step 6 — UptimeRobot (keep-alive)**
1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. Add New Monitor → HTTP(s) monitor
3. URL: `https://velvetstreak.onrender.com/health`
4. Monitoring interval: 5 minutes
5. Done — your Render instance will stay warm

### 19.2 Ongoing Deployment

After the one-time setup, deployment is:

```bash
git add .
git commit -m "your message"
git push origin main
```

That's it. Vercel and Render detect the push and auto-deploy within 2–3 minutes. No CLI, no Docker, no scripts to run.

### 19.3 Local Development

```bash
# Terminal 1 — start the server
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev            # nodemon watches for changes

# Terminal 2 — start the client
cd client
npm install
cp .env.example .env   # fill in VITE_API_BASE_URL=http://localhost:8080/v1
npm run dev            # Vite starts on http://localhost:5173
```

---

## 20. Accessibility Requirements

The web application must conform to **WCAG 2.1 Level AA**.

| Requirement | Implementation |
|---|---|
| Color contrast ≥ 4.5:1 | Verified against all peacock palette combinations |
| Keyboard navigation | All interactive elements reachable via Tab; logical focus order |
| Focus indicators | Visible `:focus-visible` ring on all interactive elements |
| ARIA labels | All icon-only buttons have `aria-label`; status indicators have `role="status"` |
| Screen reader support | Semantic HTML; habit card list as `<ul>/<li>`; headings in logical order |
| Motion | Animations respect `prefers-reduced-motion` media query |
| Form errors | Error messages associated with inputs via `aria-describedby` |
| Live regions | XP toast notifications use `role="alert"` |

---

## 21. Data Privacy & Compliance

### 21.1 GDPR Requirements

| Requirement | Implementation |
|---|---|
| Data export | `GET /users/me/export` returns full user data as JSON |
| Account deletion | 7-day grace period; nightly cron purges all documents for users where `deletionRequestedAt < now - 7days` |
| Consent | Terms of Service + Privacy Policy acceptance checkbox required at registration |
| Data minimization | No analytics beyond product features; no third-party ad trackers |

### 21.2 Data Retention

| Data Type | Retention |
|---|---|
| Active user data | Indefinite (while account active) |
| Completed to-do tasks | 30 days post-completion |
| Server logs | Visible in Render dashboard for ~7 days (Render free tier) |
| Deleted account data | Purged within 7 days of deletion request |

---

## 22. Android App — v2 Technical Scope

This section is a planning reference for v2. No Android code is written in v1.

### 22.1 Framework & Approach
- React Native with Expo (bare workflow)
- `client/` web app and `mobile/` app coexist in the same repo
- All authentication, scheduling, and stats logic remains server-side — no changes to the API

### 22.2 New Features Added in v2 (both web and Android)
- **Google OAuth:** Added to the server via Passport.js GoogleStrategy; login button added to the web app and Android app simultaneously
- **Push notifications:** FCM via Firebase Admin SDK; `fcmTokens` field added to User schema; `reminderTimes` field added to Habit schema

### 22.3 Offline Queue (Android)
- Check-ins attempted while offline are queued in Redux Persist + AsyncStorage
- `NetInfo` listener processes the queue on reconnect
- Conflict rule: server wins. If the queued check-in date no longer falls within the valid logical day window, the server rejects it with `BACKDATE_REJECTED` and the client reverts optimistic state

### 22.4 Build & Distribution (v2)
- Expo EAS Build for APK and AAB
- Google Play Store (internal → production)
- OTA JS updates via Expo EAS Update

---

## 23. Open Technical Decisions

| # | Decision | Options | Recommendation | Status |
|---|---|---|---|---|
| 1 | In-process stats cache vs Redis | Map-based TTL cache vs Redis | Ship with in-process; migrate in v2 if scale warrants | Decided (defer Redis) |
| 2 | Real-time sync mechanism | Polling vs WebSocket vs SSE | Polling (60s) in v1 | Decided |
| 3 | Rest day budget with interval schedules | Weekly budget doesn't map cleanly | Define: rest days disabled for interval habits | Open |
| 4 | Playwright E2E tests | v1 vs v2 | Defer to v2 | Decided (defer) |
| 5 | Google OAuth timing | v2 alongside Android | Add to both platforms simultaneously in v2 | Decided |
| 6 | Custom domain | Vercel free subdomain vs custom domain | Vercel provides free `.vercel.app` subdomain — sufficient for portfolio | Decided |
| 7 | Apple Sign-In | v2 vs v3 | v3 (Google OAuth sufficient) | Decided (defer) |

---

## Appendix A — What Changed from TRD v2

| Section | v2 | v3 (this document) | Reason |
|---|---|---|---|
| Architecture | Railway + Vercel | Render + Vercel | Render free tier needs no credit card; functionally equivalent |
| Email | SendGrid | Nodemailer + Gmail App Password | Zero external account setup; 2-minute configuration |
| Auth | Email + Google OAuth | Email + password only | OAuth removed from v1; added in v2 with Android |
| Project structure | npm workspaces monorepo (`/packages/web`, `/packages/api`, `/packages/shared`) | Two plain folders (`/client`, `/server`) | Eliminates workspace tooling; both are independent npm projects |
| CI/CD | GitHub Actions workflows | None | Vercel and Render auto-deploy on push; no pipeline needed |
| Error monitoring | Sentry | Winston console logs (visible in Render dashboard) | No account setup; sufficient visibility for a portfolio project |
| Rate limiting | In-memory (noted) | In-memory explicitly confirmed | Clarification only |
| Stats caching | In-memory Map | In-memory Map (file transports removed for Render) | Render filesystem is ephemeral; console-only logging |
| Deployment section | CI/CD pipeline YAML | Step-by-step setup guide | More useful for a solo developer |
| Keep-alive | Not documented | UptimeRobot setup included | Necessary for Render free tier |
| Streak recovery | Not documented | `recalculateStreakIfNeeded` on dashboard load | Guards against missed cron windows during downtime |
| Local dev | Implied | Explicit `npm run dev` instructions | Helpful for a student starting from scratch |

---

*Document Owner: Engineering Team*
*App: Velvet Streak — Keep track of your streaks*
*TRD Version: 3.0 — May 2026*
*Based on PRD: v4.0*
*Previous TRD Version: 2.0*
*Next Review: June 2026*
