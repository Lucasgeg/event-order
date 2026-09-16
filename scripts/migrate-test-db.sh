#!/usr/bin/env bash
# Applique les migrations Prisma sur la base de test (docker-compose.yml).
# À lancer une fois `docker compose up -d` fait, avant `bun run test:integration`.
set -euo pipefail
cd "$(dirname "$0")/.."
export $(grep -v '^#' .env.test | xargs)
bunx prisma migrate deploy
