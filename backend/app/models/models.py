import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(100), default="Karnataka", nullable=False)
    district = Column(String(100), default="Mandya", nullable=False, index=True)
    taluk = Column(String(100), nullable=False, index=True) # e.g. Malavalli, Maddur, Pandavapura
    hobli = Column(String(100), nullable=True, index=True) # e.g. Kasaba, Koppa, Halaguru
    village = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    users = relationship("User", back_populates="location")
    weather_records = relationship("WeatherRecord", back_populates="location")
    advisories = relationship("AdvisoryItem", back_populates="location")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    password_hash = Column(String(255), nullable=True)
    preferred_language = Column(String(5), default="kn", nullable=False) # 'kn' or 'en'
    role = Column(String(20), default="farmer", nullable=False) # 'farmer', 'buyer', 'both', 'admin'
    roles = Column(String(50), default="farmer", nullable=False) # 'farmer', 'buyer', 'both'
    active_role = Column(String(20), default="farmer", nullable=False)
    is_onboarded = Column(Boolean, default=False, nullable=False)
    onboarding_step = Column(Integer, default=1, nullable=False)
    
    # Farmer specific profile attributes
    farm_size_acres = Column(Float, nullable=True)
    farming_type = Column(String(50), nullable=True) # organic, natural, conventional, mixed
    irrigation_source = Column(String(50), nullable=True) # canal, borewell, rainfed, drip
    profile_photo_url = Column(String(255), nullable=True)

    # Buyer specific profile attributes
    buyer_business_name = Column(String(150), nullable=True)
    buyer_type = Column(String(50), nullable=True) # wholesaler, trader, retailer, processor
    buyer_license_no = Column(String(100), nullable=True)
    interested_crops = Column(Text, nullable=True)

    # F5: Shared & Administrative Attributes
    is_admin = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False) # Verified farmer / merchant badge
    is_expert = Column(Boolean, default=False, nullable=False) # Agronomist / KVK scientist badge
    bio = Column(Text, nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=True)
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    text_size = Column(String(20), default="normal", nullable=False) # small, normal, large
    data_saver = Column(Boolean, default=False, nullable=False)
    phone_visible = Column(Boolean, default=True, nullable=False)

    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    location = relationship("Location", back_populates="users")
    user_crops = relationship("UserCrop", back_populates="user")
    community_posts = relationship("CommunityPost", back_populates="author")
    listings = relationship("MarketListing", back_populates="farmer")
    enquiries = relationship("MarketEnquiry", back_populates="buyer")
    notifications = relationship("Notification", back_populates="user")
    saved_listings = relationship("SavedListing", back_populates="user")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name_en = Column(String(100), nullable=False)
    name_kn = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # 'commercial', 'cereal', 'horticulture', etc.
    seasonality = Column(String(100), nullable=True) # Kharif, Rabi, Summer, Perennial
    typical_duration_days = Column(Integer, nullable=True)

    # Detailed crop agronomic data
    description_en = Column(Text, nullable=True)
    description_kn = Column(Text, nullable=True)
    soil_requirements_en = Column(Text, nullable=True)
    soil_requirements_kn = Column(Text, nullable=True)
    water_requirements_en = Column(Text, nullable=True)
    water_requirements_kn = Column(Text, nullable=True)
    growth_stages_json = Column(Text, nullable=True) # JSON list of stage objects
    irrigation_guidance_en = Column(Text, nullable=True)
    irrigation_guidance_kn = Column(Text, nullable=True)
    pests_diseases_json = Column(Text, nullable=True) # JSON list of pest & disease guidance

    user_crops = relationship("UserCrop", back_populates="crop")
    advisories = relationship("AdvisoryItem", back_populates="crop")
    market_listings = relationship("MarketListing", back_populates="crop")


class UserCrop(Base):
    __tablename__ = "user_crops"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    acreage = Column(Float, nullable=False)
    sowing_date = Column(DateTime, nullable=True)
    stage = Column(String(50), default="growing", nullable=False) # sowing, vegetative, flowering, maturity, harvesting
    soil_type = Column(String(50), nullable=True) # red sandy loam, black clay, etc.
    irrigation_type = Column(String(50), nullable=True) # canal, borewell, rainfed, drip

    user = relationship("User", back_populates="user_crops")
    crop = relationship("Crop", back_populates="user_crops")


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    temperature_c = Column(Float, nullable=False)
    humidity_percent = Column(Float, nullable=False)
    rainfall_mm = Column(Float, default=0.0, nullable=False)
    wind_speed_kmh = Column(Float, default=0.0, nullable=False)
    uv_index = Column(Float, nullable=True, default=4.0)
    precipitation_probability = Column(Float, nullable=True, default=20.0)
    source = Column(String(100), default="Open-Meteo (Live / Cached)", nullable=True)
    forecast_summary_en = Column(String(255), nullable=False)
    forecast_summary_kn = Column(String(255), nullable=False)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    location = relationship("Location", back_populates="weather_records")


class AdvisoryItem(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    title_en = Column(String(255), nullable=False)
    title_kn = Column(String(255), nullable=False)
    severity = Column(String(20), default="info", nullable=False) # info, warning, critical
    category = Column(String(50), default="general", nullable=False) # pest, weather, fertilizer, irrigation, disease
    message_en = Column(Text, nullable=False)
    message_kn = Column(Text, nullable=False)
    action_items_en = Column(Text, nullable=True) # JSON or newline separated text
    action_items_kn = Column(Text, nullable=True)
    
    # Explainability and scientific attribution
    explanation_en = Column(Text, nullable=True)
    explanation_kn = Column(Text, nullable=True)
    source_reference = Column(String(255), default="UAS Bangalore / ICAR-KVK Mandya", nullable=True)
    trigger_condition = Column(String(255), nullable=True)
    is_personalized = Column(Boolean, default=False, nullable=False)

    valid_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    crop = relationship("Crop", back_populates="advisories")
    location = relationship("Location", back_populates="advisories")


class CommunityGroup(Base):
    __tablename__ = "community_groups"

    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String(150), nullable=False)
    name_kn = Column(String(150), nullable=False)
    taluk = Column(String(100), nullable=False, index=True)
    village = Column(String(100), nullable=True, index=True)
    district = Column(String(100), default="Mandya", nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    description_en = Column(Text, nullable=True)
    description_kn = Column(Text, nullable=True)
    rules_en = Column(Text, nullable=True)
    rules_kn = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    member_count = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    crop = relationship("Crop")
    creator = relationship("User", foreign_keys=[creator_id])
    posts = relationship("CommunityPost", back_populates="group")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    announcements = relationship("GroupAnnouncement", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("community_groups.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(20), default="member", nullable=False)  # 'admin', 'moderator', 'member'
    status = Column(String(20), default="approved", nullable=False)  # 'pending', 'approved', 'rejected'
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    group = relationship("CommunityGroup", back_populates="members")
    user = relationship("User")


class GroupAnnouncement(Base):
    __tablename__ = "group_announcements"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("community_groups.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(20), default="normal", nullable=False)  # 'normal', 'urgent'
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    group = relationship("CommunityGroup", back_populates="announcements")
    author = relationship("User")


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("community_groups.id"), nullable=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    topic = Column(String(50), default="general", nullable=False, index=True)  # 'general', 'pest_control', 'cultivation', 'market_trend', 'machinery', 'schemes'
    language = Column(String(5), default="kn", nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    group = relationship("CommunityGroup", back_populates="posts")
    author = relationship("User", back_populates="community_posts")
    crop = relationship("Crop")
    location = relationship("Location")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    saves = relationship("SavedPost", back_populates="post", cascade="all, delete-orphan")


class PostComment(Base):
    __tablename__ = "post_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("post_comments.id"), nullable=True)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    post = relationship("CommunityPost", back_populates="comments")
    author = relationship("User")


class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    post = relationship("CommunityPost", back_populates="likes")
    user = relationship("User")


class SavedPost(Base):
    __tablename__ = "saved_posts"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    post = relationship("CommunityPost", back_populates="saves")
    user = relationship("User")


class ContentReport(Base):
    __tablename__ = "content_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=True, index=True)
    comment_id = Column(Integer, ForeignKey("post_comments.id"), nullable=True)
    reason = Column(String(100), nullable=False)  # 'misleading_advice', 'spam', 'abusive', 'commercial_ad', 'other'
    details = Column(Text, nullable=True)
    status = Column(String(20), default="pending", nullable=False)  # 'pending', 'reviewed', 'dismissed'
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User")
    post = relationship("CommunityPost")


class MarketListing(Base):
    __tablename__ = "market_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    group_id = Column(Integer, ForeignKey("community_groups.id"), nullable=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    variety = Column(String(100), nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="quintal", nullable=False)  # kg, quintal, ton, bag, piece
    price_per_unit = Column(Float, nullable=False)
    harvest_date = Column(DateTime, nullable=True)
    available_from = Column(DateTime, nullable=True)
    available_until = Column(DateTime, nullable=True)
    village = Column(String(100), nullable=True)
    taluk = Column(String(100), nullable=True)
    district = Column(String(100), default="Mandya", nullable=False)
    pickup_address = Column(String(255), nullable=True)
    image_url = Column(String(255), nullable=True)
    is_collective = Column(Boolean, default=False, nullable=False)
    status = Column(String(20), default="active", nullable=False)  # active, paused, reserved, sold
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    farmer = relationship("User", back_populates="listings")
    group = relationship("CommunityGroup")
    crop = relationship("Crop", back_populates="market_listings")
    enquiries = relationship("MarketEnquiry", back_populates="listing", cascade="all, delete-orphan")
    contributions = relationship("GroupListingContribution", back_populates="listing", cascade="all, delete-orphan")
    saves = relationship("SavedListing", back_populates="listing", cascade="all, delete-orphan")


class SavedListing(Base):
    __tablename__ = "saved_listings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("market_listings.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User")
    listing = relationship("MarketListing", back_populates="saves")


class GroupListingContribution(Base):
    __tablename__ = "group_listing_contributions"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("market_listings.id"), nullable=False, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    farmer_name = Column(String(150), nullable=True)
    farmer_phone = Column(String(20), nullable=True)
    farmer_village = Column(String(100), nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="quintal", nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    listing = relationship("MarketListing", back_populates="contributions")
    farmer = relationship("User")


class MarketEnquiry(Base):
    __tablename__ = "market_enquiries"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("market_listings.id"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    quantity_requested = Column(Float, nullable=False)
    offered_price = Column(Float, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String(20), default="pending", nullable=False)  # pending, accepted, declined, cancelled, closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    listing = relationship("MarketListing", back_populates="enquiries")
    buyer = relationship("User", back_populates="enquiries")
    messages = relationship("EnquiryMessage", back_populates="enquiry", cascade="all, delete-orphan")


class EnquiryMessage(Base):
    __tablename__ = "enquiry_messages"

    id = Column(Integer, primary_key=True, index=True)
    enquiry_id = Column(Integer, ForeignKey("market_enquiries.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    proposed_price = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    enquiry = relationship("MarketEnquiry", back_populates="messages")
    sender = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title_en = Column(String(255), nullable=False)
    title_kn = Column(String(255), nullable=False)
    message_en = Column(Text, nullable=False)
    message_kn = Column(Text, nullable=False)
    type = Column(String(30), default="general", nullable=False) # advisory, market, community, system
    is_read = Column(Boolean, default=False, nullable=False)
    related_entity_type = Column(String(50), nullable=True) # post, group, advisory, listing, enquiry
    related_entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")


class UserNotificationPreference(Base):
    __tablename__ = "user_notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    advisory_alerts = Column(Boolean, default=True, nullable=False)
    community_updates = Column(Boolean, default=True, nullable=False)
    market_enquiries = Column(Boolean, default=True, nullable=False)
    system_announcements = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), default="general", nullable=False) # 'crop_advisory', 'market_dispute', 'app_issue', 'account', 'feedback'
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="open", nullable=False) # 'open', 'in_progress', 'resolved', 'closed'
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User")


class ModerationAuditLog(Base):
    __tablename__ = "moderation_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False) # 'resolve_report', 'dismiss_report', 'suspend_user', 'reinstate_user', 'assign_badge', 'moderate_group', 'update_crop'
    target_type = Column(String(50), nullable=False) # 'content_report', 'user', 'community_group', 'community_post', 'crop'
    target_id = Column(Integer, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    admin = relationship("User")

