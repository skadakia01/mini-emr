# Mini EMR

A full-stack Electronic Medical Records system with a **patient portal** and a **password-protected admin dashboard**, built as a take-home exercise for Zealthy.

**Patient portal** — patients log in at `/`, see a summary dashboard with upcoming appointments and prescription refills, and can drill into a full 3-month schedule for each.

**Admin dashboard** — staff log in at `/admin` with a separate password, then create/edit/delete patients, appointments, and prescriptions.

---

## Requirements Checklist

| Requirement | Status |
|---|---|
| React / Next.js frontend | ✅ Next.js 16 App Router |
| Seed data from provided JSON gist | ✅ `prisma/seed.ts` fetches live from the gist |
| Prescription form: medication, dosage, qty, refill date, refill schedule | ✅ All fields, medication list matches gist exactly |
| Appointment form: provider (free text), date/time, repeat schedule, end recurring | ✅ Repeat: None / Weekly / Biweekly / Monthly + optional end date |
| New patient creation with settable password | ✅ Admin "New Patient" form includes password field |
| Patient portal login at `/` | ✅ Split-layout login page at root |
| Portal main page = summary of key patient data + upcoming appointments/refills | ✅ Dashboard with stats, upcoming items, patient info card |
| Drill down into appointments (3-month schedule) | ✅ `/appointments` — expanded recurring schedule, grouped by month |
| Drill down into medications / refills (3-month schedule) | ✅ `/prescriptions` — per-medication cards with all upcoming refill dates |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (App Router, TypeScript) |
| Database ORM | Prisma 6 |
| Database (local) | SQLite |
| Database (production) | PostgreSQL (Neon recommended) |
| Auth (patients) | NextAuth v4 — Credentials provider, JWT sessions |
| Auth (admin) | Cookie-based session (httpOnly, signed secret) |
| UI Components | shadcn/ui v4 (Base UI) |
| Styling | Tailwind CSS v4 |
| Date math | date-fns v4 |
| Icons | lucide-react |
| Form handling | react-hook-form + Zod |
| Toast notifications | sonner |

---

## Architecture Overview

```
src/
├── app/
│   ├── (portal)/               # Patient-facing route group
│   │   ├── page.tsx            # / — login page
│   │   ├── dashboard/          # /dashboard — summary
│   │   ├── appointments/       # /appointments — 3-month schedule
│   │   └── prescriptions/      # /prescriptions — 3-month refills
│   ├── admin/
│   │   ├── login/              # /admin/login — admin password page
│   │   ├── page.tsx            # /admin — patient list + stats
│   │   └── patients/[id]/      # /admin/patients/:id — patient detail
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth handler
│       ├── admin/auth/         # Admin session login/logout
│       ├── patients/           # CRUD
│       ├── appointments/       # CRUD
│       ├── prescriptions/      # CRUD
│       └── portal/me/          # Logged-in patient data
├── components/
│   ├── admin/                  # PatientTable, PatientDetailClient, forms
│   ├── portal/                 # LoginForm, PortalNav
│   └── ui/                     # shadcn/ui primitives
├── config/
│   └── medications.ts          # Medication + dosage list (matches gist)
├── lib/
│   ├── auth.ts                 # NextAuth authOptions
│   ├── auth-guard.ts           # Server-side session helpers
│   ├── prisma.ts               # Prisma client singleton
│   └── schedule-utils.ts       # Recurring schedule expansion (appointments + prescriptions)
├── proxy.ts                    # Middleware — protects portal + admin routes
└── types/next-auth.d.ts        # Session/JWT type augmentation
prisma/
├── schema.prisma               # Patient, Appointment, Prescription models
├── migrations/                 # Auto-generated migration history
└── seed.ts                     # Fetches from gist and seeds the database
```

### Key design decisions

- **Route groups** — `(portal)` groups patient pages under a shared authenticated layout while keeping `/` at the root.
- **Recurring schedule expansion** — `schedule-utils.ts` expands WEEKLY / BIWEEKLY / MONTHLY appointments and prescriptions into individual occurrences between `now` and `now + 3 months`. This runs server-side at render time — no cron jobs needed.
- **Dual auth** — patients use NextAuth JWT (email + password). Admin uses a separate `httpOnly` cookie validated against `ADMIN_SESSION_SECRET` in the proxy (middleware). Completely independent — one doesn't affect the other.
- **Proxy (middleware)** — `src/proxy.ts` guards `/dashboard`, `/appointments`, `/prescriptions` (NextAuth token check) and `/admin/*` (admin cookie check) before any page renders.

---

## Local Development (SQLite)

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/mini-emr.git
cd mini-emr
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Use an absolute path to avoid Prisma runtime path issues
DATABASE_URL="file:///ABSOLUTE/PATH/TO/mini-emr/prisma/dev.db"
# Example on Mac:
# DATABASE_URL="file:///Users/yourname/projects/mini-emr/prisma/dev.db"

NEXTAUTH_SECRET="any-random-string-32-chars-or-more"
NEXTAUTH_URL="http://localhost:3000"

# Admin portal credentials
ADMIN_PASSWORD="admin123"
ADMIN_SESSION_SECRET="any-random-secret-string"
```

> **Why absolute path?** Prisma CLI resolves `file:./dev.db` relative to the schema file (`prisma/dev.db`), but Prisma Client at runtime resolves it relative to the process working directory. Using an absolute path eliminates the mismatch.

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed sample data

```bash
npm run db:seed
```

This fetches the [provided JSON gist](https://gist.github.com/sbraford/73f63d75bb995b6597754c1707e40cc2) and seeds two patients:

| Name | Email | Password |
|---|---|---|
| Mark Johnson | mark@some-email-provider.net | Password123! |
| Lisa Smith | lisa@some-email-provider.net | Password123! |

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Application URLs

| URL | Description |
|---|---|
| `http://localhost:3000/` | Patient portal login |
| `http://localhost:3000/dashboard` | Patient dashboard (requires login) |
| `http://localhost:3000/appointments` | 3-month appointment schedule |
| `http://localhost:3000/prescriptions` | 3-month refill schedule |
| `http://localhost:3000/admin` | Admin dashboard (redirects to login) |
| `http://localhost:3000/admin/login` | Admin login |

**Admin password (local):** `admin123`

---

## Deployment to Vercel + Neon PostgreSQL

SQLite uses a local file — it won't persist on Vercel's serverless infrastructure. Switch to PostgreSQL for deployment.

### Step 1 — Create a Neon PostgreSQL database

1. Sign up at [neon.tech](https://neon.tech) (free tier is sufficient)
2. Create a new project
3. Copy the **connection string** — it looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Step 2 — Switch the Prisma schema to PostgreSQL

In `prisma/schema.prisma`, change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"   # ← change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 3 — Generate migrations against your Neon database

```bash
# Set DATABASE_URL to your Neon connection string in .env.local, then:
npx prisma migrate dev --name init
```

Commit the resulting `prisma/migrations/` folder — Vercel applies it automatically during each build.

### Step 4 — Push to GitHub

```bash
git add .
git commit -m "switch to postgresql for production"
git push
```

### Step 5 — Connect repo to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Vercel auto-detects Next.js — no framework changes needed
3. The `vercel.json` in the repo sets the build command to `npm run vercel-build`, which runs `prisma migrate deploy && next build`

### Step 6 — Set environment variables in Vercel

In your Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -hex 32` and paste the output |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (your actual Vercel URL) |
| `ADMIN_PASSWORD` | Password for `/admin` login |
| `ADMIN_SESSION_SECRET` | Any long random string |

### Step 7 — Deploy and seed

After the first deployment succeeds:

```bash
# Seed the production database from your local machine:
DATABASE_URL="postgresql://your-neon-connection-string" npm run db:seed
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | `prisma generate` + Next.js production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Seed sample data from the JSON gist |

---

## Data Models

```prisma
model Patient {
  id          Int       @id @default(autoincrement())
  firstName   String
  lastName    String
  email       String    @unique
  password    String    // bcrypt hashed
  dateOfBirth DateTime?
  phone       String?
  address     String?
  appointments  Appointment[]
  prescriptions Prescription[]
}

model Appointment {
  id             Int            @id @default(autoincrement())
  patientId      Int
  providerName   String         // free-form text
  dateTime       DateTime       // first occurrence
  repeatSchedule RepeatSchedule // NONE | WEEKLY | BIWEEKLY | MONTHLY
  endDate        DateTime?      // optional — stops recurrence
}

model Prescription {
  id             Int            @id @default(autoincrement())
  patientId      Int
  medicationName String         // one of: Diovan, Lexapro, Metformin, Ozempic, Prozac, Seroquel, Tegretol
  dosage         String         // one of: 1mg, 2mg, 3mg, 5mg, 10mg, 25mg, 50mg, 100mg, 250mg, 500mg, 1000mg
  quantity       Int
  refillDate     DateTime       // next refill date
  refillSchedule RefillSchedule // NONE | MONTHLY | QUARTERLY
}
```

---

## Feature Walkthrough

### Patient Portal

1. **Login** (`/`) — email + password form; on success, JWT session cookie is set and you're redirected to `/dashboard`
2. **Dashboard** (`/dashboard`) — time-based greeting, 3 stat cards (appointments this week, refills due in 7 days, total prescriptions), upcoming appointments and refills for the next 7 days, patient info card, quick-link cards to drill-down pages
3. **Appointments** (`/appointments`) — all recurring appointment occurrences for the next 3 months, grouped by calendar month; each card shows a colored date column, provider name, time, and repeat badge
4. **Prescriptions** (`/prescriptions`) — one card per medication; each card lists all upcoming refill dates for the next 3 months; "Due Soon" amber badge appears when a refill is within 7 days

### Admin Dashboard

1. **Login** (`/admin/login`) — password-only form; sets an httpOnly session cookie valid for 7 days
2. **Patient list** (`/admin`) — stats row (total patients / appointments / prescriptions), searchable patient table with appointment and prescription counts, "New Patient" button
3. **Patient detail** (`/admin/patients/:id`) — gradient header card with patient stats, pill tabs for Appointments and Prescriptions, full CRUD for both (add, edit, delete)

---

## Development Notes

- **Next.js 16** uses `proxy.ts` instead of `middleware.ts` (the `middleware` file convention is deprecated in this version)
- **Turbopack** config includes `root: __dirname` to prevent it from scanning parent directories with lockfiles
- **Prisma enums** in SQLite are stored as strings — the schema uses `enum` syntax which Prisma maps to `VARCHAR` for SQLite compatibility
- **shadcn/ui v4** (Base UI) has slightly different APIs than the shadcn docs suggest: `Select` uses `null` (not `undefined`) as the controlled-but-empty value; `Button` has no `asChild`
