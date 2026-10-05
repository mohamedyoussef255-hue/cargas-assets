import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Columns,
  Download,
  Edit2,
  FileSpreadsheet,
  Filter,
  Layers,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Asset, TableColumn } from '../../types/cargas';
import { exportAssetsToExcel } from '../../utils/excelUtils';
import { AssetModal } from '../asset/AssetModal';
import { QrModal } from '../asset/QrModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ColumnVisibilityPopover } from '../common/ColumnVisibilityPopover';
import { AssetTableCell } from '../common/AssetTableCell';

interface AssetsTabProps {
  onNavigateToColumns?: () => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ onNavigateToColumns }) => {
  const {
    assets,
    stations,
    categories,
    tableColumns,
    deleteAsset,
    toggleConfirmAsset,
    generateMissingQrs,
    currentUser,
    addNotification
  } = useCargas();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedInventoryTypeFilter, setSelectedInventoryTypeFilter] = useState('');
  const [selectedFinancialBookFilter, setSelectedFinancialBookFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'new'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Modals
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [qrFeedback, setQrFeedback] = useState<string | null>(null);

  // Active columns sorted by sort_order
  const activeColumns = useMemo(() => {
    return [...tableColumns]
      .filter(col => col.active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [tableColumns]);

  // Collect unique inventory types and financial books for quick filter
  const uniqueInventoryTypes = useMemo(() => {
    return Array.from(
      new Set(assets.map(a => (typeof a?.inventory_type === 'string' ? a.inventory_type.trim() : '')).filter(Boolean))
    );
  }, [assets]);

  const uniqueFinancialBooks = useMemo(() => {
    return Array.from(
      new Set(assets.map(a => (typeof a?.financial_book === 'string' ? a.financial_book.trim() : '')).filter(Boolean))
    );
  }, [assets]);

  // Fast category counts map
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of assets) {
      if (a && a.category) {
        map[a.category] = (map[a.category] || 0) + 1;
      }
    }
    return map;
  }, [assets]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedStationFilter,
    selectedCategoryFilter,
    selectedInventoryTypeFilter,
    selectedFinancialBookFilter,
    statusFilter,
    pageSize
  ]);

  // Memoized filter logic
  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return assets.filter(a => {
      if (!a) return false;
      if (selectedStationFilter && a.station_id !== selectedStationFilter) return false;
      if (selectedCategoryFilter && a.category !== selectedCategoryFilter) return false;
      if (selectedInventoryTypeFilter && a.inventory_type !== selectedInventoryTypeFilter) return false;
      if (selectedFinancialBookFilter && a.financial_book !== selectedFinancialBookFilter) return false;

      if (statusFilter === 'confirmed' && !a.confirmed) return false;
      if (statusFilter === 'pending' && a.confirmed) return false;
      if (statusFilter === 'new' && !a.is_new) return false;

      if (q) {
        const matchName = String(a.asset_name || '').toLowerCase().includes(q);
        const matchCode = String(a.asset_code || '').toLowerCase().includes(q);
        const matchSerial = String(a.serial_no || '').toLowerCase().includes(q);
        const matchManufacturer = String(a.manufacturer || '').toLowerCase().includes(q);
        const matchInvType = String(a.inventory_type || '').toLowerCase().includes(q);
        const matchFinBook = String(a.financial_book || '').toLowerCase().includes(q);
        const matchStation = String(a.station_name || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchSerial && !matchManufacturer && !matchInvType && !matchFinBook && !matchStation) {
          return false;
        }
      }

      return true;
    });
  }, [
    assets,
    selectedStationFilter,
    selectedCategoryFilter,
    selectedInventoryTypeFilter,
    selectedFinancialBookFilter,
    statusFilter,
    searchQuery
  ]);

  // Pagination calculation
  const totalItems = filteredAssets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedAssets = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredAssets.slice(startIndex, startIndex + pageSize);
  }, [filteredAssets, safeCurrentPage, pageSize]);

  const handleExport = () => {
    exportAssetsToExcel(filteredAssets, 'أصول_كارجاس_المفلترة.xlsx');
  };

  const handleGenerateQrs = () => {
    const count = generateMissingQrs();
    if (count > 0) {
      const msg = `تم توليد ${count} كود QR للأصول التي لم تكن تمتلك كوداً بنجاح!`;
      setQrFeedback(msg);
      addNotification({
        title: 'توليد أكواد QR',
        message: msg,
        type: 'success',
        date: 'الآن'
      });
      setTimeout(() => setQrFeedback(null), 4000);
    } else {
      const msg = 'جميع الأصول تمتلك أكواد QR بالفعل ولا توجد أصول ناقصة.';
      setQrFeedback(msg);
      setTimeout(() => setQrFeedback(null), 4000);
    }
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target);
      setJumpPageInput('');
    }
  };

  return (
    <div className="space-y-5">
      
      {/* QR Code Action Feedback */}
      {qrFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <span>{qrFeedback}</span>
          <button
            onClick={() => setQrFeedback(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 text-xs font-bold"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Top Controls & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        
        {/* Left: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddingAsset(true)}
            id="add-asset-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أصل جديد (أو لمجموعة محطات)</span>
          </button>

          {/* If user is not system manager, or if Excel export is enabled */}
          {currentUser.role !== 'system_manager' && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200/70 dark:border-slate-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>تصدير Excel ({filteredAssets.length})</span>
            </button>
          )}

          <button
            onClick={handleGenerateQrs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200/70 dark:border-slate-700"
          >
            <QrCode className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>توليد QR المفقودة</span>
          </button>

          {onNavigateToColumns && (
            <button
              onClick={onNavigateToColumns}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200/70 dark:border-slate-700"
              title="تعديل وترتيب وإخفاء أعمدة الجداول"
            >
              <Columns className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>ترتيب وتخصيص الأعمدة</span>
            </button>
          )}

          {/* Column Quick Toggler & Auto-activator */}
          <ColumnVisibilityPopover currentAssets={assets} />
        </div>

        {/* Right: Search Input */}
        <div className="relative sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الكود أو المسلسل أو نوع الحصر..."
            className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedCategoryFilter === ''
              ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          كل الفئات ({assets.length})
        </button>

        {categories.map(cat => {
          const count = categoryCounts[cat.name] || 0;
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
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Bar: Stations, Inventory Type, Financial Book, Confirmation */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
        
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Station selector */}
          <select
            value={selectedStationFilter}
            onChange={(e) => setSelectedStationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
          >
            <option value="">جميع المحطات ({stations.length})</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          {/* Inventory Type (نوع الحصر) Filter */}
          <select
            value={selectedInventoryTypeFilter}
            onChange={(e) => setSelectedInventoryTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/40 font-bold text-emerald-800 dark:text-emerald-300 focus:outline-none focus:border-emerald-600"
          >
            <option value="">نوع الحصر: الكل</option>
            {uniqueInventoryTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Financial Book (الدفاتر المالية) Filter */}
          <select
            value={selectedFinancialBookFilter}
            onChange={(e) => setSelectedFinancialBookFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/40 font-bold text-blue-800 dark:text-blue-300 focus:outline-none focus:border-blue-600"
          >
            <option value="">الدفاتر المالية: الكل</option>
            {uniqueFinancialBooks.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>

          {(selectedStationFilter || selectedCategoryFilter || selectedInventoryTypeFilter || selectedFinancialBookFilter || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedStationFilter('');
                setSelectedCategoryFilter('');
                setSelectedInventoryTypeFilter('');
                setSelectedFinancialBookFilter('');
                setStatusFilter('all');
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs underline px-1"
            >
              مسح الفلاتر
            </button>
          )}

        </div>

        {/* Confirmation status buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الكل ({assets.length})
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'confirmed' ? 'bg-green-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            مؤكد
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            بانتظار التأكيد
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'new' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            مضاف حديثاً
          </button>
        </div>

      </div>

      {/* Main Asset Table with Dynamic Columns */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                {activeColumns.map(col => (
                  <th key={col.key} className="py-3 px-4 whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="py-3 px-4 text-center whitespace-nowrap">المطابقة والتأكيد</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length + 2} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    لا توجد أصول تطابق شروط البحث أو الفلاتر الحالية.
                  </td>
                </tr>
              ) : (
                paginatedAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Dynamic Columns rendering */}
                    {activeColumns.map(col => (
                      <td key={col.key} className="py-3 px-4 whitespace-nowrap">
                        <AssetTableCell asset={asset} colKey={col.key} />
                      </td>
                    ))}

                    {/* Confirmation Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleConfirmAsset(asset.id, currentUser.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
                          asset.confirmed
                            ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 hover:bg-green-200'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                        }`}
                        title={asset.confirmed ? `مؤكد بواسطة ${asset.confirmed_by || 'مدير المحطة'}` : 'انقر للتأكيد'}
                      >
                        {asset.confirmed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            <span>مؤكد</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>تأكيد الآن</span>
                          </>
                        )}
                      </button>
                      {asset.confirmed && asset.confirmed_at && (
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{asset.confirmed_at}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* QR Sticker modal */}
                        <button
                          onClick={() => setQrAsset(asset)}
                          className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="عرض وطباعة ملصق كود QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Edit asset */}
                        <button
                          onClick={() => setEditingAsset(asset)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="تعديل الأصل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete asset */}
                        <button
                          onClick={() => setAssetToDelete(asset)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="حذف الأصل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalItems > 0 && (
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
                  {Math.min(safeCurrentPage * pageSize, totalItems)}
                </strong>
                {' من إجمالي '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                  {totalItems.toLocaleString('ar-EG')}
                </strong>
                {' أصل'}
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

              {/* Jump to Page input */}
              {totalPages > 5 && (
                <form onSubmit={handleJumpPage} className="flex items-center gap-1 mr-2">
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    placeholder="#"
                    className="w-12 px-1.5 py-1 text-center font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 transition-colors text-xs"
                  >
                    انتقال
                  </button>
                </form>
              )}

            </div>

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
          onClose={() => {
            setIsAddingAsset(false);
            setEditingAsset(null);
          }}
        />
      )}

      {/* Deletion Confirmation Dialog */}
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
        title="تأكيد حذف الأصل نهائياً"
        message={`هل أنت متأكد من رغبتك في حذف الأصل "${assetToDelete?.asset_name}" من منظومة كارجاس؟ هذا الإجراء سيتم توثيقه في سجل الرقابة والعمليات ولا يمكن التراجع عنه.`}
        confirmLabel="تأكيد الحذف النهائي"
        cancelLabel="إلغاء وتراجع"
        itemDetails={assetToDelete ? [
          { label: 'كود الأصل', value: <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{assetToDelete.asset_code}</span> },
          { label: 'اسم الأصل', value: assetToDelete.asset_name },
          { label: 'المحطة الحالية', value: `${assetToDelete.station_name} (${assetToDelete.region})` },
          { label: 'نوع الحصر', value: assetToDelete.inventory_type || 'حصر فعلي' },
          { label: 'الدفاتر المالية', value: assetToDelete.financial_book || 'دفتر أصول عامة' },
          { label: 'الفئة الرئيسية', value: assetToDelete.category },
          { label: 'الرقم المسلسل (S/N)', value: assetToDelete.serial_no || '—' }
        ] : []}
      />

    </div>
  );
};
