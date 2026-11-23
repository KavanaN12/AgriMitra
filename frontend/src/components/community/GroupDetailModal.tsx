import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  MessageSquare,
  Bell,
  Shield,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  UserCheck,
  UserPlus,
  Send,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { LoadingState } from '../common/LoadingState';
import {
  useCommunityGroup,
  useCommunityPosts,
  useGroupAnnouncements,
  useCreateAnnouncement,
  useGroupMembers,
  useGroupRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
  useUpdateMemberRole,
  useRemoveMember,
  useJoinGroup
} from '../../hooks/useAgriQuery';
import { CommunityGroup } from '../../types/api';

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number | null;
  onOpenCreatePost: (groupId: number) => void;
  onOpenPostDetail: (postId: number) => void;
}

export function GroupDetailModal({
  isOpen,
  onClose,
  groupId,
  onOpenCreatePost,
  onOpenPostDetail
}: GroupDetailModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const [activeTab, setActiveTab] = useState<'discussions' | 'announcements' | 'members'>('discussions');

  const { data: group, isLoading: groupLoading } = useCommunityGroup(groupId || undefined);
  const { data: posts = [], isLoading: postsLoading } = useCommunityPosts({
    group_id: groupId || undefined
  });
  const { data: announcements = [], isLoading: announcementsLoading } = useGroupAnnouncements(
    groupId || undefined
  );
  const { data: members = [] } = useGroupMembers(groupId || undefined);
  const { data: requests = [] } = useGroupRequests(groupId || undefined);

  // Mutations
  const joinGroupMutation = useJoinGroup();
  const createAnnouncementMutation = useCreateAnnouncement();
  const approveRequestMutation = useApproveJoinRequest();
  const rejectRequestMutation = useRejectJoinRequest();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  if (!isOpen || !groupId) return null;

  const isAdminOrMod = group?.membership_status === 'admin' || group?.membership_status === 'moderator';
  const isAdmin = group?.membership_status === 'admin';

  const handleJoin = async () => {
    if (!groupId) return;
    await joinGroupMutation.mutateAsync(groupId);
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim() || !groupId) return;

    try {
      await createAnnouncementMutation.mutateAsync({
        groupId,
        payload: {
          title: annTitle.trim(),
          content: annContent.trim(),
          priority: annPriority
        }
      });
      setAnnTitle('');
      setAnnContent('');
      setAnnPriority('normal');
      setIsPostingAnn(false);
    } catch (err) {
      console.error('Failed to post announcement:', err);
    }
  };

  const handleApprove = async (reqId: number) => {
    if (!groupId) return;
    await approveRequestMutation.mutateAsync({ groupId, requestId: reqId });
  };

  const handleReject = async (reqId: number) => {
    if (!groupId) return;
    await rejectRequestMutation.mutateAsync({ groupId, requestId: reqId });
  };

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'moderator' | 'member') => {
    if (!groupId) return;
    await updateRoleMutation.mutateAsync({ groupId, userId, role: newRole });
  };

  const handleRemoveMember = async (userId: number) => {
    if (!groupId) return;
    await removeMemberMutation.mutateAsync({ groupId, userId });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={group ? (isKn ? group.name_kn : group.name_en) : 'Group'}
      className="max-w-3xl"
    >
      {groupLoading || !group ? (
        <div className="py-12">
          <LoadingState message="Loading village group..." />
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Group Header Card */}
          <div className="bg-gradient-to-r from-forest-50 to-amber-50/50 p-4 rounded-2xl border border-forest-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-earth-900">
                  {isKn ? group.name_kn : group.name_en}
                </h3>
                {(group.crop_name_en || group.crop_name_kn) && (
                  <Badge variant="outline" className="text-xs bg-white text-forest-800 border-forest-300">
                    {isKn ? group.crop_name_kn || group.crop_name_en : group.crop_name_en}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-earth-600 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-forest-600" />
                  {group.village}, {group.taluk} ({group.district})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-forest-600" />
                  {group.member_count} {t('community.members')}
                </span>
              </div>
            </div>

            {/* Membership Button or Status */}
            <div>
              {group.membership_status === 'admin' ? (
                <Badge variant="warning" className="px-3 py-1 text-xs font-semibold flex items-center gap-1 bg-amber-100 text-amber-900 border-amber-300">
                  <Shield className="w-3.5 h-3.5" />
                  {t('community.admin_badge')}
                </Badge>
              ) : group.membership_status === 'moderator' ? (
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold flex items-center gap-1 bg-purple-100 text-purple-900 border-purple-300">
                  <Shield className="w-3.5 h-3.5" />
                  {t('community.moderator_badge')}
                </Badge>
              ) : group.membership_status === 'member' ? (
                <Badge variant="success" className="px-3 py-1 text-xs font-semibold flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
                  <UserCheck className="w-3.5 h-3.5" />
                  {t('community.joined')}
                </Badge>
              ) : group.membership_status === 'pending' ? (
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border-amber-300">
                  {t('community.join_pending')}
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={handleJoin}
                  disabled={joinGroupMutation.isPending}
                  className="bg-forest-700 hover:bg-forest-800 text-white shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  {joinGroupMutation.isPending ? 'Requesting...' : t('community.join_group')}
                </Button>
              )}
            </div>
          </div>

          {/* Description & Rules accordion/banner */}
          <div className="bg-earth-50/70 p-3 rounded-xl border border-earth-200 text-xs text-earth-700 space-y-1">
            <p className="leading-relaxed">
              {isKn ? group.description_kn || group.description_en : group.description_en}
            </p>
            {(group.rules_en || group.rules_kn) && (
              <p className="text-[11px] text-earth-500 italic pt-1 border-t border-earth-200">
                <strong>{t('community.rules_title')}:</strong>{' '}
                {isKn ? group.rules_kn || group.rules_en : group.rules_en}
              </p>
            )}
          </div>

          {/* Group Navigation Tabs */}
          <div className="flex border-b border-earth-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('discussions')}
              className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'discussions'
                  ? 'border-forest-700 text-forest-900 font-bold'
                  : 'border-transparent text-earth-500 hover:text-earth-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t('community.group_tabs_discussions')}</span>
              <span className="bg-earth-100 text-earth-700 px-1.5 py-0.2 rounded-full text-[10px]">
                {posts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'announcements'
                  ? 'border-forest-700 text-forest-900 font-bold'
                  : 'border-transparent text-earth-500 hover:text-earth-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t('community.group_tabs_announcements')}</span>
              <span className="bg-earth-100 text-earth-700 px-1.5 py-0.2 rounded-full text-[10px]">
                {announcements.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'members'
                  ? 'border-forest-700 text-forest-900 font-bold'
                  : 'border-transparent text-earth-500 hover:text-earth-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('community.group_tabs_members')}</span>
              {requests.length > 0 && isAdminOrMod && (
                <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {requests.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: DISCUSSIONS */}
          {activeTab === 'discussions' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-earth-600 font-medium">
                  Village Discussions & Crop Q&A
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenCreatePost(group.id)}
                  className="text-xs text-forest-800 border-forest-300 hover:bg-forest-50"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {t('community.create_post')}
                </Button>
              </div>

              {postsLoading ? (
                <div className="py-6 text-center text-xs text-earth-500">
                  Loading discussions...
                </div>
              ) : posts.length === 0 ? (
                <div className="py-8 text-center text-xs text-earth-500 italic bg-earth-50 rounded-xl">
                  {t('community.no_posts_found')}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {posts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onOpenPostDetail(p.id)}
                      className="p-3 bg-white rounded-xl border border-earth-200 hover:border-forest-400 hover:shadow-xs transition cursor-pointer text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-earth-900">{p.author_name}</span>
                          {p.author_village && (
                            <span className="text-earth-400 text-[11px]">({p.author_village})</span>
                          )}
                        </div>
                        <span className="text-[10px] text-earth-400">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-earth-900 text-xs sm:text-sm">{p.title}</h4>
                      <p className="text-earth-600 line-clamp-2">{p.content}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-earth-500">
                        <span>❤️ {p.likes_count} {t('community.likes')}</span>
                        <span>💬 {p.comments_count} {t('community.replies')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-3 pt-1">
              {/* If Admin/Mod, provide announcement publishing UI */}
              {isAdminOrMod && (
                <div className="p-3 bg-forest-50/60 rounded-xl border border-forest-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-forest-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                      {t('community.publish_announcement')}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPostingAnn(!isPostingAnn)}
                      className="text-xs text-forest-800"
                    >
                      {isPostingAnn ? 'Close' : '+ Write Announcement'}
                    </Button>
                  </div>

                  {isPostingAnn && (
                    <form onSubmit={handlePostAnnouncement} className="space-y-2.5 pt-1">
                      <Input
                        value={annTitle}
                        onChange={e => setAnnTitle(e.target.value)}
                        placeholder={t('community.announcement_title')}
                        className="text-xs"
                      />
                      <Textarea
                        value={annContent}
                        onChange={e => setAnnContent(e.target.value)}
                        placeholder={t('community.announcement_content')}
                        rows={3}
                        className="text-xs"
                      />
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-3 text-xs">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="annPriority"
                              value="normal"
                              checked={annPriority === 'normal'}
                              onChange={() => setAnnPriority('normal')}
                            />
                            <span>{t('community.announcement_normal')}</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer text-red-700 font-semibold">
                            <input
                              type="radio"
                              name="annPriority"
                              value="urgent"
                              checked={annPriority === 'urgent'}
                              onChange={() => setAnnPriority('urgent')}
                            />
                            <span>{t('community.announcement_urgent')}</span>
                          </label>
                        </div>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!annTitle.trim() || !annContent.trim() || createAnnouncementMutation.isPending}
                          className="bg-forest-700 hover:bg-forest-800 text-white text-xs"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Publish
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Announcement List */}
              {announcementsLoading ? (
                <div className="py-6 text-center text-xs text-earth-500">
                  Loading announcements...
                </div>
              ) : announcements.length === 0 ? (
                <div className="py-8 text-center text-xs text-earth-500 italic bg-earth-50 rounded-xl">
                  No announcements broadcast yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {announcements.map(a => (
                    <div
                      key={a.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        a.priority === 'urgent'
                          ? 'bg-red-50/70 border-red-200'
                          : 'bg-white border-earth-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {a.priority === 'urgent' ? (
                            <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {t('community.announcement_urgent')}
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px]">
                              {t('community.announcement_normal')}
                            </Badge>
                          )}
                          <span className="font-semibold text-earth-900">{a.author_name}</span>
                        </div>
                        <span className="text-[10px] text-earth-500">
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-earth-900 text-xs sm:text-sm">{a.title}</h4>
                      <p className="text-earth-700 whitespace-pre-line leading-relaxed">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEMBERS & REQUESTS */}
          {activeTab === 'members' && (
            <div className="space-y-4 pt-1">
              {/* Pending Requests for Admins/Mods */}
              {isAdminOrMod && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-earth-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-forest-700" />
                    <span>{t('community.pending_requests')} ({requests.length})</span>
                  </h4>

                  {requests.length === 0 ? (
                    <p className="text-xs text-earth-500 italic bg-earth-50 p-2.5 rounded-lg">
                      No pending membership join requests.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {requests.map(r => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs gap-2"
                        >
                          <div>
                            <span className="font-semibold text-earth-900">{r.user_name}</span>
                            <div className="text-[11px] text-earth-500">
                              {r.user_village || 'Mandya'} • {r.user_phone}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApprove(r.id)}
                              className="bg-green-700 hover:bg-green-800 text-white text-[11px] py-1 px-2.5 h-7"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t('community.approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(r.id)}
                              className="text-red-700 border-red-200 hover:bg-red-50 text-[11px] py-1 px-2 h-7"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              {t('community.reject')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Approved Members List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-earth-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-forest-700" />
                  <span>Approved Group Members ({members.length})</span>
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {members.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-earth-200 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-800 font-bold flex items-center justify-center text-xs">
                          {m.user_name ? m.user_name.charAt(0) : 'F'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-earth-900">{m.user_name}</span>
                            {m.role === 'admin' ? (
                              <Badge variant="warning" className="text-[9px] py-0 px-1 bg-amber-100 text-amber-800">
                                Admin
                              </Badge>
                            ) : m.role === 'moderator' ? (
                              <Badge variant="secondary" className="text-[9px] py-0 px-1 bg-purple-100 text-purple-800">
                                Moderator
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] py-0 px-1">
                                Member
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-earth-500">
                            {m.user_village || 'Mandya'}
                          </div>
                        </div>
                      </div>

                      {/* Admin moderation controls */}
                      {isAdmin && m.user_id !== group.creator_id && (
                        <div className="flex items-center gap-1">
                          {m.role === 'member' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(m.user_id, 'moderator')}
                              className="text-[10px] h-6 px-1.5"
                            >
                              Make Mod
                            </Button>
                          ) : m.role === 'moderator' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(m.user_id, 'member')}
                              className="text-[10px] h-6 px-1.5"
                            >
                              To Member
                            </Button>
                          ) : null}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(m.user_id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 text-[10px] h-6 px-1.5"
                            title="Remove member"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
