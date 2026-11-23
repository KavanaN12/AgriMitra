import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

# Health
class HealthResponse(BaseModel):
    status: str = "ok"
    app: str = "AgriMitra API"
    version: str = "0.1.0"
    environment: str
    database: str

# Location
class LocationBase(BaseModel):
    state: str = "Karnataka"
    district: str = "Mandya"
    taluk: str
    hobli: Optional[str] = None
    village: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LocationResponse(LocationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# User & Auth
class UserBase(BaseModel):
    phone_number: str
    full_name: str
    preferred_language: str = "kn"
    role: str = "farmer" # 'farmer', 'buyer', 'both', 'admin'
    roles: str = "farmer" # 'farmer', 'buyer', 'both'
    active_role: str = "farmer"
    is_onboarded: bool = False
    onboarding_step: int = 1

    # Optional profile details
    farm_size_acres: Optional[float] = None
    farming_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    profile_photo_url: Optional[str] = None
    buyer_business_name: Optional[str] = None
    buyer_type: Optional[str] = None
    buyer_license_no: Optional[str] = None
    interested_crops: Optional[str] = None

    # F5 Attributes
    is_admin: bool = False
    is_verified: bool = False
    is_expert: bool = False
    bio: Optional[str] = None
    email: Optional[str] = None
    text_size: str = "normal"
    data_saver: bool = False
    phone_visible: bool = True

class UserCreate(UserBase):
    password: Optional[str] = None
    location_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    location_id: Optional[int] = None
    is_active: bool
    created_at: datetime.datetime
    location: Optional[LocationResponse] = None

    model_config = ConfigDict(from_attributes=True)

class AuthTokenRequest(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    otp: Optional[str] = None


class OnboardingLocationInput(BaseModel):
    state: str = "Karnataka"
    district: str = "Mandya"
    taluk: str
    hobli: Optional[str] = None
    village: str
    pincode: Optional[str] = "571401"

class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone_number: str
    password: str
    preferred_language: str = "kn"
    role: str = "farmer" # 'farmer', 'buyer', 'both'
    location: Optional[OnboardingLocationInput] = None
    farm_size_acres: Optional[float] = None
    farming_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    crop_ids: Optional[List[int]] = None
    buyer_business_name: Optional[str] = None
    buyer_type: Optional[str] = None
    buyer_license_no: Optional[str] = None
    interested_crops: Optional[List[int]] = None

class UserLoginRequest(BaseModel):
    identifier: Optional[str] = None # email or phone number
    email: Optional[str] = None
    phone_number: Optional[str] = None
    password: str
    otp: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class OtpVerifyRequest(BaseModel):
    phone_number: str
    otp: str = Field(default="123456", description="Demo OTP is 123456")

class OtpResendRequest(BaseModel):
    phone_number: str

class ForgotPasswordRequest(BaseModel):
    identifier: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class OnboardingUpdateRequest(BaseModel):
    role: str = "farmer" # 'farmer', 'buyer', 'both'
    location: Optional[OnboardingLocationInput] = None
    crop_ids: Optional[List[int]] = None
    
    # Farmer details
    farm_size_acres: Optional[float] = None
    farming_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    profile_photo_url: Optional[str] = None

    # Buyer details
    buyer_business_name: Optional[str] = None
    buyer_type: Optional[str] = None
    buyer_license_no: Optional[str] = None
    interested_crops: Optional[List[int]] = None

    terms_accepted: bool = True
    step: Optional[int] = None
    is_completed: bool = False

class RoleSwitchRequest(BaseModel):
    active_role: str # 'farmer' or 'buyer'

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Crop
class CropBase(BaseModel):
    code: str
    name_en: str
    name_kn: str
    category: str
    seasonality: Optional[str] = None
    typical_duration_days: Optional[int] = None
    description_en: Optional[str] = None
    description_kn: Optional[str] = None
    soil_requirements_en: Optional[str] = None
    soil_requirements_kn: Optional[str] = None
    water_requirements_en: Optional[str] = None
    water_requirements_kn: Optional[str] = None
    growth_stages_json: Optional[str] = None
    irrigation_guidance_en: Optional[str] = None
    irrigation_guidance_kn: Optional[str] = None
    pests_diseases_json: Optional[str] = None

class CropResponse(CropBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# User Crop
class UserCropCreate(BaseModel):
    crop_id: int
    acreage: float
    sowing_date: Optional[datetime.datetime] = None
    stage: str = "growing"
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None

class UserCropUpdate(BaseModel):
    acreage: Optional[float] = None
    sowing_date: Optional[datetime.datetime] = None
    stage: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None

class UserCropResponse(BaseModel):
    id: int
    user_id: int
    crop_id: int
    acreage: float
    sowing_date: Optional[datetime.datetime] = None
    stage: str
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    crop: Optional[CropResponse] = None

    model_config = ConfigDict(from_attributes=True)

# Weather
class WeatherRecordResponse(BaseModel):
    id: int
    location_id: int
    temperature_c: float
    humidity_percent: float
    rainfall_mm: float
    wind_speed_kmh: float
    uv_index: Optional[float] = 4.0
    precipitation_probability: Optional[float] = 20.0
    source: Optional[str] = "Open-Meteo"
    forecast_summary_en: str
    forecast_summary_kn: str
    recorded_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class WeatherForecastDay(BaseModel):
    date: str
    day_name_en: str
    day_name_kn: str
    temp_max_c: float
    temp_min_c: float
    rainfall_mm: float
    precipitation_probability: float
    condition_en: str
    condition_kn: str
    weather_code: int
    wind_speed_kmh: float

class WeatherForecastResponse(BaseModel):
    location_id: int
    location_name: str
    latitude: float
    longitude: float
    source: str
    is_live: bool
    forecast_days: List[WeatherForecastDay]

# Advisory
class AdvisoryItemResponse(BaseModel):
    id: int
    crop_id: Optional[int] = None
    location_id: Optional[int] = None
    title_en: str
    title_kn: str
    severity: str
    category: str
    message_en: str
    message_kn: str
    action_items_en: Optional[str] = None
    action_items_kn: Optional[str] = None
    explanation_en: Optional[str] = None
    explanation_kn: Optional[str] = None
    source_reference: Optional[str] = "UAS Bangalore / ICAR-KVK Mandya"
    trigger_condition: Optional[str] = None
    is_personalized: bool = False
    valid_until: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    crop: Optional[CropResponse] = None

    model_config = ConfigDict(from_attributes=True)

class AdvisoryRecommendation(BaseModel):
    id: str
    crop_id: Optional[int] = None
    crop_name_en: Optional[str] = None
    crop_name_kn: Optional[str] = None
    type: str # 'irrigation', 'pest_alert', 'operation'
    severity: str # 'info', 'warning', 'critical'
    title_en: str
    title_kn: str
    summary_en: str
    summary_kn: str
    explanation_en: str
    explanation_kn: str
    recommended_actions: List[str]
    source_reference: str
    created_at: datetime.datetime

class DiseaseDiagnosisRequest(BaseModel):
    crop_id: int
    plant_part: str = "leaf" # leaf, stem, fruit, root, whole_plant
    symptoms: str
    image_url: Optional[str] = None

class DiseaseDiagnosisResponse(BaseModel):
    suspected_disease_en: str
    suspected_disease_kn: str
    confidence_score: float
    is_ai_preview: bool = True
    severity: str
    symptoms_analysis_en: str
    symptoms_analysis_kn: str
    immediate_remedies_en: List[str]
    immediate_remedies_kn: List[str]
    preventive_measures_en: List[str]
    preventive_measures_kn: List[str]
    reference_source: str = "ICAR-KVK Mandya / UAS Bangalore Plant Pathology"
    disclaimer_en: str
    disclaimer_kn: str

# Community Schemas
class CommunityGroupCreate(BaseModel):
    name_en: str
    name_kn: str
    taluk: str
    village: Optional[str] = None
    district: str = "Mandya"
    crop_id: Optional[int] = None
    description_en: Optional[str] = None
    description_kn: Optional[str] = None
    rules_en: Optional[str] = None
    rules_kn: Optional[str] = None
    image_url: Optional[str] = None

class CommunityGroupResponse(BaseModel):
    id: int
    name_en: str
    name_kn: str
    taluk: str
    village: Optional[str] = None
    district: str = "Mandya"
    crop_id: Optional[int] = None
    crop_name_en: Optional[str] = None
    crop_name_kn: Optional[str] = None
    creator_id: Optional[int] = None
    description_en: Optional[str] = None
    description_kn: Optional[str] = None
    rules_en: Optional[str] = None
    rules_kn: Optional[str] = None
    image_url: Optional[str] = None
    member_count: int
    is_active: bool
    membership_status: Optional[str] = None  # 'admin', 'moderator', 'member', 'pending', None
    created_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)

class GroupMemberResponse(BaseModel):
    id: int
    group_id: int
    user_id: int
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    user_village: Optional[str] = None
    role: str = "member"  # 'admin', 'moderator', 'member'
    status: str = "approved"  # 'pending', 'approved', 'rejected'
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class GroupMemberRoleUpdate(BaseModel):
    role: str  # 'admin', 'moderator', 'member'

class GroupAnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "normal"  # 'normal', 'urgent'

class GroupAnnouncementResponse(BaseModel):
    id: int
    group_id: int
    author_id: int
    author_name: Optional[str] = None
    title: str
    content: str
    priority: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class CommunityPostCreate(BaseModel):
    group_id: Optional[int] = None
    crop_id: Optional[int] = None
    location_id: Optional[int] = None
    title: str
    content: str
    image_url: Optional[str] = None
    topic: str = "general"  # 'general', 'pest_control', 'cultivation', 'market_trend', 'machinery', 'schemes'
    language: str = "kn"

class CommunityPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    topic: Optional[str] = None

class CommunityPostResponse(BaseModel):
    id: int
    group_id: Optional[int] = None
    group_name: Optional[str] = None
    author_id: int
    crop_id: Optional[int] = None
    crop_name_en: Optional[str] = None
    crop_name_kn: Optional[str] = None
    title: str
    content: str
    image_url: Optional[str] = None
    topic: str = "general"
    language: str = "kn"
    likes_count: int = 0
    comments_count: int = 0
    replies_count: Optional[int] = 0
    is_pinned: bool = False
    is_liked: bool = False
    is_saved: bool = False
    created_at: datetime.datetime
    author_name: Optional[str] = None
    author_village: Optional[str] = None
    author_taluk: Optional[str] = None
    author_role: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PostCommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None

class PostCommentResponse(BaseModel):
    id: int
    post_id: int
    author_id: int
    parent_id: Optional[int] = None
    content: str
    likes_count: int = 0
    created_at: datetime.datetime
    author_name: Optional[str] = None
    author_village: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ContentReportCreate(BaseModel):
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    reason: str
    details: Optional[str] = None

class ContentReportResponse(BaseModel):
    id: int
    user_id: int
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    reason: str
    details: Optional[str] = None
    status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# Marketplace (F4)
class GroupListingContributionCreate(BaseModel):
    quantity: float
    unit: str = "quintal"
    notes: Optional[str] = None

class GroupListingContributionResponse(BaseModel):
    id: int
    listing_id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    farmer_village: Optional[str] = None
    quantity: float
    unit: str
    notes: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class MarketListingCreate(BaseModel):
    crop_id: int
    group_id: Optional[int] = None
    variety: Optional[str] = None
    quantity: float
    unit: str = "quintal"
    price_per_unit: float
    harvest_date: Optional[datetime.datetime] = None
    available_from: Optional[datetime.datetime] = None
    available_until: Optional[datetime.datetime] = None
    village: Optional[str] = None
    taluk: Optional[str] = None
    district: str = "Mandya"
    pickup_address: Optional[str] = None
    image_url: Optional[str] = None
    is_collective: bool = False
    description: Optional[str] = None

class MarketListingUpdate(BaseModel):
    variety: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    price_per_unit: Optional[float] = None
    harvest_date: Optional[datetime.datetime] = None
    available_from: Optional[datetime.datetime] = None
    available_until: Optional[datetime.datetime] = None
    pickup_address: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None  # active, paused, reserved, sold
    description: Optional[str] = None

class MarketListingResponse(BaseModel):
    id: int
    farmer_id: int
    group_id: Optional[int] = None
    crop_id: int
    variety: Optional[str] = None
    quantity: float
    unit: str
    price_per_unit: float
    harvest_date: Optional[datetime.datetime] = None
    available_from: Optional[datetime.datetime] = None
    available_until: Optional[datetime.datetime] = None
    village: Optional[str] = None
    taluk: Optional[str] = None
    district: str = "Mandya"
    pickup_address: Optional[str] = None
    image_url: Optional[str] = None
    is_collective: bool = False
    status: str
    description: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    farmer_village: Optional[str] = None
    group_name: Optional[str] = None
    crop_name_en: Optional[str] = None
    crop_name_kn: Optional[str] = None
    is_saved: bool = False
    contributions_count: int = 0
    enquiries_count: int = 0
    contributions: Optional[List[GroupListingContributionResponse]] = None

    model_config = ConfigDict(from_attributes=True)

class EnquiryMessageCreate(BaseModel):
    message: str
    proposed_price: Optional[float] = None

class EnquiryMessageResponse(BaseModel):
    id: int
    enquiry_id: int
    sender_id: int
    sender_name: Optional[str] = None
    sender_role: Optional[str] = None
    message: str
    proposed_price: Optional[float] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class MarketEnquiryCreate(BaseModel):
    listing_id: int
    quantity_requested: float
    offered_price: Optional[float] = None
    message: Optional[str] = None

class MarketEnquiryStatusUpdate(BaseModel):
    status: str  # accepted, declined, cancelled, closed

class MarketEnquiryResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    quantity_requested: float
    offered_price: Optional[float] = None
    message: Optional[str] = None
    status: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    buyer_village: Optional[str] = None
    listing_title: Optional[str] = None
    listing_crop_en: Optional[str] = None
    listing_crop_kn: Optional[str] = None
    listing_price: Optional[float] = None
    listing_unit: Optional[str] = None
    farmer_id: Optional[int] = None
    farmer_name: Optional[str] = None
    messages: Optional[List[EnquiryMessageResponse]] = None

    model_config = ConfigDict(from_attributes=True)

# Notification
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title_en: str
    title_kn: str
    message_en: str
    message_kn: str
    type: str
    is_read: bool
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# F5: Profile & Settings
class UserProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    preferred_language: Optional[str] = None
    farm_size_acres: Optional[float] = None
    farming_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    profile_photo_url: Optional[str] = None
    buyer_business_name: Optional[str] = None
    buyer_type: Optional[str] = None
    buyer_license_no: Optional[str] = None
    text_size: Optional[str] = None
    data_saver: Optional[bool] = None
    phone_visible: Optional[bool] = None
    location_id: Optional[int] = None
    crop_ids: Optional[List[int]] = None


class UserNotificationPreferenceResponse(BaseModel):
    id: int
    user_id: int
    advisory_alerts: bool
    community_updates: bool
    market_enquiries: bool
    system_announcements: bool
    updated_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserNotificationPreferenceUpdate(BaseModel):
    advisory_alerts: Optional[bool] = None
    community_updates: Optional[bool] = None
    market_enquiries: Optional[bool] = None
    system_announcements: Optional[bool] = None


# F5: Support & Help
class SupportTicketCreate(BaseModel):
    category: str = "general" # 'crop_advisory', 'market_dispute', 'app_issue', 'account', 'feedback'
    subject: str
    description: str


class SupportTicketResponse(BaseModel):
    id: int
    user_id: int
    category: str
    subject: str
    description: str
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    user_name: Optional[str] = None
    user_phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SupportTicketStatusUpdate(BaseModel):
    status: str # 'open', 'in_progress', 'resolved', 'closed'
    resolution_notes: Optional[str] = None


# F5: Moderation & Audit Logs
class ModerationAuditLogResponse(BaseModel):
    id: int
    admin_id: int
    admin_name: Optional[str] = None
    action: str
    target_type: str
    target_id: int
    details: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# F5: Platform Administration
class AdminPlatformStats(BaseModel):
    total_users: int
    total_farmers: int
    total_buyers: int
    total_listings: int
    total_groups: int
    pending_reports_count: int
    open_tickets_count: int
    total_advisories_count: int


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_expert: Optional[bool] = None
    role: Optional[str] = None


class AdminUserBadgeUpdate(BaseModel):
    is_verified: Optional[bool] = None
    is_expert: Optional[bool] = None


class AdminReportResolveRequest(BaseModel):
    action: str # 'take_down', 'dismiss', 'warn'
    notes: Optional[str] = None


class AdminGroupStatusUpdate(BaseModel):
    is_active: bool
    reason: Optional[str] = None


class AdminCropCreate(BaseModel):
    code: str
    name_en: str
    name_kn: str
    category: str
    seasonality: Optional[str] = None
    typical_duration_days: Optional[int] = None


class AdminCropUpdate(BaseModel):
    name_en: Optional[str] = None
    name_kn: Optional[str] = None
    category: Optional[str] = None
    seasonality: Optional[str] = None
    typical_duration_days: Optional[int] = None

