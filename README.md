# VP23

VP23 (Versatile Professionals 23) is a production-ready Next.js 16 foundation for
a bilingual professional marketplace and business operating system.

Tagline: **Find. Hire. Grow.**

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Supabase Authentication
- PostgreSQL with Row Level Security
- Supabase Storage-ready document center
- Mobile-first responsive design
- Light and dark mode
- Vercel deployment configuration

## Bilingual foundation

English is the default language and Spanish is supported from day one.

- Central dictionaries: `lib/i18n/dictionaries.ts`
- Locale helpers: `lib/i18n/server.ts`
- Language selector: `components/language-selector.tsx`
- Profile preference column: `profiles.preferred_language`
- Guest preference cookie: `vp23_locale`

All visible UI copy is sourced through the dictionary layer so pages, buttons,
forms, menus, alerts, notifications, modals, and email subject placeholders can
be translated consistently.

## Routes

- `/` - VP23 landing page
- `/login` - Supabase email/password login
- `/signup` - Account creation with role and language preference
- `/dashboard` - Protected VP23 command center
- `/professionals` - Searchable professional directory foundation
- `/professionals/profile` - Business profile and badge foundation
- `/quotes` - Quote request workflow foundation
- `/business-tools` - Estimates, invoices, contracts, change orders, and jobs
- `/document-center` - Supabase Storage document center foundation
- `/partners` - Partnership marketplace
- `/capital` - VP23 Capital partner marketplace framework only
- `/equipment` - Equipment rental marketplace framework
- `/ai` - Future automation integration placeholders
- `/admin` - Protected admin framework

## Database

Apply `supabase/migrations/20260618223900_initial_schema.sql` to create:

- Profiles, roles, and language preferences
- Categories and professional companies
- Favorites and quote requests
- Jobs, estimates, invoices, contracts, and change orders
- Documents, licenses, insurance policies, and verification requests
- Reviews and review media
- Partner companies and equipment listings
- Notifications
- Indexes, triggers, seed categories, RLS policies, and a private
  `vp23-documents` storage bucket

## Getting started

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Add your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a Supabase project.
2. Apply the SQL migrations in `supabase/migrations` in timestamp order.
3. In Supabase Auth settings, add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`
4. Add the environment variables from `.env.example` locally and in Vercel.

## Security operations

Admin accounts cannot be selected during signup. See `SECURITY.md` for the
direct database bootstrap process used to promote the first trusted admin and
for the current VP23 role, review, and verification security rules.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```
