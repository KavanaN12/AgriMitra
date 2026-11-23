# AgriMitra – Ecosystem Relationship & Interaction Map

This document illustrates the multi-way, cross-account connections operating across AgriMitra's Mandya pilot ecosystem. Rather than isolated sample entries, every participant is tied into active workflows spanning agronomy, commerce, peer learning, and governance.

---

## 1. Interaction Overview Diagram

```mermaid
flowchart TD
    subgraph Administration & Governance
        Admin["Mandya Krishi Admin<br/>(User 4)"]
    end

    subgraph Extension & Advisory Staff
        Ravi["Dr. Ravi Kumar<br/>KVK Agronomist<br/>(User 15)"]
        Sowmya["Sowmya K. S.<br/>RSK Coordinator<br/>(User 16)"]
    end

    subgraph Farming Community
        Kavana["Kavana N<br/>Shivapura / Maddur<br/>(User 10)"]
        Ananya["Ananya Rao<br/>Guthalu / Mandya<br/>(User 7)"]
        Kavya["Kavya Gowda<br/>Melukote / Pandavapura<br/>(User 9)"]
        Manjunath["Manjunath Swamy<br/>Halaguru / Malavalli<br/>(User 12)"]
        Chethan["Chethan Kumar<br/>Arakere / Srirangapatna<br/>(User 13)"]
    end

    subgraph Commercial Buyers
        Vijay["Vijay Kumar<br/>Agro Wholesaler<br/>(User 11)"]
        Arjun["Arjun Traders<br/>Farm-Gate Aggregator<br/>(User 8)"]
        Priya["Priya Dharshini<br/>Kaveri Food Processors<br/>(User 14)"]
    end

    %% Advisory & Technical Interactions
    Kavana <-->|Drip Slurry Question & UAS Protocol| Ravi
    Ananya <-->|Paddy Blast Diagnosis & Spray Dose| Ravi
    Ananya <-->|50% NFSM Subsidized Bio-agent Pickup| Sowmya
    Chethan <-->|Banana Pseudostem Wind Bracing & Potash| Ravi
    Manjunath <-->|Custom Hiring Combine Harvester Booking| Sowmya

    %% Peer Farmer Collaborations
    Kavana <-->|Pooled 85 Qtl Collective Cane Listing #15| Chethan
    Manjunath <-->|Combine Harvester Cost Sharing Discussion| Kavya
    Kavana <-->|Slurry Mesh Filter Experience Sharing| Chethan

    %% Commercial Marketplace Transactions
    Kavana <-->|Negotiated 25 Qtl Cane @ ₹3,180 (Accepted)| Vijay
    Ananya <-->|Paddy Enquiry: 40 Qtl @ ₹2,600 (Active Counter)| Arjun
    Manjunath <-->|Procured 15 Qtl ZBNF Ragi @ ₹3,750 (Accepted)| Priya
    Kavya <-->|Banana Enquiry: 1,000 kg @ ₹40/kg (Pending)| Arjun
    Arjun <-->|APMC Market Trends Discussion| Vijay
    Vijay <-->|Procurement Advice & Moisture Testing| Priya

    %% Governance & Moderation
    Admin -->|Assigns Verified & Expert Badges| Ravi
    Admin -->|Assigns Verified & Expert Badges| Sowmya
    Admin -->|Resolves Ticket #4: Banana Nutrition Protocol| Kavya
    Admin -->|Reviews Ticket #5: APMC Tare Deductions| Arjun
    Chethan -->|Reports Inappropriate Commercial Spam #3| Admin
    Admin -->|Issues Author Warning & Resolves Report| Admin
```

---

## 2. Interaction Matrix by Functional Domain

### 2.1 Agronomic Advisory & Knowledge Exchange
| Initiator | Responder(s) | Topic | Outcome / Guidance Delivered |
| :--- | :--- | :--- | :--- |
| **Kavana N** (Farmer) | Chethan Kumar (Farmer)<br/>Dr. Ravi Kumar (Agronomist) | Drip fertigation with bio-slurry in Co 86032 sugarcane | Chethan shared double 100-mesh nylon filter technique; Dr. Ravi specified 25 kg Urea + 5 kg FeSO4 split dose and line purging to prevent clogging. |
| **Ananya Rao** (Farmer) | Dr. Ravi Kumar (Agronomist)<br/>Sowmya K. S. (RSK Staff) | Brown spindle lesions on BPT 5204 paddy | Dr. Ravi diagnosed Leaf Blast (*Pyricularia oryzae*) and prescribed Tricyclazole 75 WP (0.6g/L); Sowmya coordinated 50% subsidized collection at RSK Mandya. |
| **Manjunath Swamy** (Farmer) | Kavya Gowda (Farmer)<br/>Sowmya K. S. (RSK Staff) | ML-365 Ragi harvest pooling & track combine hiring | Kavya shared Melukote cluster experience saving 35% on diesel; Sowmya reserved 2 combine slots at RSK Custom Hiring Center. |
| **Chethan Kumar** (Farmer) | Kavya Gowda (Farmer)<br/>Dr. Ravi Kumar (Agronomist) | Banana pseudostem breakage from riverine wind gusts | Kavya detailed inverted-V bamboo prop tying; Dr. Ravi recommended 100g MOP per plant for cell-wall thickening. |

---

### 2.2 Direct Marketplace & Supply-Chain Negotiations
| Buyer Persona | Farmer Persona | Produce & Variety | Negotiation Arc & Financial Terms | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Vijay Kumar**<br/>(Wholesaler) | **Kavana N**<br/>(Shivapura) | Co 86032 Organic Sugarcane (Listing #11) | Initial offer: 25 qtl @ ₹3,100/qtl.<br/>Counter-offer: ₹3,180/qtl citing high brix (21.5%).<br/>Vijay accepted with farm-gate Saturday pickup. | **Accepted** |
| **Arjun Traders**<br/>(Trader) | **Ananya Rao**<br/>(Guthalu) | BPT 5204 Sona Masoori Paddy (Listing #12) | Initial offer: 40 qtl @ ₹2,550/qtl.<br/>Counter-offer: ₹2,600/qtl if buyer provides truck loading from Guthalu godown. | **Pending** (Active) |
| **Priya Dharshini**<br/>(Food Processor) | **Manjunath Swamy**<br/>(Halaguru) | ML-365 ZBNF Cleaned Ragi (Listing #13) | Offer: 15 qtl @ ₹3,750/qtl for organic ragi malt production.<br/>Manjunath confirmed 10.2% moisture and accepted deal. | **Accepted** |
| **Arjun Traders**<br/>(Trader) | **Kavya Gowda**<br/>(Melukote) | Yelakki Bale Grade-A Banana (Listing #14) | Offer: 1,000 kg @ ₹40/kg direct farm-gate lifting for Bengaluru retail chain. | **Pending** |
| **Collective Forum**<br/>(Maddur Sugarcane) | Lead: Kavana N<br/>Contributor: Chethan | Pooled Co 86032 & VCF 0517 Sugarcane (Listing #15) | 85 qtl pooled lot @ ₹3,200/qtl; Chethan Kumar contributed 40 qtl from Ganjam ratoon acreage. | **Active Listing** |

---

### 2.3 Village Group Governance & Regional Announcements
| Group Name | Taluk Hub | Group Roles | Active Announcements |
| :--- | :--- | :--- | :--- |
| **Maddur Sugarcane Growers Forum** (#1) | Maddur | Admin: Mandya Admin<br/>Moderator: Sowmya K. S.<br/>Members: Kavana, Chethan, Ravi | **Maddur Co-op Sugar Mill Cutting Schedule**: Kharif 2026 cane quota starts Wednesday; token verification at RSK. |
| **Mandya Organic Farmers Collective** (#2) | Mandya | Admin: Mandya Admin<br/>Members: Kavana, Ananya, Manjunath, Ravi | **Desi Cattle Breeding & Jeevamrutha Workshop**: Practical preparation session at Guthalu KVK campus this Saturday. |
| **Pandavapura Paddy & Jaggery Sangha** (#3) | Pandavapura | Admin: Mandya Admin<br/>Moderator: Dr. Ravi Kumar<br/>Members: Ananya, Kavya, Ravi | **Visvesvaraya Canal Water Rotation Schedule**: 10 days on / 6 days off schedule finalized for Melukote tail-end distributaries. |
| **Malavalli Dryland & Millets Association** (#4) | Malavalli | Admin: Mandya Admin<br/>Members: Manjunath, Sowmya, Ravi | Custom hiring center combine harvester pooling notices. |
| **Srirangapatna Riverine Horticulture Club** (#5) | Srirangapatna | Admin: Mandya Admin<br/>Members: Chethan, Kavya, Ravi | Flood embankment and pre-monsoon wind protection updates. |

---

### 2.4 Governance, Moderation & Support Flows
| Actor | Role | Action Target | Workflow & Resolution |
| :--- | :--- | :--- | :--- |
| **Kavya Gowda** | Farmer | Support Ticket #4 | Requested potassium and boron fertigation protocol for Yelakki banana. **Resolved by Admin** referencing KVK agronomy recommendations. |
| **Arjun Traders** | Buyer | Support Ticket #5 | Inquired about Mandya district standard APMC tare weight deduction for 50kg jute gunny bags. **In-Progress** with Admin forwarding to APMC secretary. |
| **Chethan Kumar** | Farmer | Content Report #3 | Flagged an unauthorized third-party chemical fertilizer promotional link on the discussion board. **Resolved by Admin** with author warning and audit log. |
| **Mandya Admin** | Admin | Moderation Audit Log | Granted verified farmer badges to genuine accounts, granted expert badges to Dr. Ravi and Sowmya, logged ticket and report updates. |
