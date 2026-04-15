# Simplified Trello — Collaborative Project Management App

> Senior Developer Technical Test | Laravel 11 + React 18 | 100 pts

[![CI](https://github.com/trongsau9696/simplified_trello_demo/actions/workflows/ci.yml/badge.svg)](https://github.com/trongsau9696/simplified_trello_demo/actions)

## ✨ Features

### Core Functionality
- **Kanban Board** — Drag-and-drop tasks across columns (Backlog → In Progress → In Review → Done)
- **Project Management** — Create, update, and archive projects with soft delete support
- **Task Management** — Create, assign, prioritize (Low/Medium/High), and track tasks with due dates
- **Role-Based Access Control** — Owner, Editor, and Viewer roles with fine-grained permission enforcement
- **Member Management** — Invite members to projects; restrict task creation/editing by role

### Real-Time & UX
- **Real-Time Updates** — Live task status sync via Laravel Reverb (WebSocket) using private channels
- **Optimistic UI** — Task moves update instantly; background sync keeps data consistent
- **Assignee Validation** — Task assignees must be verified project members
- **PDF Export** — Generate a printable project report with task breakdown

### Security & Reliability
- **Sanctum Token Auth** — Stateless API tokens for SPA authentication
- **Private Broadcast Channels** — WebSocket events restricted to authorized users only
- **Rate Limiting** — Auth routes throttled at 10 requests/minute
- **Soft Deletes** — Projects and tasks are recoverable, not permanently lost

---

## 📸 Screenshots

| Login | Dashboard |
|-------|-----------|
| ![Login Page](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

**Kanban Board**

![Kanban Board](docs/screenshots/kanban.png)

---

## 🚀 Quick Start (< 5 minutes)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Setup

```bash
git clone https://github.com/trongsau9696/simplified_trello_demo.git
cd simplified_trello_demo

# Start all services (PHP 8.3, Nginx, MySQL 8, Redis 7.2, Node 18)
docker compose up -d

# Wait ~30s for MySQL to initialize, then:
docker compose exec app php artisan migrate --seed

# App will be available at:
# Backend API: http://localhost:8000/api
# Frontend:    http://localhost:5173
```

### Demo Credentials
| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password | Owner |
| bob@example.com   | password | Editor |
| carol@example.com | password | Viewer |

---

## 🏗 Architecture

```
simplified_trello_demo/
├── backend/          # Laravel 11 API
├── frontend/         # React 18 + Vite SPA
├── docker/           # Nginx config, PHP config
├── .github/workflows/# GitHub Actions CI
└── docker-compose.yml
```

## 🔧 Technical Choices

### Backend (Laravel 11)
- **Sanctum** for SPA token auth (stateless API tokens)
- **Repository pattern** to decouple data access from business logic
- **Service layer** for orchestrating business workflows
- **Form Requests** for validation — colocated with HTTP layer
- **API Resources** with `whenLoaded()` to avoid N+1 and over-fetching
- **Cursor pagination** for efficient large dataset navigation
- **Redis** (predis/predis) for stats caching with write-through invalidation
- **Soft deletes** on projects and tasks for data recovery
- **Larastan level 6** for strict static analysis

### Frontend (React 18)
- **Zustand** for client state (auth, active project) — lightweight, no boilerplate
- **React Query (TanStack)** for server state — handles caching, deduplication, and background refetch
- **dnd-kit** for accessible drag-and-drop (keyboard support, aria-labels)
- **Optimistic updates** on task status change — instant UI, sync in background
- **React Hook Form + Zod** — validation synced with API error shapes
- **Lazy loading** all pages with `React.lazy` + Suspense
- **Dark mode** design system with CSS Modules

### DevOps
- **Docker Compose** — one command to start everything
- **GitHub Actions** — lint + tests on every push
- **Conventional commits** — feat, fix, refactor, test, docs

## ▶️ Running Tests

### Backend
```bash
docker compose exec app php artisan test
```

### Frontend
```bash
docker compose exec node npm run test
```

### Lint & Static Analysis
```bash
docker compose exec app ./vendor/bin/pint --test
docker compose exec app ./vendor/bin/phpstan analyse
docker compose exec node npm run lint
```

## ⚠️ Security Notes
- API keys and secrets are **never committed** — use `.env` (not versioned)
- Rate limiting on auth routes (10 req/min)
- CSRF via Sanctum stateful API
- XSS: React escapes all output by default
- SQL injection: prevented by Eloquent parameterized queries
