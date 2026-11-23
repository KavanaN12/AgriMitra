# AgriMitra – Role-Based Access Control (RBAC) & Permission Matrix

This document defines the complete access control boundaries and authorization matrix implemented across the AgriMitra platform. Permissions are enforced at the API route layer in FastAPI and mirrored in the React frontend navigation and interface controls.

---

## 1. Role Definitions

| Role Identifier | Title | Description | Target Personas |
| :--- | :--- | :--- | :--- |
| `farmer` | Registered Farmer | Agricultural producer cultivating crops in Mandya district | Kavana N, Ananya Rao, Kavya Gowda, Manjunath Swamy, Chethan Kumar |
| `buyer` | Commercial Buyer | Wholesale merchant, aggregator, or food processor procuring produce | Vijay Kumar, Arjun Traders, Priya Dharshini |
| `farmer` + `is_expert` | Extension Field Staff | Agricultural agronomist or RSK extension coordinator | Dr. Ravi Kumar, Sowmya K. S. |
| `admin` | Platform Administrator | Government / Department of Agriculture system administrator | Mandya Krishi Admin |

---

## 2. Comprehensive RBAC Matrix

### Legend
- **C**: Create / Post
- **R**: Read / View
- **U**: Update / Edit (own records only unless specified)
- **D**: Delete (own records only unless specified)
- **A**: Administrative Approval / Moderation (all records)
- **—**: No Access (Blocked with HTTP 403 / 401)

| Feature / Domain | Action / Resource | Farmer | Buyer | Staff (Expert) | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Authentication & Profile** | Register new account | C | C | C | C |
| | Login with Email / Mobile | R | R | R | R |
| | View & Edit Own Profile | R, U | R, U | R, U | R, U |
| | View Other Users' Public Info | R (Public) | R (Public) | R (Public) | R (All) |
| | Toggle Phone Privacy | U | U | U | U |
| | Switch Interface Language (KN/EN)| U | U | U | U |
| **Crop Management** | View Mandya Crop Database | R | R | R | R |
| | Enroll Farm Crops (`/crops/my`) | C, R, U, D | — | C, R, U, D | R |
| | Manage Sowing Stage & Soil Info | C, R, U, D | — | C, R, U, D | R |
| | Manage Master Crop Database | — | — | — | C, R, U, D |
| **Community Groups** | Discover Village Groups | R | R | R | R |
| | Request Group Membership | C | — | C | A |
| | Approve / Reject Join Requests | Group Admin | — | Group Admin | A |
| | Promote Member to Moderator | Group Admin | — | Group Admin | A |
| | Publish Group Announcements | Group Admin / Mod | — | Group Admin / Mod | A |
| | Leave Group / Remove Member | U, D (Self) | — | U, D (Self) | A |
| **Community Forum** | Browse Discussions & Filters | R | R | R | R |
| | Create Discussion Post | C | C | C | C |
| | Edit / Delete Own Post | U, D (Self) | U, D (Self) | U, D (Self) | A |
| | Post Comments & Replies | C | C | C | C |
| | Delete Own Comment | D (Self) | D (Self) | D (Self) | A |
| | Like & Save Discussions | C, D (Self) | C, D (Self) | C, D (Self) | C, D (Self) |
| | Report Inappropriate Content | C | C | C | C |
| **Direct Marketplace** | Discover Produce Listings | R | R | R | R |
| | Create Produce Listing | C | — | C | C |
| | Edit / Delete Own Listing | U, D (Self) | — | U, D (Self) | A |
| | Contribute to Collective Listing | C (Group Member) | — | C | A |
| | Save / Bookmark Listing | C, D (Self) | C, D (Self) | C, D (Self) | C, D (Self) |
| | Send Purchase Enquiry | — | C | — | C |
| | View Enquiry & Negotiation Thread | R (Party Only) | R (Party Only) | — | R (All) |
| | Send Counter-Offer / Messages | C (Party Only) | C (Party Only) | — | C (Admin) |
| | Accept / Decline Enquiry | U (Seller Only) | — | — | A |
| | Cancel Enquiry | — | U (Buyer Only) | — | A |
| **Support & Feedback** | Submit Support Ticket | C | C | C | C |
| | View Own Support Tickets | R (Self) | R (Self) | R (Self) | R (All) |
| | Update / Resolve Tickets | — | — | — | A |
| **Platform Administration** | Access `/admin` Dashboard | — | — | — | R |
| | View System Usage & Metrics | — | — | — | R |
| | Manage User Badges & Status | — | — | — | A |
| | Resolve Content Reports | — | — | — | A |
| | View Moderation Audit Logs | — | — | — | R |

---

## 3. Security Boundary Enforcement Highlights

### 3.1 Personal Data & Multi-Tenancy Isolation
1. **Produce Listings Ownership Guard**:
   - `PUT /api/v1/market/listings/{listing_id}` checks `listing.farmer_id == current_user.id or current_user.is_admin`.
   - Any attempt by an outside farmer or buyer to modify or delete the listing returns `HTTP 403 Forbidden`.
2. **Buyer Enquiry Privacy Guard**:
   - `GET /api/v1/market/enquiries/{enquiry_id}` checks `current_user.id in [enquiry.buyer_id, enquiry.farmer_id] or current_user.is_admin`.
   - Outside buyers or third-party farmers attempting to view or message on an active enquiry receive `HTTP 403 Forbidden`.
3. **Discussion Post Ownership Guard**:
   - `PUT /api/v1/community/posts/{post_id}` and `DELETE /api/v1/community/posts/{post_id}` verify `post.author_id == current_user.id or current_user.is_admin`.
   - Prevents cross-user tampering with agronomic advice.
4. **Administrative Guard**:
   - All `/api/v1/admin/*` endpoints strictly evaluate `if not current_user.is_admin: raise HTTPException(status_code=403, detail="Administrative privileges required.")`.
   - Verified that neither regular farmers, commercial buyers, nor expert field staff can invoke administrative actions without `is_admin=True`.
5. **Group Announcement Authorization**:
   - Only group creators, assigned moderators, and platform admins can publish group announcements. General members receive `HTTP 403 Forbidden`.
