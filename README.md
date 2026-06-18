# ORIVOO AI

A production-ready Next.js 16 SaaS application for ORIVOO AI with a black,
white, and gold interface inspired by modern AI workspaces.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Supabase Authentication
- Supabase Database with RLS-ready migrations
- Groq streaming AI responses
- Vercel deployment

## Pages

- `/` - Landing page
- `/login` - Supabase email/password login
- `/signup` - Supabase email/password signup
- `/dashboard` - Protected ORIVOO AI dashboard

## Dashboard studios

The dashboard sidebar includes:

- Assistant
- Document Studio
- Research Studio
- Website Builder
- Code Studio
- Business Builder
- Design Studio
- Land Studio
- Concept Studio
- Legal Studio
- Civic Studio
- Botanical Studio
- Genealogy Studio
- Science Studio
- Settings

## Getting started

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Add your Supabase and Groq project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a Supabase project.
2. Apply the SQL migrations in `supabase/migrations` in filename order.
3. In Supabase Auth settings, add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`
4. Add the environment variables from `.env.example` locally and in Vercel.

The included migrations create:

- `profiles`
- `workspaces`
- `conversations`
- `messages`
- Row Level Security policies
- `updated_at` triggers
- A new-user trigger that provisions a profile and workspace
- Conversation history storage for ORIVOO Assistant

## ORIVOO Assistant

`/dashboard` opens ORIVOO Assistant by default. It includes:

- ChatGPT-style chat composer
- Conversation history
- New chat flow
- Streaming responses from Groq
- Automatic Supabase persistence for user and assistant messages
- Authenticated message loading per conversation

The Assistant API route requires `GROQ_API_KEY`. `GROQ_MODEL` is optional and
defaults to `llama-3.3-70b-versatile`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Deploying to Vercel

1. Import the repository into Vercel.
2. Set the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `GROQ_API_KEY`
   - `GROQ_MODEL`
3. Deploy.

For production, set `NEXT_PUBLIC_SITE_URL` to the final Vercel domain or custom
domain so Supabase email confirmation links point back to the correct callback.
