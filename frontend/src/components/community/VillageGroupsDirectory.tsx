import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Search,
  MapPin,
  Shield,
  Plus,
  ArrowRight,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import { useCommunityGroups, useCrops, useJoinGroup } from '../../hooks/useAgriQuery';
import { CommunityGroup } from '../../types/api';

interface VillageGroupsDirectoryProps {
  onOpenGroup: (groupId: number) => void;
  onOpenCreateGroup: () => void;
}

export function VillageGroupsDirectory({
  onOpenGroup,
  onOpenCreateGroup
}: VillageGroupsDirectoryProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const [search, setSearch] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedCropId, setSelectedCropId] = useState<number | undefined>(undefined);

  const { data: crops = [] } = useCrops();
  const {
    data: groups = [],
    isLoading
  } = useCommunityGroups({
    search: search.trim() || undefined,
    taluk: selectedTaluk || undefined,
    crop_id: selectedCropId
  });

  const joinGroupMutation = useJoinGroup();

  const taluks = [
    'Mandya',
    'Maddur',
    'Malavalli',
    'Pandavapura',
    'Srirangapatna',
    'Krishnarajpet',
    'Nagamangala'
  ];

  const handleJoin = async (e: React.MouseEvent, groupId: number) => {
    e.stopPropagation();
    await joinGroupMutation.mutateAsync(groupId);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-earth-50/60 p-3 rounded-2xl border border-earth-200">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-earth-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('community.search_groups')}
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

        <Button
          size="sm"
          onClick={onOpenCreateGroup}
          className="bg-forest-700 hover:bg-forest-800 text-white text-xs shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          {t('community.create_group')}
        </Button>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="py-12">
          <LoadingState message="Loading farmer groups across Mandya..." />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title={t('community.no_groups_found')}
          description="Try changing taluk filter or be the first farmer to start a group in this village."
          actionLabel={t('community.create_group')}
          onAction={onOpenCreateGroup}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(group => (
            <Card
              key={group.id}
              onClick={() => onOpenGroup(group.id)}
              className="p-4 rounded-2xl border border-earth-200 hover:border-forest-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                {/* Header: Title & Crop Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-earth-900 group-hover:text-forest-800 transition">
                      {isKn ? group.name_kn : group.name_en}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-earth-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                      <span>
                        {group.village}, {group.taluk}
                      </span>
                    </div>
                  </div>

                  {(group.crop_name_en || group.crop_name_kn) && (
                    <Badge
                      variant="outline"
                      className="text-[11px] bg-forest-50/70 text-forest-800 border-forest-200 shrink-0"
                    >
                      {isKn ? group.crop_name_kn || group.crop_name_en : group.crop_name_en}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-earth-600 line-clamp-2 leading-relaxed">
                  {isKn
                    ? group.description_kn || group.description_en
                    : group.description_en}
                </p>
              </div>

              {/* Footer: Member count & Membership Status / Join */}
              <div className="flex items-center justify-between pt-2 border-t border-earth-100 text-xs">
                <span className="flex items-center gap-1 text-earth-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-forest-700" />
                  {group.member_count} {t('community.members')}
                </span>

                <div className="flex items-center gap-2">
                  {group.membership_status === 'admin' ? (
                    <Badge variant="warning" className="text-[10px] py-0.5 bg-amber-100 text-amber-900 border-amber-300">
                      {t('community.admin_badge')}
                    </Badge>
                  ) : group.membership_status === 'moderator' ? (
                    <Badge variant="secondary" className="text-[10px] py-0.5 bg-purple-100 text-purple-900 border-purple-300">
                      {t('community.moderator_badge')}
                    </Badge>
                  ) : group.membership_status === 'member' ? (
                    <Badge variant="success" className="text-[10px] py-0.5 bg-green-100 text-green-800 border-green-300">
                      {t('community.joined')}
                    </Badge>
                  ) : group.membership_status === 'pending' ? (
                    <Badge variant="outline" className="text-[10px] py-0.5 bg-amber-50 text-amber-800 border-amber-200">
                      {t('community.join_pending')}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => handleJoin(e, group.id)}
                      disabled={joinGroupMutation.isPending}
                      className="text-xs text-forest-700 border-forest-300 hover:bg-forest-50 py-1 px-2.5 h-7"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      {t('community.join_group')}
                    </Button>
                  )}

                  <span className="text-forest-700 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
