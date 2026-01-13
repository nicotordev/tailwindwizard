# Repository Guidelines

## Project Structure & Module Organization

- `apps/api`: Hono-based API with Prisma. Entry points in `apps/api/src/server.ts` and `apps/api/src/app.ts`; routes in `apps/api/src/routes`, controllers in `apps/api/src/controllers`, services in `apps/api/src/services`, schemas in `apps/api/src/schemas`, and middleware in `apps/api/src/middleware`.
- `apps/frontend`: Next.js app router in `apps/frontend/app`, shared UI in `apps/frontend/components`, client helpers in `apps/frontend/lib`, and public assets in `apps/frontend/public`.
- `apps/shared`: Shared TypeScript schemas and types in `apps/shared/src` published as `@tw/shared`.
- Workspace configuration lives at `pnpm-workspace.yaml` with package roots in `apps/*`.

## Build, Test, and Development Commands

Use pnpm workspaces with filters (run from repo root):

```bash
pnpm install
pnpm --filter @tw/shared build          # build shared types
pnpm --filter tw-wizard-api dev         # start API dev server
pnpm --filter tw-wizard-api build       # compile API to dist
pnpm --filter tw-wizard-api lint        # lint API sources
pnpm --filter tw-wizard-api typecheck   # TS typecheck API
pnpm --filter tw-wizard-api db:migrate  # run Prisma migrations
pnpm --filter frontend dev              # start Next.js dev server
pnpm --filter frontend build            # build Next.js app
pnpm --filter frontend lint             # lint frontend
pnpm --filter frontend gen:api          # regenerate API types (API must be running)
```

## Coding Style & Naming Conventions

- TypeScript across all apps; keep code in ESM style (`type: "module"`).
- Linting: ESLint in `apps/api/eslint.config.js` and `apps/frontend/eslint.config.mjs`.
- Formatting: API uses Prettier via `pnpm --filter tw-wizard-api format`; otherwise match existing formatting.
- Naming patterns: `*.route.ts`, `*.controller.ts`, `*.service.ts`, `*.schema.ts`; React components use PascalCase filenames in `apps/frontend/components`.

## Testing Guidelines

- No dedicated test suite is configured yet (`apps/api` has a placeholder `test` script).
- Validate changes with lint and typecheck, and run the affected app locally.
- If you introduce tests, keep them close to the feature and align names with the chosen framework (e.g., `*.test.ts`).

## Commit & Pull Request Guidelines

- Commit messages are short and often scoped, e.g., `feat:`, `fix:`, `ui:`, `admin:`, `shared:`, `db:`, `types:`, `market:`. Follow the same pattern and keep summaries in present tense.
- PRs should include a clear summary, testing notes (commands run), and screenshots for UI changes. Link related issues when applicable.

## Configuration & Secrets

- API configuration is sourced from `apps/api/.env` (see `apps/api/env.d.ts` for expected keys).
- Never commit secrets; mention any new required env vars in the PR description.
