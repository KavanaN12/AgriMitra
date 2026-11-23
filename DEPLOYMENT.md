# AgriMitra – Production Deployment Guide

This guide provides comprehensive, step-by-step instructions for packaging, configuring, and deploying the **AgriMitra** multilingual rural agricultural platform. It covers local Docker Compose orchestration, container registry distribution (Docker Hub / GHCR), and managed cloud deployment on **Render** with PostgreSQL and persistent disk storage.

---

## 1. System Architecture & Topology

AgriMitra uses a modern, unified multi-tier architecture packaged into high-performance containers:

```
                          ┌─────────────────────────────┐
                          │   Internet / Rural Users    │
                          │   (Web & PWA on Android)    │
                          └──────────────┬──────────────┘
                                         │ HTTPS (:443)
                                         ▼
                          ┌─────────────────────────────┐
                          │    Reverse Proxy / CDN      │
                          │   (Render / Cloudflare)     │
                          └──────────────┬──────────────┘
                                         │ HTTP (:8000)
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AgriMitra Container                             │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │   FastAPI Web Engine      │◄────►│   Pre-compiled Vite PWA     │   │
│   │   (Python 3.10 / Uvicorn) │      │   Static SPA (/app/static)  │   │
│   └─────────────┬─────────────┘      └─────────────────────────────┘   │
│                 │                                                      │
└─────────────────┼──────────────────────────────────┬───────────────────┘
                  │                                  │
                  ▼                                  ▼
   ┌──────────────────────────────┐   ┌──────────────────────────────┐
   │    PostgreSQL Database       │   │    Persistent Disk Volume    │
   │    (Managed 16-Alpine)       │   │    (/app/uploads)            │
   │    Relational Data & GIS     │   │    Produce & Disease Photos  │
   └──────────────────────────────┘   └──────────────────────────────┘
```

### Key Components
1. **Frontend PWA Client**: Built with React 19, TypeScript, Tailwind CSS, Vite PWA, and bilingual Kannada/English localization. Bundled into static assets served directly by the backend with zero node runtime overhead in production.
2. **Backend API**: FastAPI high-concurrency asynchronous web server running Python 3.10, Alembic database migrations, and SQLAlchemy ORM.
3. **Database**: PostgreSQL 16 storing user profiles, location hierarchy (Mandya district taluks & villages), crops, advisories, forum posts, marketplace listings, and audit logs.
4. **Persistent File Storage**: Non-ephemeral disk mount at `/app/uploads` preserving uploaded produce photos and crop advisory images across container redeployments.

---

## 2. Prerequisites

Before deploying, ensure you have the following installed on your machine or CI/CD environment:
- **Docker Engine**: Version 24.0+ (`docker --version`)
- **Docker Compose**: Version 2.20+ (`docker compose version`)
- **Python**: Version 3.10+ (for local CLI administration or migration verification)
- **Node.js**: Version 20.0+ / npm 10.0+ (for local frontend builds)
- **Git**: For version control and deployment triggers

---

## 3. Environment Configuration

AgriMitra uses environment variables for all deployment settings. Copy `.env.example` to create your production environment file:

```bash
cp .env.example .env.production
```

### Required Environment Variables

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `production` | Sets runtime mode (`development`, `test`, or `production`). Disables debug endpoints. |
| `PORT` | `8000` | Port on which FastAPI listens inside the container. |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string with `postgresql://` protocol. |
| `SECRET_KEY` | *(64-hex string)* | Cryptographic key for JWT tokens and session signing. Generate with `openssl rand -hex 32`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | JWT expiration duration in minutes (default is 7 days for rural mobile convenience). |
| `FRONTEND_DIST_DIR` | `/app/static` | Container path where Vite-compiled frontend assets are mounted. |
| `UPLOAD_DIR` | `/app/uploads` | Persistent directory for uploaded produce listings and crop health images. |
| `ADMIN_INITIAL_PHONE` | `9845000000` | Designated phone number for the Mandya Agricultural Extension Administrator. |
| `ADMIN_INITIAL_PASSWORD` | *(Strong Password)* | Initial bootstrap password for platform administrator. |

---

## 4. Local Deployment with Docker Compose

For local testing, staging, or self-hosted on-premise deployments (e.g., at Raitha Samparka Kendras):

### Step 1: Start Services
Run the following command from the repository root:

```bash
docker compose up -d --build
```

This starts:
- `agrimitra-postgres`: PostgreSQL 16 on port `5432` with a persistent named volume `postgres_data`.
- `agrimitra-app`: Multi-stage build running Alembic migrations automatically on startup, followed by Uvicorn on port `8000`.

### Step 2: Verify Health
Check container status and health checks:

```bash
docker compose ps
```

Expected status:
```
NAME                 IMAGE               COMMAND                  SERVICE   STATUS
agrimitra-postgres   postgres:16-alpine  "docker-entrypoint.s…"   db        Up (healthy)
agrimitra-app        agrimitra-app       "sh -c 'python -m al…"   app       Up (healthy)
```

Test the API health endpoint directly:
```bash
curl http://localhost:8000/api/v1/health
```

Expected JSON response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-11-22T17:15:00.000000"
}
```

### Step 3: Access the Application
- **Web Application & PWA**: Open [http://localhost:8000](http://localhost:8000) in your browser.
- **Interactive OpenAPI Documentation**: Open [http://localhost:8000/docs](http://localhost:8000/docs).
- **Admin Panel**: Sign in with phone `9845000000` and OTP `123456` or your configured admin password.

### Step 4: Container Lifecycle & Persistence Testing
Verify database and file upload persistence across container restarts:

```bash
# Restart application container
docker compose restart app

# Stop containers without destroying data
docker compose down

# Bring containers back up — all crops, users, posts, and listings persist
docker compose up -d
```

---

## 5. Container Registry Packaging (Docker Hub / GHCR)

To distribute the production image to a container registry for cloud deployment:

### Step 1: Build the Multi-Stage Image
```bash
# Replace <registry-user> with your Docker Hub username or ghcr.io/<org>
docker build -t <registry-user>/agrimitra:latest -f Dockerfile .
```

### Step 2: Tag with Semantic Version
```bash
docker tag <registry-user>/agrimitra:latest <registry-user>/agrimitra:v1.0.0
```

### Step 3: Authenticate and Push
```bash
# Login to registry
docker login

# Push image tags
docker push <registry-user>/agrimitra:latest
docker push <registry-user>/agrimitra:v1.0.0
```

---

## 6. Cloud Deployment to Render

AgriMitra is fully configured for zero-configuration Infrastructure-as-Code deployment on [Render](https://render.com) using `render.yaml`.

### Option A: Automated Blueprint Deployment (Recommended)

1. Fork or push the `AgriMitra` repository to GitHub or GitLab.
2. Log in to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your AgriMitra repository.
5. Render detects `render.yaml` and provisions two services:
   - **`agrimitra-postgres`**: Managed PostgreSQL 16 database located in Singapore (`ap-southeast-1`), the lowest latency region for Karnataka.
   - **`agrimitra-app`**: Web Service running the multi-stage Docker container with an attached 10 GB persistent disk `uploads-data`.
6. Click **Apply**. Render will automatically provision the database, build the container, run Alembic migrations, seed the Mandya location hierarchy and crops, and start the service.

### Option B: Manual Setup on Render

If creating services manually via the Render UI:

#### 1. Create PostgreSQL Database
- **Name**: `agrimitra-postgres`
- **Database**: `agrimitra_db`
- **User**: `postgres`
- **Region**: Singapore (`ap-southeast-1`)
- **Plan**: Starter (or Free for trial)
- Copy the **Internal Database URL** for the web service.

#### 2. Create Web Service
- **Name**: `agrimitra-app`
- **Region**: Singapore (`ap-southeast-1`)
- **Environment**: Docker
- **Dockerfile Path**: `docker/Dockerfile.app`
- **Docker Context**: `.`
- **Plan**: Starter

#### 3. Attach Persistent Disk
Under **Disks**:
- **Name**: `uploads-data`
- **Mount Path**: `/app/uploads`
- **Size**: 10 GB

#### 4. Configure Environment Variables
Set the following keys in the Render dashboard:
- `ENVIRONMENT`: `production`
- `PORT`: `8000`
- `DATABASE_URL`: Paste the Internal Database URL from Step 1.
- `SECRET_KEY`: Click **Generate** or provide a 64-character hex key.
- `FRONTEND_DIST_DIR`: `/app/static`
- `UPLOAD_DIR`: `/app/uploads`

#### 5. Configure Health Check Path
Set the health check path to:
```
/api/v1/health
```

---

## 7. Database Migrations & Seeding

AgriMitra handles database schema evolution through **Alembic** migrations.

### Automatic Migration on Startup
The production Dockerfile executes Alembic migrations automatically before starting Uvicorn:
```bash
python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Migration History
The database schema evolved through 5 verified revisions:
1. `000_f0_f1_initial.py`: Initial schema (`locations`, `users`, `crops`, `user_crops`, `weather_records`, `advisories`, `notifications`, `community_groups`, `community_posts`, `market_listings`, `market_enquiries`).
2. `001_f2_crop_advisory.py`: F2 smart advisory fields and crop stages.
3. `002_f3_community.py`: F3 discussion comments, likes, saves, group memberships, and announcements.
4. `003_f4_marketplace.py`: F4 produce listings, saved listings, group listing contributions, and enquiry messaging threads.
5. `004_f5_shared_admin.py`: F5 notification preferences, user profile settings, support tickets, and moderation audit logs.

### Running Migrations Manually
To run migrations manually in a running container or local shell:
```bash
# Inside container:
docker exec -it agrimitra-app python -m alembic upgrade head

# Check current revision:
docker exec -it agrimitra-app python -m alembic current
```

### Idempotent Database Seeding
When the database is first initialized, `backend/app/db/seed.py` populates:
- 7 Mandya Taluks and demonstration villages (Mandya, Maddur, Malavalli, Pandavapura, Srirangapatna, KR Pet, Nagamangala).
- 5 Major Mandya Crops (Sugarcane, Paddy/Rice, Finger Millet/Ragi, Tender Coconut, Tomato) with comprehensive bilingual growth stages, water requirements, and pest management guidance.
- 4 Demonstration Identities (Ramesh Gowda, Lakshmi Devi, Mysore Agro Traders Basavaraj, and Mandya Krishi Admin).
- Initial weather records, agronomic advisories, and sample community groups.

The seed script checks `if db.query(Location).first() is not None: return` to ensure zero record duplication on container restarts.

---

## 8. Security & Operational Best Practices

1. **Secret Key Isolation**: Never commit `.env` files with real secrets. Use Render environment variable vaults or Docker secrets in production.
2. **CORS Restrictions**: Production CORS allows the Render domain `https://agrimitra.onrender.com` and custom domains. Update `BACKEND_CORS_ORIGINS` in `backend/app/core/config.py` when attaching a custom domain.
3. **Non-Root Execution**: Container uses an isolated python runner stage with minimal attack surface (`python:3.10-slim`).
4. **Persistent Disk Backups**: For cloud deployments, enable automated daily snapshots on the Render managed PostgreSQL database and the `uploads-data` persistent disk.
5. **Observability**: Render provides live HTTP request logs and metric graphs (CPU, RAM, Bandwidth) with automatic alert thresholds.
