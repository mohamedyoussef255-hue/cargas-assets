import React, { useState, useRef, useEffect } from 'react';
import { Columns, Check, Sparkles, Eye, EyeOff, RotateCcw, Search, X } from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Asset } from '../../types/cargas';

interface ColumnVisibilityPopoverProps {
  currentAssets?: Asset[];
  className?: string;
}

export const ColumnVisibilityPopover: React.FC<ColumnVisibilityPopoverProps> = ({
  currentAssets,
  className = ''
}) => {
  const {
    tableColumns,
    toggleColumnActive,
    showAllColumnsWithData,
    showAllColumns,
    hideEmptyColumns,
    resetColumnsToDefault,
    assets
  } = useCargas();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const sampleAssets = currentAssets && currentAssets.length > 0 ? currentAssets : assets;

  // Calculate asset data frequency for each column
  const dataCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (!sampleAssets || sampleAssets.length === 0) return counts;

    for (const col of tableColumns) {
      let count = 0;
      for (const a of sampleAssets) {
        let val: any;
        if (a.custom_data && a.custom_data[col.key] !== undefined) {
          val = a.custom_data[col.key];
        } else {
          val = (a as any)[col.key];
        }
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          count++;
        }
      }
      counts[col.key] = count;
    }
    return counts;
  }, [tableColumns, sampleAssets]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeCount = tableColumns.filter(c => c.active).length;
  const filteredColumns = tableColumns.filter(c =>
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
          isOpen
            ? 'bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-600 dark:border-emerald-600'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
        }`}
        title="تخصيص الأعمدة المعروضة في الجدول"
      >
        <Columns className="w-3.5 h-3.5" />
        <span>الأعمدة المعروضة</span>
        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
          isOpen
            ? 'bg-white/20 text-white'
            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
        }`}>
          {activeCount}/{tableColumns.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Columns className="w-3.5 h-3.5 text-emerald-600" />
                <span>التحكم في أعمدة الجدول</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                تحديد الحقول الظاهرة وحقول ملفات Excel المستوردة
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-1.5 my-2.5">
            <button
              onClick={() => showAllColumnsWithData(sampleAssets)}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors border border-emerald-200/60 dark:border-emerald-800"
              title="تفعيل كل عمود يحتوي على بيانات في الأصول المعروضة"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>إظهار الأعمدة الممتلئة</span>
            </button>
            <button
              onClick={() => hideEmptyColumns(sampleAssets)}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="إخفاء الأعمدة التي لا تحتوي على أي بيانات"
            >
              <EyeOff className="w-3 h-3 text-slate-500" />
              <span>إخفاء الفارغة</span>
            </button>
            <button
              onClick={() => showAllColumns()}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Eye className="w-3 h-3 text-slate-500" />
              <span>إظهار الكل</span>
            </button>
            <button
              onClick={() => resetColumnsToDefault()}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>الافتراضي</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="بحث في الأعمدة والحقول..."
              className="w-full pr-8 pl-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Column Checkboxes List */}
          <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800/50 pr-0.5">
            {filteredColumns.map(col => {
              const count = dataCounts[col.key] || 0;
              const hasData = count > 0;

              return (
                <label
                  key={col.key}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors pt-1.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={col.active}
                      onChange={() => toggleColumnActive(col.key)}
                      className="rounded text-emerald-700 focus:ring-emerald-600 w-3.5 h-3.5 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <div className="text-right">
                      <span className={`text-xs block ${col.active ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {col.label}
                      </span>
                      {col.is_custom && (
                        <span className="inline-block text-[9px] font-bold px-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          حقل مخصص
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    hasData
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {count > 0 ? `${count} أصل` : 'فارغ'}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
            <span>مفعل: {activeCount} من إجمالي {tableColumns.length}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 transition-colors"
            >
              تم
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
