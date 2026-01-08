# TailwindWizard Backend Implementation Guide

This document explains the architecture, setup, and development workflow for the TailwindWizard API.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev) with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://prisma.io)
- **Authentication**: [Clerk](https://clerk.com)
- **Payments**: [Stripe](https://stripe.com)
- **Deployment**: Configured for modern cloud providers (Cloudflare, Fly.io, or VPS)

---

## Directory Structure

The project follows a modular, layer-based architecture:

```text
src/
├── app.ts            # Hono application initialization & middleware
├── server.ts         # Entry point (Bun server)
├── routes/           # Route definitions (API endpoints)
├── controllers/      # Request handlers (logic & status codes)
├── services/         # Business logic & DB operations
├── schemas/          # Zod/OpenAPI validation schemas
├── db/               # Prisma client & connection logic
├── middleware/       # Custom Hono middlewares (Auth, etc.)
└── utils/            # Helper functions
```

---

## Getting Started

### 1. Prerequisites

- [Bun](https://bun.sh) installed.
- PostgreSQL database instance.

### 2. Environment Variables

Create a `.env` file in the root of `apps/api`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tw_wizard"
CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Installation & Setup

```bash
# Install dependencies
bun install

# Generate Prisma Client
bun run db:generate

# Push schema to database
bun run db:push
```

### 4. Development

```bash
bun run dev
```

The API will be available at `http://localhost:3000`. Swagger documentation can be found at `http://localhost:3000/ui`.

---

## Implementation Workflow (Adding Features)

When adding a new entity (e.g., `Category`, `Review`), follow these steps:

### Step 1: Update Prisma Schema

Edit `prisma/schema.prisma` to add your model.

```prisma
model Category {
  id    String @id @default(cuid())
  name  String
  slug  String @unique
}
```

Then run `bun run db:generate`.

### Step 2: Create Zod Schema

Create `src/schemas/my-entity.schema.ts` using `zod-openapi`.

```typescript
import { z } from "@hono/zod-openapi";

export const MyEntitySchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .openapi("MyEntity");
```

### Step 3: Create Service

Create `src/services/my-entity.service.ts` for database interactions.

```typescript
import { prisma } from "../db/prisma.js";

export const myEntityService = {
  async getAll() {
    return prisma.myEntity.findMany();
  },
};
```

### Step 4: Create Controller

Create `src/controllers/my-entity.controller.ts` to handle requests.

```typescript
import { myEntityService } from "../services/my-entity.service.js";

export const myEntityController = {
  async list(c: Context) {
    const items = await myEntityService.getAll();
    return c.json(items, 200);
  },
};
```

### Step 5: Create Route

Create `src/routes/my-entity.route.ts` and define the OpenAPI route.

```typescript
const listRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(MyEntitySchema) } },
    },
  },
});
app.openapi(listRoute, myEntityController.list);
```

### Step 6: Register Route

Mount the new route in `src/routes/index.ts`.

```typescript
appRouter.route("/my-entity", myEntityApp);
```

---

## Authentication

Authentication is handled via the `@hono/clerk-auth` middleware. To protect a route, use the `requireAuth` middleware found in `src/middleware/`.

---

## Database Migrations

- Use `bun run db:push` for quick changes in development.
- Use `bun run db:migrate` for production-grade migrations tracking.
- Use `bun run db:studio` to visually explore the data.

---

## Commerce & Webhooks

Stripe integration is centralized in `src/services/stripe.webhook.ts`. Webhook events are stored in the `WebhookEvent` table for idempotency and audit logs.
