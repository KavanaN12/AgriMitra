import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sprout,
  User as UserIcon,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building2,
  Wheat,
  Info
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { useCrops, useLocationHierarchy } from '../hooks/useAgriQuery';
import { MANDYA_LOCATION_HIERARCHY } from '../mocks/mandyaData';

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const isKn = i18n.language.startsWith('kn');

  const { data: hierarchyData } = useLocationHierarchy();
  const hierarchy = hierarchyData || MANDYA_LOCATION_HIERARCHY;
  const { data: cropsList = [] } = useCrops();

  const [role, setRole] = useState<'farmer' | 'buyer' | 'both'>('farmer');
  const [apiError, setApiError] = useState<string | null>(null);

  // Location Hierarchy Selection
  const [selectedTaluk, setSelectedTaluk] = useState<string>('Maddur');
  const [selectedHobli, setSelectedHobli] = useState<string>('Kasaba');
  const [selectedVillage, setSelectedVillage] = useState<string>('Shivapura');
  const [customVillage, setCustomVillage] = useState<string>('');

  // Selected Crops for Farmer
  const [selectedCrops, setSelectedCrops] = useState<number[]>([1, 2]); // Default Sugarcane & Paddy

  // Available Hoblis & Villages
  const availableTaluks = useMemo(() => {
    const mandya = hierarchy?.Karnataka?.Mandya || {};
    return Object.keys(mandya);
  }, [hierarchy]);

  const availableHoblis = useMemo(() => {
    const talukObj = hierarchy?.Karnataka?.Mandya?.[selectedTaluk] || {};
    return Object.keys(talukObj);
  }, [hierarchy, selectedTaluk]);

  const availableVillages = useMemo(() => {
    const talukObj = hierarchy?.Karnataka?.Mandya?.[selectedTaluk] || {};
    return talukObj[selectedHobli] || [];
  }, [hierarchy, selectedTaluk, selectedHobli]);

  const handleTalukChange = (taluk: string) => {
    setSelectedTaluk(taluk);
    const talukObj = hierarchy?.Karnataka?.Mandya?.[taluk] || {};
    const hoblis = Object.keys(talukObj);
    const firstHobli = hoblis[0] || '';
    setSelectedHobli(firstHobli);
    const villages = talukObj[firstHobli] || [];
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

  // Validation Schema
  const registerSchema = z.object({
    full_name: z.string().min(2, {
      message: isKn ? 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳ ಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ' : 'Name must be at least 2 characters'
    }),
    email: z.string().email({
      message: isKn ? 'ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ' : 'Enter a valid email address'
    }),
    phone_number: z.string().regex(/^[6-9]\d{9}$/, {
      message: isKn ? 'ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Enter a valid 10-digit mobile number'
    }),
    password: z.string().min(6, {
      message: isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು' : 'Password must be at least 6 characters'
    }),
    confirm_password: z.string().min(1, {
      message: isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' : 'Please confirm your password'
    }),
    farm_size_acres: z.string().optional(),
    farming_type: z.string().optional(),
    irrigation_source: z.string().optional(),
    buyer_business_name: z.string().optional(),
    buyer_type: z.string().optional(),
    buyer_license_no: z.string().optional()
  }).refine((data) => data.password === data.confirm_password, {
    message: isKn ? 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ' : 'Passwords do not match',
    path: ['confirm_password']
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      password: '',
      confirm_password: '',
      farm_size_acres: '3.0',
      farming_type: 'organic',
      irrigation_source: 'canal',
      buyer_business_name: '',
      buyer_type: 'wholesaler',
      buyer_license_no: ''
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      const finalVillage = customVillage.trim() || selectedVillage || 'Guthalu';

      const createdUser = await registerUser({
        full_name: data.full_name.trim(),
        email: data.email.toLowerCase().trim(),
        phone_number: data.phone_number.trim(),
        password: data.password,
        preferred_language: isKn ? 'kn' : 'en',
        role: role,
        location: {
          state: 'Karnataka',
          district: 'Mandya',
          taluk: selectedTaluk,
          hobli: selectedHobli,
          village: finalVillage,
          pincode: '571401'
        },
        farm_size_acres: role !== 'buyer' ? Number(data.farm_size_acres || 2.0) : undefined,
        farming_type: role !== 'buyer' ? data.farming_type : undefined,
        irrigation_source: role !== 'buyer' ? data.irrigation_source : undefined,
        crop_ids: role !== 'buyer' ? selectedCrops : undefined,
        buyer_business_name: role !== 'farmer' ? data.buyer_business_name : undefined,
        buyer_type: role !== 'farmer' ? data.buyer_type : undefined,
        buyer_license_no: role !== 'farmer' ? data.buyer_license_no : undefined
      });

      if (createdUser.active_role === 'buyer') {
        navigate('/market');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setApiError(
        err?.message ||
        (isKn ? 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Registration failed. Please try again.')
      );
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-sm animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-sm aspect-square">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-earth-900 font-kannada leading-snug tracking-normal">
            {isKn ? 'ಅಗ್ರಮಿತ್ರ ಹೊಸ ಖಾತೆ ನೋಂದಣಿ' : 'Create Your AgriMitra Account'}
          </h1>
          <p className="text-xs sm:text-sm text-earth-600 font-kannada leading-relaxed">
            {isKn
              ? 'ನಿಮ್ಮ ಸ್ವಂತ ವಿವರಗಳೊಂದಿಗೆ ನೋಂದಾಯಿಸಿ, ಬೆಳೆ ಸಲಹೆ, ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಸಮುದಾಯ ಪ್ರಯೋಜನಗಳನ್ನು ಪಡೆಯಿರಿ'
              : 'Register your genuine profile to access personalized advisory, farmer community and direct marketplace'}
          </p>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Account Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-earth-100">
              <UserIcon className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-bold text-earth-900 font-kannada">
                {isKn ? '೧. ವೈಯಕ್ತಿಕ ವಿವರಗಳು & ಲಾಗಿನ್ ಮಾಹಿತಿ' : '1. Personal Details & Credentials'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label={t('auth.full_name')}
                  type="text"
                  placeholder={isKn ? 'ಉದಾ: ಅನನ್ಯ ರಾವ್' : 'e.g. Ananya Rao'}
                  error={errors.full_name?.message}
                  {...register('full_name')}
                />
              </div>

              <div>
                <Input
                  label={isKn ? 'ಇಮೇಲ್ ವಿಳಾಸ' : 'Email Address'}
                  type="email"
                  placeholder="ananya.farmer@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div>
                <Input
                  label={t('auth.phone_number')}
                  type="tel"
                  placeholder="9845012345"
                  error={errors.phone_number?.message}
                  {...register('phone_number')}
                />
              </div>

              <div>
                <Input
                  label={t('auth.password')}
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label={t('auth.confirm_password')}
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirm_password?.message}
                  {...register('confirm_password')}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-earth-100">
              <Sprout className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-bold text-earth-900 font-kannada">
                {isKn ? '೨. ಪಾತ್ರ ಆಯ್ಕೆ (User Role)' : '2. Select Your Platform Role'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  role === 'farmer'
                    ? 'border-forest-700 bg-forest-50/80 ring-2 ring-forest-700 shadow-xs'
                    : 'border-earth-200 hover:border-earth-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold text-earth-900 font-kannada">
                    {isKn ? 'ರೈತ (Farmer)' : 'Farmer'}
                  </span>
                  <Wheat className="w-4 h-4 text-forest-700" />
                </div>
                <p className="text-[11px] text-earth-600 leading-snug">
                  {isKn ? 'ಬೆಳೆ ಸಲಹೆ, ಮಂಡಿ ದರ, ಬೆಳೆ ಮಾರಾಟ' : 'Advisory, sell harvest, mandi trends'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  role === 'buyer'
                    ? 'border-forest-700 bg-forest-50/80 ring-2 ring-forest-700 shadow-xs'
                    : 'border-earth-200 hover:border-earth-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold text-earth-900 font-kannada">
                    {isKn ? 'ಖರೀದಿದಾರ (Buyer)' : 'Buyer'}
                  </span>
                  <ShoppingBag className="w-4 h-4 text-forest-700" />
                </div>
                <p className="text-[11px] text-earth-600 leading-snug">
                  {isKn ? 'ರೈತರಿಂದ ನೇರ ಕೃಷಿ ಉತ್ಪನ್ನ ಖರೀದಿ' : 'Procure produce directly from farmers'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('both')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  role === 'both'
                    ? 'border-forest-700 bg-forest-50/80 ring-2 ring-forest-700 shadow-xs'
                    : 'border-earth-200 hover:border-earth-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold text-earth-900 font-kannada">
                    {isKn ? 'ಎರಡೂ (Both)' : 'Both'}
                  </span>
                  <Sprout className="w-4 h-4 text-forest-700" />
                </div>
                <p className="text-[11px] text-earth-600 leading-snug">
                  {isKn ? 'ಉತ್ಪಾದನೆ ಮತ್ತು ಖರೀದಿ ಎರಡೂ ಪಾತ್ರಗಳು' : 'Cultivate crops and procure produce'}
                </p>
              </button>
            </div>
          </div>

          {/* Section 3: Mandya Location Hierarchy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-earth-100">
              <MapPin className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-bold text-earth-900 font-kannada">
                {isKn ? '೩. ಸ್ಥಳ ಆಯ್ಕೆ (ಮಂಡ್ಯ ಜಿಲ್ಲೆ)' : '3. Location in Mandya District'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-earth-800 block mb-1">
                  {isKn ? 'ತಾಲೂಕು (Taluk)' : 'Taluk'}
                </label>
                <select
                  value={selectedTaluk}
                  onChange={(e) => handleTalukChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-earth-300 bg-white text-xs font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                >
                  {availableTaluks.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-earth-800 block mb-1">
                  {isKn ? 'ಹೋಬಳಿ (Hobli)' : 'Hobli'}
                </label>
                <select
                  value={selectedHobli}
                  onChange={(e) => handleHobliChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-earth-300 bg-white text-xs font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                >
                  {availableHoblis.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-earth-800 block mb-1">
                  {isKn ? 'ಗ್ರಾಮ (Village)' : 'Village'}
                </label>
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-earth-300 bg-white text-xs font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                >
                  {availableVillages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Input
                label={isKn ? 'ಇತರ ಗ್ರಾಮ (ಗ್ರಾಮ ಪಟ್ಟಿಯಲ್ಲಿಲ್ಲದಿದ್ದರೆ ಇಲ್ಲಿ ನಮೂದಿಸಿ)' : 'Other Village (if not in list)'}
                type="text"
                placeholder={isKn ? 'ಗ್ರಾಮದ ಹೆಸರು' : 'Village name'}
                value={customVillage}
                onChange={(e) => setCustomVillage(e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: Farmer Specifics */}
          {(role === 'farmer' || role === 'both') && (
            <div className="space-y-4 p-4 rounded-xl bg-forest-50/50 border border-forest-100">
              <div className="flex items-center gap-2 pb-1 border-b border-forest-200">
                <Wheat className="w-4 h-4 text-forest-700" />
                <h2 className="text-sm font-bold text-forest-950 font-kannada">
                  {isKn ? '೪. ಕೃಷಿ ವಿವರಗಳು ಮತ್ತು ಬೆಳೆಗಳು' : '4. Farming Details & Crops'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Input
                    label={isKn ? 'ಒಟ್ಟು ಕೃಷಿ ಭೂಮಿ (ಎಕರೆ)' : 'Landholding (Acres)'}
                    type="number"
                    step="0.5"
                    error={errors.farm_size_acres?.message}
                    {...register('farm_size_acres')}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-earth-800 block mb-1">
                    {isKn ? 'ಕೃಷಿ ಪದ್ಧತಿ' : 'Farming Type'}
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-earth-300 bg-white text-xs font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                    {...register('farming_type')}
                  >
                    <option value="organic">{isKn ? 'ಸಾವಯವ ಕೃಷಿ (Organic)' : 'Organic'}</option>
                    <option value="natural">{isKn ? 'ನೈಸರ್ಗಿಕ ಕೃಷಿ (Natural)' : 'Natural'}</option>
                    <option value="mixed">{isKn ? 'ಮಿಶ್ರ ಕೃಷಿ (Mixed)' : 'Mixed Farming'}</option>
                    <option value="conventional">{isKn ? 'ಸಾಂಪ್ರದಾಯಿಕ ಕೃಷಿ (Conventional)' : 'Conventional'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-earth-800 block mb-1">
                    {isKn ? 'ನೀರಾವರಿ ಸೌಲಭ್ಯ' : 'Irrigation Source'}
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-earth-300 bg-white text-xs font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                    {...register('irrigation_source')}
                  >
                    <option value="canal">{isKn ? 'ಕಾಲುವೆ ನೀರು (Canal)' : 'Canal (Cauvery)'}</option>
                    <option value="borewell">{isKn ? 'ಕೊಳವೆ ಬಾವಿ (Borewell)' : 'Borewell'}</option>
                    <option value="drip">{isKn ? 'ಹನಿ ನೀರಾವರಿ (Drip)' : 'Drip Irrigation'}</option>
                    <option value="rainfed">{isKn ? 'ಮಳೆಯಾಶ್ರಿತ (Rainfed)' : 'Rainfed'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-forest-900 block mb-2 font-kannada">
                  {isKn ? 'ಬೆಳೆಯುವ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಕನಿಷ್ಠ ಒಂದು):' : 'Select Crops You Cultivate:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {cropsList.map((c) => {
                    const isSelected = selectedCrops.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCrop(c.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                            : 'bg-white text-earth-800 border-earth-200 hover:border-earth-300'
                        }`}
                      >
                        <span className="block font-bold">{isKn ? c.name_kn : c.name_en}</span>
                        <span className="text-[10px] opacity-80">{isKn ? c.name_en : c.category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Buyer Specifics */}
          {(role === 'buyer' || role === 'both') && (
            <div className="space-y-4 p-4 rounded-xl bg-earth-50 border border-earth-200">
              <div className="flex items-center gap-2 pb-1 border-b border-earth-200">
                <Building2 className="w-4 h-4 text-forest-700" />
                <h2 className="text-sm font-bold text-earth-900 font-kannada">
                  {isKn ? '೫. ಖರೀದಿದಾರ / ಸಂಸ್ಥೆಯ ವಿವರಗಳು' : '5. Buyer / Enterprise Details'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Input
                    label={isKn ? 'ಸಂಸ್ಥೆ / ವ್ಯಾಪಾರದ ಹೆಸರು' : 'Business / Organization Name'}
                    type="text"
                    placeholder={isKn ? 'ಉದಾ: ಅರ್ಜುನ್ ಟ್ರೇಡರ್ಸ್' : 'e.g. Arjun Traders'}
                    error={errors.buyer_business_name?.message}
                    {...register('buyer_business_name')}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-earth-800 block mb-1">
                    {isKn ? 'ಖರೀದಿದಾರರ ವಿಧ' : 'Buyer Category'}
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-earth-300 bg-white text-xs font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                    {...register('buyer_type')}
                  >
                    <option value="wholesaler">{isKn ? 'ಸಗಟು ವ್ಯಾಪಾರಿ (Wholesaler)' : 'Wholesaler / Mandi Trader'}</option>
                    <option value="retailer">{isKn ? 'ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿ (Retailer)' : 'Retailer'}</option>
                    <option value="processor">{isKn ? 'ಆಹಾರ ಸಂಸ್ಕರಣೆದಾರ (Food Processor)' : 'Processor / Mill'}</option>
                    <option value="exporter">{isKn ? 'ರಫ್ತುದಾರ (Exporter)' : 'Exporter'}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label={isKn ? 'APMC / ವ್ಯಾಪಾರ ಪರವಾನಗಿ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)' : 'APMC / Trade License (Optional)'}
                    type="text"
                    placeholder="APMC-MND-2026-X"
                    {...register('buyer_license_no')}
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-bold bg-forest-700 hover:bg-forest-800 text-white"
            isLoading={isSubmitting}
            size="lg"
          >
            <span>{isKn ? 'ಖಾತೆ ರಚಿಸಿ & ಪ್ರಾರಂಭಿಸಿ' : 'Complete Registration & Start'}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Existing User Link */}
        <div className="pt-4 border-t border-earth-100 text-center text-xs sm:text-sm text-earth-600">
          <span>{t('auth.already_have_account')} </span>
          <Link
            to="/login"
            className="font-bold text-forest-700 hover:text-forest-900 hover:underline"
          >
            {t('auth.sign_in')}
          </Link>
        </div>
      </Card>
    </div>
  );
}
