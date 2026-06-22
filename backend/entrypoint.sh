#!/bin/sh
set -e

echo "Resetting and applying migrations..."
# Use migrate reset to ensure clean state, then deploy
npx prisma migrate reset --force --skip-seed

echo "Running migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Running seed..."
node dist/prisma/seed.js 2>/dev/null || echo "Seed failed — continuing."

echo "Starting server..."
exec node dist/src/server.js
