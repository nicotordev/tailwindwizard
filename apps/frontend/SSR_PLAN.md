# Market Page SSR Refactoring Plan

## Objective
Move data fetching and initial rendering to the server while maintaining interactivity through Client Components and URL Search Params.

## Steps
1. **Prepare Server Components**:
   - Convert `app/market/page.tsx` to an async Server Component.
   - Use `honoClient` from `@/lib/api` for server-side fetching.
   - Handle `searchParams` for `tab`, `q`, `sort`, `dir`, and `page`.

2. **Server-Side Data Logic**:
   - Fetch Categories.
   - Fetch Blocks for the active category.
   - Implement filtering/sorting/pagination in the Server Component (since API support is currently limited).

3. **Client Components Migration**:
   - Keep `MarketNavbar`, `MarketHero`, `MarketFooter` as they are (mostly presentational).
   - Create/Update interactive components to drive URL changes:
     - `MarketTabs`: Client Component that updates `?tab=...`
     - `MarketSidebar`: Client Component that updates `?q=...`
     - `ItemTable`: Client Component that updates `?sort=...&dir=...`
     - `MarketPagination`: Client Component that updates `?page=...`

4. **Integration**:
   - Pass necessary data from the Server Component to these interactive components.
   - Use `Suspense` for better loading states if needed.

## Detailed Changes

### `app/market/page.tsx` (Server)
- Fetch: `categories` and `blocks`.
- Logic:
  - `const activeTab = searchParams.tab || categories[0].slug`
  - Filter `blocks` by `searchParams.q`.
  - Sort `blocks` by `searchParams.sort` & `searchParams.dir`.
  - Slice `blocks` for pagination.
- Render layout and pass processed data to sub-components.

### Interactions
Since many components need to update the search params, I'll use a shared hook or just `useRouter` from `next/navigation`.
