# Asladdiin Abduqaadir — Portfolio

Personal portfolio and admin platform built as a full-stack monorepo. Features a dynamic hero with parallax background, animated sections, project showcase, photo gallery, contact form, and a complete admin control panel.

**Live:** _coming soon_

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (Mongoose) |
| Cache | Redis (ioredis) |
| Media | Cloudinary (images + videos) |
| Auth | JWT access tokens + HttpOnly refresh token rotation |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
portfolio/
├── apps/
│   ├── client/          # React + Vite SPA
│   └── server/          # Express REST API
├── packages/
│   └── shared/          # Shared Zod schemas + TypeScript types
├── docker-compose.yml   # Local MongoDB + Redis
└── pnpm-workspace.yaml
```

---

## Features

**Public**
- Animated Hero with full-screen parallax background (mouse-tracked)
- Typewriter cycling role animation
- About section with hover image cards
- Experience / timeline section
- Project grid with search + tech filter
- Photo & video gallery with lightbox
- Workflow pipeline + contact form

**Admin Dashboard** (`/admin`)
- Hero content editor (text, images, badges — all live)
- Projects CRUD with markdown live-preview editor
- Gallery manager (upload photos/videos from device or cloud storage)
- Social links manager (add any platform dynamically)
- Site settings (card hover images for About section)
- Messages inbox (contact form submissions)

---

## Local Development

**Prerequisites:** Node.js 20+, pnpm 8+, Docker or Podman

```bash
# 1. Clone
git clone https://github.com/Asladdiin92/portfolio.git
cd portfolio

# 2. Install dependencies
pnpm install

# 3. Start MongoDB + Redis
docker compose up -d   # or: podman-compose up -d

# 4. Copy environment variables
cp .env.example .env
# Edit .env with your values

# 5. Seed the database
pnpm --filter @portfolio/server seed
pnpm --filter @portfolio/server create-admin

# 6. Start dev servers (two terminals)
pnpm dev:server   # http://localhost:5000
pnpm dev:client   # http://localhost:5173
```

---

## Environment Variables

Create `.env` in the project root (see `.env.example`):

```env
# MongoDB
MONGO_URI=mongodb://admin:secret@localhost:27017/portfolio_db?authSource=admin

# Redis
REDIS_URL=redis://:redis_secret@localhost:6379

# JWT
JWT_SECRET=your_32_char_secret_here
JWT_REFRESH_SECRET=your_32_char_refresh_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Deployment

| Service | Platform |
|---|---|
| Client | Vercel |
| Server + Redis | Railway |
| Database | MongoDB Atlas |
| Media | Cloudinary |

---

## License

MIT — feel free to use as a template for your own portfolio.

---

*Built by [Asladdiin Abduqaadir](https://github.com/Asladdiin92) — IT Student @ Haramaya University, Oromia, Ethiopia.*
