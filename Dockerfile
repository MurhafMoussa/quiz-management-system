# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies ignoring lifecycle scripts (e.g. husky git hooks)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy Prisma schema and generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source and build
COPY . .
RUN mkdir -p src/generated
RUN npm run build

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy generated Prisma Client and build artifacts from builder
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
