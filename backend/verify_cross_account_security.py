"""
AgriMitra - Cross-Account Authorization & Security Verification Suite
Tests multi-user isolation, role-based access control, privacy boundaries, and administrative guards.
"""
import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api(endpoint: str, method: str = "GET", data: dict = None, token: str = None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            try:
                return resp.status, json.loads(content) if content else {}
            except Exception:
                return resp.status, {"raw": content}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {"raw": content}

def login(identifier, password):
    code, res = api("/auth/login", method="POST", data={"identifier": identifier, "password": password})
    if code != 200:
        raise RuntimeError(f"Login failed for {identifier}: {code} -> {res}")
    return res["access_token"], res["user"]

def run_tests():
    print("=" * 70)
    print("AgriMitra: Cross-Account Authorization & Security Verification")
    print("=" * 70)

    # 1. Authenticate Personas
    print("\n[Step 1] Authenticating Personas...")
    admin_token, admin_user = login("admin@agrimitra.gov.in", "Admin@123")
    kavana_token, kavana_user = login("kavana.farmer@example.com", "KavanaFarmer@2026")
    ananya_token, ananya_user = login("ananya.farmer@example.com", "AnanyaFarmer@2026")
    vijay_token, vijay_user = login("vijay.buyer@example.com", "VijayBuyer@2026")
    arjun_token, arjun_user = login("arjun.buyer@example.com", "ArjunBuyer@2026")
    ravi_token, ravi_user = login("ravi.extension@agrimitra.gov.in", "RaviOfficer@2026")
    print("  ✓ All 6 test personas successfully authenticated.")

    passed_tests = 0
    total_tests = 0

    def assert_status(desc, expected_code, actual_code, details=""):
        nonlocal passed_tests, total_tests
        total_tests += 1
        if actual_code == expected_code:
            passed_tests += 1
            print(f"  ✓ PASS: {desc} (HTTP {actual_code})")
            return True
        else:
            print(f"  ✗ FAIL: {desc} (Expected {expected_code}, got {actual_code} | {details})")
            return False

    # -----------------------------------------------------------------
    # Test Suite 1: Admin Route Protection (RBAC)
    # -----------------------------------------------------------------
    print("\n[Suite 1] Role-Based Access Control: Admin Route Protection")
    
    # 1.1 Non-admin (Kavana - Farmer) calls /admin/stats
    code, res = api("/admin/stats", token=kavana_token)
    assert_status("Farmer blocked from /admin/stats", 403, code, res)

    # 1.2 Non-admin (Vijay - Buyer) calls /admin/users
    code, res = api("/admin/users", token=vijay_token)
    assert_status("Buyer blocked from /admin/users", 403, code, res)

    # 1.3 Staff member (Dr. Ravi - Expert) calls /admin/stats
    code, res = api("/admin/stats", token=ravi_token)
    assert_status("Extension Staff blocked from /admin/stats without admin role", 403, code, res)

    # 1.4 Genuine Admin calls /admin/stats
    code, res = api("/admin/stats", token=admin_token)
    assert_status("Admin granted access to /admin/stats", 200, code, res)

    # -----------------------------------------------------------------
    # Test Suite 2: Marketplace Produce Listing Isolation & Ownership
    # -----------------------------------------------------------------
    print("\n[Suite 2] Produce Listing Ownership & Mutation Protection")

    # Fetch listings to find Ananya's listing ID
    code, listings = api("/market/listings", token=kavana_token)
    ananya_listings = [l for l in listings if l.get("farmer_id") == ananya_user["id"]]
    kavana_listings = [l for l in listings if l.get("farmer_id") == kavana_user["id"]]
    
    if ananya_listings:
        ananya_lid = ananya_listings[0]["id"]
        # 2.1 Kavana attempts to modify Ananya's listing price
        code, res = api(f"/market/listings/{ananya_lid}", method="PUT", token=kavana_token, data={
            "price_per_unit": 999.0,
            "quantity": 1.0
        })
        assert_status("Farmer A cannot update Farmer B's marketplace listing", 403, code, res)

        # 2.2 Vijay (Buyer) attempts to delete Ananya's listing
        code, res = api(f"/market/listings/{ananya_lid}", method="DELETE", token=vijay_token)
        assert_status("Buyer cannot delete Farmer's marketplace listing", 403, code, res)

    if kavana_listings:
        kavana_lid = kavana_listings[0]["id"]
        # 2.3 Kavana updates her own listing
        code, res = api(f"/market/listings/{kavana_lid}", method="PUT", token=kavana_token, data={
            "description": "Updated description by legitimate owner Kavana N."
        })
        assert_status("Farmer can update their own produce listing", 200, code, res)

    # -----------------------------------------------------------------
    # Test Suite 3: Buyer Enquiry & Negotiation Privacy Isolation
    # -----------------------------------------------------------------
    print("\n[Suite 3] Market Enquiry Privacy & Unauthorized Message Injection")

    # Fetch Vijay's enquiries
    code, vijay_enquiries = api("/market/enquiries", token=vijay_token)
    if isinstance(vijay_enquiries, list) and len(vijay_enquiries) > 0:
        vijay_eid = vijay_enquiries[0]["id"]

        # 3.1 Arjun (unrelated buyer) attempts to read Vijay's private enquiry
        code, res = api(f"/market/enquiries/{vijay_eid}", token=arjun_token)
        assert_status("Unrelated Buyer B blocked from reading Buyer A's enquiry", 403, code, res)

        # 3.2 Arjun attempts to post a message into Vijay's negotiation thread
        code, res = api(f"/market/enquiries/{vijay_eid}/messages", method="POST", token=arjun_token, data={
            "message": "Hijacking negotiation thread!"
        })
        assert_status("Unrelated Buyer B blocked from injecting message into Buyer A's enquiry", 403, code, res)

        # 3.3 Genuine parties (Vijay and Kavana) can view and exchange messages
        code, res = api(f"/market/enquiries/{vijay_eid}", token=vijay_token)
        assert_status("Legitimate Buyer A can view their own enquiry thread", 200, code, res)

    # -----------------------------------------------------------------
    # Test Suite 4: Community Post & Content Ownership
    # -----------------------------------------------------------------
    print("\n[Suite 4] Community Discussion Post & Comment Moderation Guards")

    code, posts = api("/community/posts", token=kavana_token)
    ananya_posts = [p for p in posts if p.get("author_id") == ananya_user["id"]]
    
    if ananya_posts:
        ananya_pid = ananya_posts[0]["id"]
        # 4.1 Kavana attempts to edit Ananya's forum post
        code, res = api(f"/community/posts/{ananya_pid}", method="PUT", token=kavana_token, data={
            "title": "Hacked post title"
        })
        assert_status("Farmer A cannot edit Farmer B's forum post", 403, code, res)

        # 4.2 Kavana attempts to delete Ananya's forum post
        code, res = api(f"/community/posts/{ananya_pid}", method="DELETE", token=kavana_token)
        assert_status("Farmer A cannot delete Farmer B's forum post", 403, code, res)

    # -----------------------------------------------------------------
    # Test Suite 5: Notification Isolation
    # -----------------------------------------------------------------
    print("\n[Suite 5] Personal Notification Data Privacy")

    code, kavana_notifs = api("/notifications", token=kavana_token)
    code, ananya_notifs = api("/notifications", token=ananya_token)
    
    kavana_ids = {n["id"] for n in kavana_notifs} if isinstance(kavana_notifs, list) else set()
    ananya_ids = {n["id"] for n in ananya_notifs} if isinstance(ananya_notifs, list) else set()
    overlap = kavana_ids.intersection(ananya_ids)
    
    total_tests += 1
    if len(overlap) == 0:
        passed_tests += 1
        print(f"  ✓ PASS: Zero overlap between Kavana's ({len(kavana_ids)}) and Ananya's ({len(ananya_ids)}) notifications.")
    else:
        print(f"  ✗ FAIL: Leak detected! Notification IDs {overlap} appear in both accounts.")

    # -----------------------------------------------------------------
    # Summary
    # -----------------------------------------------------------------
    print("\n" + "=" * 70)
    print(f"SECURITY & ISOLATION RESULTS: {passed_tests}/{total_tests} PASSED ({passed_tests*100//total_tests}%)")
    print("=" * 70)
    
    if passed_tests != total_tests:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
