#!/bin/sh
set -e

echo "Dropping and recreating database schema..."
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;'))
  .then(() => { console.log('Schema reset complete.'); client.end(); })
  .catch(e => { console.error('Reset failed:', e.message); client.end(); process.exit(1); });
"

echo "Running migrations..."
npx prisma migrate deploy

echo "Running seed..."
node dist/prisma/seed.js

echo "Starting server..."
exec node dist/src/server.js
