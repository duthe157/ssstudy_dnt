
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Cài build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    bash

# Copy package files
COPY package.json package-lock.json* ./

# Cài dependencies (bao gồm devDependencies để build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Copy .env.production BEFORE build (Next.js needs env vars at BUILD TIME)
# This file is created by Jenkins from credentials in the workspace
COPY .env.production ./.env.production

# Use production Next.js config for production builds
COPY production.next.config.mjs ./next.config.mjs

# Build Next.js with environment variables
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Chỉ copy các file cần thiết cho runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env.production ./.env.production

# Expose port
EXPOSE 3000

# Start Next.js app
CMD ["npx", "next", "start", "-p", "3000"]
