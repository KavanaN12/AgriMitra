import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog } from '../ui/dialog';
import {
  useMyCrops,
  useCrops,
  useEnrollCrop,
  useUpdateUserCrop,
  useDeleteUserCrop
} from '../../hooks/useAgriQuery';
import { UserCrop } from '../../types/api';

const STAGE_OPTIONS = [
  { id: 'Sowing / Seedling', label_en: 'Sowing / Seedling', label_kn: 'ಬಿತ್ತನೆ / ಸಸಿ ಹಂತ' },
  { id: 'Tillering / Vegetative', label_en: 'Tillering / Vegetative', label_kn: 'ಕವಲೊಡೆಯುವಿಕೆ / ಬೆಳವಣಿಗೆ ಹಂತ' },
  { id: 'Flowering / Grand Growth', label_en: 'Flowering / Grand Growth', label_kn: 'ಹೂವಾಡುವ / ಶೀಘ್ರ ಬೆಳವಣಿಗೆ ಹಂತ' },
  { id: 'Maturity / Ripening', label_en: 'Maturity / Ripening', label_kn: 'ಕಾಳು ತುಂಬುವ / ಮಾಗುವ ಹಂತ' },
  { id: 'Harvesting', label_en: 'Harvesting', label_kn: 'ಕಟಾವು ಹಂತ' }
];

const SOIL_OPTIONS = [
  { id: 'Red Sandy Loam', label_en: 'Red Sandy Loam (ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ)', label_kn: 'ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಗೊಡು ಮಣ್ಣು' },
  { id: 'Clay Loam', label_en: 'Clay Loam (ಜೇಡಿ ಮಣ್ಣು)', label_kn: 'ಜೇಡಿ ಮಣ್ಣು' },
  { id: 'Black Soil', label_en: 'Black Soil (ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು)', label_kn: 'ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು' },
  { id: 'Alluvial Loam', label_en: 'Alluvial Loam (ನದಿಯ ಮೆಕ್ಕಲು ಮಣ್ಣು)', label_kn: 'ನದಿಯ ಮೆಕ್ಕಲು ಮಣ್ಣು' }
];

const IRRIGATION_OPTIONS = [
  { id: 'Canal (Cauvery)', label_en: 'Canal (Cauvery / Visvesvaraya)', label_kn: 'ಕಾಲುವೆ ನೀರಾವರಿ (ಕಾವೇರಿ)' },
  { id: 'Borewell', label_en: 'Borewell (ಬೋರ್‌ವೆಲ್)', label_kn: 'ಬೋರ್‌ವೆಲ್' },
  { id: 'Drip / Micro-irrigation', label_en: 'Drip / Micro-irrigation (ಹನಿ ನೀರಾವರಿ)', label_kn: 'ಹನಿ ನೀರಾವರಿ' },
  { id: 'Rainfed', label_en: 'Rainfed (ಮಳೆಯಾಶ್ರಿತ)', label_kn: 'ಮಳೆಯಾಶ್ರಿತ' }
];

export function MyCropsManager() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: myCrops = [], isLoading: loadingMyCrops } = useMyCrops();
  const { data: availableCrops = [] } = useCrops();

  const enrollMutation = useEnrollCrop();
  const updateMutation = useUpdateUserCrop();
  const deleteMutation = useDeleteUserCrop();

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<UserCrop | null>(null);
  const [cropToDelete, setCropToDelete] = useState<UserCrop | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    crop_id: 1,
    acreage: 2.0,
    sowing_date: new Date().toISOString().split('T')[0],
    stage: 'Tillering / Vegetative',
    soil_type: 'Red Sandy Loam',
    irrigation_type: 'Canal (Cauvery)'
  });

  const resetForm = () => {
    setFormData({
      crop_id: availableCrops[0]?.id || 1,
      acreage: 2.0,
      sowing_date: new Date().toISOString().split('T')[0],
      stage: 'Tillering / Vegetative',
      soil_type: 'Red Sandy Loam',
      irrigation_type: 'Canal (Cauvery)'
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (userCrop: UserCrop) => {
    setEditingCrop(userCrop);
    setFormData({
      crop_id: userCrop.crop_id,
      acreage: userCrop.acreage,
      sowing_date: userCrop.sowing_date || new Date().toISOString().split('T')[0],
      stage: userCrop.stage || 'Tillering / Vegetative',
      soil_type: userCrop.soil_type || 'Red Sandy Loam',
      irrigation_type: userCrop.irrigation_type || 'Canal (Cauvery)'
    });
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    enrollMutation.mutate(
      {
        crop_id: Number(formData.crop_id),
        acreage: Number(formData.acreage),
        stage: formData.stage,
        sowing_date: formData.sowing_date,
        soil_type: formData.soil_type,
        irrigation_type: formData.irrigation_type
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
        }
      }
    );
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop) return;

    updateMutation.mutate(
      {
        id: editingCrop.id,
        payload: {
          acreage: Number(formData.acreage),
          stage: formData.stage,
          sowing_date: formData.sowing_date,
          soil_type: formData.soil_type,
          irrigation_type: formData.irrigation_type
        }
      },
      {
        onSuccess: () => {
          setEditingCrop(null);
        }
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!cropToDelete) return;
    deleteMutation.mutate(cropToDelete.id, {
      onSuccess: () => {
        setCropToDelete(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-earth-900 flex items-center gap-2">
            <Sprout className="h-5 w-5 text-agri-700" />
            {t('advisory.tabs_my_crops')}
          </h2>
          <p className="text-xs sm:text-sm text-earth-600 mt-0.5">
            {t('advisory.manage_crops_desc')}
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-agri-700 hover:bg-agri-800 text-white font-semibold flex items-center gap-1.5 shadow-xs w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t('advisory.add_crop')}
        </Button>
      </div>

      {/* My Crops List */}
      {loadingMyCrops ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-earth-100 animate-pulse" />
          ))}
        </div>
      ) : myCrops.length === 0 ? (
        <div className="p-8 rounded-2xl border-2 border-dashed border-earth-300 text-center bg-white space-y-3">
          <div className="h-12 w-12 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center mx-auto">
            <Sprout className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-earth-900">
            {t('advisory.no_crops_enrolled')}
          </h3>
          <Button
            onClick={handleOpenAdd}
            className="bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('advisory.add_crop')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCrops.map((crop) => {
            const cropName = crop.crop_name || (isKn ? crop.name_kn || crop.crop?.name_kn : crop.name_en || crop.crop?.name_en) || 'Mandya Crop';

            // Calculate days since sowing if date available
            let daysSinceSowing = null;
            if (crop.sowing_date) {
              const diffTime = Math.abs(new Date().getTime() - new Date(crop.sowing_date).getTime());
              daysSinceSowing = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return (
              <Card
                key={crop.id}
                className="border-earth-200 hover:border-agri-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="default" className="font-bold text-agri-900 bg-agri-100 text-xs">
                      {cropName}
                    </Badge>
                    <span className="text-xs font-bold text-harvest-700 bg-harvest-50 px-2 py-0.5 rounded-md border border-harvest-200">
                      {crop.acreage} {t('profile.acreage')}
                    </span>
                  </div>

                  <CardTitle className="text-base text-earth-900">
                    {crop.stage || 'Active Field'}
                  </CardTitle>

                  <div className="mt-3 space-y-2 text-xs text-earth-700 bg-earth-50/70 p-3 rounded-xl border border-earth-100">
                    {crop.sowing_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-earth-500 flex items-center gap-1 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-earth-400" />
                          {t('advisory.sowing_date')}:
                        </span>
                        <span className="font-semibold text-earth-800 font-mono">
                          {crop.sowing_date}
                          {daysSinceSowing && (
                            <span className="text-[11px] text-agri-700 font-normal ml-1">
                              ({daysSinceSowing} {isKn ? 'ದಿನಗಳು' : 'days'})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {crop.soil_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-earth-500 flex items-center gap-1 font-medium">
                          <Layers className="h-3.5 w-3.5 text-earth-400" />
                          {t('advisory.soil_type')}:
                        </span>
                        <span className="font-medium text-earth-800 truncate max-w-[140px]">
                          {crop.soil_type}
                        </span>
                      </div>
                    )}

                    {crop.irrigation_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-earth-500 flex items-center gap-1 font-medium">
                          <Droplets className="h-3.5 w-3.5 text-sky-500" />
                          {t('advisory.irrigation_type')}:
                        </span>
                        <span className="font-medium text-earth-800 truncate max-w-[140px]">
                          {crop.irrigation_type}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                {/* Card Actions */}
                <div className="px-5 py-3 border-t border-earth-100 flex items-center justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(crop)}
                    className="text-xs text-earth-700 hover:text-agri-800 hover:bg-earth-100 font-medium px-2.5"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1 text-earth-500" />
                    {t('advisory.edit_crop')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCropToDelete(crop)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-medium px-2.5"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1 text-red-500" />
                    {t('advisory.delete_crop')}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Crop Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t('advisory.add_crop')}
        description={isKn ? 'ನಿಮ್ಮ ಮಂಡ್ಯ ಕೃಷಿ ಜಮೀನಿಗೆ ಹೊಸ ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ' : 'Enroll a cultivated crop in your Mandya farm profile.'}
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-earth-700 mb-1 block">
              {t('advisory.crop_name')} *
            </label>
            <select
              value={formData.crop_id}
              onChange={(e) => setFormData({ ...formData, crop_id: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-earth-300 bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              {availableCrops.map((c) => (
                <option key={c.id} value={c.id}>
                  {isKn ? c.name_kn : c.name_en} {c.scientific_name ? `(${c.scientific_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-earth-700 mb-1 block">
                {t('advisory.acreage')} *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.acreage}
                onChange={(e) => setFormData({ ...formData, acreage: Number(e.target.value) })}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-earth-700 mb-1 block">
                {t('advisory.sowing_date')}
              </label>
              <Input
                type="date"
                value={formData.sowing_date}
                onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-earth-700 mb-1 block">
              {t('advisory.current_stage')}
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-earth-300 bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              {STAGE_OPTIONS.map((st) => (
                <option key={st.id} value={st.id}>
                  {isKn ? st.label_kn : st.label_en}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-earth-700 mb-1 block">
                {t('advisory.soil_type')}
              </label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white"
              >
                {SOIL_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isKn ? s.label_kn : s.label_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-earth-700 mb-1 block">
                {t('advisory.irrigation_type')}
              </label>
              <select
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white"
              >
                {IRRIGATION_OPTIONS.map((irr) => (
                  <option key={irr.id} value={irr.id}>
                    {isKn ? irr.label_kn : irr.label_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-earth-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={enrollMutation.isPending}
              className="bg-agri-700 hover:bg-agri-800 text-white font-semibold"
            >
              {enrollMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Crop Modal */}
      <Dialog
        isOpen={!!editingCrop}
        onClose={() => setEditingCrop(null)}
        title={t('advisory.edit_crop')}
        description={editingCrop ? `${editingCrop.crop_name || (isKn ? editingCrop.name_kn || editingCrop.crop?.name_kn : editingCrop.name_en || editingCrop.crop?.name_en)}` : undefined}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-earth-700 mb-1 block">
                {t('advisory.acreage')} *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.acreage}
                onChange={(e) => setFormData({ ...formData, acreage: Number(e.target.value) })}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-earth-700 mb-1 block">
                {t('advisory.sowing_date')}
              </label>
              <Input
                type="date"
                value={formData.sowing_date}
                onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-earth-700 mb-1 block">
              {t('advisory.current_stage')}
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-earth-300 bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              {STAGE_OPTIONS.map((st) => (
                <option key={st.id} value={st.id}>
                  {isKn ? st.label_kn : st.label_en}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-earth-700 mb-1 block">
                {t('advisory.soil_type')}
              </label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white"
              >
                {SOIL_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isKn ? s.label_kn : s.label_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-earth-700 mb-1 block">
                {t('advisory.irrigation_type')}
              </label>
              <select
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 bg-white"
              >
                {IRRIGATION_OPTIONS.map((irr) => (
                  <option key={irr.id} value={irr.id}>
                    {isKn ? irr.label_kn : irr.label_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-earth-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingCrop(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-agri-700 hover:bg-agri-800 text-white font-semibold"
            >
              {updateMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!cropToDelete}
        onClose={() => setCropToDelete(null)}
        title={t('advisory.delete_crop')}
        description={t('advisory.delete_confirm')}
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-earth-800">
            {cropToDelete && (
              <span className="font-semibold text-earth-900">
                {cropToDelete.crop_name || (isKn ? cropToDelete.name_kn || cropToDelete.crop?.name_kn : cropToDelete.name_en || cropToDelete.crop?.name_en)} ({cropToDelete.acreage} {t('profile.acreage')})
              </span>
            )}
          </p>

          <div className="pt-2 flex justify-end gap-2 border-t border-earth-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCropToDelete(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deleteMutation.isPending ? t('common.loading') : t('advisory.delete_crop')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
