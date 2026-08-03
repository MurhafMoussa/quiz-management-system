# Start Docker services (Postgres & Redis)
Write-Host "Starting Docker containers (PostgreSQL & Redis)..." -ForegroundColor Cyan
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start Docker compose services." -ForegroundColor Red
    exit 1
}

# Run Prisma database migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
npx prisma migrate dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to run Prisma migrations." -ForegroundColor Red
    exit 1
}

# Start NestJS dev server
Write-Host "Starting NestJS server in watch mode..." -ForegroundColor Green
npm run start:dev
