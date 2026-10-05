import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Download,
  Edit2,
  FileSpreadsheet,
  FileUp,
  Fuel,
  MapPin,
  MessageCircle,
  MessageSquare,
  Plus,
  QrCode,
  Search,
  Square,
  Trash2,
  UploadCloud,
  UserCheck,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Asset, CargasUser, Station } from '../../types/cargas';
import { exportAssetsToExcel } from '../../utils/excelUtils';
import { AssetModal } from '../asset/AssetModal';
import { QrModal } from '../asset/QrModal';
import { StationImportModal } from './StationImportModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { WhatsAppInviteModal } from '../admin/WhatsAppInviteModal';
import { ChatWithAdminModal } from '../chat/ChatWithAdminModal';
import { EmployeeAssignmentModal } from './EmployeeAssignmentModal';
import { AssetTableCell } from '../common/AssetTableCell';
import { ColumnVisibilityPopover } from '../common/ColumnVisibilityPopover';

export const StationView: React.FC = () => {
  const {
    assets,
    stations,
    selectedStationId,
    setSelectedStationId,
    categories,
    deleteAsset,
    toggleConfirmAsset,
    bulkConfirmAssets,
    currentUser,
    users,
    chatMessages,
    tableColumns,
    uiVisibility
  } = useCargas();

  const stUi = uiVisibility.station;

  const activeColumns = useMemo(() => {
    return tableColumns
      .filter(col => col.active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [tableColumns]);

  const currentStation: Station = stations.find(s => s.id === selectedStationId) || stations[0] || {
    id: 'st-1',
    name: 'محطة ألماظة',
    code: 'ALM',
    region: 'شرق',
    governorate: 'القاهرة',
    manager_name: 'م. أحمد محمود التوني',
    phone: '01012345671',
    address: 'شارع الثورة - مصر الجديدة - القاهرة'
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals & Notifications
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isImportingAsset, setIsImportingAsset] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmployeeAssignOpen, setIsEmployeeAssignOpen] = useState(false);
  const [chatInitialAssetCode, setChatInitialAssetCode] = useState<string | undefined>(undefined);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [whatsAppModalUser, setWhatsAppModalUser] = useState<CargasUser | null>(null);

  const stationUnreadChatCount = chatMessages.filter(
    m => m.station_id === currentStation.id && !m.read_by_user && (m.sender_role === 'admin' || m.sender_role === 'system_manager')
  ).length;

  const handleOpenWhatsAppForCurrentStation = () => {
    const manager = users.find(u => u.station_id === currentStation.id) || {
      id: `usr-${currentStation.id}`,
      name: currentStation.manager_name || `مدير محطة ${currentStation.name}`,
      email: `manager.${currentStation.code.toLowerCase()}@cargas.com.eg`,
      phone: currentStation.phone || '01012345678',
      whatsapp_number: currentStation.phone || '01012345678',
      role: 'station_manager' as const,
      station_id: currentStation.id,
      station_name: currentStation.name,
      region: currentStation.region,
      status: 'active' as const,
      auth_provider: 'google' as const
    };
    setWhatsAppModalUser(manager);
  };

  // Filter assets belonging to this station
  const stationAssets = useMemo(() => {
    return assets.filter(a => a.station_id === currentStation.id);
  }, [assets, currentStation.id]);

  const confirmedCount = useMemo(() => stationAssets.filter(a => a.confirmed).length, [stationAssets]);
  const pendingCount = stationAssets.length - confirmedCount;
  const completionRate = stationAssets.length > 0 ? Math.round((confirmedCount / stationAssets.length) * 100) : 0;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const handleConfirmAllPending = () => {
    const pendingAssets = stationAssets.filter(a => !a.confirmed);
    if (pendingAssets.length === 0) return;
    bulkConfirmAssets(pendingAssets.map(a => a.id), currentUser.name);
    setExportFeedback(`تم التأكيد على وجود كافة أصول محطة ${currentStation.name} (${pendingAssets.length} أصل) بنجاح!`);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stationAssets.filter(a => {
      if (selectedCategoryFilter && a.category !== selectedCategoryFilter) return false;
      if (statusFilter === 'confirmed' && !a.confirmed) return false;
      if (statusFilter === 'pending' && a.confirmed) return false;

      if (q) {
        const matchName = String(a.asset_name || '').toLowerCase().includes(q);
        const matchCode = String(a.asset_code || '').toLowerCase().includes(q);
        const matchSerial = String(a.serial_no || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchSerial) return false;
      }

      return true;
    });
  }, [stationAssets, selectedCategoryFilter, statusFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentStation.id, selectedCategoryFilter, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredAssets.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAssets = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAssets.slice(start, start + pageSize);
  }, [filteredAssets, safeCurrentPage, pageSize]);

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkConfirm = () => {
    if (selectedIds.size === 0) return;
    setShowBulkConfirmModal(true);
  };

  const executeBulkConfirm = () => {
    bulkConfirmAssets(Array.from(selectedIds), currentUser.name);
    setSelectedIds(new Set());
    setShowBulkConfirmModal(false);
  };

  // Export displayed assets (respecting search and filters)
  const handleExportDisplayed = () => {
    if (filteredAssets.length === 0) {
      alert('لا توجد أصول معروضة حالياً لتصديرها. تأكد من نتائج البحث أو التصفية.');
      return;
    }
    const cleanStationName = (currentStation.name || 'محطة').replace(/[\/\\?%*:|"<>]/g, '_');
    const today = new Date().toISOString().split('T')[0];
    const fileName = `أصول_${cleanStationName}_المعروضة_${today}.xlsx`;
    
    try {
      exportAssetsToExcel(filteredAssets, fileName, currentStation.name);
      setExportFeedback(`تم تصدير ${filteredAssets.length} أصل معروض بنجاح إلى ملف Excel (${fileName})`);
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تصدير ملف Excel');
    }
  };

  // Export only selected assets
  const handleExportSelected = () => {
    const selectedList = filteredAssets.filter(a => selectedIds.has(a.id));
    if (selectedList.length === 0) return;
    const cleanStationName = (currentStation.name || 'محطة').replace(/[\/\\?%*:|"<>]/g, '_');
    const today = new Date().toISOString().split('T')[0];
    const fileName = `أصول_${cleanStationName}_محددة_${today}.xlsx`;

    try {
      exportAssetsToExcel(selectedList, fileName, `${currentStation.name} - محدد`);
      setExportFeedback(`تم تصدير ${selectedList.length} أصل محدد بنجاح إلى ملف Excel (${fileName})`);
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تصدير ملف Excel');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Station Profile Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-xl border border-emerald-800 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Station Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Fuel className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-white/10 text-emerald-200">
                {currentStation.code}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-800 text-emerald-100">
                منطقة {currentStation.region} • {currentStation.governorate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentStation.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-emerald-200/80 flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>مدير المحطة: {currentStation.manager_name || currentUser.name}</span>
              </p>
              <button
                onClick={() => {
                  setChatInitialAssetCode(undefined);
                  setIsChatOpen(true);
                }}
                id="station-header-chat-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/20 shadow-xs transition-colors"
                title="شات ومحادثة فورية مع مدير عام النظام"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
                <span>شات مع مدير النظام</span>
                {stationUnreadChatCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 animate-pulse">
                    {stationUnreadChatCount} جديد
                  </span>
                )}
              </button>
              {(currentUser.role === 'admin' || currentUser.role === 'system_manager') && (
                <button
                  onClick={handleOpenWhatsAppForCurrentStation}
                  id="station-send-whatsapp-invite-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-700/70 hover:bg-emerald-600 text-white text-[11px] font-bold border border-emerald-500/50 shadow-xs transition-colors"
                  title="إرسال رابط هذه المحطة لمديرها عبر الواتساب"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-green-300" />
                  <span>إرسال رابط المحطة لمديرها عبر WhatsApp</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats & Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center gap-6 self-start md:self-auto">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white font-mono">{stationAssets.length}</p>
              <p className="text-[11px] text-emerald-200">إجمالي الأصول</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-extrabold text-green-300 font-mono">{confirmedCount}</p>
              <p className="text-[11px] text-green-200">تمت مطابقتها</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-extrabold text-amber-300 font-mono">{completionRate}%</p>
              <p className="text-[11px] text-amber-200">نسبة الإنجاز</p>
            </div>
          </div>

        </div>

        {/* Audit Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-emerald-100 font-semibold">مؤشر تأكيد ومطابقة أصول المحطة</span>
            <span className="font-mono font-bold text-amber-300">{confirmedCount} من {stationAssets.length} أصل معتمد</span>
          </div>
          <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-green-400 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

      </div>

      {/* Dedicated Asset Verification Banner */}
      {pendingCount > 0 ? (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-400/80 dark:border-amber-700/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
          <div className="flex items-start md:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-100">
                  مهمة التأكيد على وجود الأصول • محطة {currentStation.name}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                  {pendingCount} أصل بانتظار التأكيد
                </span>
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
                يرجى معاينة المعدات والأجهزة ميدانياً في المحطة، ثم الضغط على زر "تأكيد وجود الأصل" في الجدول أدناه لكل معدة، أو تأكيد كافة الأصول بعد الجرد الشامل.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-100/60'
              }`}
            >
              {statusFilter === 'pending' ? 'عرض جميع الأصول' : `تصفية: غير المؤكدة فقط (${pendingCount})`}
            </button>

            <button
              onClick={handleConfirmAllPending}
              id="confirm-all-pending-btn"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-xs transition-colors"
              title="تأكيد ومطابقة كافة الأصول المتبقية غير المؤكدة في هذه المحطة"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد وجود كافة الأصول المتبقية ({pendingCount}) ✅</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-400/80 dark:border-emerald-700/80 shadow-xs flex items-center justify-between gap-4 text-right">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                اكتمل التأكيد والمطابقة لكافة أصول محطة {currentStation.name} بنجاح!
              </h3>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                تم اعتماد وتأكيد وجود جميع الـ ({confirmedCount}) أصل ومعدّة بنسبة 100% في سجلات المنظومة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Employee Task Assignment Button (Station Manager capability) */}
          {stUi.buttons.whatsapp_task && (
            <button
              onClick={() => setIsEmployeeAssignOpen(true)}
              id="station-assign-employee-whatsapp-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
              title="إرسال رابط تكليف بمطابقة الأصول عبر واتساب لموظفي المحطة"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" />
              <span>تكليف موظف بمطابقة الأصول عبر WhatsApp</span>
            </button>
          )}

          {stUi.buttons.add_asset && (
            <button
              onClick={() => setIsAddingAsset(true)}
              id="station-add-asset-btn"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أصل للمحطة</span>
            </button>
          )}

          {stUi.buttons.import_excel && (currentUser.role === 'admin' || currentUser.role === 'system_manager') && (
            <button
              onClick={() => setIsImportingAsset(true)}
              id="station-import-excel-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-300 dark:border-emerald-700 shadow-2xs"
              title="استيراد أصول ومعدات من ملف Excel دفعة واحدة"
            >
              <FileUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>استيراد Excel للمحطة</span>
            </button>
          )}

          {/* Chat with System Manager (Direct channel for user and admin) */}
          {stUi.buttons.chat_button && (
            <button
              onClick={() => {
                setChatInitialAssetCode(undefined);
                setIsChatOpen(true);
              }}
              id="station-open-chat-btn"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-xs border border-emerald-700/50"
              title="فتح الشات والمحادثة المباشرة مع مدير النظام: محمد عبد الرحمن"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>شات مع مدير النظام</span>
              {stationUnreadChatCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 animate-pulse">
                  {stationUnreadChatCount} جديد
                </span>
              )}
            </button>
          )}

          {selectedIds.size > 0 && (
            <>
              <button
                onClick={handleBulkConfirm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500 transition-colors shadow-xs animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد ومطابقة المحددة ({selectedIds.size})</span>
              </button>

              <button
                onClick={handleExportSelected}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-300 dark:border-emerald-700 shadow-2xs animate-in fade-in"
                title="تصدير الأصول المحددة فقط إلى ملف Excel"
                id="station-export-selected-btn"
              >
                <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>تصدير المحددة ({selectedIds.size})</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportDisplayed}
            id="station-export-excel-btn"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              filteredAssets.length > 0
                ? 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-900 dark:hover:text-emerald-200 border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-2xs'
                : 'text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
            }`}
            title="تصدير بيانات الأصول المعروضة في الجدول إلى ملف Excel"
            disabled={filteredAssets.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>تصدير Excel المعروض ({filteredAssets.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الكود أو المسلسل..."
            className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-2.5" />
        </div>

      </div>

      {/* Export Success Feedback Toast */}
      {exportFeedback && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="font-bold">{exportFeedback}</span>
          </div>
          <button
            onClick={() => setExportFeedback(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 p-1 rounded-lg hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedCategoryFilter === ''
              ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          كل الفئات ({stationAssets.length})
        </button>

        {categories.map(cat => {
          const count = stationAssets.filter(a => a.category === cat.name).length;
          if (count === 0) return null;

          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategoryFilter(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategoryFilter === cat.name
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedCategoryFilter === cat.name ? 'bg-emerald-950 dark:bg-emerald-900 text-emerald-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {selectedIds.size === filteredAssets.length && filteredAssets.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            )}
            <span>تحديد الكل</span>
          </button>

          {/* Column Visibility Customizer */}
          <ColumnVisibilityPopover currentAssets={stationAssets} />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
              statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الكل ({filteredAssets.length})
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
              statusFilter === 'confirmed' ? 'bg-green-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            تم التأكيد ({confirmedCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            بانتظار التأكيد ({pendingCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th className="py-3 px-3 text-center w-10">#</th>
                {activeColumns.map(col => (
                  <th key={col.key} className="py-3 px-3 whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="py-3 px-3 text-center whitespace-nowrap">مطابقة وتأكيد</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length + 3} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">لا توجد أصول مسجلة تطابق شروط التصفية الحالية</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-md">
                        يمكنك إضافة أصل جديد يدوياً أو استيراد كميات كبيرة من الأصول دفعة واحدة عبر ملف Excel.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {currentUser.role !== 'system_manager' && (
                          <button
                            onClick={() => setIsImportingAsset(true)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-2xs"
                          >
                            <FileUp className="w-4 h-4" />
                            <span>استيراد أصول من Excel</span>
                          </button>
                        )}
                        <button
                          onClick={() => setIsAddingAsset(true)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة أصل يدوياً</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map(asset => {
                  const isChecked = selectedIds.has(asset.id);

                  return (
                    <tr key={asset.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isChecked ? 'bg-emerald-50/40 dark:bg-emerald-950/30' : ''}`}>
                      
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(asset.id)}
                          className="text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Dynamic Active Columns */}
                      {activeColumns.map(col => (
                        <td key={col.key} className="py-3 px-3">
                          <AssetTableCell asset={asset} colKey={col.key} />
                        </td>
                      ))}

                      {/* Confirm Toggle */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleConfirmAsset(asset.id, currentUser.name)}
                          id={`confirm-asset-${asset.id}-btn`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            asset.confirmed
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 border border-emerald-300/80 dark:border-emerald-700'
                              : 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 shadow-xs'
                          }`}
                          title={asset.confirmed ? 'تم تأكيد الوجود - انقر للتراجع إذا لزم' : 'انقر لتأكيد وجود هذا الأصل ميدانياً في المحطة'}
                        >
                          {asset.confirmed ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                              <span>مؤكد بالمحطة ✓</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-white" />
                              <span>تأكيد وجود الأصل 📍</span>
                            </>
                          )}
                        </button>
                        {asset.confirmed && (
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                            {asset.confirmed_by ? `${asset.confirmed_by} • ` : ''}{asset.confirmed_at || 'معتمد'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setChatInitialAssetCode(asset.asset_code);
                              setIsChatOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                            title={`محادثة واستفسار لمدير النظام عن الأصل ${asset.asset_code}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setQrAsset(asset)}
                            className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                            title="عرض كود QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingAsset(asset)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                            title="تعديل الأصل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAssetToDelete(asset)}
                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="حذف الأصل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {filteredAssets.length > 0 && (
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-4 text-xs">
            
            {/* Left: Range and Items Per Page */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                عرض{' '}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {(safeCurrentPage - 1) * pageSize + 1}
                </strong>
                {' - '}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {Math.min(safeCurrentPage * pageSize, filteredAssets.length)}
                </strong>
                {' من إجمالي '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                  {filteredAssets.length.toLocaleString('ar-EG')}
                </strong>
                {' أصل بالمحطة'}
              </span>

              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">عدد المعروض:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value={25}>25 في الصفحة</option>
                  <option value={50}>50 في الصفحة</option>
                  <option value={100}>100 في الصفحة</option>
                  <option value={250}>250 في الصفحة</option>
                </select>
              </div>
            </div>

            {/* Right: Pagination Navigation */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="الصفحة الأولى"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>

                {/* Prev Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dynamic Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => {
                      if (totalPages <= 7) return true;
                      if (p === 1 || p === totalPages) return true;
                      return Math.abs(p - safeCurrentPage) <= 1;
                    })
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && typeof arr[idx - 1] === 'number') {
                        const prevNum = arr[idx - 1] as number;
                        if (p - prevNum > 1) {
                          acc.push('...');
                        }
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) => {
                      if (item === '...') {
                        return (
                          <span key={`dots-${idx}`} className="px-1 text-slate-400">
                            ...
                          </span>
                        );
                      }

                      const pageNum = Number(item);
                      const isActive = pageNum === safeCurrentPage;

                      return (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[32px] h-8 rounded-lg font-mono font-bold text-xs transition-all ${
                            isActive
                              ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                              : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="الصفحة الأخيرة"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

              </div>
            )}

          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrAsset && (
        <QrModal asset={qrAsset} onClose={() => setQrAsset(null)} />
      )}

      {/* Add / Edit Asset Modal */}
      {(isAddingAsset || editingAsset) && (
        <AssetModal
          asset={editingAsset}
          defaultStationId={currentStation.id}
          onClose={() => {
            setIsAddingAsset(false);
            setEditingAsset(null);
          }}
        />
      )}

      {/* Station Bulk Excel Import Modal */}
      <StationImportModal
        isOpen={isImportingAsset}
        onClose={() => setIsImportingAsset(false)}
        station={currentStation}
        onImportSuccess={(count) => {
          setExportFeedback(`تم استيراد ${count} أصل بنجاح وتعيينهم لمحطة ${currentStation.name} وتوليد أكواد QR لهم!`);
          setTimeout(() => setExportFeedback(null), 5000);
        }}
      />

      {/* Single Asset Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onConfirm={() => {
          if (assetToDelete) {
            deleteAsset(assetToDelete.id);
            setAssetToDelete(null);
          }
        }}
        type="danger"
        title="تأكيد حذف الأصل من المحطة"
        message={`هل أنت متأكد من رغبتك في حذف الأصل "${assetToDelete?.asset_name}" (${assetToDelete?.asset_code}) نهائياً؟ سيتم توثيق عملية الحذف في سجل الرقابة والعمليات.`}
        confirmLabel="تأكيد الحذف النهائي"
        cancelLabel="تراجع"
        itemDetails={assetToDelete ? [
          { label: 'كود الأصل', value: <span className="font-mono font-bold text-emerald-800">{assetToDelete.asset_code}</span> },
          { label: 'اسم الأصل', value: assetToDelete.asset_name },
          { label: 'المحطة', value: currentStation.name },
          { label: 'الفئة', value: assetToDelete.category },
          { label: 'الرقم المسلسل', value: assetToDelete.serial_no || '—' }
        ] : []}
      />

      {/* Bulk Confirm Safety Dialog */}
      <ConfirmDialog
        isOpen={showBulkConfirmModal}
        onClose={() => setShowBulkConfirmModal(false)}
        onConfirm={executeBulkConfirm}
        type="success"
        title="تأكيد مطابقة واعتماد الأصول المحددة"
        message={`أنت على وشك اعتماد ومطابقة عدد (${selectedIds.size}) أصل بمحطة "${currentStation.name}". سيتم توثيق المطابقة باسمك وتاريخ اليوم في سجل الرقابة.`}
        confirmLabel={`اعتماد ومطابقة (${selectedIds.size}) أصل`}
        cancelLabel="تراجع"
        itemDetails={[
          { label: 'المحطة المستهدفة', value: currentStation.name },
          { label: 'عدد الأصول المراد مطابقتها', value: <span className="font-bold text-emerald-700">{selectedIds.size} أصل</span> },
          { label: 'المسؤول القائم بالاعتماد', value: currentUser.name }
        ]}
      />

      {/* WhatsApp Invite Modal for Admin in Station View */}
      {whatsAppModalUser && (
        <WhatsAppInviteModal
          user={whatsAppModalUser}
          isOpen={!!whatsAppModalUser}
          onClose={() => setWhatsAppModalUser(null)}
          onTestInvite={(token) => {
            setWhatsAppModalUser(null);
            window.location.href = `/?invite=${encodeURIComponent(token)}`;
          }}
        />
      )}

      {/* Chat With System Manager Modal */}
      <ChatWithAdminModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialAssetCode(undefined);
        }}
        station={currentStation}
        stationAssets={stationAssets}
        initialAssetCode={chatInitialAssetCode}
      />

      {/* Employee WhatsApp Assignment Modal */}
      <EmployeeAssignmentModal
        isOpen={isEmployeeAssignOpen}
        onClose={() => setIsEmployeeAssignOpen(false)}
        station={currentStation}
        pendingCount={pendingCount}
        totalCount={stationAssets.length}
        onPreviewEmployeeView={(url) => {
          window.location.href = url;
        }}
      />

    </div>
  );
};
