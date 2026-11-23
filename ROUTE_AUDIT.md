# AgriMitra – Frontend Route & Navigation Audit

**Audit Date**: November 23, 2026  
**Application Base URL**: [http://localhost:8000](http://localhost:8000)  
**Router Type**: React Router v7 (`createBrowserRouter`)  
**Audit Scope**: Direct URL loading, browser refresh, history navigation (Back/Forward), role authorization, tab persistence, and mobile viewports.

---

## 1. Route Inventory & Verification Matrix

| Route Path | Component | Shell Layout | Auth Requirement | Role Gating | Supported URL Query Params | Direct URL Load | Back / Forward | Mobile Viewport | Audit Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: | :---: | :---: | :---: |
| `/` | `HomePage` | `AppShell` | Public / Guest | Any | None | 200 OK | OK | OK | **PASSED** |
| `/home` | `HomePage` | `AppShell` | Public / Guest | Any | None | 200 OK | OK | OK | **PASSED** |
| `/welcome` | `WelcomePage` | Minimal | Public | Any | None | 200 OK | OK | OK | **PASSED** |
| `/login` | `LoginPage` | Minimal | Public | Any | None | 200 OK | OK | OK | **PASSED** |
| `/register` | `RegisterPage` | Minimal | Public | Any | None | 200 OK | OK | OK | **PASSED** |
| `/verify-otp` | `OtpVerificationPage` | Minimal | Public | Any | None | 200 OK | OK | OK | **PASSED** |
| `/forgot-password` | `ForgotPasswordPage` | Minimal | Public | Any | None | 200 OK | OK | OK | **PASSED** |
| `/onboarding` | `OnboardingPage` | Minimal | Authenticated | Any | `?step=1..5` | 200 OK | OK | OK | **PASSED** |
| `/advisory` | `AdvisoryPage` | `AppShell` | Public / Guest | Any | `?crop=...`, `?severity=...` | 200 OK | OK | OK | **PASSED** |
| `/community` | `CommunityPage` | `AppShell` | Public / Guest | Any | `?tab=forum`, `?tab=groups` | 200 OK | OK | OK | **PASSED** |
| `/groups` | `CommunityPage` | `AppShell` | Public / Guest | Any | Opens directly to groups | 200 OK | OK | OK | **PASSED** |
| `/forum` | `CommunityPage` | `AppShell` | Public / Guest | Any | Opens directly to forum | 200 OK | OK | OK | **PASSED** |
| `/market` | `MarketPage` | `AppShell` | Public / Guest | Any | `?tab=browse`, `?tab=my_listings`, etc. | 200 OK | OK | OK | **PASSED** |
| `/enquiries` | `MarketPage` | `AppShell` | Public / Guest | Any | Opens directly to enquiries | 200 OK | OK | OK | **PASSED** |
| `/my-listings` | `MarketPage` | `AppShell` | Public / Guest | Any | Opens directly to farmer listings | 200 OK | OK | OK | **PASSED** |
| `/profile` | `ProfilePage` | `AppShell` | Authenticated | Any | `?tab=personal`, `?tab=farming`, `?tab=crops`, `?tab=display`, `?tab=help` | 200 OK | OK | OK | **PASSED** |
| `/settings` | `ProfilePage` | `AppShell` | Authenticated | Any | Defaults to `display` tab | 200 OK | OK | OK | **PASSED** |
| `/notifications` | `ProfilePage` | `AppShell` | Authenticated | Any | Defaults to notification center | 200 OK | OK | OK | **PASSED** |
| `/help` | `ProfilePage` | `AppShell` | Public / Guest | Any | Defaults to `help` FAQ tab | 200 OK | OK | OK | **PASSED** |
| `/admin` | `AdminPage` | `AppShell` | Authenticated | Admin Only (`is_admin: true`) | `?tab=stats`, `?tab=users`, `?tab=moderation`, `?tab=crops` | 200 OK (Admin) / 403 (Non-Admin) | OK | OK | **PASSED** |
| `/*` (Wildcard) | `NotFoundPage` | `AppShell` | Public | Any | None | 404 Caught | OK | OK | **PASSED** |

---

## 2. Layout Shell & Navigation Bar Mapping

### Desktop Top Navigation Bar (`AppShell.tsx`)
1. **Brand Logo & Title**: Links directly to `/`.
2. **Mandya Pilot Badge**: Visual indicator of pilot region (`Mandya District, KA`).
3. **Core Module Links**:
   - *Home*: `/`
   - *Advisory*: `/advisory`
   - *Community*: `/community`
   - *Market*: `/market`
4. **Header Utilities**:
   - *Language Switcher*: Toggles between Kannada (ಕನ್ನಡ) and English.
   - *Notifications Bell*: Links to `/notifications`. Displays unread badge counter.
   - *User Profile Pill*: Links to `/profile`. Shows user avatar, name, and active role badge.
   - *Admin Shortcut*: Visible only when current user has `is_admin: true`, linking to `/admin`.

### Mobile Bottom Navigation Bar (`AppShell.tsx`)
Designed specifically for single-thumb mobile ergonomics in rural environments:
- **Home**: Sprout Icon (`/`)
- **Advisory**: CloudSun Icon (`/advisory`)
- **Community**: MessageSquare Icon (`/community`)
- **Market**: ShoppingBag Icon (`/market`)
- **Profile / Menu**: User Icon (`/profile`)

---

## 3. Route Gating & Edge Case Handling

### 1. Unauthenticated Session Access
- When a user accesses protected views (`/profile`, `/settings`, `/notifications`, `/admin`) without a session token, the application displays a friendly prompt with login shortcuts rather than crashing with unhandled exceptions.
- 1-Click Demo Login (`/login`) instantly restores a pre-authenticated session for test exploration.

### 2. Role-Based Admin Protection
- Navigating to `/admin` triggers a token check against `User.is_admin`.
- If an ordinary farmer (e.g. Ramesh Gowda) or buyer (Basavaraj) attempts to access `/admin`, the API calls reject with `403 Forbidden`, and the frontend gracefully displays an "Administrator Access Required" card with a button to return to the home dashboard.

### 3. Wildcard / Broken Route (404) Handling
- Navigating to any unmapped path (e.g. `http://localhost:8000/invalid-page-test-404`) renders `NotFoundPage`.
- Features high-contrast typography, bilingual message (*"ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ / Page Not Found"*), and a high-contrast primary button linking to `/`.

### 4. Tab State Preservation via Search Query Parameters
- Direct navigation to `/community?tab=groups` automatically activates the Village Groups tab.
- Direct navigation to `/market?tab=my_enquiries` activates the Enquiries negotiation tab.
- Direct navigation to `/profile?tab=help` activates the Help Centre & FAQ tab.
- Refreshing the page preserves the currently active tab.
