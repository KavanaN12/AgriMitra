import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sprout,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Wheat,
  ShieldCheck,
  Building2,
  Check,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useCrops, useLocationHierarchy } from '../hooks/useAgriQuery';
import { MANDYA_LOCATION_HIERARCHY } from '../mocks/mandyaData';

// Avatar icons for farmer selection
const AVATARS = [
  { id: 'avatar-1', label: '🌾 Green Sprout', icon: '🌾' },
  { id: 'avatar-2', label: '🚜 Tractor Farmer', icon: '🚜' },
  { id: 'avatar-3', label: '🌻 Sunflower', icon: '🌻' },
  { id: 'avatar-4', label: '🌴 Coconut Grove', icon: '🌴' },
  { id: 'avatar-5', label: '🐂 Bull & Plough', icon: '🐂' },
  { id: 'avatar-6', label: '🏡 Village Farmstead', icon: '🏡' }
];

export function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateOnboarding } = useAuth();
  const isKn = i18n.language.startsWith('kn');

  const { data: hierarchyData } = useLocationHierarchy();
  const hierarchy = hierarchyData || MANDYA_LOCATION_HIERARCHY;
  const { data: cropsList = [] } = useCrops();

  // Selected state
  const [role, setRole] = useState<'farmer' | 'buyer' | 'both'>('farmer');
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Dynamic step list based on role
  const steps = useMemo(() => {
    if (role === 'farmer') {
      return ['role', 'location', 'crops', 'farmer_details', 'terms', 'complete'];
    } else if (role === 'buyer') {
      return ['role', 'location', 'buyer_details', 'terms', 'complete'];
    } else {
      return ['role', 'location', 'crops', 'farmer_details', 'buyer_details', 'terms', 'complete'];
    }
  }, [role]);

  const currentStepKey = steps[currentStepIndex - 1] || 'role';
  const totalSteps = steps.length;

  // Onboarding Form State
  const [selectedState] = useState('Karnataka');
  const [selectedDistrict] = useState('Mandya');
  const [selectedTaluk, setSelectedTaluk] = useState('Maddur');
  const [selectedHobli, setSelectedHobli] = useState('Koppa');
  const [selectedVillage, setSelectedVillage] = useState('Besagarahalli');
  const [customVillage, setCustomVillage] = useState('');

  const [selectedCrops, setSelectedCrops] = useState<number[]>([1, 2]); // Sugarcane & Paddy
  const [farmSize, setFarmSize] = useState('3.0');
  const [farmingType, setFarmingType] = useState('Mixed / Integrated Farming');
  const [irrigationSource, setIrrigationSource] = useState('Canal (Cauvery / Visvesvaraya)');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1');

  const [buyerBusinessName, setBuyerBusinessName] = useState('Mandya Agro Traders');
  const [buyerType, setBuyerType] = useState('Wholesaler / Mandi Trader');
  const [buyerLicenseNo, setBuyerLicenseNo] = useState('');
  const [interestedCommodities, setInterestedCommodities] = useState<number[]>([1, 2, 4]);

  const [termsAccepted, setTermsAccepted] = useState(true);

  // Available Hoblis based on selected taluk
  const availableTaluks = useMemo(() => {
    const distData = hierarchy?.Karnataka?.Mandya || {};
    return Object.keys(distData);
  }, [hierarchy]);

  const availableHoblis = useMemo(() => {
    const talukData = hierarchy?.Karnataka?.Mandya?.[selectedTaluk] || {};
    return Object.keys(talukData);
  }, [hierarchy, selectedTaluk]);

  const availableVillages = useMemo(() => {
    const villages = hierarchy?.Karnataka?.Mandya?.[selectedTaluk]?.[selectedHobli] || [];
    return villages;
  }, [hierarchy, selectedTaluk, selectedHobli]);

  const handleTalukChange = (taluk: string) => {
    setSelectedTaluk(taluk);
    const hoblis = Object.keys(hierarchy?.Karnataka?.Mandya?.[taluk] || {});
    const firstHobli = hoblis[0] || 'Kasaba';
    setSelectedHobli(firstHobli);
    const villages = hierarchy?.Karnataka?.Mandya?.[taluk]?.[firstHobli] || [];
    setSelectedVillage(villages[0] || '');
  };

  const handleHobliChange = (hobli: string) => {
    setSelectedHobli(hobli);
    const villages = hierarchy?.Karnataka?.Mandya?.[selectedTaluk]?.[hobli] || [];
    setSelectedVillage(villages[0] || '');
  };

  const toggleCrop = (cropId: number) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId]
    );
  };

  const toggleInterestedCommodity = (cropId: number) => {
    setInterestedCommodities((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId]
    );
  };

  // Step Validation before progressing
  const validateCurrentStep = (): boolean => {
    setApiError(null);
    if (currentStepKey === 'role') {
      return true;
    }
    if (currentStepKey === 'location') {
      const finalVillage = customVillage.trim() || selectedVillage;
      if (!finalVillage) {
        setApiError(isKn ? 'ದಯವಿಟ್ಟು ಗ್ರಾಮ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಮೂದಿಸಿ' : 'Please select or enter your village');
        return false;
      }
      return true;
    }
    if (currentStepKey === 'crops') {
      if (selectedCrops.length === 0) {
        setApiError(isKn ? 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ' : 'Please select at least one crop');
        return false;
      }
      return true;
    }
    if (currentStepKey === 'farmer_details') {
      if (!farmSize || Number(farmSize) <= 0) {
        setApiError(isKn ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಎಕರೆ ವಿಸ್ತೀರ್ಣ ನಮೂದಿಸಿ' : 'Please enter valid land acreage');
        return false;
      }
      return true;
    }
    if (currentStepKey === 'buyer_details') {
      if (!buyerBusinessName.trim()) {
        setApiError(isKn ? 'ದಯವಿಟ್ಟು ಸಂಸ್ಥೆ/ವ್ಯಾಪಾರದ ಹೆಸರು ನಮೂದಿಸಿ' : 'Please enter business / enterprise name');
        return false;
      }
      return true;
    }
    if (currentStepKey === 'terms') {
      if (!termsAccepted) {
        setApiError(isKn ? 'ಮುಂದುವರಿಯಲು ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಕು' : 'You must accept the terms to continue');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    // If moving to 'complete' (the last step), trigger API update
    const nextIndex = currentStepIndex + 1;
    const nextKey = steps[nextIndex - 1];

    if (nextKey === 'complete') {
      setIsSubmitting(true);
      try {
        const finalVillage = customVillage.trim() || selectedVillage;
        await updateOnboarding({
          role,
          location: {
            state: selectedState,
            district: selectedDistrict,
            taluk: selectedTaluk,
            hobli: selectedHobli,
            village: finalVillage,
            pincode: '571401'
          },
          crop_ids: role !== 'buyer' ? selectedCrops : undefined,
          farm_size_acres: role !== 'buyer' ? Number(farmSize) : undefined,
          farming_type: role !== 'buyer' ? farmingType : undefined,
          irrigation_source: role !== 'buyer' ? irrigationSource : undefined,
          profile_photo_url: selectedAvatar,
          buyer_business_name: role !== 'farmer' ? buyerBusinessName : undefined,
          buyer_type: role !== 'farmer' ? buyerType : undefined,
          buyer_license_no: role !== 'farmer' ? buyerLicenseNo : undefined,
          interested_crops: role !== 'farmer' ? interestedCommodities : undefined,
          terms_accepted: true,
          step: totalSteps,
          is_completed: true
        });
        setCurrentStepIndex(nextIndex);
      } catch (err: any) {
        setApiError(err?.message || (isKn ? 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ' : 'Failed to save profile'));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStepIndex(nextIndex);
    }
  };

  const handleBack = () => {
    setApiError(null);
    if (currentStepIndex > 1) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = () => {
    if (role === 'buyer') {
      navigate('/market');
    } else {
      navigate('/');
    }
  };

  const progressPercent = Math.round((currentStepIndex / totalSteps) * 100);

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Top Wizard Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-earth-700">
          <span className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-agri-700" />
            <span>{t('onboarding.title')}</span>
          </span>
          <span className="text-agri-800 bg-agri-50 px-2.5 py-1 rounded-full font-bold">
            {t('onboarding.step_indicator', { current: currentStepIndex, total: totalSteps })}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-earth-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-agri-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Wizard Step 1: Role Selection */}
      {currentStepKey === 'role' && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-xs animate-fadeIn">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-earth-900">
              {t('onboarding.step_role')}
            </h2>
            <p className="text-xs sm:text-sm text-earth-600">
              {isKn
                ? 'ನೀವು ಅಗ್ರಿಮಿತ್ರವನ್ನು ಹೇಗೆ ಬಳಸಲು ಬಯಸುತ್ತೀರಿ? (ರೈತ, ಖರೀದಿದಾರ ಅಥವಾ ಎರಡೂ)'
                : 'Select how you want to participate in AgriMitra Mandya pilot.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Farmer Card */}
            <div
              onClick={() => setRole('farmer')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                role === 'farmer'
                  ? 'border-agri-600 bg-agri-50/70 shadow-xs'
                  : 'border-earth-200 hover:border-earth-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-agri-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Wheat className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base sm:text-lg text-earth-900">
                    {t('onboarding.role_farmer_title')}
                  </h3>
                  {role === 'farmer' && <CheckCircle2 className="w-6 h-6 text-agri-600 shrink-0" />}
                </div>
                <p className="text-xs sm:text-sm text-earth-600 leading-relaxed">
                  {t('onboarding.role_farmer_desc')}
                </p>
              </div>
            </div>

            {/* Buyer Card */}
            <div
              onClick={() => setRole('buyer')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                role === 'buyer'
                  ? 'border-agri-600 bg-agri-50/70 shadow-xs'
                  : 'border-earth-200 hover:border-earth-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-harvest-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base sm:text-lg text-earth-900">
                    {t('onboarding.role_buyer_title')}
                  </h3>
                  {role === 'buyer' && <CheckCircle2 className="w-6 h-6 text-agri-600 shrink-0" />}
                </div>
                <p className="text-xs sm:text-sm text-earth-600 leading-relaxed">
                  {t('onboarding.role_buyer_desc')}
                </p>
              </div>
            </div>

            {/* Both Card */}
            <div
              onClick={() => setRole('both')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                role === 'both'
                  ? 'border-agri-600 bg-agri-50/70 shadow-xs'
                  : 'border-earth-200 hover:border-earth-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-earth-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base sm:text-lg text-earth-900">
                    {t('onboarding.role_both_title')}
                  </h3>
                  {role === 'both' && <CheckCircle2 className="w-6 h-6 text-agri-600 shrink-0" />}
                </div>
                <p className="text-xs sm:text-sm text-earth-600 leading-relaxed">
                  {t('onboarding.role_both_desc')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Wizard Step 2: Location Selection Cascade */}
      {currentStepKey === 'location' && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-xs animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-agri-700" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-earth-900">
                {t('onboarding.step_location')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-earth-600">
              {isKn
                ? 'ಸ್ಥಳೀಯ ಬೆಳೆ ಸಲಹೆಗಳು ಮತ್ತು ನಿಮ್ಮ ಸಮೀಪದ ಮಾರುಕಟ್ಟೆಗಾಗಿ ತಾಲೂಕು, ಹೋಬಳಿ ಹಾಗೂ ಗ್ರಾಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
                : 'Select your administrative taluk, hobli, and village in Mandya district.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* State (Locked) */}
            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.location_state')}
              </label>
              <input
                type="text"
                value="Karnataka (ಕರ್ನಾಟಕ)"
                disabled
                className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-earth-100 px-3.5 py-2.5 text-sm text-earth-700 cursor-not-allowed font-medium"
              />
            </div>

            {/* District (Locked) */}
            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.location_district')}
              </label>
              <input
                type="text"
                value="Mandya (ಮಂಡ್ಯ)"
                disabled
                className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-earth-100 px-3.5 py-2.5 text-sm text-earth-700 cursor-not-allowed font-medium"
              />
            </div>

            {/* Taluk Cascade */}
            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.location_taluk')}
              </label>
              <select
                value={selectedTaluk}
                onChange={(e) => handleTalukChange(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-white px-3.5 py-2.5 text-sm font-medium text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-600"
              >
                {availableTaluks.map((tName) => (
                  <option key={tName} value={tName}>
                    {tName}
                  </option>
                ))}
              </select>
            </div>

            {/* Hobli Cascade */}
            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.location_hobli')}
              </label>
              <select
                value={selectedHobli}
                onChange={(e) => handleHobliChange(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-white px-3.5 py-2.5 text-sm font-medium text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-600"
              >
                {availableHoblis.map((hName) => (
                  <option key={hName} value={hName}>
                    {hName}
                  </option>
                ))}
              </select>
            </div>

            {/* Village Cascade */}
            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.location_village')}
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-white px-3.5 py-2.5 text-sm font-medium text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-600"
              >
                {availableVillages.map((vName) => (
                  <option key={vName} value={vName}>
                    {vName}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Village option if not in list */}
            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {isKn ? 'ಇತರ ಗ್ರಾಮದ ಹೆಸರು (ಐಚ್ಛಿಕ)' : 'Other Village Name (Optional)'}
              </label>
              <Input
                type="text"
                placeholder={isKn ? 'ನಿಮ್ಮ ಗ್ರಾಮ ಪಟ್ಟಿಯಲ್ಲಿಲ್ಲದಿದ್ದರೆ ನಮೂದಿಸಿ' : 'If not listed above, enter here'}
                value={customVillage}
                onChange={(e) => setCustomVillage(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Wizard Step 3: Crop Selection */}
      {currentStepKey === 'crops' && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-xs animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-extrabold text-earth-900">
                {t('onboarding.crops_title')}
              </h2>
              <Badge variant="outline" className="text-agri-800 font-bold bg-agri-50">
                {selectedCrops.length} {t('onboarding.selected_count')}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-earth-600">
              {t('onboarding.crops_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {cropsList.map((crop) => {
              const isSelected = selectedCrops.includes(crop.id);
              return (
                <div
                  key={crop.id}
                  onClick={() => toggleCrop(crop.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-agri-600 bg-agri-50 text-agri-950 font-bold shadow-xs'
                      : 'border-earth-200 hover:border-earth-300 bg-white text-earth-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm sm:text-base font-semibold leading-tight">
                      {isKn ? crop.name_kn : crop.name_en}
                    </p>
                    <p className="text-xs text-earth-500 font-normal capitalize">
                      {crop.category} • {crop.seasonality}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-agri-600 text-white' : 'border border-earth-300'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Wizard Step 4: Farmer Profile Details */}
      {currentStepKey === 'farmer_details' && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-xs animate-fadeIn">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-earth-900">
              {t('onboarding.step_farmer_profile')}
            </h2>
            <p className="text-xs sm:text-sm text-earth-600">
              {isKn
                ? 'ನಿಖರವಾದ ನೀರಾವರಿ ಹಾಗೂ ಗೊಬ್ಬರ ಸಲಹೆಗಳಿಗಾಗಿ ನಿಮ್ಮ ಕೃಷಿ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.'
                : 'Share land size, farming methods and water source for personalized recommendations.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                label={t('onboarding.farm_size')}
                type="number"
                step="0.5"
                min="0.1"
                placeholder={t('onboarding.farm_size_placeholder')}
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.farming_type')}
              </label>
              <select
                value={farmingType}
                onChange={(e) => setFarmingType(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-white px-3.5 py-2.5 text-sm font-medium text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-600"
              >
                <option value="Mixed / Integrated Farming">
                  {t('onboarding.farming_type_mixed')}
                </option>
                <option value="Conventional / Chemical Farming">
                  {t('onboarding.farming_type_conventional')}
                </option>
                <option value="Certified Organic">
                  {t('onboarding.farming_type_organic')}
                </option>
                <option value="Zero Budget / Natural Farming (ZBNF)">
                  {t('onboarding.farming_type_natural')}
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.irrigation_source')}
              </label>
              <select
                value={irrigationSource}
                onChange={(e) => setIrrigationSource(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-white px-3.5 py-2.5 text-sm font-medium text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-600"
              >
                <option value="Canal (Cauvery / Visvesvaraya)">
                  {t('onboarding.irrigation_canal')}
                </option>
                <option value="Borewell">
                  {t('onboarding.irrigation_borewell')}
                </option>
                <option value="Rainfed">
                  {t('onboarding.irrigation_rainfed')}
                </option>
                <option value="Drip / Sprinkler Micro-irrigation">
                  {t('onboarding.irrigation_drip')}
                </option>
              </select>
            </div>

            {/* Profile Avatar Selection */}
            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.profile_photo')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      selectedAvatar === av.id
                        ? 'border-agri-600 bg-agri-50 text-agri-950 scale-105 shadow-xs'
                        : 'border-earth-200 hover:border-earth-300 bg-white text-earth-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{av.icon}</span>
                    <span className="text-[10px] text-center font-medium line-clamp-1">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Wizard Step 5: Buyer Profile Details */}
      {currentStepKey === 'buyer_details' && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-xs animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-agri-700" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-earth-900">
                {t('onboarding.step_buyer_profile')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-earth-600">
              {isKn
                ? 'ಮಂಡ್ಯ ರೈತರಿಗೆ ನಿಮ್ಮ ವ್ಯಾಪಾರದ ವಿಶ್ವಾಸಾರ್ಹತೆ ಮೂಡಿಸಲು ಸಂಸ್ಥೆಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.'
                : 'Enter your business details to establish trust with Mandya produce growers.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                label={t('onboarding.buyer_business')}
                type="text"
                placeholder={t('onboarding.buyer_business_placeholder')}
                value={buyerBusinessName}
                onChange={(e) => setBuyerBusinessName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {t('onboarding.buyer_type')}
              </label>
              <select
                value={buyerType}
                onChange={(e) => setBuyerType(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-white px-3.5 py-2.5 text-sm font-medium text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-600"
              >
                <option value="Wholesaler / Mandi Trader">
                  {t('onboarding.buyer_type_wholesaler')}
                </option>
                <option value="Retailer / Supermarket / Shop">
                  {t('onboarding.buyer_type_retailer')}
                </option>
                <option value="Food Processor / Mill">
                  {t('onboarding.buyer_type_processor')}
                </option>
                <option value="FPO / Cooperative Society">
                  {t('onboarding.buyer_type_fpo')}
                </option>
              </select>
            </div>

            <div>
              <Input
                label={t('onboarding.buyer_license')}
                type="text"
                placeholder={t('onboarding.buyer_license_placeholder')}
                value={buyerLicenseNo}
                onChange={(e) => setBuyerLicenseNo(e.target.value)}
              />
            </div>

            {/* Interested Commodities Chips */}
            <div>
              <label className="text-sm font-medium text-earth-800 mb-1.5 block">
                {isKn ? 'ಖರೀದಿಸಲು ಆಸಕ್ತಿಯಿರುವ ಬೆಳೆಗಳು' : 'Interested Commodities for Procurement'}
              </label>
              <div className="flex flex-wrap gap-2">
                {cropsList.map((crop) => {
                  const isChecked = interestedCommodities.includes(crop.id);
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => toggleInterestedCommodity(crop.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'border-agri-600 bg-agri-100 text-agri-900'
                          : 'border-earth-300 bg-white text-earth-700 hover:border-earth-400'
                      }`}
                    >
                      {isKn ? crop.name_kn : crop.name_en} {isChecked ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Wizard Step 6: Terms & Consent */}
      {currentStepKey === 'terms' && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-xs animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-agri-700" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-earth-900">
                {t('onboarding.step_terms')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-earth-600">
              {t('onboarding.terms_title')}
            </p>
          </div>

          <div className="space-y-3.5 p-4 rounded-xl bg-earth-50 border border-earth-200 text-xs sm:text-sm text-earth-800">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                1
              </div>
              <p>{t('onboarding.terms_item_1')}</p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                2
              </div>
              <p>{t('onboarding.terms_item_2')}</p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                3
              </div>
              <p>{t('onboarding.terms_item_3')}</p>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-agri-200 bg-agri-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded text-agri-600 focus:ring-agri-500 border-earth-300 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-earth-900 leading-snug">
              {t('onboarding.consent_checkbox')}
            </span>
          </label>
        </Card>
      )}

      {/* Wizard Step 7: Completion & Welcome Screen */}
      {currentStepKey === 'complete' && (
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-xs text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-earth-900">
              {t('onboarding.completion_title')}
            </h2>
            <p className="text-sm sm:text-base text-earth-600">
              {t('onboarding.completion_desc', {
                roleName:
                  role === 'both'
                    ? isKn
                      ? 'ರೈತ ಮತ್ತು ಖರೀದಿದಾರ'
                      : 'Farmer & Buyer'
                    : role === 'buyer'
                    ? isKn
                      ? 'ಖರೀದಿದಾರ'
                      : 'Buyer'
                    : isKn
                    ? 'ರೈತ'
                    : 'Farmer'
              })}
            </p>
          </div>

          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-earth-50 border border-earth-200 text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto">
            <div className="flex justify-between border-b border-earth-200 pb-2">
              <span className="text-earth-500 font-medium">{t('profile.role')}:</span>
              <span className="font-bold text-earth-900 capitalize">{role}</span>
            </div>
            <div className="flex justify-between border-b border-earth-200 pb-2">
              <span className="text-earth-500 font-medium">{t('profile.location')}:</span>
              <span className="font-bold text-earth-900">
                {customVillage || selectedVillage}, {selectedTaluk}
              </span>
            </div>
            {role !== 'buyer' && (
              <div className="flex justify-between border-b border-earth-200 pb-2">
                <span className="text-earth-500 font-medium">{t('profile.my_crops')}:</span>
                <span className="font-bold text-earth-900">{selectedCrops.length} Crops Enrolled</span>
              </div>
            )}
            {role !== 'farmer' && (
              <div className="flex justify-between pb-1">
                <span className="text-earth-500 font-medium">{t('onboarding.buyer_business')}:</span>
                <span className="font-bold text-earth-900">{buyerBusinessName}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-earth-500 max-w-md mx-auto">
            {role === 'buyer'
              ? t('onboarding.completion_buyer_hint')
              : t('onboarding.completion_farmer_hint')}
          </p>

          <Button
            size="lg"
            className="w-full sm:w-72 mx-auto font-bold shadow-sm"
            onClick={handleFinish}
          >
            <span>{t('onboarding.go_dashboard')}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Navigation Buttons (Back & Next) */}
      {currentStepKey !== 'complete' && (
        <div className="flex items-center justify-between pt-2">
          {currentStepIndex > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>{t('onboarding.btn_back')}</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleNext}
            isLoading={isSubmitting}
            className="font-bold min-w-[140px]"
          >
            <span>
              {currentStepIndex === totalSteps - 1
                ? t('onboarding.btn_finish')
                : t('onboarding.btn_next')}
            </span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
