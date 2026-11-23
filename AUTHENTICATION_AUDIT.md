# AgriMitra Authentication & Identity Audit Report

**Application**: AgriMitra (Agricultural Advisory, Community & Marketplace Platform)  
**Audit Scope**: Multi-User Authentication, Password Security, JWT Token Lifecycle, Authorization Enforcement, and Communication Gateways  
**Audit Date**: November 2026  
**Environment**: Production Docker Container (`agrimitra-app`, `agrimitra-postgres`)  

---

## 1. Executive Summary

AgriMitra has transitioned from an evaluation demonstration model to a **genuine multi-user production authentication architecture**. All demonstration bypasses, hardcoded demo OTPs, fallback identities (previously defaulting to User 1 / Ramesh Gowda), and insecure token parsing have been eliminated.

Every user registering on the platform creates a persistent, uniquely identified record in PostgreSQL with salted **bcrypt** password hashes, unique email and mobile constraints, and signed **HS256 JSON Web Tokens (JWT)** for stateless session management.

---

## 2. Key Vulnerability Removals & Hardening

| Component | Previous State (Demo / Prototype) | Hardened Production State | Security Benefit |
|---|---|---|---|
| **Password Storage** | Plaintext comparisons or simulated validation | Standard `bcrypt` with per-user cryptographic salts (cost factor 12) | Prevents offline dictionary and rainbow table attacks. |
| **Authentication Tokens** | Unsigned pseudo-tokens `agrimitra_token_<id>_<timestamp>` | Standard signed JWT tokens signed with `JWT_SECRET` using `HS256` | Tamper-proof token claims; prevents identity spoofing. |
| **User Identity Fallback** | Failed auth returned `db.query(User).first()` | Strict `401 Unauthorized` or `403 Forbidden` exceptions | Completely eliminates unintentional privilege or data leakage. |
| **Registration Validation** | Only validated mobile phone formatting | Enforced database-level unique indexes on `email` and `phone_number` | Guarantees genuine, non-overlapping user identities. |
| **Administrative Access** | Insecure check `elif "admin" in authorization.lower()` | Strict verification of `user.is_admin == True` via `get_current_admin` | Blocks unauthorized privilege escalation by non-admin users. |
| **SMS / OTP Claims** | Simulation claimed real SMS delivery | Clearly designated token reset flow with real SMTP verification; no false claims of external delivery | Honest, production-grade integration. |

---

## 3. Password Hashing Architecture

- **Algorithm**: `bcrypt` (Blowfish-based cipher) with automated salting.
- **Implementation**: Implemented directly via `bcrypt.hashpw()` and `bcrypt.checkpw()` in [security.py](file:///d:/AgriMitra/backend/app/core/security.py) (avoiding passlib compatibility issues with modern bcrypt engines).
- **Salt Generation**: Cryptographically secure random salt generated dynamically for every user registration and password update.
- **Verification Workflow**:
  ```python
  def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
      if not plain_password or not hashed_password:
          return False
      try:
          pw_bytes = plain_password.encode('utf-8')[:72]
          return bcrypt.checkpw(pw_bytes, hashed_password.encode('utf-8'))
      except Exception:
          return False
  ```

---

## 4. JWT Token Specification & Lifecycle

### 4.1 Token Structure
Tokens issued by `POST /api/v1/auth/login` and `POST /api/v1/auth/register` comply with RFC 7519:
- **Header**: `{"alg": "HS256", "typ": "JWT"}`
- **Payload Claims**:
  - `sub`: Unique user ID as integer string (e.g. `"7"`).
  - `role`: Current active user role (`"farmer"`, `"buyer"`, or `"admin"`).
  - `is_admin`: Boolean flag indicating platform administrator privileges.
  - `iat`: Unix timestamp when the token was issued.
  - `exp`: Expiration timestamp based on `ACCESS_TOKEN_EXPIRE_MINUTES` (default 10,080 minutes / 7 days).

### 4.2 FastAPI Authentication Dependencies
- `get_current_user`: Decodes Bearer JWT, validates signature, loads active user from PostgreSQL, and rejects inactive or disabled users with `401 Unauthorized`.
- `get_current_user_optional`: Safely resolves the authenticated user when a token is present, returning `None` for anonymous callers without aborting public routes.
- `get_current_admin`: Confirms that `current_user.is_admin is True`, returning `403 Forbidden` if a regular farmer or buyer attempts access.

---

## 5. Password Reset & Gateway Configurations

### 5.1 Verification Token Mechanics
When a user initiates password recovery via `POST /api/v1/auth/forgot-password`:
1. The backend verifies that the provided identifier (email or mobile number) matches an active user.
2. A cryptographically random, URL-safe 32-character token is generated via `secrets.token_urlsafe(32)`.
3. The token is saved in PostgreSQL with a 60-minute expiration timestamp (`reset_token_expires_at`).
4. An email notification is attempted using the configured SMTP server. If SMTP is unconfigured or unavailable, the backend logs this cleanly and returns the token in the API response in development/staging environments so users are never blocked.
5. The user submits the token and new password to `POST /api/v1/auth/reset-password`, which verifies token validity, expiration, and hashes the new password with bcrypt before clearing the token.

### 5.2 SMTP & SMS Configuration Parameters
In [config.py](file:///d:/AgriMitra/backend/app/core/config.py), gateway settings are managed via environment variables:
```python
SMTP_HOST: Optional[str] = None          # e.g., "smtp.sendgrid.net" or "smtp.gmail.com"
SMTP_PORT: int = 587
SMTP_USER: Optional[str] = None
SMTP_PASSWORD: Optional[str] = None
SMTP_FROM_EMAIL: str = "noreply@agrimitra.gov.in"
SMTP_FROM_NAME: str = "AgriMitra Notifications"
SMTP_TLS: bool = True

SMS_GATEWAY_URL: Optional[str] = None   # e.g., CDAC / Kisan SMS Portal API endpoint
SMS_GATEWAY_API_KEY: Optional[str] = None
SMS_SENDER_ID: str = "AGRMTR"
```

---

## 6. Execution of Demonstration Identities Cleanup & Production Multi-User Verification

### 6.1 Database Pre-Execution Verification
1. **Pre-cleanup Backup**: Verified [backup_agrimitra_db_multiuser.sql](file:///d:/AgriMitra/backend/backup_agrimitra_db_multiuser.sql) (208,330 bytes, non-empty, pg_dump format).
2. **Targeted Demo Personas**:
   - User 1: Ramesh Gowda (`ramesh.gowda@mandyafarms.in`, `9845012345`)
   - User 2: Lakshmi Devi (`lakshmi.devi@halaguru.in`, `9845098765`)
   - User 3: Mysore Agro Traders / Basavaraj (`basavaraj@mysoreagro.com`, `9900112233`)
   - User 5: Suresh Gowda (`suresh.melukote@gmail.com`, `9845033333`)
   - User 6: Nagaraju K. (`nagaraju.guthalu@mandyafarms.in`, `9845022222`)
3. **Execution Script**: Executed [cleanup_demo_identities.py](file:///d:/AgriMitra/backend/cleanup_demo_identities.py) with `--execute` flag.

### 6.2 Cleanup Execution Results
- **Demo Users Removed**: Exactly 5 accounts (IDs 1, 2, 3, 5, 6).
- **Dependent Records Removed**:
  - `user_crops`: 8 records removed.
  - `community_posts`: 5 demonstration posts removed.
  - `post_comments`: 7 demonstration comments removed.
  - `post_likes`: 4 demonstration likes removed.
  - `saved_posts`: 2 demonstration saved posts removed.
  - `market_listings`: 6 demonstration produce listings removed.
  - `saved_listings`: 3 demonstration saved listings removed.
  - `market_enquiries`: 4 demonstration enquiries removed.
  - `enquiry_messages`: 8 demonstration messages removed.
  - `notifications`: 5 demonstration notifications removed.
  - `support_tickets`: 3 demonstration tickets removed.
  - `user_notification_preferences`: 5 demonstration preference rows removed.
  - `group_members`: 14 demonstration membership records removed.
  - `group_announcements`: 4 demonstration announcements removed.
- **Shared Records Preserved**:
  - `community_groups`: All 5 shared village groups preserved; creator reassigned to Administrator (User 4: Mandya Krishi Admin) with admin membership.
  - `crops`: All 6 catalogue crop definitions preserved.
  - `locations`: All 7 Mandya district location records preserved.

### 6.3 Post-Cleanup Database State
```
 id |      full_name      |           email           | phone_number |  role  | is_admin 
----+---------------------+---------------------------+--------------+--------+----------
  4 | Mandya Krishi Admin | admin@agrimitra.gov.in    | 9845000000   | admin  | t
  7 | Ananya Rao          | ananya.farmer@example.com | 9845111001   | farmer | f
  8 | Arjun Traders       | arjun.buyer@example.com   | 9845111002   | buyer  | f
  9 | Kavya Gowda         | kavya.farmer@example.com  | 9845111003   | farmer | f
 10 | Kavana N            | kavana.farmer@example.com | 9845222001   | farmer | f
 11 | Vijay Kumar         | vijay.buyer@example.com   | 9845222002   | buyer  | f
```

### 6.4 Container Restart & Live Service Verification
1. **Docker Compose Restart**: Stack restarted via `docker compose restart`.
2. **FastAPI Health**: `GET /api/v1/health` responded with `{"status":"ok","app":"AgriMitra API","version":"0.1.0","environment":"production","database":"connected"}`.
3. **Authentication Verification**:
   - `Kavana N` (`kavana.farmer@example.com` / `KavanaFarmer@2026`): Successfully authenticated, retrieved JWT with `sub: 10`, farmer role, and full profile.
   - `Vijay Kumar` (`vijay.buyer@example.com` / `VijayBuyer@2026`): Successfully authenticated, retrieved JWT with `sub: 11`, buyer role, and business name.
   - Removed Demo User (`ramesh.gowda@mandyafarms.in`): Rejected with `400 Bad Request` ("Invalid credentials. Please verify your email/mobile and password.").
   - Administrator (`admin@agrimitra.gov.in`): Successfully authenticated with `is_admin: true`.
4. **End-to-End Playwright Automation**: `docker_multiuser_e2e.spec.ts` executed against `http://localhost:8000` with 100% pass rate (46.7s duration).

---

## 7. Audit Conclusion

The AgriMitra authentication framework now strictly enforces genuine multi-user isolation. Anonymous access to private endpoints is rejected with `401 Unauthorized`, cross-user access attempts are blocked with `403 Forbidden`, passwords cannot be reverse-engineered from database dumps, and database persistence guarantees that newly registered users retain their exact credentials across application and container restarts.
