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

- [ ] **Data Table**
  - [ ] Columns: Title, Status, Price, Rating, Sales.
  - [ ] **Visual State Machine:**
    - `DRAFT`: Show "Edit" button.
    - `SUBMITTED`: Read-only / "Cancel Submission".
    - `APPROVED`: Show "Publish" button.
    - `REJECTED`: Show Rejection Reason + "Edit".
    - `PUBLISHED`: Show Analytics.

### Create Block Wizard `GET /creator/blocks/new`

- [ ] **Step 1: Metadata** (Title, Desc, Slug, Tags, Category).
- [ ] **Step 2: Pricing** (Price, Currency, License Type).
- [ ] **Step 3: Code Upload** (Handle `CodeBundle` upload).
- [ ] **Step 4: Preview Generation** (Trigger `RenderJob`).
- [ ] **Step 5: Submit** (Change status to `SUBMITTED`).

### Block Detail `GET /creator/blocks/[id]`

- [ ] **State-Dependent Layout**
  - [ ] **Draft:** Full edit form.
  - [ ] **Submitted:** Progress tracker for moderation.
  - [ ] **Rejected:** Feedback display.
  - [ ] **Published:** Performance charts (Views, Sales).

---

## 4. Marketplace Public View

### Explore `GET /explore`

- [ ] **Filters**
  - [ ] Framework (React, Vue, etc.).
  - [ ] Styling Engine (Tailwind, CSS).
  - [ ] Pricing (Free/Paid).
- [ ] **Block Card Component** (Thumbnail, Title, Price, Rating).
- [ ] **Important:** Never expose `codeBundle` here.

### Product Page `GET /block/[slug]`

- [ ] **Hero Section**
  - [ ] `PreviewAsset` gallery (Desktop/Mobile/Tablet viewports).
- [ ] **Info Column**
  - [ ] Price & Buy CTA (Stripe Checkout integration).
  - [ ] Tech Stack badges.
  - [ ] Registry & NPM Dependencies lists.
- [ ] **Content**
  - [ ] Description / Readme.
  - [ ] Changelog.
- [ ] **Reviews Section**
  - [ ] List `Review` items.

---

## 5. Admin Panel `GET /admin`

Internal tools for platform management.

- [ ] **Layout:** Sidebar navigation for Admin sections.
- [ ] **Moderation Queue** `/admin/blocks`
  - [ ] List `SUBMITTED` blocks.
  - [ ] Action: Approve / Reject (with notes).
  - [ ] View secure code preview.
- [ ] **Creator Management** `/admin/creators`
  - [ ] List creators.
  - [ ] View Stripe status.
  - [ ] Action: Approve Seller / Suspend.
- [ ] **Finance Dashboard** `/admin/finance`
  - [ ] Global Purchases list.
  - [ ] Dispute monitoring.
  - [ ] Webhook health status.

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
