FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm using corepack for consistency with packageManager in package.json
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files to install dependencies efficiently
COPY apps/api/package.json ./apps/api/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/shared/package.json ./apps/shared/

# We need the prisma schema for the postinstall hook in apps/api
COPY apps/api/prisma ./apps/api/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy the rest of the source code
COPY . .

# Build the shared package first as others depend on it
RUN pnpm --filter @tw/shared build

# Build the frontend
# We skip linting to speed up build, assuming CI catches that
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter frontend build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone build
# The standalone build is located at apps/frontend/.next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./

# CRITICAL: Copy static assets to the standalone directory structure
# Standalone output puts the app code in ./apps/frontend/server.js
# It expects static files at ./apps/frontend/.next/static and ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000 \
    HOSTNAME="0.0.0.0"

# server.js is located in apps/frontend/server.js inside the standalone folder
CMD ["node", "apps/frontend/server.js"]