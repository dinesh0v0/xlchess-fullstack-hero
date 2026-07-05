# 🏆 XLChess Full-Stack Hero

> A production-ready, full-stack recreation of the [xlchess.com](https://xlchess.com) hero section. Built with **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**, powered by a scalable **Django REST API** backend.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture](#-backend-architecture)
- [API Endpoints](#-api-endpoints)
- [Design Decisions](#-design-decisions)
- [Deployment](#-deployment)
- [WebSocket Readiness](#-websocket-readiness)

---

## 🏗 Architecture Overview

This is a **monorepo** containing two independent services that communicate via REST API:

```
┌─────────────────────────────────────────────────────────────┐
│                        MONOREPO                             │
│                                                             │
│  ┌─────────────────────┐     ┌────────────────────────┐     │
│  │      Frontend        │     │       Backend           │     │
│  │  React + Vite + TS   │────▶│  Django + DRF           │     │
│  │  Tailwind CSS        │ API │  SQLite / PostgreSQL    │     │
│  │  Framer Motion       │◀────│  Session Auth           │     │
│  │                      │     │                         │     │
│  │  Deploy: Netlify     │     │  Deploy: Render         │     │
│  └─────────────────────┘     └────────────────────────┘     │
│                                                             │
│                    ┌──────────────┐                          │
│                    │  Future:     │                          │
│                    │  WebSocket   │                          │
│                    │  (Channels)  │                          │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer        | Technology                    | Purpose                                    |
| ------------ | ----------------------------- | ------------------------------------------ |
| **Frontend** | React 19 + TypeScript 6       | UI framework with strict type safety       |
| **Bundler**  | Vite 8                        | Lightning-fast HMR & optimized builds      |
| **Styling**  | Tailwind CSS v4               | Utility-first CSS with custom design tokens|
| **Animation**| Framer Motion                 | Premium micro-animations & transitions     |
| **HTTP**     | Axios                         | API client with interceptors               |
| **Backend**  | Django 4.2 + DRF              | REST API framework                         |
| **CORS**     | django-cors-headers           | Cross-origin request handling              |
| **Database** | SQLite (dev) / PostgreSQL     | Persistent storage                         |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **npm** ≥ 9.x

### 1. Clone the Repository

```bash
git clone https://github.com/dinesh0v0/xlchess-fullstack-hero.git
cd xlchess-fullstack-hero
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts at **http://localhost:5173**

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

The backend API starts at **http://localhost:8000**

### 4. Run Both Simultaneously

From the project root:
```bash
# Terminal 1
npm run dev:frontend

# Terminal 2
npm run dev:backend
```

---

## 📁 Project Structure

```
xlchess-fullstack-hero/
├── frontend/                          # React + Vite frontend
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── api/                       # API service layer
│   │   │   ├── client.ts              # Axios HTTP client with interceptors
│   │   │   ├── auth.ts                # Auth service (signUp, signIn, etc.)
│   │   │   └── game.ts               # Game state service (WebSocket-ready)
│   │   ├── components/
│   │   │   └── HeroSection/           # Modular hero section components
│   │   │       ├── HeroContainer.tsx  # Top-level grid layout wrapper
│   │   │       ├── HeroCopy.tsx       # Branding, headline, description
│   │   │       ├── GameVisual.tsx     # Chessboard + game info display
│   │   │       ├── AuthButtonGroup.tsx# Play & Sign Up CTA buttons
│   │   │       ├── ChessBoard.tsx     # Reusable 8×8 board renderer
│   │   │       ├── FloatingPieces.tsx # Decorative background elements
│   │   │       └── index.ts          # Barrel exports
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx                    # Root component
│   │   ├── main.tsx                   # Vite entry point
│   │   └── index.css                  # Global styles + Tailwind config
│   ├── index.html                     # HTML template with SEO meta tags
│   ├── vite.config.ts                 # Vite + Tailwind + API proxy config
│   ├── tsconfig.json                  # TypeScript configuration
│   └── package.json
│
├── backend/                           # Django REST Framework backend
│   ├── xlchess/                       # Django project settings
│   │   ├── settings.py                # CORS, DRF, database config
│   │   ├── urls.py                    # Root URL routing + health check
│   │   ├── wsgi.py                    # WSGI entry point
│   │   └── asgi.py                    # ASGI entry (WebSocket-ready)
│   ├── core/                          # Main Django app
│   │   ├── models.py                  # UserProfile + GameSession models
│   │   ├── serializers.py             # DRF serializers
│   │   ├── views.py                   # API views (auth + game)
│   │   ├── urls.py                    # App URL routing
│   │   ├── admin.py                   # Django admin config
│   │   └── apps.py                    # App configuration
│   ├── manage.py                      # Django management CLI
│   └── requirements.txt               # Python dependencies
│
├── package.json                       # Monorepo root scripts
├── .gitignore                         # Python + Node + IDE ignores
└── README.md                          # This file
```

---

## ⚛️ Frontend Architecture

### Component Hierarchy

```
App
└── HeroContainer (section wrapper, grid layout)
    ├── FloatingPieces (decorative background, memoized)
    ├── HeroCopy (left column)
    │   ├── Knight SVG Logo
    │   ├── Brand Text ("XLCHESS — Excel at Chess")
    │   ├── Headline ("Build the Future of Online Chess")
    │   ├── Subtitle
    │   ├── Description
    │   └── AuthButtonGroup (Play + Sign Up CTAs)
    └── GameVisual (right column)
        ├── ChessBoard (8×8 grid renderer)
        ├── Game Info Bar ("The Evergreen Game")
        ├── Moves Left Badge ("4 MOVES LEFT")
        └── Autoplay Status Bar
```

### Design System (Tailwind CSS v4)

All brand tokens are defined via `@theme` in `index.css`:

| Token                    | Value       | Usage                        |
| ------------------------ | ----------- | ---------------------------- |
| `--color-brand-navy`     | `#050B1D`   | Page background              |
| `--color-brand-surface`  | `#0B1628`   | Card/panel backgrounds       |
| `--color-brand-accent`   | `#6e63f6`   | Accent text, borders         |
| `--color-brand-cta`      | `#5B6EF5`   | Primary CTA button           |
| `--color-board-light`    | `#E8EDC8`   | Light chess squares          |
| `--color-board-dark`     | `#779556`   | Dark chess squares           |
| `--color-board-highlight`| `#F5F682`   | Last-move highlight          |

### Animation Strategy

- **Staggered Entrance**: Each hero element fades up with increasing delay (`0s → 0.8s`)
- **Bezier Easing**: `[0.22, 1, 0.36, 1]` — smooth deceleration curve
- **CTA Shine**: CSS `@keyframes shine` creates a sweeping highlight effect
- **Floating Pieces**: CSS-driven (no JS re-renders) subtle vertical drift
- **Micro-interactions**: `whileHover` / `whileTap` scale transforms on buttons

### Performance Optimizations

- All visual components are wrapped in `React.memo()` to prevent unnecessary re-renders
- Chess board state is memoized via `useMemo()`
- Floating pieces use pure CSS animations (no React state)
- Tailwind CSS v4 compiles only used utilities

---

## 🐍 Backend Architecture

### Django App: `core`

| Model          | Purpose                                      |
| -------------- | -------------------------------------------- |
| `UserProfile`  | Extends Django auth with ELO rating, stats   |
| `GameSession`  | Chess game state with FEN, PGN, status       |

### Authentication Flow

```
Client                        Server
  │                              │
  ├──POST /api/auth/register/───▶│  Create User + UserProfile
  │◀─────── 201 + User data ─────┤  Auto-login via session
  │                              │
  ├──POST /api/auth/login/──────▶│  Authenticate credentials
  │◀─────── 200 + User data ─────┤  Set session cookie
  │                              │
  ├──GET /api/auth/me/──────────▶│  Return current user profile
  │◀─────── 200 + Profile ───────┤
  │                              │
  ├──POST /api/auth/logout/─────▶│  Destroy session
  │◀─────── 200 ─────────────────┤
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint              | Auth | Description                |
| ------ | --------------------- | ---- | -------------------------- |
| POST   | `/api/auth/register/` | ✗    | Create new account         |
| POST   | `/api/auth/login/`    | ✗    | Log in with credentials    |
| POST   | `/api/auth/logout/`   | ✓    | Log out current user       |
| GET    | `/api/auth/me/`       | ✓    | Get current user profile   |

### Game State

| Method | Endpoint              | Auth | Description                |
| ------ | --------------------- | ---- | -------------------------- |
| GET    | `/api/game/`          | ✗    | List active games          |
| GET    | `/api/game/<id>/`     | ✗    | Get specific game state    |
| POST   | `/api/game/create/`   | ✓    | Create new game session    |

### Health Check

| Method | Endpoint    | Auth | Description                      |
| ------ | ----------- | ---- | -------------------------------- |
| GET    | `/health/`  | ✗    | UptimeRobot monitoring endpoint  |

---

## 🎨 Design Decisions

| Decision                       | Rationale                                                     |
| ------------------------------ | ------------------------------------------------------------- |
| **Tailwind CSS v4** (not v3)   | Latest release with native `@theme` support, no config file   |
| **Unicode chess pieces**       | Matches xlchess.com — crisp at all sizes, no image assets     |
| **`React.memo()` everywhere**  | Static hero content doesn't need re-renders                   |
| **CSS animations** for floats  | Avoids React state changes for purely visual effects          |
| **Axios over `fetch`**         | Interceptors for CSRF tokens, centralized error handling      |
| **Django session auth**        | Simpler than JWT for server-rendered auth flow                |
| **ASGI entry point**           | Prepared for Django Channels WebSocket upgrade                |
| **Vite API proxy**             | Avoids CORS issues in development                             |

---

## 🚢 Deployment

### Frontend → Netlify

```bash
# Build command
cd frontend && npm run build

# Publish directory
frontend/dist

# Environment variables
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

### Backend → Render

```bash
# Build command
pip install -r requirements.txt && python manage.py migrate

# Start command
gunicorn xlchess.wsgi:application

# Environment variables
DJANGO_SECRET_KEY=<production-secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
```

### UptimeRobot

Configure HTTP monitoring on `https://your-backend.onrender.com/health/` — returns `{"status": "ok"}`.

---

## 🔌 WebSocket Readiness

This architecture is designed for future real-time chess via **Django Channels**:

```python
# Future: backend/core/consumers.py
class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        await self.channel_layer.group_add(f"game_{self.game_id}", self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Validate move, update GameSession.fen, broadcast to opponent
        await self.channel_layer.group_send(
            f"game_{self.game_id}",
            {"type": "game.move", "move": data["move"]}
        )
```

```typescript
// Future: frontend/src/api/websocket.ts
const ws = new WebSocket(`wss://api.xlchess.com/ws/game/${gameId}/`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateBoardState(data.fen);
};
```

The ASGI entry point (`backend/xlchess/asgi.py`) and the game service layer (`frontend/src/api/game.ts`) are already structured to support this upgrade.

---

## 📝 License

MIT © [dinesh0v0](https://github.com/dinesh0v0)
