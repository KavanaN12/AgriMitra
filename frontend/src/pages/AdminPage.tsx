import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  ShoppingBag,
  Building2,
  FileText,
  LifeBuoy,
  Sprout,
  History,
  CheckCircle,
  XCircle,
  Ban,
  BadgeCheck,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  Shield,
  Layers,
  Lock
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog } from '../components/ui/dialog';
import { LoadingState } from '../components/common/LoadingState';
import { useAuth } from '../context/AuthContext';
import {
  useAdminStats,
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserBadges,
  useAdminReports,
  useResolveReport,
  useDismissReport,
  useAdminGroups,
  useUpdateGroupStatus,
  useAdminCrops,
  useCreateAdminCrop,
  useUpdateAdminCrop,
  useAdminSupportTickets,
  useUpdateAdminSupportTicket,
  useAdminAuditLogs
} from '../hooks/useAgriQuery';

export function AdminPage() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');
  const { user, login } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'groups' | 'crops' | 'tickets' | 'audit'>('overview');

  // Filters for Users tab
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add/Edit Crop state
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [cropCode, setCropCode] = useState('');
  const [cropNameEn, setCropNameEn] = useState('');
  const [cropNameKn, setCropNameKn] = useState('');
  const [cropCategory, setCropCategory] = useState('cereal');
  const [cropDuration, setCropDuration] = useState(90);

  // Queries
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users = [], isLoading: usersLoading } = useAdminUsers({
    search: userSearch || undefined,
    role: roleFilter,
    is_active: statusFilter === 'active' ? true : statusFilter === 'suspended' ? false : undefined
  });
  const { data: reports = [], isLoading: reportsLoading } = useAdminReports();
  const { data: groups = [], isLoading: groupsLoading } = useAdminGroups();
  const { data: crops = [], isLoading: cropsLoading } = useAdminCrops();
  const { data: tickets = [], isLoading: ticketsLoading } = useAdminSupportTickets();
  const { data: auditLogs = [], isLoading: auditLoading } = useAdminAuditLogs();

  // Mutations
  const updateUserStatus = useUpdateUserStatus();
  const updateUserBadges = useUpdateUserBadges();
  const resolveReport = useResolveReport();
  const dismissReport = useDismissReport();
  const updateGroupStatus = useUpdateGroupStatus();
  const createCrop = useCreateAdminCrop();
  const updateTicket = useUpdateAdminSupportTicket();

  // Strict Admin Authorization Check
  const isAdmin = user?.is_admin || user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-white border border-red-200 shadow-xl text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-earth-900">
          {isKn ? 'ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ (403 Forbidden)' : '403 Forbidden: Administrator Access Required'}
        </h2>
        <p className="text-xs sm:text-sm text-earth-600 leading-relaxed">
          {isKn
            ? 'ಈ ಪುಟವು ಕೇವಲ ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಕೃಷಿ ವೇದಿಕೆಯ ಅಧಿಕೃತ ಆಡಳಿತಾಧಿಕಾರಿಗಳಿಗೆ (Super Admin) ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ.'
            : 'The Admin dashboard and platform moderation tools require verified administrator credentials.'}
        </p>

        <div className="pt-4 border-t border-earth-100 space-y-2">
          <p className="text-xs text-earth-500 font-medium">
            {isKn ? 'ಪರಿಶೀಲನೆಗಾಗಿ ಡೆಮೊ ಅಡ್ಮಿನ್ ಖಾತೆಗೆ ಪ್ರವೇಶಿಸಿ:' : 'For evaluation, switch to Demo Administrator:'}
          </p>
          <button
            onClick={() => login({ phone_number: '9845000000', password: 'password123' })}
            className="w-full py-3 px-4 bg-earth-900 hover:bg-earth-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Switch to Mandya Krishi Admin (9845000000)</span>
          </button>
        </div>
      </div>
    );
  }

  const handleAddCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropCode || !cropNameEn || !cropNameKn) return;
    try {
      await createCrop.mutateAsync({
        code: cropCode,
        name_en: cropNameEn,
        name_kn: cropNameKn,
        category: cropCategory,
        typical_duration_days: Number(cropDuration)
      });
      setIsAddCropOpen(false);
      setCropCode('');
      setCropNameEn('');
      setCropNameKn('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-earth-900 text-white p-5 sm:p-6 rounded-3xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-normal leading-snug font-kannada">
                {t('admin.dashboard_title')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-earth-950 uppercase">
                {t('admin.admin_badge')}
              </span>
            </div>
            <p className="text-xs text-earth-300 mt-0.5">
              {isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಕೃಷಿ ವೇದಿಕೆ ಮೇಲ್ವಿಚಾರಣೆ & ನಿರ್ವಹಣೆ' : 'Mandya district platform management & compliance governance'}
            </p>
          </div>
        </div>

        <div className="text-xs text-earth-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
          <span>Logged in as: </span>
          <span className="font-bold text-white">{user?.full_name || 'Admin'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-earth-200 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-earth-900 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('admin.tab_overview')}</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-earth-900 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('admin.tab_users')}</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-earth-900 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{t('admin.tab_reports')}</span>
          {reports.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-600 text-white font-bold">
              {reports.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'groups'
              ? 'bg-earth-900 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t('admin.tab_groups')}</span>
        </button>

        <button
          onClick={() => setActiveTab('crops')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'crops'
              ? 'bg-earth-900 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>{t('admin.tab_crops')}</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-earth-900 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>{isKn ? 'ಬೆಂಬಲ ಮನವಿಗಳು' : 'Support Tickets'}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-earth-900 text-white shadow-xs'
              : 'text-earth-600 hover:bg-earth-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t('admin.tab_audit')}</span>
        </button>
      </div>

      {/* Tab 1: Overview Stats */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {statsLoading ? (
            <LoadingState rows={3} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 bg-white border-earth-200">
                <span className="text-xs text-earth-500 font-semibold">{t('admin.stats_users')}</span>
                <p className="text-2xl sm:text-3xl font-black text-earth-900 mt-1">{stats?.total_users || 0}</p>
                <div className="flex items-center gap-2 text-[11px] text-earth-600 mt-2">
                  <span>{stats?.total_farmers} {t('admin.stats_farmers')}</span>
                  <span>•</span>
                  <span>{stats?.total_buyers} {t('admin.stats_buyers')}</span>
                </div>
              </Card>

              <Card className="p-4 bg-white border-earth-200">
                <span className="text-xs text-earth-500 font-semibold">{t('admin.stats_listings')}</span>
                <p className="text-2xl sm:text-3xl font-black text-agri-700 mt-1">{stats?.total_listings || 0}</p>
                <p className="text-[11px] text-earth-500 mt-2">Mandya district harvest</p>
              </Card>

              <Card className="p-4 bg-white border-earth-200">
                <span className="text-xs text-earth-500 font-semibold">{t('admin.stats_groups')}</span>
                <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">{stats?.total_groups || 0}</p>
                <p className="text-[11px] text-earth-500 mt-2">Village self-help collectives</p>
              </Card>

              <Card className="p-4 bg-white border-earth-200">
                <span className="text-xs text-earth-500 font-semibold">{t('admin.stats_reports')}</span>
                <p className="text-2xl sm:text-3xl font-black text-red-600 mt-1">{stats?.pending_reports_count || 0}</p>
                <p className="text-[11px] text-earth-500 mt-2">Pending moderation review</p>
              </Card>

              <Card className="p-4 bg-white border-earth-200">
                <span className="text-xs text-earth-500 font-semibold">{t('admin.stats_tickets')}</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats?.open_tickets_count || 0}</p>
                <p className="text-[11px] text-earth-500 mt-2">Farmer enquiries & issues</p>
              </Card>

              <Card className="p-4 bg-white border-earth-200">
                <span className="text-xs text-earth-500 font-semibold">{t('admin.stats_advisories')}</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{stats?.total_advisories_count || 0}</p>
                <p className="text-[11px] text-earth-500 mt-2">Active rule engine alerts</p>
              </Card>

              <Card className="p-4 bg-white border-earth-200 col-span-2">
                <span className="text-xs text-earth-500 font-semibold">Mandya Agro-Climatic Pilot</span>
                <p className="text-sm font-bold text-earth-900 mt-1">Cauvery Basin Pilot Zone</p>
                <p className="text-xs text-earth-600 mt-1">
                  7 Taluks Covered: Mandya, Maddur, Malavalli, Pandavapura, Srirangapatna, KR Pet, Nagamangala.
                </p>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users Management & Badges */}
      {activeTab === 'users' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-earth-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder={t('admin.user_search')}
                className="w-full pl-9 pr-4 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs sm:text-sm text-earth-900 focus:outline-none focus:ring-2 focus:ring-earth-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs text-earth-900 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs text-earth-900 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <LoadingState rows={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-earth-200 text-earth-500 uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Badges</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-earth-50/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-earth-900">{u.full_name}</div>
                        <div className="text-[11px] text-earth-500">{u.phone_number} {u.email ? `• ${u.email}` : ''}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="capitalize font-semibold text-earth-700">{u.role}</span>
                      </td>
                      <td className="py-3 px-3 text-earth-600">
                        {u.location ? `${u.location.village}, ${u.location.taluk}` : 'Mandya'}
                      </td>
                      <td className="py-3 px-3 space-x-1">
                        <button
                          onClick={() => updateUserBadges.mutate({ id: u.id, payload: { is_verified: !u.is_verified } })}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            u.is_verified
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-earth-100 text-earth-400 border-earth-200 hover:text-earth-700'
                          }`}
                          title="Toggle Verified Badge"
                        >
                          Verified {u.is_verified ? '✓' : '+'}
                        </button>
                        <button
                          onClick={() => updateUserBadges.mutate({ id: u.id, payload: { is_expert: !u.is_expert } })}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            u.is_expert
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-earth-100 text-earth-400 border-earth-200 hover:text-earth-700'
                          }`}
                          title="Toggle Agri Expert Badge"
                        >
                          Expert {u.is_expert ? '✓' : '+'}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => updateUserStatus.mutate({ id: u.id, payload: { is_active: !u.is_active } })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.is_active
                              ? 'text-red-700 hover:bg-red-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? t('admin.action_suspend') : t('admin.action_reinstate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Content Moderation Reports Queue */}
      {activeTab === 'reports' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-base font-bold text-earth-900 border-b border-earth-100 pb-2">
            {t('admin.tab_reports')}
          </h3>

          {reportsLoading ? (
            <LoadingState rows={3} />
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-earth-500 text-xs">
              {isKn ? 'ಯಾವುದೇ ದೂರುಗಳು ಬಾಕಿ ಇಲ್ಲ.' : 'No flagged content reports in queue.'}
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        Report #{r.id} • {r.reason}
                      </span>
                      <h4 className="font-bold text-sm text-earth-900 mt-1">
                        {r.post_title || 'Flagged Community Discussion Item'}
                      </h4>
                      {r.post_content && (
                        <p className="text-xs text-earth-700 italic mt-0.5 bg-white p-2.5 rounded-xl border border-earth-200">
                          "{r.post_content}"
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : r.status === 'reviewed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-earth-200 text-earth-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-earth-500 pt-1 border-t border-earth-200/60">
                    <span>
                      {t('admin.report_reporter')}: <strong className="text-earth-800">{r.reporter_name || `User #${r.user_id}`}</strong>
                    </span>

                    {r.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dismissReport.mutate(r.id)}
                          className="px-3 py-1 bg-white border border-earth-300 hover:bg-earth-100 text-earth-700 font-bold rounded-lg transition-colors"
                        >
                          {t('admin.action_dismiss')}
                        </button>
                        <button
                          onClick={() => resolveReport.mutate({ id: r.id, payload: { action: 'take_down', notes: 'Removed for harmful advice' } })}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs transition-colors"
                        >
                          {t('admin.action_take_down')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Village Groups Moderation */}
      {activeTab === 'groups' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-base font-bold text-earth-900 border-b border-earth-100 pb-2">
            {t('admin.tab_groups')}
          </h3>

          {groupsLoading ? (
            <LoadingState rows={3} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map(g => (
                <div key={g.id} className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-earth-900">{isKn ? g.name_kn : g.name_en}</h4>
                      <p className="text-xs text-earth-500">{g.village}, {g.taluk} Taluk</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      g.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {g.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-earth-600 leading-relaxed">
                    {isKn ? g.description_kn : g.description_en}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-earth-200/60 text-xs">
                    <span className="text-earth-500 font-medium">
                      {g.members_count || 12} Members
                    </span>
                    <button
                      onClick={() => updateGroupStatus.mutate({ id: g.id, payload: { is_active: !g.is_active } })}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                        g.is_active ? 'text-red-700 hover:bg-red-50' : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {g.is_active ? t('admin.group_deactivate') : t('admin.group_activate')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Crop Metadata Management */}
      {activeTab === 'crops' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-earth-100 pb-2">
            <h3 className="text-base font-bold text-earth-900">
              {t('admin.tab_crops')}
            </h3>
            <Button size="sm" onClick={() => setIsAddCropOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              {t('admin.add_crop')}
            </Button>
          </div>

          {cropsLoading ? (
            <LoadingState rows={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-earth-200 text-earth-500 uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">English Name</th>
                    <th className="py-2.5 px-3">Kannada Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Typical Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100">
                  {crops.map(c => (
                    <tr key={c.id} className="hover:bg-earth-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-earth-900">{c.code}</td>
                      <td className="py-2.5 px-3 font-medium text-earth-900">{c.name_en}</td>
                      <td className="py-2.5 px-3 font-medium text-earth-900">{c.name_kn}</td>
                      <td className="py-2.5 px-3 capitalize text-earth-600">{c.category}</td>
                      <td className="py-2.5 px-3 text-earth-600">{c.typical_duration_days} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 6: Support Tickets Queue */}
      {activeTab === 'tickets' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-base font-bold text-earth-900 border-b border-earth-100 pb-2">
            {isKn ? 'ಬಳಕೆದಾರರ ಬೆಂಬಲ ಮನವಿಗಳ ಪರಿಶೀಲನೆ' : 'Farmer Support Tickets Queue'}
          </h3>

          {ticketsLoading ? (
            <LoadingState rows={3} />
          ) : (
            <div className="space-y-3">
              {tickets.map(tkt => (
                <div key={tkt.id} className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-earth-500">
                        #{tkt.id} • {tkt.category}
                      </span>
                      <h4 className="font-bold text-sm text-earth-900 mt-0.5">{tkt.subject}</h4>
                      <p className="text-xs text-earth-600">{tkt.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tkt.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tkt.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tkt.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-earth-500 pt-2 border-t border-earth-200/60">
                    <span>Farmer: <strong>{tkt.user_name || 'Farmer'}</strong> {tkt.user_phone ? `(${tkt.user_phone})` : ''}</span>

                    <div className="flex items-center gap-2">
                      {tkt.status !== 'resolved' && (
                        <button
                          onClick={() => updateTicket.mutate({ id: tkt.id, payload: { status: 'resolved', resolution_notes: 'Resolved by Mandya extension team' } })}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 7: Moderation Audit Logs */}
      {activeTab === 'audit' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-base font-bold text-earth-900 border-b border-earth-100 pb-2">
            {t('admin.tab_audit')}
          </h3>

          {auditLoading ? (
            <LoadingState rows={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-earth-200 text-earth-500 uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">{t('admin.audit_time')}</th>
                    <th className="py-2.5 px-3">Admin</th>
                    <th className="py-2.5 px-3">{t('admin.audit_action')}</th>
                    <th className="py-2.5 px-3">{t('admin.audit_target')}</th>
                    <th className="py-2.5 px-3">{t('admin.audit_details')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100">
                  {auditLogs.map(l => (
                    <tr key={l.id} className="hover:bg-earth-50/50">
                      <td className="py-2.5 px-3 text-earth-500">
                        {new Date(l.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-earth-900">{l.admin_name || `Admin #${l.admin_id}`}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-xs font-bold text-earth-800 bg-earth-100 px-2 py-0.5 rounded-lg">
                          {l.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 uppercase text-earth-600 font-semibold">{l.target_type} #{l.target_id}</td>
                      <td className="py-2.5 px-3 text-earth-600">{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Add Crop Dialog */}
      <Dialog
        isOpen={isAddCropOpen}
        onClose={() => setIsAddCropOpen(false)}
        title={t('admin.add_crop')}
        description="Add a new crop to Mandya agricultural metadata registry."
      >
        <form onSubmit={handleAddCropSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-earth-800 mb-1">{t('admin.crop_code')}</label>
            <input
              type="text"
              value={cropCode}
              onChange={e => setCropCode(e.target.value.toUpperCase())}
              placeholder="e.g. MULBERRY"
              className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs sm:text-sm font-mono uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-earth-800 mb-1">{t('admin.crop_name_en')}</label>
              <input
                type="text"
                value={cropNameEn}
                onChange={e => setCropNameEn(e.target.value)}
                placeholder="e.g. Mulberry"
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-earth-800 mb-1">{t('admin.crop_name_kn')}</label>
              <input
                type="text"
                value={cropNameKn}
                onChange={e => setCropNameKn(e.target.value)}
                placeholder="e.g. ಹಿಪ್ಪುನೇರಳೆ (Mulberry)"
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-earth-800 mb-1">{t('admin.crop_category')}</label>
              <select
                value={cropCategory}
                onChange={e => setCropCategory(e.target.value)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs sm:text-sm"
              >
                <option value="commercial">Commercial</option>
                <option value="cereal">Cereal / Grain</option>
                <option value="pulse">Pulse</option>
                <option value="vegetable">Vegetable</option>
                <option value="horticulture">Horticulture</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-earth-800 mb-1">{t('admin.crop_duration')}</label>
              <input
                type="number"
                value={cropDuration}
                onChange={e => setCropDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddCropOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={createCrop.isPending}>
              {t('common.submit')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
