# VP23 Financial

Premium fintech MVP built with Next.js 16, TypeScript, App Router, Tailwind CSS,
Supabase Auth/Database, and server-only Column sandbox route handlers.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Supabase Authentication
- Supabase Database with Row Level Security
- Server route handlers under `/api/column`
- Vercel deployment defaults

## Pages

- `/` - Landing page and VP23 splash panel
- `/login` - Supabase email/password login
- `/signup` - Supabase email/password signup
- `/dashboard` - Protected dashboard
- `/dashboard/onboarding`
- `/dashboard/business-banking`
- `/dashboard/business-profile`
- `/dashboard/accounts`
- `/dashboard/transactions`
- `/dashboard/payments`
- `/dashboard/transfers`
- `/dashboard/customers`
- `/dashboard/invoices`
- `/dashboard/admin`
- `/dashboard/settings`

## Dashboard features

- Total balance
- Available balance
- Recent transactions
- Account/routing number card
- Quick actions: Send, Receive, Invoice, Transfer
- Business banking modules for checking, savings future, and account details
- Payments modules for ACH, wires, and real-time payments
- Admin modules for KYB, compliance, risk, and partner-bank settings
- Sandbox mode badge
- Mobile-first responsive dashboard navigation

## Brand palette

- Black: `#0B0B0B`
- Red: `#D90429`
- Electric Blue: `#2563EB`
- Gold: `#D4AF37`
- Yellow: `#FFD60A`
- White: `#F8F9FA`

## Invoice features

- Create invoice form
- Customer name/email validation
- Job description, amount, and due date validation
- Send invoice placeholder
- Download/print through browser print handling
- Branded VP23 invoice preview
- Customer history and future PDF export notes

## Column sandbox API layer

The Column integration lives only in server code. Keep `COLUMN_API_KEY` in
server-side environment variables and never prefix it with `NEXT_PUBLIC_`.

Routes:

- `POST /api/column/entities`
- `GET /api/column/accounts`
- `POST /api/column/accounts`
- `GET /api/column/transfers`
- `POST /api/column/transfers/simulate`
- `GET /api/column/health`

Service placeholders:

- `createEntity`
- `createAccount`
- `listAccounts`
- `listTransfers`
- `simulateTransfer`

## Getting started

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Add environment values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
COLUMN_API_KEY=your-column-sandbox-key
COLUMN_BASE_URL=https://api.column.com
COLUMN_ENVIRONMENT=sandbox
COLUMN_PARTNER_BANK_ID=your-partner-bank-id
SPONSOR_BANK_NAME=your-sponsor-bank-name
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a Supabase project.
2. Apply `supabase/migrations/20260618223900_initial_schema.sql`.
3. In Supabase Auth settings, add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`
4. Add the environment variables from `.env.example` locally and in Vercel.

The migration creates:

- `profiles`
- `workspaces`
- `business_profiles`
- `customers`
- `invoices`
- Row Level Security policies
- `updated_at` triggers
- A new-user trigger that provisions a profile and workspace

## Production compliance TODOs

- Add full KYB/KYC, beneficial owner collection, and control person review.
- Add OFAC/sanctions screening, fraud controls, velocity limits, and approvals.
- Add signed Column webhooks, idempotency keys, reconciliation, and audit logs.
- Replace sandbox placeholders with production Column API calls after approval.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```
