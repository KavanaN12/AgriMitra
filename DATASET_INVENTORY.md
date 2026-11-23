# AgriMitra – Dataset Inventory & Database Model Audit

This document records the exact database state and record counts in the PostgreSQL database (`agrimitra_db`) running under Docker Compose. All records were generated through authentic FastAPI API endpoints using signed JWT tokens and validated through live browser tests.

---

## 1. Table-Level Record Counts

| PostgreSQL Table | Model Class | Record Count | Description |
| :--- | :--- | :---: | :--- |
| `users` | `User` | **11** | 1 Admin, 5 Farmers, 3 Buyers, 2 Agricultural Staff |
| `locations` | `Location` | **6** | Distinct taluk-village-hobli geographic points in Mandya |
| `crops` | `Crop` | **6** | Sugarcane, Paddy, Ragi, Banana, Coconut, Tomato |
| `user_crops` | `UserCrop` | **14** | Enrolled crop acreages, sowing dates, and stages |
| `community_groups` | `CommunityGroup` | **5** | 5 Taluk-level farmer village associations |
| `group_members` | `GroupMember` | **22** | Approved memberships and moderator assignments |
| `group_announcements` | `GroupAnnouncement`| **3** | Official RSK/KVK agricultural notices |
| `community_posts` | `CommunityPost` | **10** | Threaded discussion topics across Mandya clusters |
| `post_comments` | `PostComment` | **16** | Multi-turn expert advice and peer farmer responses |
| `post_likes` | `PostLike` | **8** | Community upvotes on technical guidance |
| `saved_posts` | `SavedPost` | **5** | Bookmarked agronomic advisories |
| `market_listings` | `MarketListing` | **10** | Verified farmer produce listings (individual & collective) |
| `group_listing_contributions` | `GroupListingContribution` | **2** | Farmer produce pooling for bulk market supply |
| `market_enquiries` | `MarketEnquiry` | **6** | Buyer procurement offers |
| `enquiry_messages` | `EnquiryMessage` | **13** | Negotiation messages with price counter-offers |
| `support_tickets` | `SupportTicket` | **2** | Advisory & APMC regulatory support requests |
| `content_reports` | `ContentReport` | **1** | Content moderation report on commercial advertising |
| `moderation_audit_logs` | `ModerationAuditLog`| **17** | Administrative compliance audit trail entries |
| `notifications` | `Notification` | **7** | Real user event-driven notification inbox records |

---

## 2. Model Breakdown & Attribute Inventory

### 2.1 User Accounts (`users`)
- **Total Accounts**: 11
- **Role Distribution**:
  - `admin`: 1 (`admin@agrimitra.gov.in`)
  - `farmer`: 7 (5 Farmers + 2 Extension Field Staff)
  - `buyer`: 3 (Wholesaler, Trader, Food Processor)
- **Badges**:
  - `is_verified=True`: 10 accounts (verified by Admin audit log)
  - `is_expert=True`: 2 accounts (Dr. Ravi Kumar & Sowmya K. S.)
  - `is_active=True`: 11 accounts (100% active)

### 2.2 User Crop Enrollments (`user_crops`)
Total: 14 active farm plots across Mandya:
1. **Kavana N**: Sugarcane (3.0 ac, Co 86032, vegetative) & Paddy (1.5 ac, tillering)
2. **Ananya Rao**: Paddy (2.0 ac, BPT 5204, flowering) & Tomato (1.0 ac, vegetative)
3. **Kavya Gowda**: Banana (3.0 ac, Yelakki, maturity) & Sugarcane (2.0 ac, tillering)
4. **Manjunath Swamy**: Ragi / Finger Millet (3.5 ac, ML-365, vegetative) & Coconut (2.5 ac, harvesting)
5. **Chethan Kumar**: Sugarcane (2.0 ac, growing) & Banana (1.5 ac, flowering)

### 2.3 Community Groups (`community_groups` & `group_members`)
5 Regional Village Groups:
1. **Maddur Sugarcane Growers Forum** (Group #1, Maddur): 5 Members, 1 Announcement (Sowmya K. S. - Harvest Quota)
2. **Mandya Organic Farmers Collective** (Group #2, Mandya): 6 Members, 1 Announcement (Admin - Jeevamrutha Workshop)
3. **Pandavapura Paddy & Jaggery Sangha** (Group #3, Pandavapura): 4 Members, 1 Announcement (Dr. Ravi Kumar - Canal Rotation)
4. **Malavalli Dryland & Millets Association** (Group #4, Malavalli): 4 Members
5. **Srirangapatna Riverine Horticulture Club** (Group #5, Srirangapatna): 3 Members

### 2.4 Discussion Threads (`community_posts` & `post_comments`)
1. **Thread #10**: Subsurface Drip Fertigation in Sugarcane (Author: Kavana N)
   - Comments: Chethan Kumar (filtration advice), Dr. Ravi Kumar (NPK + FeSO4 UAS formula), Kavana N (zinc follow-up), Dr. Ravi Kumar (chemical precipitation warning), Kavana N (live frontend update comment).
   - Likes: Manjunath, Chethan; Saves: Manjunath, Kavya.
2. **Thread #11**: Paddy Leaf Blast Lesions (Author: Ananya Rao)
   - Comments: Dr. Ravi Kumar (Pyricularia oryzae diagnosis & Tricyclazole dosage), Sowmya K. S. (RSK 50% subsidy availability), Ananya Rao (pickup confirmation).
   - Likes: Kavana, Chethan; Saves: Chethan.
3. **Thread #12**: ML-365 Ragi Collective Combine Harvester (Author: Manjunath Swamy)
   - Comments: Kavya Gowda (Pandavapura cost sharing), Sowmya K. S. (RSK Custom Hiring Center reservation).
   - Likes: Kavana, Kavya; Saves: Kavana.
4. **Thread #13**: Banana Pseudostem Wind Propping (Author: Chethan Kumar)
   - Comments: Kavya Gowda (inverted-V bamboo tying), Dr. Ravi Kumar (MOP cell-wall strengthening).
   - Likes: Ananya.
5. **Thread #14**: APMC Premium Trends for Organic Produce (Author: Arjun Traders)
   - Comments: Vijay Kumar (moisture standards), Priya Dharshini (procurement offer), Manjunath Swamy (stock availability).
   - Likes: Kavana; Saves: Manjunath.

### 2.5 Produce Listings & Negotiation Threads (`market_listings` & `market_enquiries`)
1. **Listing #11 (Kavana N)**: Co 86032 Sugarcane, 40 qtl @ ₹3,250/qtl. Image: `/images/crops/sugarcane.jpg`
   - **Enquiry #7 (Vijay Kumar)**: Requested 25 qtl @ ₹3,100 -> Counter-offer by Kavana @ ₹3,180 -> Accepted by Vijay. Status: `accepted`.
2. **Listing #12 (Ananya Rao)**: BPT 5204 Sona Masoori Paddy, 60 qtl @ ₹2,650/qtl. Image: `/images/crops/paddy.jpg`
   - **Enquiry #8 (Arjun Traders)**: Requested 40 qtl @ ₹2,550 -> Counter-offer by Ananya @ ₹2,600 (buyer handles loading). Status: `pending`.
3. **Listing #13 (Manjunath Swamy)**: ML-365 ZBNF Ragi, 20 qtl @ ₹3,800/qtl. Image: `/images/crops/ragi.jpg`
   - **Enquiry #9 (Priya Dharshini)**: Requested 15 qtl @ ₹3,750 with immediate payment upon testing -> Accepted by Manjunath. Status: `accepted`.
4. **Listing #14 (Kavya Gowda)**: Yelakki Banana, 1,500 kg @ ₹42/kg. Image: `/images/crops/banana.jpg`
   - **Enquiry #10 (Arjun Traders)**: Requested 1,000 kg @ ₹40/kg. Status: `pending`.
5. **Listing #15 (Collective Listing)**: Maddur Sugarcane Forum, 125 qtl pooled @ ₹3,200/qtl. Image: `/images/crops/sugarcane.jpg`
   - Lead Farmer: Kavana N (85 qtl)
   - Contributor: Chethan Kumar (40 qtl, Co 86032 ratoon harvest)
6. **Listing #17 (Chethan Kumar)**: Ganga Bondam Tender Coconut (Grade A), 1,200 pieces @ ₹35/piece. Image: `/images/crops/coconut.jpg`
7. **Listing #18 (Kavya Gowda)**: Shivam F1 Hybrid Red Tomato, 80 crates @ ₹420/crate. Image: `/images/crops/tomato.jpg`

### 2.5.1 Local Optimized Crop Image Assets (`frontend/public/images/crops/`)
- `sugarcane.jpg` (139 KB): Authentic Mandya canal-command sugarcane plantation
- `paddy.jpg` (127 KB): Cleaned Sona Masoori unpolished sun-dried paddy grains
- `ragi.jpg` (142 KB): Mandya ZBNF certified cleaned finger millet (ML-365)
- `banana.jpg` (40 KB): Mysore/Mandya scented Yelakki banana bunch
- `coconut.jpg` (192 KB): Freshly harvested green tender coconuts (Cauvery riverine belt)
- `tomato.jpg` (193 KB): Field-fresh ripe red tomatoes in collection crates

### 2.6 Governance & Support Records
- **Support Ticket #4 (Kavya Gowda)**: Potassium & Boron protocol for banana -> Resolved by Admin with expert agronomist recommendations.
- **Support Ticket #5 (Arjun Traders)**: APMC gunny bag tare weight deduction -> Marked In-Progress by Admin.
- **Content Report #3 (Chethan Kumar)**: Reported commercial advertising link in discussion comments -> Reviewed and resolved with author warning and audit log.
- **Moderation Audit Logs**: 17 entries detailing verification badge grants, ticket status changes, and content moderation resolutions.
