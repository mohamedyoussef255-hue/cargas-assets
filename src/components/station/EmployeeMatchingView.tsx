import React, { useMemo, useState } from 'react';
import {
  Armchair,
  BookOpen,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Cog,
  Filter,
  Fuel,
  Info,
  Layers,
  LayoutGrid,
  Monitor,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  Wrench,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Asset, Station } from '../../types/cargas';

interface EmployeeMatchingViewProps {
  stationId?: string;
  assignedEmployeeName?: string;
  onBackToMain?: () => void;
}

// Icon helper for dynamic categories
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Cog': return Cog;
    case 'ShieldAlert': return ShieldAlert;
    case 'Monitor': return Monitor;
    case 'Wrench': return Wrench;
    case 'Building2': return Building2;
    case 'Camera': return Camera;
    case 'Armchair': return Armchair;
    case 'Package': return Package;
    default: return Tag;
  }
};

export const EmployeeMatchingView: React.FC<EmployeeMatchingViewProps> = ({
  stationId,
  assignedEmployeeName,
  onBackToMain
}) => {
  const {
    assets,
    stations,
    selectedStationId,
    toggleConfirmAsset,
    bulkConfirmAssets,
    uiVisibility,
    categories
  } = useCargas();

  // Read URL query params if not passed directly
  const queryStationId = useMemo(() => {
    if (stationId) return stationId;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('station') || urlParams.get('match') || selectedStationId || 'st-1';
    }
    return selectedStationId || 'st-1';
  }, [stationId, selectedStationId]);

  const queryEmpName = useMemo(() => {
    if (assignedEmployeeName) return assignedEmployeeName;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('emp') || urlParams.get('employee') || '';
    }
    return '';
  }, [assignedEmployeeName]);

  const currentStation: Station = stations.find(
    s => s.id === queryStationId || s.code === queryStationId
  ) || stations[0] || {
    id: 'st-1',
    name: 'محطة ألماظة',
    code: 'ALM',
    region: 'شرق',
    governorate: 'القاهرة'
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Settings controlled exclusively by System Manager (Mohamed Abdelrahman)
  const empUi = uiVisibility.employee;

  // Station assets
  const stationAssets = useMemo(() => {
    return assets.filter(a => a.station_id === currentStation.id);
  }, [assets, currentStation.id]);

  // Fast category counts for this specific station
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of stationAssets) {
      if (a.category) {
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    }
    return counts;
  }, [stationAssets]);

  const confirmedCount = useMemo(() => stationAssets.filter(a => a.confirmed).length, [stationAssets]);
  const pendingCount = stationAssets.length - confirmedCount;
  const progressPercent = stationAssets.length > 0 ? Math.round((confirmedCount / stationAssets.length) * 100) : 0;

  // Filtered assets
  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return stationAssets.filter(a => {
      if (categoryFilter && a.category !== categoryFilter) return false;
      if (statusFilter === 'confirmed' && !a.confirmed) return false;
      if (statusFilter === 'pending' && a.confirmed) return false;

      if (q) {
        const matchName = String(a.asset_name || '').toLowerCase().includes(q);
        const matchCode = String(a.asset_code || '').toLowerCase().includes(q);
        const matchSerial = String(a.serial_no || '').toLowerCase().includes(q);
        const matchModel = String(a.model_type || '').toLowerCase().includes(q);
        const matchBook = String(a.financial_book || '').toLowerCase().includes(q);
        const matchSource = String(a.source || '').toLowerCase().includes(q);
        return matchName || matchCode || matchSerial || matchModel || matchBook || matchSource;
      }
      return true;
    });
  }, [stationAssets, categoryFilter, statusFilter, searchQuery]);

  const handleConfirmAsset = (asset: Asset) => {
    const confirmer = queryEmpName ? `الموظف: ${queryEmpName}` : 'موظف المحطة (مطابقة ميدانية)';
    toggleConfirmAsset(asset.id, confirmer);

    setSuccessToast(`تم تأكيد مطابقة الأصل (${asset.asset_code}) وحُفظت فوراً بالمنظومة.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleBulkConfirmAll = () => {
    const unconfirmed = stationAssets.filter(a => !a.confirmed);
    if (unconfirmed.length === 0) return;
    const confirmer = queryEmpName ? `الموظف: ${queryEmpName}` : 'موظف المحطة (مطابقة ميدانية)';
    bulkConfirmAssets(unconfirmed.map(a => a.id), confirmer);
    setSuccessToast(`تم تأكيد مطابقة كافة أصول المحطة (${unconfirmed.length} أصل) بنجاح!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-right" dir="rtl">
      
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Task Header Box (Controlled by System Manager) */}
      {empUi.texts.task_header && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                  تكليف مطابقة وحصر أصول ميداني
                </span>
                <span className="text-xs text-emerald-200/80">كود المحطة: {currentStation.code}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Fuel className="w-6 h-6 text-emerald-300" />
                <span>{currentStation.name}</span>
              </h1>

              {queryEmpName && (
                <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>الموظف المكلف بالمطابقة: <strong>{queryEmpName}</strong></span>
                </p>
              )}
            </div>

            {/* Quick Bulk Action Button */}
            {empUi.buttons.bulk_confirm && pendingCount > 0 && (
              <button
                type="button"
                onClick={handleBulkConfirmAll}
                className="py-2.5 px-4 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                <span>تأكيد مطابقة جميع الأصول المتبقية ({pendingCount})</span>
              </button>
            )}
          </div>

          {/* Instructions Text (Controlled by System Manager) */}
          {empUi.texts.instructions && (
            <div className="mt-4 pt-4 border-t border-emerald-700/60 text-xs text-emerald-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <span>
                <strong>تعليمات المطابقة الميدانية:</strong> اختر الفئة من الشريط العلوي لاستعراض أصولها بمحطتك، ثم راجع بيانات كل أصل واضغط على "تأكيد المطابقة" لتسجيل وجود الأصل ومطابقته بدفاتر المالية وسجلات الحصر. التحديث فوري لدى مدير المحطة ومدير النظام.
              </span>
            </div>
          )}

          {/* Progress Stats Bar (Controlled by System Manager) */}
          {empUi.texts.progress_stats && (
            <div className="mt-4 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/50">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span>نسبة إنجاز المطابقة للمحطة:</span>
                <span className="text-emerald-300 font-mono">{progressPercent}% ({confirmedCount} من {stationAssets.length} مطابق)</span>
              </div>
              <div className="w-full h-2.5 bg-emerald-950/60 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-l from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOP CATEGORY BAR (شريط علوي لاختيار الفئة) - Controlled by System Manager */}
      {empUi.fields.category_top_bar !== false && (
        <div className="mb-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>شريط فئات الأصول بالمحطة:</span>
              <span className="text-[11px] font-normal text-slate-400">(اختر فئة لعرض بياناتها الميدانية لتلك المحطة)</span>
            </div>
            {categoryFilter && (
              <button
                onClick={() => setCategoryFilter('')}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>عرض كافة الفئات</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Horizontal Slider / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {/* All Categories Pill */}
            <button
              type="button"
              onClick={() => setCategoryFilter('')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === ''
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>كافة الفئات</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                categoryFilter === ''
                  ? 'bg-emerald-900/60 text-emerald-100'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {stationAssets.length}
              </span>
            </button>

            {/* Individual Categories Pills */}
            {categories.map(cat => {
              const IconComp = getCategoryIcon(cat.icon);
              const count = categoryCounts[cat.name] || 0;
              const isSelected = categoryFilter === cat.name;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategoryFilter(isSelected ? '' : cat.name)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title={`${cat.name} (${count} أصل بالمحطة)`}
                >
                  {empUi.icons.category_icons && <IconComp className="w-4 h-4 shrink-0" />}
                  <span>{cat.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-emerald-900/60 text-emerald-100'
                      : count > 0
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Status Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input (Controlled by System Manager) */}
        {empUi.fields.search_input && (
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الأصل، الكود، السيريال، الموديل، الدفتر المالي..."
              className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الكل ({filteredAssets.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            بانتظار المطابقة ({filteredAssets.filter(a => !a.confirmed).length})
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'confirmed'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            تمت المطابقة ({filteredAssets.filter(a => a.confirmed).length})
          </button>
        </div>
      </div>

      {/* Table of Assets (Controlled by System Manager) */}
      {empUi.fields.table_visible ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                <tr>
                  <th className="py-3 px-4">م</th>
                  {empUi.fields.col_asset_code && <th className="py-3 px-4">كود الأصل</th>}
                  {empUi.fields.col_asset_name && <th className="py-3 px-4">اسم الأصل / المعدة</th>}
                  {empUi.fields.col_category && <th className="py-3 px-4">الفئة</th>}
                  {empUi.fields.col_source !== false && <th className="py-3 px-4">مصدر الأصل المعتمد</th>}
                  {empUi.fields.col_financial_reconciliation !== false && <th className="py-3 px-4">مطابقة دفاتر المالية</th>}
                  {empUi.fields.col_serial_no && <th className="py-3 px-4">الرقم المسلسل</th>}
                  {empUi.fields.col_model && <th className="py-3 px-4">الموديل / الصانع</th>}
                  {empUi.fields.col_condition && <th className="py-3 px-4">الحالة الفنية</th>}
                  {empUi.fields.col_notes && <th className="py-3 px-4">ملاحظات</th>}
                  <th className="py-3 px-4 text-center">إجراء المطابقة</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="font-bold text-slate-600 dark:text-slate-300">لا توجد أصول مسجلة تطابق الفئة والبحث المحددين لتلك المحطة</p>
                        {categoryFilter && (
                          <button
                            onClick={() => setCategoryFilter('')}
                            className="mt-1 text-xs text-emerald-600 font-bold hover:underline"
                          >
                            عرض كافة الفئات ({stationAssets.length} أصل)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset, index) => {
                    const src = asset.source || 'دفاتر المالية (المصدر المعتمد)';
                    const isFin = src.includes('دفاتر المالية') || src.includes('المالية');
                    const is2026 = src.includes('2026');
                    const is2025 = src.includes('2025');
                    const is2023 = src.includes('2023');

                    const recStatus = asset.financial_reconciliation || (asset.confirmed ? 'مطابق ومعتمد بدفاتر المالية' : 'مقيد بالدفاتر وبانتظار المطابقة');

                    return (
                      <tr
                        key={asset.id}
                        className={`transition-colors ${
                          asset.confirmed
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{index + 1}</td>

                        {empUi.fields.col_asset_code && (
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                              {asset.asset_code}
                            </span>
                          </td>
                        )}

                        {empUi.fields.col_asset_name && (
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <div>{asset.asset_name}</div>
                            {asset.financial_book && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <BookOpen className="w-3 h-3 text-slate-400" />
                                <span>{asset.financial_book}</span>
                              </div>
                            )}
                          </td>
                        )}

                        {empUi.fields.col_category && (
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {asset.category}
                            </span>
                          </td>
                        )}

                        {/* Master Source Badge */}
                        {empUi.fields.col_source !== false && (
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isFin
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                : is2026
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                : is2025
                                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700'
                                : is2023
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`} title={src}>
                              <span>{src}</span>
                            </span>
                          </td>
                        )}

                        {/* Financial Book Reconciliation */}
                        {empUi.fields.col_financial_reconciliation !== false && (
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              recStatus.includes('مطابق') || recStatus.includes('معتمد')
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : recStatus.includes('غير مقيد')
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}>
                              <span>{recStatus}</span>
                            </span>
                          </td>
                        )}

                        {empUi.fields.col_serial_no && (
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]" dir="ltr">
                            {asset.serial_no || '-'}
                          </td>
                        )}

                        {empUi.fields.col_model && (
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {asset.model_type || asset.manufacturer || '-'}
                          </td>
                        )}

                        {empUi.fields.col_condition && (
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              asset.condition === 'ممتازة' || asset.condition === 'جيدة'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {asset.condition || 'غير محدد'}
                            </span>
                          </td>
                        )}

                        {empUi.fields.col_notes && (
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                            {asset.notes || '-'}
                          </td>
                        )}

                        {/* Confirmation Action Button */}
                        <td className="py-3 px-4 text-center">
                          {empUi.buttons.single_confirm && (
                            <button
                              type="button"
                              onClick={() => handleConfirmAsset(asset)}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer ${
                                asset.confirmed
                                  ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                              }`}
                              title={asset.confirmed ? 'الأصل مؤكد ومطابق، اضغط للإلغاء إن لزم' : 'تأكيد مطابقة الأصل ميدانياً'}
                            >
                              {asset.confirmed ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>تمت المطابقة</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>تأكيد المطابقة</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
          تم إخفاء عرض الجدول مؤقتاً بتوجيه من مدير النظام.
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
        <p>منظومة مطابقة وحصر أصول شركة كارجاس © {new Date().getFullYear()}</p>
        <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>تزامن مباشر وفوري مع شاشات الإدارة والمحطة</span>
        </p>
      </div>

    </div>
  );
};

