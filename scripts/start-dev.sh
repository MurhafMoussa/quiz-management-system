#!/usr/bin/env bash
set -e

echo "Starting Docker containers (PostgreSQL & Redis)..."
docker compose up -d

echo "Running database migrations..."
npx prisma migrate dev

echo "Starting NestJS server in watch mode..."
npm run start:dev
