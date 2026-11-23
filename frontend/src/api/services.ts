import { apiClient } from './client';
import {
  HealthResponse,
  AuthTokenRequest,
  AuthTokenResponse,
  User,
  UserRegisterRequest,
  UserLoginRequest,
  ChangePasswordRequest,
  OtpVerifyRequest,
  OtpResendRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  OnboardingUpdateRequest,
  RoleSwitchRequest,
  LocationHierarchy,
  Location,
  Crop,
  UserCrop,
  UserCropCreate,
  UserCropUpdate,
  WeatherRecord,
  WeatherForecastResponse,
  AdvisoryItem,
  AdvisoryRecommendation,
  DiseaseDiagnosisRequest,
  DiseaseDiagnosisResponse,
  CommunityGroup,
  CommunityGroupCreate,
  GroupMember,
  GroupAnnouncement,
  GroupAnnouncementCreate,
  CommunityPost,
  CommunityPostCreate,
  PostComment,
  PostCommentCreate,
  ContentReport,
  ContentReportCreate,
  MarketListing,
  MarketListingCreate,
  MarketListingUpdate,
  GroupListingContribution,
  GroupListingContributionCreate,
  MarketEnquiry,
  MarketEnquiryCreate,
  MarketEnquiryStatusUpdate,
  EnquiryMessage,
  EnquiryMessageCreate,
  Notification,
  UserProfileUpdate,
  UserNotificationPreference,
  UserNotificationPreferenceUpdate,
  SupportTicket,
  SupportTicketCreate,
  SupportTicketStatusUpdate,
  ModerationAuditLog,
  AdminPlatformStats,
  AdminUserUpdate,
  AdminUserBadgeUpdate,
  AdminReportItem,
  AdminReportResolveRequest,
  AdminGroupStatusUpdate,
  AdminCropCreate,
  AdminCropUpdate
} from '../types/api';

export const api = {
  // Health
  health: {
    check: () => apiClient<HealthResponse>('/health')
  },

  // Auth & Profile
  auth: {
    login: (payload: UserLoginRequest | AuthTokenRequest) =>
      apiClient<AuthTokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    register: (payload: UserRegisterRequest) =>
      apiClient<AuthTokenResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    verifyOtp: (payload: OtpVerifyRequest) =>
      apiClient<AuthTokenResponse>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    resendOtp: (payload: OtpResendRequest) =>
      apiClient<{ status: string; message: string; demo_otp: string }>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    forgotPassword: (payload: ForgotPasswordRequest) =>
      apiClient<{ status: string; message: string; demo_otp: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    resetPassword: (payload: ResetPasswordRequest) =>
      apiClient<{ status: string; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateOnboarding: (payload: OnboardingUpdateRequest) =>
      apiClient<User>('/auth/onboarding', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    switchRole: (payload: RoleSwitchRequest) =>
      apiClient<User>('/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    changePassword: (payload: ChangePasswordRequest) =>
      apiClient<{ status: string; message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    me: () => apiClient<User>('/auth/me')
  },

  // Locations
  locations: {
    list: () => apiClient<Location[]>('/locations'),
    hierarchy: () => apiClient<LocationHierarchy>('/locations/hierarchy')
  },

  // Crops
  crops: {
    list: (params?: { category?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.search) q.set('search', params.search);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient<Crop[]>(`/crops${qs}`);
    },
    getById: (id: number) => apiClient<Crop>(`/crops/${id}`),
    myCrops: () => apiClient<UserCrop[]>('/crops/my'),
    enrollCrop: (payload: UserCropCreate) =>
      apiClient<UserCrop>('/crops/my', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateCrop: (id: number, payload: UserCropUpdate) =>
      apiClient<UserCrop>(`/crops/my/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    deleteCrop: (id: number) =>
      apiClient<{ status: string; message: string }>(`/crops/my/${id}`, {
        method: 'DELETE'
      })
  },

  // Weather
  weather: {
    current: (taluk?: string) => {
      const q = taluk ? `?taluk=${encodeURIComponent(taluk)}` : '';
      return apiClient<WeatherRecord>(`/weather/current${q}`);
    },
    forecast: (taluk?: string) => {
      const q = taluk ? `?taluk=${encodeURIComponent(taluk)}` : '';
      return apiClient<WeatherForecastResponse>(`/weather/forecast${q}`);
    }
  },

  // Advisory
  advisory: {
    list: (params?: { crop_id?: number; severity?: string; category?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.crop_id) q.set('crop_id', String(params.crop_id));
      if (params?.severity) q.set('severity', params.severity);
      if (params?.category) q.set('category', params.category);
      if (params?.search) q.set('search', params.search);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient<AdvisoryItem[]>(`/advisory${qs}`);
    },
    getById: (id: number) => apiClient<AdvisoryItem>(`/advisory/${id}`),
    recommendations: () => apiClient<AdvisoryRecommendation[]>('/advisory/recommendations'),
    diagnose: (payload: DiseaseDiagnosisRequest) =>
      apiClient<DiseaseDiagnosisResponse>('/advisory/diagnose', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  },

  // Community
  community: {
    groups: (params?: { taluk?: string; village?: string; crop_id?: number; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.taluk) q.set('taluk', params.taluk);
      if (params?.village) q.set('village', params.village);
      if (params?.crop_id) q.set('crop_id', String(params.crop_id));
      if (params?.search) q.set('search', params.search);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient<CommunityGroup[]>(`/community/groups${qs}`);
    },
    getGroup: (id: number) => apiClient<CommunityGroup>(`/community/groups/${id}`),
    createGroup: (payload: CommunityGroupCreate) =>
      apiClient<CommunityGroup>('/community/groups', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    joinGroup: (id: number) =>
      apiClient<{ status: string; message: string }>(`/community/groups/${id}/join`, {
        method: 'POST'
      }),
    groupRequests: (groupId: number) =>
      apiClient<GroupMember[]>(`/community/groups/${groupId}/requests`),
    approveRequest: (groupId: number, requestId: number) =>
      apiClient<GroupMember>(`/community/groups/${groupId}/requests/${requestId}/approve`, {
        method: 'POST'
      }),
    rejectRequest: (groupId: number, requestId: number) =>
      apiClient<GroupMember>(`/community/groups/${groupId}/requests/${requestId}/reject`, {
        method: 'POST'
      }),
    groupMembers: (groupId: number) =>
      apiClient<GroupMember[]>(`/community/groups/${groupId}/members`),
    updateMemberRole: (groupId: number, userId: number, role: 'admin' | 'moderator' | 'member') =>
      apiClient<{ status: string; message: string }>(`/community/groups/${groupId}/members/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role })
      }),
    removeMember: (groupId: number, userId: number) =>
      apiClient<{ status: string; message: string }>(`/community/groups/${groupId}/members/${userId}`, {
        method: 'DELETE'
      }),
    announcements: (groupId: number) =>
      apiClient<GroupAnnouncement[]>(`/community/groups/${groupId}/announcements`),
    createAnnouncement: (groupId: number, payload: GroupAnnouncementCreate) =>
      apiClient<GroupAnnouncement>(`/community/groups/${groupId}/announcements`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    posts: (params?: {
      search?: string;
      crop_id?: number;
      topic?: string;
      taluk?: string;
      village?: string;
      group_id?: number;
      filter_type?: 'all' | 'my' | 'saved';
      page?: number;
      limit?: number;
    }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.crop_id) q.set('crop_id', String(params.crop_id));
      if (params?.topic) q.set('topic', params.topic);
      if (params?.taluk) q.set('taluk', params.taluk);
      if (params?.village) q.set('village', params.village);
      if (params?.group_id) q.set('group_id', String(params.group_id));
      if (params?.filter_type) q.set('filter_type', params.filter_type);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient<CommunityPost[]>(`/community/posts${qs}`);
    },
    getPost: (id: number) => apiClient<CommunityPost>(`/community/posts/${id}`),
    createPost: (payload: CommunityPostCreate) =>
      apiClient<CommunityPost>('/community/posts', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    likePost: (id: number) =>
      apiClient<{ is_liked: boolean; likes_count: number }>(`/community/posts/${id}/like`, {
        method: 'POST'
      }),
    savePost: (id: number) =>
      apiClient<{ is_saved: boolean; message: string }>(`/community/posts/${id}/save`, {
        method: 'POST'
      }),
    reportPost: (id: number, payload: ContentReportCreate) =>
      apiClient<ContentReport>(`/community/posts/${id}/report`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    comments: (postId: number) =>
      apiClient<PostComment[]>(`/community/posts/${postId}/comments`),
    createComment: (postId: number, payload: PostCommentCreate) =>
      apiClient<PostComment>(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  },

  // Marketplace (F4)
  market: {
    listings: (params?: {
      crop_id?: number;
      variety?: string;
      taluk?: string;
      district?: string;
      status?: string;
      is_collective?: boolean;
      filter_type?: 'all' | 'my' | 'saved';
      search?: string;
      sort_by?: string;
      page?: number;
      limit?: number;
    }) => {
      const q = new URLSearchParams();
      if (params?.crop_id) q.set('crop_id', String(params.crop_id));
      if (params?.variety) q.set('variety', params.variety);
      if (params?.taluk) q.set('taluk', params.taluk);
      if (params?.district) q.set('district', params.district);
      if (params?.status) q.set('status', params.status);
      if (params?.is_collective !== undefined) q.set('is_collective', String(params.is_collective));
      if (params?.filter_type) q.set('filter_type', params.filter_type);
      if (params?.search) q.set('search', params.search);
      if (params?.sort_by) q.set('sort_by', params.sort_by);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient<MarketListing[]>(`/market/listings${qs}`);
    },
    getListing: (id: number) => apiClient<MarketListing>(`/market/listings/${id}`),
    createListing: (payload: MarketListingCreate) =>
      apiClient<MarketListing>('/market/listings', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateListing: (id: number, payload: MarketListingUpdate) =>
      apiClient<MarketListing>(`/market/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    updateListingStatus: (id: number, status: 'active' | 'paused' | 'reserved' | 'sold') =>
      apiClient<{ status: string; listing_status: string; message: string }>(
        `/market/listings/${id}/status?status=${status}`,
        { method: 'PATCH' }
      ),
    deleteListing: (id: number) =>
      apiClient<{ status: string; message: string }>(`/market/listings/${id}`, {
        method: 'DELETE'
      }),
    toggleSaveListing: (id: number) =>
      apiClient<{ is_saved: boolean; message: string }>(`/market/listings/${id}/save`, {
        method: 'POST'
      }),
    contributeToCollective: (id: number, payload: GroupListingContributionCreate) =>
      apiClient<GroupListingContribution>(`/market/listings/${id}/contribute`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    enquiries: (params?: { role?: 'farmer' | 'buyer'; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.role) q.set('role', params.role);
      if (params?.status) q.set('status', params.status);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient<MarketEnquiry[]>(`/market/enquiries${qs}`);
    },
    getEnquiry: (id: number) => apiClient<MarketEnquiry>(`/market/enquiries/${id}`),
    createEnquiry: (payload: MarketEnquiryCreate) =>
      apiClient<MarketEnquiry>('/market/enquiries', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateEnquiryStatus: (id: number, payload: MarketEnquiryStatusUpdate) =>
      apiClient<MarketEnquiry>(`/market/enquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    sendEnquiryMessage: (id: number, payload: EnquiryMessageCreate) =>
      apiClient<EnquiryMessage>(`/market/enquiries/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  },

  // Profile & Settings
  profile: {
    get: () => apiClient<User>('/profile'),
    update: (payload: UserProfileUpdate) =>
      apiClient<User>('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
  },

  // Notification Center
  notifications: {
    list: (params?: { type?: string; unread_only?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.type && params.type !== 'all') q.set('type', params.type);
      if (params?.unread_only) q.set('unread_only', 'true');
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient<Notification[]>(`/notifications${qs}`);
    },
    markRead: (id: number) =>
      apiClient<Notification>(`/notifications/${id}/read`, {
        method: 'PATCH'
      }),
    markAllRead: () =>
      apiClient<{ status: string; message: string }>('/notifications/read-all', {
        method: 'PATCH'
      }),
    preferences: () => apiClient<UserNotificationPreference>('/notifications/preferences'),
    updatePreferences: (payload: UserNotificationPreferenceUpdate) =>
      apiClient<UserNotificationPreference>('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
  },

  // Support & Help Center
  support: {
    createTicket: (payload: SupportTicketCreate) =>
      apiClient<SupportTicket>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    tickets: () => apiClient<SupportTicket[]>('/support/tickets')
  },

  // Platform Administration
  admin: {
    stats: () => apiClient<AdminPlatformStats>('/admin/stats'),
    users: (params?: { search?: string; role?: string; is_active?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.role && params.role !== 'all') q.set('role', params.role);
      if (params?.is_active !== undefined) q.set('is_active', String(params.is_active));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient<User[]>(`/admin/users${qs}`);
    },
    updateUserStatus: (id: number, payload: AdminUserUpdate) =>
      apiClient<User>(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    updateUserBadges: (id: number, payload: AdminUserBadgeUpdate) =>
      apiClient<User>(`/admin/users/${id}/badges`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    reports: (status?: string) =>
      apiClient<AdminReportItem[]>(`/admin/reports?status=${status || 'all'}`),
    resolveReport: (id: number, payload: AdminReportResolveRequest) =>
      apiClient<{ status: string; report_status: string; message: string }>(
        `/admin/reports/${id}/resolve`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload)
        }
      ),
    dismissReport: (id: number) =>
      apiClient<{ status: string; report_status: string; message: string }>(
        `/admin/reports/${id}/dismiss`,
        { method: 'PATCH' }
      ),
    groups: () => apiClient<any[]>('/admin/groups'),
    updateGroupStatus: (id: number, payload: AdminGroupStatusUpdate) =>
      apiClient<any>(`/admin/groups/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    crops: () => apiClient<Crop[]>('/admin/crops'),
    createCrop: (payload: AdminCropCreate) =>
      apiClient<Crop>('/admin/crops', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateCrop: (id: number, payload: AdminCropUpdate) =>
      apiClient<Crop>(`/admin/crops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    supportTickets: () => apiClient<SupportTicket[]>('/admin/support-tickets'),
    updateSupportTicket: (id: number, payload: SupportTicketStatusUpdate) =>
      apiClient<SupportTicket>(`/admin/support-tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }),
    auditLogs: () => apiClient<ModerationAuditLog[]>('/admin/audit-logs')
  }
};
