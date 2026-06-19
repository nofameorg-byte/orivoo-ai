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
- `/dashboard/projects` - Project dashboard and project creation
- `/dashboard/projects/[projectId]` - Project detail, edit, delete, and assets
- `/dashboard/document-studio` - Authenticated document upload and library
- `/dashboard/document-studio/[documentId]` - Document viewer and AI actions
- `/dashboard/research` - Research Studio dashboard
- `/dashboard/research/[reportId]` - Research report viewer, actions, and exports
- `/dashboard/websites` - Website Builder dashboard
- `/dashboard/websites/[websiteId]` - Website project editor, preview, and exports
- `/dashboard/code` - Code Studio dashboard
- `/dashboard/code/[codeProjectId]` - Code project viewer, editor, actions, and exports
- `/dashboard/academy` - Academy dashboard
- `/dashboard/academy/[courseId]` - Academy course viewer, actions, progress, and exports
- `/dashboard/billing` - Billing, plan upgrades, and usage dashboard
- `/dashboard/team` - Team invites, members, and roles
- `/dashboard/organization` - Organization creation and shared assets

## Dashboard studios

The dashboard sidebar includes:

- Assistant
- Projects
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
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PRO_PRICE_ID=your-pro-price-id
STRIPE_TEAM_PRICE_ID=your-team-price-id
STRIPE_ENTERPRISE_PRICE_ID=your-enterprise-price-id
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
- `projects`
- `conversations`
- `messages`
- `documents`
- `document_chunks`
- `research_reports`
- `research_sources`
- `website_projects`
- `website_pages`
- `code_projects`
- `code_files`
- `academy_courses`
- `academy_lessons`
- `academy_quizzes`
- `academy_flashcards`
- `academy_progress`
- `subscriptions`
- `usage_tracking`
- `organizations`
- `organization_members`
- `invites`
- Private `orivoo-documents` Supabase Storage bucket
- Row Level Security policies
- `updated_at` triggers
- A new-user trigger that provisions a profile and workspace
- Conversation history storage for ORIVOO Assistant
- User-owned document storage and chunk retrieval
- Project links through `conversations.project_id` and `documents.project_id`
- Project links through `research_reports.project_id`
- Project links through `website_projects.project_id`
- Project links through `code_projects.project_id`
- Project links through `academy_courses.project_id`

## ORIVOO Projects

Projects are the organizational foundation for ORIVOO studios. Users can:

- Create projects
- Open a project dashboard
- Edit project name, description, and status
- Delete projects
- Assign chats to projects
- Assign documents to projects
- View all project chats and documents in one place

Conversations and documents both include nullable `project_id` references so
future studios can attach their assets to the same project model.

Research reports also include nullable `project_id` references and appear in
project detail pages alongside chats and documents.

Website projects include nullable `project_id` references and appear in project
detail pages alongside chats, documents, and research reports.

Code projects include nullable `project_id` references and appear in project
detail pages alongside chats, documents, research reports, and websites.

Academy courses include nullable `project_id` references and appear in project
detail pages alongside every other studio asset.

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

## ORIVOO Document Studio

`/dashboard/document-studio` is connected to the authenticated dashboard user and
supports:

- PDF upload
- DOCX upload
- Image upload
- Drag-and-drop uploads
- Private Supabase Storage persistence
- Document list page
- Document viewer page
- Text extraction and chunk storage in `document_chunks`
- Summaries, document Q&A, key fact extraction, and timeline generation

Text-based PDF and DOCX files are parsed on upload and chunked for Groq-powered
analysis. Images are stored privately and can be analyzed through Groq vision
when `GROQ_VISION_MODEL` is configured.

## ORIVOO Research Studio

`/dashboard/research` is the primary intelligence and research engine for
ORIVOO. It supports:

- Topic-based research report creation
- Project assignment during creation
- Research history for the authenticated user
- Report delete actions
- Report detail pages with structured sections
- Saved research sources
- Project reassignment
- AI actions for executive summaries, SWOT, business opportunities,
  competitors, grants, market research, government research, and strategic
  recommendations
- PDF export
- DOCX export
- Markdown report download

Research reports are saved to `research_reports`, sources are saved to
`research_sources`, and Supabase RLS restricts access to the report owner.

## ORIVOO Website Builder

`/dashboard/websites` lets authenticated users generate complete websites from
prompts. It supports:

- Website name, business type, and description inputs
- Project assignment during generation
- Home, About, Services, Contact, Privacy Policy, and Terms page generation
- SEO meta titles and descriptions
- Call to actions
- Generated page editor
- Browser-style preview mode
- AI actions for regeneration, SEO, copy, blog ideas, marketing plans, and
  social media plans
- HTML export
- Next.js export
- Static website ZIP export
- ZIP download

Website projects are saved to `website_projects`, generated pages are saved to
`website_pages`, and Supabase RLS restricts access to the website owner.

## ORIVOO Code Studio

`/dashboard/code` lets authenticated users generate, edit, analyze, and export
software projects. It supports:

- Project name, programming language, framework, and prompt inputs
- Project assignment during generation
- Folder structure and file generation
- Components, pages, database schema, API routes, and authentication setup
- Folder tree
- File editor
- Code viewer
- File search
- AI actions for refactoring, bug fixes, explanation, database schema, API
  endpoints, documentation, security audits, and performance audits
- ZIP export
- Next.js project export
- React project export
- Node API export
- Source code download

Code projects are saved to `code_projects`, files are saved to `code_files`, and
Supabase RLS restricts access to the project owner.

## ORIVOO Academy

`/dashboard/academy` is the education and learning platform for students,
parents, teachers, nonprofits, and workforce development programs. It supports:

- Subject, grade level, and topic inputs
- Project assignment during generation
- Memory-aware and language-aware course generation
- Courses, lessons, study guides, quizzes, flashcards, and practice tests
- AI actions for lessons, quizzes, flashcards, study guides, homework, parent
  summaries, and teacher guides
- Progress tracking
- PDF export
- DOCX export

Academy courses are saved to `academy_courses`, lessons to `academy_lessons`,
quizzes to `academy_quizzes`, flashcards to `academy_flashcards`, and progress
to `academy_progress`.

## Billing, Teams, and Usage

`/dashboard/billing` supports Free, Pro, Team, and Enterprise plans with Stripe
checkout, Stripe customer portal access, cancellation, and a monthly usage
dashboard. Usage is tracked in `usage_tracking` for:

- AI messages
- Documents uploaded
- Research reports generated
- Websites generated
- Code projects generated
- Storage used

`/dashboard/organization` and `/dashboard/team` support organization creation,
invites, member removal, role permissions, and shared organization visibility for
projects, documents, chats, research reports, websites, and code projects.

Plan highlights:

- Free: 50 AI messages/day, 10 documents, 3 research reports
- Pro: higher individual limits
- Team: shared projects, documents, and chats
- Enterprise: unlimited usage and admin controls

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
   - `GROQ_VISION_MODEL`
3. Deploy.

For production, set `NEXT_PUBLIC_SITE_URL` to the final Vercel domain or custom
domain so Supabase email confirmation links point back to the correct callback.
