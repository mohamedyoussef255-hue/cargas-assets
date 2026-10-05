import React, { useState } from 'react';
import { Edit2, Layers, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Category } from '../../types/cargas';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const CategoriesTab: React.FC = () => {
  const { categories, assets, addCategory, updateCategory, deleteCategory } = useCargas();

  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrefix, setNewPrefix] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'manufacturer', 'model_type', 'serial_no', 'condition', 'install_date'
  ]);

  const AVAILABLE_FIELDS = [
    { key: 'manufacturer', label: 'الشركة المصنعة' },
    { key: 'model_type', label: 'الموديل / الطراز' },
    { key: 'serial_no', label: 'الرقم المسلسل' },
    { key: 'screen_sn', label: 'مسلسل الشاشة' },
    { key: 'condition', label: 'الحالة التشغيلية' },
    { key: 'criticality', label: 'بند حرج' },
    { key: 'power_specs', label: 'القدرة والمواصفات' },
    { key: 'capacity_size', label: 'السعة والحجم' },
    { key: 'dimension', label: 'الأبعاد' },
    { key: 'suction', label: 'الضغط (بار)' },
    { key: 'system', label: 'المنظومة' },
    { key: 'equipment_unit', label: 'وحدة المعدة' },
    { key: 'subunit', label: 'الوحدة الفرعية' },
    { key: 'component_maintainable', label: 'مكون قابل للصيانة' },
    { key: 'part', label: 'القطعة' },
    { key: 'install_date', label: 'تاريخ التركيب' },
    { key: 'assigned_to', label: 'العهدة' },
    { key: 'building_no', label: 'المبنى' },
    { key: 'floor_no', label: 'الدور' },
    { key: 'office_no', label: 'المكتب' }
  ];

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newName.trim() || !newPrefix.trim()) return;

    addCategory({
      key: newKey.trim().toLowerCase().replace(/\s+/g, '_'),
      name: newName.trim(),
      prefix: newPrefix.trim().toUpperCase(),
      icon: 'Layers',
      sort_order: categories.length + 1,
      active_fields: selectedFields
    });

    setIsAdding(false);
    setNewKey('');
    setNewName('');
    setNewPrefix('');
  };

  const toggleField = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey) ? prev.filter(f => f !== fieldKey) : [...prev, fieldKey]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">فئات وتصنيفات الأصول</h2>
          <p className="text-xs text-slate-500">
            تحديد بادئة الكود (Prefix) والحقول النشطة لكل فئة من أصول كارجاس
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فئة جديدة</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const count = assets.filter(a => a.category === cat.name).length;
          return (
            <div
              key={cat.key}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-600/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {cat.prefix}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {count} أصل
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">الحقول المفعّلة:</span>
                  <div className="flex flex-wrap gap-1">
                    {cat.active_fields?.slice(0, 5).map(f => (
                      <span key={f} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {AVAILABLE_FIELDS.find(af => af.key === f)?.label || f}
                      </span>
                    ))}
                    {(cat.active_fields?.length || 0) > 5 && (
                      <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                        +{(cat.active_fields?.length || 0) - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 text-[11px]">مفتاح: {cat.key}</span>
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition-colors"
                  title="حذف الفئة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">إضافة فئة أصول جديدة</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفئة بالعربية *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: مولدات كهربائية احتياطية"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بادئة الكود (Prefix) *</label>
                  <input
                    type="text"
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
                    placeholder="مثال: GEN"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border border-slate-300 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المفتاح البرمجي (Key) *</label>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="مثال: generators"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">تحديد الحقول النشطة لهذه الفئة:</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl">
                  {AVAILABLE_FIELDS.map(af => (
                    <label key={af.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(af.key)}
                        onChange={() => toggleField(af.key)}
                        className="rounded text-emerald-700 focus:ring-emerald-500"
                      />
                      <span>{af.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs"
                >
                  إضافة الفئة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory(categoryToDelete.key);
            setCategoryToDelete(null);
          }
        }}
        type="danger"
        title="تأكيد حذف الفئة الرئيسية"
        message={`هل أنت متأكد من رغبتك في حذف فئة "${categoryToDelete?.name}"؟`}
        confirmLabel="تأكيد حذف الفئة"
        cancelLabel="تراجع"
        itemDetails={categoryToDelete ? [
          { label: 'اسم الفئة', value: categoryToDelete.name },
          { label: 'البادئة الكودية', value: categoryToDelete.prefix },
          { label: 'الأصول التابعة لهذه الفئة', value: `${assets.filter(a => a.category === categoryToDelete.name).length} أصل` }
        ] : []}
      />

    </div>
  );
};
