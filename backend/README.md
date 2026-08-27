# StudySpace AI — Backend

Production-ready **MERN** (MongoDB, Express, React, Node.js) REST API for
StudySpace AI, a campus study-space finder and booking platform.

> This repository contains **only the backend**. The React/TypeScript/Vite
> frontend is developed separately and consumes this API.

---

## 1. Project Overview

StudySpace AI helps students find, book, and check into study spaces and
seats across campus, with real-time occupancy, smart recommendations,
waitlists, QR check-in, a 5-minute no-show policy, reviews, issue
reporting, and a full admin dashboard with analytics.

## 2. Tech Stack

- **Runtime:** Node.js (>=18) + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** Zod
- **Security:** Helmet, CORS, express-mongo-sanitize, express-rate-limit
- **Scheduling:** node-cron (no-show processing, waitlist expiry)
- **QR codes:** qrcode

## 3. Installation

```bash
cd backend
npm install
```

## 4. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/studyspace_ai` |
| `JWT_SECRET` | Secret used to sign JWTs | — (required) |
| `JWT_EXPIRES_IN` | JWT expiry | `7d` |
| `CLIENT_URL` | Allowed CORS origin (frontend URL) | `http://localhost:5173` |
| `NO_SHOW_CRON` | Cron expression for the no-show/waitlist processor | `* * * * *` (every minute) |
| `CHECKIN_WINDOW_MINUTES` | Minutes allowed to check in after start time | `5` |
| `WAITLIST_CLAIM_WINDOW_MINUTES` | Minutes a notified waitlist entry has to be claimed | `10` |
| `OCCUPANCY_MODERATE_THRESHOLD` / `_CROWDED_` / `_FULL_` | Occupancy status thresholds (%) | `50` / `75` / `90` |

## 5. MongoDB Setup

Use a local MongoDB instance or a free MongoDB Atlas cluster. Put the
connection string in `MONGO_URI`. No manual schema setup is required —
Mongoose creates collections and indexes automatically on first write.

## 6. Running the Development Server

```bash
npm run dev
```

This starts the API (via nodemon) at `http://localhost:5000`, connects to
MongoDB, and schedules the background no-show/waitlist processor.

For production:

```bash
npm start
```

## 7. Seeding the Database

```bash
npm run seed
```

This wipes and repopulates all collections with realistic demo data:
5 study spaces, seats for each, example bookings in every status
(upcoming, active, completed, no-show), reviews, issues, exams,
notifications, and waitlist entries.

## 8. Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `admin123` |
| Student | `student@demo.com` | `student123` |

## 9. API Structure

```
Routes → Controllers → Services → Models
```

Business logic (conflict detection, no-show processing, recommendation
scoring, occupancy calculation, waitlist cascading) lives in
`src/services/`, never in route files or controllers directly, so it stays
testable and reusable.

### Full endpoint list

```
Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

Users
GET    /api/users/profile
PUT    /api/users/profile

Study Spaces
GET    /api/spaces                 (search, type, facilities, noiseLevel, availability, sort, page, limit)
GET    /api/spaces/map
GET    /api/spaces/:id
GET    /api/spaces/:spaceId/seats
GET    /api/spaces/:spaceId/reviews
POST   /api/spaces                 (admin)
PUT    /api/spaces/:id             (admin)
DELETE /api/spaces/:id             (admin)
POST   /api/spaces/:spaceId/seats  (admin)

Seats
GET    /api/seats/:id
PUT    /api/seats/:id              (admin)
DELETE /api/seats/:id              (admin)

Bookings
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id
DELETE /api/bookings/:id
POST   /api/bookings/:id/cancel
GET    /api/bookings/:id/qr
POST   /api/bookings/check-in
POST   /api/bookings/:id/check-out

Occupancy
GET    /api/occupancy
GET    /api/occupancy/:spaceId

Recommendations
GET    /api/recommendations

Exams
POST   /api/exams
GET    /api/exams
PUT    /api/exams/:id
DELETE /api/exams/:id

Waitlist
POST   /api/waitlist
GET    /api/waitlist
DELETE /api/waitlist/:id
POST   /api/waitlist/:id/claim

Reviews
POST   /api/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id

Issues
POST   /api/issues
GET    /api/issues/my
GET    /api/issues/:id

Notifications
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all

Admin
GET    /api/admin/dashboard
GET    /api/admin/analytics
GET    /api/admin/spaces
POST   /api/admin/spaces
PUT    /api/admin/spaces/:id
DELETE /api/admin/spaces/:id
GET    /api/admin/seats
POST   /api/admin/spaces/:spaceId/seats
PUT    /api/admin/seats/:id
DELETE /api/admin/seats/:id
GET    /api/admin/bookings
PUT    /api/admin/bookings/:id
DELETE /api/admin/bookings/:id
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
GET    /api/admin/issues
PUT    /api/admin/issues/:id
```

## 10. Authentication

- Passwords hashed with **bcrypt** (never stored in plain text, never
  returned in API responses).
- Login/register return a **JWT** plus the user object (including `role`).
- Protected routes require `Authorization: Bearer <token>`.
- Admin-only routes additionally require `role === "admin"`.

## 11. Booking Logic

All booking rules are enforced **server-side**, in `bookingService.js`:

- Space must exist and be `active`.
- Seat must exist, belong to the space, and not be `disabled`.
- `startTime` must be before `endTime`, and not in the past.
- **Conflict prevention:** a new booking is rejected with `409` if any
  existing `upcoming`/`active` booking for the same seat overlaps the
  requested time window (`existing.start < new.end AND existing.end > new.start`).
- Cancelling immediately releases the seat and notifies the next eligible
  waitlist entry.

## 12. QR Check-In

- Every booking gets a random `qrToken` (UUID) at creation — never derived
  from or exposing user PII.
- `GET /api/bookings/:id/qr` returns a QR code (base64 PNG data URL)
  encoding only the opaque token.
- `POST /api/bookings/check-in` accepts `{ qrToken }` or `{ bookingId }`,
  verifies ownership, booking validity, and the check-in time window.

## 13. No-Show Logic

A `node-cron` job (`schedulerService.js`, default: every minute) calls
`processNoShowBookings()`, which finds any `upcoming` booking whose
`startTime + CHECKIN_WINDOW_MINUTES` has passed, marks it `no-show`,
notifies the student, and offers the freed seat to the next waitlist
entry — entirely server-side, independent of any frontend timer.

## 14. Recommendation System

`recommendationService.js` implements a weighted scoring engine (no
external AI API required):

| Factor | Default weight |
|---|---|
| Quietness | 30% |
| Availability | 25% |
| Facilities | 20% |
| Distance | 15% |
| Rating | 10% |

Weights are normalized from the user's stored `preferences`, combined
with live occupancy data and a small exam/year priority bonus from
`priorityCalculator.js`. Each result includes a `matchScore` (0–99) and
human-readable `reasons[]`. The algorithm is isolated in one service file
so it can be swapped for an ML model later without touching controllers.

## 15. Waitlist

Joining, leaving, and claiming are all validated server-side; duplicate
waiting entries for the same user/space/time window are rejected. When a
booking is cancelled or becomes a no-show, the next `waiting` entry
(lowest `position`) is automatically moved to `notified` with a
configurable claim window (`WAITLIST_CLAIM_WINDOW_MINUTES`); if it isn't
claimed in time, the same cron job expires it and cascades to the next
person in line.

## 16. Admin APIs

Dashboard, space/seat/user/booking/issue management, and analytics
(peak hours, popular spaces, occupancy trend, no-show rate, space
utilization) are all under `/api/admin/*`, protected by `protect` +
`adminOnly` middleware.

---

## Example API Requests

**Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@college.edu","password":"secret123"}'
```

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@demo.com","password":"student123"}'
```

**Create a booking**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "space": "<spaceId>",
    "seat": "<seatId>",
    "date": "2026-08-28",
    "startTime": "2026-08-28T10:00:00.000Z",
    "endTime": "2026-08-28T12:00:00.000Z"
  }'
```

**Check in**
```bash
curl -X POST http://localhost:5000/api/bookings/check-in \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"qrToken":"<qrToken>"}'
```

---

## Connecting the React Frontend

1. Ensure this backend is running (`npm run dev`) and MongoDB is reachable.
2. In the frontend, set the API base URL to `http://localhost:5000/api`
   (e.g. via an Axios instance: `axios.create({ baseURL: 'http://localhost:5000/api' })`).
3. Set `CLIENT_URL` in the backend `.env` to match the frontend's dev
   server origin (default Vite: `http://localhost:5173`) so CORS allows
   requests.
4. Store the JWT returned from `/api/auth/login` or `/api/auth/register`
   (e.g. in memory or `localStorage`) and attach it as
   `Authorization: Bearer <token>` on every subsequent request.
5. Replace the frontend's mock/localStorage service layer
   (`src/services/*.js`) with real Axios calls to the endpoints listed in
   section 9 above — the response shape (`{ success, message, data }`)
   is consistent across every endpoint.

## Testing

Import the endpoints above into Postman/Thunder Client, or use the curl
examples directly. Recommended flow to sanity-check a fresh setup:

1. `npm run seed`
2. Login as `student@demo.com` → copy the token.
3. `GET /api/spaces` → copy a `spaceId` and a `seatId` from `GET /api/spaces/:id/seats`.
4. `POST /api/bookings` with that space/seat and a near-future time window.
5. Try the same booking again → expect `409 "This seat is already booked..."`.
6. `POST /api/bookings/check-in` with the returned `qrToken`.
7. `POST /api/bookings/:id/check-out`.
8. `POST /api/reviews` referencing that completed booking.
9. Login as `admin@demo.com` → `GET /api/admin/dashboard`, `/api/admin/analytics`.
