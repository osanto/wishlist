## Wishlist Web Application — v1 (MVP)

# 1. **Product Summary**

A simple wishlist web application where an anonymous owner owner starts with one generated wishlist and share a guest link. All guests use the same guest link. Guest identity is tracked locally in the browser via a local reservation token, not via the URL.

Guests can reserve items anonymously.

### How It Works

1. User visits homepage and clicks "Create Wishlist"
2. System generates wishlist with unique admin and guest links
3. Owner adds items and shares guest link
4. Guests reserve items anonymously using the shared link

MVP supports

- One wishlist per owner (in practice, because owner stores only one link)
- But backend fully supports unlimited wishlists

No authentication.

Access is controlled only via unique shareable links (admin link + guest link).

The owner can manage wishlists and items.

Guests can reserve **one or multiple items** anonymously.

# 2. **Users & Roles**

### **1. Wishlist Owner (Admin)**

Access via **admin link** (contains admin token).

Can:

Wishlist:

- Edit wishlist title + description
- Future-ready: create and delete additional wishlists (schema supports it)

Items:

- Add items
- Edit items
- Delete items
- See which items are reserved (but not who reserved)

### **2. Guest User**

Access via **guest link** (contains guest token).

No login required, anonymous.

Can:

- View wishlist
- Reserve **multiple** items
- Cancel their own reservations
- Can see:
  - “Reserved” - Reserved items (not who reserved them)
  - “You reserved this” on items they reserved

Guest identity is stored locally using a **local reservation token** (localStorage).

# 3. **User Flows**

## 3.0 Wishlist Creation Flow

1. User visits homepage at root URL `/`
2. Sees "Create Your Wishlist" button
3. Clicks button
4. System generates:
   - New wishlist with default title "My Wishlist"
   - Unique admin token
   - Unique guest token
5. User redirected to admin page `/admin/[adminToken]`
6. Admin sees:
   - Wishlist title (editable)
   - "Share with guests" section with guest link
   - Copy link button
   - "Add Item" button
   - Empty state: "Add your first item."

## **3.1 Admin Flow**

1. Visit admin link
2. See wishlist title + description + items
3. Admin can:
   - Add new wishlist items
   - Edit name, link, notes
   - Delete item
4. Admin sees reservation state:
   - Reserved / Not reserved
5. Admin cannot see the reserver’s name or identity.

## **3.2 Guest Flow**

1. Guest opens guest link with `guestToken`.
2. Sees wishlist items with:
   - Name
   - Link
   - Notes
   - Reservation status
3. Guest can:
   - Guest can reserve **multiple** items.
   - If they reserved an item:
     - They see: **“You reserved this item”**
     - It is **unavailable** to other guests
   - If someone else reserved it:
     - They see: **“Reserved”**
4. Guest can **cancel** only their reservations.
5. Guest identity remains anonymous throughout their session.

# 4. UI Requirements

### **Required Views**

- Admin Wishlist View (full edit mode)
- Guest Wishlist View (view and reserve only)
- Item reservation confirmation
- Item deletion confirmation (admin only)

# 5. Feature Requirements

### **Wishlist Information**

- **Title** - Required, default: "My Wishlist"
- **Description** - Optional

### **Item Information**

- **Name** - Required
- **Link (URL)** - Optional, opens in new tab when clicked
- **Notes** - Optional, additional details
- **Reservation Status** - System-managed (Reserved/Available)

**Note:** Images are out of scope for MVP

### **URL Structure**

- **Homepage:** `/` - Landing page with "Create Wishlist" button
- **Admin View:** `/admin/[adminToken]` - Full management access
- **Guest View:** `/guest/[guestToken]` - View and reserve only

**Token Storage:**

- Admin/guest tokens: URL parameter on first visit → saved to localStorage → URL cleaned
- Reservation token: localStorage only (never in URL)

**Sharing:**

- Admin copies guest link: `yourdomain.com/guest/[guestToken]`
- Admin shares single link with all guests

## **Theme**

- **Dark Mode Toggle** - Switch between light and dark themes
- **Theme Persistence** - User's theme preference saved across sessions
- **Default Theme** - System preference (follows user's OS setting)

### Behavior:

- Toggle button visible on all pages (header/corner)
- Switches entire app between light and dark mode
- Theme choice stored locally (persists on return visits)
- Respects system dark mode preference on first visit

## **Reservations**

Guests can reserve **multiple** items. Reservations are tracked anonymously by the system.

### Rules:

- Only the guest who reserved an item can cancel it.
- Guests cannot see other guests' reservation tokens.
- Admin sees reserved state but **not** reserver identity.
- If the visiting guest’s `reservationToken` matches an item’s `reservedByToken`, the UI shows: **“You reserved this item”**; otherwise, items reserved by others show: **“Reserved”**.

# 6. **Non-Functional Requirements**

### **Performance**

- Wishlist loads quickly (< 1 second)
- Reservation actions respond immediately (< 2 seconds)

### **User Experience**

**Loading States:**

- Creating wishlist: Show loading indicator
- Reserving item: Button shows loading state
- Saving changes: Immediate feedback

**Success Feedback:**

- Item reserved: Confirmation message
- Link copied: Confirmation message
- Changes saved: Visual confirmation

**Error Handling:**

- Invalid wishlist link: Show "Wishlist not found" message
- Item already reserved: Clear error message to user
- Network errors: Retry option provided

**Theme Support:**

- Smooth transition between light and dark modes (no flash)
- All text remains readable in both themes
- Proper contrast ratios maintained (WCAG AA compliant)

### **Privacy**

- No personal data collected
- Anonymous reservations
- Admin cannot see the identity

# 7. **Out of Scope (Not in MVP)**

The following features are intentionally excluded:

- ❌ Auto-fetch images from product URLs
- ❌ Multiple wishlists per user (schema supports it, but UI doesn't expose it yet)
- ❌ Item quantities (e.g., "need 3 of these")
- ❌ User accounts or authentication
- ❌ Email notifications
- ❌ Guest names or messages
- ❌ Search or filter items
- ❌ Wishlist expiration dates
- ❌ Password protection for wishlists

**Rationale:** Focus MVP on core value proposition. Features can be added based on user feedback.
