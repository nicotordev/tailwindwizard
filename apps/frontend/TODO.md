# Frontend Architecture & Roadmap

Based on the "Operational Marketplace" philosophy. The UI must function as a visual state machine reflecting the Prisma schema roles (`USER`, `CREATOR`, `ADMIN`) and entity states.

## 0. Core Primitives (Base Components)

Create these first to avoid logic duplication.

- [x] **Status Badges**
  - [x] `<BlockStatusBadge />` (Draft, Submitted, Approved, Rejected, Published, Archived)
  - [x] `<StripeStatusBadge />` (Not Connected, Pending, Enabled, Restricted)
  - [x] `<LicenseBadge />` (Active, Revoked)
  - [x] `<DeliveryStatusBadge />` (Ready, Not Ready)
- [x] **Utilities**
  - [x] `<Money />` (Format currency amounts consistently)
  - [x] `<DateDisplay />` (Format ISO dates)
- [x] **Layout/Logic**
  - [x] `<EmptyState />` (Reusable placeholder for empty lists)
  - [x] `<RoleGate role="ADMIN | CREATOR" />` (Wrapper for permission handling)
  - [x] `<VisibilityToggle />` (Private/Public/Unlisted)

---

## 1. Dashboard (The Core Hub) `GET /dashboard`

Contextual home page based on user role.

- [x] **Routing Logic**
  - [x] Create wrapper to check `user.role` and `user.creator`.
  - [x] Redirect `ADMIN` -> `/admin`.
  - [x] Render `CreatorDashboard` if `user.creator` exists.
  - [x] Render `BuyerDashboard` for standard users.

### Buyer Dashboard View

- [x] **My Blocks Section**
  - [x] Fetch User Licenses.
  - [x] Display list/grid of purchased blocks.
  - [x] Show Delivery Status (`READY` | `NOT_READY`).
  - [x] **Action:** "Download" / "Copy CLI Install Command".
- [x] **Purchase History**
  - [x] List `Purchase` records with status (`PENDING`, `PAID`, `REFUNDED`).
  - [x] Link to invoice/receipt.
- [x] **Pending Reviews**
  - [x] List purchased blocks that haven't been reviewed yet.

### Creator Dashboard View

- [x] **Status Cards (Top)**
  - [x] Stripe Connect Status (`isApprovedSeller`, `stripeAccountStatus`).
  - [x] Pending Earnings / Balance.
- [x] **My Blocks Widget**
  - [x] Table summary: Status, Visibility, Sales Count, Rating.
  - [x] **CTA:** Create New Block.
- [x] **Render Status**
  - [x] Show recent `RenderJob` statuses (Success/Fail).
- [x] **Income Overview**
  - [x] Total Sales, Recent Payouts.

---

## 2. Purchases & Library

"Netflix" style view for purchased content.

- [x] **Library Page** `GET /purchases/library`
  - [x] Grid view of all active Licenses.
  - [x] Filtering/Search.
  - [x] Access to Downloads/CLI tokens.
- [x] **Order Detail** `GET /purchases/orders/[id]`
  - [x] Line items display.
  - [x] Payment status.
  - [x] Refund/Dispute status visibility.

---

## 3. Creator Workflow (CMS)

### Block Management `GET /creator/blocks`

- [x] **Data Table**
  - [x] Columns: Title, Status, Price, Rating, Sales.
  - [x] **Visual State Machine:**
    - `DRAFT`: Show "Edit" button.
    - `SUBMITTED`: Read-only / "Cancel Submission".
    - `APPROVED`: Show "Publish" button.
    - `REJECTED`: Show Rejection Reason + "Edit".
    - `PUBLISHED`: Show Analytics.

### Create Block Wizard `GET /creator/blocks/new`

- [x] **Step 1: Metadata** (Title, Desc, Slug, Tags, Category).
- [x] **Step 2: Pricing** (Price, Currency, License Type).
- [x] **Step 3: Code Upload** (Bundle upload wired).
- [x] **Step 4: Preview Generation** (Render job queued).
- [x] **Step 5: Submit** (Status change wired).

### Block Detail `GET /creator/blocks/[id]`

- [x] **State-Dependent Layout**
  - [x] **Draft:** Full edit form.
  - [x] **Submitted:** Progress tracker for moderation.
  - [x] **Rejected:** Feedback display.
  - [x] **Published:** Performance charts (Views, Sales).

---

## 4. Marketplace Public View

### Explore `GET /explore`

- [x] **Filters**
  - [x] Framework (React, Vue, etc.).
  - [x] Styling Engine (Tailwind, CSS).
  - [x] Pricing (Free/Paid).
- [x] **Block Card Component** (Thumbnail, Title, Price, Rating).
- [x] **Important:** Never expose `codeBundle` here.

### Product Page `GET /block/[slug]`

- [x] **Hero Section**
  - [x] `PreviewAsset` gallery (Desktop/Mobile/Tablet viewports).
- [x] **Info Column**
  - [x] Price & Buy CTA (CTA stubbed; Stripe integration pending).
  - [x] Tech Stack badges.
  - [x] Registry & NPM Dependencies lists (placeholders).
- [x] **Content**
  - [x] Description / Readme.
  - [x] Changelog.
- [x] **Reviews Section**
  - [x] List `Review` items.

---

## 5. Admin Panel `GET /admin`

Internal tools for platform management.

- [x] **Layout:** Sidebar navigation for Admin sections.
- [x] **Moderation Queue** `/admin/blocks`
  - [x] List `SUBMITTED` blocks.
  - [x] Action: Approve / Reject (with notes).
  - [x] View secure code preview (button stub).
- [x] **Creator Management** `/admin/creators`
  - [x] List creators.
  - [x] View Stripe status.
  - [x] Action: Approve Seller / Suspend.
- [x] **Finance Dashboard** `/admin/finance`
  - [x] Global Purchases list.
  - [x] Dispute monitoring.
  - [x] Webhook health status.

---

## 6. Integration Roadmap (BFF/API)

Ensure these endpoints are ready in `apps/frontend/lib/frontend-api.ts`:

- [x] `users.getMe` (Include role/creator status).
- [x] `licenses.list` (For library).
- [x] `purchases.list` (For history).
- [x] `blocks.listMyBlocks` (For creator).
- [x] `blocks.create` / `blocks.update`.
- [x] `render.status` (For checking preview generation).
- [x] `admin.moderationList` / `admin.decide`.

## 7. New Features (Onboarding V2 & Collections)

- [x] **Collections** (User-curated lists of blocks)
  - [x] Backend: `Collection` model, Service, Controller, Routes.
  - [x] Frontend: Dashboard UI (`/dashboard/collections`).
  - [x] Frontend: "Add to Collection" dialog in Marketplace/Library.
- [x] **Resume Parsing** (Onboarding Enhancement)
  - [x] Backend: PDF extraction service (`/api/v1/resume/parse`).
  - [x] Frontend: "Auto-fill from Resume" in Creator Onboarding.
- [x] **Onboarding V2**
  - [x] Dynamic Category fetching in Interests step.
