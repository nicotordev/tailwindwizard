# TailwindWizard Project Context

## Project Overview
TailwindWizard is a full-stack platform for onboarding flows, resume parsing, and UI component management. It is built as a TypeScript monorepo designed for high performance and strict type safety.

## Tech Stack
- **Monorepo Manager:** `pnpm` (Workspaces)
- **Runtime:** **Bun** (Preferred) or Node.js
- **Backend (apps/api):**
  - **Framework:** Hono (v4.x) with `@hono/zod-openapi`
  - **Database:** PostgreSQL with Prisma ORM
  - **Auth:** Clerk (`@hono/clerk-auth`)
  - **Payments:** Stripe
  - **Notifications:** OneSignal
- **Frontend (apps/frontend):**
  - **Framework:** Next.js (App Router, React 19)
  - **Styling:** Tailwind CSS v4
  - **UI:** Shadcn/UI (Radix Primitives), Lucide Icons, Framer Motion
  - **Data Fetching:** TanStack Query & Axios
- **Shared (apps/shared):**
  - Shared Zod schemas and TypeScript types used by both API and Frontend.

## Building and Running

### Root Commands (pnpm)
| Action | Command |
| :--- | :--- |
| **Install** | `pnpm install` |
| **Build All** | `pnpm build` |
| **Dev (All)** | `pnpm dev` |

### Backend Commands (apps/api)
| Action | Command (Bun preferred) |
| :--- | :--- |
| **Dev Server** | `bun run dev` |
| **DB Generate** | `bun run db:generate` |
| **DB Push (Dev)** | `bun run db:push` |
| **DB Migrate** | `bun run db:migrate` |
| **DB Studio** | `bun run db:studio` |
| **Type Check** | `bun run typecheck` |

### Frontend Commands (apps/frontend)
| Action | Command |
| :--- | :--- |
| **Dev Server** | `pnpm dev` |
| **Build** | `pnpm build` |
| **Generate API Types** | `pnpm gen:api` |

---

## MCP Usage & Best Practices
This project leverages Model Context Protocol (MCP) servers to enhance development workflows. Use them proactively:

### 1. `sequentialthinking` (Problem Solving)
- **When to use:** Use for complex architectural changes, debugging deep-seated logic, or planning multi-step migrations.
- **How:** Start a sequence to break down the problem. Reflect on each step.
- **Example:** "Analyze why the Stripe webhook isn't updating the purchase status."

### 2. `codebase_investigator` (Context Discovery)
- **When to use:** When you need to understand system-wide dependencies or find the root cause of a bug in an unfamiliar part of the monorepo.
- **How:** Delegate the investigation to get a structured report of relevant files and symbols.

### 3. `resolve-library-id` & `query-docs` (Documentation)
- **When to use:** When working with core libraries like Hono, Prisma, Next.js, or Stripe.
- **How:** Always `resolve-library-id` first to get the correct context, then `query-docs` for up-to-date examples.

### 4. `google_web_search` (Latest Tech)
- **When to use:** Tailwind CSS v4 and React 19 are bleeding edge. Use search to verify the latest syntax or breaking changes not yet in your training data.

---

## MCP Tools Reference

### Core Thinking & Memory
- **`sequentialthinking`**: Advanced tool for dynamic, reflective problem-solving. Ideal for complex architectural planning or deep debugging.
- **`save_memory`**: Persists user-specific facts or preferences across sessions.
- **`delegate_to_agent`**: Hands off complex investigations to the `codebase_investigator` agent for deep analysis.

### File System & Codebase
- **`read_file` / `read_text_file` / `read_multiple_files`**: Read file contents (text, media, or batch).
- **`write_file` / `edit_file` / `replace`**: Create, overwrite, or perform surgical edits on files.
- **`list_directory` / `directory_tree`**: Explore directory structures with varying levels of detail.
- **`search_file_content`**: Fast, optimized search using `ripgrep`.
- **`glob` / `search_files`**: Find files matching specific patterns across the codebase.
- **`get_file_info`**: Retrieve metadata (size, permissions, timestamps) for files or directories.
- **`move_file` / `create_directory`**: Manage file system structure.

### Search & Web
- **`google_web_search`**: Standard Google Search for general information.
- **`search_engine` / `search_engine_batch`**: Scrape detailed search results from Google, Bing, or Yandex.
- **`web_fetch` / `scrape_as_markdown` / `scrape_batch`**: Fetch and process content from one or multiple URLs, converting to Markdown for easier analysis.

### Documentation & Libraries (Context7)
- **`resolve-library-id`**: Resolves a package name to a Context7 ID.
- **`query-docs`**: Retrieves up-to-date documentation and code examples for a specific library/version.

### Knowledge Graph
- **`create_entities` / `create_relations` / `add_observations`**: Build a structured map of concepts and their relationships.
- **`read_graph` / `search_nodes` / `open_nodes`**: Explore and query the constructed knowledge graph.
- **`delete_entities` / `delete_relations` / `delete_observations`**: Maintain and prune the graph.

### Utilities
- **`run_shell_command`**: Execute bash commands (WSL 2 / Arch Linux).
- **`zip`**: Compress files into a zip archive.
- **`printEnv`**: Debug MCP configuration environment variables.
- **`sampleLLM`**: Leverage MCP sampling feature for sub-tasks.

---

## Development Conventions

### General
- **TypeScript Only:** No plain JavaScript. Strict typing is mandatory.
- **Package Manager:** Use `bun` for backend tasks and `pnpm` for frontend/root tasks. **NEVER use `npm`.**
- **Language:** Code and comments in **English (US)**. UI may support Spanish/English.

### Backend (Service-Controller-Route)
1. **Model:** Update `prisma/schema.prisma`.
2. **Schema:** Define Zod schema in `src/schemas/` (using `zod-openapi`).
3. **Service:** Business logic in `src/services/`.
4. **Controller:** Request handling in `src/controllers/`.
5. **Route:** Define OpenAPI route in `src/routes/` and register in `index.ts`.

### Frontend
- **Components:** Use Radix primitives and Tailwind v4.
- **Icons:** Use `lucide-react`.
- **API Interaction:** Use the generated types in `apps/frontend/types/api.d.ts` via `pnpm gen:api`.

---

## Recent Context & Memory
- **Onboarding Flow:** Currently working on V2 and resume parsing features.
- **Moderation Bug:** Fixed "ModerationEvent_decidedById_fkey" error by resolving internal `User.id` from Clerk's `externalAuthId`.
- **Block Model:** Added `screenshot` to `Block` model and seeded data.
- **Type Sync:** Manually updated `frontend/types/api.d.ts` and `shared/schemas/block.schema.ts` for `screenshot`.
- **Collections:** Implemented full-stack Collections feature (Models, API, UI). Users can organize blocks.
- **Resume Parsing:** Implemented PDF parsing service (`pdf-parse`) and integrated it into the Creator Onboarding Profile step.
- **API Refactoring:** Split frontend API client into `lib/api.ts` (Server, uses `auth()`) and `lib/api-client.ts` (Client, uses `openapi-fetch` + credentials) to fix `server-only` build errors.
