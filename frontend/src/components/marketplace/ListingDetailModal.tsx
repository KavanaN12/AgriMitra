import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Calendar,
  Phone,
  Bookmark,
  BookmarkCheck,
  Send,
  Users,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  CheckCheck,
  Package,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MarketListing } from '../../types/api';
import {
  useSaveListing,
  useUpdateListingStatus,
  useCurrentUser
} from '../../hooks/useAgriQuery';
import { getListingImageUrl, getListingFallbackUrl } from '../../utils/cropImages';

interface ListingDetailModalProps {
  listing: MarketListing | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEnquiry?: (listing: MarketListing) => void;
  onOpenContribute?: (listing: MarketListing) => void;
}

export function ListingDetailModal({
  listing,
  isOpen,
  onClose,
  onOpenEnquiry,
  onOpenContribute
}: ListingDetailModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: user } = useCurrentUser();
  const saveListingMutation = useSaveListing();
  const updateStatusMutation = useUpdateListingStatus();

  if (!listing) return null;

  const isOwner = user?.id === listing.farmer_id;
  const isBuyerRole = user?.active_role === 'buyer' || user?.role === 'buyer' || !isOwner;

  const handleToggleSave = () => {
    saveListingMutation.mutate(listing.id);
  };

  const handleUpdateStatus = (newStatus: 'active' | 'paused' | 'reserved' | 'sold') => {
    updateStatusMutation.mutate({ id: listing.id, status: newStatus });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={(isKn ? (listing.crop_name_kn || listing.crop_name_en) : listing.crop_name_en) || 'Farm Produce'}
      description={`${listing.variety || ''} • ${listing.village || ''}, ${listing.taluk || ''}`}
      className="max-w-2xl"
    >
      <div className="space-y-4 pt-2">
        {/* Photo & Badges */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-sand-100 border border-sand-200">
          <img
            src={getListingImageUrl(listing)}
            alt={listing.variety || 'Produce'}
            onError={(e) => {
              e.currentTarget.src = getListingFallbackUrl(listing);
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {listing.is_collective ? (
              <Badge className="bg-forest-800 text-white font-medium shadow-md flex items-center gap-1.5 px-3 py-1">
                <Users className="w-3.5 h-3.5" />
                <span>{t('market.collective_badge')}</span>
              </Badge>
            ) : (
              <Badge className="bg-white/95 text-earth-800 font-medium shadow-md px-3 py-1">
                {t('market.filter_individual_only')}
              </Badge>
            )}

            <Badge
              className={`font-semibold px-3 py-1 shadow-md ${
                listing.status === 'active' || (listing.status as string) === 'available'
                  ? 'bg-emerald-600 text-white'
                  : listing.status === 'paused'
                  ? 'bg-amber-600 text-white'
                  : listing.status === 'reserved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-600 text-white'
              }`}
            >
              {t(`market.status_${listing.status}`)}
            </Badge>
          </div>

          <button
            onClick={handleToggleSave}
            disabled={saveListingMutation.isPending}
            className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all ${
              listing.is_saved
                ? 'bg-forest-600 text-white ring-2 ring-forest-400'
                : 'bg-white/90 text-earth-700 hover:text-forest-700 hover:bg-white'
            }`}
            title={listing.is_saved ? t('market.saved') : t('market.save')}
          >
            {listing.is_saved ? (
              <BookmarkCheck className="w-5 h-5 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Pricing & Quantity Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gradient-to-br from-sand-50 to-sand-100 p-4 rounded-2xl border border-sand-200">
          <div>
            <span className="text-[11px] font-semibold text-earth-600 uppercase tracking-wider block">
              {t('market.price')}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-forest-800">
                ₹{listing.price_per_unit.toLocaleString()}
              </span>
              <span className="text-xs text-earth-600 font-medium">
                / {listing.unit}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-earth-600 uppercase tracking-wider block">
              {t('market.quantity')}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-earth-900">
                {listing.quantity.toLocaleString()}
              </span>
              <span className="text-xs text-earth-600 font-medium">
                {listing.unit}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-sand-300 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[11px] font-semibold text-earth-600 uppercase tracking-wider block">
              Estimated Total
            </span>
            <span className="text-base sm:text-lg font-bold text-earth-800 mt-0.5 block">
              ₹{(listing.price_per_unit * listing.quantity).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Logistics & Timing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-earth-200">
            <Calendar className="w-4 h-4 text-forest-700 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-earth-900 block">
                {t('market.harvest_ready')}
              </span>
              <span className="text-earth-600">
                {listing.harvest_date
                  ? new Date(listing.harvest_date).toLocaleDateString(isKn ? 'kn-IN' : 'en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Ready for immediate dispatch'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-earth-200">
            <MapPin className="w-4 h-4 text-forest-700 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-earth-900 block">
                {t('market.pickup_location')}
              </span>
              <span className="text-earth-600">
                {listing.pickup_address || `${listing.village}, ${listing.taluk}`}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="p-3.5 rounded-xl bg-white border border-earth-200 text-xs sm:text-sm">
            <h4 className="font-semibold text-earth-900 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-forest-700" />
              <span>{t('market.field_description')}</span>
            </h4>
            <p className="text-earth-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        )}

        {/* Collective Group Pool Details */}
        {listing.is_collective && (
          <div className="p-4 rounded-2xl bg-forest-50/70 border border-forest-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-forest-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-forest-700" />
                  <span>{listing.group_name || 'Village Farmers Union'}</span>
                </h4>
                <p className="text-[11px] text-forest-700">
                  {t('market.contributions_title')} ({listing.contributions_count || listing.contributions?.length || 1} contributors)
                </p>
              </div>

              {onOpenContribute && (
                <Button
                  size="sm"
                  onClick={() => onOpenContribute(listing)}
                  className="bg-forest-700 hover:bg-forest-800 text-white text-xs shadow-sm h-8"
                >
                  <Package className="w-3.5 h-3.5 mr-1" />
                  <span>{t('market.contribute_harvest')}</span>
                </Button>
              )}
            </div>

            {/* Contributions List */}
            {listing.contributions && listing.contributions.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {listing.contributions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white text-xs border border-forest-100"
                  >
                    <div>
                      <span className="font-semibold text-earth-900 block">
                        {c.farmer_name}
                      </span>
                      <span className="text-[11px] text-earth-500">
                        {c.farmer_village} {c.notes ? `• ${c.notes}` : ''}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-sand-100 text-forest-800 font-bold">
                      {c.quantity} {c.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-forest-700 italic">
                Pooled lot initialized with {listing.quantity} {listing.unit}.
              </p>
            )}
          </div>
        )}

        {/* Seller Info Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-earth-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-800 font-bold flex items-center justify-center text-sm">
              {listing.farmer_name ? listing.farmer_name.charAt(0) : 'F'}
            </div>
            <div>
              <span className="font-semibold text-earth-900 text-xs sm:text-sm block">
                {listing.farmer_name} {isOwner ? '(You)' : ''}
              </span>
              <span className="text-[11px] text-earth-600">
                {listing.farmer_village || listing.village}, {listing.taluk}
              </span>
            </div>
          </div>

          {listing.farmer_phone && !isOwner && (
            <a
              href={`tel:${listing.farmer_phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-semibold border border-forest-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t('market.direct_call')}</span>
            </a>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-earth-200 flex flex-wrap items-center justify-between gap-2">
          {isOwner ? (
            /* Farmer Owner Controls */
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {listing.status === 'active' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('paused')}
                  disabled={updateStatusMutation.isPending}
                  className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                >
                  <PauseCircle className="w-3.5 h-3.5 mr-1" />
                  <span>{t('market.pause_listing')}</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('active')}
                  disabled={updateStatusMutation.isPending}
                  className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  <PlayCircle className="w-3.5 h-3.5 mr-1" />
                  <span>{t('market.reactivate_listing')}</span>
                </Button>
              )}

              {listing.status !== 'sold' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('sold')}
                  disabled={updateStatusMutation.isPending}
                  className="text-xs border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  <span>{t('market.mark_sold')}</span>
                </Button>
              )}
            </div>
          ) : (
            /* Buyer Enquire CTA */
            <div className="w-full sm:w-auto flex items-center gap-2">
              {onOpenEnquiry && (
                <Button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEnquiry(listing);
                  }}
                  className="w-full sm:w-auto bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-1.5 px-5"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('market.send_enquiry')}</span>
                </Button>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs sm:text-sm text-earth-700 ml-auto"
          >
            {t('common.close')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}