# Gmail Automation Tool

## Overview
Web-based automation for Gmail: rules, auto-labeling, auto-reply/forward, scheduling, dashboard.

## Prerequisites
- Node 18+
- Docker & docker-compose
- MongoDB (local or hosted)
- Google Cloud console: OAuth 2.0 Client ID (with redirect URI `http://localhost:4000/api/auth/google/callback`)
- Redis (optional for future scale)

## Quick dev run (docker-compose)
1. Copy `.env.example` files to `.env` files in the backend and frontend folders and populate values.
2. `docker-compose up --build`
3. Open `http://localhost:3000` (frontend)

## Tests
In `backend/`:
