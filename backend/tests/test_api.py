import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from app.core.database import Base
from app.db.seed import seed_database
from app.models.models import User, MarketListing, MarketEnquiry, Notification, ContentReport
from app.core.security import get_password_hash, create_access_token
from app.core.auth import get_current_user, get_current_admin

# Endpoint handlers
from app.api.health import get_health
from app.api.locations import get_locations, get_location_hierarchy
from app.api.crops import get_crops, get_my_crops, add_my_crop, update_my_crop, delete_my_crop, get_crop_by_id
from app.api.weather import get_current_weather, get_7day_forecast
from app.api.advisory import get_advisories, get_advisory_by_id, get_recommendations, diagnose_crop_disease
from app.api.community import (
    get_community_groups, get_community_posts, create_community_post,
    get_community_post_detail, toggle_post_like, toggle_post_save, report_post,
    get_post_comments, create_post_comment, create_community_group,
    get_community_group_detail, join_community_group, get_group_join_requests,
    approve_join_request, reject_join_request, get_group_members,
    remove_group_member, get_group_announcements,
    create_group_announcement
)
from app.api.market import (
    get_market_listings, create_market_listing, get_market_listing_detail,
    update_market_listing, update_listing_status, delete_market_listing,
    toggle_save_listing, contribute_to_collective_listing,
    get_market_enquiries, create_market_enquiry, get_enquiry_detail,
    update_enquiry_status, send_enquiry_message
)
from app.api.notifications import (
    get_notifications, mark_notification_read, mark_all_notifications_read,
    get_notification_preferences, update_notification_preferences
)
from app.api.profile import get_profile, update_profile
from app.api.support import create_support_ticket, get_user_support_tickets
from app.api.admin import (
    get_platform_stats, get_admin_users, update_user_status, update_user_badges,
    get_content_reports, resolve_content_report, dismiss_content_report,
    get_admin_groups, update_group_status, get_admin_crops, create_admin_crop,
    update_admin_crop, get_admin_support_tickets, update_admin_support_ticket,
    get_audit_logs
)
from app.api.auth import (
    register, login, verify_otp, resend_otp, forgot_password, reset_password,
    update_onboarding, switch_role
)
from app.schemas.schemas import (
    AuthTokenRequest, CommunityPostCreate, MarketListingCreate, MarketListingUpdate,
    MarketEnquiryCreate, MarketEnquiryStatusUpdate, EnquiryMessageCreate,
    GroupListingContributionCreate, UserRegisterRequest, UserLoginRequest,
    OtpVerifyRequest, OtpResendRequest, ForgotPasswordRequest, ResetPasswordRequest,
    OnboardingUpdateRequest, OnboardingLocationInput, RoleSwitchRequest,
    UserCropCreate, UserCropUpdate, DiseaseDiagnosisRequest, CommunityGroupCreate,
    PostCommentCreate, ContentReportCreate, GroupAnnouncementCreate, GroupMemberRoleUpdate,
    UserProfileUpdateRequest, UserNotificationPreferenceUpdate, SupportTicketCreate,
    SupportTicketStatusUpdate, AdminUserUpdate, AdminUserBadgeUpdate,
    AdminReportResolveRequest, AdminGroupStatusUpdate, AdminCropCreate, AdminCropUpdate
)

# Safe In-Memory SQLite test database - guarantees PostgreSQL live database is never dropped or mutated
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=test_engine)
    db = TestSessionLocal()
    seed_database(db)
    yield db
    db.close()
    Base.metadata.drop_all(bind=test_engine)

def test_health(db_session):
    res = get_health(db_session)
    assert res.status == "ok"
    assert res.app == "AgriMitra API"
    assert res.database == "connected"

def test_locations(db_session):
    locations = get_locations(db_session)
    assert len(locations) >= 7
    taluks = [loc.taluk for loc in locations]
    assert "Mandya" in taluks
    assert "Maddur" in taluks
    assert "Malavalli" in taluks

def test_location_hierarchy():
    hierarchy = get_location_hierarchy()
    assert "Karnataka" in hierarchy
    assert "Mandya" in hierarchy["Karnataka"]
    assert "Maddur" in hierarchy["Karnataka"]["Mandya"]
    assert "Koppa" in hierarchy["Karnataka"]["Mandya"]["Maddur"]
    assert "Shivapura" in hierarchy["Karnataka"]["Mandya"]["Maddur"]["Kasaba"]

def test_crops(db_session):
    crops = get_crops(db_session)
    assert len(crops) >= 6
    names_kn = [c.name_kn for c in crops]
    assert any("ಕಬ್ಬು" in n for n in names_kn)
    assert any("ಭತ್ತ" in n for n in names_kn)

def test_my_crops(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    my_crops = get_my_crops(db=db_session, current_user=farmer)
    assert len(my_crops) >= 1
    assert my_crops[0].acreage > 0

def test_weather(db_session):
    weather = get_current_weather(taluk="Mandya", db=db_session)
    assert weather.temperature_c > 0
    assert "Mandya" in weather.forecast_summary_en
    assert len(weather.forecast_summary_kn) > 0

def test_advisories(db_session):
    advisories = get_advisories(crop_id=None, severity=None, db=db_session)
    assert len(advisories) >= 2
    first_adv = advisories[0]
    assert first_adv.title_en != ""

def test_community(db_session):
    groups = get_community_groups(taluk=None, db=db_session)
    assert len(groups) >= 2
    posts = get_community_posts(group_id=None, db=db_session)
    assert len(posts) >= 1

def test_marketplace(db_session):
    listings = get_market_listings(crop_id=None, status="active", db=db_session)
    assert len(listings) >= 2

def test_notifications(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    notifs = get_notifications(db=db_session, current_user=farmer)
    assert len(notifs) >= 1

def test_auth_login_bcrypt(db_session):
    res = login(UserLoginRequest(identifier="9845012345", password="Password@123"), db=db_session)
    assert res.access_token is not None
    assert len(res.access_token) > 20
    assert res.user.phone_number == "9845012345"

def test_auth_login_invalid_password_raises_401(db_session):
    with pytest.raises(HTTPException) as exc_info:
        login(UserLoginRequest(identifier="9845012345", password="WrongPassword999"), db=db_session)
    assert exc_info.value.status_code == 401

def test_auth_register_and_uniqueness(db_session):
    phone = "9845099999"
    email = "pilot.farmer@mandya.org"

    # Clean existing if needed
    existing = db_session.query(User).filter((User.phone_number == phone) | (User.email == email)).first()
    if existing:
        db_session.delete(existing)
        db_session.commit()

    res = register(
        UserRegisterRequest(
            full_name="Mandya Pilot User",
            email=email,
            phone_number=phone,
            password="SecurePassword123",
            preferred_language="kn",
            role="farmer",
            taluk="Maddur",
            village="Shivapura"
        ),
        db=db_session
    )
    assert res.user.phone_number == phone
    assert res.user.email == email
    assert res.access_token is not None

    # Test duplicate registration rejection (both mobile and email)
    with pytest.raises(HTTPException) as exc_phone:
        register(
            UserRegisterRequest(
                full_name="Duplicate Phone User",
                email="another.email@example.com",
                phone_number=phone,
                password="SecurePassword123"
            ),
            db=db_session
        )
    assert exc_phone.value.status_code == 400

    with pytest.raises(HTTPException) as exc_email:
        register(
            UserRegisterRequest(
                full_name="Duplicate Email User",
                email=email,
                phone_number="9845088888",
                password="SecurePassword123"
            ),
            db=db_session
        )
    assert exc_email.value.status_code == 400

def test_auth_onboarding_and_role_switch(db_session):
    user = db_session.query(User).filter(User.phone_number == "9845099999").first()
    req = OnboardingUpdateRequest(
        role="both",
        location=OnboardingLocationInput(
            state="Karnataka",
            district="Mandya",
            taluk="Maddur",
            hobli="Koppa",
            village="Besagarahalli",
            pincode="571419"
        ),
        crop_ids=[1, 2],
        farm_size_acres=4.5,
        farming_type="organic",
        irrigation_source="drip",
        buyer_business_name="Maddur Cane & Grains",
        buyer_type="wholesaler",
        is_completed=True
    )
    updated_user = update_onboarding(req, db=db_session, current_user=user)
    assert updated_user.roles == "both"
    assert updated_user.is_onboarded is True

    # Test role switch
    swapped = switch_role(RoleSwitchRequest(active_role="buyer"), db=db_session, current_user=updated_user)
    assert swapped.active_role == "buyer"

    swapped2 = switch_role(RoleSwitchRequest(active_role="farmer"), db=db_session, current_user=updated_user)
    assert swapped2.active_role == "farmer"

def test_forgot_and_reset_password(db_session):
    phone = "9845012345"
    f_res = forgot_password(ForgotPasswordRequest(identifier=phone), db=db_session)
    assert f_res["status"] == "ok"

    # Fetch token stored on user
    user = db_session.query(User).filter(User.phone_number == phone).first()
    assert user.reset_token is not None

    r_res = reset_password(
        ResetPasswordRequest(token=user.reset_token, new_password="NewPassword456"),
        db=db_session
    )
    assert r_res["status"] == "ok"

    # Verify user can log in with new password
    login_res = login(UserLoginRequest(identifier=phone, password="NewPassword456"), db=db_session)
    assert login_res.access_token is not None

def test_f2_crops_crud_and_detail(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    crops = get_crops(category="cereal", search=None, db=db_session)
    assert len(crops) >= 2

    crop_detail = get_crop_by_id(1, db=db_session)
    assert crop_detail.code == "SUGARCANE"
    assert crop_detail.growth_stages_json is not None

    # User Crop CRUD with authenticated farmer
    new_uc = add_my_crop(
        UserCropCreate(crop_id=3, acreage=2.5, stage="tillering", soil_type="red sandy loam", irrigation_type="rainfed"),
        db=db_session,
        current_user=farmer
    )
    assert new_uc.acreage == 2.5
    assert new_uc.stage == "tillering"

    updated_uc = update_my_crop(
        new_uc.id,
        UserCropUpdate(acreage=3.0, stage="flowering"),
        db=db_session,
        current_user=farmer
    )
    assert updated_uc.acreage == 3.0

    del_res = delete_my_crop(new_uc.id, db=db_session, current_user=farmer)
    assert del_res["status"] == "success"

def test_f2_weather_forecast_and_recommendations(db_session):
    current_w = get_current_weather(taluk="Maddur", db=db_session)
    assert current_w.temperature_c > 0
    assert current_w.humidity_percent > 0

    forecast = get_7day_forecast(taluk="Maddur", db=db_session)
    assert len(forecast.forecast_days) == 7

    recommendations = get_recommendations(db=db_session)
    assert len(recommendations) >= 2

def test_f2_disease_diagnosis_assistant():
    diag = diagnose_crop_disease(
        DiseaseDiagnosisRequest(
            crop_id=2,
            plant_part="leaf",
            symptoms="spindle shaped brown lesions with ash centers on leaf blade"
        )
    )
    assert "Blast" in diag.suspected_disease_en
    assert diag.is_ai_preview is True
    assert diag.confidence_score > 0.8

def test_f3_community_forum(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    new_post = create_community_post(
        CommunityPostCreate(
            title="Bio-digester slurry trial results for Banana",
            content="We observed 15% better bunch weight using cow-urine enriched slurry in Malavalli.",
            topic="cultivation",
            crop_id=4,
            language="en"
        ),
        db=db_session,
        current_user=farmer
    )
    assert new_post.id is not None
    assert new_post.topic == "cultivation"

    detail = get_community_post_detail(new_post.id, db=db_session)
    assert detail.title == new_post.title

    like_res1 = toggle_post_like(new_post.id, db=db_session, current_user=farmer)
    assert like_res1["is_liked"] is True

    save_res1 = toggle_post_save(new_post.id, db=db_session, current_user=farmer)
    assert save_res1["is_saved"] is True

    comment = create_post_comment(
        new_post.id,
        PostCommentCreate(content="What ratio of water to slurry did you maintain?"),
        db=db_session,
        current_user=farmer
    )
    assert comment.id is not None

    report = report_post(
        new_post.id,
        ContentReportCreate(reason="misleading_advice", details="Verification check"),
        db=db_session,
        current_user=farmer
    )
    assert report.id is not None

def test_f3_village_groups(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    new_grp = create_community_group(
        CommunityGroupCreate(
            name_en="K.R. Pet Horticulture Society",
            name_kn="ಕೆ.ಆರ್. ಪೇಟೆ ತೋಟಗಾರಿಕೆ ಸಂಘ",
            taluk="Krishnarajpet",
            village="Santhebachahalli",
            crop_id=6,
            description_en="Peer forum for tomato and vegetable growers in K.R. Pet taluk."
        ),
        db=db_session,
        current_user=farmer
    )
    assert new_grp.id is not None
    assert new_grp.taluk == "Krishnarajpet"

    groups = get_community_groups(taluk="Krishnarajpet", db=db_session)
    assert any(g.id == new_grp.id for g in groups)

    announcement = create_group_announcement(
        new_grp.id,
        GroupAnnouncementCreate(
            title="Polyhouse Tomato Subsidy Camp",
            content="K.R. Pet Taluk Horticulture Department is organizing a subsidy consultation on Friday.",
            priority="urgent"
        ),
        db=db_session,
        current_user=farmer
    )
    assert announcement.id is not None

def test_f4_farmer_produce_listing(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    new_listing = create_market_listing(
        MarketListingCreate(
            crop_id=5,
            variety="Maddur Green Hybrid",
            quantity=1500.0,
            unit="piece",
            price_per_unit=35.0,
            taluk="Maddur",
            village="Shivapura",
            pickup_address="Shivapura Canal Bank Farm",
            description="High water volume sweet coconuts harvested fresh."
        ),
        db=db_session,
        current_user=farmer
    )
    assert new_listing.id is not None
    assert new_listing.variety == "Maddur Green Hybrid"

    updated = update_market_listing(
        new_listing.id,
        MarketListingUpdate(price_per_unit=36.0, quantity=1400.0),
        db=db_session,
        current_user=farmer
    )
    assert updated.price_per_unit == 36.0

    pause_res = update_listing_status(new_listing.id, status="paused", db=db_session, current_user=farmer)
    assert pause_res["listing_status"] == "paused"

    reactivate_res = update_listing_status(new_listing.id, status="active", db=db_session, current_user=farmer)
    assert reactivate_res["listing_status"] == "active"

    save_res = toggle_save_listing(new_listing.id, db=db_session, current_user=farmer)
    assert save_res["is_saved"] is True

    saved_listings = get_market_listings(filter_type="saved", db=db_session, current_user=farmer)
    assert any(l.id == new_listing.id for l in saved_listings)

def test_f4_buyer_enquiry_and_negotiation(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    buyer = db_session.query(User).filter(User.role == "buyer").first()
    assert buyer is not None

    target = db_session.query(MarketListing).filter(MarketListing.farmer_id == farmer.id, MarketListing.status == "active").first()
    assert target is not None

    # Buyer creates enquiry
    enquiry = create_market_enquiry(
        MarketEnquiryCreate(
            listing_id=target.id,
            quantity_requested=20.0,
            offered_price=target.price_per_unit - 5.0,
            message="Wholesale purchase for Bangalore APMC market."
        ),
        db=db_session,
        current_user=buyer
    )
    assert enquiry.id is not None
    assert enquiry.status == "pending"

    # Farmer sends message
    msg = send_enquiry_message(
        enquiry.id,
        EnquiryMessageCreate(
            message="We can do ₹2 discount per unit for immediate pickup.",
            proposed_price=target.price_per_unit - 2.0
        ),
        db=db_session,
        current_user=farmer
    )
    assert msg.id is not None

    # Farmer accepts enquiry
    accepted = update_enquiry_status(
        enquiry.id,
        MarketEnquiryStatusUpdate(status="accepted"),
        db=db_session,
        current_user=farmer
    )
    assert accepted.status == "accepted"

def test_cross_user_isolation_security(db_session):
    """
    CRITICAL: Verify data isolation between distinct users.
    1. Unauthorized user cannot view another user's private enquiry (403).
    2. Unauthorized farmer cannot modify another farmer's listing (403).
    3. Unauthorized farmer cannot delete another farmer's crop (403).
    4. Non-admin user cannot access admin stats (403).
    """
    farmer_a = db_session.query(User).filter(User.phone_number == "9845012345").first()
    buyer_b = db_session.query(User).filter(User.role == "buyer").first()
    farmer_c = db_session.query(User).filter(User.phone_number == "9845033333").first()

    # Create an enquiry between farmer_a and buyer_b
    listing = db_session.query(MarketListing).filter(MarketListing.farmer_id == farmer_a.id, MarketListing.status == "active").first()
    enquiry = create_market_enquiry(
        MarketEnquiryCreate(
            listing_id=listing.id,
            quantity_requested=10.0,
            offered_price=listing.price_per_unit,
            message="Private deal test"
        ),
        db=db_session,
        current_user=buyer_b
    )

    # 1. Farmer C attempts to view private enquiry of Farmer A & Buyer B -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_enquiry:
        get_enquiry_detail(enquiry_id=enquiry.id, db=db_session, current_user=farmer_c)
    assert exc_enquiry.value.status_code == 403

    # 2. Farmer C attempts to edit Farmer A's produce listing -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_listing:
        update_market_listing(
            listing_id=listing.id,
            payload=MarketListingUpdate(price_per_unit=999.0),
            db=db_session,
            current_user=farmer_c
        )
    assert exc_listing.value.status_code == 403

    # 3. Farmer C attempts to delete Farmer A's produce listing -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_del_listing:
        delete_market_listing(
            listing_id=listing.id,
            db=db_session,
            current_user=farmer_c
        )
    assert exc_del_listing.value.status_code == 403

    # 4. Farmer C attempts to access admin platform stats -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_admin:
        get_platform_stats(admin=farmer_c, db=db_session)
    assert exc_admin.value.status_code == 403

def test_f5_notifications_and_preferences(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    notifs = get_notifications(type="all", unread_only=False, db=db_session, current_user=farmer)
    assert len(notifs) >= 1
    target_notif = notifs[0]

    read_notif = mark_notification_read(target_notif.id, db=db_session, current_user=farmer)
    assert read_notif.is_read is True

    res = mark_all_notifications_read(db=db_session, current_user=farmer)
    assert res["status"] == "success"

    prefs = get_notification_preferences(db=db_session, current_user=farmer)
    assert prefs.user_id == farmer.id

    updated_prefs = update_notification_preferences(
        UserNotificationPreferenceUpdate(advisory_alerts=True, community_updates=False),
        db=db_session,
        current_user=farmer
    )
    assert updated_prefs.community_updates is False
    assert updated_prefs.advisory_alerts is True

def test_f5_user_profile_and_settings(db_session):
    user = db_session.query(User).filter(User.phone_number == "9845012345").first()
    updated = update_profile(
        UserProfileUpdateRequest(
            full_name="Ramesh Gowda Mandya",
            bio="Leading zero-budget natural farming demonstration plot in Shivapura.",
            email="ramesh.gowda@mandya.org",
            text_size="large",
            data_saver=True,
            phone_visible=False,
            farm_size_acres=4.5,
            farming_type="natural"
        ),
        db=db_session,
        current_user=user
    )
    assert updated.full_name == "Ramesh Gowda Mandya"
    assert updated.text_size == "large"
    assert updated.data_saver is True

def test_f5_support_tickets(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    ticket = create_support_ticket(
        SupportTicketCreate(
            category="app_issue",
            subject="Weather forecast sync delay in Halaguru",
            description="Weather forecast takes about 3 seconds to sync when switching to Halaguru village."
        ),
        db=db_session,
        current_user=farmer
    )
    assert ticket.id is not None
    assert ticket.status == "open"
    assert ticket.user_id == farmer.id

    user_tickets = get_user_support_tickets(db=db_session, current_user=farmer)
    assert any(t.id == ticket.id for t in user_tickets)

def test_f5_admin_authorization_and_management(db_session):
    farmer = db_session.query(User).filter(User.phone_number == "9845012345").first()
    admin = db_session.query(User).filter(User.is_admin == True).first()
    assert admin is not None

    # Farmer is rejected from admin endpoint
    with pytest.raises(HTTPException) as excinfo:
        get_platform_stats(admin=farmer, db=db_session)
    assert excinfo.value.status_code == 403

    # Admin accesses stats successfully
    stats = get_platform_stats(admin=admin, db=db_session)
    assert stats.total_users >= 3

    # Moderate user badge
    user_to_moderate = db_session.query(User).filter(User.phone_number == "9845098765").first()
    updated_user = update_user_badges(
        user_to_moderate.id,
        AdminUserBadgeUpdate(is_verified=True, is_expert=True),
        admin=admin,
        db=db_session
    )
    assert updated_user.is_verified is True
    assert updated_user.is_expert is True

    # Audit logs
    audit_logs = get_audit_logs(admin=admin, db=db_session)
    assert len(audit_logs) >= 1
