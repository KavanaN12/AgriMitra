import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '../api/services';
import {
  CommunityPostCreate,
  CommunityGroupCreate,
  GroupAnnouncementCreate,
  PostCommentCreate,
  ContentReportCreate,
  MarketListingCreate,
  MarketListingUpdate,
  MarketEnquiryCreate,
  MarketEnquiryStatusUpdate,
  EnquiryMessageCreate,
  GroupListingContributionCreate,
  UserCropCreate,
  UserCropUpdate,
  DiseaseDiagnosisRequest,
  UserProfileUpdate,
  UserNotificationPreferenceUpdate,
  SupportTicketCreate,
  SupportTicketStatusUpdate,
  AdminUserUpdate,
  AdminUserBadgeUpdate,
  AdminReportResolveRequest,
  AdminGroupStatusUpdate,
  AdminCropCreate,
  AdminCropUpdate
} from '../types/api';

// Network online/offline status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

// Health Check
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health.check(),
    staleTime: 30000,
    retry: 1
  });
}

// Current User Profile
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.me(),
    staleTime: 60000,
    retry: false
  });
}

// Locations in Mandya
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => api.locations.list(),
    staleTime: 300000 // 5 minutes
  });
}

export function useLocationHierarchy() {
  return useQuery({
    queryKey: ['locations', 'hierarchy'],
    queryFn: () => api.locations.hierarchy(),
    staleTime: 300000
  });
}

// Crops Library & Management
export function useCrops(category?: string, search?: string) {
  return useQuery({
    queryKey: ['crops', { category, search }],
    queryFn: () => api.crops.list({ category, search }),
    staleTime: 300000
  });
}

export function useCrop(id?: number) {
  return useQuery({
    queryKey: ['crop', id],
    queryFn: () => (id ? api.crops.getById(id) : null),
    enabled: !!id,
    staleTime: 300000
  });
}

export function useMyCrops() {
  return useQuery({
    queryKey: ['myCrops'],
    queryFn: () => api.crops.myCrops(),
    staleTime: 60000
  });
}

export function useEnrollCrop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCropCreate) => api.crops.enrollCrop(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCrops'] });
      queryClient.invalidateQueries({ queryKey: ['advisoryRecommendations'] });
    }
  });
}

export function useUpdateUserCrop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserCropUpdate }) =>
      api.crops.updateCrop(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCrops'] });
      queryClient.invalidateQueries({ queryKey: ['advisoryRecommendations'] });
    }
  });
}

export function useDeleteUserCrop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.crops.deleteCrop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCrops'] });
      queryClient.invalidateQueries({ queryKey: ['advisoryRecommendations'] });
    }
  });
}

// Weather & Forecast
export function useWeather(taluk?: string) {
  return useQuery({
    queryKey: ['weather', { taluk }],
    queryFn: () => api.weather.current(taluk),
    staleTime: 60000
  });
}

export function useWeatherForecast(taluk?: string) {
  return useQuery({
    queryKey: ['weatherForecast', { taluk }],
    queryFn: () => api.weather.forecast(taluk),
    staleTime: 60000
  });
}

// Advisories & Rule Engine
export function useAdvisories(cropId?: number, category?: string, severity?: string) {
  return useQuery({
    queryKey: ['advisories', { cropId, category, severity }],
    queryFn: () => api.advisory.list({ crop_id: cropId, category, severity }),
    staleTime: 60000
  });
}

export function useAdvisoryDetail(id?: number) {
  return useQuery({
    queryKey: ['advisory', id],
    queryFn: () => (id ? api.advisory.getById(id) : null),
    enabled: !!id,
    staleTime: 60000
  });
}

export function useAdvisoryRecommendations() {
  return useQuery({
    queryKey: ['advisoryRecommendations'],
    queryFn: () => api.advisory.recommendations(),
    staleTime: 60000
  });
}

export function useDiseaseDiagnose() {
  return useMutation({
    mutationFn: (payload: DiseaseDiagnosisRequest) => api.advisory.diagnose(payload)
  });
}

// ======================================================================
// Community Groups & Posts (F3)
// ======================================================================

export function useCommunityGroups(params?: {
  taluk?: string;
  village?: string;
  crop_id?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['communityGroups', params],
    queryFn: () => api.community.groups(params),
    staleTime: 60000
  });
}

export function useCommunityGroup(id?: number) {
  return useQuery({
    queryKey: ['communityGroup', id],
    queryFn: () => (id ? api.community.getGroup(id) : null),
    enabled: !!id,
    staleTime: 60000
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommunityGroupCreate) => api.community.createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
    }
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.community.joinGroup(id),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['communityGroup', groupId] });
    }
  });
}

export function useGroupRequests(groupId?: number) {
  return useQuery({
    queryKey: ['groupRequests', groupId],
    queryFn: () => (groupId ? api.community.groupRequests(groupId) : []),
    enabled: !!groupId,
    staleTime: 30000
  });
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, requestId }: { groupId: number; requestId: number }) =>
      api.community.approveRequest(groupId, requestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupRequests', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['communityGroup', variables.groupId] });
    }
  });
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, requestId }: { groupId: number; requestId: number }) =>
      api.community.rejectRequest(groupId, requestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupRequests', variables.groupId] });
    }
  });
}

export function useGroupMembers(groupId?: number) {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => (groupId ? api.community.groupMembers(groupId) : []),
    enabled: !!groupId,
    staleTime: 30000
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      userId,
      role
    }: {
      groupId: number;
      userId: number;
      role: 'admin' | 'moderator' | 'member';
    }) => api.community.updateMemberRole(groupId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
    }
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      api.community.removeMember(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['communityGroup', variables.groupId] });
    }
  });
}

export function useGroupAnnouncements(groupId?: number) {
  return useQuery({
    queryKey: ['groupAnnouncements', groupId],
    queryFn: () => (groupId ? api.community.announcements(groupId) : []),
    enabled: !!groupId,
    staleTime: 30000
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      payload
    }: {
      groupId: number;
      payload: GroupAnnouncementCreate;
    }) => api.community.createAnnouncement(groupId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupAnnouncements', variables.groupId] });
    }
  });
}

export function useCommunityPosts(params?: {
  search?: string;
  crop_id?: number;
  topic?: string;
  taluk?: string;
  village?: string;
  group_id?: number;
  filter_type?: 'all' | 'my' | 'saved';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['communityPosts', params],
    queryFn: () => api.community.posts(params),
    staleTime: 30000
  });
}

export function useCommunityPost(id?: number) {
  return useQuery({
    queryKey: ['communityPost', id],
    queryFn: () => (id ? api.community.getPost(id) : null),
    enabled: !!id,
    staleTime: 30000
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommunityPostCreate) => api.community.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    }
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.community.likePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
    }
  });
}

export function useSavePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.community.savePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
    }
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ContentReportCreate }) =>
      api.community.reportPost(id, payload)
  });
}

export function usePostComments(postId?: number) {
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => (postId ? api.community.comments(postId) : []),
    enabled: !!postId,
    staleTime: 15000
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, payload }: { postId: number; payload: PostCommentCreate }) =>
      api.community.createComment(postId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost', variables.postId] });
    }
  });
}

// Market Listings & Enquiries
export function useMarketListings(params?: {
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
}) {
  return useQuery({
    queryKey: ['marketListings', params],
    queryFn: () => api.market.listings(params),
    staleTime: 30000
  });
}

export function useMarketListing(id?: number) {
  return useQuery({
    queryKey: ['marketListing', id],
    queryFn: () => (id ? api.market.getListing(id) : null),
    enabled: !!id,
    staleTime: 30000
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarketListingCreate) => api.market.createListing(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketListings'] });
    }
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MarketListingUpdate }) =>
      api.market.updateListing(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketListings'] });
      queryClient.invalidateQueries({ queryKey: ['marketListing', variables.id] });
    }
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'paused' | 'reserved' | 'sold' }) =>
      api.market.updateListingStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketListings'] });
      queryClient.invalidateQueries({ queryKey: ['marketListing', variables.id] });
    }
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.market.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketListings'] });
    }
  });
}

export function useSaveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.market.toggleSaveListing(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['marketListings'] });
      queryClient.invalidateQueries({ queryKey: ['marketListing', id] });
    }
  });
}

export function useContributeToCollective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GroupListingContributionCreate }) =>
      api.market.contributeToCollective(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketListings'] });
      queryClient.invalidateQueries({ queryKey: ['marketListing', variables.id] });
    }
  });
}

export function useMarketEnquiries(params?: { role?: 'farmer' | 'buyer'; status?: string }) {
  return useQuery({
    queryKey: ['marketEnquiries', params],
    queryFn: () => api.market.enquiries(params),
    staleTime: 30000
  });
}

export function useMarketEnquiry(id?: number) {
  return useQuery({
    queryKey: ['marketEnquiry', id],
    queryFn: () => (id ? api.market.getEnquiry(id) : null),
    enabled: !!id,
    staleTime: 15000
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarketEnquiryCreate) => api.market.createEnquiry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketEnquiries'] });
      queryClient.invalidateQueries({ queryKey: ['marketListings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useUpdateEnquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MarketEnquiryStatusUpdate }) =>
      api.market.updateEnquiryStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketEnquiries'] });
      queryClient.invalidateQueries({ queryKey: ['marketEnquiry', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useSendEnquiryMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EnquiryMessageCreate }) =>
      api.market.sendEnquiryMessage(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketEnquiry', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['marketEnquiries'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// --- Profile Hooks (F5) ---
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.profile.get(),
    staleTime: 60000
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserProfileUpdate) => api.profile.update(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });
}

// --- Notifications Hooks (F5) ---
export function useNotifications(params?: { type?: string; unread_only?: boolean }) {
  return useQuery({
    queryKey: ['notifications', params?.type, params?.unread_only],
    queryFn: () => api.notifications.list(params),
    staleTime: 15000
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.notifications.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: () => api.notifications.preferences(),
    staleTime: 60000
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserNotificationPreferenceUpdate) =>
      api.notifications.updatePreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['notificationPreferences'], data);
    }
  });
}

// --- Support Ticket Hooks (F5) ---
export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupportTicketCreate) => api.support.createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
    }
  });
}

export function useSupportTickets() {
  return useQuery({
    queryKey: ['supportTickets'],
    queryFn: () => api.support.tickets(),
    staleTime: 30000
  });
}

// --- Admin Hooks (F5) ---
export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.admin.stats(),
    staleTime: 30000
  });
}

export function useAdminUsers(params?: { search?: string; role?: string; is_active?: boolean }) {
  return useQuery({
    queryKey: ['adminUsers', params?.search, params?.role, params?.is_active],
    queryFn: () => api.admin.users(params),
    staleTime: 30000
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUserUpdate }) =>
      api.admin.updateUserStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    }
  });
}

export function useUpdateUserBadges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUserBadgeUpdate }) =>
      api.admin.updateUserBadges(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    }
  });
}

export function useAdminReports(status?: string) {
  return useQuery({
    queryKey: ['adminReports', status],
    queryFn: () => api.admin.reports(status),
    staleTime: 15000
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminReportResolveRequest }) =>
      api.admin.resolveReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    }
  });
}

export function useDismissReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.dismissReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    }
  });
}

export function useAdminGroups() {
  return useQuery({
    queryKey: ['adminGroups'],
    queryFn: () => api.admin.groups(),
    staleTime: 30000
  });
}

export function useUpdateGroupStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminGroupStatusUpdate }) =>
      api.admin.updateGroupStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGroups'] });
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    }
  });
}

export function useAdminCrops() {
  return useQuery({
    queryKey: ['adminCrops'],
    queryFn: () => api.admin.crops(),
    staleTime: 60000
  });
}

export function useCreateAdminCrop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCropCreate) => api.admin.createCrop(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCrops'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    }
  });
}

export function useUpdateAdminCrop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminCropUpdate }) =>
      api.admin.updateCrop(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCrops'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    }
  });
}

export function useAdminSupportTickets() {
  return useQuery({
    queryKey: ['adminSupportTickets'],
    queryFn: () => api.admin.supportTickets(),
    staleTime: 15000
  });
}

export function useUpdateAdminSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SupportTicketStatusUpdate }) =>
      api.admin.updateSupportTicket(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    }
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => api.admin.auditLogs(),
    staleTime: 15000
  });
}
