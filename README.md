# Gmail Automation

A full-stack Gmail automation app. Authenticate via Google OAuth, define rules (label, archive, auto-reply, forward), and let the scheduler process your inbox on a cron schedule.

## Structure

```
/
├── backend/   Node.js + Express + MongoDB API
└── frontend/  React + Vite + MUI dashboard
```

---

## Backend

### Setup

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # nodemon + hot reload
```

### Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `OAUTH_REDIRECT_URI` | Must match Google Console — e.g. `http://localhost:4000/api/auth/google/callback` |
| `JWT_SECRET` | Random secret for signing JWTs (min 32 chars) |
| `ENCRYPTION_SECRET` | 64 hex chars (32 bytes) for AES-256 token encryption |
| `FRONTEND_URL` | Frontend origin for OAuth redirect — e.g. `http://localhost:5173` |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `CRON_SCHEDULE` | Cron expression (default `*/1 * * * *`) |
| `PORT` | Server port (default `4000`) |

### API routes

```
GET  /api/auth/google/url       → returns Google OAuth URL
GET  /api/auth/google/callback  → OAuth callback, redirects to frontend with JWT
GET  /api/auth/me               → returns current user (Bearer token required)

GET    /api/rules               → list rules
POST   /api/rules               → create rule
PUT    /api/rules/:id           → update rule
DELETE /api/rules/:id           → delete rule

GET  /api/dashboard/logs        → last 200 email processing logs
GET  /api/dashboard/stats       → total + success counts
```

### Tests

```bash
npm test
```

---

## Frontend

### Setup

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL
npm install
npm run start
```

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default `http://localhost:4000/api`) |
| `VITE_APP_BASE_NAME` | Router base path (leave blank for `/`) |

---

## Key fixes applied during refactor

| # | File | Bug |
|---|---|---|
| 1 | `backend/src/utils/crypto.js` | Used ESM `import`/`export` in a CommonJS project — caused immediate runtime crash |
| 2 | `frontend/src/pages/maillogs/default.jsx` | Called `.toLowerCase()` on a `Boolean` field (`success`) — TypeError at runtime |
| 3 | `backend/src/middleware/auth.js` | `authMiddleware` was duplicated in `rules.js` and `dashboard.js` — extracted to shared module |
| 4 | `backend/src/controllers/*.js` | All controller handlers had zero `try/catch` — unhandled promise rejections on any DB error |
| 5 | `frontend/src/api.js` | JWT was passed manually to every API function — replaced with an axios request interceptor |
| 6 | `frontend/src/App.jsx` | `user` state was fetched and stored but never passed anywhere (orphaned) — removed |
| 7 | `frontend/src/pages/dashboard/default.jsx` | `useState` imported but never used |
| 8 | `frontend/src/sections/dashboard/default/OrdersTable.jsx` | `token` in `PropTypes` declared as required but sourced internally from localStorage |
| 9 | `backend/src/controllers/authController.js` | `require('dotenv').config()` called in controller — should only run once in the entry point |
| 10 | `backend/src/routes/auth.js` | `googleapis` imported but never used in the route file |
