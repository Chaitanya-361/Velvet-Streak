<div align="center">

# 🦚 Velvet Streak

### *Build habits. Earn XP. Level up your life.*

A full-stack, gamified habit tracking application with streaks, XP leveling, badges, a zen focus timer, to-do management, and rich analytics — built with **React**, **TypeScript**, **Node.js**, **Express**, and **MongoDB**.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

</div>

## ✨ Features at a Glance

| Category | Features |
|:---------|:---------|
| **🏠 Dashboard** | Daily habit overview, motivational quotes, quick stats (best streak, habits on fire, today's progress), XP progress bar |
| **📋 Habit Tracking** | Create/edit/delete habits with a 5-step wizard, check-in with one tap, undo check-ins, rest day support |
| **🔥 Streaks** | Automatic streak calculation, current & longest streak tracking, streak-preserving rest days |
| **🎮 Gamification** | XP rewards for check-ins, 10-level progression system with titles (Hatchling → Grand Peacock), 17 unlockable badges |
| **🧘 Zen Mode** | Focus timer with animated circular stopwatch, session persistence, weekly per-day breakdown side panel |
| **📊 Statistics** | Weekly consistency scores, per-habit completion rates, 8-week trend charts, annual activity heatmap, zen focus totals |
| **✅ To-Do Manager** | Create tasks with deadlines & priorities, subtask support, search & filter (Today/Upcoming/All/Completed), overdue detection |
| **👤 Profile** | User avatar & bio, badge showcase, habit roster, lifetime stats overview |
| **⚙️ Settings** | Configurable day boundary time, timezone support, week start day (Mon/Sun), account deletion |
| **🔐 Auth** | JWT access + refresh tokens, secure cookie-based refresh, bcrypt password hashing, auto token renewal |

---

## 🏗️ Architecture

```
VelvetStreak/
├── client/                    # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── api/               # API client with auto-refresh
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth context provider
│   │   ├── layouts/           # App & Auth layouts
│   │   ├── pages/             # Route pages
│   │   └── types/             # Shared TypeScript interfaces
│   └── tailwind.config.js     # Design system tokens
│
├── server/                    # Express REST API (TypeScript)
│   ├── src/
│   │   ├── config/            # Environment variables
│   │   ├── controllers/       # Route handlers (8 controllers)
│   │   ├── middleware/        # Auth, rate limiting, validation, error handling
│   │   ├── models/            # Mongoose schemas (7 models)
│   │   ├── routes/            # Express routers (8 route files)
│   │   ├── services/          # Business logic (gamification, scheduling, day boundary)
│   │   └── types/             # Shared TypeScript interfaces
│   └── package.json
```

---

## 🎯 Core Feature Deep Dive

### 📋 Habit Creation Wizard (5-Step Flow)

A guided multi-step wizard for creating habits:

1. **Basic Info** — Name, icon (20 emojis), color (10 palette options), category (Fitness/Creative/Learning/Wellness/Social/Other), description
2. **Habit Type** — Binary (done/not done) or Quantitative (track amounts like km, pages, minutes)
3. **Schedule** — 6 schedule types: Daily, Specific days, X times/week, Every N days, Multiple times/day, X times/month
4. **Rest Days** — Optional streak-safe rest days with configurable weekly limits (1–3 max)
5. **Review & Create** — Summary card with all selections before confirming

### 🎮 Gamification System

| Level | Title | XP Required |
|:-----:|:------|:-----------:|
| 1 | Hatchling | 0 |
| 2 | Fledgling | 200 |
| 3 | Feathered | 500 |
| 4 | Preening | 1,000 |
| 5 | Strutter | 2,000 |
| 6 | Plume Bearer | 4,000 |
| 7 | Iridescent | 7,000 |
| 8 | Crowned | 12,000 |
| 9 | Resplendent | 20,000 |
| 10 | Grand Peacock | 35,000 |

### 🏅 Badges (17 Unlockable Achievements)

| Badge | Name | Condition | XP Reward |
|:-----:|:-----|:----------|:---------:|
| 🦚 | First Feather | Complete your first check-in | 10 |
| 🔥 | On Fire | 7-day streak on any habit | 50 |
| 💎 | Diamond Habit | 30-day streak on any habit | 200 |
| 🏆 | Century | 100 total check-ins | 100 |
| ✨ | Perfect Week | 100% completion for a full week | 75 |
| 🌟 | Perfect Month | 100% completion all month | 500 |
| 🌈 | Rainbow | Check-ins across 5 categories | 50 |
| 🏃 | Athlete | 50 Fitness check-ins | 75 |
| 🎨 | Creator | 50 Creative check-ins | 75 |
| 📖 | Scholar | 50 Learning check-ins | 75 |
| 🧘 | Zen Master | 50 Wellness check-ins | 75 |
| ⚡ | Comeback King | Resume after 7+ day gap | 50 |
| 📅 | Milestone 365 | 365-day streak | 1,000 |
| ✅ | To-Do Hero | Complete 50 tasks | 75 |
| 🦉 | Night Owl | Check-in between 12–3 AM | 20 |
| 🎯 | Target Crusher | Hit weekly target 4 weeks in a row | 100 |
| 🚀 | Overachiever | 150%+ of weekly target | 50 |

### 🧘 Zen Mode

A distraction-free focus timer for deep work sessions:
- **Animated circular stopwatch** with SVG progress ring (fills over 60 minutes)
- **Ambient pulsing glow** effect while the timer is running
- **One-tap start/stop** — sessions are auto-saved to the backend on stop
- **Weekly side panel** showing daily focus time bars (Mon–Sun) with "today" highlight
- **Stats integration** — total weekly focus time displayed on the Stats page

### 📊 Statistics & Analytics

- **Weekly consistency score** with comparison to the previous week
- **Per-habit completion rates** with color-coded progress bars
- **8-week consistency trend chart** (Recharts line chart)
- **Annual activity heatmap** (GitHub-style contribution grid)
- **Zen focus total** — weekly deep work time

### 📅 Habit Detail Page

- **Interactive calendar** with color-coded days (completed / missed / rest day / not scheduled)
- **Monthly navigation** — browse check-in history across months
- **Streak stats** — current streak, longest streak, rest day allowance
- **Weekly progress bar** for quantitative habits (e.g., 15/25 km this week)
- **Recent activity feed** showing individual check-ins with XP earned

---

## 🔒 Security & Backend Features

### Authentication

| Feature | Implementation |
|:--------|:--------------|
| Password Hashing | bcrypt with 12 salt rounds |
| Access Tokens | JWT (15-min expiry, Bearer header) |
| Refresh Tokens | JWT (30-day expiry, HTTP-only signed cookie) |
| Token Refresh | Automatic silent refresh on 401 responses |
| Session Restore | Persisted access token in `localStorage` with auto-validation on app load |

### Rate Limiting

| Limiter | Scope | Window | Max Requests |
|:--------|:------|:------:|:------------:|
| Global | All routes | 1 min | 100 |
| Auth | Login & Register | 15 min | 15 |
| Check-in | Check-in creation | 1 min | 30 |
| Zen | Zen session creation | 1 min | 60 |

### Additional Security

- **Helmet.js** — secure HTTP headers
- **CORS** — configurable origin whitelist with credentials support
- **Input Validation** — Zod schema validation on all endpoints
- **Error Handling** — centralized error handler with typed `AppError` codes
- **Cookie Signing** — signed cookies via `cookie-parser`

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|:-----------|:--------|
| **React 19** | UI framework with hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router 6** | Client-side routing |
| **Recharts** | Data visualization (line & bar charts) |
| **Lucide React** | Icon library |
| **React Hook Form + Zod** | Form handling & validation |
| **React Hot Toast** | Toast notifications |
| **date-fns** | Date utilities |

### Backend

| Technology | Purpose |
|:-----------|:--------|
| **Node.js + Express 4** | REST API server |
| **TypeScript** | Type-safe server code |
| **MongoDB + Mongoose 9** | Database & ODM |
| **JWT (jsonwebtoken)** | Access & refresh token auth |
| **bcrypt.js** | Password hashing |
| **express-rate-limit** | API rate limiting |
| **Helmet** | HTTP security headers |
| **Morgan** | HTTP request logging |
| **Zod** | Request body validation |

---

## 🗄️ Data Models

| Model | Description | Key Fields |
|:------|:------------|:-----------|
| **User** | Account & preferences | email, username, xp, level, badges, timezone, day boundary |
| **Habit** | Habit definitions | name, icon, color, category, schedule, streaks, type |
| **CheckIn** | Daily completions | habitId, logicalDate, slotIndex, amount, xpAwarded |
| **RestDay** | Streak-safe skip days | habitId, logicalDate, weekLabel |
| **Todo** | Task items | title, deadline, priority, subtasks, completedAt |
| **Badge** | Achievement definitions | key, name, icon, triggerKey, xpReward |
| **ZenSession** | Focus timer sessions | startedAt, endedAt, durationSeconds, logicalDate |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally or a cloud instance (MongoDB Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/Chaitanya-361/Velvet-Streak.git
cd Velvet-Streak
```

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create a `server/.env` file:

```env
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/velvet-streak
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
CORS_ALLOWED_ORIGINS=http://localhost:5173
COOKIE_SECRET=your-cookie-secret
BCRYPT_ROUNDS=12
```

### 3. Run Development Servers

```bash
# Terminal 1 — API server (port 8080)
cd server
npm run dev

# Terminal 2 — Client (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** and create an account to get started!

---

## 📡 API Endpoints

<details>
<summary><b>Auth</b> — <code>/api/auth</code></summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| POST | `/register` | Create account |
| POST | `/login` | Sign in |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Sign out |
| GET | `/me` | Get current user |

</details>

<details>
<summary><b>Habits</b> — <code>/api/habits</code></summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| GET | `/` | List all habits |
| POST | `/` | Create habit |
| GET | `/:id` | Get habit detail |
| PATCH | `/:id` | Update habit |
| DELETE | `/:id` | Delete habit |
| PATCH | `/reorder` | Reorder habits |
| GET | `/:id/calendar` | Get habit calendar data |

</details>

<details>
<summary><b>Check-ins</b> — <code>/api/checkins</code></summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| POST | `/` | Create check-in |
| GET | `/` | List check-ins |
| PATCH | `/:id/note` | Update note |
| DELETE | `/:id` | Undo check-in |

</details>

<details>
<summary><b>Todos</b> — <code>/api/todos</code></summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| GET | `/` | List todos |
| GET | `/:id` | Get todo |
| POST | `/` | Create todo |
| PATCH | `/:id` | Update todo |
| DELETE | `/:id` | Delete todo |
| PATCH | `/:id/complete` | Toggle completion |
| PATCH | `/:id/subtasks/:subtaskId/toggle` | Toggle subtask |

</details>

<details>
<summary><b>Stats</b> — <code>/api/stats</code></summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| GET | `/dashboard` | Dashboard data |
| GET | `/weekly` | Weekly stats |
| GET | `/heatmap` | Annual heatmap |

</details>

<details>
<summary><b>Zen Mode</b> — <code>/api/zen</code></summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| POST | `/sessions` | Save focus session |
| GET | `/sessions/weekly` | Weekly per-day breakdown |
| GET | `/sessions/weekly-total` | Total seconds this week |

</details>

<details>
<summary><b>User</b> — <code>/api/users</code></summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| GET | `/profile` | Get profile |
| PATCH | `/profile` | Update profile |
| PATCH | `/settings` | Update settings |
| GET | `/badges` | Get badges |
| GET | `/export` | Export all data |
| DELETE | `/account` | Delete account |

</details>

---

## 🎨 Design System

The app uses a custom design system with CSS custom properties and Tailwind:

| Token | Color | Usage |
|:------|:------|:------|
| `--vs-teal` | `#67bed9` | Primary accent, active states, CTAs |
| `--vs-gold` | `#F59E0B` | Streaks, warnings, XP highlights |
| `--vs-emerald` | `#10B981` | Success, completed states |
| `--vs-rose` | `#F43F5E` | Errors, destructive actions, overdue |
| `--vs-surface` | `#FFFFFF` | Card backgrounds |
| `--vs-bg` | `#F8F9FA` | Page background |
| `--vs-text` | `#0F172A` | Primary text |
| `--vs-muted` | `#64748B` | Secondary text |

**Typography**: Poppins (headings), Inter (body), JetBrains Mono (monospace/timer)

**Animations**: Fade-in, slide-up, scale-in, float, shimmer, pulse-glow, feather-burst

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with 💙 by [Chaitanya](https://github.com/Chaitanya-361)**

*Keep building streaks. Keep leveling up.* 🦚

</div>
