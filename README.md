# Williams Enterprises — Full Platform

Premium corporate website and management platform for Williams Enterprises, built with Next.js 16, Supabase, and TypeScript.

## Features

### Public Website
- Dynamic homepage with hero, services, projects, gallery, news, reviews, newsletter
- CMS-driven About, Services, Projects, Gallery, News, Contact pages
- Stebo Ai virtual assistant (data-driven retrieval)
- Leaflet/OpenStreetMap on Contact page
- Premium animations with reduced-motion support
- SEO metadata, sitemap, robots.txt

### Admin Portal
- Hidden entry via glowing orange square in footer → `/portal/auth`
- Full CMS: Services, Projects, Gallery, News, Founder, About, Heroes, Contact, Social
- Reviews moderation, Newsletter management
- HR: Employees, Payroll (auto net-pay calculation)
- Finance: Expenses, Construction Quotations (PDF export, print, duplicate)
- Stebo Ai Knowledge management + test chat
- User management, Activity logs, Settings

## Setup

### 1. Prerequisites
- Node.js 18+
- Supabase account

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Supabase database
Run in Supabase SQL Editor **in order**:
1. `supabase/schema.sql` — tables, RLS, storage buckets
2. `supabase/seed.sql` — initial content from existing website

See `supabase/README.md` for details.

### 5. Create admin account
1. Supabase Dashboard → Authentication → Users → Add user
2. Email: `williamsenterprisess@gmail.com`
3. Set a secure password
4. Run in SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'williamsenterprisess@gmail.com';
```

### 6. Run the application
```bash
npm run dev
```
Visit http://localhost:3000

Admin portal: click the small glowing orange square in the footer, or go to `/portal/auth`

### 7. Stebo Ai knowledge indexer (optional)
```bash
pip install -r scripts/ai/requirements.txt
set SUPABASE_URL=your_url
set SUPABASE_SERVICE_ROLE_KEY=your_key
python scripts/ai/index_knowledge.py
```

## Manual Configuration Items

Fill in via admin dashboard after setup:
- Founder name, title, biography, and photo
- Company stats (currently `[ADD STAT]` placeholders)
- Detailed address if needed beyond "Zimbabwe"
- News articles
- Any additional social links (LinkedIn, TikTok, YouTube, X)

## Testing Checklist

### Public Website
- [ ] Homepage loads with dynamic sections
- [ ] About, Services, Projects, Gallery, News, Contact pages
- [ ] Contact form submits successfully
- [ ] Newsletter subscription works (no duplicates)
- [ ] Leave a Review form submits (pending moderation)
- [ ] Stebo Ai chat responds from website data
- [ ] Map displays on Contact page
- [ ] Mobile/tablet/desktop responsive

### Admin Portal
- [ ] Login at `/portal/auth` with admin credentials
- [ ] Dashboard shows KPIs and recent activity
- [ ] Services CRUD
- [ ] Projects CRUD
- [ ] Gallery CRUD
- [ ] News CRUD
- [ ] Founder management
- [ ] Reviews approve/hide/delete
- [ ] About, Heroes, Contact, Social CMS
- [ ] Newsletter subscriber management
- [ ] Employees CRUD
- [ ] Payroll with auto net calculation
- [ ] Expenses CRUD
- [ ] Quotations create/duplicate/print/PDF
- [ ] Stebo Ai knowledge CRUD + test
- [ ] User role management
- [ ] Activity logs visible
- [ ] Settings update

### Security
- [ ] `/admin/*` redirects unauthenticated users
- [ ] RLS prevents public access to private data
- [ ] Service role key not exposed in client bundle

## Project Structure

```
src/
  app/
    (website)/     # Public pages
    admin/         # Admin dashboard
    portal/auth/   # Hidden login
    api/           # Stebo Ai, PDF routes
  components/      # UI, admin, forms, ai
  lib/             # Supabase, auth, actions, ai, data
  types/           # TypeScript types
supabase/          # SQL schema, seed, docs
scripts/ai/        # Python knowledge indexer
```

## Deployment

1. Set environment variables on your hosting platform
2. Set `NEXT_PUBLIC_SITE_URL` to your production domain
3. Run `npm run build && npm start`
4. Ensure Supabase project is in same region for low latency

## License

Private — Williams Enterprises
