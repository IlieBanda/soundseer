# Soundseer

**Jellyseerr, but for music.** Search for artists and albums, request them, get
approved by an admin (or auto-approved), and Soundseer pushes the request to
[Lidarr](https://lidarr.audio/), which downloads it straight into your music
library (Navidrome, Jellyfin Music, Plex, …).

[![CI](https://github.com/IlieBanda/soundseer/actions/workflows/ci.yml/badge.svg)](https://github.com/IlieBanda/soundseer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)

## Why

The \*arr / \*seerr ecosystem has request managers for movies and TV
(Overseerr, Jellyseerr) but nothing equivalent for music on top of Lidarr.
Soundseer fills that gap: a small, self-hosted request queue with roles,
notifications, and a direct pipe into Lidarr.

## Features

- 🔍 Search artists and albums via **MusicBrainz**, cover art from the
  **Cover Art Archive**
- 📝 Request queue with an admin approval workflow
- 👥 User roles and per-user auto-approval
- 🎵 Approved requests are pushed straight to **Lidarr** — artist is added,
  the album is monitored, and a search is triggered automatically
- ✅ Requests flip to "Available" via a Lidarr webhook, or a periodic
  background sync as a fallback
- 🔔 Discord and Telegram notifications on approve / decline / available
- 🐳 Ships with a Dockerfile and docker-compose for self-hosting

## Stack

Next.js 16 (App Router) + TypeScript, Prisma + SQLite, Tailwind CSS, and a
small cookie/session auth layer (JWT cookie backed by a revocable session
table) — no external auth provider required.

## Quick start (development)

```bash
npm install
cp .env.example .env   # then set SESSION_SECRET: openssl rand -base64 32
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the first visit
redirects to `/setup` to create the admin account.

## Run with Docker

```bash
echo "SESSION_SECRET=$(openssl rand -base64 32)" > .env
docker compose up -d --build
```

The app is served on `http://localhost:5500`. The SQLite database lives in
`./data` on the host (bind-mounted volume), so it survives rebuilds.

## Connecting Lidarr

1. Sign in as an admin → **Settings → Lidarr**.
2. Enter the Lidarr URL (e.g. `http://lidarr:8686` on a shared Docker network,
   or `http://192.168.1.10:8686`) and an API key (Lidarr → Settings →
   General).
3. Click **"Load profiles from Lidarr"** to populate quality/metadata
   profiles and root folders, or enter their IDs manually.
4. Save — the connection is verified before anything is persisted.

### Webhook for instant "Available" status (optional)

In Lidarr: **Settings → Connect → add Webhook**, URL —
`http://<soundseer-host>:5500/api/webhooks/lidarr`, method `POST`, events
`On Import Complete` / `On Upgrade`. Without the webhook, requests still
resolve — a background job polls Lidarr every 5 minutes as a fallback.

> The webhook endpoint has no authentication of its own — it's meant to be
> called from a trusted network (e.g. the same Docker network as Lidarr).
> Don't expose it directly to the public internet.

## Notifications

**Settings → Notifications**: set a Discord webhook URL and/or a Telegram bot
token + chat ID. The "Send test notification" button verifies delivery.

## Users and roles

**Settings → Users**: admins create accounts (there's no public signup),
assign a role (`ADMIN` / `USER`), and can flip on auto-approval — those
users' requests skip the queue and go straight to Lidarr.

## Project layout

```
prisma/schema.prisma        — models: User, Session, MusicRequest, Settings
src/lib/
  musicbrainz.ts             — rate-limited MusicBrainz client
  lidarr.ts                  — Lidarr REST API v1 client
  session.ts, auth.ts        — sessions and auth
  notifications/             — Discord and Telegram
  sync.ts                    — periodic Lidarr status sync
src/app/
  (auth)/setup, login         — first-run setup and sign-in
  (app)/discover, artist,
        requests, settings    — main app UI
  api/search, webhooks/lidarr,
      lidarr/options          — internal API routes
src/instrumentation.ts        — boots the background sync cron job
```

## Contributing

Issues and PRs welcome. The app is a fairly standard Next.js App Router
project — `npm run dev`, `npx tsc --noEmit`, and `npx eslint .` are your
main tools.

## License

[MIT](LICENSE)
