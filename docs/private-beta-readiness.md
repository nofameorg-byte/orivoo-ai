# VP23 Private Beta Readiness

## Supabase migration status

This workspace does not have `NEXT_PUBLIC_SUPABASE_URL` or
`NEXT_PUBLIC_SUPABASE_ANON_KEY` configured, so migrations could not be applied to
a real Supabase project from this environment.

Apply migrations in timestamp order:

1. `20260618223900_initial_schema.sql`
2. `20260623045500_security_lockdown.sql`
3. `20260623053400_trust_engine.sql`
4. `20260623054200_beta_acquisition.sql`
5. `20260623055300_transaction_engine.sql`
6. `20260623060400_private_beta_hardening.sql`

## Production audit checklist

- Confirm all public tables have RLS enabled.
- Confirm `vp23-documents` storage bucket exists and is private.
- Confirm `create_notification` RPC exists.
- Confirm `refresh_company_verification_flags` handles license, insurance,
  business, identity, revenue, and elite verification.
- Confirm quote and job status enum values exist before exercising workflows.
- Confirm admin bootstrap is completed through direct database SQL only.
- Confirm real auth redirect URLs include production and preview domains.

## Private beta operating guidance

- Start with 10 contractors and manually monitor admin queues daily.
- Keep invite links manual until email sending is implemented.
- Apply migrations to a staging Supabase project before production.
- Run app validation after setting production env variables.
