# AgriMitra User Data Ownership & Authorization Audit

**Application**: AgriMitra Platform  
**Purpose**: Comprehensive mapping of database entities, ownership foreign keys, and access authorization checks across all platform modules.  
**Audit Standard**: Zero-Trust Multi-Tenancy (Every resource modification or private data access must be validated against the caller's JWT identity).

---

## 1. Data Ownership Matrix

| Module | Entity / Table | Ownership Key | Access Scope | Enforced Authorization Policy |
|---|---|---|---|---|
| **Identity & Profile** | `users` | `id` | Private to User (Public view for basic info) | Only `current_user.id == id` or `admin` can edit personal profile, password, and location. |
| **Locations** | `locations` | `id` | Public / Shared Reference | Users link to locations via `location_id`. Platform admins can add new locations. |
| **Farmer Crops** | `user_crops` | `user_id` | Private to Farmer | Only the farmer who enrolled the crop can view (`GET /crops/my`), update (`PUT /crops/my/{id}`), or delete (`DELETE /crops/my/{id}`). Other farmers receive `403 Forbidden`. |
| **Crop Advisory** | `advisories` | `id` | Public reference | Dynamically filtered and prioritized based on authenticated user's enrolled crops and taluk location. |
| **Weather** | `weather_records` | `location_id` | Public reference | Resolved based on user's registered taluk or explicit query parameter. |
| **Community Posts** | `community_posts` | `author_id` | Public read, Private write | Any user can read posts. Only the original author (`author_id == current_user.id`) or platform admin can edit or delete a post. Cross-user edits return `403 Forbidden`. |
| **Comments** | `post_comments` | `user_id` | Public read, Private delete | Only the comment author or post owner can delete comments. |
| **Post Likes & Saves** | `post_likes`, `saved_posts` | `user_id` | Private to User | Likes and bookmark collections are strictly isolated by `user_id`. |
| **Village Groups** | `community_groups` | `creator_id` | Public discover, Member access | Group announcements and member approvals are strictly restricted to group admins (`GroupMember.role == "admin"`) or platform admin. |
| **Group Membership** | `group_members` | `user_id` | Group specific | Join requests submitted by user; approved/rejected by group administrator. |
| **Market Listings** | `market_listings` | `farmer_id` | Public discover, Owner manage | Any buyer/farmer can browse active listings. Only the listing owner (`farmer_id == current_user.id`) or admin can edit price, pause, reactivate, or delete listings. Third parties receive `403 Forbidden`. |
| **Saved Listings** | `saved_listings` | `user_id` | Private to User | Users can only view their own saved listings (`filter_type=saved`). |
| **Market Enquiries** | `market_enquiries` | `buyer_id` & `farmer_id` (via listing) | Strictly Private to Buyer & Farmer | Only the buyer who sent the enquiry or the farmer who owns the listing can view the thread (`GET /market/enquiries/{id}`), send messages, or update status. All other users receive `403 Forbidden`. |
| **Enquiry Messages** | `enquiry_messages` | `sender_id` & `enquiry_id` | Strictly Private to Thread Participants | Only buyer or farmer associated with the enquiry can post messages. |
| **Notifications** | `notifications` | `user_id` | Strictly Private | Queries filter by `Notification.user_id == current_user.id`. Users can never view or mark another user's notifications. |
| **Notification Settings** | `user_notification_preferences` | `user_id` | Strictly Private | One-to-one relationship per user. Managed strictly by the authenticated account. |
| **Support Tickets** | `support_tickets` | `user_id` | Private to User / Admin visible | Users view only tickets where `user_id == current_user.id`. Administrators view all platform tickets. |
| **Admin Controls** | `moderation_audit_logs` | `admin_id` | Restricted to Administrators | Protected by `get_current_admin`. Non-admin users are blocked with `403 Forbidden`. |

---

## 2. Detailed Endpoint Authorization Analysis

### 2.1 Farmer Crops ([crops.py](file:///d:/AgriMitra/backend/app/api/crops.py))
- `GET /api/v1/crops/my`:
  ```python
  return db.query(UserCrop).filter(UserCrop.user_id == current_user.id).all()
  ```
  *Result*: Never leaks another farmer's cultivated land area or sowing dates.
- `PUT /api/v1/crops/my/{user_crop_id}` & `DELETE /api/v1/crops/my/{user_crop_id}`:
  ```python
  if user_crop.user_id != current_user.id:
      raise HTTPException(status_code=403, detail="Not authorized to modify this crop record.")
  ```
  *Result*: Prevents tampering with another farmer's crop inventory.

### 2.2 Marketplace & Enquiries ([market.py](file:///d:/AgriMitra/backend/app/api/market.py))
- `GET /api/v1/market/enquiries`:
  ```python
  # Return only enquiries where user is buyer or seller
  farmer_listing_ids = [l.id for l in db.query(MarketListing.id).filter(MarketListing.farmer_id == current_user.id).all()]
  query = db.query(MarketEnquiry).filter(
      or_(
          MarketEnquiry.buyer_id == current_user.id,
          MarketEnquiry.listing_id.in_(farmer_listing_ids)
      )
  )
  ```
  *Result*: Complete commercial confidentiality for purchase negotiations.
- `GET /api/v1/market/enquiries/{enquiry_id}`:
  ```python
  is_buyer = (enquiry.buyer_id == current_user.id)
  is_seller = (enquiry.listing.farmer_id == current_user.id)
  if not (is_buyer or is_seller or current_user.is_admin):
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="You are not authorized to view another user's private enquiry."
      )
  ```
  *Result*: Verified prevention of third-party price snooping.
- `PUT /api/v1/market/listings/{listing_id}`:
  ```python
  if listing.farmer_id != current_user.id and not current_user.is_admin:
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="Not authorized to edit another farmer's listing."
      )
  ```
  *Result*: Listing parameters cannot be modified by competitor farmers or buyers.

### 2.3 Community Forum ([community.py](file:///d:/AgriMitra/backend/app/api/community.py))
- `PUT /api/v1/community/posts/{post_id}` & `DELETE /api/v1/community/posts/{post_id}`:
  ```python
  if post.author_id != current_user.id and not current_user.is_admin:
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="Not authorized to modify or delete another user's post."
      )
  ```
  *Result*: Content integrity is preserved against unauthorized modifications.

### 2.4 Notifications ([notifications.py](file:///d:/AgriMitra/backend/app/api/notifications.py))
- `GET /api/v1/notifications`:
  ```python
  query = db.query(Notification).filter(Notification.user_id == current_user.id)
  ```
  *Result*: System alerts and transactional updates are strictly private to the recipient.

---

## 3. Database Schema Integrity & Cascading Policies

- Foreign key constraints with `ondelete="CASCADE"` or explicit SQLAlchemy relationship cleanup are maintained for dependent entities (e.g. `UserCrop`, `SavedListing`, `EnquiryMessage`, `Notification`).
- Unique constraints prevent account duplication:
  - `ix_users_phone_number`: Unique index on `users(phone_number)`.
  - `ix_users_email`: Unique index on `users(email)`.
- Passwords are never stored in raw text; only bcrypt hashes (`password_hash`) are persisted.
