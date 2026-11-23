import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Send,
  MessageSquare,
  Tag,
  DollarSign,
  Package,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { MarketListing } from '../../types/api';
import { useCreateEnquiry } from '../../hooks/useAgriQuery';

const enquirySchema = z.object({
  quantity_requested: z.coerce.number().positive('Requested quantity must be positive'),
  offered_price: z.coerce.number().positive('Offered price must be positive').optional(),
  message: z.string().min(5, 'Message must be at least 5 characters')
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

interface SendEnquiryModalProps {
  listing: MarketListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SendEnquiryModal({
  listing,
  isOpen,
  onClose
}: SendEnquiryModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const createEnquiryMutation = useCreateEnquiry();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema) as any,
    defaultValues: {
      quantity_requested: listing?.quantity || 10,
      offered_price: listing?.price_per_unit || 1000,
      message: 'Direct enquiry from verified buyer in Mandya. Interested in pickup at farm gate.'
    }
  });

  useEffect(() => {
    if (listing) {
      reset({
        quantity_requested: Math.min(listing.quantity, 20),
        offered_price: listing.price_per_unit,
        message: `Hello ${listing.farmer_name}, I am interested in procuring ${listing.variety}. Can arrange truck pickup from your ${listing.village} location.`
      });
    }
  }, [listing, reset]);

  if (!listing) return null;

  const requestedQty = watch('quantity_requested') || 0;
  const offeredPrice = watch('offered_price') || listing.price_per_unit;
  const totalOffer = requestedQty * offeredPrice;

  const onSubmit = async (data: EnquiryFormData) => {
    try {
      await createEnquiryMutation.mutateAsync({
        listing_id: listing.id,
        quantity_requested: Number(data.quantity_requested),
        offered_price: data.offered_price ? Number(data.offered_price) : listing.price_per_unit,
        message: data.message
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('market.enquiry_dialog_title')}
      description={`${isKn ? listing.crop_name_kn || listing.crop_name_en : listing.crop_name_en} • ${listing.variety}`}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Listing Reference Header */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs">
          <div>
            <span className="font-bold text-earth-900 block">
              Seller: {listing.farmer_name}
            </span>
            <span className="text-earth-600">
              Total lot: {listing.quantity} {listing.unit} • Expected: ₹{listing.price_per_unit}/{listing.unit}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-forest-100 text-forest-800 font-semibold">
            {listing.taluk}
          </span>
        </div>

        {/* Quantity Requested & Offered Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-forest-700" />
              <span>{t('market.requested_qty')} ({listing.unit}) *</span>
            </label>
            <Input
              type="number"
              step="any"
              {...register('quantity_requested')}
              className="text-xs sm:text-sm"
            />
            {errors.quantity_requested && (
              <p className="text-xs text-red-600">{errors.quantity_requested.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-forest-700" />
              <span>{t('market.offered_price')} *</span>
            </label>
            <Input
              type="number"
              step="any"
              {...register('offered_price')}
              className="text-xs sm:text-sm"
            />
            {errors.offered_price && (
              <p className="text-xs text-red-600">{errors.offered_price.message}</p>
            )}
          </div>
        </div>

        {/* Total Proposal Card */}
        <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-between">
          <span className="text-xs font-medium text-forest-900">
            Total Purchase Proposal Value:
          </span>
          <span className="text-base font-black text-forest-800">
            ₹{totalOffer.toLocaleString()}
          </span>
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-earth-800 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-forest-700" />
            <span>{t('market.message')} *</span>
          </label>
          <Textarea
            {...register('message')}
            rows={3}
            placeholder="Introduce your trading business, preferred pickup date, or ask about quality parameters..."
            className="text-xs sm:text-sm"
          />
          {errors.message && (
            <p className="text-xs text-red-600">{errors.message.message}</p>
          )}
        </div>

        <p className="text-[11px] text-earth-500 leading-tight flex items-start gap-1">
          <Info className="w-3.5 h-3.5 text-forest-600 flex-shrink-0 mt-0.5" />
          <span>
            This starts a direct, commission-free communication thread with the farmer. You can negotiate price and delivery terms before confirming.
          </span>
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-earth-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs sm:text-sm text-earth-700"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createEnquiryMutation.isPending}
            className="bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm shadow-md"
          >
            {createEnquiryMutation.isPending ? t('common.loading') : t('market.send_enquiry')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}