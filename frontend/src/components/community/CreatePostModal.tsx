import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Image,
  Upload,
  X,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  useCreatePost,
  useCrops,
  useCommunityGroups
} from '../../hooks/useAgriQuery';

const createPostSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  content: z
    .string()
    .min(10, 'Please explain your question or advice with at least 10 characters'),
  topic: z.string().min(1, 'Please select a topic category'),
  cropId: z.string().optional(),
  groupId: z.string().optional()
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGroupId?: number;
}

export function CreatePostModal({
  isOpen,
  onClose,
  defaultGroupId
}: CreatePostModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: crops = [] } = useCrops();
  const { data: groups = [] } = useCommunityGroups();
  const createPostMutation = useCreatePost();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      topic: 'general',
      groupId: defaultGroupId ? String(defaultGroupId) : ''
    }
  });

  const handleSimulatedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const simulatedUrl = URL.createObjectURL(file);
      setImagePreview(simulatedUrl);
      setImageUrl(`https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800`);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl(null);
  };

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      await createPostMutation.mutateAsync({
        title: data.title.trim(),
        content: data.content.trim(),
        topic: data.topic,
        crop_id: data.cropId ? Number(data.cropId) : undefined,
        group_id: data.groupId ? Number(data.groupId) : undefined,
        image_url: imageUrl || undefined,
        language: isKn ? 'kn' : 'en'
      });
      reset();
      removeImage();
      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('community.create_post')}
      description={t('community.create_post_desc')}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Topic Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-forest-700" />
            <span>Topic Category</span>
          </label>
          <select
            {...register('topic')}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="general">{t('community.topic_general')}</option>
            <option value="cultivation">{t('community.topic_cultivation')}</option>
            <option value="pest_control">{t('community.topic_pest_control')}</option>
            <option value="market_trend">{t('community.topic_market_trend')}</option>
            <option value="machinery">{t('community.topic_machinery')}</option>
            <option value="schemes">{t('community.topic_schemes')}</option>
          </select>
          {errors.topic && (
            <p className="text-xs text-red-600">{errors.topic.message}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-earth-800">
            {t('community.post_title')} *
          </label>
          <Input
            {...register('title')}
            placeholder={
              isKn
                ? 'ಉದಾ: ಕಬ್ಬಿನ ಬೆಳೆ ನಿರ್ವಹಣೆಗೆ ಸಲಹೆ ಬೇಕಾಗಿದೆ...'
                : 'e.g., Best fertigation schedule for sugarcane or paddy combine availability...'
            }
            className="text-xs sm:text-sm"
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description / Content */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-earth-800">
            {t('community.post_content')} *
          </label>
          <Textarea
            {...register('content')}
            rows={4}
            placeholder={
              isKn
                ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ, ಅನುಭವ ಅಥವಾ ಕೃಷಿ ಸಲಹೆಯನ್ನು ವಿವರವಾಗಿ ಬರೆಯಿರಿ...'
                : 'Share symptoms observed, field condition, soil type or specific farming question...'
            }
            className="text-xs sm:text-sm min-h-[100px]"
          />
          {errors.content && (
            <p className="text-xs text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* Optional Filters: Crop & Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-700">
              Related Crop (Optional)
            </label>
            <select
              {...register('cropId')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="">{t('community.filter_all_crops')}</option>
              {crops.map(c => (
                <option key={c.id} value={c.id}>
                  {isKn ? c.name_kn : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-700">
              {t('community.select_group')}
            </label>
            <select
              {...register('groupId')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="">Public Discussion (All Mandya)</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {isKn ? g.name_kn : g.name_en} ({g.taluk})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Attachment (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-earth-700">
            Photo Attachment (Optional)
          </label>

          {imagePreview ? (
            <div className="relative inline-block border rounded-xl overflow-hidden shadow-sm">
              <img
                src={imagePreview}
                alt="Attachment preview"
                className="w-36 h-28 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-earth-300 rounded-xl hover:border-forest-500 hover:bg-forest-50/30 cursor-pointer transition">
              <Upload className="w-4 h-4 text-earth-500" />
              <span className="text-xs text-earth-600 font-medium">
                Upload crop photo or field issue image
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSimulatedImageUpload}
              />
            </label>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-earth-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={createPostMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={createPostMutation.isPending}
            className="bg-forest-700 hover:bg-forest-800 text-white"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            {createPostMutation.isPending ? 'Publishing...' : t('community.create_post')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
