import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Tag,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  useCreateListing,
  useCrops,
  useCommunityGroups,
  useCurrentUser
} from '../../hooks/useAgriQuery';

const createListingSchema = z.object({
  crop_id: z.coerce.number().min(1, 'Please select a crop'),
  variety: z.string().min(2, 'Variety name must be at least 2 characters'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Please select unit'),
  price_per_unit: z.coerce.number().positive('Price must be greater than 0'),
  harvest_date: z.string().min(1, 'Harvest date required'),
  available_from: z.string().optional(),
  available_until: z.string().optional(),
  taluk: z.string().min(1, 'Taluk required'),
  village: z.string().min(2, 'Village required'),
  pickup_address: z.string().min(5, 'Pickup address required'),
  description: z.string().optional(),
  is_collective: z.boolean().default(false),
  group_id: z.coerce.number().optional()
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

const SAMPLE_PRODUCE_IMAGES = [
  {
    cropId: 1,
    name: 'Sugarcane Field (ಕಬ್ಬು)',
    url: '/images/crops/sugarcane.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800'
  },
  {
    cropId: 2,
    name: 'Paddy Harvest (ಭತ್ತ)',
    url: '/images/crops/paddy.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800'
  },
  {
    cropId: 3,
    name: 'Cleaned Ragi (ರಾಗಿ)',
    url: '/images/crops/ragi.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800'
  },
  {
    cropId: 4,
    name: 'Yelakki Banana (ಬಾಳೆ)',
    url: '/images/crops/banana.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=800'
  },
  {
    cropId: 5,
    name: 'Tender Coconut (ಎಳನೀರು)',
    url: '/images/crops/coconut.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800'
  },
  {
    cropId: 6,
    name: 'Tomatoes (ಟೊಮೆಟೊ)',
    url: '/images/crops/tomato.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800'
  }
];

const MANDYA_TALUKS = [
  'Maddur',
  'Mandya',
  'Malavalli',
  'Pandavapura',
  'Srirangapatna',
  'Nagamangala',
  'Krishnarajpet'
];

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCollectiveDefault?: boolean;
  defaultGroupId?: number;
}

export function CreateListingModal({
  isOpen,
  onClose,
  isCollectiveDefault = false,
  defaultGroupId
}: CreateListingModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: user } = useCurrentUser();
  const { data: crops = [] } = useCrops();
  const { data: groups = [] } = useCommunityGroups();
  const createListingMutation = useCreateListing();

  const [isCollective, setIsCollective] = useState<boolean>(isCollectiveDefault);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(SAMPLE_PRODUCE_IMAGES[0].url);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema) as any,
    defaultValues: {
      crop_id: 1,
      unit: 'quintal',
      variety: 'Co 86032 (Nayana)',
      quantity: 50,
      price_per_unit: 3100,
      harvest_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      available_from: new Date().toISOString().split('T')[0],
      taluk: user?.location?.taluk || 'Maddur',
      village: user?.location?.village || 'Shivapura',
      pickup_address: user?.location?.village ? `${user.location.village} Farm Gate` : 'Shivapura Farm Gate',
      description: '',
      is_collective: isCollectiveDefault,
      group_id: defaultGroupId || (groups[0]?.id || 1)
    }
  });

  useEffect(() => {
    if (user?.location) {
      if (user.location.taluk) setValue('taluk', user.location.taluk);
      if (user.location.village) {
        setValue('village', user.location.village);
        setValue('pickup_address', `${user.location.village} Farm Gate`);
      }
    }
  }, [user, setValue]);

  const selectedCropId = watch('crop_id');
  useEffect(() => {
    if (selectedCropId) {
      const match = SAMPLE_PRODUCE_IMAGES.find(img => img.cropId === Number(selectedCropId));
      if (match) {
        setSelectedImageUrl(match.url);
      }
    }
  }, [selectedCropId]);

  const handleToggleCollective = (col: boolean) => {
    setIsCollective(col);
    setValue('is_collective', col);
    if (col && !watch('group_id') && groups.length > 0) {
      setValue('group_id', groups[0].id);
    }
  };

  const onSubmit = async (data: CreateListingFormData) => {
    try {
      await createListingMutation.mutateAsync({
        crop_id: Number(data.crop_id),
        variety: data.variety,
        quantity: Number(data.quantity),
        unit: data.unit,
        price_per_unit: Number(data.price_per_unit),
        harvest_date: data.harvest_date,
        available_from: data.available_from,
        available_until: data.available_until,
        taluk: data.taluk,
        village: data.village,
        district: 'Mandya',
        pickup_address: data.pickup_address,
        description: data.description,
        is_collective: isCollective,
        group_id: isCollective ? Number(data.group_id) : undefined,
        image_url: selectedImageUrl
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to create listing:', err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCollective ? t('market.create_collective_title') : t('market.create_listing_title')}
      description={isCollective ? t('market.create_collective_desc') : t('market.create_listing_desc')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Listing Type Toggle */}
        <div className="bg-sand-50 p-3 rounded-2xl border border-sand-200">
          <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider mb-2">
            {t('market.new_listing')} Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleToggleCollective(false)}
              className={`p-3 rounded-xl border text-left transition-all ${
                !isCollective
                  ? 'border-forest-600 bg-white ring-2 ring-forest-500/20 shadow-sm'
                  : 'border-earth-200 bg-white/60 hover:bg-white text-earth-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Tag className={`w-4 h-4 ${!isCollective ? 'text-forest-700' : 'text-earth-500'}`} />
                <span className="text-xs sm:text-sm font-bold text-earth-900">
                  {t('market.filter_individual_only')}
                </span>
              </div>
              <p className="text-[11px] text-earth-600 line-clamp-1">
                Direct sale of your own harvest lot
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleToggleCollective(true)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isCollective
                  ? 'border-forest-600 bg-white ring-2 ring-forest-500/20 shadow-sm'
                  : 'border-earth-200 bg-white/60 hover:bg-white text-earth-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className={`w-4 h-4 ${isCollective ? 'text-forest-700' : 'text-earth-500'}`} />
                <span className="text-xs sm:text-sm font-bold text-earth-900">
                  {t('market.collective_badge')}
                </span>
              </div>
              <p className="text-[11px] text-earth-600 line-clamp-1">
                Pooled group lot with village members
              </p>
            </button>
          </div>

          {isCollective && (
            <div className="mt-3 pt-3 border-t border-sand-200">
              <label className="block text-xs font-semibold text-earth-800 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-forest-700" />
                <span>{t('market.field_group')}</span>
              </label>
              <select
                {...register('group_id')}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {isKn ? g.name_kn || g.name_en : g.name_en} ({g.taluk})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-forest-800 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                <span>
                  Group members can transparently contribute individual harvest shares to this lot.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Crop and Variety */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.field_crop')} *
            </label>
            <select
              {...register('crop_id')}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              {crops.map(c => (
                <option key={c.id} value={c.id}>
                  {isKn ? `${c.name_kn} (${c.name_en})` : `${c.name_en} (${c.name_kn})`}
                </option>
              ))}
            </select>
            {errors.crop_id && (
              <p className="text-xs text-red-600">{errors.crop_id.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.field_variety')} *
            </label>
            <Input
              {...register('variety')}
              placeholder="e.g. Co 86032, BPT 5204, GPU 28"
              className="text-xs sm:text-sm"
            />
            {errors.variety && (
              <p className="text-xs text-red-600">{errors.variety.message}</p>
            )}
          </div>
        </div>

        {/* Quantity, Unit, Price */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.quantity')} *
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
              <option value="quintal">Quintal (ಕ್ವಿಂಟಾಲ್)</option>
              <option value="ton">Ton (ಟನ್)</option>
              <option value="kg">Kilogram (ಕೆಜಿ)</option>
              <option value="piece">Piece / Nut (ಕಾಯಿ / ನಟ್)</option>
              <option value="bag">Bag (ಚೀಲ)</option>
            </select>
            {errors.unit && (
              <p className="text-xs text-red-600">{errors.unit.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.price')} (₹) *
            </label>
            <Input
              type="number"
              step="any"
              {...register('price_per_unit')}
              className="text-xs sm:text-sm"
            />
            {errors.price_per_unit && (
              <p className="text-xs text-red-600">{errors.price_per_unit.message}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.field_harvest_date')} *
            </label>
            <Input
              type="date"
              {...register('harvest_date')}
              className="text-xs sm:text-sm"
            />
            {errors.harvest_date && (
              <p className="text-xs text-red-600">{errors.harvest_date.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.field_available_from')}
            </label>
            <Input
              type="date"
              {...register('available_from')}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.field_taluk')} *
            </label>
            <select
              {...register('taluk')}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              {MANDYA_TALUKS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('market.field_village')} *
            </label>
            <Input
              {...register('village')}
              placeholder="e.g. Shivapura"
              className="text-xs sm:text-sm"
            />
            {errors.village && (
              <p className="text-xs text-red-600">{errors.village.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-earth-800">
            {t('market.field_pickup_address')} *
          </label>
          <Input
            {...register('pickup_address')}
            placeholder="e.g. Shivapura Farm Gate, Near Main Road Canal"
            className="text-xs sm:text-sm"
          />
          {errors.pickup_address && (
            <p className="text-xs text-red-600">{errors.pickup_address.message}</p>
          )}
        </div>

        {/* Photo Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-earth-800 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-forest-700" />
            <span>{t('market.field_photo')}</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SAMPLE_PRODUCE_IMAGES.map((img) => (
              <button
                type="button"
                key={img.url}
                onClick={() => setSelectedImageUrl(img.url)}
                className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                  selectedImageUrl === img.url
                    ? 'border-forest-600 ring-2 ring-forest-500/20 shadow-md scale-95'
                    : 'border-earth-200 hover:border-forest-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  onError={(e) => {
                    e.currentTarget.src = img.fallbackUrl;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
                  {img.name.split(' ')[0]}
                </div>
                {selectedImageUrl === img.url && (
                  <div className="absolute inset-0 bg-forest-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-earth-800">
            {t('market.field_description')}
          </label>
          <Textarea
            {...register('description')}
            rows={3}
            placeholder="Mention grain moisture percentage, pesticide-free practices, bag packing, or vehicle access..."
            className="text-xs sm:text-sm"
          />
        </div>

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
            disabled={createListingMutation.isPending}
            className="bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm shadow-md"
          >
            {createListingMutation.isPending
              ? t('common.loading')
              : isCollective
              ? t('market.new_collective_listing')
              : t('market.new_listing')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}