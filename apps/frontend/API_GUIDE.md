# Frontend API Integration Guide (OpenAPI)

This guide explains how to connect the Next.js frontend with the TailwindWizard API using the OpenAPI specification for full type safety.

## 1. Accessing the OpenAPI Spec

The backend automatically generates an OpenAPI 3.1.0 specification.

- **Documentation (Swagger UI)**: `http://localhost:3000/ui`
- **JSON Specification**: `http://localhost:3000/doc`

---

## 2. Generating Types

To maintain a single source of truth, we generate TypeScript types directly from the backend's OpenAPI JSON.

### Recommended Tool: `openapi-typescript`

Install the generator in the frontend project:

```bash
bun add -d openapi-typescript
```

### Automation Script

Add this script to your `apps/frontend/package.json`:

```json
"scripts": {
  "gen:api": "openapi-typescript http://localhost:3000/doc -o ./types/api.d.ts"
}
```

Run it whenever the backend schema changes:

```bash
bun run gen:api
```

---

## 3. Implementation in React/Next.js

### Option A: Standard Fetch/Axios with Generated Types

Use the generated `components["schemas"]` to type your variables.

```typescript
import { components } from "@/types/api";

type Block = components["schemas"]["Block"];

async function getBlocks(): Promise<Block[]> {
  const res = await fetch("http://localhost:3000/api/v1/blocks");
  return res.json();
}
```

### Option B: Type-Safe Client (Zodios or similar)

For full end-to-end type safety (parameters, body, and responses), you can use a client that consumes the OpenAPI spec.

---

## 4. Hono RPC (Alternative for Monorepos)

Since this is a monorepo, we can leverage Hono's **RPC Mode** without generating files.

### Step 1: Export App Type (Backend)

In `apps/api/src/app.ts`:

```typescript
export type AppType = typeof app;
```

### Step 2: Create Client (Frontend)

In `apps/frontend/lib/api.ts`:

```typescript
import { hc } from "hono/client";
import type { AppType } from "../../api/src/app";

// This client is fully type-safe based on the backend routes
export const client = hc<AppType>("http://localhost:3000/");
```

### Step 3: Use it in Components

```typescript
const res = await client.api.v1.blocks.$get({
  query: { categorySlug: "navigation" },
});
const blocks = await res.json(); // 'blocks' is automatically typed!
```

---

## 5. Best Practices

1. **Error Handling**: Always check `res.ok` or use a wrapper that handles Hono/OpenAPI error responses.
2. **Environment Variables**: Use `NEXT_PUBLIC_API_URL` for the base path.
3. **Caching**: Use **React Query** (TanStack Query) with the API client for the best UX (loading states, caching, revalidation).
