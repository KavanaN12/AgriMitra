import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Package,
  Users,
  PlusCircle,
  FileText,
  Info
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { MarketListing } from '../../types/api';
import { useContributeToCollective } from '../../hooks/useAgriQuery';

const contributionSchema = z.object({
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit required'),
  notes: z.string().optional()
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface CollectiveContributionModalProps {
  listing: MarketListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CollectiveContributionModal({
  listing,
  isOpen,
  onClose
}: CollectiveContributionModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const contributeMutation = useContributeToCollective();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema) as any,
    defaultValues: {
      quantity: 50,
      unit: listing?.unit || 'quintal',
      notes: 'Harvest share from personal acreage'
    }
  });

  if (!listing) return null;

  const onSubmit = async (data: ContributionFormData) => {
    try {
      await contributeMutation.mutateAsync({
        id: listing.id,
        payload: {
          quantity: Number(data.quantity),
          unit: data.unit,
          notes: data.notes
        }
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to contribute to collective listing:', err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('market.contribute_title')}
      description={`${listing.group_name || 'Village Union'} • ${listing.variety}`}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-xs">
          <span className="font-bold text-forest-900 block">
            {listing.crop_name_en} ({listing.variety})
          </span>
          <span className="text-forest-700">
            Current Pooled Lot: {listing.quantity} {listing.unit} • Expected Price: ₹{listing.price_per_unit}/{listing.unit}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-forest-700" />
              <span>{t('market.quantity')} *</span>
            </label>
            <Input
              type="number"
              step="any"
              {...register('quantity')}
              className="text-xs sm:text-sm"
            />
            {errors.quantity && (
              <p className="text-xs text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.field_unit')} *
            </label>
            <select
              {...register('unit')}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="quintal">Quintal</option>
              <option value="ton">Ton</option>
              <option value="kg">Kilogram</option>
              <option value="piece">Piece</option>
              <option value="bag">Bag</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-earth-800 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-forest-700" />
            <span>Notes (Acreage, harvesting schedule)</span>
          </label>
          <Textarea
            {...register('notes')}
            rows={2}
            placeholder="e.g. 2.0 acres standing crop, harvesting next Monday with union combine harvester"
            className="text-xs sm:text-sm"
          />
        </div>

        <p className="text-[11px] text-earth-500 flex items-start gap-1">
          <Info className="w-3.5 h-3.5 text-forest-600 flex-shrink-0 mt-0.5" />
          <span>
            Your contribution will be visibly credited to your name under this verified village group produce lot.
          </span>
        </p>

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
            disabled={contributeMutation.isPending}
            className="bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm shadow-md"
          >
            {contributeMutation.isPending ? t('common.loading') : t('market.contribute_harvest')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}