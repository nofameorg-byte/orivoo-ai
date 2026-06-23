# VP23 Security Operations

## Admin bootstrap

VP23 does not allow users to select the `admin` role during signup. The first
admin must be promoted directly in the database by a trusted operator with
Supabase SQL access.

1. Create a normal VP23 account through `/signup` as a customer or professional.
2. Confirm the account in Supabase Auth.
3. In the Supabase SQL editor, run:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'admin@example.com'
);
```

4. Verify the profile:

```sql
select id, display_name, role, preferred_language
from public.profiles
where role = 'admin';
```

Use a real admin email in place of `admin@example.com`.

## Role security rules

- Signup only accepts `customer` and `professional`.
- Tampered signup requests that submit `admin` are downgraded to `customer`.
- The database signup trigger only provisions `customer` or `professional`.
- Authenticated users cannot promote themselves to `admin`.
- Changes to or from `admin` must be performed directly in the database or by a
  trusted service role process.
- Non-admin users cannot create companies unless their profile role is
  `professional`.
- Non-customer users cannot create quote requests.

## Review security rules

- Reviews must be tied to a completed job for the authenticated customer.
- Customers cannot spoof review ownership, moderation fields, or professional
  response fields.
- Professionals can only update response fields on reviews for companies they
  own.
- Review media uploads must belong to reviews connected to completed jobs owned
  by the uploading customer.

## Verification security rules

- Users can submit verification requests for themselves.
- Company verification requests require ownership of the company.
- Verification review and approval remains admin-only.
