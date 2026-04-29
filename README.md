# Budget Privacy (Privacy Budget)

A **choice-based web game** that helps people practice what to share **before** they post. Players work through **realistic post-style scenarios**, tune **audience**, **location tag**, **caption**, and **photo options**, then see how their choices balance **privacy** and **engagement**—with feedback after every round.

> **Tagline:** *Tune what you share — before you post.*

![License](https://img.shields.io/badge/license-ISC-blue.svg) ![Node](https://img.shields.io/badge/node-%3E%3D18-339933) ![React](https://img.shields.io/badge/react-19-61DAFB)

---

## Table of contents

- [What this game is](#what-this-game-is)
- [How to play (player flow)](#how-to-play-player-flow)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Production build & deploy](#production-build--deploy)
- [API surface (overview)](#api-surface-overview)

---

## What this game is

**Budget Privacy** (branded in-app as *Privacy Budget*) is an **educational practice** experience—not connected to real social accounts. For each of **10 scenarios**, the player:

- Reads a **scenario** and views a **“Your New Post”** preview  
- Adjusts **Audience** (e.g. Public, Friends, Close Friends, Only Me)  
- Toggles the **location tag** and chooses **keep vs edit** for the **caption**  
- Chooses **Original** or **crop/blur (A/B)** for the post image when offered  
- Submits and receives **per-level feedback** and a **running score**

The game illustrates **trade-offs** between sharing openly (engagement) and protecting details (privacy), aligned with a configurable scoring model on the server.

---

## How to play (player flow)

1. **Content warning** → **Welcome** (enter a nickname)  
2. **Instruction** (how the controls work)  
3. **Game** — 10 levels with live **Privacy** / **Engagement** meters and a **Post Now** action  
4. **Endgame** — session title, final score, leaderboard, optional **safety checklist** PDF download  
5. **Exit to menu** clears the run and returns to welcome  

*(Audio: optional click sounds, background music toggle, and music context—can be silenced in the UI where provided.)*

---

## Architecture

```text
┌─────────────────────┐     HTTP/JSON     ┌──────────────────────┐
│  React (Vite)       │  ──────────────►  │  Express API         │
│  frontend/          │  /api/players,    │  backend/            │
│  Tailwind CSS       │  /api/privacy-…  │  MongoDB (Mongoose)  │
└─────────────────────┘                   └──────────┬───────────┘
                                                     │
                                            ┌────────▼─────────┐
                                            │ Optional: Azure  │
                                            │ OpenAI (captions)│
                                            └──────────────────┘
```

**Development:** the Vite dev server **proxies** requests from `/api` to the backend (see `frontend/vite.config.js`).

**Production:** after `npm run build` in `frontend/`, the Express server in `backend/server.js` can **serve** `frontend/dist` as static files and fall through to the SPA for client-side routes, when `frontend/dist/index.html` exists.

---

## Tech stack

| Layer        | Technology |
|-------------|------------|
| **Frontend** | [React 19](https://react.dev/), [Vite 8](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`), [React Router](https://reactrouter.com/), [Axios](https://axios-http.com/), [react-icons](https://react-icons.github.io/react-icons/), [use-sound](https://github.com/joshwcomeau/use-sound) + Howler (bundled) |
| **Backend**  | [Node.js](https://nodejs.org/) (ESM), [Express 5](https://expressjs.com/), [Mongoose 8](https://mongoosejs.com/), [CORS](https://github.com/expressjs/cors), [dotenv](https://github.com/motdotla/dotenv) |
| **Data**     | [MongoDB](https://www.mongodb.com/) (Atlas or self-hosted) |
| **Scoring & content** | Level definitions in `frontend/src/data/privacyBudgetLevels.json`; server-side privacy-budget scoring in `backend/services/privacyBudgetScoringService.js` |
| **Caption AI (optional)** | [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) via `backend/services/captionGradingService.js` |

---

## Requirements

- **Node.js** 18+ (20 LTS recommended)  
- **npm** 9+ (or compatible package manager)  
- **MongoDB** reachable via connection string (local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))  
- **Optional:** Azure OpenAI credentials if you want full AI caption grading for edited captions (otherwise the service degrades with safer fallbacks)  

---

## Project structure

```text
Budget Privacy/
├── backend/                 # Express API, Mongoose models, scoring, routes
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── lib/db.js
│   └── server.js
├── frontend/                # Vite + React app
│   ├── src/
│   │   ├── pages/          # ContentWarning, Welcome, Instruction, Game, Endgame
│   │   ├── components/
│   │   ├── context/        # Privacy budget state, sound, music
│   │   ├── data/           # privacyBudgetLevels.json
│   │   └── services/       # playerService (API client)
│   ├── public/
│   ├── vite.config.js
│   └── package.json
├── scripts/reports/       # KPI export + metric dictionary (METRICS.md)
├── reports/               # Generated JSON snapshots (ignored by git)
├── package.json            # Root: start backend, combined build
├── .env.example            # Template for environment variables
└── README.md
```

---

## Run locally

### 1. Clone and install

```bash
cd "Budget Privacy"
npm install
cd frontend
npm install
cd ..
```

### 2. Configure environment

- Copy the root template and add your real values:

  ```bash
  cp .env.example .env
  ```

- Edit **`.env`**: set **`MONGO_URI`** to your MongoDB connection string.  
- **Optional (frontend only):** copy `frontend/.env.example` to `frontend/.env.local` if you need to point the browser at a full API URL (see [Environment variables](#environment-variables)).

### 3. Start the backend (terminal 1)

From the **repository root**:

```bash
npm run dev
```

This runs `nodemon backend/server.js` and listens on **`PORT`** (default **8000**).

### 4. Start the frontend (terminal 2)

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).  
API calls to `/api/...` are **proxied** to `http://localhost:8000` during development.

### 5. One-command production-style preview (optional)

Build the client and run only the server (serves `frontend/dist` if present):

```bash
npm run build
npm start
```

Then open **http://localhost:8000** (or the port in `PORT`).

---

## Environment variables

### Root `.env` (backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `PORT` | No | Server port (default `8000`) |
| `HOST` | No | Bind address; use `0.0.0.0` for containers / Render (default `0.0.0.0` in `server.js`) |
| `AZURE_OPENAI_*` | No | For AI caption grading; see `backend/services/captionGradingService.js` |

### `frontend/.env.local` (Vite)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | If empty, the app uses same-origin paths like `/api/...` (works with the Vite **proxy** in dev, or a reverse proxy in production). If set, use the full API origin, e.g. `http://localhost:8000` (no trailing slash) |

Vite only exposes variables prefixed with **`VITE_`**.

---

## Production build & deploy

1. **Build the SPA** (from repo root, or run `cd frontend && npm run build`):

   ```bash
   npm run build
   ```

   The root `build` script installs dependencies and runs `vite build` in `frontend/`.

2. **Run the server** so it can **serve** `frontend/dist` and the API on one process:

   ```bash
   npm start
   ```

3. **Deploy tips** (e.g. [Render](https://render.com/)): set **`PORT`** and **`MONGO_URI`** in the host dashboard; build command can be `npm run build`; start command `npm start` or `node backend/server.js`. Ensure the process **binds** to the host (this repo uses `HOST=0.0.0.0` by default in `server.js`).

---

## KPI reports (analytics / resume)

Aggregate stats are computed **directly from `players`** (no extra telemetry collection required for these KPIs).

1. **Definitions & Compass snippets:** `scripts/reports/METRICS.md`  
2. **Run the export** (needs network access to Atlas / MongoDB):

   ```bash
   npm run metrics:privacy
   ```

   Optional UTC date window on `createdAt`:

   ```bash
   node scripts/reports/privacyBudgetMetrics.mjs --from 2026-01-01 --to 2026-04-30
   ```

This prints JSON to stdout and writes a timestamped file under `reports/`. Metrics include starts, completes, completion rate, score stats for completers, feedback-band mix, level funnel, caption keep/edit mix, and median session duration among completers.

---

## API surface (overview)

- **`POST /api/players`** — create a player (body: `username`); used from the welcome flow  
- **`PATCH /api/players/:id`** — update player, submit privacy-budget level results  
- **`GET /api/players/leaderboard`** — leaderboard (supports query params such as `mode` / `limit` per implementation)  
- **`POST /api/privacy-budget/...`** — privacy-budget–related routes (e.g. caption grading) as defined in `backend/routes/`  

For exact request/response shapes, see `backend/controllers/` and the frontend’s `src/services/playerService.js`.

---

## License

The root `package.json` specifies **ISC** (adjust if you prefer another license).

---

## Contributing & support

1. Open issues or pull requests in your project hosting platform.  
2. Keep **secrets out of git**: use **`.env`** locally and only commit **`.env.example`**.  
3. After changing level content, edit **`frontend/src/data/privacyBudgetLevels.json`** and any mirrored server config in **`backend/data/**`** if you keep them in sync.

---

*Happy posting—after you think it through in Budget Privacy first.*
