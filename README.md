# StudySpace AI

A full-stack MERN application that helps students find, book, and check into study spaces and seats across campus — with real-time occupancy, smart recommendations, waitlists, QR check-in, a no-show policy, reviews, issue reporting, and a full admin dashboard with analytics.

This is a monorepo-style checkout containing two independent projects:

```
studyspace-ai/
  backend/     Node.js + Express + MongoDB REST API   → backend/README.md
  frontend/    React + Vite single-page app            → frontend/README.md
```

Each has its own README with full setup instructions. This document covers how they fit together and how to run the whole thing end to end.

## Architecture

```
┌─────────────────────┐        HTTP / JSON         ┌──────────────────────┐
│   React (Vite) SPA   │  ───────────────────────►  │  Express REST API    │
│   frontend/          │  ◄───────────────────────  │  backend/             │
│                       │   Authorization: Bearer    │                      │
└─────────────────────┘                             └──────────┬───────────┘
                                                                 │
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │     MongoDB       │
                                                        └──────────────────┘
```

- The **frontend** never talks to MongoDB directly — every read/write goes through the backend's REST API via the Axios client in `frontend/src/services/`.
- The **backend** owns all business logic: booking-conflict detection, no-show processing, waitlist cascading, occupancy calculation, and recommendation scoring. This keeps the rules enforced server-side regardless of which client calls the API.
- Auth is stateless JWT: the backend issues a token on login/register, the frontend stores it and attaches it as `Authorization: Bearer <token>` on every subsequent request.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite 5, React Router 7, Tailwind CSS, Axios, Recharts, Leaflet |
| Backend | Node.js (≥18), Express, MongoDB + Mongoose, JWT + bcrypt, Zod validation |
| Security | Helmet, CORS, express-mongo-sanitize, express-rate-limit |
| Scheduling | node-cron (no-show + waitlist-expiry processing) |

## Quick Start (both projects)

You'll need Node.js ≥18 and a MongoDB instance (local or Atlas).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, etc.
npm run seed               # wipes + repopulates demo data
npm run dev                 # → http://localhost:5000

# 2. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env       # defaults to http://localhost:5000/api
npm run dev                 # → http://localhost:5173
```

Make sure the backend's `CLIENT_URL` (`.env`) matches the frontend's dev origin (`http://localhost:5173` by default) so CORS allows requests.

Open `http://localhost:5173` and log in with a demo account:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `admin123` |
| Student | `student@demo.com` | `student123` |

## Where to Look

- **Full backend API reference, env vars, business rules (booking conflicts, no-show policy, waitlist cascading, recommendation weights):** [`backend/README.md`](./backend/README.md)
- **Frontend project structure, services layer, and known shape gaps between the two projects:** [`frontend/README.md`](./frontend/README.md)

## Suggested End-to-End Smoke Test

1. `npm run seed` in `backend/`.
2. Log in as `student@demo.com` on the frontend.
3. Browse **Find Spaces**, open a space, and book a seat for a near-future time.
4. Check in from **Bookings** (or scan the QR from `GET /api/bookings/:id/qr`), then check out.
5. Leave a review for that completed booking.
6. Log out, log back in as `admin@demo.com`, and confirm the booking, review, and updated occupancy all show up under **Admin → Dashboard / Analytics / Occupancy**.

## Deployment Notes

- Set `NODE_ENV=production` and a strong, unique `JWT_SECRET` in the backend's environment — the backend refuses to start in production without one.
- Point the frontend's `VITE_API_URL` at the deployed backend's public URL, and set the backend's `CLIENT_URL` to the deployed frontend's origin.
- The frontend is a static build (`npm run build` → `dist/`) and can be hosted on any static host (Vercel, Netlify, S3 + CloudFront, etc.); the backend needs a long-running Node process (for the cron scheduler) rather than a serverless function.
