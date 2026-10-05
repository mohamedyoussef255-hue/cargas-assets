import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  History,
  Info,
  Layers,
  MapPin,
  PlusCircle,
  QrCode,
  RotateCcw,
  Search,
  Trash2,
  User,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { AuditActionType, AuditLogEntry } from '../../types/cargas';
import { exportAuditLogsToExcel } from '../../utils/excelUtils';

export const AuditLogTab: React.FC = () => {
  const { auditLogs, stations, users, clearAuditLogs } = useCargas();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Toggle detail expansion
  const toggleExpand = (id: string) => {
    setExpandedLogIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    auditLogs.forEach(l => {
      allExpanded[l.id] = true;
    });
    setExpandedLogIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedLogIds({});
  };

  // Filtered Logs Calculation
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = log.asset_code?.toLowerCase().includes(q);
        const matchesName = log.asset_name?.toLowerCase().includes(q);
        const matchesUser = log.user_name.toLowerCase().includes(q);
        const matchesStation = log.station_name?.toLowerCase().includes(q);
        const matchesDesc = log.description.toLowerCase().includes(q);
        const matchesAction = log.action_label.toLowerCase().includes(q);
        const matchesChanges = log.changes?.some(c =>
          c.field_label.toLowerCase().includes(q) ||
          String(c.old_value).toLowerCase().includes(q) ||
          String(c.new_value).toLowerCase().includes(q)
        );

        if (!matchesCode && !matchesName && !matchesUser && !matchesStation && !matchesDesc && !matchesAction && !matchesChanges) {
          return false;
        }
      }

      // Action Filter
      if (selectedAction !== 'all') {
        if (selectedAction === 'confirm_all') {
          if (log.action_type !== 'confirm' && log.action_type !== 'bulk_confirm') return false;
        } else if (log.action_type !== selectedAction) {
          return false;
        }
      }

      // Station Filter
      if (selectedStation !== 'all') {
        if (log.station_name !== selectedStation && log.station_id !== selectedStation) return false;
      }

      // User Filter
      if (selectedUser !== 'all') {
        if (log.user_name !== selectedUser && log.user_id !== selectedUser) return false;
      }

      // Period Filter
      if (selectedPeriod !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (selectedPeriod === 'today') {
          const isToday = logDate.getDate() === now.getDate() &&
                          logDate.getMonth() === now.getMonth() &&
                          logDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (selectedPeriod === 'week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < sevenDaysAgo) return false;
        } else if (selectedPeriod === 'month') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (logDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [auditLogs, searchQuery, selectedAction, selectedStation, selectedUser, selectedPeriod]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = auditLogs.length;
    const updates = auditLogs.filter(l => l.action_type === 'update').length;
    const confirms = auditLogs.filter(l => l.action_type === 'confirm' || l.action_type === 'bulk_confirm').length;
    const creations = auditLogs.filter(l => l.action_type === 'create' || l.action_type === 'bulk_import').length;
    const uniqueUsers = new Set(auditLogs.map(l => l.user_name)).size;

    return { total, updates, confirms, creations, uniqueUsers };
  }, [auditLogs]);

  // Export to Excel handler
  const handleExportExcel = () => {
    try {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      exportAuditLogsToExcel(filteredLogs, `سجل_عمليات_كارجاس_${dateStr}.xlsx`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تصدير السجل');
    }
  };

  // Helper for action badge styling
  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'confirm':
      case 'bulk_confirm':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          iconColor: 'text-emerald-700',
          label: action === 'bulk_confirm' ? 'مطابقة مجمعة' : 'تأكيد ومطابقة'
        };
      case 'update':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: ArrowLeftRight,
          iconColor: 'text-blue-700',
          label: 'تعديل بيانات'
        };
      case 'create':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: PlusCircle,
          iconColor: 'text-teal-700',
          label: 'إضافة أصل'
        };
      case 'bulk_import':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: FileSpreadsheet,
          iconColor: 'text-indigo-700',
          label: 'استيراد Excel'
        };
      case 'delete':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: Trash2,
          iconColor: 'text-rose-700',
          label: 'حذف أصل'
        };
      case 'unconfirm':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: RotateCcw,
          iconColor: 'text-amber-700',
          label: 'إلغاء مطابقة'
        };
      case 'qr_generated':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: QrCode,
          iconColor: 'text-purple-700',
          label: 'توليد كود QR'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: Activity,
          iconColor: 'text-slate-600',
          label: 'عملية نظام'
        };
    }
  };

  // Unique list of user names for filter
  const userOptions = useMemo(() => {
    const names = Array.from(new Set(auditLogs.map(l => l.user_name))).filter(Boolean);
    return names;
  }, [auditLogs]);

  // Unique list of station names for filter
  const stationOptions = useMemo(() => {
    const list = Array.from(new Set(auditLogs.map(l => l.station_name))).filter(Boolean) as string[];
    // Also add known stations from stations list
    stations.forEach(s => {
      if (!list.includes(s.name)) list.push(s.name);
    });
    return list;
  }, [auditLogs, stations]);

  return (
    <div className="space-y-6" id="audit-log-tab-container">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-800 text-white shadow-2xs">
              <History className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">سجل العمليات والرقابة (Audit Log)</h2>
          </div>
          <p className="text-xs text-slate-500">
            توثيق دقيق لكل عملية تعديل، إضافة، مطابقة، أو حذف تتم على أي أصل، مع حفظ اسم المستخدم والتاريخ والقيم السابقة والجديدة
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="توسيع كافة تفاصيل التعديلات"
          >
            توسيع التفاصيل
          </button>

          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="طي كافة تفاصيل التعديلات"
          >
            طي التفاصيل
          </button>

          <button
            onClick={handleExportExcel}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
              exportSuccess ? 'bg-emerald-700 ring-2 ring-emerald-400' : 'bg-emerald-800 hover:bg-emerald-900'
            }`}
            id="export-audit-excel-btn"
          >
            <Download className="w-4 h-4" />
            <span>{exportSuccess ? 'تم تنزيل ملف Excel ✓' : 'تصدير السجل إلى Excel'}</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="مسح سجل العمليات الحالي"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح السجل</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">إجمالي العمليات</span>
            <Activity className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{metrics.total}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">عملية موثقة</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">تعديلات الأصول</span>
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-800 font-mono">{metrics.updates}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">تعديل بيانات وحقول</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">المطابقة والاعتماد</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-800 font-mono">{metrics.confirms}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">تأكيد أصول بالمحطات</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">إضافات واستيراد</span>
            <PlusCircle className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-teal-800 font-mono">{metrics.creations}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">تسجيل أصول جديدة</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">المستخدمون النشطون</span>
            <User className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-xl font-bold text-slate-800 font-mono">{metrics.uniqueUsers}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">قائم بالعمليات</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الأصل، الكود، المحطة، المستخدم..."
              className="w-full pr-10 pl-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all text-slate-800"
              id="audit-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Type Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-700 font-medium"
              id="audit-action-filter"
            >
              <option value="all">كل أنواع العمليات (الكل)</option>
              <option value="update">تعديل بيانات أصل</option>
              <option value="confirm">تأكيد ومطابقة أصل</option>
              <option value="bulk_confirm">مطابقة مجمعة للأصول</option>
              <option value="create">إضافة أصل جديد</option>
              <option value="bulk_import">استيراد من ملف Excel</option>
              <option value="delete">حذف أصل</option>
              <option value="unconfirm">إلغاء مطابقة أصل</option>
              <option value="qr_generated">توليد أكواد QR</option>
            </select>
          </div>

          {/* Station Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStation}
              onChange={e => setSelectedStation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-700 font-medium"
              id="audit-station-filter"
            >
              <option value="all">جميع المحطات</option>
              {stationOptions.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-700 font-medium"
              id="audit-user-filter"
            >
              <option value="all">جميع المستخدمين</option>
              {userOptions.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="md:col-span-1">
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-700 font-medium"
              id="audit-period-filter"
            >
              <option value="all">كل الأوقات</option>
              <option value="today">اليوم</option>
              <option value="week">آخر 7 أيام</option>
              <option value="month">آخر 30 يوماً</option>
            </select>
          </div>

        </div>

        {/* Results Info Counter */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span>
            يتم عرض <strong className="font-mono text-emerald-800">{filteredLogs.length}</strong> عملية من إجمالي{' '}
            <strong className="font-mono">{auditLogs.length}</strong> مسجلة في النظام
          </span>

          {(searchQuery || selectedAction !== 'all' || selectedStation !== 'all' || selectedUser !== 'all' || selectedPeriod !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAction('all');
                setSelectedStation('all');
                setSelectedUser('all');
                setSelectedPeriod('all');
              }}
              className="text-emerald-800 hover:text-emerald-950 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة تعيين المرشحات</span>
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">لا توجد عمليات مسجلة مطابقة للبحث</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              لم يتم العثور على أي أحداث مسجلة تطابق المرشحات المحددة. جرب تغيير خيارات البحث أو إعادة ضبط المرشحات.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAction('all');
                setSelectedStation('all');
                setSelectedUser('all');
                setSelectedPeriod('all');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إظهار كافة العمليات</span>
            </button>
          </div>
        ) : (
          filteredLogs.map(log => {
            const badge = getActionBadge(log.action_type);
            const Icon = badge.icon;
            const isExpanded = !!expandedLogIds[log.id];
            const hasChanges = log.changes && log.changes.length > 0;

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors"
                id={`audit-row-${log.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left (RTL Start) Section: Icon, Badge, Description */}
                  <div className="flex items-start gap-3.5 flex-1">
                    
                    {/* Action Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
                      <Icon className={`w-5 h-5 ${badge.iconColor}`} />
                    </div>

                    {/* Main Content */}
                    <div className="space-y-1.5 flex-1">
                      
                      {/* Top Row: User + Action Badge + Timestamp */}
                      <div className="flex items-center gap-2 flex-wrap">
                        
                        {/* User Identity */}
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                          <User className="w-3.5 h-3.5 text-emerald-800" />
                          <span>{log.user_name}</span>
                        </div>

                        {/* User Role Tag */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          log.user_role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {log.user_role === 'admin' ? 'مدير النظام' : 'مدير محطة'}
                        </span>

                        {/* Action Label Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          {log.action_label}
                        </span>

                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mr-auto">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{log.date_formatted}</span>
                        </div>
                      </div>

                      {/* Description Summary */}
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {log.description}
                      </p>

                      {/* Associated Asset and Station Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {log.asset_code && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            <span className="text-slate-400 font-normal">كود:</span>
                            <span>{log.asset_code}</span>
                          </span>
                        )}

                        {log.asset_name && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-slate-700 bg-slate-100 border border-slate-200">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[220px]">{log.asset_name}</span>
                          </span>
                        )}

                        {log.station_name && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{log.station_name}</span>
                          </span>
                        )}

                        {log.category && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-slate-600 bg-slate-100 border border-slate-200">
                            <span>{log.category}</span>
                          </span>
                        )}

                        {log.notes && (
                          <span className="text-[11px] text-slate-500 italic">
                            ({log.notes})
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Expand/Collapse Changes Button (if changes exist) */}
                  {hasChanges && (
                    <div className="shrink-0 self-end sm:self-center mt-2 sm:mt-0">
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                          isExpanded
                            ? 'bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        id={`toggle-details-btn-${log.id}`}
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isExpanded ? 'إخفاء التعديلات' : `عرض التعديلات (${log.changes!.length})`}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                </div>

                {/* Detailed Field Changes View (when expanded or always if hasChanges) */}
                {hasChanges && isExpanded && (
                  <div className="mt-4 mr-13 pt-3 border-t border-slate-200/80">
                    <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-800" />
                      <span>تفاصيل الحقول المعدلة (مقارنة القيمة السابقة والجديدة):</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {log.changes!.map((chg, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5"
                        >
                          <div className="font-bold text-slate-800 text-[11px] pb-1 border-b border-slate-200/60">
                            {chg.field_label} ({chg.field})
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex-1 bg-rose-50 border border-rose-200/80 rounded-lg p-1.5">
                              <span className="block text-[10px] text-rose-600 font-semibold mb-0.5">القيمة السابقة:</span>
                              <span className="text-rose-900 font-mono break-all">{String(chg.old_value)}</span>
                            </div>

                            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                            <div className="flex-1 bg-emerald-50 border border-emerald-200/80 rounded-lg p-1.5">
                              <span className="block text-[10px] text-emerald-600 font-semibold mb-0.5">القيمة الجديدة:</span>
                              <span className="text-emerald-950 font-bold font-mono break-all">{String(chg.new_value)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 mb-1">هل أنت متأكد من مسح سجل العمليات؟</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                سيتم مسح كافة سجلات العمليات والتعديلات السابقة. هذه الخطوة لا تؤثر على الأصول الفعلية المسجلة بالقاعدة، ولكنها ستفرغ تاريخ التعديلات.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  clearAuditLogs();
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                تأكيد المسح
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
