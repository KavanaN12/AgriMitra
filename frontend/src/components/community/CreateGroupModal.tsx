import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users, Shield, MapPin, Sparkles } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useCreateGroup, useCrops } from '../../hooks/useAgriQuery';

const createGroupSchema = z.object({
  name_en: z.string().min(5, 'Group name must be at least 5 characters').max(100),
  name_kn: z.string().min(5, 'ಗುಂಪಿನ ಹೆಸರು ಕನಿಷ್ಠ 5 ಅಕ್ಷರಗಳಿರಬೇಕು').max(100),
  taluk: z.string().min(1, 'Please select a taluk'),
  village: z.string().min(2, 'Please enter a village name'),
  crop_id: z.string().optional(),
  description_en: z.string().min(10, 'Description must be at least 10 characters'),
  description_kn: z.string().min(10, 'ವಿವರಣೆ ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳಿರಬೇಕು'),
  rules_en: z.string().min(10, 'Rules must be at least 10 characters'),
  rules_kn: z.string().min(10, 'ನಿಯಮಗಳು ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳಿರಬೇಕು')
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: crops = [] } = useCrops();
  const createGroupMutation = useCreateGroup();

  const taluks = [
    'Mandya',
    'Maddur',
    'Malavalli',
    'Pandavapura',
    'Srirangapatna',
    'Krishnarajpet',
    'Nagamangala'
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      taluk: 'Mandya',
      rules_en: 'Respectful agricultural discussions only. No commercial sales spam. Share genuine farming experiences.',
      rules_kn: 'ಗೌರವಾನ್ವಿತ ಕೃಷಿ ಚರ್ಚೆಗಳಿಗೆ ಮಾತ್ರ ವೇದಿಕೆ. ವಾಣಿಜ್ಯ ಜಾಹೀರಾತು ನಿಷೇಧಿಸಲಾಗಿದೆ. ನೈಜ ಕೃಷಿ ಅನುಭವಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.'
    }
  });

  const onSubmit = async (data: CreateGroupFormData) => {
    try {
      await createGroupMutation.mutateAsync({
        name_en: data.name_en.trim(),
        name_kn: data.name_kn.trim(),
        taluk: data.taluk,
        village: data.village.trim(),
        district: 'Mandya',
        crop_id: data.crop_id ? Number(data.crop_id) : undefined,
        description_en: data.description_en.trim(),
        description_kn: data.description_kn.trim(),
        rules_en: data.rules_en.trim(),
        rules_kn: data.rules_kn.trim()
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('community.create_group')}
      description={t('community.create_group_desc')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Names in English & Kannada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('community.group_name_en')} *
            </label>
            <Input
              {...register('name_en')}
              placeholder="e.g., Maddur Sugarcane Forum"
              className="text-xs sm:text-sm"
            />
            {errors.name_en && (
              <p className="text-xs text-red-600">{errors.name_en.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('community.group_name_kn')} *
            </label>
            <Input
              {...register('name_kn')}
              placeholder="ಉದಾ: ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ"
              className="text-xs sm:text-sm"
            />
            {errors.name_kn && (
              <p className="text-xs text-red-600">{errors.name_kn.message}</p>
            )}
          </div>
        </div>

        {/* Location & Crop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('community.group_taluk')} *
            </label>
            <select
              {...register('taluk')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              {taluks.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.taluk && (
              <p className="text-xs text-red-600">{errors.taluk.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('community.group_village')} *
            </label>
            <Input
              {...register('village')}
              placeholder="e.g., Shivapura"
              className="text-xs"
            />
            {errors.village && (
              <p className="text-xs text-red-600">{errors.village.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('community.group_crop')}
            </label>
            <select
              {...register('crop_id')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="">All Crops / General</option>
              {crops.map(c => (
                <option key={c.id} value={c.id}>
                  {isKn ? c.name_kn : c.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description in EN & KN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('community.group_desc_en')} *
            </label>
            <Textarea
              {...register('description_en')}
              rows={3}
              placeholder="What is this village group focused on?"
              className="text-xs"
            />
            {errors.description_en && (
              <p className="text-xs text-red-600">{errors.description_en.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800">
              {t('community.group_desc_kn')} *
            </label>
            <Textarea
              {...register('description_kn')}
              rows={3}
              placeholder="ಈ ಸಂಘದ ಉದ್ದೇಶ ಮತ್ತು ಚರ್ಚೆಯ ವಿವರಣೆ ಬರೆಯಿರಿ..."
              className="text-xs"
            />
            {errors.description_kn && (
              <p className="text-xs text-red-600">{errors.description_kn.message}</p>
            )}
          </div>
        </div>

        {/* Rules in EN & KN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-forest-700" />
              <span>{t('community.group_rules_en')}</span>
            </label>
            <Textarea
              {...register('rules_en')}
              rows={2}
              className="text-xs"
            />
            {errors.rules_en && (
              <p className="text-xs text-red-600">{errors.rules_en.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-forest-700" />
              <span>{t('community.group_rules_kn')}</span>
            </label>
            <Textarea
              {...register('rules_kn')}
              rows={2}
              className="text-xs"
            />
            {errors.rules_kn && (
              <p className="text-xs text-red-600">{errors.rules_kn.message}</p>
            )}
          </div>
        </div>

        <div className="p-2.5 bg-forest-50/70 rounded-xl border border-forest-200 text-xs text-forest-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-forest-700 shrink-0" />
          <span>
            As creator, you will automatically be assigned as <strong>Group Administrator</strong> with moderation controls.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-earth-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={createGroupMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={createGroupMutation.isPending}
            className="bg-forest-700 hover:bg-forest-800 text-white"
          >
            <Users className="w-3.5 h-3.5 mr-1" />
            {createGroupMutation.isPending ? 'Creating...' : t('community.create_group')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
