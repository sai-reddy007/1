#!/bin/sh
set -e

npx prisma migrate deploy
if [ "${SEED_ON_START:-true}" = "true" ]; then
  npm run seed || true
fi

node dist/index.js
