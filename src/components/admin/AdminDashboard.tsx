import React, { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  Bell,
  Building2,
  CheckCircle2,
  Columns,
  Database,
  Download,
  Factory,
  FileSpreadsheet,
  Fuel,
  History,
  Layers,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Plus,
  QrCode,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { AssetsTab } from './AssetsTab';
import { AdminChatsTab } from './AdminChatsTab';
import { AuditLogTab } from './AuditLogTab';
import { CategoriesTab } from './CategoriesTab';
import { ColumnsTab } from './ColumnsTab';
import { GeoTab } from './GeoTab';
import { ImportExportTab } from './ImportExportTab';
import { NotificationsTab } from './NotificationsTab';
import { OverviewTab } from './OverviewTab';
import { QrCodesTab } from './QrCodesTab';
import { StationsTab } from './StationsTab';
import { UsersTab } from './UsersTab';
import { UiControlsTab } from './UiControlsTab';
import { DemoDataModal } from './DemoDataModal';
import { AssetModal } from '../asset/AssetModal';
import { Sliders } from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: string;
  onNavigateTab?: (tab: string) => void;
  onTestInvite?: (token: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview', onTestInvite }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isAddingAssetModalOpen, setIsAddingAssetModalOpen] = useState(false);

  const {
    notifications,
    assets,
    stations,
    users,
    auditLogs,
    tableColumns,
    chatMessages,
    currentUser,
    switchRole
  } = useCargas();

  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const unreadChatCount = chatMessages.filter(m => !m.read_by_admin && m.sender_role === 'station_manager').length;
  const activeColsCount = tableColumns.filter(c => c.active).length;

  // Build navigation tabs dynamically
  const NAV_TABS = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'assets', label: 'الأصول والمطابقة', icon: Layers, badge: assets.length },
    { id: 'ui_controls', label: 'التحكم في واجهات المحطة والموظف', icon: Sliders },
    { id: 'columns', label: 'التحكم بالأعمدة والجداول', icon: Columns, badge: activeColsCount },
    { id: 'import_export', label: 'استيراد وتصدير الجداول والملفات', icon: FileSpreadsheet },
    { id: 'chats', label: 'شات ومحادثات المحطات', icon: MessageSquare, badge: unreadChatCount > 0 ? unreadChatCount : undefined },
    { id: 'categories', label: 'الفئات والتصنيفات', icon: Layers },
    { id: 'audit_log', label: 'سجل العمليات والرقابة', icon: History, badge: auditLogs.length },
    { id: 'qr_codes', label: 'أكواد QR', icon: QrCode },
    { id: 'stations', label: 'المحطات', icon: Factory, badge: stations.length },
    { id: 'users', label: 'المستخدمون والصلاحيات', icon: Users, badge: users.length },
    { id: 'geo', label: 'المناطق الجغرافية', icon: MapPin },
    { id: 'notifications', label: 'التنبيهات', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner / Role Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg text-white shadow-2xs bg-emerald-800 dark:bg-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              لوحة تحكم مدير النظام: محمد عبد الرحمن
            </h1>

            {/* Role indicator badge */}
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold border bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
              مدير النظام الوحيد (صلاحية كاملة للتغييرات والتعديلات)
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            التحكم الحصري في إعدادات المنظومة، إظهار وإخفاء عناصر واجهات المحطة والموظف، ضبط أعمدة الجداول، ومتابعة جرد ومطابقة الأصول عبر المحطات.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Add Asset (Single or Multiple Stations) */}
          <button
            onClick={() => setIsAddingAssetModalOpen(true)}
            id="admin-header-add-asset-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs"
            title="إضافة أصل جديد وتوزيعه على محطة واحدة أو مجموعة محطات مصنفاً بنوع الحصر والدفتر المالي"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أصل (أو لمجموعة محطات)</span>
          </button>

          {/* Jump to Columns Control */}
          <button
            onClick={() => setActiveTab('columns')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'columns'
                ? 'bg-emerald-800 dark:bg-emerald-700 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="تعديل، إظهار، إخفاء وترتيب أعمدة الجداول"
          >
            <Columns className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>التحكم في الأعمدة</span>
          </button>

          {/* Demo Data Control */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-all shadow-2xs"
            id="admin-demo-data-btn"
            title="التحكم في مسح الأصول التجريبية أو استعادتها"
          >
            <Database className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>البيانات التجريبية</span>
          </button>

        </div>

      </div>

      {/* Horizontal Scrollable Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-slate-200/80 dark:border-slate-800 scrollbar-none">
        {NAV_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive
                    ? 'bg-emerald-950 dark:bg-emerald-900 text-emerald-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="transition-all duration-150">
        {activeTab === 'overview' && <OverviewTab onNavigateTab={(t) => setActiveTab(t)} />}
        {activeTab === 'assets' && <AssetsTab onNavigateToColumns={() => setActiveTab('columns')} />}
        {activeTab === 'ui_controls' && <UiControlsTab />}
        {activeTab === 'columns' && <ColumnsTab />}
        {activeTab === 'import_export' && <ImportExportTab />}
        {activeTab === 'chats' && <AdminChatsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'audit_log' && <AuditLogTab />}
        {activeTab === 'qr_codes' && <QrCodesTab />}
        {activeTab === 'stations' && <StationsTab />}
        {activeTab === 'users' && <UsersTab onTestInvite={onTestInvite} />}
        {activeTab === 'geo' && <GeoTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>

      {/* Demo Data Control Modal */}
      <DemoDataModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onGoToUsers={() => setActiveTab('users')}
      />

      {/* Add Asset Modal (Single or Multiple Stations) */}
      {isAddingAssetModalOpen && (
        <AssetModal
          asset={null}
          onClose={() => setIsAddingAssetModalOpen(false)}
        />
      )}

    </div>
  );
};
