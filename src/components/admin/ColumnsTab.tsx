import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Columns,
  Edit2,
  Eye,
  EyeOff,
  MoveDown,
  MoveUp,
  Plus,
  RotateCcw,
  Search,
  Table as TableIcon,
  Trash2,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { TableColumn } from '../../types/cargas';

export const ColumnsTab: React.FC = () => {
  const {
    tableColumns,
    addColumn,
    updateColumn,
    reorderColumns,
    resetColumnsToDefault,
    deleteColumn
  } = useCargas();

  const [isAdding, setIsAdding] = useState(false);
  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // New column form state
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<TableColumn['type']>('text');

  // Edit column form state
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState<TableColumn['type']>('text');

  // Sorted columns
  const sortedColumns = [...tableColumns].sort((a, b) => a.sort_order - b.sort_order);
  const activeCount = sortedColumns.filter(c => c.active).length;
  const hiddenCount = sortedColumns.length - activeCount;

  const filteredColumns = sortedColumns.filter(col => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return col.label.toLowerCase().includes(q) || col.key.toLowerCase().includes(q);
  });

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCols = [...sortedColumns];
    const temp = newCols[index];
    newCols[index] = newCols[index - 1];
    newCols[index - 1] = temp;
    reorderColumns(newCols);
    showNotification(`تم تقديم العمود "${temp.label}" إلى الترتيب ${index}`);
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedColumns.length - 1) return;
    const newCols = [...sortedColumns];
    const temp = newCols[index];
    newCols[index] = newCols[index + 1];
    newCols[index + 1] = temp;
    reorderColumns(newCols);
    showNotification(`تم تأخير العمود "${temp.label}" إلى الترتيب ${index + 2}`);
  };

  const handleToggleActive = (col: TableColumn) => {
    const nextState = !col.active;
    updateColumn(col.key, { active: nextState });
    showNotification(
      nextState
        ? `تم إظهار العمود "${col.label}" في الجداول`
        : `تم إخفاء العمود "${col.label}" من الجداول`
    );
  };

  const handleShowAll = () => {
    sortedColumns.forEach(c => {
      if (!c.active) updateColumn(c.key, { active: true });
    });
    showNotification('تم إظهار وتفعيل كافة الأعمدة في الجداول');
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل أنت متأكد من استعادة الترتيب والتهيئة الافتراضية لأعمدة جداول كارجاس؟')) {
      resetColumnsToDefault();
      showNotification('تمت استعادة التهيئة والترتيب القياسي للأعمدة بنجاح');
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newLabel.trim()) return;

    const formattedKey = newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (tableColumns.some(c => c.key === formattedKey)) {
      alert('مفتاح العمود (Key) مستخدم بالفعل، يرجى اختيار مفتاح آخر.');
      return;
    }

    addColumn({
      key: formattedKey,
      label: newLabel.trim(),
      type: newType,
      active: true,
      is_custom: true
    });

    setIsAdding(false);
    setNewKey('');
    setNewLabel('');
    showNotification(`تمت إضافة العمود الجديد "${newLabel.trim()}" بنجاح`);
  };

  const handleStartEdit = (col: TableColumn) => {
    setEditingColumn(col);
    setEditLabel(col.label);
    setEditType(col.type);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColumn || !editLabel.trim()) return;

    updateColumn(editingColumn.key, {
      label: editLabel.trim(),
      type: editType
    });

    showNotification(`تم تحديث بيانات العمود "${editLabel.trim()}" بنجاح`);
    setEditingColumn(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {feedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 dark:text-emerald-400 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Stats Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                <Columns className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">التحكم في جداول الأصول والأعمدة</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تعديل مسميات الأعمدة، إظهار أو إخفاء الحقول، وإعادة ترتيب تسلسل الأعمدة في جداول الأصول وشاشات المحطات
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAdding(true)}
              id="btn-add-table-column"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عمود جديد</span>
            </button>

            <button
              onClick={handleShowAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              title="إظهار كافة الأعمدة في الجداول"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>إظهار الكل</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              title="استعادة التهيئة والترتيب القياسي لكارجاس"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>استعادة الافتراضي</span>
            </button>
          </div>

        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">إجمالي الأعمدة</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">{sortedColumns.length}</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">أعمدة مفعّلة ومعروضة</span>
            <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">{activeCount}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">أعمدة مخفية</span>
            <p className="text-xl font-extrabold text-slate-600 dark:text-slate-300 font-mono mt-0.5">{hiddenCount}</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">أعمدة مخصصة إضافية</span>
            <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400 font-mono mt-0.5">
              {sortedColumns.filter(c => c.is_custom).length}
            </p>
          </div>
        </div>

      </div>

      {/* Live Table Header Preview */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200">معاينة حية لتسلسل وترتيب أعمدة الجدول</h3>
          </div>
          <span className="text-[11px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
            {activeCount} أعمدة نشطة
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          الترتيب التالي يمثل تماماً شكل ترويسة الأعمدة كما تظهر لمديري المحطات وفي جداول الأصول:
        </p>

        {/* Scrolling pills of active columns in order */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sortedColumns.filter(c => c.active).map((col, idx) => (
            <div
              key={col.key}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shrink-0"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <span className="font-semibold text-slate-100">{col.label}</span>
              {col.key === 'inventory_type' && (
                <span className="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">حصر</span>
              )}
              {col.key === 'financial_book' && (
                <span className="text-[9px] px-1 rounded bg-blue-950 text-blue-300 border border-blue-800">دفتر</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن اسم أو مفتاح العمود..."
            className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-white"
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

        <span className="text-xs text-slate-500 dark:text-slate-400">
          عرض {filteredColumns.length} من {sortedColumns.length} عمود
        </span>
      </div>

      {/* Columns Control Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4 text-center w-24">ترتيب العمود</th>
                <th className="py-3 px-4">اسم العمود بالعربية</th>
                <th className="py-3 px-4">المفتاح البرمجي (Key)</th>
                <th className="py-3 px-4 text-center">نوع البيانات</th>
                <th className="py-3 px-4 text-center">إظهار / إخفاء</th>
                <th className="py-3 px-4 text-center">التصنيف</th>
                <th className="py-3 px-4 text-center">تعديل وإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredColumns.map((col, index) => {
                const actualIndex = sortedColumns.findIndex(c => c.key === col.key);
                const isFirst = actualIndex === 0;
                const isLast = actualIndex === sortedColumns.length - 1;

                return (
                  <tr
                    key={col.key}
                    className={`transition-colors ${
                      col.active
                        ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                        : 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    
                    {/* Order & Reorder Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleMoveUp(actualIndex)}
                          disabled={isFirst}
                          className={`p-1 rounded-md transition-colors ${
                            isFirst
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title="تحريك للأعلى (تقديم الترتيب)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono font-bold flex items-center justify-center text-xs">
                          {col.sort_order}
                        </span>

                        <button
                          onClick={() => handleMoveDown(actualIndex)}
                          disabled={isLast}
                          className={`p-1 rounded-md transition-colors ${
                            isLast
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title="تحريك للأسفل (تأخير الترتيب)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Arabic Label */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${col.active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {col.label}
                        </span>
                        {col.key === 'inventory_type' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                            نوع الحصر
                          </span>
                        )}
                        {col.key === 'financial_book' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                            الدفاتر المالية
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Key */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {col.key}
                    </td>

                    {/* Data Type */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {col.type}
                      </span>
                    </td>

                    {/* Visibility Toggle Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(col)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          col.active
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                        }`}
                        title={col.active ? 'انقر لإخفاء العمود' : 'انقر لإظهار العمود'}
                      >
                        {col.active ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>مفعّل ومعروض</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>مخفي</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Classification (Standard vs Custom) */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        col.is_custom
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {col.is_custom ? 'مخصص' : 'نظام قياسي'}
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(col)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="تعديل اسم ونوع العمود"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {col.is_custom ? (
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف العمود "${col.label}" نهائياً؟`)) {
                                deleteColumn(col.key);
                                showNotification(`تم حذف العمود "${col.label}"`);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="حذف العمود"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 px-1.5">—</span>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Column Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200 text-right">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">إضافة عمود جديد لجدول الأصول</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم العمود بالعربية *
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="مثال: رقم الضمان أو تاريخ المعايرة"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المفتاح البرمجي بالإنجليزية (Key) *
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="مثال: warranty_number"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">يستخدم داخلياً وفي ملفات التصدير والاستيراد</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع البيانات
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="text">نص (Text)</option>
                  <option value="number">رقم (Number)</option>
                  <option value="date">تاريخ (Date)</option>
                  <option value="select">اختيار من قائمة (Select)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs"
                >
                  حفظ العمود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Column Modal */}
      {editingColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200 text-right">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">تعديل العمود</h3>
                <p className="text-[11px] font-mono text-slate-400">{editingColumn.key}</p>
              </div>
              <button
                onClick={() => setEditingColumn(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم العمود المعروض بالعربية *
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع البيانات
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="text">نص (Text)</option>
                  <option value="number">رقم (Number)</option>
                  <option value="date">تاريخ (Date)</option>
                  <option value="select">اختيار من قائمة (Select)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingColumn(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
