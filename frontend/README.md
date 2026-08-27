# StudySpace AI — Frontend

React + Vite single-page app for StudySpace AI, a campus study-space finder and booking platform. This repository contains only the frontend. It consumes the [StudySpace AI backend](../backend/README.md) REST API — it does not work standalone.

## 1. Tech Stack

- **Build tool:** Vite 5
- **UI:** React 18, React Router 7, Tailwind CSS
- **Data:** Axios (talks to the backend REST API)
- **Charts:** Recharts
- **Maps:** Leaflet + React-Leaflet
- **Icons:** lucide-react
- **QR codes:** qrcode

## 2. Prerequisites

- Node.js >= 18
- The [backend](../backend/README.md) running locally (or reachable) with its database seeded

## 3. Installation

```bash
cd frontend
npm install
```

## 4. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

## 5. Running the Dev Server

```bash
npm run dev
```

Starts the app at `http://localhost:5173`. Make sure the backend's `CLIENT_URL` env var matches this origin so CORS allows requests (see backend README).

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint      # eslint
```

## 6. Demo Credentials

Same accounts as the backend seed data — use these on the login screen (or the one-click "Demo Student" / "Demo Admin" buttons):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `admin123` |
| Student | `student@demo.com` | `student123` |

## 7. Project Structure

```
src/
  components/    Reusable UI (cards, badges, occupancy bar, loading states, etc.)
  context/       AuthContext (session) and AppContext (notifications/toasts)
  layouts/       Shared page shells (student layout, admin layout)
  pages/         Route-level screens (Dashboard, FindSpaces, BookingFlow, ...)
  pages/admin/   Admin-only screens (dashboard, analytics, user/space/seat management)
  routes/        Route definitions + protected-route guards
  services/      All backend I/O — the only layer that talks to the API (see below)
  types/         Shared constants/enums used across the UI
  utils/         Formatting/helper functions
```

## 8. Services Layer

Every network call goes through `src/services/`, never directly through `fetch`/`axios` in a component:

- **`api.js`** — the shared Axios instance. Attaches `Authorization: Bearer <token>` from `localStorage` on every request, and clears the stored session on a `401` response.
- **`normalize.js`** — the single place that translates between the backend's shape (Mongo `_id`s, lowercase/kebab-case enums like `reading-room`) and the shape the UI components use (`id`, display strings like `Reading Room`). If you add a field to a backend model and want it in the UI, wire it through here.
- One file per resource — `authService`, `spaceService`, `bookingService`, `reviewService`, `issueService`, `waitlistService`, `notificationService`, `examService`, `recommendationService`, `adminService` — each a thin wrapper: build the request, call `api`, map the response through `normalize.js`.

This means: to point the app at a different backend, you only ever need to change `VITE_API_URL`; to adapt to a backend response-shape change, you only ever need to edit `normalize.js` or the one relevant service file — page components don't talk to the network directly.

## 9. Known Backend/Frontend Shape Gaps

A few UI affordances don't have a 1:1 backend equivalent yet. These are handled gracefully (documented inline in the relevant service file) rather than silently broken:

- **Seat "reserved" state.** The backend's `Seat` model only tracks `available` / `occupied` / `disabled`. There's no per-seat "reserved" flag — reservations are derived space-wide from upcoming bookings. The admin seat editor's "Reserved" option is treated as `available`.
- **Waitlist join window.** The "Join Waitlist" modal doesn't currently collect a specific date/time range from the user, but the backend needs one to know which slot to notify you for. `waitlistService.join` defaults to "now through +4 hours"; wiring a date/time picker into the modal would let a user request a specific window.
- **Recommendation breakdown.** The backend's `GET /recommendations` returns a flat match score + reasons, not a per-criterion breakdown. To keep the "match breakdown" progress bars in the UI, `recommendationService.js` re-implements the same weighted-scoring algorithm client-side against live space/occupancy data pulled from `spaceService`, rather than dropping that part of the UI.
- **Client-triggered notifications.** The backend has no public "create notification" endpoint — it creates the relevant notification itself as a side effect of the underlying action (booking confirmed, checked in, waitlist offer, etc). `pushNotification` in `AppContext` shows an immediate local toast and re-syncs the notification list from the server, rather than trying to create a duplicate notification from the client.

## 10. Connecting to the Backend

1. Start the backend (`npm run dev` in `../backend`) and confirm it's reachable at the URL in `VITE_API_URL`.
2. Run `npm run seed` in the backend if you haven't already, so there's data to see.
3. Start this app with `npm run dev` and log in with the demo credentials above.
