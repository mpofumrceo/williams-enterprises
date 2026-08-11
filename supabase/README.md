# Supabase Setup for Williams Enterprises

## POS + Sales Manager (run if you already set up the database)

After the main schema, run:

`supabase/migrations/pos_sales_manager.sql`

This adds:
- `sales_manager` role
- `pos_sales` and `pos_sale_items` tables
- POS RLS policies

## Execution Order

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and fill in your keys
3. Run **`schema.sql`** in Supabase SQL Editor (Tables, RLS, Storage)
   - Must run the **entire file** in one go
   - If a previous run failed partway, run the full `schema.sql` again (tables use `IF NOT EXISTS`)
4. Run **`migrations/pos_sales_manager.sql`** (POS + sales_manager role)
5. Run **`migrations/faqs.sql`** (FAQ table + seed questions)
6. Run **`migrations/protect_super_admin.sql`** (locks `williamsenterprisess@gmail.com` as permanent admin)
7. Run **`migrations/home_showcase.sql`** (homepage video showcase CMS)
8. Run **`seed.sql`** in Supabase SQL Editor (Initial content)
9. **Create Auth user** in Supabase Dashboard → Authentication → Users:
   - Email: `williamsenterprisess@gmail.com`
   - Set a secure password
10. **Assign admin role** (if needed) — run in SQL Editor:
   ```sql
   UPDATE public.profiles SET role = 'admin', is_active = true WHERE email = 'williamsenterprisess@gmail.com';
   ```
11. Verify Storage buckets were created (founders, services, projects, gallery, news, reviews, employees, receipts, quotations)
12. Start the app: `npm run dev`

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| founders | Yes | Founder images |
| services | Yes | Service images |
| projects | Yes | Project images |
| gallery | Yes | Gallery images |
| news | Yes | News featured images |
| reviews | Yes | Review photos |
| employees | No | Employee profile photos |
| receipts | No | Expense receipts |
| quotations | No | Quotation documents |

## Notes

- Never commit `.env.local` or real credentials
- Service role key is server-only
- RLS protects all sensitive data (employees, payroll, expenses)
