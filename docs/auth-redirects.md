# VP23 Auth Redirect Configuration

VP23 auth flows must never point to any legacy project URL.

## Required environment variable

Set this in local development, Vercel, and any deployment environment:

```bash
NEXT_PUBLIC_SITE_URL=https://your-vp23-domain.com
```

Do not use any legacy project URL.

The app now rejects known legacy non-VP23 URLs at runtime when generating auth links.

## Supabase Auth settings

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://your-vp23-domain.com`
- Redirect URLs:
  - `https://your-vp23-domain.com/auth/callback`
  - `https://your-vp23-domain.com/auth/callback?next=/dashboard`
  - `https://your-vp23-domain.com/auth/callback?next=/onboarding`
  - `https://your-vp23-domain.com/auth/callback?next=/reset-password`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/callback?next=/dashboard`
  - `http://localhost:3000/auth/callback?next=/onboarding`
  - `http://localhost:3000/auth/callback?next=/reset-password`

Remove any redirect URL that points outside VP23.

## Auth flows

- Signup confirmation: `${NEXT_PUBLIC_SITE_URL}/auth/callback`
- Email verification: `${NEXT_PUBLIC_SITE_URL}/auth/callback`
- Magic link: `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`
- Password reset: `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`
- Invite acceptance: `${NEXT_PUBLIC_SITE_URL}/invite/<token>`
- Logout: `/`

## Supabase email templates

Update every Supabase email template to use VP23 language and VP23 links:

- Confirmation
- Magic Link
- Password Recovery
- Invite User
- Change Email Address

Use `{{ .ConfirmationURL }}` for Supabase-managed auth links after the Site URL
and Redirect URLs above are corrected.

Remove all non-VP23 legacy text from:

- Subject lines
- Logo alt text
- Body copy
- Footer copy
- Button labels
