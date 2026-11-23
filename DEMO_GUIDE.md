# AgriMitra – Multi-User Application & Demonstration Guide

**Pilot Region**: Mandya District, Karnataka (Cauvery Basin)  
**Application URL**: [http://localhost:8000](http://localhost:8000)  
**Authentication**: Real Multi-User Authentication (bcrypt password hashing, RFC 7519 JWT Bearer tokens)  
**Database**: PostgreSQL 16 Alpine (`agrimitra_db`)  

---

## 1. Overview: Genuine Multi-User System

AgriMitra is a true multi-user agricultural platform. Any farmer or buyer can:
1. **Register a genuine new account** using their own email, mobile number, and password.
2. **Complete onboarding** with location hierarchy (Taluk, Hobli, Village in Mandya) and crop / business profile details.
3. **Log in securely** with Email or Mobile Number + Password.
4. **Access strictly isolated data**: My Crops, private produce listings, and private buyer enquiries are protected against access or tampering by other users.
5. **Persist across restarts**: All accounts, listings, and messages are permanently stored in PostgreSQL.

---

## 2. Verified Multi-User Test Accounts

The following three distinct genuine accounts have been registered and verified in PostgreSQL:

| Account | Name | Role | Email | Mobile Number | Password | Profile & Location |
|---|---|---|---|---|---|---|
| **Account A** | **Ananya Rao** | **Farmer** | `ananya.farmer@example.com` | `9845111001` | `AnanyaFarmer@2026` | 4.0 ac, Organic Sugarcane & Paddy, Shivapura, Maddur |
| **Account B** | **Arjun Traders** | **Buyer** | `arjun.buyer@example.com` | `9845111002` | `ArjunBuyer@2026` | Wholesaler, Arjun Agro Commodities Ltd., Guthalu, Mandya |
| **Account C** | **Kavya Gowda** | **Farmer** | `kavya.farmer@example.com` | `9845111003` | `KavyaFarmer@2026` | 3.5 ac, Mixed Ragi cultivation, Halaguru, Malavalli |

### Platform Administrator Account
| Name | Role | Email | Mobile Number | Password | Capabilities |
|---|---|---|---|---|---|
| **Mandya Krishi Admin** | **Administrator** | `admin@agrimitra.gov.in` | `9845000000` | `Admin@123` | Platform metrics, user moderation, badge management, crop registry, audit logs |

---

## 3. Pre-Seeded Demonstration Personas (For Baseline Evaluation)

For evaluators reviewing historical reference records alongside new user workflows:

| Persona Name | Phone Number | Email | Role | Password | Location |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **Ramesh Gowda** | `9845012345` | `ramesh.gowda@mandyafarms.in` | **Farmer & Buyer** (Dual) | `Password@123` | Shivapura, Maddur |
| **Lakshmi Devi** | `9845098765` | `lakshmi.devi@halaguru.in` | **Farmer** | `Password@123` | Halaguru, Malavalli |
| **Mysore Agro Traders** | `9900112233` | `basavaraj@mysoreagro.com` | **Buyer** (Wholesaler) | `Password@123` | Mandya APMC Yard |
| **Suresh Gowda** | `9845033333` | `suresh.melukote@gmail.com` | **Farmer** | `Password@123` | Melukote, Pandavapura |
| **Nagaraju K.** | `9845022222` | `nagaraju.guthalu@mandyafarms.in` | **Farmer** | `Password@123` | Guthalu, Mandya |

---

## 4. Multi-User Verification User Journeys

### Journey 1: Genuine User Registration & Profile Initialization
1. Navigate to [http://localhost:8000/register](http://localhost:8000/register).
2. Enter personal credentials: Full Name, Email Address, 10-digit Mobile Number, and Password.
3. Select Role (**Farmer**, **Buyer**, or **Both**).
4. Select location: State (Karnataka) → District (Mandya) → Taluk → Hobli → Village.
5. If **Farmer**: Enter land area, farming type (organic/natural/conventional), and choose crops (Sugarcane, Paddy, Ragi, etc.).
6. If **Buyer**: Enter business name, procurement type, and optional license number.
7. Click **Register (ಖಾತೆ ರಚಿಸಿ)**.
8. The backend creates the account in PostgreSQL, hashes the password via bcrypt, initializes notification preferences, and returns a signed JWT.

### Journey 2: Farmer-to-Buyer Marketplace Negotiation (Account A & Account B)
1. **Farmer Ananya Rao logs in** (`ananya.farmer@example.com` / `AnanyaFarmer@2026`).
2. Navigate to **Marketplace** (`/market`) → **Post Produce (ಬೆಳೆ ಮಾರಾಟ)**.
3. Submit a new produce listing: *Organic Co 86032 Sugarcane, 25 Tonnes at ₹3,200/Tonne, Shivapura, Maddur*.
4. Log out.
5. **Buyer Arjun Traders logs in** (`arjun.buyer@example.com` / `ArjunBuyer@2026`).
6. Browse marketplace listings and select Ananya's Sugarcane listing.
7. Click **Send Enquiry (ವಿಚಾರಣೆ ಕಳುಹಿಸಿ)**: Offer ₹3,100/tonne for 20 tonnes.
8. Log out.
9. **Farmer Ananya Rao logs in**:
   - In **Enquiries**, view the purchase proposal from Arjun Traders.
   - Reply with a counter-offer: *"We can agree to ₹3,150 per tonne with farm-gate loading included."*
   - Update enquiry status to `accepted` or `in_negotiation`.

### Journey 3: Third-Party Data Privacy Enforcement (Account C)
1. **Farmer Kavya Gowda logs in** (`kavya.farmer@example.com` / `KavyaFarmer@2026`).
2. Attempting to view Ananya and Arjun's private enquiry thread via direct API:
   - Endpoint responds strictly with `403 Forbidden` (`detail: "You are not authorized to view another user's private enquiry."`).
3. Attempting to edit Ananya's produce listing via direct API:
   - Endpoint responds strictly with `403 Forbidden` (`detail: "Not authorized to edit another farmer's listing."`).
4. Attempting to access the Platform Admin Dashboard:
   - Endpoint responds strictly with `403 Forbidden` (`detail: "Administrative privileges required to access this resource."`).

### Journey 4: Platform Administration
1. **Platform Admin logs in** (`admin@agrimitra.gov.in` / `Admin@123`).
2. Navigate to `/admin`.
3. Review total platform users (including Accounts A, B, and C), active listings, and community groups.
4. Perform moderation actions: verify user badges, review content reports, and inspect administrative audit logs.
