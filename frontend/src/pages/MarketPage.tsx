import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  PlusCircle,
  MessageSquare,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Tag,
  Search,
  Filter,
  Users,
  Bookmark,
  BookmarkCheck,
  Send,
  Eye,
  PauseCircle,
  PlayCircle,
  ArrowUpDown,
  Phone,
  Layers,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import {
  useMarketListings,
  useMarketEnquiries,
  useSaveListing,
  useUpdateListingStatus,
  useCrops,
  useCurrentUser
} from '../hooks/useAgriQuery';
import { MarketListing, MarketEnquiry } from '../types/api';
import { CreateListingModal } from '../components/marketplace/CreateListingModal';
import { ListingDetailModal } from '../components/marketplace/ListingDetailModal';
import { getListingImageUrl, getListingFallbackUrl } from '../utils/cropImages';
import { SendEnquiryModal } from '../components/marketplace/SendEnquiryModal';
import { EnquiryDetailModal } from '../components/marketplace/EnquiryDetailModal';
import { CollectiveContributionModal } from '../components/marketplace/CollectiveContributionModal';

const MANDYA_TALUKS = [
  'Maddur',
  'Mandya',
  'Malavalli',
  'Pandavapura',
  'Srirangapatna',
  'Nagamangala',
  'Krishnarajpet'
];

type ActiveTab = 'browse' | 'my_listings' | 'my_enquiries' | 'saved_listings';

export function MarketPage({ defaultTab }: { defaultTab?: ActiveTab } = {}) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ActiveTab) || defaultTab || 'browse';

  const { data: user } = useCurrentUser();
  const { data: crops = [] } = useCrops();

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropId, setSelectedCropId] = useState<number | undefined>(undefined);
  const [selectedTaluk, setSelectedTaluk] = useState<string>('');
  const [collectiveOnly, setCollectiveOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [myListingStatusFilter, setMyListingStatusFilter] = useState<string>('all');
  const [enquiryRoleFilter, setEnquiryRoleFilter] = useState<'farmer' | 'buyer'>(
    user?.active_role === 'buyer' ? 'buyer' : 'farmer'
  );

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCollectiveCreate, setIsCollectiveCreate] = useState(false);
  const [selectedListingDetail, setSelectedListingDetail] = useState<MarketListing | null>(null);
  const [selectedEnquiryListing, setSelectedEnquiryListing] = useState<MarketListing | null>(null);
  const [selectedContributeListing, setSelectedContributeListing] = useState<MarketListing | null>(null);
  const [activeEnquiryId, setActiveEnquiryId] = useState<number | null>(null);

  // Data Queries
  const {
    data: browseListings = [],
    isLoading: isBrowseLoading,
    error: browseError,
    refetch: refetchBrowse
  } = useMarketListings({
    crop_id: selectedCropId,
    taluk: selectedTaluk || undefined,
    is_collective: collectiveOnly ? true : undefined,
    search: searchQuery || undefined,
    sort_by: sortBy,
    filter_type: 'all'
  });

  const {
    data: myListings = [],
    isLoading: isMyListingsLoading
  } = useMarketListings({
    filter_type: 'my',
    status: myListingStatusFilter === 'all' ? undefined : myListingStatusFilter
  });

  const {
    data: savedListings = [],
    isLoading: isSavedLoading
  } = useMarketListings({
    filter_type: 'saved'
  });

  const {
    data: enquiries = [],
    isLoading: isEnquiriesLoading
  } = useMarketEnquiries({
    role: enquiryRoleFilter
  });

  const saveListingMutation = useSaveListing();
  const updateStatusMutation = useUpdateListingStatus();

  const handleToggleSave = (e: React.MouseEvent, listingId: number) => {
    e.stopPropagation();
    saveListingMutation.mutate(listingId);
  };

  const handleOpenDetail = (listing: MarketListing) => {
    setSelectedListingDetail(listing);
  };

  const handleOpenEnquiry = (listing: MarketListing) => {
    setSelectedEnquiryListing(listing);
  };

  const handleOpenContribute = (listing: MarketListing) => {
    setSelectedContributeListing(listing);
  };

  const handleOpenEnquiryThread = (enquiryId: number) => {
    setActiveEnquiryId(enquiryId);
  };

  const openCreateIndividual = () => {
    setIsCollectiveCreate(false);
    setIsCreateOpen(true);
  };

  const openCreateCollective = () => {
    setIsCollectiveCreate(true);
    setIsCreateOpen(true);
  };

  // Helper count for incoming pending enquiries
  const pendingEnquiryCount = enquiries.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sand-200 text-xs font-semibold tracking-wide">
              <ShoppingBag className="w-3.5 h-3.5 text-sand-300" />
              <span>Mandya Direct Market • ಮಂಡ್ಯ ನೇರ ಮಾರುಕಟ್ಟೆ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-normal leading-snug font-kannada">
              {t('market.title')}
            </h1>
            <p className="text-sand-100 text-xs sm:text-sm md:text-base leading-relaxed">
              {t('market.subtitle')}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Button
              onClick={openCreateIndividual}
              className="bg-sand-400 hover:bg-sand-300 text-forest-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('market.new_listing')}</span>
            </Button>

            <Button
              onClick={openCreateCollective}
              variant="outline"
              className="border-sand-300/40 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm transition-transform active:scale-95 flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-sand-300" />
              <span>{t('market.new_collective_listing')}</span>
            </Button>
          </div>
        </div>

        {/* Decorative background overlay */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-forest-600/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-earth-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'browse'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-earth-600 hover:text-earth-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('market.tab_browse')}</span>
          <Badge variant="secondary" className="bg-sand-100 text-earth-700 text-[10px]">
            {browseListings.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('my_listings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'my_listings'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-earth-600 hover:text-earth-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t('market.tab_my_listings')}</span>
          <Badge variant="secondary" className="bg-sand-100 text-earth-700 text-[10px]">
            {myListings.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('my_enquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'my_enquiries'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-earth-600 hover:text-earth-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('market.tab_my_enquiries')}</span>
          {pendingEnquiryCount > 0 && (
            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2">
              {pendingEnquiryCount}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved_listings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'saved_listings'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-earth-600 hover:text-earth-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{t('market.tab_saved_listings')}</span>
          <Badge variant="secondary" className="bg-sand-100 text-earth-700 text-[10px]">
            {savedListings.length}
          </Badge>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: BROWSE & DISCOVER PRODUCE                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Search, Filter & Sort Controls */}
          <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('market.search_placeholder')}
                  className="pl-10 text-xs sm:text-sm rounded-xl"
                />
              </div>

              {/* Taluk Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedTaluk}
                  onChange={(e) => setSelectedTaluk(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="">{t('market.filter_all_taluks')}</option>
                  {MANDYA_TALUKS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="md:col-span-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="newest">{t('market.sort_newest')}</option>
                  <option value="price_low">{t('market.sort_price_low')}</option>
                  <option value="price_high">{t('market.sort_price_high')}</option>
                  <option value="harvest_soon">{t('market.sort_harvest_soon')}</option>
                </select>
              </div>
            </div>

            {/* Crop Pills & Collective Checkbox */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-earth-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedCropId(undefined)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCropId === undefined
                      ? 'bg-forest-700 text-white shadow-sm'
                      : 'bg-sand-100 text-earth-700 hover:bg-sand-200'
                  }`}
                >
                  {t('market.filter_all_crops')}
                </button>
                {crops.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCropId(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedCropId === c.id
                        ? 'bg-forest-700 text-white shadow-sm'
                        : 'bg-sand-100 text-earth-700 hover:bg-sand-200'
                    }`}
                  >
                    {isKn ? c.name_kn : c.name_en}
                  </button>
                ))}
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-forest-800 bg-forest-50 px-3 py-1.5 rounded-xl border border-forest-200">
                <input
                  type="checkbox"
                  checked={collectiveOnly}
                  onChange={(e) => setCollectiveOnly(e.target.checked)}
                  className="rounded text-forest-700 focus:ring-forest-500"
                />
                <Users className="w-3.5 h-3.5 text-forest-700" />
                <span>{t('market.filter_collective_only')}</span>
              </label>
            </div>
          </div>

          {/* Results Grid */}
          {isBrowseLoading ? (
            <LoadingState message={t('common.loading')} />
          ) : browseError ? (
            <ErrorState message={t('common.error_title')} onRetry={refetchBrowse} />
          ) : browseListings.length === 0 ? (
            <EmptyState
              title={t('market.no_listings')}
              description="Try adjusting your crop, taluk or search terms to see available Mandya harvests."
              actionLabel={t('market.new_listing')}
              onAction={openCreateIndividual}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {browseListings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => handleOpenDetail(listing)}
                  className="group bg-white rounded-2xl border border-earth-200 shadow-sm hover:shadow-md hover:border-forest-300 transition-all cursor-pointer flex flex-col overflow-hidden"
                >
                  {/* Photo & Badges */}
                  <div className="relative aspect-video w-full bg-sand-100 overflow-hidden">
                    <img
                      src={getListingImageUrl(listing)}
                      alt={listing.variety || 'Produce'}
                      onError={(e) => {
                        e.currentTarget.src = getListingFallbackUrl(listing);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      {listing.is_collective ? (
                        <Badge className="bg-forest-800 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{t('market.collective_badge')}</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-white/95 text-earth-800 text-[10px] font-medium shadow-md">
                          {t('market.filter_individual_only')}
                        </Badge>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleToggleSave(e, listing.id)}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${
                        listing.is_saved
                          ? 'bg-forest-600 text-white'
                          : 'bg-white/90 text-earth-700 hover:text-forest-700 hover:bg-white'
                      }`}
                      title={listing.is_saved ? t('market.saved') : t('market.save')}
                    >
                      {listing.is_saved ? (
                        <BookmarkCheck className="w-4 h-4 fill-current" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-earth-900 group-hover:text-forest-800 transition-colors">
                            {isKn ? listing.crop_name_kn || listing.crop_name_en : listing.crop_name_en}
                          </h3>
                          <p className="text-xs text-earth-600 font-medium">
                            {listing.variety}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-forest-800 block">
                            ₹{listing.price_per_unit.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-earth-500 font-medium">
                            per {listing.unit}
                          </span>
                        </div>
                      </div>

                      {/* Location & Quantity Meta */}
                      <div className="mt-3 space-y-1 text-xs text-earth-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {listing.village}, {listing.taluk}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                          <span>
                            {listing.harvest_date
                              ? `Harvest: ${new Date(listing.harvest_date).toLocaleDateString(
                                  isKn ? 'kn-IN' : 'en-IN',
                                  { month: 'short', day: 'numeric' }
                                )}`
                              : 'Ready for immediate dispatch'}
                          </span>
                        </div>
                      </div>

                      {listing.is_collective && (
                        <div className="mt-2 text-[11px] text-forest-800 font-semibold bg-forest-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-forest-600" />
                          <span>
                            {listing.group_name || 'Village Union'} • {listing.contributions_count || 1} pooled farmers
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-earth-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-earth-700">
                        {listing.quantity} {listing.unit} available
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(listing);
                          }}
                          className="text-xs text-earth-700 hover:text-forest-800 h-8 px-2.5"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>{t('market.view_details')}</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEnquiry(listing);
                          }}
                          className="bg-forest-700 hover:bg-forest-800 text-white text-xs h-8 px-3 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          <span>{t('market.enquire_now')}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: MY LISTINGS (FARMER DASHBOARD)                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'my_listings' && (
        <div className="space-y-4">
          {/* Status filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-earth-200">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-earth-800 uppercase tracking-wider mr-2">
                Status:
              </span>
              {['all', 'active', 'paused', 'sold'].map((st) => (
                <button
                  key={st}
                  onClick={() => setMyListingStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    myListingStatusFilter === st
                      ? 'bg-forest-700 text-white shadow-sm'
                      : 'bg-sand-100 text-earth-700 hover:bg-sand-200'
                  }`}
                >
                  {st === 'all' ? 'All' : t(`market.status_${st}`)}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={openCreateIndividual}
              className="bg-forest-700 hover:bg-forest-800 text-white text-xs h-8 shadow-sm flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('market.new_listing')}</span>
            </Button>
          </div>

          {isMyListingsLoading ? (
            <LoadingState message={t('common.loading')} />
          ) : myListings.length === 0 ? (
            <EmptyState
              title={t('market.no_my_listings')}
              description="Start selling produce directly from your farm without paying commission fees."
              actionLabel={t('market.new_listing')}
              onAction={openCreateIndividual}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-earth-200 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getListingImageUrl(listing)}
                        alt={listing.variety || 'Produce'}
                        onError={(e) => {
                          e.currentTarget.src = getListingFallbackUrl(listing);
                        }}
                        className="w-16 h-16 rounded-xl object-cover border border-sand-200 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-earth-900 text-sm sm:text-base">
                          {isKn ? listing.crop_name_kn || listing.crop_name_en : listing.crop_name_en}
                        </h4>
                        <p className="text-xs text-earth-600">{listing.variety}</p>
                        <span className="text-xs font-black text-forest-800">
                          ₹{listing.price_per_unit} / {listing.unit} • {listing.quantity} {listing.unit}
                        </span>
                      </div>
                    </div>

                    <Badge
                      className={`text-[10px] font-bold uppercase ${
                        listing.status === 'active' || (listing.status as string) === 'available'
                          ? 'bg-emerald-600 text-white'
                          : listing.status === 'paused'
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-600 text-white'
                      }`}
                    >
                      {t(`market.status_${listing.status}`)}
                    </Badge>
                  </div>

                  {/* Status & Management Controls */}
                  <div className="pt-2 border-t border-earth-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-forest-700" />
                      <span className="text-earth-700 font-medium">
                        {listing.enquiries_count || 0} Buyer Enquiries
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {listing.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'paused' })}
                          className="h-7 text-xs text-amber-800 border-amber-300 hover:bg-amber-50"
                        >
                          <PauseCircle className="w-3 h-3 mr-1" />
                          <span>{t('market.pause_listing')}</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'active' })}
                          className="h-7 text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          <span>{t('market.reactivate_listing')}</span>
                        </Button>
                      )}

                      {listing.status !== 'sold' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'sold' })}
                          className="h-7 text-xs text-stone-700 border-stone-300 hover:bg-stone-50"
                        >
                          <span>{t('market.mark_sold')}</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => handleOpenDetail(listing)}
                        className="bg-forest-700 hover:bg-forest-800 text-white h-7 text-xs px-2.5"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{t('market.view_details')}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: ENQUIRIES & NEGOTIATION THREADS                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'my_enquiries' && (
        <div className="space-y-4">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-earth-200">
            <button
              onClick={() => setEnquiryRoleFilter('farmer')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                enquiryRoleFilter === 'farmer'
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'text-earth-700 hover:bg-sand-50'
              }`}
            >
              {t('market.enquiry_inbox')} (Farmer)
            </button>
            <button
              onClick={() => setEnquiryRoleFilter('buyer')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                enquiryRoleFilter === 'buyer'
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'text-earth-700 hover:bg-sand-50'
              }`}
            >
              {t('market.enquiry_sent')} (Buyer)
            </button>
          </div>

          {isEnquiriesLoading ? (
            <LoadingState message={t('common.loading')} />
          ) : enquiries.length === 0 ? (
            <EmptyState
              title={t('market.no_enquiries')}
              description="No enquiries found in this category. Enquiries and price negotiation threads will appear here."
              actionLabel={t('market.tab_browse')}
              onAction={() => setActiveTab('browse')}
            />
          ) : (
            <div className="space-y-3">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => handleOpenEnquiryThread(enq.id)}
                  className="bg-white rounded-2xl border border-earth-200 p-4 shadow-sm hover:border-forest-400 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-earth-900 text-sm sm:text-base">
                        {enq.listing_title}
                      </span>
                      <Badge
                        className={`text-[10px] font-bold uppercase ${
                          enq.status === 'accepted'
                            ? 'bg-emerald-600 text-white'
                            : enq.status === 'declined'
                            ? 'bg-red-600 text-white'
                            : enq.status === 'cancelled'
                            ? 'bg-stone-500 text-white'
                            : enq.status === 'closed'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {t(`market.status_${enq.status}`)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-earth-600">
                      <span>
                        {enquiryRoleFilter === 'farmer'
                          ? `Buyer: ${enq.buyer_name}`
                          : `Farmer: ${enq.farmer_name || 'Mandya Farmer'}`}
                      </span>
                      <span>•</span>
                      <span>
                        Requested: <strong className="text-earth-800">{enq.quantity_requested} {enq.listing_unit}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Proposed: <strong className="text-forest-800">₹{enq.offered_price || enq.listing_price} / {enq.listing_unit}</strong>
                      </span>
                    </div>

                    {enq.message && (
                      <p className="text-xs text-earth-700 bg-sand-50 p-2 rounded-xl border border-sand-200 line-clamp-1 italic">
                        "{enq.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-black text-forest-800">
                      ₹{(
                        (enq.offered_price || enq.listing_price || 0) *
                        enq.quantity_requested
                      ).toLocaleString()}
                    </span>

                    <Button
                      size="sm"
                      className="bg-forest-700 hover:bg-forest-800 text-white text-xs h-8 px-3 shadow-sm flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t('market.thread_title')}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: SAVED BOOKMARKS                                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'saved_listings' && (
        <div className="space-y-4">
          {isSavedLoading ? (
            <LoadingState message={t('common.loading')} />
          ) : savedListings.length === 0 ? (
            <EmptyState
              title={t('market.no_saved')}
              description="Click the bookmark icon on any harvest listing to save it here for quick access."
              actionLabel={t('market.tab_browse')}
              onAction={() => setActiveTab('browse')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedListings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => handleOpenDetail(listing)}
                  className="bg-white rounded-2xl border border-earth-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-earth-900 text-base">
                        {isKn ? listing.crop_name_kn || listing.crop_name_en : listing.crop_name_en}
                      </h4>
                      <p className="text-xs text-earth-600">{listing.variety}</p>
                      <span className="text-xs text-earth-500">
                        {listing.village}, {listing.taluk}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleSave(e, listing.id)}
                      className="p-1.5 rounded-full text-forest-700 bg-sand-100 hover:bg-sand-200"
                    >
                      <BookmarkCheck className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-earth-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-forest-800 block">
                        ₹{listing.price_per_unit} / {listing.unit}
                      </span>
                      <span className="text-[11px] text-earth-500">
                        {listing.quantity} {listing.unit}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEnquiry(listing);
                      }}
                      className="bg-forest-700 hover:bg-forest-800 text-white text-xs h-8 px-3"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      <span>{t('market.enquire_now')}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DIALOGS                                                 */}
      {/* ------------------------------------------------------------- */}
      <CreateListingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        isCollectiveDefault={isCollectiveCreate}
      />

      <ListingDetailModal
        listing={selectedListingDetail}
        isOpen={!!selectedListingDetail}
        onClose={() => setSelectedListingDetail(null)}
        onOpenEnquiry={(l) => {
          setSelectedListingDetail(null);
          setSelectedEnquiryListing(l);
        }}
        onOpenContribute={(l) => {
          setSelectedListingDetail(null);
          setSelectedContributeListing(l);
        }}
      />

      <SendEnquiryModal
        listing={selectedEnquiryListing}
        isOpen={!!selectedEnquiryListing}
        onClose={() => setSelectedEnquiryListing(null)}
      />

      <EnquiryDetailModal
        enquiryId={activeEnquiryId}
        isOpen={!!activeEnquiryId}
        onClose={() => setActiveEnquiryId(null)}
      />

      <CollectiveContributionModal
        listing={selectedContributeListing}
        isOpen={!!selectedContributeListing}
        onClose={() => setSelectedContributeListing(null)}
      />
    </div>
  );
}