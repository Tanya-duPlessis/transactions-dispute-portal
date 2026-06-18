#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking if seed is needed..."
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(c => { console.log(c); p.\$disconnect(); }).catch(() => { console.log(0); p.\$disconnect(); });
")

if [ "$USER_COUNT" = "0" ]; then
  echo "Database is empty — running seed..."
  node dist/prisma/seed.js
  echo "Seed complete."
else
  echo "Database already has data — skipping seed."
fi

echo "Starting server..."
exec node dist/server.js
