# Custom Airbnb Direct Booking Engine

Production-ready booking engine for Paraguay rentals with Airbnb iCal sync and manual approval workflow to prevent overbooking.

## Stack
- Backend: Node.js 20, Express, TypeScript, Supabase
- Frontend: React 18 + Vite (booking widget and admin dashboard)
- Database: Supabase Postgres
- Payments: Bancard (server-side only)
- Sync: node-cron + iCal parsing

## Quick Start
1. Copy `.env.example` to `.env` and fill in values.
2. Install backend dependencies and run the server:
   - `cd backend`
   - `npm install`
   - `npm run dev`
3. Install and run the booking widget:
   - `cd frontend/booking-widget`
   - `npm install`
   - `npm run dev`
4. Install and run the admin dashboard:
   - `cd frontend/admin-dashboard`
   - `npm install`
   - `npm run dev`

## Database
- Run `database/schema.sql` in Supabase SQL editor.
- Optional seed data in `database/seed.sql`.

## Key Rules
- Airbnb iCal is the source of truth.
- No automatic payment before admin approval.
- Sync runs every `SYNC_INTERVAL_MINUTES`.

## Docs
- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `docs/SETUP.md`
- `docs/ARCHITECTURE.md`
