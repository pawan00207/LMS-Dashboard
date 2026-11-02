# The Alexandria Library — Library Management System (LMS)

An editorial-grade, real-time Library Management System built with React, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

---

## 🏛️ Founder & Architecture
- **Founder & Lead Architect**: **Yashita Saini**
- **Contact Email**: [yashitasaini702@gmail.com](mailto:yashitasaini702@gmail.com)
- **LinkedIn**: [Yashita Saini](https://www.linkedin.com/in/yashitasaini)
- **GitHub**: [@yashitacyber](https://github.com/yashitacyber)

---

## 1. Demo Credentials & Separate Portals

Each role has a dedicated themed entrance with distinct atmospheric styling, artwork, and strict role guards:

| Portal | URL Path | Demo Account Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `/admin/login` | `admin@alexandria.lib` | `AdminPass123!` | Full governance: Librarian staff creation/disablement, fine rates, loan periods, audit trail, global ledger. |
| **Librarian** | `/librarian/login` | `librarian@alexandria.lib` | `LibPass123!` | Circulation desk: Issue books, process returns with automatic fine calculation, catalog management, reader registration. |
| **Reader / Member** | `/member/login` | `member@alexandria.lib` | `MemberPass123!` | Reader room: Active loans countdown, due dates, outstanding dues, borrowing history, full catalog search. |

> **Role Guard Policy**: Each role can *only* log in via its designated entrance. Attempting to enter the Admin portal with Librarian credentials will display *"Access denied for this role"*. Each login page includes a convenient 1-click **"Auto Fill"** demo button for instant evaluation.

---

## 2. Features & Architecture

### Real-Time Dashboard
- **Animated Count-up KPI Strip**: Total Volumes, Available Copies on Shelves, Issued Today, Overdue Loans, Active Reader Cards, and Fines Collected Today.
- **Velocity Area Chart**: 30-day live issues vs returns trajectory powered by Recharts, updating smoothly on every circulation event.
- **Holdings by Discipline Donut Chart**: Breakdown across Technology, Science, Fiction, Philosophy, History, Economics, and Arts.
- **Real-Time Circulation Stream**: Side feed with new checkouts and return alerts sliding in from the top with highlights.
- **Overdue Register**: Instant delinquent loan alerts with days-late counters and 1-click return actions.
- **Leaderboards**: Most borrowed library volumes and most active readers.
- **Connection Telemetry**: Pulsing Realtime status badge with reconnect simulation.

### Circulation Desk (Issue & Return)
- **Issue Policy Invariants**: Enforces reader status checks, available copy thresholds, maximum borrowing quotas (default 3 books), and blocks checkout if the patron has outstanding unpaid fines.
- **Auto Due Date**: Automatically computes due date from system loan period (default 14 days).
- **Return & Fine Calculation**: Automatic computation of `overdue days × fine rate (default ₹5/day)` upon return with an option to collect immediately or record as pending.
- **Celebration Effects**: Confetti ripple feedback on successful book loan and return workflows.

### Global Command Palette (`⌘K` / `Ctrl+K`)
- Instant keyboard-driven lookup across 50+ books, 20 patrons, and quick circulation shortcuts.

### Reporting & Statistical Audits
- Filterable views for Issued Books, Available Copies, Delinquent Loans, and Fines.
- Real **CSV Export** and printable **PDF Document Layout**.

---

## 3. Database Schema & Supabase Realtime

The application uses standard Supabase tables with `postgres_changes` subscriptions:
- `profiles`: User identity, roles (`admin`, `librarian`, `member`), credentials status, avatar.
- `books`: ISBN, title, author, category, shelf location, total copies, available copies.
- `members`: Member code (`MEM-1001`+), contact, status (`active`, `suspended`, `expired`).
- `transactions`: Loan records, issue date, due date, return date, accrued fines, payment status.
- `settings`: System-wide loan periods, fine rates, maximum borrowing limits.
- `audit_logs`: Chronological log of staff actions and administrative policy updates.

### Dual Realtime Engine
- When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided in `.env`, the client connects to remote Supabase with full row-level security.
- Out of the box, the app includes a reactive local database engine backed by `localStorage` and `BroadcastChannel`, dispatching `postgres_changes` across separate browser tabs in under a second!

---

## 4. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

To configure external Supabase:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

Start development server:
```bash
npm run dev
```
