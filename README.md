# LinkVault

> Your developer brain — organized, searchable, and always accessible.

LinkVault solves **Documentation Fatigue** — the constant cycle of re-searching
for the same setup guides, component docs, and technical references every time
a new project starts. Instead of losing links across browser tabs, bookmarks,
and Notion pages, LinkVault gives you a structured, searchable home for every
resource you've ever needed.

---

## What is LinkVault?

LinkVault is a developer-centric link management tool built around the concept
of **Vaults** — project-specific collections of documentation links, tutorials,
and references. Think of it like GitHub repositories, but for your knowledge.

You create a Vault for a stack (e.g. `nextjs-fullstack` or `python-data-science`),
save links inside it with friendly aliases, tag them by category, and retrieve
them in two clicks — no re-searching ever again.

---

## Features

- **Vaults** — Organize links into project-based collections with names, descriptions, colors, and icons
- **Alias Naming** — Save a complex URL as something human-readable like `"Social Login Setup"`
- **Smart Tagging** — Categorize links as `Docs`, `UI/UX`, `Tutorial`, `Deployment`, `Tool`, `Reference`, or `Other`
- **Favorites** — Pin your most-used links for instant access
- **Global Search** — Search across all your links by keyword, tag, vault, or favorite status
- **Interactive Graph View** — Visualize your vault as an interactive node graph powered by ReactFlow
- **Public Vaults** — Share your curated link collections with the developer community
- **Vault Cloning** — Discover and clone public vaults directly into your own account
- **Auth** — Email/password, Google OAuth, and GitHub OAuth — all fully supported
- **Cross-device** — Your entire link library accessible anywhere, always in sync

---

## Tech Stack

### Backend

- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** for data persistence
- **JWT** — access + refresh token authentication
- **bcrypt** — password hashing
- **Zod** — request validation
- **Helmet** + **CORS** + **Rate Limiting** — security hardening
- Deployed on **Vercel** (serverless)

### Frontend

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** for styling
- **ReactFlow** for the interactive vault graph view
- **TanStack Query** for server state management
- **Axios** with silent token refresh interceptor
- Deployed on **Vercel**

### Database

- **MongoDB Atlas** (cloud-hosted)

---

## Project Structure

```
linkvault/
├── backend/
│   ├── api/              # Vercel serverless entry point
│   ├── config/           # Environment variable management
│   ├── db/               # MongoDB connection
│   ├── middlewares/      # Auth, validation, error handling
│   ├── models/           # Mongoose schemas (User, Vault, Link)
│   ├── modules/          # Feature modules (auth, vault, link, search, public)
│   │   ├── auth/
│   │   ├── vault/
│   │   ├── link/
│   │   ├── search/
│   │   └── public/
│   ├── utils/            # ApiError, ApiResponse, asyncHandler, token utils
│   ├── validators/       # Zod schemas per feature
│   ├── app.ts            # Express app
│   └── server.ts         # Local dev entry point
│
└── frontend/
    └── src/
        ├── api/          # Axios instance + all API call functions
        ├── components/   # Reusable UI components
        ├── context/      # Auth context
        ├── flow/         # ReactFlow canvas, nodes, layout
        ├── hooks/        # TanStack Query hooks
        ├── pages/        # Route-level page components
        └── types/        # Shared TypeScript types
```

---

## API Overview

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/google
GET    /api/v1/auth/github

POST   /api/v1/vaults
GET    /api/v1/vaults
GET    /api/v1/vaults/:slug
PATCH  /api/v1/vaults/:slug
DELETE /api/v1/vaults/:slug

POST   /api/v1/vaults/:slug/links
GET    /api/v1/vaults/:slug/links
GET    /api/v1/vaults/:slug/links/:linkId
PATCH  /api/v1/vaults/:slug/links/:linkId
DELETE /api/v1/vaults/:slug/links/:linkId
PATCH  /api/v1/vaults/:slug/links/:linkId/favorite

GET    /api/v1/search

GET    /api/v1/public/vaults
GET    /api/v1/public/vaults/search
GET    /api/v1/public/vaults/:slug
POST   /api/v1/public/vaults/:slug/clone
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- MongoDB Atlas URI
- Google OAuth credentials
- GitHub OAuth credentials

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your env variables
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

### Environment Variables (Backend)

```env
PORT=8000
MONGO_URI=
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=7d
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8000/api/v1/auth/github/callback
```

---

## Deployment

Both services are deployed on **Vercel**.

- Frontend: [linkvault-chi.vercel.app](https://linkvault-chi.vercel.app)
- Backend: [linkvault-backend-six.vercel.app](https://linkvault-backend-six.vercel.app)

No cold starts. No downtime. Always on.

---
