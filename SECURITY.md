# Williams Enterprises security

This document describes the production security architecture. It does not contain secrets.

## Authentication

- Staff sign in at `/portal/auth` with Supabase email/password.
- Sessions are stored in **HttpOnly**, **SameSite=Lax** cookies (`Secure` in production).
- Server code validates the user with `supabase.auth.getUser()` (JWT verified), not client flags.
- Middleware/`proxy.ts` blocks unauthenticated and non-staff users from `/admin/*`.
- Login, logout, and failed logins are recorded in `security_events` (email + hashed IP, never passwords).
- Redirects after login are limited to `/admin` paths (`safeInternalPath`).

## Authorization (RBAC)

Roles (existing values kept; `super_admin` and `editor` added):

| Role | Maps to | Can do |
| --- | --- | --- |
| `super_admin` | Owner email `williamsenterprisess@gmail.com` or role | Everything, including users and Security |
| `admin` / `manager` | CMS admin | Pages, content, media, design, nav, footer, enquiries, finance/HR (manager), not user/role admin |
| `editor` / `staff` / `sales_manager` | Content editor | Page content, services, projects, gallery, news, media, POS. Not users, security, theme, nav, settings |

Client UI hides links. **Server actions and RLS enforce the same rules.**

A user cannot assign themselves a higher role. The owner account cannot be demoted or deactivated (database trigger).

## RLS (database boundary)

RLS is enabled on CMS, content, enquiries, profiles, logs, and storage.

- Public: published content only.
- Anon cannot `SELECT` `contact_messages`, `activity_logs`, `security_events`, or unpublished drafts.
- Profile self-update cannot change `role`, `email`, or `is_active`.
- Run `supabase/migrations/security_hardening.sql` in the Supabase SQL Editor.

## Rate limiting

Distributed via `public.consume_rate_limit()` in Supabase (works on serverless; not in-memory).

| Bucket | Window |
| --- | --- |
| login | 5 / 15 min |
| contact | 5 / 15 min |
| newsletter | 8 / 15 min |
| review | 5 / 60 min |
| upload | 30 / 15 min |
| AI chat | 20 / 15 min |

Exceeded requests return a generic 429-style message.

## Headers / clickjacking

Set in `next.config.ts` (all routes) and `src/proxy.ts` (admin/portal):

- `Content-Security-Policy` with `frame-ancestors 'none'`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (production HTTPS)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera/mic/geo/payment/usb off)

CSP notes:

- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` — required by the Next.js App Router runtime and React. Do not add third-party scripts without reviewing CSP.
- `style-src` allows `'unsafe-inline'` for Tailwind/theme CSS variables.
- `img-src` allows `https:` because CMS media may come from Supabase or other HTTPS hosts.

Admin responses send `Cache-Control: private, no-store`.

## Uploads

- Staff-only (review images are public but magic-byte checked and rate-limited).
- Allowed: JPEG, PNG, WebP, GIF, MP4/WebM, PDF.
- **SVG, HTML, JS, and executables are rejected.**
- Storage object names are generated (`timestamp-uuid.ext`), never the original filename.
- Service role is used only on the server for storage after validation.

## Environment variables

Public (browser-safe):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`

Never prefix the service role with `NEXT_PUBLIC_`. Never log it.

## CSRF

- SameSite=Lax cookies
- Next.js server actions bound to the site origin (`allowedOrigins` when `NEXT_PUBLIC_SITE_URL` is set)
- `src/proxy.ts` rejects cross-origin mutating requests to `/admin`

## Audit logging

- `activity_logs` — CMS/admin mutations (no secrets)
- `security_events` — login success/failure, contact submits
- IP addresses are stored as SHA-256 hashes, not raw IPs
- Retention: review and prune `security_events` periodically (suggested 90 days)

## Incident response (basics)

1. Disable compromised accounts (`is_active = false`) except the locked owner.
2. Rotate the Supabase service-role key and anon key in the dashboard, then update `.env` / host secrets.
3. Review `security_events` and `activity_logs`.
4. Restore CMS/media from the latest Supabase backup if data was destroyed.

## Backup / recovery

- Enable Supabase daily backups (Pro) or `pg_dump` on a schedule.
- Media lives in Storage buckets; back up buckets separately.
- Do not expose backup files or credentials on the public site.
- Keep a copy of `supabase/migrations/*.sql` in git.

## Dependency updates

```bash
npm audit
npm run lint
npm run build
```

Upgrade Next.js, React, and `@supabase/*` promptly for auth/HTTP CVEs. Do not skip lockfile review.

## Testing

After deploying SQL + code:

- Unauthenticated visit to `/admin` → login
- Editor cannot open `/admin/users` or `/admin/security`
- Contact form rejects empty/malformed input and rate-limits repeats
- SVG upload is rejected
- Response headers include CSP and `X-Frame-Options`

## Security checklist

| Area | Status |
| --- | --- |
| Authentication | PASS |
| Authorization / RBAC | PASS |
| Admin protection | PASS |
| RLS | PASS (apply `security_hardening.sql` in production) |
| Storage policies | PASS (apply SQL) |
| API security | PASS |
| Input validation | PASS |
| XSS | PASS |
| CSRF | PASS |
| Rate limiting | PASS (requires SQL RPC; fail-open if missing) |
| Security headers | PASS |
| CSP | PASS (Next.js requires `unsafe-inline`/`unsafe-eval` on scripts) |
| Cookies | PASS |
| Environment variables | PASS |
| File uploads | PASS (SVG disabled) |
| Audit logs | PASS |
| Error handling | PASS |
| Cache security | PASS |
| Contact form protection | PASS |
| Dependency vulnerabilities | NEEDS REVIEW (run `npm audit` on each release) |
| Backup / recovery | NEEDS REVIEW (Supabase dashboard / hosting) |

