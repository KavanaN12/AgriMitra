export interface Location {
  id: number;
  state: string;
  district: string;
  taluk: string;
  hobli?: string | null;
  village: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
}

export type LocationHierarchy = Record<
  string, // State (e.g. Karnataka)
  Record<
    string, // District (e.g. Mandya)
    Record<
      string, // Taluk (e.g. Maddur)
      Record<
        string, // Hobli (e.g. Koppa)
        string[] // Villages (e.g. ["Shivapura", "Besagarahalli"])
      >
    >
  >
>;

export interface User {
  id: number;
  phone_number: string;
  full_name: string;
  preferred_language: 'kn' | 'en';
  role: 'farmer' | 'buyer' | 'both' | 'admin';
  roles: 'farmer' | 'buyer' | 'both' | 'admin';
  active_role: 'farmer' | 'buyer' | 'admin';
  is_onboarded: boolean;
  onboarding_step: number;
  location_id?: number | null;
  is_active: boolean;
  created_at: string;
  location?: Location | null;

  // Farmer specific
  farm_size_acres?: number | null;
  farming_type?: string | null;
  irrigation_source?: string | null;
  profile_photo_url?: string | null;

  // Buyer specific
  buyer_business_name?: string | null;
  buyer_type?: string | null;
  buyer_license_no?: string | null;
  interested_crops?: string | null;

  // F5 Shared & Administration Attributes
  is_admin?: boolean;
  is_verified?: boolean;
  is_expert?: boolean;
  bio?: string | null;
  email?: string | null;
  text_size?: 'small' | 'normal' | 'large';
  data_saver?: boolean;
  phone_visible?: boolean;
}

export interface AuthTokenRequest {
  phone_number: string;
  otp: string;
}

export interface UserRegisterRequest {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  preferred_language: 'kn' | 'en';
  role?: 'farmer' | 'buyer' | 'both';
  location?: OnboardingLocationInput;
  farm_size_acres?: number;
  farming_type?: string;
  irrigation_source?: string;
  crop_ids?: number[];
  buyer_business_name?: string;
  buyer_type?: string;
  buyer_license_no?: string;
  interested_crops?: number[];
}

export interface UserLoginRequest {
  identifier?: string;
  email?: string;
  phone_number?: string;
  password: string;
  otp?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface OtpVerifyRequest {
  phone_number: string;
  otp: string;
}

export interface OtpResendRequest {
  phone_number: string;
}

export interface ForgotPasswordRequest {
  identifier?: string;
  email?: string;
  phone_number?: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface OnboardingLocationInput {
  state: string;
  district: string;
  taluk: string;
  hobli?: string;
  village: string;
  pincode?: string;
}

export interface OnboardingUpdateRequest {
  role: 'farmer' | 'buyer' | 'both';
  location?: OnboardingLocationInput;
  crop_ids?: number[];
  farm_size_acres?: number;
  farming_type?: string;
  irrigation_source?: string;
  profile_photo_url?: string;
  buyer_business_name?: string;
  buyer_type?: string;
  buyer_license_no?: string;
  interested_crops?: number[];
  terms_accepted: boolean;
  step?: number;
  is_completed: boolean;
}

export interface RoleSwitchRequest {
  active_role: 'farmer' | 'buyer';
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface GrowthStage {
  stage_order?: number;
  stage?: string;
  stage_name_en?: string;
  stage_kn?: string;
  stage_name_kn?: string;
  duration_days?: number;
  start_day?: number;
  end_day?: number;
  water_need?: string;
  key_practices?: string;
  practices_en?: string[];
  practices_kn?: string[];
}

export interface PestDiseaseItem {
  pest_name?: string;
  name_en?: string;
  pest_kn?: string;
  name_kn?: string;
  type?: string;
  symptoms?: string;
  symptoms_en?: string;
  symptoms_kn?: string;
  management?: string;
  management_en?: string;
  management_kn?: string;
}

export interface Crop {
  id: number;
  code: string;
  name_en: string;
  name_kn: string;
  category: string;
  scientific_name?: string;
  seasonality?: string | null;
  season_en?: string | null;
  typical_duration_days?: number | null;
  duration_days?: number | null;
  description_en?: string | null;
  description_kn?: string | null;
  soil_requirements_en?: string | null;
  soil_requirements_kn?: string | null;
  water_requirements_en?: string | null;
  water_requirements_kn?: string | null;
  growth_stages_json?: string | null;
  growth_stages?: GrowthStage[] | null;
  irrigation_guidance_en?: string | null;
  irrigation_guidance_kn?: string | null;
  pests_diseases_json?: string | null;
  pests_diseases?: PestDiseaseItem[] | null;
}

export interface UserCropCreate {
  crop_id: number;
  acreage: number;
  sowing_date?: string | null;
  stage?: string;
  soil_type?: string | null;
  irrigation_type?: string | null;
}

export interface UserCropUpdate {
  acreage?: number;
  sowing_date?: string | null;
  stage?: string;
  soil_type?: string | null;
  irrigation_type?: string | null;
}

export interface UserCrop {
  id: number;
  user_id: number;
  crop_id: number;
  crop_name?: string;
  name_en?: string;
  name_kn?: string;
  acreage: number;
  sowing_date?: string | null;
  stage: string;
  soil_type?: string | null;
  irrigation_type?: string | null;
  crop?: Crop | null;
}

export interface WeatherRecord {
  id: number;
  location_id: number;
  temperature_c: number;
  humidity_percent: number;
  humidity_pct?: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  uv_index?: number;
  precipitation_probability?: number;
  source?: string;
  is_live?: boolean;
  condition?: string;
  condition_en?: string;
  condition_kn?: string;
  taluk?: string;
  forecast_summary_en: string;
  forecast_summary_kn: string;
  recorded_at: string;
}

export interface WeatherForecastDay {
  date: string;
  day_name_en?: string;
  day_name_kn?: string;
  day_of_week?: string;
  temp_max_c: number;
  temp_min_c: number;
  rainfall_mm?: number;
  precipitation_mm?: number;
  precipitation_probability: number;
  condition?: string;
  condition_en: string;
  condition_kn: string;
  agro_advice?: string;
  agro_advice_en?: string;
  agro_advice_kn?: string;
  weather_code: number;
  wind_speed_kmh: number;
}

export interface WeatherForecastResponse {
  location_id?: number;
  location_name?: string;
  taluk?: string;
  coordinates?: string;
  latitude: number;
  longitude: number;
  source: string;
  is_live: boolean;
  forecast_days?: WeatherForecastDay[];
  daily?: WeatherForecastDay[];
}

export interface AdvisoryItem {
  id: number;
  crop_id?: number | null;
  crop_name?: string | null;
  location_id?: number | null;
  title_en: string;
  title_kn: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message_en: string;
  message_kn: string;
  description_en?: string | null;
  description_kn?: string | null;
  action_items_en?: string | null;
  action_items_kn?: string | null;
  actions_en?: string[] | null;
  actions_kn?: string[] | null;
  explanation_en?: string | null;
  explanation_kn?: string | null;
  source_reference?: string | null;
  trigger_condition?: string | null;
  is_personalized?: boolean;
  valid_until?: string | null;
  created_at: string;
  crop?: Crop | null;
}

export interface AdvisoryRecommendation {
  id: string;
  crop_id?: number | null;
  crop_name?: string | null;
  crop_name_en?: string | null;
  crop_name_kn?: string | null;
  recommendation_type?: string;
  type: 'irrigation' | 'pest_alert' | 'operation';
  urgency?: 'low' | 'medium' | 'high';
  action_required?: boolean;
  severity: 'info' | 'warning' | 'critical';
  title_en: string;
  title_kn: string;
  summary_en: string;
  summary_kn: string;
  explanation_en: string;
  explanation_kn: string;
  recommended_actions: string[];
  source_reference: string;
  created_at: string;
}

export interface DiseaseDiagnosisRequest {
  crop_id: number;
  plant_part: 'leaf' | 'stem' | 'fruit' | 'root' | 'whole_plant';
  symptoms: string;
  image_data?: string | null;
  image_url?: string | null;
}

export interface DiseaseDiagnosisResponse {
  suspected_disease_en?: string;
  suspected_disease_kn?: string;
  suspected_condition_en?: string;
  suspected_condition_kn?: string;
  confidence_score: number;
  is_ai_preview: boolean;
  severity: 'info' | 'warning' | 'critical';
  symptoms_analysis_en?: string;
  symptoms_analysis_kn?: string;
  immediate_remedies_en: string[];
  immediate_remedies_kn: string[];
  preventive_measures_en: string[];
  preventive_measures_kn: string[];
  reference_source?: string;
  scientific_source?: string;
  disclaimer_en: string;
  disclaimer_kn: string;
}

export interface CommunityGroup {
  id: number;
  name_en: string;
  name_kn: string;
  taluk: string;
  village?: string | null;
  district?: string;
  crop_id?: number | null;
  crop_name_en?: string | null;
  crop_name_kn?: string | null;
  creator_id?: number | null;
  description_en?: string | null;
  description_kn?: string | null;
  rules_en?: string | null;
  rules_kn?: string | null;
  image_url?: string | null;
  member_count: number;
  is_active: boolean;
  membership_status?: 'admin' | 'moderator' | 'member' | 'pending' | null;
  created_at?: string;
}

export interface CommunityGroupCreate {
  name_en: string;
  name_kn: string;
  taluk: string;
  village?: string;
  district?: string;
  crop_id?: number;
  description_en?: string;
  description_kn?: string;
  rules_en?: string;
  rules_kn?: string;
  image_url?: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  user_name?: string | null;
  user_phone?: string | null;
  user_village?: string | null;
  role: 'admin' | 'moderator' | 'member';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface GroupMemberRoleUpdate {
  role: 'admin' | 'moderator' | 'member';
}

export interface GroupAnnouncement {
  id: number;
  group_id: number;
  author_id: number;
  author_name?: string | null;
  title: string;
  content: string;
  priority: 'normal' | 'urgent';
  created_at: string;
}

export interface GroupAnnouncementCreate {
  title: string;
  content: string;
  priority?: 'normal' | 'urgent';
}

export interface CommunityPost {
  id: number;
  group_id?: number | null;
  group_name?: string | null;
  author_id: number;
  author_name?: string | null;
  author_village?: string | null;
  author_taluk?: string | null;
  author_role?: string | null;
  crop_id?: number | null;
  crop_name_en?: string | null;
  crop_name_kn?: string | null;
  title: string;
  content: string;
  image_url?: string | null;
  topic: string;
  language: string;
  likes_count: number;
  comments_count: number;
  replies_count?: number;
  is_pinned?: boolean;
  is_liked?: boolean;
  is_saved?: boolean;
  created_at: string;
}

export interface CommunityPostCreate {
  group_id?: number | null;
  crop_id?: number | null;
  location_id?: number | null;
  title: string;
  content: string;
  image_url?: string | null;
  topic?: string;
  language?: string;
}

export interface PostComment {
  id: number;
  post_id: number;
  author_id: number;
  author_name?: string | null;
  author_village?: string | null;
  parent_id?: number | null;
  content: string;
  likes_count: number;
  created_at: string;
}

export interface PostCommentCreate {
  content: string;
  parent_id?: number | null;
}

export interface ContentReport {
  id: number;
  user_id: number;
  post_id?: number | null;
  comment_id?: number | null;
  reason: string;
  details?: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

export interface ContentReportCreate {
  post_id?: number | null;
  comment_id?: number | null;
  reason: string;
  details?: string | null;
}

// Marketplace (F4)
export interface GroupListingContribution {
  id: number;
  listing_id: number;
  farmer_id: number;
  farmer_name?: string | null;
  farmer_phone?: string | null;
  farmer_village?: string | null;
  quantity: number;
  unit: string;
  notes?: string | null;
  created_at: string;
}

export interface GroupListingContributionCreate {
  quantity: number;
  unit?: string;
  notes?: string | null;
}

export interface MarketListing {
  id: number;
  farmer_id: number;
  group_id?: number | null;
  crop_id: number;
  variety?: string | null;
  quantity: number;
  unit: string;
  price_per_unit: number;
  harvest_date?: string | null;
  available_from?: string | null;
  available_until?: string | null;
  village?: string | null;
  taluk?: string | null;
  district?: string;
  pickup_address?: string | null;
  image_url?: string | null;
  is_collective?: boolean;
  status: 'active' | 'available' | 'paused' | 'reserved' | 'sold';
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
  farmer_name?: string | null;
  farmer_phone?: string | null;
  farmer_village?: string | null;
  group_name?: string | null;
  crop_name_en?: string | null;
  crop_name_kn?: string | null;
  is_saved?: boolean;
  contributions_count?: number;
  enquiries_count?: number;
  contributions?: GroupListingContribution[];
}

export interface MarketListingCreate {
  crop_id: number;
  group_id?: number | null;
  variety?: string | null;
  quantity: number;
  unit?: string;
  price_per_unit: number;
  harvest_date?: string | null;
  available_from?: string | null;
  available_until?: string | null;
  village?: string | null;
  taluk?: string | null;
  district?: string;
  pickup_address?: string | null;
  image_url?: string | null;
  is_collective?: boolean;
  description?: string | null;
}

export interface MarketListingUpdate {
  variety?: string | null;
  quantity?: number;
  unit?: string;
  price_per_unit?: number;
  harvest_date?: string | null;
  available_from?: string | null;
  available_until?: string | null;
  pickup_address?: string | null;
  image_url?: string | null;
  status?: 'active' | 'paused' | 'reserved' | 'sold';
  description?: string | null;
}

export interface EnquiryMessage {
  id: number;
  enquiry_id: number;
  sender_id: number;
  sender_name?: string | null;
  sender_role?: string | null;
  message: string;
  proposed_price?: number | null;
  created_at: string;
}

export interface EnquiryMessageCreate {
  message: string;
  proposed_price?: number | null;
}

export interface MarketEnquiry {
  id: number;
  listing_id: number;
  buyer_id: number;
  quantity_requested: number;
  offered_price?: number | null;
  message?: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'closed';
  created_at: string;
  updated_at?: string | null;
  buyer_name?: string | null;
  buyer_phone?: string | null;
  buyer_village?: string | null;
  listing_title?: string | null;
  listing_crop_en?: string | null;
  listing_crop_kn?: string | null;
  listing_price?: number | null;
  listing_unit?: string | null;
  farmer_id?: number | null;
  farmer_name?: string | null;
  messages?: EnquiryMessage[];
}

export interface MarketEnquiryCreate {
  listing_id: number;
  quantity_requested: number;
  offered_price?: number | null;
  message?: string | null;
}

export interface MarketEnquiryStatusUpdate {
  status: 'accepted' | 'declined' | 'cancelled' | 'closed';
}

export interface Notification {
  id: number;
  user_id: number;
  title_en: string;
  title_kn: string;
  message_en: string;
  message_kn: string;
  type: 'advisory' | 'market' | 'community' | 'system';
  is_read: boolean;
  related_entity_type?: 'advisory' | 'market' | 'community' | 'system' | 'post' | 'group' | 'listing' | 'enquiry' | 'report' | null;
  related_entity_id?: number | null;
  created_at: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  email?: string;
  bio?: string;
  preferred_language?: 'kn' | 'en';
  farm_size_acres?: number;
  farming_type?: string;
  irrigation_source?: string;
  profile_photo_url?: string;
  buyer_business_name?: string;
  buyer_type?: string;
  buyer_license_no?: string;
  text_size?: 'small' | 'normal' | 'large';
  data_saver?: boolean;
  phone_visible?: boolean;
  location_id?: number;
  crop_ids?: number[];
}

export interface UserNotificationPreference {
  id: number;
  user_id: number;
  advisory_alerts: boolean;
  community_updates: boolean;
  market_enquiries: boolean;
  system_announcements: boolean;
  updated_at?: string;
}

export interface UserNotificationPreferenceUpdate {
  advisory_alerts?: boolean;
  community_updates?: boolean;
  market_enquiries?: boolean;
  system_announcements?: boolean;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution_notes?: string | null;
  created_at: string;
  updated_at?: string;
  user_name?: string;
  user_phone?: string;
}

export interface SupportTicketCreate {
  category: string;
  subject: string;
  description: string;
}

export interface SupportTicketStatusUpdate {
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution_notes?: string;
}

export interface ModerationAuditLog {
  id: number;
  admin_id: number;
  admin_name?: string;
  action: string;
  target_type: string;
  target_id: number;
  details?: string | null;
  created_at: string;
}

export interface AdminPlatformStats {
  total_users: number;
  total_farmers: number;
  total_buyers: number;
  total_listings: number;
  total_groups: number;
  pending_reports_count: number;
  open_tickets_count: number;
  total_advisories_count: number;
}

export interface AdminUserUpdate {
  is_active?: boolean;
  is_verified?: boolean;
  is_expert?: boolean;
  role?: string;
}

export interface AdminUserBadgeUpdate {
  is_verified?: boolean;
  is_expert?: boolean;
}

export interface AdminReportItem {
  id: number;
  user_id: number;
  reporter_name?: string;
  post_id?: number;
  post_title?: string;
  post_content?: string;
  author_name?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

export interface AdminReportResolveRequest {
  action: 'take_down' | 'dismiss' | 'warn';
  notes?: string;
}

export interface AdminGroupStatusUpdate {
  is_active: boolean;
  reason?: string;
}

export interface AdminCropCreate {
  code: string;
  name_en: string;
  name_kn: string;
  category: string;
  seasonality?: string;
  typical_duration_days?: number;
}

export interface AdminCropUpdate {
  name_en?: string;
  name_kn?: string;
  category?: string;
  seasonality?: string;
  typical_duration_days?: number;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
  database: string;
}
