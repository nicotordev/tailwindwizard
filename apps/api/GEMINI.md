# TailwindWizard API

## Project Overview
This is the backend API for **TailwindWizard**, designed to handle onboarding flows, resume parsing, and other core platform features. It is built as a modular, type-safe application using modern TypeScript tools.

## Tech Stack
- **Runtime:** Bun (preferred) / Node.js
- **Framework:** [Hono](https://hono.dev) (v4.x)
- **API Spec:** OpenAPI v3.1 via `@hono/zod-openapi`
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://prisma.io)
- **Authentication:** [Clerk](https://clerk.com) (`@hono/clerk-auth`)
- **Payments:** [Stripe](https://stripe.com)
- **Validation:** Zod
- **Package Manager:** `pnpm` (configured in `package.json`), but project documentation favors `bun`.

## Architecture
The project follows a **Service-Controller-Route** layered architecture:

1.  **Routes (`src/routes/`)**: Define the API endpoints using `zod-openapi` for contract definition.
2.  **Controllers (`src/controllers/`)**: Handle HTTP requests, parse inputs, call services, and return responses.
3.  **Services (`src/services/`)**: Contain the core business logic and database interactions.
4.  **Database (`src/db/`)**: Prisma client initialization and configuration.
5.  **Schemas (`src/schemas/`)**: Zod schemas for request/response validation and OpenAPI generation.

## Setup & Development

### Prerequisites
- **Bun** (or Node.js v20+)
- **PostgreSQL** database

### Environment Variables
Create a `.env` file based on `env.d.ts` or project documentation:
```bash
DATABASE_URL="postgresql://..."
CLERK_SECRET_KEY="..."
STRIPE_SECRET_KEY="..."
# ... see BACKEND_GUIDE.md for full list
```

### Key Commands

| Action | Command (Bun) | Command (pnpm) | Description |
| :--- | :--- | :--- | :--- |
| **Install** | `bun install` | `pnpm install` | Install dependencies |
| **Dev Server** | `bun run dev` | `pnpm dev` | Starts server in watch mode |
| **Build** | `bun run build` | `pnpm build` | Compiles TypeScript to `dist/` |
| **DB Generate** | `bun run db:generate` | `pnpm db:generate` | Generates Prisma Client |
| **DB Push** | `bun run db:push` | `pnpm db:push` | Pushes schema changes to DB (dev) |
| **DB Studio** | `bun run db:studio` | `pnpm db:studio` | Opens Prisma Studio GUI |

## Development Conventions

### Adding a New Feature
Follow the strict flow defined in `BACKEND_GUIDE.md`:
1.  **Model**: Update `prisma/schema.prisma`.
2.  **Schema**: Create Zod schema in `src/schemas/`.
3.  **Service**: Implement logic in `src/services/`.
4.  **Controller**: Handle request in `src/controllers/`.
5.  **Route**: Define OpenAPI route in `src/routes/`.
6.  **Register**: Add to `src/routes/index.ts`.

### Code Style
-   **Type Safety**: Strict TypeScript usage. No `any`.
-   **Validation**: All inputs must be validated via Zod schemas in the route definition.
-   **Formatting**: Prettier is used for formatting.
-   **Linting**: ESLint is configured.

### API Documentation
Swagger UI is available at `/ui` (e.g., `http://localhost:3000/ui`) when the server is running.
