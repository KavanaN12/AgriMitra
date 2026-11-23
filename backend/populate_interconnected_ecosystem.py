"""
AgriMitra - Comprehensive Interconnected Multi-User Ecosystem Population Script
Communicates exclusively via authentic FastAPI HTTP endpoints (http://127.0.0.1:8000/api/v1)
using signed JWT bearer tokens for 11 distinct users across Mandya district.
"""
import sys
import json
import datetime
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_call(endpoint: str, method: str = "GET", data: dict = None, token: str = None) -> dict:
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[API ERROR] {method} {endpoint} -> HTTP {e.code}: {err_msg}")
        try:
            return {"_error": e.code, "_detail": json.loads(err_msg)}
        except Exception:
            return {"_error": e.code, "_detail": err_msg}

def authenticate_or_register(user_info: dict) -> tuple[str, dict]:
    """Logs in or registers user and returns (access_token, user_dict)"""
    # 1. Try login
    login_res = api_call("/auth/login", method="POST", data={
        "identifier": user_info["email"],
        "password": user_info["password"]
    })
    if "access_token" in login_res:
        return login_res["access_token"], login_res["user"]
    
    # 2. If not found, register
    print(f"Registering new genuine account: {user_info['full_name']} ({user_info['email']})")
    reg_payload = {
        "full_name": user_info["full_name"],
        "email": user_info["email"],
        "phone_number": user_info["phone_number"],
        "password": user_info["password"],
        "preferred_language": user_info.get("preferred_language", "kn"),
        "role": user_info["role"],
        "location": user_info["location"],
        "farm_size_acres": user_info.get("farm_size_acres"),
        "farming_type": user_info.get("farming_type"),
        "irrigation_source": user_info.get("irrigation_source"),
        "buyer_business_name": user_info.get("buyer_business_name"),
        "buyer_type": user_info.get("buyer_type"),
        "buyer_license_no": user_info.get("buyer_license_no")
    }
    reg_res = api_call("/auth/register", method="POST", data=reg_payload)
    if "access_token" in reg_res:
        return reg_res["access_token"], reg_res["user"]
    
    # If phone or email registered with different password, try phone login
    login_phone_res = api_call("/auth/login", method="POST", data={
        "identifier": user_info["phone_number"],
        "password": user_info["password"]
    })
    if "access_token" in login_phone_res:
        return login_phone_res["access_token"], login_phone_res["user"]

    raise RuntimeError(f"Could not authenticate or register user: {user_info['email']} -> {reg_res}")

def main():
    print("=" * 70)
    print("AgriMitra: Interconnected Multi-User Local Ecosystem Setup")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. Define Accounts
    # -------------------------------------------------------------
    accounts = [
        # Administrator
        {
            "key": "admin",
            "full_name": "Mandya Krishi Admin",
            "email": "admin@agrimitra.gov.in",
            "phone_number": "9845000000",
            "password": "Admin@123",
            "role": "admin",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Mandya", "village": "Guthalu", "pincode": "571403"}
        },
        # Farmers (5)
        {
            "key": "kavana",
            "full_name": "Kavana N",
            "email": "kavana.farmer@example.com",
            "phone_number": "9845222001",
            "password": "KavanaFarmer@2026",
            "role": "farmer",
            "preferred_language": "kn",
            "farm_size_acres": 4.5,
            "farming_type": "organic",
            "irrigation_source": "canal",
            "bio": "Certified organic sugarcane and paddy grower in Shivapura, practicing green manuring with Sunn hemp.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Maddur", "village": "Shivapura", "pincode": "571428"}
        },
        {
            "key": "ananya",
            "full_name": "Ananya Rao",
            "email": "ananya.farmer@example.com",
            "phone_number": "9845111001",
            "password": "AnanyaFarmer@2026",
            "role": "farmer",
            "preferred_language": "kn",
            "farm_size_acres": 3.0,
            "farming_type": "conventional",
            "irrigation_source": "canal",
            "bio": "Progressive paddy cultivator and greenhouse tomato producer in Guthalu with precision drip fertigation.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Mandya", "village": "Guthalu", "pincode": "571403"}
        },
        {
            "key": "kavya",
            "full_name": "Kavya Gowda",
            "email": "kavya.farmer@example.com",
            "phone_number": "9845111003",
            "password": "KavyaFarmer@2026",
            "role": "farmer",
            "preferred_language": "kn",
            "farm_size_acres": 5.0,
            "farming_type": "mixed",
            "irrigation_source": "borewell",
            "bio": "Specializing in tissue-culture Yelakki banana and ratoon sugarcane along Melukote foothills.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Pandavapura", "village": "Melukote", "pincode": "571431"}
        },
        {
            "key": "manjunath",
            "full_name": "Manjunath Swamy",
            "email": "manjunath.farmer@example.com",
            "phone_number": "9845222003",
            "password": "ManjunathFarmer@2026",
            "role": "farmer",
            "preferred_language": "kn",
            "farm_size_acres": 6.0,
            "farming_type": "natural",
            "irrigation_source": "rainfed",
            "bio": "Practicing Subhash Palekar natural farming (ZBNF) with Jeevamrutha, desi Hallikar cattle, and intercropped millets.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Malavalli", "village": "Halaguru", "pincode": "571421"}
        },
        {
            "key": "chethan",
            "full_name": "Chethan Kumar",
            "email": "chethan.farmer@example.com",
            "phone_number": "9845222004",
            "password": "ChethanFarmer@2026",
            "role": "farmer",
            "preferred_language": "kn",
            "farm_size_acres": 3.5,
            "farming_type": "mixed",
            "irrigation_source": "canal",
            "bio": "Riverine silt loam farmer cultivating high-brix sugarcane and multi-tier banana plantation near Kaveri basin.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Srirangapatna", "village": "Arakere", "pincode": "571415"}
        },
        # Buyers (3)
        {
            "key": "vijay",
            "full_name": "Vijay Kumar",
            "email": "vijay.buyer@example.com",
            "phone_number": "9845222002",
            "password": "VijayBuyer@2026",
            "role": "buyer",
            "preferred_language": "en",
            "buyer_business_name": "Vijay Agro Mandi Ltd.",
            "buyer_type": "wholesaler",
            "buyer_license_no": "KA-MND-APMC-2023-8941",
            "bio": "Wholesale commodity merchant procuring APMC-grade paddy, jaggery and pulses for Bengaluru retail chains.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Mandya", "village": "Guthalu", "pincode": "571403"}
        },
        {
            "key": "arjun",
            "full_name": "Arjun Traders",
            "email": "arjun.buyer@example.com",
            "phone_number": "9845111002",
            "password": "ArjunBuyer@2026",
            "role": "buyer",
            "preferred_language": "en",
            "buyer_business_name": "Arjun Mandi & Agro Logistics",
            "buyer_type": "trader",
            "buyer_license_no": "KA-MDR-AGR-2022-4412",
            "bio": "Direct farm-gate aggregator supplying fresh tender coconut, tomato, and sugarcane to Mysore & Bengaluru retail.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Maddur", "village": "Shivapura", "pincode": "571428"}
        },
        {
            "key": "priya",
            "full_name": "Priya Dharshini",
            "email": "priya.buyer@example.com",
            "phone_number": "9845222005",
            "password": "PriyaBuyer@2026",
            "role": "buyer",
            "preferred_language": "en",
            "buyer_business_name": "Kaveri Food Processors & Organics",
            "buyer_type": "processor",
            "buyer_license_no": "FSSAI-11224334000189",
            "bio": "Organic food processor manufacturing chemical-free granulated jaggery, ragi malt, and cold-pressed coconut oil.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Srirangapatna", "village": "Arakere", "pincode": "571415"}
        },
        # Agricultural Staff (2)
        {
            "key": "ravi",
            "full_name": "Dr. Ravi Kumar",
            "email": "ravi.extension@agrimitra.gov.in",
            "phone_number": "9845333001",
            "password": "RaviOfficer@2026",
            "role": "farmer",
            "preferred_language": "kn",
            "bio": "Senior Agricultural Extension Officer & Agronomist at ICAR-KVK Mandya, specializing in IPM, soil fertility & fertigation.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Mandya", "village": "Guthalu", "pincode": "571403"}
        },
        {
            "key": "sowmya",
            "full_name": "Sowmya K. S.",
            "email": "sowmya.coordinator@agrimitra.gov.in",
            "phone_number": "9845333002",
            "password": "SowmyaCoord@2026",
            "role": "farmer",
            "preferred_language": "kn",
            "bio": "Village Agricultural Coordinator at Raitha Samparka Kendra (RSK Maddur & Malavalli), facilitating DBT schemes, soil testing and seed quotas.",
            "location": {"state": "Karnataka", "district": "Mandya", "taluk": "Maddur", "village": "Shivapura", "pincode": "571428"}
        }
    ]

    tokens = {}
    users = {}

    print("\n[Phase 1] Authenticating all 11 accounts via FastAPI...")
    for acc in accounts:
        tkn, usr = authenticate_or_register(acc)
        tokens[acc["key"]] = tkn
        users[acc["key"]] = usr
        print(f"  ✓ Authenticated: {acc['key']:10} | User ID: {usr['id']} | {usr['full_name']} ({acc['role']})")

    admin_token = tokens["admin"]

    # -------------------------------------------------------------
    # 2. Enrich Profiles & Assign Badges
    # -------------------------------------------------------------
    print("\n[Phase 2] Enriching profiles and assigning role badges...")
    for acc in accounts:
        k = acc["key"]
        tkn = tokens[k]
        u_id = users[k]["id"]

        # Update profile
        prof_data = {
            "full_name": acc["full_name"],
            "bio": acc.get("bio", ""),
            "preferred_language": acc.get("preferred_language", "kn"),
            "phone_visible": True,
            "text_size": "normal",
            "data_saver": False,
            "farm_size_acres": acc.get("farm_size_acres"),
            "farming_type": acc.get("farming_type"),
            "irrigation_source": acc.get("irrigation_source"),
            "buyer_business_name": acc.get("buyer_business_name"),
            "buyer_type": acc.get("buyer_type"),
            "buyer_license_no": acc.get("buyer_license_no")
        }
        api_call("/profile", method="PUT", data=prof_data, token=tkn)

        # Admin assigns verified badge to all legitimate participants
        badge_data = {"is_verified": True}
        if k in ["ravi", "sowmya"]:
            badge_data["is_expert"] = True
        
        api_call(f"/admin/users/{u_id}/badges", method="PATCH", data=badge_data, token=admin_token)

    print("  ✓ Profiles updated and badges assigned via Admin audit logging.")

    # -------------------------------------------------------------
    # 3. Farmer Crop Enrollments
    # -------------------------------------------------------------
    print("\n[Phase 3] Enrolling crops for each farmer...")
    farmer_crop_specs = {
        "kavana": [
            {"crop_id": 1, "acreage": 3.0, "stage": "vegetative", "soil_type": "Deep Loam", "irrigation_type": "canal", "sowing_date": "2026-08-15T00:00:00Z"},
            {"crop_id": 2, "acreage": 1.5, "stage": "tillering", "soil_type": "Clay Loam", "irrigation_type": "canal", "sowing_date": "2026-09-20T00:00:00Z"}
        ],
        "ananya": [
            {"crop_id": 2, "acreage": 2.0, "stage": "flowering", "soil_type": "Clayey Soil", "irrigation_type": "canal", "sowing_date": "2026-09-01T00:00:00Z"},
            {"crop_id": 6, "acreage": 1.0, "stage": "vegetative", "soil_type": "Red Loam", "irrigation_type": "drip", "sowing_date": "2026-10-10T00:00:00Z"}
        ],
        "kavya": [
            {"crop_id": 4, "acreage": 3.0, "stage": "maturity", "soil_type": "Alluvial Loam", "irrigation_type": "drip", "sowing_date": "2026-01-15T00:00:00Z"},
            {"crop_id": 1, "acreage": 2.0, "stage": "tillering", "soil_type": "Deep Loam", "irrigation_type": "borewell", "sowing_date": "2026-09-10T00:00:00Z"}
        ],
        "manjunath": [
            {"crop_id": 3, "acreage": 3.5, "stage": "vegetative", "soil_type": "Red Sandy Loam", "irrigation_type": "rainfed", "sowing_date": "2026-09-25T00:00:00Z"},
            {"crop_id": 5, "acreage": 2.5, "stage": "harvesting", "soil_type": "Sandy Loam", "irrigation_type": "drip", "sowing_date": "2025-06-01T00:00:00Z"}
        ],
        "chethan": [
            {"crop_id": 1, "acreage": 2.0, "stage": "growing", "soil_type": "Riverine Silt Loam", "irrigation_type": "canal", "sowing_date": "2026-08-01T00:00:00Z"},
            {"crop_id": 4, "acreage": 1.5, "stage": "flowering", "soil_type": "Alluvial Loam", "irrigation_type": "drip", "sowing_date": "2026-03-10T00:00:00Z"}
        ]
    }

    for f_key, crops in farmer_crop_specs.items():
        tkn = tokens[f_key]
        for c in crops:
            res = api_call("/crops/my", method="POST", data=c, token=tkn)
            print(f"  ✓ {users[f_key]['full_name']} enrolled Crop #{c['crop_id']} ({c['acreage']} acres, {c['stage']})")

    # -------------------------------------------------------------
    # 4. Community Groups: Joining, Approvals & Announcements
    # -------------------------------------------------------------
    print("\n[Phase 4] Joining village community groups and approving memberships...")
    group_joins = [
        ("kavana", 1), ("kavana", 2),
        ("chethan", 1), ("chethan", 5),
        ("ananya", 2), ("ananya", 3),
        ("manjunath", 2), ("manjunath", 4),
        ("kavya", 3), ("kavya", 5),
        ("sowmya", 1), ("sowmya", 4),
        ("ravi", 1), ("ravi", 2), ("ravi", 3), ("ravi", 4), ("ravi", 5)
    ]

    for user_key, grp_id in group_joins:
        tkn = tokens[user_key]
        u_id = users[user_key]["id"]
        # Join request
        api_call(f"/community/groups/{grp_id}/join", method="POST", token=tkn)
        
        # Admin approves
        reqs = api_call(f"/community/groups/{grp_id}/requests", token=admin_token)
        if isinstance(reqs, list):
            for r in reqs:
                if r.get("user_id") == u_id and r.get("status") == "pending":
                    api_call(f"/community/groups/{grp_id}/requests/{r['id']}/approve", method="POST", token=admin_token)

    print("  ✓ Group join requests submitted and approved.")

    # Assign moderator role to extension staff
    api_call(f"/community/groups/1/members/{users['sowmya']['id']}/role", method="PUT", data={"role": "moderator"}, token=admin_token)
    api_call(f"/community/groups/3/members/{users['ravi']['id']}/role", method="PUT", data={"role": "moderator"}, token=admin_token)
    print("  ✓ Appointed Sowmya K. S. and Dr. Ravi Kumar as group moderators.")

    # Announcements
    announcements = [
        {
            "group_id": 1,
            "token": tokens["sowmya"],
            "data": {
                "title": "Maddur Co-operative Sugar Mill (NSL Sugars Koppa) Cutting Schedule",
                "content": "Kharif 2026 cane harvesting quota starts next Wednesday for Shivapura, Koppa, and Maddur canal commands. Please verify delivery token numbers at RSK.",
                "priority": "urgent"
            }
        },
        {
            "group_id": 2,
            "token": admin_token,
            "data": {
                "title": "Desi Cattle Breeding & Jeevamrutha Preparation Workshop",
                "content": "Mandya Organic Sangha is organizing a practical Jeevamrutha and Bijamrutha preparation field session this Saturday at Guthalu KVK campus.",
                "priority": "normal"
            }
        },
        {
            "group_id": 3,
            "token": tokens["ravi"],
            "data": {
                "title": "Visvesvaraya Canal Water Rotation Schedule (10 Days On / 6 Days Off)",
                "content": "Irrigation department has finalized the canal rotational schedule for Pandavapura and Melukote tail-end distributaries. Farmers are advised to complete paddy puddling.",
                "priority": "urgent"
            }
        }
    ]

    for ann in announcements:
        api_call(f"/community/groups/{ann['group_id']}/announcements", method="POST", data=ann["data"], token=ann["token"])
        print(f"  ✓ Announcement published in Group #{ann['group_id']}: {ann['data']['title']}")

    # -------------------------------------------------------------
    # 5. Multi-Party Threaded Community Conversations
    # -------------------------------------------------------------
    print("\n[Phase 5] Creating interconnected community discussions & multi-turn replies...")
    
    # Thread 1: Sugarcane Drip Fertigation
    t1_post = api_call("/community/posts", method="POST", token=tokens["kavana"], data={
        "title": "Subsurface Drip Fertigation Experience in 90-day Sugarcane Ratoon",
        "content": "We installed subsurface drip on 3 acres of Co 86032 in Shivapura. During the recent canal dry rotation, soil moisture held well, but I noticed slight yellowing on lower leaves. Has anyone experimented with cow urine bio-digester slurry through drip venturi?",
        "topic": "cultivation",
        "crop_id": 1,
        "group_id": 1,
        "language": "kn"
    })
    t1_id = t1_post.get("id")
    if t1_id:
        r1 = api_call(f"/community/posts/{t1_id}/comments", method="POST", token=tokens["chethan"], data={
            "content": "Kavana avare, we do this in Ganjam riverine plots. Ensure you filter the slurry twice through 100-mesh nylon screen before venturi suction, otherwise dripper emitters clog quickly."
        })
        r2 = api_call(f"/community/posts/{t1_id}/comments", method="POST", token=tokens["ravi"], data={
            "content": "Yellowing on 90-day ratoon indicates early nitrogen & iron deficiency under dry-spell stress. UAS Bangalore recommends fertigation with 25 kg Urea + 5 kg Ferrous Sulphate per acre in two split doses. Run clean water for 15 minutes after venturi flushing to purge lines."
        })
        r2_id = r2.get("id")
        api_call(f"/community/posts/{t1_id}/comments", method="POST", token=tokens["kavana"], data={
            "content": "Thank you Dr. Ravi! Will apply the ferrous sulphate today. Should I mix zinc sulphate in the same tank?",
            "parent_id": r2_id
        })
        api_call(f"/community/posts/{t1_id}/comments", method="POST", token=tokens["ravi"], data={
            "content": "Avoid mixing zinc and ferrous sulphate in the same fertigation tank as they precipitate. Apply them 3 days apart for maximum plant uptake.",
            "parent_id": r2_id
        })
        # Likes & bookmarks
        api_call(f"/community/posts/{t1_id}/like", method="POST", token=tokens["manjunath"])
        api_call(f"/community/posts/{t1_id}/like", method="POST", token=tokens["chethan"])
        api_call(f"/community/posts/{t1_id}/save", method="POST", token=tokens["manjunath"])
        api_call(f"/community/posts/{t1_id}/save", method="POST", token=tokens["kavya"])
        print(f"  ✓ Thread 1 created (ID #{t1_id}) with 4 multi-party comments, likes, and bookmarks.")

    # Thread 2: Paddy Leaf Blast Disease
    t2_post = api_call("/community/posts", method="POST", token=tokens["ananya"], data={
        "title": "Spindle-shaped Leaf Spots on BPT 5204 Paddy in Guthalu",
        "content": "Observed brownish spindle-shaped lesions with grey centers on 45-day BPT 5204 (Sona Masoori) in our Guthalu fields following cloudy morning dew. Is this early blast or brown spot?",
        "topic": "pest_control",
        "crop_id": 2,
        "group_id": 2,
        "language": "kn"
    })
    t2_id = t2_post.get("id")
    if t2_id:
        api_call(f"/community/posts/{t2_id}/comments", method="POST", token=tokens["ravi"], data={
            "content": "Yes Ananya, classic Leaf Blast (Pyricularia oryzae) symptoms aggravated by morning dew and >85% humidity. Spray Tricyclazole 75 WP at 0.6g/L or Isoprothiolane 40 EC at 1.5ml/L immediately. Drain excess standing water for 48 hours to aerate roots."
        })
        api_call(f"/community/posts/{t2_id}/comments", method="POST", token=tokens["sowmya"], data={
            "content": "RSK Mandya and Maddur have certified Tricyclazole and biocontrol Pseudomonas fluorescens in stock at 50% subsidy under NFSM. Farmers in Guthalu can collect using your Aadhaar or AgriMitra ID."
        })
        api_call(f"/community/posts/{t2_id}/comments", method="POST", token=tokens["ananya"], data={
            "content": "Collected the bio-agent from RSK today! Applied along with neem oil. Thanks Sowmya and Dr. Ravi for the rapid help."
        })
        api_call(f"/community/posts/{t2_id}/like", method="POST", token=tokens["kavana"])
        api_call(f"/community/posts/{t2_id}/like", method="POST", token=tokens["chethan"])
        api_call(f"/community/posts/{t2_id}/save", method="POST", token=tokens["chethan"])
        print(f"  ✓ Thread 2 created (ID #{t2_id}) with diagnosis and subsidy pickup guidance.")

    # Thread 3: Ragi Drought Resilience & Combine Harvester Booking
    t3_post = api_call("/community/posts", method="POST", token=tokens["manjunath"], data={
        "title": "ML-365 Ragi Sowing Under Erratic Rainfall & Collective Combine Harvester Planning",
        "content": "Cultivating 3.5 acres of ML-365 finger millet with Jeevamrutha in Halaguru. The crop has excellent tillering even with deficit rain. Planning for harvesting in 45 days. Can farmers in Malavalli and Maddur pool acreage for a collective track combine harvester?",
        "topic": "machinery",
        "crop_id": 3,
        "group_id": 4,
        "language": "kn"
    })
    t3_id = t3_post.get("id")
    if t3_id:
        api_call(f"/community/posts/{t3_id}/comments", method="POST", token=tokens["kavya"], data={
            "content": "Great initiative Manjunath avare! In Melukote we hired a track combine last year at ₹2,200/hour by pooling 20 acres, saving 35% on transport and diesel."
        })
        api_call(f"/community/posts/{t3_id}/comments", method="POST", token=tokens["sowmya"], data={
            "content": "Raitha Samparka Kendra custom hiring center (CHC) has 2 combine harvesters available for block booking. I can reserve slots for Halaguru and Shivapura cluster."
        })
        api_call(f"/community/posts/{t3_id}/like", method="POST", token=tokens["kavana"])
        api_call(f"/community/posts/{t3_id}/like", method="POST", token=tokens["kavya"])
        api_call(f"/community/posts/{t3_id}/save", method="POST", token=tokens["kavana"])
        print(f"  ✓ Thread 3 created (ID #{t3_id}) on collective machinery sharing.")

    # Thread 4: Banana Bunch Propping Against Heavy Riverine Gusts
    t4_post = api_call("/community/posts", method="POST", token=tokens["chethan"], data={
        "title": "Banana Bunch Propping with Inverted-V Bamboo Against Pre-Monsoon Winds near Kaveri",
        "content": "Wind gusts reached 22 km/h yesterday along the riverbank in Ganjam. Two of our heavy Yelakki banana bunches suffered pseudostem breakage. Looking for tested bunch tying methods.",
        "topic": "cultivation",
        "crop_id": 4,
        "group_id": 5,
        "language": "kn"
    })
    t4_id = t4_post.get("id")
    if t4_id:
        api_call(f"/community/posts/{t4_id}/comments", method="POST", token=tokens["kavya"], data={
            "content": "In Pandavapura we tie two bamboo poles in an inverted-V shape right below the fruit peduncle and tie with coir rope. It resists up to 35 km/h gusts."
        })
        api_call(f"/community/posts/{t4_id}/comments", method="POST", token=tokens["ravi"], data={
            "content": "Additionally, apply 100g Muriate of Potash (MOP) per plant now. Potassium thickens the cell walls of pseudostem and prevents snapping."
        })
        api_call(f"/community/posts/{t4_id}/like", method="POST", token=tokens["ananya"])
        print(f"  ✓ Thread 4 created (ID #{t4_id}) on banana wind protection.")

    # Thread 5: Market Trends on Organic Produce Demand
    t5_post = api_call("/community/posts", method="POST", token=tokens["arjun"], data={
        "title": "APMC Market Update: High Demand for Cleaned Organic Jaggery & Ragi Grain",
        "content": "Retail organic outlets in Bengaluru are paying premium rates for chemical-free granulated jaggery and cleaned ML-365 ragi. Procurement price current range: Jaggery ₹4,800–₹5,200/quintal; Grade-A Ragi ₹3,600–₹3,850/quintal. We are offering direct farm-gate pickup for lots >10 quintals.",
        "topic": "market_trend",
        "language": "en"
    })
    t5_id = t5_post.get("id")
    if t5_id:
        api_call(f"/community/posts/{t5_id}/comments", method="POST", token=tokens["vijay"], data={
            "content": "Confirming this trend. Mysuru APMC wholesale prices are also firm. Moisture must be strictly below 12% for ragi to prevent mold during transit."
        })
        api_call(f"/community/posts/{t5_id}/comments", method="POST", token=tokens["priya"], data={
            "content": "Kaveri Food Processors is procuring 20 quintals of certified natural ragi for our malt line. Direct payment on pickup."
        })
        api_call(f"/community/posts/{t5_id}/comments", method="POST", token=tokens["manjunath"], data={
            "content": "I have 20 quintals of cleaned natural ragi ready next week! Will create a produce listing on the marketplace."
        })
        api_call(f"/community/posts/{t5_id}/like", method="POST", token=tokens["kavana"])
        api_call(f"/community/posts/{t5_id}/save", method="POST", token=tokens["manjunath"])
        print(f"  ✓ Thread 5 created (ID #{t5_id}) on APMC market prices.")

    # -------------------------------------------------------------
    # 6. Marketplace Listings, Enquiries & Negotiation Workflows
    # -------------------------------------------------------------
    print("\n[Phase 6] Creating authentic marketplace listings, enquiries, and negotiation threads...")

    # Listing 1: Kavana N (Sugarcane)
    l1_res = api_call("/market/listings", method="POST", token=tokens["kavana"], data={
        "crop_id": 1,
        "variety": "Co 86032 Organic Sugarcane",
        "quantity": 40.0,
        "unit": "quintal",
        "price_per_unit": 3250.0,
        "harvest_date": "2026-12-05T00:00:00Z",
        "available_from": "2026-11-25T00:00:00Z",
        "available_until": "2026-12-20T00:00:00Z",
        "taluk": "Maddur",
        "village": "Shivapura",
        "district": "Mandya",
        "pickup_address": "Shivapura Main Canal Gate, Maddur Taluk",
        "image_url": "/images/crops/sugarcane.jpg",
        "description": "Harvest ready, 12-month organically cultivated sugarcane from Shivapura canal command. Brix reading 21.5%, zero synthetic chemicals, ideal for export-grade chemical-free jaggery."
    })
    l1_id = l1_res.get("id")

    # Listing 2: Ananya Rao (Paddy)
    l2_res = api_call("/market/listings", method="POST", token=tokens["ananya"], data={
        "crop_id": 2,
        "variety": "BPT 5204 (Sona Masoori Deluxe)",
        "quantity": 60.0,
        "unit": "quintal",
        "price_per_unit": 2650.0,
        "harvest_date": "2026-11-30T00:00:00Z",
        "available_from": "2026-11-24T00:00:00Z",
        "available_until": "2026-12-15T00:00:00Z",
        "taluk": "Mandya",
        "village": "Guthalu",
        "district": "Mandya",
        "pickup_address": "Guthalu Central Warehouse, Mandya Taluk",
        "image_url": "/images/crops/paddy.jpg",
        "description": "Cleaned and sun-dried paddy with 11.5% moisture content. No broken grains, packed in 50kg moisture-proof gunny bags in Guthalu warehouse."
    })
    l2_id = l2_res.get("id")

    # Listing 3: Manjunath Swamy (Ragi)
    l3_res = api_call("/market/listings", method="POST", token=tokens["manjunath"], data={
        "crop_id": 3,
        "variety": "ML-365 Cleaned Finger Millet (ZBNF)",
        "quantity": 20.0,
        "unit": "quintal",
        "price_per_unit": 3800.0,
        "harvest_date": "2026-12-01T00:00:00Z",
        "available_from": "2026-11-26T00:00:00Z",
        "available_until": "2026-12-25T00:00:00Z",
        "taluk": "Malavalli",
        "village": "Halaguru",
        "district": "Mandya",
        "pickup_address": "Halaguru Main Road Farm Gate, Malavalli Taluk",
        "image_url": "/images/crops/ragi.jpg",
        "description": "Subhash Palekar natural farming certified finger millet grown with Jeevamrutha and desi Hallikar manure. Destoned, machine cleaned, 10% moisture."
    })
    l3_id = l3_res.get("id")

    # Listing 4: Kavya Gowda (Banana)
    l4_res = api_call("/market/listings", method="POST", token=tokens["kavya"], data={
        "crop_id": 4,
        "variety": "Yelakki Bale (Grade-A Scented)",
        "quantity": 1500.0,
        "unit": "kg",
        "price_per_unit": 42.0,
        "harvest_date": "2026-11-28T00:00:00Z",
        "available_from": "2026-11-25T00:00:00Z",
        "available_until": "2026-12-05T00:00:00Z",
        "taluk": "Pandavapura",
        "village": "Melukote",
        "district": "Mandya",
        "pickup_address": "Melukote Foothills Farm, Pandavapura Taluk",
        "image_url": "/images/crops/banana.jpg",
        "description": "Uniform bunch size, 7–8 hands per bunch, harvested at 80% maturity for optimal ripening and transport shelf life."
    })
    l4_id = l4_res.get("id")

    # Listing 5: Collective Sugarcane Listing (Group 1)
    l5_res = api_call("/market/listings", method="POST", token=tokens["kavana"], data={
        "crop_id": 1,
        "variety": "Collective Organic Sugarcane (Co 86032 & VCF 0517)",
        "quantity": 85.0,
        "unit": "quintal",
        "price_per_unit": 3200.0,
        "harvest_date": "2026-12-10T00:00:00Z",
        "available_from": "2026-12-01T00:00:00Z",
        "available_until": "2026-12-25T00:00:00Z",
        "taluk": "Maddur",
        "village": "Shivapura",
        "district": "Mandya",
        "pickup_address": "Shivapura APMC Sub-Yard, Maddur Taluk",
        "is_collective": True,
        "group_id": 1,
        "image_url": "/images/crops/sugarcane.jpg",
        "description": "Collective farmer harvest pooled from Maddur Sugarcane Growers Forum members. Bulk direct supply for jaggery processing."
    })
    l5_id = l5_res.get("id")
    if l5_id:
        # Chethan Kumar contributes 40 quintals to collective listing
        api_call(f"/market/listings/{l5_id}/contribute", method="POST", token=tokens["chethan"], data={
            "quantity": 40.0,
            "unit": "quintal",
            "notes": "Co 86032 ratoon harvest from Ganjam riverine plots"
        })
        print(f"  ✓ Collective Listing #{l5_id} created with Chethan Kumar contribution.")

    # Save bookmarks
    if l1_id: api_call(f"/market/listings/{l1_id}/save", method="POST", token=tokens["vijay"])
    if l3_id: api_call(f"/market/listings/{l3_id}/save", method="POST", token=tokens["priya"])

    # Enquiry 1: Vijay Kumar on Kavana's Sugarcane (Accepted negotiation)
    if l1_id:
        e1 = api_call("/market/enquiries", method="POST", token=tokens["vijay"], data={
            "listing_id": l1_id,
            "quantity_requested": 25.0,
            "offered_price": 3100.0,
            "message": "We can procure 25 quintals for Bengaluru organic jaggery unit. Can you consider ₹3,100 per quintal with farm gate collection?"
        })
        e1_id = e1.get("id")
        if e1_id:
            api_call(f"/market/enquiries/{e1_id}/messages", method="POST", token=tokens["kavana"], data={
                "message": "Thank you Vijay avare. Considering the high brix and certified organic practices, the best we can offer is ₹3,180 per quintal.",
                "proposed_price": 3180.0
            })
            api_call(f"/market/enquiries/{e1_id}/messages", method="POST", token=tokens["vijay"], data={
                "message": "Agreed at ₹3,180 per quintal for 25 quintals. Our transport truck will arrive on Saturday morning.",
                "proposed_price": 3180.0
            })
            api_call(f"/market/enquiries/{e1_id}/messages", method="POST", token=tokens["kavana"], data={
                "message": "Confirmed! Deal accepted. Looking forward to the Saturday pickup."
            })
            print(f"  ✓ Enquiry #{e1_id} completed: Vijay Kumar & Kavana N negotiated ₹3,180/quintal.")

    # Enquiry 2: Arjun Traders on Ananya's Paddy (Pending negotiation)
    if l2_id:
        e2 = api_call("/market/enquiries", method="POST", token=tokens["arjun"], data={
            "listing_id": l2_id,
            "quantity_requested": 40.0,
            "offered_price": 2550.0,
            "message": "Interested in 40 quintals for Mysuru wholesale distribution. Offering ₹2,550 per quintal."
        })
        e2_id = e2.get("id")
        if e2_id:
            api_call(f"/market/enquiries/{e2_id}/messages", method="POST", token=tokens["ananya"], data={
                "message": "Can supply at ₹2,600 per quintal if you handle loading from Guthalu godown.",
                "proposed_price": 2600.0
            })
            print(f"  ✓ Enquiry #{e2_id} created: Arjun Traders & Ananya Rao active negotiation.")

    # Enquiry 3: Priya Dharshini on Manjunath's Ragi (Accepted)
    if l3_id:
        e3 = api_call("/market/enquiries", method="POST", token=tokens["priya"], data={
            "listing_id": l3_id,
            "quantity_requested": 15.0,
            "offered_price": 3750.0,
            "message": "We require 15 quintals for our organic ragi malt and flour line in Srirangapatna. Offering ₹3,750 with immediate payment upon moisture testing."
        })
        e3_id = e3.get("id")
        if e3_id:
            api_call(f"/market/enquiries/{e3_id}/messages", method="POST", token=tokens["manjunath"], data={
                "message": "Accepted! The grain moisture is 10.2%. You are welcome to inspect and pick up from Halaguru.",
                "proposed_price": 3750.0
            })
            print(f"  ✓ Enquiry #{e3_id} completed: Priya Dharshini & Manjunath Swamy deal accepted.")

    # Enquiry 4: Arjun Traders on Kavya's Banana (Pending)
    if l4_id:
        e4 = api_call("/market/enquiries", method="POST", token=tokens["arjun"], data={
            "listing_id": l4_id,
            "quantity_requested": 1000.0,
            "offered_price": 40.0,
            "message": "We can lift 1,000 kg directly from Melukote for fresh fruit retail chains in Bengaluru at ₹40/kg."
        })
        print(f"  ✓ Enquiry #{e4.get('id')} created: Arjun Traders on Yelakki Banana.")

    # -------------------------------------------------------------
    # 7. Support Tickets & Content Moderation Workflow
    # -------------------------------------------------------------
    print("\n[Phase 7] Submitting support tickets and executing moderation workflow...")

    # Ticket 1: Kavya Gowda
    tkt1 = api_call("/support/tickets", method="POST", token=tokens["kavya"], data={
        "category": "crop_advisory",
        "subject": "Request for Micro-Nutrient Fertigation Protocol for Melukote Banana",
        "description": "Need specific dosage guidance for potassium and boron for Yelakki banana on red sandy loam under borewell irrigation."
    })
    tkt1_id = tkt1.get("id")
    if tkt1_id:
        # Admin resolves ticket
        api_call(f"/admin/support-tickets/{tkt1_id}", method="PATCH", token=admin_token, data={
            "status": "resolved",
            "resolution_notes": "Senior agronomist Dr. Ravi Kumar has uploaded the micro-nutrient protocol to Crop Library (Banana #4). Follow 5g Solubor + 100g MOP per plant."
        })
        print(f"  ✓ Support Ticket #{tkt1_id} resolved with notes by Admin.")

    # Ticket 2: Arjun Traders
    tkt2 = api_call("/support/tickets", method="POST", token=tokens["arjun"], data={
        "category": "market_dispute",
        "subject": "APMC Weighbridge Tare Weight Deduction Standards",
        "description": "Seeking clarification on Mandya district APMC standard tare weight deduction for 50kg jute gunny bags on bulk paddy consignments."
    })
    tkt2_id = tkt2.get("id")
    if tkt2_id:
        api_call(f"/admin/support-tickets/{tkt2_id}", method="PATCH", token=admin_token, data={
            "status": "in_progress",
            "resolution_notes": "Forwarded to Mandya APMC market secretary for formal circular verification."
        })
        print(f"  ✓ Support Ticket #{tkt2_id} marked in-progress by Admin.")

    # Content Report: Chethan Kumar reports an inappropriate advertising attempt
    if t1_id:
        rpt = api_call(f"/community/posts/{t1_id}/report", method="POST", token=tokens["chethan"], data={
            "reason": "commercial_ad",
            "details": "User posted third-party chemical fertilizer brand commercial link in discussion comments."
        })
        rpt_id = rpt.get("id")
        if rpt_id:
            # Admin reviews and resolves report
            api_call(f"/admin/reports/{rpt_id}/resolve", method="PATCH", token=admin_token, data={
                "action": "warn_author",
                "notes": "Reviewed and resolved by Admin. Commercial link removed from thread; user notified of platform discussion rules."
            })
            print(f"  ✓ Content Report #{rpt_id} reviewed and resolved by Admin with audit log entry.")

    print("\n" + "=" * 70)
    print("ALL 11 ACCOUNTS & INTERCONNECTED WORKFLOWS SUCCESSFULLY POPULATED!")
    print("=" * 70)

if __name__ == "__main__":
    main()
