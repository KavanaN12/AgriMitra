# AgriMitra Architecture & System Design Document (F0)

## 1. Project Vision
**AgriMitra (ಕೃಷಿಮಿತ್ರ)** is a production-quality, multilingual rural agricultural platform tailored for smallholder farmers, starting with an initial pilot in **Mandya district, Karnataka**.

The platform unifies three core agricultural modules on top of a shared data foundation:
1. **Smart Crop Advisory**: Timely, scientific pest, disease, weather, and irrigation alerts tailored to the farmer's registered crops and micro-climate.
2. **Farmer Community**: Taluk and village discussion forums connecting farmers with peers for shared experiences, drip schedules, and organic farming techniques.
3. **Farmer-to-Buyer Connect**: Commission-free produce listings allowing local farmers to sell harvests directly to verified wholesale traders and buyers.

### Core Data Foundation: `User + Location + Crops`
Every module in AgriMitra references three core entities:
* **User**: Identity, phone authentication, preferred language (`kn` or `en`), and role (`farmer`, `buyer`, `expert`).
* **Location**: Granular administrative hierarchy (State: Karnataka, District: Mandya, Taluks: Mandya, Maddur, Malavalli, Pandavapura, Srirangapatna, Krishnarajpet, Nagamangala, with village and pincode metadata).
* **Crops**: Cultivated regional staples with Kannada taxonomy: Sugarcane (*ಕಬ್ಬು*), Paddy (*ಭತ್ತ*), Finger Millet (*ರಾಗಿ*), Banana (*ಬಾಳೆ*), Tender Coconut (*ಎಳನೀರು*), and Tomato (*ಟೊಮೆಟೊ*).

---

## 2. System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                           CLIENT TIER (PWA)                             |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | React 18 + Vite + TypeScript + Tailwind CSS (Mobile-First Shell)  |  |
|  | react-i18next (Kannada / English) + Noto Sans Kannada Typography  |  |
|  | TanStack Query v5 + React Hook Form + Zod Validations             |  |
|  | vite-plugin-pwa (Offline service worker & Web Manifest)           |  |
|  +-------------------------------------------------------------------+  |
|                                     |                                   |
|                +--------------------+-------------------+               |
|                |                                        |               |
|         [MSW Enabled]                            [Live API Mode]        |
|                v                                        v               |
|    +------------------------+              +------------------------+   |
|    | Mock Service Worker    |              | Typed API Client       |   |
|    | (Realistic Mandya Data)|              | (/api/v1/* fetch)      |   |
|    +------------------------+              +------------------------+   |
+---------------------------------------------------------|---------------+
                                                          | HTTP / JSON
+---------------------------------------------------------v---------------+
|                           BACKEND TIER (FastAPI)                        |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | FastAPI Python Service (Port 8000)                                |  |
|  | Routers: /health, /auth, /locations, /crops, /weather,             |  |
|  |          /advisory, /community, /market, /notifications           |  |
|  | Pydantic v2 Schemas + OpenAPI 3.1.0 Contract Generation           |  |
|  | SQLAlchemy 2.0 ORM + Automatic Database Seeder                   |  |
|  | Production Mode: Mounts & serves bundled React PWA static assets  |  |
|  +-------------------------------------------------------------------+  |
+---------------------------------------------------------|---------------+
                                                          |
+---------------------------------------------------------v---------------+
|                           PERSISTENCE TIER                              |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | PostgreSQL 16 (Relational DB, Separate Persistent Volume)         |  |
|  | Fallback: SQLite zero-configuration for local test environments   |  |
|  | Alembic Migration Management                                      |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 3. Technology Stack Justification

| Layer | Technology | Key Architectural Reason |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, Vite, TypeScript | Modern reactive rendering, sub-second HMR, and strict type safety across components. |
| **Styling & Design** | Tailwind CSS, Lucide Icons | Mobile-first utility styling, earthy natural greens (`#2e7d32`), warm neutral backgrounds (`#faf8f5`), high contrast, touch targets >= 44px. |
| **Typography** | Noto Sans Kannada + Inter | Native Kannada script rendering without glyph clipping or baseline jitter. |
| **State Management** | TanStack Query v5 | Robust server-state caching, automatic background re-validation, offline query persistence. |
| **Forms & Validation** | React Hook Form + Zod | Low memory overhead on budget smartphones with schema-driven validation. |
| **Internationalization** | react-i18next | Seamless runtime switching between Kannada (`kn`) and English (`en`) with fallback. |
| **Mocking & Demo** | Mock Service Worker (MSW v2) | Network-level request interception enabling fully realistic offline demonstrations without mock code in UI components. |
| **PWA & Offline** | vite-plugin-pwa (Workbox) | Offline cache strategy for agro-advisories and marketplace listings when rural cellular signals drop. |
| **Backend API** | Python FastAPI, Uvicorn | High-performance asynchronous API, auto-generated OpenAPI documentation, native Pydantic validation. |
| **ORM & Database** | SQLAlchemy 2.0, PostgreSQL | Relational integrity, spatial/location hierarchy, robust transactions, persistent volume storage. |
| **Testing** | Pytest (Backend) + Playwright (E2E) | Unit/integration testing for backend routes and headless browser smoke tests on Desktop Chrome and Mobile Safari. |
| **Deployment** | Docker & Render | Multi-stage production container bundling frontend dist and backend server into a single container image. |

---

## 4. API Contract & Data Isolation
* **Contract-First Design**: FastAPI exports the single source of truth at `openapi.json`.
* **Frontend Typing**: `frontend/src/types/api.ts` mirrors the OpenAPI specifications.
* **Component Data Flow**: UI components **never** hardcode business data. All data access flows through `apiClient` (`frontend/src/api/client.ts`) and custom TanStack Query hooks (`frontend/src/hooks/useAgriQuery.ts`).
* **Transparency**: The UI features a `DataSourceBanner` that visibly informs whether the current session is running against simulated Mandya MSW mock records or the live FastAPI backend.

---

## 5. Mobile-First UX Guidelines
1. **Touch Targets**: All interactive elements, buttons, tabs, and form controls have a minimum touch target height of 44-48px for easy thumb tapping in field conditions.
2. **Visual Hierarchy**: Warm neutral backgrounds (`#faf8f5`) reduce eye strain under direct sunlight, avoiding outdated government portal visual clutter.
3. **Dual Language Toggle**: Accessible header language switcher allows instant switching between Kannada and English with persistent user preference.
4. **Offline Resilience**: When internet drops, the `OfflineBanner` informs the farmer that cached advisories and produce listings are being displayed.
