# Rekhta Academy Pakistan

A complete academy website and learning management portal for Rekhta Academy Pakistan — a connected learning community serving students from primary to higher secondary levels. Built with React + Vite + Supabase.

## Run & Operate

- `pnpm --filter @workspace/rekhta-academy run dev` — run the frontend (public website + dashboards)
- `pnpm --filter @workspace/api-server run dev` — run the API server (admin user creation, dashboard stats)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm run typecheck` — full typecheck across all packages
- `node scripts/import-facebook-archive.mjs` — upload Facebook archive photos to the `rekhta-facebook-archive` storage bucket
- `node scripts/seed-gallery-from-facebook.mjs` — make that bucket public and sync its photos into the `gallery` table (re-runnable; clears bucket rows first)

## Supabase Setup (required before first use)

1. Run `supabase/schema.sql` in your Supabase SQL Editor
2. Run `supabase/policies.sql` in your Supabase SQL Editor
3. Run `supabase/seed.sql` in your Supabase SQL Editor
4. Create an owner account manually in Supabase Auth → Users, then insert a profile row with role='owner'

## Environment Variables (already set as Replit Secrets)

- `SUPABASE_URL` — Supabase project URL (used by API server + forwarded to frontend as VITE_SUPABASE_URL)
- `SUPABASE_ANON_KEY` — Supabase anon key (used by frontend)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (API server ONLY — never exposed to frontend)
- `SESSION_SECRET` — Express session secret

## Stack

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- Backend: Express 5 + Node.js 24 + TypeScript
- Database: Supabase (PostgreSQL) with Row Level Security
- Auth: Supabase Auth (role-based: owner/admin/teacher/parent/student)
- Storage: Supabase Storage (gallery images, teacher/student photos)
- API: Express routes for admin-only operations requiring service role key

## Where things live

- `artifacts/rekhta-academy/src/` — React frontend
  - `pages/` — all public and dashboard pages
  - `components/` — shared UI components
  - `context/AuthContext.tsx` — auth state + role routing
  - `lib/supabase.ts` — Supabase client + all TypeScript types
- `artifacts/api-server/src/routes/` — Express API routes
  - `admin.ts` — create-user, reset-password (requires service role key)
  - `dashboard.ts` — stats aggregation (overview, attendance, fees)
  - `public.ts` — admission inquiry + contact form (public)
- `lib/api-spec/openapi.yaml` — API contract
- `supabase/` — schema, RLS policies, seed data SQL files

## Academy Details

- Name: Rekhta Academy Pakistan
- Email: rekhtaacademypakistan@gmail.com
- Phone/WhatsApp: +92 304 3333418
- Timings: Open 24 hours
- Address: 2 6th Road, Block F, New Katarian Satellite Town, Rawalpindi, 46000, Pakistan
- Classes: 1–12, FSC, ICS
- Tagline: We Will Shine Together

## Roles

- `owner` / `admin` → /dashboard/admin (full access)
- `teacher` → /dashboard/teacher (assigned classes only, no fees)
- `parent` → /dashboard/parent (linked children only)
- `student` → /dashboard/student (own data only, no fees)

## User preferences

- Use Supabase client directly for all data operations (no Drizzle ORM)
- No separate Express server for data — only for admin operations requiring service role key
- Plain email format (not markdown mailto links): rekhtaacademypakistan@gmail.com
- Students must NEVER see fee records (enforced at RLS level)

## Gotchas

- The Vite config forwards SUPABASE_URL and SUPABASE_ANON_KEY as VITE_ prefixed env vars
- Always run codegen after OpenAPI spec changes
- After codegen, rebuild libs: pnpm run typecheck:libs
- RLS policies use get_my_role() helper function — must be created before policies work
- FSC/ICS fee records link to subject_id (per-subject billing)
