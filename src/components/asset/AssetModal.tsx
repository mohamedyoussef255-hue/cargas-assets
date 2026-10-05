import React, { useEffect, useState } from 'react';
import { Check, CheckSquare, Layers, Plus, Save, Sparkles, Square, X } from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Asset } from '../../types/cargas';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AssetModalProps {
  asset?: Asset | null;
  defaultStationId?: string;
  onClose: () => void;
  onSaved?: (asset: Asset) => void;
}

const FIELD_LABELS: Record<string, string> = {
  asset_code: 'كود الأصل',
  asset_name: 'اسم الأصل',
  category: 'الفئة الرئيسية',
  station_name: 'المحطة',
  inventory_type: 'نوع الحصر',
  financial_book: 'الدفاتر المالية',
  condition: 'الحالة الفنية',
  quantity: 'الكمية',
  criticality: 'بند حرج',
  manufacturer: 'الشركة المصنعة',
  model_type: 'الموديل / النوع',
  serial_no: 'الرقم المسلسل (S/N)',
  install_date: 'تاريخ التركيب والتشغيل',
  system: 'السيستم / المنظومة',
  equipment_unit: 'وحدة المعدة',
  subunit: 'الوحدة الفرعية',
  power_specs: 'القدرة / المواصفات الفنية',
  capacity_size: 'السعة / الحجم',
  dimension: 'الأبعاد',
  suction: 'الضغط (بار)',
  cost_center: 'مركز التكلفة',
  source: 'المصدر / المورد',
  assigned_to: 'عهدة المسؤول',
  building_no: 'المبنى',
  floor_no: 'الدور',
  office_no: 'الغرفة / المكتب',
  notes: 'الملاحظات'
};

const INVENTORY_TYPE_OPTIONS = [
  'حصر فعلي وميداني',
  'حصر دفتري ومحاسبي',
  'مطابق ومفحوص',
  'أصول قيد الفحص والإحلال',
  'حصر سنوي دوري',
  'أصول تشغيلية'
];

const FINANCIAL_BOOK_OPTIONS = [
  'دفتر وسائل ومعدات الإطفاء والسلامة',
  'دفتر الآلات والمعدات الميكانيكية',
  'دفتر أجهزة ومعدات الغاز والمحطات',
  'دفتر الحواسب والطابعات ومعدات الاتصال',
  'دفتر العدد والأدوات اليدوية',
  'دفتر المباني والإنشاءات والتجهيزات',
  'دفتر الأصول الثابتة العام',
  'دفتر وسائل النقل والسيارات'
];

export const AssetModal: React.FC<AssetModalProps> = ({
  asset,
  defaultStationId,
  onClose,
  onSaved
}) => {
  const {
    stations,
    categories,
    tableColumns,
    addAsset,
    addAssetsForStations,
    updateAsset,
    getNextAssetCode,
    currentUser
  } = useCargas();

  const isEditing = !!asset;
  const initialCategory = asset?.category || categories[0]?.name || 'الالات والمعدات';
  const initialCatObj = categories.find(c => c.name === initialCategory) || categories[0];

  // Station assignment mode: 'single' or 'multiple'
  const [stationMode, setStationMode] = useState<'single' | 'multiple'>('single');
  const [selectedStationId, setSelectedStationId] = useState<string>(
    asset?.station_id || defaultStationId || stations[0]?.id || ''
  );
  const [selectedStationIds, setSelectedStationIds] = useState<string[]>(
    asset?.station_id ? [asset.station_id] : (defaultStationId ? [defaultStationId] : [stations[0]?.id || ''])
  );
  const [stationSearchFilter, setStationSearchFilter] = useState('');

  const [categoryName, setCategoryName] = useState<string>(initialCategory);
  const [assetCode, setAssetCode] = useState<string>(
    asset?.asset_code || getNextAssetCode(initialCatObj.key)
  );
  const [assetName, setAssetName] = useState<string>(asset?.asset_name || '');

  // Confirmation modal state for major/minor modifications
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<Omit<Asset, 'id' | 'created_at'> | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{ field_label: string; old_value: any; new_value: any }[]>([]);
  
  // Dynamic fields including inventory_type and financial_book
  const [formData, setFormData] = useState<Record<string, any>>({
    inventory_type: asset?.inventory_type || 'حصر فعلي وميداني',
    financial_book: asset?.financial_book || (
      initialCategory.includes('إطفاء') ? 'دفتر وسائل ومعدات الإطفاء والسلامة' :
      initialCategory.includes('حاسبات') ? 'دفتر الحواسب والطابعات ومعدات الاتصال' :
      initialCategory.includes('مباني') ? 'دفتر المباني والإنشاءات والتجهيزات' :
      initialCategory.includes('عدد') ? 'دفتر العدد والأدوات اليدوية' :
      'دفتر الآلات والمعدات الميكانيكية'
    ),
    quantity: asset?.quantity || 1,
    manufacturer: asset?.manufacturer || '',
    model_type: asset?.model_type || '',
    serial_no: asset?.serial_no || '',
    condition: asset?.condition || 'جيدة',
    criticality: asset?.criticality || 'لا',
    power_specs: asset?.power_specs || '',
    capacity_size: asset?.capacity_size || '',
    dimension: asset?.dimension || '',
    suction: asset?.suction || '',
    system: asset?.system || '',
    equipment_unit: asset?.equipment_unit || '',
    subunit: asset?.subunit || '',
    component_maintainable: asset?.component_maintainable || '',
    part: asset?.part || '',
    install_date: asset?.install_date || new Date().toISOString().split('T')[0],
    assigned_to: asset?.assigned_to || '',
    screen_sn: asset?.screen_sn || '',
    building_no: asset?.building_no || '',
    floor_no: asset?.floor_no || '',
    office_no: asset?.office_no || '',
    cost_center: asset?.cost_center || '',
    source: asset?.source || '',
    old_description: asset?.old_description || '',
    notes: asset?.notes || ''
  });

  const selectedCategoryObj = categories.find(c => c.name === categoryName) || categories[0];
  const selectedStationObj = stations.find(s => s.id === selectedStationId) || stations[0];

  // If creating new asset and category changes, auto-suggest new code
  const handleCategoryChange = (newCatName: string) => {
    setCategoryName(newCatName);
    if (!isEditing) {
      const catObj = categories.find(c => c.name === newCatName);
      if (catObj) {
        setAssetCode(getNextAssetCode(catObj.key));
      }
      // Suggest default financial book based on category
      if (newCatName.includes('إطفاء')) {
        setFormData(prev => ({ ...prev, financial_book: 'دفتر وسائل ومعدات الإطفاء والسلامة' }));
      } else if (newCatName.includes('حاسبات')) {
        setFormData(prev => ({ ...prev, financial_book: 'دفتر الحواسب والطابعات ومعدات الاتصال' }));
      } else if (newCatName.includes('مباني')) {
        setFormData(prev => ({ ...prev, financial_book: 'دفتر المباني والإنشاءات والتجهيزات' }));
      } else if (newCatName.includes('عدد')) {
        setFormData(prev => ({ ...prev, financial_book: 'دفتر العدد والأدوات اليدوية' }));
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleStationSelection = (stId: string) => {
    setSelectedStationIds(prev => {
      if (prev.includes(stId)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(id => id !== stId);
      } else {
        return [...prev, stId];
      }
    });
  };

  const handleSelectAllStations = () => {
    if (selectedStationIds.length === stations.length) {
      setSelectedStationIds([stations[0]?.id || '']);
    } else {
      setSelectedStationIds(stations.map(s => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetName.trim()) {
      alert('يرجى إدخال اسم الأصل');
      return;
    }

    if (!assetCode.trim()) {
      alert('يرجى إدخال كود الأصل');
      return;
    }

    if (!isEditing && stationMode === 'multiple') {
      if (selectedStationIds.length === 0) {
        alert('يرجى اختيار محطة واحدة على الأقل');
        return;
      }

      const commonData = {
        asset_code: assetCode.trim(),
        asset_name: assetName.trim(),
        category: categoryName,
        confirmed: false,
        is_new: true,
        ...formData
      };

      const createdList = addAssetsForStations(commonData, selectedStationIds);
      if (createdList.length > 0 && onSaved) {
        onSaved(createdList[0]);
      }
      onClose();
      return;
    }

    const payload: Omit<Asset, 'id' | 'created_at'> = {
      asset_code: assetCode.trim(),
      asset_name: assetName.trim(),
      category: categoryName,
      station_id: selectedStationObj.id,
      station_name: selectedStationObj.name,
      region: selectedStationObj.region,
      governorate: selectedStationObj.governorate,
      confirmed: asset ? asset.confirmed : false,
      confirmed_at: asset ? asset.confirmed_at : undefined,
      confirmed_by: asset ? asset.confirmed_by : undefined,
      is_new: !asset,
      ...formData
    };

    if (isEditing && asset) {
      // Calculate changes
      const changes: { field_label: string; old_value: any; new_value: any }[] = [];
      const keysToCheck = [
        'asset_code', 'asset_name', 'category', 'station_name', 'inventory_type', 'financial_book', 'quantity',
        'manufacturer', 'model_type', 'serial_no', 'condition', 'criticality',
        'system', 'equipment_unit', 'subunit', 'power_specs', 'capacity_size',
        'dimension', 'suction', 'install_date', 'cost_center', 'source',
        'assigned_to', 'building_no', 'floor_no', 'office_no', 'notes'
      ];

      keysToCheck.forEach(key => {
        const oldVal = (asset as any)[key] ?? '';
        const newVal = (payload as any)[key] ?? '';
        if (String(oldVal).trim() !== String(newVal).trim()) {
          const label = FIELD_LABELS[key] || key;
          changes.push({
            field_label: label,
            old_value: oldVal || '— (فارغ)',
            new_value: newVal || '— (فارغ)'
          });
        }
      });

      if (changes.length > 0) {
        setPendingPayload(payload);
        setPendingChanges(changes);
        setShowConfirmModal(true);
        return;
      } else {
        // No changes made, simply close
        onClose();
        return;
      }
    } else {
      const created = addAsset(payload);
      onSaved && onSaved(created);
      onClose();
    }
  };

  const handleConfirmSave = () => {
    if (!asset || !pendingPayload) return;
    updateAsset(asset.id, pendingPayload);
    onSaved && onSaved({ ...asset, ...pendingPayload });
    setShowConfirmModal(false);
    onClose();
  };

  // Helper to determine if field is active for current category
  const activeFields = selectedCategoryObj.active_fields || [];
  const shouldShowField = (key: string) => {
    if (['quantity', 'old_description', 'cost_center', 'source', 'notes'].includes(key)) return true;
    return activeFields.includes(key);
  };

  const filteredStations = stations.filter(s =>
    s.name.toLowerCase().includes(stationSearchFilter.toLowerCase()) ||
    s.region.toLowerCase().includes(stationSearchFilter.toLowerCase()) ||
    s.governorate.toLowerCase().includes(stationSearchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-800 dark:bg-emerald-950 text-white">
          <div className="text-right">
            <h2 className="text-base font-bold">
              {isEditing ? `تعديل أصل: ${asset.asset_code}` : 'إضافة أصل وتصنيفه للمحطات'}
            </h2>
            <p className="text-xs text-emerald-200">
              {isEditing 
                ? `${selectedStationObj?.name} - ${selectedStationObj?.region}`
                : (stationMode === 'multiple' 
                    ? `تسكين الأصل على (${selectedStationIds.length}) محطة` 
                    : `${selectedStationObj?.name} - ${selectedStationObj?.region}`)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          
          {/* Top Section: Category & Station mode */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  فئة الأصل الرئيسية *
                </label>
                <select
                  value={categoryName}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600"
                >
                  {categories.map(c => (
                    <option key={c.key} value={c.name}>{c.name} ({c.prefix})</option>
                  ))}
                </select>
              </div>

              {!isEditing ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    طريقة التسكين على المحطات *
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setStationMode('single')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        stationMode === 'single'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      محطة واحدة
                    </button>
                    <button
                      type="button"
                      onClick={() => setStationMode('multiple')}
                      className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                        stationMode === 'multiple'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>مجموعة محطات</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    المحطة التابع لها الأصل *
                  </label>
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600"
                  >
                    {stations.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ({s.region})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* If adding new asset and single station mode */}
            {!isEditing && stationMode === 'single' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  المحطة المستهدفة *
                </label>
                <select
                  value={selectedStationId}
                  onChange={(e) => {
                    setSelectedStationId(e.target.value);
                    setSelectedStationIds([e.target.value]);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600"
                >
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ({s.governorate || s.region})</option>
                  ))}
                </select>
              </div>
            )}

            {/* If adding new asset and multiple stations mode */}
            {!isEditing && stationMode === 'multiple' && (
              <div className="space-y-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    تحديد المحطات لتوزيع الأصل عليها ({selectedStationIds.length} من {stations.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllStations}
                    className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                  >
                    {selectedStationIds.length === stations.length ? 'إلغاء تحديد الكل' : 'تحديد جميع المحطات'}
                  </button>
                </div>

                <input
                  type="text"
                  value={stationSearchFilter}
                  onChange={(e) => setStationSearchFilter(e.target.value)}
                  placeholder="بحث عن محطة بالاسم أو المحافظة أو المنطقة..."
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600"
                />

                <div className="max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  {filteredStations.map(st => {
                    const isSelected = selectedStationIds.includes(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleStationSelection(st.id)}
                        className={`flex items-center justify-between p-2 rounded-lg text-right text-xs transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <span className="block">{st.name}</span>
                          <span className="text-[10px] text-slate-400">{st.governorate || st.region}</span>
                        </div>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mr-2" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mr-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section: Asset Classification (نوع الحصر & الدفاتر المالية) */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                التصنيف طبقا لنوع الحصر والدفاتر المالية (مطلب رقابي ومحاسبي)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع الحصر *
                </label>
                <select
                  value={formData.inventory_type}
                  onChange={(e) => handleInputChange('inventory_type', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-amber-600"
                >
                  {INVENTORY_TYPE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="حصر مخصص">أخرى (مخصص)</option>
                </select>
                {formData.inventory_type === 'حصر مخصص' && (
                  <input
                    type="text"
                    placeholder="اكتب نوع الحصر هنا..."
                    onChange={(e) => handleInputChange('inventory_type', e.target.value)}
                    className="mt-1.5 w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الدفاتر المالية *
                </label>
                <select
                  value={formData.financial_book}
                  onChange={(e) => handleInputChange('financial_book', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-amber-600"
                >
                  {FINANCIAL_BOOK_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="دفتر مخصص">أخرى (مخصص)</option>
                </select>
                {formData.financial_book === 'دفتر مخصص' && (
                  <input
                    type="text"
                    placeholder="اكتب اسم الدفتر المالي هنا..."
                    onChange={(e) => handleInputChange('financial_book', e.target.value)}
                    className="mt-1.5 w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Asset Identity: Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                كود الأصل {stationMode === 'multiple' ? '(كود الأساس)' : '(QR/Barcode)'} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 text-left"
                  dir="ltr"
                  required
                />
              </div>
              {stationMode === 'multiple' && (
                <p className="text-[10px] text-slate-400 mt-1">
                  سيتم توليد أكواد متسلسلة تلقائياً لكل محطة
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم الأصل / المعدة *
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="مثال: ضاغط غاز سبيس 250 بار أو طفايات حريق بودرة 12 كجم"
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          {/* Dynamic Category-Specific Fields */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              المواصفات الفنية لـ ({categoryName})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {shouldShowField('manufacturer') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">الشركة المصنّعة</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="مثال: Galileo / Bavaria / Dell"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {shouldShowField('model_type') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">الموديل / النوع</label>
                  <input
                    type="text"
                    value={formData.model_type}
                    onChange={(e) => handleInputChange('model_type', e.target.value)}
                    placeholder="مثال: MC-250 / Tornado 12kg"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {shouldShowField('serial_no') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">الرقم المسلسل (S/N)</label>
                  <input
                    type="text"
                    value={formData.serial_no}
                    onChange={(e) => handleInputChange('serial_no', e.target.value)}
                    placeholder="مثال: SN-882194"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              )}

              {shouldShowField('condition') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">الحالة التشغيلية</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="ممتازة">ممتازة</option>
                    <option value="جيدة">جيدة</option>
                    <option value="تحتاج صيانة">تحتاج صيانة</option>
                    <option value="كهنة/تالفة">كهنة/تالفة</option>
                  </select>
                </div>
              )}

              {shouldShowField('quantity') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">الكمية لكل محطة</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {shouldShowField('criticality') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">بند حرج (Critical)</label>
                  <select
                    value={formData.criticality}
                    onChange={(e) => handleInputChange('criticality', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="لا">لا</option>
                    <option value="نعم">نعم (يؤثر على استمرارية المحطة)</option>
                  </select>
                </div>
              )}

              {shouldShowField('capacity_size') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">السعة / الحجم</label>
                  <input
                    type="text"
                    value={formData.capacity_size}
                    onChange={(e) => handleInputChange('capacity_size', e.target.value)}
                    placeholder="مثال: 12 كجم / 1200 Nm³/h"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {shouldShowField('power_specs') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">القدرة / المواصفات</label>
                  <input
                    type="text"
                    value={formData.power_specs}
                    onChange={(e) => handleInputChange('power_specs', e.target.value)}
                    placeholder="مثال: 132 kW / 380V"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {shouldShowField('install_date') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">تاريخ التركيب</label>
                  <input
                    type="date"
                    value={formData.install_date}
                    onChange={(e) => handleInputChange('install_date', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {shouldShowField('assigned_to') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">عهدة المسؤول</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                    placeholder="اسم المسؤول عن العهدة"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

            </div>
          </div>

          {/* General Notes & Description */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">التوصيف السابق بالسجلات</label>
              <input
                type="text"
                value={formData.old_description}
                onChange={(e) => handleInputChange('old_description', e.target.value)}
                placeholder="التوصيف أو الاسم القديم إن وجد في السجلات السابقة"
                className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ملاحظات عامة</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="أي ملاحظات فنية أو فحص هيدروستاتيكي أو تاريخ عمرة"
                className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>
                {isEditing
                  ? 'حفظ التعديلات'
                  : stationMode === 'multiple'
                    ? `إضافة وتوزيع على (${selectedStationIds.length}) محطات`
                    : 'إضافة وتكويد الأصل'}
              </span>
            </button>
          </div>

        </form>

      </div>

      {/* Confirmation Dialog for Major / Minor Edits */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        type="warning"
        title={`تأكيد حفظ التعديلات على الأصل (${asset?.asset_code})`}
        message={`أنت على وشك حفظ تعديلات على بيانات الأصل "${asset?.asset_name}". سيتم توثيق كافة هذه التعديلات في سجل الرقابة والعمليات (Audit Log) متضمنة اسمك وتاريخ التعديل.`}
        confirmLabel="تأكيد واعتماد التعديلات"
        cancelLabel="متابعة التحرير / تراجع"
        changes={pendingChanges}
      />
    </div>
  );
};
