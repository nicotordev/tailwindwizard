FROM node:22-slim

# Install system dependencies
# Prisma needs openssl to work on slim images
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all workspace package.json files
# pnpm needs all of them to resolve the lockfile correctly
COPY apps/api/package.json ./apps/api/
COPY apps/shared/package.json ./apps/shared/
COPY apps/frontend/package.json ./apps/frontend/

# Copy prisma schema early to allow prisma generate during pnpm install (postinstall)
COPY apps/api/prisma ./apps/api/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code for the relevant packages
COPY apps/api ./apps/api
COPY apps/shared ./apps/shared

# Build shared package
RUN pnpm --filter @tw/shared build

# Generate Prisma client again to ensure it is up to date and in the right place
# (The one from postinstall might have been affected by the COPY apps/api step)
RUN pnpm --filter tw-wizard-api run db:generate

# Build API
RUN pnpm --filter tw-wizard-api build

# Set environment to production
ENV NODE_ENV=production

EXPOSE 3000

# Start the application
CMD ["pnpm", "--filter", "tw-wizard-api", "start"]
