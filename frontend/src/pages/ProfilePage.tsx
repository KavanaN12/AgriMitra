import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Sprout,
  PlusCircle,
  Globe,
  CheckCircle2,
  Cpu,
  Wifi,
  LogOut,
  Sliders,
  Shield,
  HelpCircle,
  FileText,
  LifeBuoy,
  Save,
  Check,
  Building2,
  Trash2,
  BadgeCheck,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { LoadingState } from '../components/common/LoadingState';
import {
  useCurrentUser,
  useUpdateProfile,
  useMyCrops,
  useCrops,
  useEnrollCrop,
  useDeleteUserCrop,
  useHealth,
  useNetworkStatus
} from '../hooks/useAgriQuery';
import { useAuth } from '../context/AuthContext';
import { HelpCenterModal } from '../components/help/HelpCenterModal';
import { SupportTicketModal } from '../components/help/SupportTicketModal';
import { AboutModal } from '../components/help/AboutModal';
import { PrivacyPolicyModal } from '../components/help/PrivacyPolicyModal';

export function ProfilePage({ defaultTab }: { defaultTab?: 'personal' | 'farming' | 'crops' | 'display' | 'help' } = {}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'personal' | 'farming' | 'crops' | 'display' | 'help') || defaultTab || 'personal';
  const isKn = i18n.language.startsWith('kn');

  const { user: authUser, activeRole, switchRole, logout, refreshUser } = useAuth();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: myCrops = [], isLoading: myCropsLoading } = useMyCrops();
  const { data: crops = [] } = useCrops();
  const { data: health } = useHealth();
  const { isOnline } = useNetworkStatus();

  const updateProfileMutation = useUpdateProfile();
  const enrollCropMutation = useEnrollCrop();
  const deleteCropMutation = useDeleteUserCrop();

  const [activeTab, setActiveTab] = useState<'personal' | 'farming' | 'crops' | 'display' | 'help'>(initialTab);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [textSize, setTextSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [dataSaver, setDataSaver] = useState(false);
  const [avatar, setAvatar] = useState('🌾');

  // Farm details
  const [farmSize, setFarmSize] = useState<number | ''>('');
  const [farmingType, setFarmingType] = useState('');
  const [irrigationSource, setIrrigationSource] = useState('');

  // Buyer details
  const [buyerBusiness, setBuyerBusiness] = useState('');
  const [buyerType, setBuyerType] = useState('');
  const [buyerLicense, setBuyerLicense] = useState('');

  // Crop enrollment modal
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState(1);
  const [acreage, setAcreage] = useState(1.5);
  const [stage, setStage] = useState('vegetative');

  // Toast / Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    const activeProfile = user || authUser;
    if (activeProfile) {
      setFullName(activeProfile.full_name || '');
      setEmail(activeProfile.email || '');
      setBio(activeProfile.bio || '');
      setPhoneVisible(activeProfile.phone_visible ?? true);
      setTextSize(activeProfile.text_size || 'normal');
      setDataSaver(activeProfile.data_saver ?? false);
      setFarmSize(activeProfile.farm_size_acres ?? '');
      setFarmingType(activeProfile.farming_type || '');
      setIrrigationSource(activeProfile.irrigation_source || '');
      setBuyerBusiness(activeProfile.buyer_business_name || '');
      setBuyerType(activeProfile.buyer_type || '');
      setBuyerLicense(activeProfile.buyer_license_no || '');

      // Apply initial text size to html
      if (activeProfile.text_size === 'large') {
        document.documentElement.classList.add('text-size-large');
        document.documentElement.classList.remove('text-size-small');
      } else if (activeProfile.text_size === 'small') {
        document.documentElement.classList.add('text-size-small');
        document.documentElement.classList.remove('text-size-large');
      } else {
        document.documentElement.classList.remove('text-size-large', 'text-size-small');
      }

      if (activeProfile.data_saver) {
        document.body.classList.add('data-saver-mode');
      } else {
        document.body.classList.remove('data-saver-mode');
      }
    }
  }, [user, authUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName,
        email: email,
        bio: bio,
        phone_visible: phoneVisible,
        text_size: textSize,
        data_saver: dataSaver,
        farm_size_acres: farmSize ? Number(farmSize) : undefined,
        farming_type: farmingType,
        irrigation_source: irrigationSource,
        buyer_business_name: buyerBusiness,
        buyer_type: buyerType,
        buyer_license_no: buyerLicense
      });
      await refreshUser();

      // Update text size on document root
      if (textSize === 'large') {
        document.documentElement.classList.add('text-size-large');
        document.documentElement.classList.remove('text-size-small');
      } else if (textSize === 'small') {
        document.documentElement.classList.add('text-size-small');
        document.documentElement.classList.remove('text-size-large');
      } else {
        document.documentElement.classList.remove('text-size-large', 'text-size-small');
      }

      if (dataSaver) {
        document.body.classList.add('data-saver-mode');
      } else {
        document.body.classList.remove('data-saver-mode');
      }

      setToastMessage(t('settings.settings_saved'));
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handleEnrollCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enrollCropMutation.mutateAsync({
        crop_id: Number(selectedCropId),
        acreage: Number(acreage),
        stage: stage
      });
      setIsAddCropOpen(false);
      setToastMessage(isKn ? 'ಹೊಸ ಬೆಳೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರ್ಪಡೆಗೊಂಡಿದೆ!' : 'New crop enrolled successfully!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const changeLanguage = (lang: 'kn' | 'en') => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    updateProfileMutation.mutate({ preferred_language: lang });
  };

  const handleRoleToggle = (newRole: 'farmer' | 'buyer') => {
    switchRole(newRole);
    setToastMessage(
      isKn
        ? `ಸ್ಥಿತಿ ಬದಲಾಗಿದೆ: ${newRole === 'farmer' ? 'ರೈತ ಮೋಡ್' : 'ಖರೀದಿದಾರ ಮೋಡ್'}`
        : `Switched to ${newRole === 'farmer' ? 'Farmer Mode' : 'Buyer Mode'}`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const avatars = ['🌾', '🚜', '🌱', '🥥', '🌽', '🍅', '🐄', '🏪'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-agri-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg animate-fadeIn fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-50">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-agri-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Summary Card */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-white to-earth-50/60 border-earth-200 shadow-xs">
        {userLoading && !authUser ? (
          <LoadingState rows={2} />
        ) : (
          (() => {
            const displayUser = user || authUser;
            return (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-agri-600 to-agri-800 text-white flex items-center justify-center font-bold text-3xl shadow-sm select-none">
                    {avatar}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-earth-900">
                        {displayUser?.full_name || ''}
                      </h1>
                      {displayUser?.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                          {t('admin.verified_badge')}
                        </span>
                      )}
                      {displayUser?.is_expert && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                          {t('admin.expert_badge')}
                        </span>
                      )}
                      {displayUser?.is_admin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-earth-900 text-white">
                          Admin
                        </span>
                      )}
                    </div>

                    {(displayUser?.location?.village || displayUser?.location?.taluk) && (
                      <p className="text-xs sm:text-sm text-earth-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-agri-700 shrink-0" />
                        <span>
                          {displayUser.location.village ? `${displayUser.location.village}, ` : ''}{displayUser.location.taluk || 'Mandya'} ({isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲೆ' : 'Mandya'})
                        </span>
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-earth-500 pt-0.5">
                      {displayUser?.phone_number && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-earth-400" />
                          +91 {displayUser.phone_number}
                        </span>
                      )}
                      {displayUser?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-earth-400" />
                          {displayUser.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions / Role Toggle in Card */}
                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                  {displayUser?.roles === 'both' && (
                    <div className="flex items-center bg-earth-100 p-1 rounded-2xl border border-earth-200 text-xs">
                      <button
                        type="button"
                        onClick={() => handleRoleToggle('farmer')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          activeRole === 'farmer'
                            ? 'bg-agri-700 text-white shadow-xs'
                            : 'text-earth-600 hover:text-earth-900'
                        }`}
                      >
                        🌾 {isKn ? 'ರೈತ ಮೋಡ್' : 'Farmer Mode'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleToggle('buyer')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          activeRole === 'buyer'
                            ? 'bg-harvest-600 text-white shadow-xs'
                            : 'text-earth-600 hover:text-earth-900'
                        }`}
                      >
                        🛒 {isKn ? 'ಖರೀದಿದಾರ ಮೋಡ್' : 'Buyer Mode'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-earth-200 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'personal'
              ? 'bg-agri-700 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{t('settings.tab_personal')}</span>
        </button>

        <button
          onClick={() => setActiveTab('farming')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'farming'
              ? 'bg-agri-700 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{user?.role === 'buyer' ? t('settings.tab_buyer') : t('settings.tab_farming')}</span>
        </button>

        <button
          onClick={() => setActiveTab('crops')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'crops'
              ? 'bg-agri-700 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>{isKn ? 'ಬೆಳೆಗಳು & ಸ್ಥಳ' : 'Crops & Location'}</span>
        </button>

        <button
          onClick={() => setActiveTab('display')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'display'
              ? 'bg-agri-700 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('settings.tab_preferences')}</span>
        </button>

        <button
          onClick={() => setActiveTab('help')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'help'
              ? 'bg-agri-700 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{t('help.help_center')}</span>
        </button>
      </div>

      {/* Tab 1: Personal Profile */}
      {activeTab === 'personal' && (
        <Card className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <h3 className="text-base font-bold text-earth-900 border-b border-earth-100 pb-2">
              {t('settings.tab_personal')}
            </h3>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-earth-700 mb-2">
                {t('settings.avatar_title')}
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {avatars.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setAvatar(icon)}
                    className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center transition-all ${
                      avatar === icon
                        ? 'bg-agri-100 border-2 border-agri-700 shadow-xs scale-105'
                        : 'bg-earth-100 border border-earth-200 hover:bg-earth-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-earth-700 mb-1">
                  {t('settings.full_name')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 mb-1">
                  {t('settings.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-earth-700 mb-1">
                {t('settings.bio')}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder={t('settings.bio_placeholder')}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>

            {/* Phone Visibility Option */}
            <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-earth-900 block">
                  {t('settings.phone_visible')}
                </span>
                <span className="text-xs text-earth-500 block leading-relaxed">
                  {t('settings.phone_visible_desc')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={phoneVisible}
                onChange={e => setPhoneVisible(e.target.checked)}
                className="w-5 h-5 rounded text-agri-600 focus:ring-agri-500 shrink-0 mt-0.5 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={updateProfileMutation.isPending}>
                <Save className="w-4 h-4 mr-1.5" />
                {t('settings.save_changes')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Farming / Buyer Profile Details */}
      {activeTab === 'farming' && (
        <Card className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <h3 className="text-base font-bold text-earth-900 border-b border-earth-100 pb-2">
              {user?.role === 'buyer' ? t('settings.tab_buyer') : t('settings.tab_farming')}
            </h3>

            {/* Farmer fields */}
            {(user?.role === 'farmer' || user?.role === 'both' || !user?.role) && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      {isKn ? 'ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)' : 'Land Holding (Acres)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farmSize}
                      onChange={e => setFarmSize(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      {isKn ? 'ಕೃಷಿ ವಿಧಾನ' : 'Farming Practice'}
                    </label>
                    <select
                      value={farmingType}
                      onChange={e => setFarmingType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                    >
                      <option value="Mixed / Integrated">Mixed / Integrated Farming</option>
                      <option value="Certified Organic">Certified Organic</option>
                      <option value="Natural / ZBNF">Zero Budget Natural Farming (ZBNF)</option>
                      <option value="Conventional">Conventional / Chemical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      {isKn ? 'ನೀರಾವರಿ ಮೂಲ' : 'Irrigation Source'}
                    </label>
                    <select
                      value={irrigationSource}
                      onChange={e => setIrrigationSource(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                    >
                      <option value="Canal (Cauvery)">Canal (Cauvery / Visvesvaraya)</option>
                      <option value="Borewell">Borewell</option>
                      <option value="Drip / Micro">Drip / Micro-irrigation</option>
                      <option value="Rainfed">Rainfed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer fields */}
            {(user?.role === 'buyer' || user?.role === 'both') && (
              <div className="space-y-4 pt-2 border-t border-earth-100">
                <h4 className="text-xs font-bold text-earth-800 uppercase tracking-wider">
                  {isKn ? 'ವ್ಯಾಪಾರ / ಖರೀದಿದಾರರ ಮಾಹಿತಿ' : 'Trading & Enterprise Details'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      {isKn ? 'ಸಂಸ್ಥೆ ಹೆಸರು' : 'Business Name'}
                    </label>
                    <input
                      type="text"
                      value={buyerBusiness}
                      onChange={e => setBuyerBusiness(e.target.value)}
                      placeholder="e.g. Mandya Agro Enterprises"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      {isKn ? 'ಖರೀದಿದಾರ ವರ್ಗ' : 'Buyer Category'}
                    </label>
                    <select
                      value={buyerType}
                      onChange={e => setBuyerType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                    >
                      <option value="Wholesaler / Mandi Trader">Wholesaler / Mandi Trader</option>
                      <option value="Retailer / Supermarket">Retailer / Supermarket</option>
                      <option value="Food Processor / Mill">Food Processor / Mill</option>
                      <option value="FPO / Cooperative">FPO / Cooperative Society</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      {isKn ? 'APMC ಲೈಸೆನ್ಸ್ / GSTIN (ಐಚ್ಛಿಕ)' : 'APMC License / GSTIN (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={buyerLicense}
                      onChange={e => setBuyerLicense(e.target.value)}
                      placeholder="e.g. 29AAAAA0000A1Z5 or APMC-MD-442"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={updateProfileMutation.isPending}>
                <Save className="w-4 h-4 mr-1.5" />
                {t('settings.save_changes')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 3: Enrolled Crops & Location */}
      {activeTab === 'crops' && (
        <div className="space-y-5">
          {/* Registered Location Card */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-earth-900 flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-agri-700" />
              <span>{t('settings.location_title')}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-earth-50 border border-earth-200">
                <span className="text-earth-400 block text-[10px] uppercase font-bold">{t('onboarding.location_state')}</span>
                <span className="font-bold text-earth-900">Karnataka</span>
              </div>
              <div className="p-3 rounded-xl bg-earth-50 border border-earth-200">
                <span className="text-earth-400 block text-[10px] uppercase font-bold">{t('onboarding.location_district')}</span>
                <span className="font-bold text-earth-900">Mandya (ಮಂಡ್ಯ)</span>
              </div>
              <div className="p-3 rounded-xl bg-earth-50 border border-earth-200">
                <span className="text-earth-400 block text-[10px] uppercase font-bold">{t('onboarding.location_taluk')}</span>
                <span className="font-bold text-earth-900">{user?.location?.taluk || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-earth-50 border border-earth-200">
                <span className="text-earth-400 block text-[10px] uppercase font-bold">{t('onboarding.location_village')}</span>
                <span className="font-bold text-earth-900">{user?.location?.village || '—'}</span>
              </div>
            </div>
          </Card>

          {/* Enrolled Crops */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-earth-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-agri-700" />
                  <span>{t('profile.my_crops')}</span>
                </h3>
                <p className="text-xs text-earth-500">
                  {isKn ? 'ವೈಜ್ಞಾನಿಕ ಸಲಹೆಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆಗಾಗಿ ನೊಂದಾಯಿಸಿದ ಬೆಳೆಗಳು' : 'Registered crops for hyper-local advisory and market listings'}
                </p>
              </div>

              <Button
                onClick={() => setIsAddCropOpen(true)}
                size="sm"
                variant="secondary"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                {isKn ? 'ಬೆಳೆ ಸೇರಿಸಿ' : 'Add Crop'}
              </Button>
            </div>

            {myCropsLoading ? (
              <LoadingState rows={2} />
            ) : myCrops.length === 0 ? (
              <p className="text-xs text-earth-500 py-6 text-center">
                {isKn ? 'ಯಾವುದೇ ಬೆಳೆ ನಮೂದಿಸಿಲ್ಲ.' : 'No crops registered yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {myCrops.map(uc => (
                  <div
                    key={uc.id}
                    className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-earth-900">
                        {uc.crop ? (isKn ? uc.crop.name_kn : uc.crop.name_en) : 'Crop'}
                      </h4>
                      <p className="text-xs text-earth-600">
                        {t('profile.growth_stage')}: <span className="font-semibold capitalize text-agri-900">{uc.stage}</span>
                      </p>
                      <p className="text-[11px] text-earth-500">
                        {uc.acreage} {t('profile.acreage')}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteCropMutation.mutate(uc.id)}
                      className="p-2 text-earth-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remove Crop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 4: Display & Accessibility Preferences */}
      {activeTab === 'display' && (
        <Card className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <h3 className="text-base font-bold text-earth-900 border-b border-earth-100 pb-2">
              {t('settings.tab_preferences')}
            </h3>

            {/* Text Size Accessibility */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-earth-800">
                {t('settings.text_size')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTextSize('small')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    textSize === 'small'
                      ? 'bg-agri-50 border-agri-600 text-agri-950 font-bold ring-2 ring-agri-600/20'
                      : 'bg-earth-50 border-earth-200 text-earth-700 hover:bg-earth-100'
                  }`}
                >
                  <span className="text-xs block font-bold">Aa</span>
                  <span className="text-[11px] mt-1 block">{t('settings.text_size_small')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTextSize('normal')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    textSize === 'normal'
                      ? 'bg-agri-50 border-agri-600 text-agri-950 font-bold ring-2 ring-agri-600/20'
                      : 'bg-earth-50 border-earth-200 text-earth-700 hover:bg-earth-100'
                  }`}
                >
                  <span className="text-sm block font-bold">Aa</span>
                  <span className="text-[11px] mt-1 block">{t('settings.text_size_normal')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTextSize('large')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    textSize === 'large'
                      ? 'bg-agri-50 border-agri-600 text-agri-950 font-bold ring-2 ring-agri-600/20'
                      : 'bg-earth-50 border-earth-200 text-earth-700 hover:bg-earth-100'
                  }`}
                >
                  <span className="text-base block font-bold">Aa</span>
                  <span className="text-[11px] mt-1 block">{t('settings.text_size_large')}</span>
                </button>
              </div>
            </div>

            {/* Data Saver Mode Toggle */}
            <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-earth-900 block flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-agri-700" />
                  {t('settings.data_saver')}
                </span>
                <span className="text-xs text-earth-500 block leading-relaxed">
                  {t('settings.data_saver_desc')}
                </span>
              </div>
              <input
                type="checkbox"
                checked={dataSaver}
                onChange={e => setDataSaver(e.target.checked)}
                className="w-5 h-5 rounded text-agri-600 focus:ring-agri-500 shrink-0 mt-0.5 cursor-pointer"
              />
            </div>

            {/* Language Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-earth-800">
                {t('settings.language_pref')}
              </label>
              <div className="inline-flex rounded-xl bg-earth-100 p-1 border border-earth-200">
                <button
                  type="button"
                  onClick={() => changeLanguage('kn')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    isKn ? 'bg-agri-700 text-white shadow-xs' : 'text-earth-700 hover:text-earth-900'
                  }`}
                >
                  ಕನ್ನಡ (Kannada)
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isKn ? 'bg-agri-700 text-white shadow-xs' : 'text-earth-700 hover:text-earth-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={updateProfileMutation.isPending}>
                <Save className="w-4 h-4 mr-1.5" />
                {t('settings.save_changes')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 5: Help & Information Center */}
      {activeTab === 'help' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-earth-900 border-b border-earth-100 pb-2">
            {t('help.help_center')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-4 rounded-2xl bg-earth-50 border border-earth-200 hover:bg-earth-100 text-left transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-agri-100 text-agri-800">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-earth-900">{t('help.faq_title')}</h4>
                  <p className="text-[11px] text-earth-500">{isKn ? 'ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ & ಕೃಷಿ ಸಹಾಯವಾಣಿ' : 'Crop advisories, mandi rates & helplines'}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsSupportOpen(true)}
              className="p-4 rounded-2xl bg-earth-50 border border-earth-200 hover:bg-earth-100 text-left transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-agri-100 text-agri-800">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-earth-900">{t('help.contact_support')}</h4>
                  <p className="text-[11px] text-earth-500">{isKn ? 'ಮನವಿ ಸಲ್ಲಿಸಿ & ಸ್ಥಿತಿ ವೀಕ್ಷಿಸಿ' : 'Submit ticket & track status'}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsAboutOpen(true)}
              className="p-4 rounded-2xl bg-earth-50 border border-earth-200 hover:bg-earth-100 text-left transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-agri-100 text-agri-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-earth-900">{t('help.about_title')}</h4>
                  <p className="text-[11px] text-earth-500">{isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆ' : 'Mandya district pilot mission'}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="p-4 rounded-2xl bg-earth-50 border border-earth-200 hover:bg-earth-100 text-left transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-agri-100 text-agri-800">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-earth-900">{t('help.privacy_title')}</h4>
                  <p className="text-[11px] text-earth-500">{isKn ? 'ಡೇಟಾ ಸಮ್ಮತಿ & ರಕ್ಷಣೆ' : 'Farmer data consent & privacy pledge'}</p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      )}

      {/* System Diagnostics & Platform Info */}
      <Card className="p-5 space-y-3">
        <h3 className="text-xs font-bold text-earth-800 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-agri-700" />
          <span>{isKn ? 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಮತ್ತು ನೆಟ್‌ವರ್ಕ್ ಸ್ಥಿತಿ' : 'Platform & Diagnostics'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-earth-700">
          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200">
            <span className="text-earth-400 block text-[10px] uppercase font-bold">API Mode</span>
            <p className="font-semibold text-earth-900 mt-0.5">
              {health?.environment === 'demo-msw' ? 'MSW Mock Worker' : 'FastAPI Connected'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200">
            <span className="text-earth-400 block text-[10px] uppercase font-bold">Connectivity</span>
            <p className="font-semibold text-earth-900 mt-0.5 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-agri-700" />
              <span>{isOnline ? 'Online (Connected)' : 'Offline (Cached)'}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200">
            <span className="text-earth-400 block text-[10px] uppercase font-bold">Region Pilot</span>
            <p className="font-semibold text-earth-900 mt-0.5">
              Mandya (KA-11)
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/welcome');
            }}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </Card>

      {/* Add Crop Modal */}
      <Dialog
        isOpen={isAddCropOpen}
        onClose={() => setIsAddCropOpen(false)}
        title={isKn ? 'ಹೊಸ ಬೆಳೆ ನೋಂದಣಿ' : 'Enroll Crop in Farm'}
        description={isKn ? 'ಸಕಾಲಿಕ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಲು ಬೆಳೆ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ' : 'Register crop to receive tailored Mandya advisories'}
      >
        <form onSubmit={handleEnrollCrop} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-earth-700 block">
              {isKn ? 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ' : 'Select Crop'}
            </label>
            <select
              value={selectedCropId}
              onChange={e => setSelectedCropId(Number(e.target.value))}
              className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-white px-3 py-2 text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-agri-600"
            >
              {crops.map(c => (
                <option key={c.id} value={c.id}>
                  {isKn ? c.name_kn : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            step="0.1"
            label={isKn ? 'ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆಗಳಲ್ಲಿ)' : 'Acreage (in acres)'}
            value={acreage}
            onChange={e => setAcreage(Number(e.target.value))}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-earth-700 block">
              {t('profile.growth_stage')}
            </label>
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="w-full min-h-[46px] rounded-xl border border-earth-300 bg-white px-3 py-2 text-sm text-earth-800 focus:outline-none focus:ring-2 focus:ring-agri-600"
            >
              <option value="sowing">{isKn ? 'ಬಿತ್ತನೆ / ನಾಟಿ (Sowing)' : 'Sowing / Planting'}</option>
              <option value="vegetative">{isKn ? 'ಬೆಳವಣಿಗೆ ಹಂತ (Vegetative)' : 'Vegetative growth'}</option>
              <option value="flowering">{isKn ? 'ಹೂವಾಡುವ ಹಂತ (Flowering)' : 'Flowering'}</option>
              <option value="maturity">{isKn ? 'ಕಟಾವಿಗೆ ಸಿದ್ಧ (Maturity)' : 'Maturity / Ready to harvest'}</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddCropOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={enrollCropMutation.isPending}
            >
              {t('common.submit')}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Auxiliary Help Modals */}
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenSupportTicket={() => setIsSupportOpen(true)}
      />
      <SupportTicketModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
