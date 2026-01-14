# 1. Overview & Tech Stack

Wishlist MVP with anonymous admin and guest access. Frontend uses Next.js, backend uses Supabase for managed PostgreSQL database.

## 2. **Frontend**

### **Next.js 15 (React)**

### Tech inside frontend

- **TailwindCSS** — Styling
- **next-themes** — Dark mode with system preference detection
- **ShadCN/UI** — Pre-built component library
- **Zod** — Schema validation
- **react-hook-form** — Form management and validation
- **Sonner** — Toast notifications
- **LocalStorage** — Store reservation token

## 3. **Backend - Supabase**

**Supabase** = Managed PostgreSQL database with REST API

**Access Pattern:**

- Server Components: Direct Supabase queries using `createClient()` (server-side)
- Server Actions: Mutations with built-in validation
- No manual API routes needed

**Note:** Supabase client used server-side only. Not exposed to browser.

## 4. **Database Schema**

**PostgreSQL (Supabase)**

Tables:

- `Wishlist` - stores `admin_token` and `guest_token` fields
- `Items`

  **`wishlist`**

Supports both single and multiple wishlists with no changes later.

| Field         | Type      | Description                        |
| ------------- | --------- | ---------------------------------- |
| `id`          | UUID      | PK                                 |
| `admin_token` | text      | Secret admin token for edit access |
| `guest_token` | text      | Secret guest token for view access |
| `title`       | text      | Wishlist title                     |
| `description` | text      | Optional                           |
| `created_at`  | timestamp | Auto                               |
| `updated_at`  | timestamp | Auto                               |

**This table already supports unlimited wishlists — nothing extra needed.**

---

**`items`**

| Field               | Type            | Description                                |
| ------------------- | --------------- | ------------------------------------------ |
| `id`                | UUID            | PK                                         |
| `wishlist_id`       | UUID            | FK → wishlist.id                           |
| `name`              | text            | Item name                                  |
| `link`              | text            | Optional                                   |
| `notes`             | text            | Optional                                   |
| `reserved_by_token` | text (nullable) | Guest reservation token (NULL = available) |
| `is_reserved`       | boolean         | Convenience boolean                        |
| `created_at`        | timestamp       | Auto                                       |

# 5. **Security / Access Control**

The app does not use login

## **Access is controlled by tokens:**

- `wishlistId` (public identifier)
- `adminToken` (grants full access)
- `guestToken` (grants guest access)
- `reservationToken` (localStorage only)

## **Rules**

- All tokens are UUID v4
- No PII is stored

## **Token Storage Strategy**

- Admin/guest tokens: URL parameter on first visit → saved to localStorage → URL remains (needed for Next.js routing)
- Reservation token: localStorage only, never in URL
- Rationale: Shareable links work, tokens remain in URL for Next.js dynamic routing

## **LocalStorage Edge Cases**

**Issue:** Guest clears browser data → loses reservations

**MVP Approach:**

- Show one-time warning on first reservation: "Your reservations are saved on this device only. Clearing browser data will lose your reservations."
- Accept data loss as known limitation
- Document in UI

**Post-MVP Enhancement:**

- Export reservation token feature
- Import token feature (restore on new device)
- Guest can save `.txt` file with their token

## **Access Control Implementation**

**Strategy: Server Actions with Validation (No RLS)**

**Rationale:**

- ✅ Simpler for MVP - all validation logic in one place
- ✅ Easier to debug - can log validation steps
- ✅ Explicit control - clear function boundaries
- ✅ Supabase used server-side only (service role key never exposed)

**Key Security Points:**

- All Supabase calls happen server-side only
- Service role key never exposed to browser
- Tokens validated before every mutation
- Race conditions prevented with database constraints
- Security headers configured in `next.config.ts`:
  - X-Frame-Options (clickjacking protection)
  - X-Content-Type-Options (MIME sniffing protection)
  - Strict-Transport-Security (HSTS)
  - Referrer-Policy (token leakage prevention)
  - X-XSS-Protection
  - Permissions-Policy

**Post-MVP Enhancement:**

- Can add RLS as additional security layer
- Provides defense-in-depth if needed

## Data **Fetching Pattern**

Server Components for Reads

Server Actions for Writes

**Why No React Query:**

- Next.js Server Components + Server Actions sufficient for MVP
- `useTransition` provides loading states
- `revalidatePath` refreshes data after mutations
- Simpler architecture, less code
- Can add React Query post-MVP if optimistic updates needed

# **6. Testing and Linting**

### **Unit tests - Vitest**

- **57 unit tests** covering all server actions and helper functions

### **Integration tests (API) - Not in MVP**

Integration tests are unnecessary for MVP because:

- Business logic is in Server Actions (unit testable)
- Database access is direct (no custom API layer)
- Add integration tests post-MVP if complexity increases

### **E2E tests - Playwright**

- **18 E2E tests** covering critical user flows
- Tests run across 3 browsers (Chromium, Firefox, WebKit)
- Uses Page Object Model (POM) pattern for maintainability
- Tests cover: wishlist creation, item management, reservations, error handling

### **Linting - ESLint and Prettier**

**ESLint**

- Enforces code style + correctness
- Works out of the box with Next.js

**Prettier**

- Code formatting
- Removes arguments about style

**Recommended ESLint plugins**

- `eslint-config-next`
- `@typescript-eslint/eslint-plugin`
- `eslint-plugin-import`
- `eslint-plugin-unused-imports`

## **7. DevOps / CI-CD & Deployment**

### **GitHub Actions**

Workflow:

**Install dependencies → Lint → Build → Run tests → Deploy to Vercel on success**

**How CI blocks Vercel deployment:**

**GitHub Branch Protection**

- Enable branch protection on `main`
- Require status checks: ✓ CI must pass
- Vercel only deploys after PR merged to `main`
- Merge blocked if CI fails

### **Frontend** → **Vercel**

### **Backend + Database**→ **Supabase (managed, nothing to deploy)**

# 8. **Frontend Components / Pages**

## Required Pages

1. Admin View
2. Guest View
3. Reservation success modal
4. Item delete confirmation page

## Components

### Core Components
- `AppHeader` - Header with theme toggle
- `ThemeToggle` - Dark/light mode switcher
- `ThemeProvider` - Theme context provider
- `TokenHandler` - Client component for token persistence

### Page Components
- `AdminPageClient` - Client wrapper for admin page
- `AdminPageHeader` - Admin page header with edit/copy functionality
- `AdminItemsList` - List of items with admin controls
- `GuestPageClient` - Client wrapper for guest page
- `GuestItemsList` - List of items with reservation controls

### Item Components
- `ItemCard` - Display item with name, link, notes, and reservation status
- `EmptyState` - Empty state when no items exist

### Dialog Components
- `AddItemDialog` - Dialog for adding new items
- `EditItemDialog` - Dialog for editing items
- `DeleteItemDialog` - Confirmation dialog for deleting items
- `EditWishlistDialog` - Dialog for editing wishlist title/description
- `ReserveItemModal` - Modal for reserving items (guest)
- `CancelReservationDialog` - Dialog for canceling reservations (guest)
- `UnreserveItemDialog` - Dialog for unreserving items (admin)

### Utility Components
- `ShareLinkSection` - Section with guest link and copy button

Everything is reusable for multi-wishlist support later.
