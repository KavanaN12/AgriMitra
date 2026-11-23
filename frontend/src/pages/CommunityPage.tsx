import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  PlusCircle,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ForumFeed } from '../components/community/ForumFeed';
import { VillageGroupsDirectory } from '../components/community/VillageGroupsDirectory';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { PostDetailModal } from '../components/community/PostDetailModal';
import { CreateGroupModal } from '../components/community/CreateGroupModal';
import { GroupDetailModal } from '../components/community/GroupDetailModal';

export function CommunityPage({ defaultTab }: { defaultTab?: 'forum' | 'groups' } = {}) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'forum' | 'groups') || defaultTab || 'forum';

  // Top level active tab: 'forum' or 'groups'
  const [activeTab, setActiveTab] = useState<'forum' | 'groups'>(initialTab);

  // Modals state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostGroupId, setCreatePostGroupId] = useState<number | undefined>(undefined);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

  const handleOpenCreatePost = (groupId?: number) => {
    setCreatePostGroupId(groupId);
    setIsCreatePostOpen(true);
  };

  const handleOpenPostDetail = (postId: number) => {
    setActivePostId(postId);
  };

  const handleOpenGroupDetail = (groupId: number) => {
    setActiveGroupId(groupId);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-900 tracking-normal leading-snug font-kannada">
            {t('community.title')}
          </h1>
          <p className="text-xs sm:text-sm text-earth-600 mt-1">
            {t('community.subtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenCreatePost()}
            className="bg-forest-700 hover:bg-forest-800 text-white shadow-xs"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            {t('community.new_post')}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateGroupOpen(true)}
            className="border-earth-300 text-earth-800 hover:bg-earth-100 shadow-xs"
          >
            <Users className="w-4 h-4 mr-1.5 text-forest-700" />
            {t('community.create_group')}
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-earth-200">
        <button
          type="button"
          onClick={() => setActiveTab('forum')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
            activeTab === 'forum'
              ? 'border-forest-700 text-forest-900'
              : 'border-transparent text-earth-500 hover:text-earth-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('community.tab_forum')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('groups')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 text-sm font-semibold transition ${
            activeTab === 'groups'
              ? 'border-forest-700 text-forest-900'
              : 'border-transparent text-earth-500 hover:text-earth-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('community.tab_groups')}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'forum' ? (
        <ForumFeed
          onOpenPost={handleOpenPostDetail}
          onOpenCreatePost={() => handleOpenCreatePost()}
        />
      ) : (
        <VillageGroupsDirectory
          onOpenGroup={handleOpenGroupDetail}
          onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        />
      )}

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => {
          setIsCreatePostOpen(false);
          setCreatePostGroupId(undefined);
        }}
        defaultGroupId={createPostGroupId}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />

      <PostDetailModal
        isOpen={!!activePostId}
        onClose={() => setActivePostId(null)}
        postId={activePostId}
      />

      <GroupDetailModal
        isOpen={!!activeGroupId}
        onClose={() => setActiveGroupId(null)}
        groupId={activeGroupId}
        onOpenCreatePost={groupId => {
          setActiveGroupId(null);
          handleOpenCreatePost(groupId);
        }}
        onOpenPostDetail={postId => {
          handleOpenPostDetail(postId);
        }}
      />
    </div>
  );
}
