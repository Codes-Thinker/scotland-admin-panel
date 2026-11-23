# Admin Dashboard (Next.js)

Light ManageOn-style operations console for Fife Nearby Taxis.

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Backend

All data comes from the Fife Nearby Taxis API (`scotland-backend`). Sign in with an administrator account.

Set the API address in `.env.local` (default `http://localhost:4000/api/v1`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

The API must allow this dashboard's origin in `CORS_ORIGINS`.

Integration status:

- Done: sign-in, users, passengers, drivers (approval, documents, viewing files), rides (assign, cancel), dispatch, payments, pricing, reports, overview, live.
- Not connected: Settings (local switches only, no API), live map positions (the API stores positions but has no admin endpoint for them yet).

Sessions: the access token is kept in memory and the refresh token in `sessionStorage` (cleared when the tab closes). For production, move the refresh token to an HTTP-only cookie behind a same-site proxy.
