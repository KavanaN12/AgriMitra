import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  AlertTriangle,
  Users,
  ShoppingBag,
  User,
  Sprout,
  Bell,
  MapPin,
  CheckCircle2,
  X,
  LogOut,
  LogIn,
  Repeat,
  ShieldAlert
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { DataSourceBanner } from '../common/DataSourceBanner';
import { OfflineBanner } from '../common/OfflineBanner';
import { useNotifications } from '../../hooks/useAgriQuery';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenterModal } from '../notifications/NotificationCenterModal';

export function AppShell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language.startsWith('kn');
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, activeRole, isAuthenticated, switchRole, logout } = useAuth();

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleRoleToggle = (newRole: 'farmer' | 'buyer') => {
    switchRole(newRole);
    if (newRole === 'buyer') {
      navigate('/market');
    } else {
      navigate('/');
    }
  };

  const navItems = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/advisory', label: t('nav.advisory'), icon: AlertTriangle },
    { to: '/community', label: t('nav.community'), icon: Users },
    { to: '/market', label: t('nav.market'), icon: ShoppingBag },
    { to: '/profile', label: t('nav.profile'), icon: User }
  ];

  if (user?.is_admin || user?.role === 'admin') {
    navItems.push({ to: '/admin', label: t('nav.admin'), icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen flex flex-col bg-earth-50 text-earth-900 pb-20 lg:pb-0">
      <OfflineBanner />
      <DataSourceBanner />

      {/* Top Application Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-earth-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Pilot Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <NavLink
              to="/"
              data-testid="brand-logo"
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 group select-none py-1"
            >
              {/* Agricultural Sprout Icon Container */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-xs group-hover:bg-forest-800 transition-colors shrink-0 aspect-square">
                <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />
              </div>

              {/* Brand Text Block */}
              <div className="flex flex-col justify-center shrink-0 min-w-max">
                <div className="flex items-center gap-1.5 sm:gap-2 leading-snug">
                  <span className="font-extrabold text-lg sm:text-xl text-forest-950 tracking-normal whitespace-nowrap">
                    AgriMitra
                  </span>
                  <span className="text-forest-700/50 font-light text-sm sm:text-base select-none">|</span>
                  <span className="font-bold text-base sm:text-lg text-forest-800 tracking-normal whitespace-nowrap font-kannada">
                    ಕೃಷಿಮಿತ್ರ
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-earth-600 font-medium whitespace-nowrap leading-relaxed font-kannada block">
                  {isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆ' : 'Mandya District Pilot Project'}
                </span>
              </div>
            </NavLink>

            {/* Mandya Location Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-xs font-semibold text-forest-900 ml-2 shrink-0 select-none">
              <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span>{isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲೆ' : 'Mandya Pilot'}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs xl:text-sm font-medium font-kannada leading-normal whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-forest-100 text-forest-900 font-bold shadow-xs'
                        : 'text-earth-700 hover:text-earth-950 hover:bg-earth-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Header Actions: Dual-Role Switcher, Language Switcher, Notifications, & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Dual Role Switcher Pill (Shown if user has both roles) */}
            {user?.roles === 'both' && (
              <div className="flex items-center bg-earth-100 p-0.5 rounded-xl border border-earth-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleRoleToggle('farmer')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeRole === 'farmer'
                      ? 'bg-agri-700 text-white shadow-xs'
                      : 'text-earth-600 hover:text-earth-900'
                  }`}
                  title="Switch to Farmer Mode"
                >
                  🌾 {isKn ? 'ರೈತ' : 'Farmer'}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleToggle('buyer')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeRole === 'buyer'
                      ? 'bg-harvest-600 text-white shadow-xs'
                      : 'text-earth-600 hover:text-earth-900'
                  }`}
                  title="Switch to Buyer Mode"
                >
                  🛒 {isKn ? 'ಖರೀದಿದಾರ' : 'Buyer'}
                </button>
              </div>
            )}

            <LanguageSwitcher />

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-xl text-earth-700 hover:text-earth-950 hover:bg-earth-100 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-agri-600 text-white text-[10px] font-black shadow-xs ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile / Auth State in Header */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <NavLink
                  to="/profile"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-earth-100 hover:bg-earth-200 transition-colors text-xs font-semibold text-earth-800"
                >
                  <div className="w-6 h-6 rounded-full bg-forest-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate font-medium">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 rounded-xl text-earth-500 hover:text-earth-800 hover:bg-earth-100 transition-colors"
                  title={t('nav.logout')}
                  aria-label={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav.login')}</span>
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer on Large Screens */}
      <footer className="hidden md:block bg-white border-t border-earth-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-earth-500">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-agri-700" />
            <span className="font-medium text-earth-700">
              AgriMitra Platform • Mandya District Pilot (Karnataka)
            </span>
          </div>
          <div>
            <span>Smart Crop Advisory • Farmer Community • Direct Marketplace</span>
          </div>
        </div>
      </footer>

      {/* Mobile-First Bottom Navigation Bar (Smartphones & Tablets) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-earth-200 shadow-lifted"
        aria-label="Mobile Navigation"
      >
        <div
          className="grid h-16 max-w-md mx-auto"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        >
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 transition-colors select-none py-1 ${
                    isActive
                      ? 'text-forest-700 font-bold'
                      : 'text-earth-600 hover:text-earth-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1 rounded-xl transition-all ${
                        isActive ? 'bg-forest-100 text-forest-800' : ''
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] leading-tight font-medium font-kannada whitespace-nowrap">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
