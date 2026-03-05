# 🚀 MEXTEL – Telecom Customer & Admin Portal
### Vibe Coding Prompt (Full Stack)

---

## 🧠 PROJECT OVERVIEW

Build a full-stack, production-grade **Telecommunications Self-Service Portal** for **MEXTEL** — a modern Mexican telecom brand. The application serves two user types: **Customers** (who manage their own plans) and **Administrators** (who manage all plans and users).

---

## 🎨 BRAND & LOGO IDENTITY

Design and embed the **MEXTEL logo** directly in the app (SVG preferred).

**Logo Design Specification:**
- Wordmark: Bold, geometric sans-serif typeface — the letters **"MEX"** in deep navy (`#0A1F44`) and **"TEL"** in vivid electric blue (`#00AAFF`)
- Append a stylized signal/wifi arc icon to the right of the wordmark — three concentric curved lines radiating upward-right, gradient from `#00AAFF` to `#00E5CC`
- Tagline beneath the wordmark (small caps): **"Always Connected. Always You."** in light gray
- The logo should feel sleek, tech-forward, and trustworthy — inspired by brands like AT&T and Claro but more modern
- Use the logo on the Login page (centered, hero placement), the top navbar, and the browser tab favicon (SVG icon only)

---

## 🛠️ TECH STACK

| Layer | Technology |
|---|---|
| **Frontend** | React.js 18+ with Vite, React Router v6, Axios |
| **UI Framework** | Tailwind CSS + shadcn/ui component library |
| **State Management** | Zustand (lightweight, no Redux boilerplate) |
| **Backend** | **Node.js with Express.js** (REST API, JWT auth middleware) |
| **Database** | **PostgreSQL** (via Prisma ORM for type-safe schema & migrations) |
| **Auth** | JWT (access + refresh tokens), bcrypt for password hashing |
| **Charts/Analytics** | Recharts |
| **Data Export** | xlsx + file-saver (CSV & Excel export) |
| **Dev Tools** | ESLint, Prettier, dotenv |

> **Why this stack?** Express.js is battle-tested for telecom-scale APIs. PostgreSQL is the best RDBMS for relational plan/customer data with strong indexing and ACID compliance. Prisma makes schema changes safe and migrations easy.

---

## 🗄️ DATABASE SCHEMA (PostgreSQL via Prisma)

Generate the full `schema.prisma` with these models:

```prisma
model User {
  id            Int           @id @default(autoincrement())
  email         String        @unique
  passwordHash  String
  fullName      String
  phone         String?
  role          Role          @default(CUSTOMER)
  currentPlanId Int?
  currentPlan   Plan?         @relation(fields: [currentPlanId], references: [id])
  planChanges   PlanChange[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Plan {
  id            Int           @id @default(autoincrement())
  name          String        @unique
  price         Decimal       @db.Decimal(10, 2)
  dataGB        Int
  callMinutes   Int
  smsCount      Int
  features      String[]
  isActive      Boolean       @default(true)
  subscribers   User[]
  planChanges   PlanChange[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model PlanChange {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  fromPlanId  Int?
  toPlanId    Int
  toPlan      Plan      @relation(fields: [toPlanId], references: [id])
  changedAt   DateTime  @default(now())
  reason      String?
}

enum Role {
  CUSTOMER
  ADMIN
}
```

Seed the database with:
- 1 Admin user: `admin@mextel.mx` / `Admin@1234`
- 1 Customer user: `customer@mextel.mx` / `Customer@1234`
- 4 sample plans: **Básico** (MXN $149), **Estándar** (MXN $249), **Pro** (MXN $399), **Élite** (MXN $599) — each with escalating data, minutes, SMS, and features

---

## 🔐 AUTHENTICATION MODULE

### Login Page (`/login`)
- Full-page split layout: **left half** = MEXTEL hero panel with animated signal wave background (CSS keyframe animation — concentric expanding rings in `#00AAFF` at low opacity), brand logo centered, tagline, and a short value-prop blurb
- **Right half** = login form card with glass-morphism effect (`backdrop-blur`, semi-transparent white/dark background)
- Fields: Email, Password (toggle visibility), Role selector (Customer / Administrator) as a styled pill toggle
- "Forgot Password?" link (UI only, no backend required)
- On submit: POST to `/api/auth/login`, store JWT in `httpOnly` cookie or `localStorage`, redirect based on role
- Error states: inline validation messages with smooth shake animation
- Loading state: spinner inside submit button

### Auth Flow
- Backend: `POST /api/auth/login` → validate credentials → return JWT with `{ userId, role, name }`
- Protected routes via React Router `<ProtectedRoute>` component that checks JWT and role
- Auto-redirect: Customers → `/dashboard`, Admins → `/admin/dashboard`
- Logout: clears token, redirects to `/login`

---

## 👤 CUSTOMER PORTAL

### Customer Dashboard (`/dashboard`)

**Top section – "My Plan" Hero Card:**
- Large gradient card showing current plan name, price, and a visual usage breakdown
- 3 animated circular progress rings: Data Used, Minutes Used, SMS Used (values can be mocked as percentage of plan limits)
- "Change Plan" CTA button — prominent, electric blue

**Middle section – Account Summary:**
- Name, email, phone, Member Since date
- Plan renewal date (mock: 30 days from today)
- Account status badge: "Active" in green

**Bottom section – Recent Activity:**
- Table of last 5 plan changes pulled from `PlanChange` table for the logged-in user
- Columns: Date, Changed From, Changed To
- Empty state illustration if no changes yet

---

### Browse Plans Page (`/plans`)

- **Plan Cards Grid** (2 columns desktop, 1 column mobile)
- Each card displays:
  - Plan name (large, bold)
  - Monthly price (very large, accent color)
  - Data (GB), Minutes, SMS as icon+value rows
  - Features list with checkmark icons
  - "Select Plan" button — disabled + "Current Plan" badge if already subscribed
- **Most Popular** ribbon on the "Estándar" plan card
- **Plan Comparison Toggle**: A toggle at the top switches between "Card View" and "Comparison Table View" — the table has plans as columns and features as rows with ✅/❌ icons
- Clicking "Select Plan" → opens a **confirmation modal**:
  - Summary: "You are switching from [Current Plan] to [New Plan]"
  - Price difference highlighted (e.g., "+MXN $100/mo")
  - Features gained/lost diff list
  - "Confirm Change" and "Cancel" buttons
  - On confirm: POST `/api/customers/change-plan`, show success toast notification, update dashboard

---

## 🛡️ ADMIN PORTAL

### Admin Dashboard (`/admin/dashboard`)

**KPI Cards Row (top):**
- Total Customers, Total Active Plans, Plan Changes This Month, Most Popular Plan
- Each card has an icon, large number, and a subtle sparkline or trend indicator

**Customers by Plan Chart:**
- Horizontal bar chart (Recharts) showing customer count per plan
- Color-coded bars matching plan tier colors

**Recent Plan Changes Table:**
- Columns: Customer Name, Email, From Plan, To Plan, Date
- Paginated (10 rows/page)
- Sortable columns
- Search/filter bar (filter by plan name or customer name)

**Export Button:**
- "Export Report" dropdown with options: "Export as CSV" and "Export as Excel (.xlsx)"
- Exports all plan change history with customer info
- Uses `xlsx` library on the frontend after fetching from `/api/admin/export`

---

### Plan Management Page (`/admin/plans`)

**Plans Table:**
- Columns: Plan Name, Price, Data, Minutes, SMS, Subscribers Count, Status (Active/Inactive), Actions
- Actions column: Edit ✏️ and Delete 🗑️ icon buttons
- Row hover highlight, alternating row shading

**"Add New Plan" Button** (top right, primary CTA):
- Opens a **slide-in drawer panel** (right side) with a form:
  - Plan Name, Monthly Price (MXN), Data (GB), Call Minutes, SMS Count
  - Features: dynamic tag input (type a feature, press Enter to add as chip)
  - Active/Inactive toggle
  - "Save Plan" and "Cancel" buttons
  - POST to `/api/admin/plans`

**Edit Plan:**
- Same drawer, pre-populated
- PUT to `/api/admin/plans/:id`

**Delete Plan:**
- Confirmation dialog: "Are you sure you want to delete [Plan Name]? This will not affect existing subscribers."
- DELETE to `/api/admin/plans/:id` (soft delete — sets `isActive: false` or removes from listings)

---

## 🎨 VISUAL DESIGN SYSTEM

### Color Palette
```
--color-primary:     #0A1F44   /* Deep Navy – trust, authority */
--color-accent:      #00AAFF   /* Electric Blue – energy, connectivity */
--color-accent-teal: #00E5CC   /* Teal – modern, fresh */
--color-success:     #22C55E
--color-warning:     #F59E0B
--color-danger:      #EF4444
--color-bg:          #F0F4FA   /* Light blue-gray page background */
--color-surface:     #FFFFFF
--color-text:        #1A1A2E
--color-muted:       #6B7280
```

### Typography
- **Display/Headings**: `'Sora'` (Google Fonts) — modern geometric, great for telecom
- **Body**: `'DM Sans'` (Google Fonts) — clean, highly readable
- Import via: `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`

### Component Style Rules
- Border radius: `12px` for cards, `8px` for inputs/buttons, `50px` for pill badges
- Shadows: `0 4px 24px rgba(0,170,255,0.08)` for cards, deeper on hover
- Transitions: `all 0.2s ease` on interactive elements
- Buttons: Primary = solid `#00AAFF`, hover = `#0090DD` with subtle lift (`transform: translateY(-1px)`)
- Active nav item: left border accent `4px solid #00AAFF` + light blue background tint

### Layout
- **Sidebar navigation** (fixed, 240px wide) for both portals — collapsible on mobile
- Customer nav links: Dashboard, My Plans, Account Settings
- Admin nav links: Dashboard, Manage Plans, Customers, Reports
- Top header bar: MEXTEL logo (left), User avatar + name + logout (right)
- Main content area: padded `32px`, max-width `1200px`, centered

---

## 📁 PROJECT FOLDER STRUCTURE

```
mextel/
├── client/                        # React Frontend (Vite)
│   ├── public/
│   │   └── mextel-favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── mextel-logo.svg    # SVG logo
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── Logo.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PlanCard.jsx
│   │   │   ├── PlanDrawer.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── KPICard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── customer/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Plans.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       └── ManagePlans.jsx
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand auth store
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + all API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                        # Express.js Backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verify middleware
│   │   │   └── roleGuard.js       # Admin-only guard
│   │   ├── routes/
│   │   │   ├── auth.js            # POST /api/auth/login, /logout
│   │   │   ├── customer.js        # GET /api/customers/me, /plans, POST /change-plan
│   │   │   └── admin.js           # CRUD /api/admin/plans, GET /admin/dashboard, /export
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   └── adminController.js
│   │   └── app.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🔌 API ENDPOINTS

```
AUTH
  POST   /api/auth/login              → { token, user: { id, name, role, currentPlanId } }
  POST   /api/auth/logout

CUSTOMER (requires JWT, role: CUSTOMER)
  GET    /api/customers/me            → { user profile + current plan }
  GET    /api/customers/plans         → [ all active plans ]
  POST   /api/customers/change-plan   → { planId } → { success, newPlan }
  GET    /api/customers/history       → [ plan change history for logged-in user ]

ADMIN (requires JWT, role: ADMIN)
  GET    /api/admin/dashboard         → { kpis, customersByPlan[], recentChanges[] }
  GET    /api/admin/plans             → [ all plans with subscriber count ]
  POST   /api/admin/plans             → create plan
  PUT    /api/admin/plans/:id         → update plan
  DELETE /api/admin/plans/:id         → deactivate plan
  GET    /api/admin/export            → full audit data for export
```

---

## ✅ IMPLEMENTATION CHECKLIST

Build each item in this order:

1. [ ] Initialize monorepo with `client/` (Vite + React) and `server/` (Express) folders
2. [ ] Set up PostgreSQL, Prisma schema, run migrations, seed data
3. [ ] Build Express auth routes with JWT + bcrypt
4. [ ] Build all API routes with proper middleware guards
5. [ ] Set up Axios instance in client with JWT interceptor (attach token to headers)
6. [ ] Build Zustand auth store (login, logout, persist role)
7. [ ] Build Login page with MEXTEL logo, split layout, animated background
8. [ ] Build ProtectedRoute and layout wrappers (Sidebar + Header)
9. [ ] Build Customer Dashboard (plan hero card, progress rings, activity table)
10. [ ] Build Plans page (cards, comparison table, confirm modal)
11. [ ] Build Admin Dashboard (KPIs, chart, recent changes table, export)
12. [ ] Build Admin Plan Management (table, add/edit drawer, delete confirm)
13. [ ] Polish: loading skeletons, empty states, error boundaries, toast notifications
14. [ ] Test all user flows for both roles end-to-end

---

## 🚀 SETUP COMMANDS (include in README)

```bash
# Backend
cd server
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev          # runs on http://localhost:3001

# Frontend
cd client
npm install
npm run dev          # runs on http://localhost:5173
```

**.env (server):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mextel_db"
JWT_SECRET="mextel_super_secret_key_2024"
PORT=3001
```

---

## 🎯 QUALITY BARS TO HIT

- All pages are **fully responsive** (mobile-first, works at 375px and 1440px)
- Loading states on every async action (spinners, skeleton loaders)
- **No raw error messages shown to users** — all errors show friendly toasts
- Form validation is inline and immediate (before API call)
- The login page should be **portfolio-worthy** — someone seeing it should immediately think "this is a real product"
- Admin dashboard chart and KPIs update in real-time after plan changes
- Export downloads actual `.xlsx` or `.csv` file to the user's computer

---

*Built for MEXTEL — Always Connected. Always You.*
