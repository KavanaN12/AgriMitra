import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Heart,
  MessageCircle,
  Bookmark,
  Pin,
  MapPin,
  Tag,
  Share2,
  Calendar,
  Sparkles,
  Check
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import {
  useCommunityPosts,
  useCrops,
  useLikePost,
  useSavePost
} from '../../hooks/useAgriQuery';
import { CommunityPost } from '../../types/api';

interface ForumFeedProps {
  onOpenPost: (postId: number) => void;
  onOpenCreatePost: () => void;
}

export function ForumFeed({ onOpenPost, onOpenCreatePost }: ForumFeedProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const [search, setSearch] = useState('');
  const [selectedCropId, setSelectedCropId] = useState<number | undefined>(undefined);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedTaluk, setSelectedTaluk] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'my' | 'saved'>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: crops = [] } = useCrops();
  const {
    data: posts = [],
    isLoading,
    refetch
  } = useCommunityPosts({
    search: search.trim() || undefined,
    crop_id: selectedCropId,
    topic: selectedTopic !== 'all' ? selectedTopic : undefined,
    taluk: selectedTaluk || undefined,
    filter_type: filterType
  });

  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  const taluks = [
    'Mandya',
    'Maddur',
    'Malavalli',
    'Pandavapura',
    'Srirangapatna',
    'Krishnarajpet',
    'Nagamangala'
  ];

  const topics = [
    { key: 'all', label: t('community.topic_all') },
    { key: 'cultivation', label: t('community.topic_cultivation') },
    { key: 'pest_control', label: t('community.topic_pest_control') },
    { key: 'market_trend', label: t('community.topic_market_trend') },
    { key: 'machinery', label: t('community.topic_machinery') },
    { key: 'schemes', label: t('community.topic_schemes') }
  ];

  const handleLike = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    await likeMutation.mutateAsync(postId);
  };

  const handleSave = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    await saveMutation.mutateAsync(postId);
  };

  const handleShare = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-Tabs: All / My Posts / Saved Bookmarks */}
      <div className="flex items-center justify-between border-b border-earth-200 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
            }`}
          >
            {t('community.tab_forum')}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('my')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'my'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
            }`}
          >
            {t('community.tab_my_posts')}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'saved'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
            }`}
          >
            {t('community.tab_saved_posts')}
          </button>
        </div>

        <Button
          size="sm"
          onClick={onOpenCreatePost}
          className="bg-forest-700 hover:bg-forest-800 text-white text-xs shadow-xs"
        >
          + {t('community.create_post')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5 bg-earth-50/60 p-3 rounded-2xl border border-earth-200">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-earth-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('community.search_discussions')}
              className="pl-9 text-xs sm:text-sm bg-white"
            />
          </div>

          {/* Taluk Filter */}
          <select
            value={selectedTaluk}
            onChange={e => setSelectedTaluk(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white text-earth-800 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="">{t('community.filter_all_taluks')}</option>
            {taluks.map(t => (
              <option key={t} value={t}>
                {t} Taluk
              </option>
            ))}
          </select>

          {/* Crop Filter */}
          <select
            value={selectedCropId || ''}
            onChange={e => setSelectedCropId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white text-earth-800 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="">{t('community.filter_all_crops')}</option>
            {crops.map(c => (
              <option key={c.id} value={c.id}>
                {isKn ? c.name_kn : c.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {topics.map(topic => (
            <button
              key={topic.key}
              type="button"
              onClick={() => setSelectedTopic(topic.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition ${
                selectedTopic === topic.key
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'bg-white border border-earth-200 text-earth-700 hover:border-earth-300'
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discussion Posts Feed */}
      {isLoading ? (
        <div className="py-12">
          <LoadingState message="Loading discussion posts..." />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title={t('community.no_posts_found')}
          description="Try clearing your search query or selecting a different crop / topic."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCropId(undefined);
            setSelectedTopic('all');
            setSelectedTaluk('');
            setFilterType('all');
          }}
        />
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Card
              key={post.id}
              onClick={() => onOpenPost(post.id)}
              className="p-4 rounded-2xl border border-earth-200 hover:border-forest-400 hover:shadow-md transition-all cursor-pointer bg-white group space-y-2.5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 font-bold flex items-center justify-center text-xs shadow-inner shrink-0">
                    {post.author_name ? post.author_name.charAt(0) : 'R'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-earth-900 text-xs sm:text-sm group-hover:text-forest-800 transition">
                        {post.author_name}
                      </span>
                      {post.author_role && (
                        <span className="text-[10px] uppercase font-bold text-earth-400 bg-earth-100 px-1.5 py-0.2 rounded">
                          {post.author_role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-earth-500">
                      {post.author_village && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-forest-600" />
                          {post.author_village}, {post.author_taluk}
                        </span>
                      )}
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {post.is_pinned && (
                    <Badge variant="warning" className="text-[10px] py-0.5 flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" />
                      {t('community.pinned')}
                    </Badge>
                  )}
                  {(post.crop_name_en || post.crop_name_kn) && (
                    <Badge variant="outline" className="text-[10px] py-0.5 bg-forest-50 text-forest-800 border-forest-200">
                      {isKn ? post.crop_name_kn || post.crop_name_en : post.crop_name_en}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Group Attribution if posted in a specific group */}
              {post.group_name && (
                <div className="text-[11px] text-forest-700 bg-forest-50/70 px-2 py-0.5 rounded-md inline-block font-medium">
                  Group: {post.group_name}
                </div>
              )}

              {/* Title & Body */}
              <div>
                <h3 className="font-bold text-sm sm:text-base text-earth-900 group-hover:text-forest-900 transition">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-earth-700 mt-1 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Image Thumbnail preview if attached */}
              {post.image_url && (
                <div className="rounded-xl overflow-hidden max-h-48 border border-earth-100">
                  <img
                    src={post.image_url}
                    alt="Post photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-earth-100 text-xs text-earth-600">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={e => handleLike(e, post.id)}
                    className={`flex items-center gap-1 py-1 px-2 rounded-lg transition ${
                      post.is_liked
                        ? 'text-red-600 font-bold bg-red-50'
                        : 'hover:text-earth-900 hover:bg-earth-100'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.is_liked ? 'fill-red-600 text-red-600' : ''}`} />
                    <span>{post.likes_count}</span>
                  </button>

                  <div className="flex items-center gap-1 py-1 px-2 rounded-lg text-earth-600">
                    <MessageCircle className="w-3.5 h-3.5 text-forest-700" />
                    <span>{post.comments_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={e => handleSave(e, post.id)}
                    className={`p-1.5 rounded-lg transition ${
                      post.is_saved
                        ? 'text-forest-700 bg-forest-50'
                        : 'hover:text-earth-900 hover:bg-earth-100'
                    }`}
                    title={post.is_saved ? 'Saved' : 'Save bookmark'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${post.is_saved ? 'fill-forest-700 text-forest-700' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={e => handleShare(e, post.id)}
                    className="p-1.5 rounded-lg hover:text-earth-900 hover:bg-earth-100 transition"
                    title="Share link"
                  >
                    {copiedId === post.id ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
