import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Bookmark,
  Share2,
  Flag,
  MessageCircle,
  MapPin,
  Calendar,
  Send,
  CornerDownRight,
  Pin,
  UserCheck,
  Check
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { LoadingState } from '../common/LoadingState';
import {
  useCommunityPost,
  usePostComments,
  useCreateComment,
  useLikePost,
  useSavePost
} from '../../hooks/useAgriQuery';
import { CommunityPost } from '../../types/api';
import { ReportModal } from './ReportModal';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
  onPostUpdated?: () => void;
}

export function PostDetailModal({
  isOpen,
  onClose,
  postId,
  onPostUpdated
}: PostDetailModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: post, isLoading: postLoading } = useCommunityPost(postId || undefined);
  const { data: comments = [], isLoading: commentsLoading } = usePostComments(postId || undefined);

  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const createCommentMutation = useCreateComment();

  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyToName, setReplyToName] = useState<string>('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [localLikes, setLocalLikes] = useState<number | null>(null);
  const [localIsLiked, setLocalIsLiked] = useState<boolean | null>(null);
  const [localIsSaved, setLocalIsSaved] = useState<boolean | null>(null);

  if (!isOpen || !postId) return null;

  const isLiked = localIsLiked ?? post?.is_liked ?? false;
  const likesCount = localLikes ?? post?.likes_count ?? 0;
  const isSaved = localIsSaved ?? post?.is_saved ?? false;

  const handleLike = async () => {
    if (!postId || !post) return;
    const nextLiked = !isLiked;
    const nextCount = isLiked ? Math.max(0, likesCount - 1) : likesCount + 1;
    setLocalIsLiked(nextLiked);
    setLocalLikes(nextCount);
    try {
      const res = await likeMutation.mutateAsync(postId);
      setLocalLikes(res.likes_count);
      setLocalIsLiked(res.is_liked);
    } catch {
      setLocalIsLiked(isLiked);
      setLocalLikes(likesCount);
    }
  };

  const handleSave = async () => {
    if (!postId || !post) return;
    const nextSaved = !isSaved;
    setLocalIsSaved(nextSaved);
    try {
      const res = await saveMutation.mutateAsync(postId);
      setLocalIsSaved(res.is_saved);
    } catch {
      setLocalIsSaved(isSaved);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !postId) return;

    try {
      await createCommentMutation.mutateAsync({
        postId,
        payload: {
          content: commentText.trim(),
          parent_id: replyToId || undefined
        }
      });
      setCommentText('');
      setReplyToId(null);
      setReplyToName('');
      onPostUpdated?.();
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: number) => comments.filter(c => c.parent_id === parentId);

  const topicLabels: Record<string, string> = {
    general: t('community.topic_general'),
    cultivation: t('community.topic_cultivation'),
    pest_control: t('community.topic_pest_control'),
    market_trend: t('community.topic_market_trend'),
    machinery: t('community.topic_machinery'),
    schemes: t('community.topic_schemes')
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={post?.title || 'Discussion'}
        className="max-w-2xl"
      >
        {postLoading || !post ? (
          <div className="py-12">
            <LoadingState message="Loading discussion..." />
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Post Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-earth-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 font-bold flex items-center justify-center text-sm shadow-inner">
                  {post.author_name ? post.author_name.charAt(0) : 'R'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-earth-900 text-xs sm:text-sm">
                      {post.author_name}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 uppercase font-medium">
                      {post.author_role || 'farmer'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-earth-500 mt-0.5">
                    {post.author_village && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-forest-600" />
                        {post.author_village}, {post.author_taluk}
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {post.is_pinned && (
                  <Badge variant="warning" className="text-[11px] flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    {t('community.pinned')}
                  </Badge>
                )}
                {post.topic && (
                  <Badge variant="secondary" className="text-[11px]">
                    {topicLabels[post.topic] || post.topic}
                  </Badge>
                )}
                {(post.crop_name_en || post.crop_name_kn) && (
                  <Badge variant="outline" className="text-[11px] border-forest-300 bg-forest-50/50 text-forest-800">
                    {isKn ? post.crop_name_kn || post.crop_name_en : post.crop_name_en}
                  </Badge>
                )}
              </div>
            </div>

            {/* Group Attribution if posted in group */}
            {post.group_name && (
              <div className="text-xs bg-earth-50 text-earth-700 px-3 py-1.5 rounded-lg border border-earth-200">
                Posted in: <strong>{post.group_name}</strong>
              </div>
            )}

            {/* Post Content */}
            <div className="text-xs sm:text-sm text-earth-800 leading-relaxed whitespace-pre-line bg-earth-50/40 p-3.5 rounded-xl border border-earth-100">
              {post.content}
            </div>

            {/* Post Image Attachment */}
            {post.image_url && (
              <div className="rounded-xl overflow-hidden border border-earth-200 max-h-80 bg-earth-100">
                <img
                  src={post.image_url}
                  alt="Post attachment"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Post Actions Bar */}
            <div className="flex items-center justify-between gap-2 py-2 border-y border-earth-100 text-xs text-earth-600">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                    isLiked
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-earth-200 hover:bg-earth-50 text-earth-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
                  <span>{likesCount} {t('community.like')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                    isSaved
                      ? 'border-forest-400 bg-forest-50 text-forest-800'
                      : 'border-earth-200 hover:bg-earth-50 text-earth-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-forest-700 text-forest-700' : ''}`} />
                  <span>{isSaved ? t('community.saved') : t('community.save')}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 rounded-lg text-earth-600 hover:bg-earth-100 transition flex items-center gap-1 text-xs"
                  title="Copy link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="p-1.5 rounded-lg text-earth-500 hover:text-red-600 hover:bg-red-50 transition flex items-center gap-1 text-xs"
                  title={t('community.report')}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('community.report')}</span>
                </button>
              </div>
            </div>

            {/* Comments & Responses Section */}
            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-xs sm:text-sm text-earth-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-forest-700" />
                <span>
                  {t('community.discussions')} ({comments.length})
                </span>
              </h3>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-2">
                {replyToId && (
                  <div className="flex items-center justify-between px-2.5 py-1 bg-forest-50 text-forest-800 rounded-lg text-[11px]">
                    <span className="flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3" />
                      Replying to <strong>{replyToName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyToId(null);
                        setReplyToName('');
                      }}
                      className="text-earth-500 hover:text-earth-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder={t('community.add_comment')}
                    className="text-xs min-h-[60px]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!commentText.trim() || createCommentMutation.isPending}
                    className="self-end bg-forest-700 hover:bg-forest-800 text-white shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>

              {/* Comment Thread List */}
              {commentsLoading ? (
                <div className="py-4 text-center text-xs text-earth-500">
                  Loading responses...
                </div>
              ) : topLevelComments.length === 0 ? (
                <div className="py-6 text-center text-xs text-earth-500 italic bg-earth-50/50 rounded-xl">
                  {t('community.no_comments')}
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {topLevelComments.map(c => {
                    const replies = getReplies(c.id);
                    return (
                      <div key={c.id} className="space-y-2">
                        {/* Top-level comment */}
                        <div className="p-3 bg-white rounded-xl border border-earth-200 shadow-xs space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-earth-500">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-earth-900">
                                {c.author_name}
                              </span>
                              {c.author_village && (
                                <span className="text-earth-400">
                                  ({c.author_village})
                                </span>
                              )}
                            </div>
                            <span>{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-earth-800 leading-normal">{c.content}</p>
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyToId(c.id);
                                setReplyToName(c.author_name || '');
                              }}
                              className="text-[11px] font-medium text-forest-700 hover:underline flex items-center gap-1"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              {t('community.reply')}
                            </button>
                          </div>
                        </div>

                        {/* Threaded replies */}
                        {replies.length > 0 && (
                          <div className="pl-6 space-y-2 border-l-2 border-forest-100">
                            {replies.map(r => (
                              <div
                                key={r.id}
                                className="p-2.5 bg-earth-50/80 rounded-xl border border-earth-200 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px] text-earth-500">
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold text-earth-900">
                                      {r.author_name}
                                    </span>
                                    {r.author_village && (
                                      <span className="text-earth-400">
                                        ({r.author_village})
                                      </span>
                                    )}
                                  </div>
                                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-earth-800">{r.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Report Inappropriate Content Dialog */}
      {post && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          postId={post.id}
          postTitle={post.title}
        />
      )}
    </>
  );
}
