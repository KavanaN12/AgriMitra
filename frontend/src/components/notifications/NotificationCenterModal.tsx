import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  ShoppingBag,
  Users,
  Info,
  Sliders,
  X,
  ExternalLink,
  CheckCircle,
  Filter
} from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences
} from '../../hooks/useAgriQuery';
import { Notification } from '../../types/api';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenterModal({ isOpen, onClose }: NotificationCenterModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language.startsWith('kn');

  const [activeTab, setActiveTab] = useState<'all' | 'advisory' | 'market' | 'community' | 'system' | 'preferences'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifications = [], isLoading } = useNotifications({
    type: activeTab === 'preferences' ? undefined : activeTab,
    unread_only: unreadOnly
  });

  const { data: preferences } = useNotificationPreferences();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const updatePrefMutation = useUpdateNotificationPreferences();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleDeepLink = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    onClose();

    const type = notification.related_entity_type || notification.type;
    const id = notification.related_entity_id;

    if (type === 'advisory') {
      navigate('/advisory');
    } else if (type === 'listing' || (type === 'market' && id)) {
      navigate(`/market?listingId=${id}`);
    } else if (type === 'enquiry') {
      navigate(`/market?tab=enquiries&enquiryId=${id}`);
    } else if (type === 'post' || type === 'community') {
      navigate(id ? `/community?postId=${id}` : '/community');
    } else if (type === 'group') {
      navigate(id ? `/community?groupId=${id}` : '/community');
    } else {
      navigate('/');
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'advisory':
        return <AlertTriangle className="w-4 h-4 text-emerald-600" />;
      case 'market':
        return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'community':
        return <Users className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-purple-600" />;
    }
  };

  const getCategoryBg = (type: string) => {
    switch (type) {
      case 'advisory':
        return 'bg-emerald-50 border-emerald-200';
      case 'market':
        return 'bg-amber-50 border-amber-200';
      case 'community':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-earth-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-center-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-earth-100 flex items-center justify-between bg-earth-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-agri-100 text-agri-800 rounded-2xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="notification-center-title" className="text-base sm:text-lg font-bold text-earth-900">
                {t('notifications.title')}
              </h2>
              <p className="text-xs text-earth-500">
                {unreadCount > 0
                  ? isKn
                    ? `${unreadCount} ಓದದಿರುವ ಸೂಚನೆಗಳು`
                    : `${unreadCount} unread notifications`
                  : isKn
                  ? 'ಎಲ್ಲಾ ಸೂಚನೆಗಳು ಪರಿಶೀಲಿಸಲಾಗಿದೆ'
                  : 'All notifications caught up'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-earth-400 hover:text-earth-700 hover:bg-earth-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-earth-100 gap-1 overflow-x-auto text-xs font-semibold">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-agri-700 text-white shadow-xs'
                  : 'text-earth-600 hover:bg-earth-100'
              }`}
            >
              {t('notifications.tab_all')}
            </button>
            <button
              onClick={() => setActiveTab('advisory')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'advisory'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-earth-600 hover:bg-earth-100'
              }`}
            >
              {t('notifications.tab_advisory')}
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'market'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-earth-600 hover:bg-earth-100'
              }`}
            >
              {t('notifications.tab_market')}
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'community'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-earth-600 hover:bg-earth-100'
              }`}
            >
              {t('notifications.tab_community')}
            </button>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'preferences' ? 'all' : 'preferences')}
            className={`p-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeTab === 'preferences'
                ? 'bg-earth-800 text-white'
                : 'text-earth-600 hover:bg-earth-100'
            }`}
            title="Notification Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-bar for mark all read and unread filter (when not in preferences) */}
        {activeTab !== 'preferences' && (
          <div className="px-4 py-2 bg-earth-50/40 border-b border-earth-100 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-earth-700 select-none">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={e => setUnreadOnly(e.target.checked)}
                className="rounded border-earth-300 text-agri-600 focus:ring-agri-500"
              />
              <span className="font-medium">{t('notifications.unread_only')}</span>
            </label>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-1.5 text-agri-700 hover:text-agri-800 font-semibold transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t('notifications.mark_all_read')}</span>
              </button>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'preferences' ? (
            /* Preferences Panel */
            <div className="space-y-4 py-2">
              <h3 className="font-bold text-sm text-earth-900 border-b border-earth-100 pb-2">
                {t('notifications.preferences_title')}
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-earth-50 border border-earth-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-earth-900">{t('notifications.pref_advisory')}</p>
                      <p className="text-xs text-earth-500">{isKn ? 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ & ಕೀಟಬಾಧೆ ಸಲಹೆಗಳು' : 'Weather forecasts and pest attack advisories'}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.advisory_alerts ?? true}
                    onChange={e => updatePrefMutation.mutate({ advisory_alerts: e.target.checked })}
                    className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-earth-50 border border-earth-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-earth-900">{t('notifications.pref_market')}</p>
                      <p className="text-xs text-earth-500">{isKn ? 'ಖರೀದಿದಾರರಿಂದ ಬೆಳೆ ವಿಚಾರಣೆಗಳು' : 'Buyer enquiries for farm listings'}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.market_enquiries ?? true}
                    onChange={e => updatePrefMutation.mutate({ market_enquiries: e.target.checked })}
                    className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-earth-50 border border-earth-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-earth-900">{t('notifications.pref_community')}</p>
                      <p className="text-xs text-earth-500">{isKn ? 'ಸಮುದಾಯ ಚರ್ಚೆಗಳ ಪ್ರತಿಕ್ರಿಯೆಗಳು' : 'Post replies and village group updates'}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.community_updates ?? true}
                    onChange={e => updatePrefMutation.mutate({ community_updates: e.target.checked })}
                    className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-earth-50 border border-earth-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-earth-900">{t('notifications.pref_system')}</p>
                      <p className="text-xs text-earth-500">{isKn ? 'ವೇದಿಕೆ ಹಾಗೂ ಕೃಷಿ ಇಲಾಖೆ ಪ್ರಕಟಣೆಗಳು' : 'Government & AgriMitra platform announcements'}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences?.system_announcements ?? true}
                    onChange={e => updatePrefMutation.mutate({ system_announcements: e.target.checked })}
                    className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500"
                  />
                </label>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-agri-50 text-agri-700 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-earth-900">{t('notifications.empty_inbox')}</h3>
              <p className="text-xs text-earth-500 max-w-sm mx-auto">{t('notifications.empty_inbox_sub')}</p>
            </div>
          ) : (
            /* Notification List */
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                  n.is_read
                    ? 'bg-white border-earth-200/80 opacity-85'
                    : 'bg-agri-50/40 border-agri-300 shadow-xs ring-1 ring-agri-200/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl border ${getCategoryBg(n.type)}`}>
                      {getCategoryIcon(n.type)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-earth-900 leading-snug">
                        {isKn ? n.title_kn : n.title_en}
                      </h4>
                      <p className="text-xs text-earth-600 mt-0.5 leading-relaxed">
                        {isKn ? n.message_kn : n.message_en}
                      </p>
                    </div>
                  </div>

                  {!n.is_read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-agri-600 shrink-0 mt-1" title="Unread" />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-earth-100/80 text-[11px] text-earth-500">
                  <span>{new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>

                  <div className="flex items-center gap-2">
                    {!n.is_read && (
                      <button
                        onClick={() => markReadMutation.mutate(n.id)}
                        className="text-earth-600 hover:text-earth-900 font-medium"
                      >
                        {isKn ? 'ಓದಿದಂತೆ ಗುರುತಿಸಿ' : 'Mark Read'}
                      </button>
                    )}
                    {(n.related_entity_type || n.type) && (
                      <button
                        onClick={() => handleDeepLink(n)}
                        className="flex items-center gap-1 font-bold text-agri-700 hover:text-agri-800"
                      >
                        <span>{t('notifications.view_related')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
