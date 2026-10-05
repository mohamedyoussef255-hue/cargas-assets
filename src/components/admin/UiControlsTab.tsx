import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Columns,
  Eye,
  EyeOff,
  Fuel,
  KeyRound,
  Layout,
  Lock,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Users
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { UiVisibilitySettings } from '../../types/cargas';

export const UiControlsTab: React.FC = () => {
  const {
    uiVisibility,
    updateUiVisibility,
    resetUiVisibility,
    adminPin,
    updateAdminPin,
    addNotification
  } = useCargas();

  const [activeSubTab, setActiveSubTab] = useState<'station' | 'employee' | 'security'>('station');

  // Security PIN state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleToggleStationButton = (key: keyof UiVisibilitySettings['station']['buttons']) => {
    updateUiVisibility(prev => ({
      ...prev,
      station: {
        ...prev.station,
        buttons: {
          ...prev.station.buttons,
          [key]: !prev.station.buttons[key]
        }
      }
    }));
  };

  const handleToggleStationIcon = (key: keyof UiVisibilitySettings['station']['icons']) => {
    updateUiVisibility(prev => ({
      ...prev,
      station: {
        ...prev.station,
        icons: {
          ...prev.station.icons,
          [key]: !prev.station.icons[key]
        }
      }
    }));
  };

  const handleToggleStationText = (key: keyof UiVisibilitySettings['station']['texts']) => {
    updateUiVisibility(prev => ({
      ...prev,
      station: {
        ...prev.station,
        texts: {
          ...prev.station.texts,
          [key]: !prev.station.texts[key]
        }
      }
    }));
  };

  const handleToggleStationField = (key: keyof UiVisibilitySettings['station']['fields']) => {
    updateUiVisibility(prev => ({
      ...prev,
      station: {
        ...prev.station,
        fields: {
          ...prev.station.fields,
          [key]: !prev.station.fields[key]
        }
      }
    }));
  };

  // Employee View Toggles
  const handleToggleEmployeeButton = (key: keyof UiVisibilitySettings['employee']['buttons']) => {
    updateUiVisibility(prev => ({
      ...prev,
      employee: {
        ...prev.employee,
        buttons: {
          ...prev.employee.buttons,
          [key]: !prev.employee.buttons[key]
        }
      }
    }));
  };

  const handleToggleEmployeeIcon = (key: keyof UiVisibilitySettings['employee']['icons']) => {
    updateUiVisibility(prev => ({
      ...prev,
      employee: {
        ...prev.employee,
        icons: {
          ...prev.employee.icons,
          [key]: !prev.employee.icons[key]
        }
      }
    }));
  };

  const handleToggleEmployeeText = (key: keyof UiVisibilitySettings['employee']['texts']) => {
    updateUiVisibility(prev => ({
      ...prev,
      employee: {
        ...prev.employee,
        texts: {
          ...prev.employee.texts,
          [key]: !prev.employee.texts[key]
        }
      }
    }));
  };

  const handleToggleEmployeeField = (key: keyof UiVisibilitySettings['employee']['fields']) => {
    updateUiVisibility(prev => ({
      ...prev,
      employee: {
        ...prev.employee,
        fields: {
          ...prev.employee.fields,
          [key]: !prev.employee.fields[key]
        }
      }
    }));
  };

  const handleShowAllStation = () => {
    updateUiVisibility(prev => ({
      ...prev,
      station: {
        buttons: Object.fromEntries(Object.keys(prev.station.buttons).map(k => [k, true])) as any,
        icons: Object.fromEntries(Object.keys(prev.station.icons).map(k => [k, true])) as any,
        texts: Object.fromEntries(Object.keys(prev.station.texts).map(k => [k, true])) as any,
        fields: Object.fromEntries(Object.keys(prev.station.fields).map(k => [k, true])) as any
      }
    }));
  };

  const handleShowAllEmployee = () => {
    updateUiVisibility(prev => ({
      ...prev,
      employee: {
        buttons: Object.fromEntries(Object.keys(prev.employee.buttons).map(k => [k, true])) as any,
        icons: Object.fromEntries(Object.keys(prev.employee.icons).map(k => [k, true])) as any,
        texts: Object.fromEntries(Object.keys(prev.employee.texts).map(k => [k, true])) as any,
        fields: Object.fromEntries(Object.keys(prev.employee.fields).map(k => [k, true])) as any
      }
    }));
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);

    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinFeedback({ type: 'error', message: 'كلمة المرور الجديدة غير متطابقة مع التأكيد!' });
      return;
    }

    const res = updateAdminPin(currentPinInput, newPinInput);
    if (res.success) {
      setPinFeedback({ type: 'success', message: 'تم تحديث كلمة مرور دخول مدير النظام بنجاح!' });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      addNotification({
        title: 'تحديث كلمة المرور',
        message: 'تم تغيير كلمة مرور مدير النظام المشفرة بنجاح.',
        type: 'success',
        target_role: 'admin',
        date: 'الآن'
      });
    } else {
      setPinFeedback({ type: 'error', message: res.error || 'حدث خطأ أثناء التحديث.' });
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Top Header & Intro */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              التحكم الشامل في واجهات شاشتي المحطة والموظف
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            صلاحية حصرية لـ <strong>مدير النظام: محمد عبد الرحمن</strong> لإظهار وإخفاء كافة الأيقونات، الأزرار، الكلمات، الحقول، والجداول لصفحة الموظف ومدير المحطة.
          </p>
        </div>

        {/* Global Reset */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('هل تريد استعادة الضبط الافتراضي لظهور كافة العناصر في الواجهات؟')) {
              resetUiVisibility();
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الضبط الافتراضي</span>
        </button>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl w-full sm:w-max">
        <button
          type="button"
          onClick={() => setActiveSubTab('station')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'station'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>عناصر صفحة مدير المحطة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('employee')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'employee'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>عناصر صفحة الموظف (المطابقة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'security'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>أمان وكلمة مرور مدير النظام (0000)</span>
        </button>
      </div>

      {/* SUB-TAB 1: STATION MANAGER VIEW CONTROLS */}
      {activeSubTab === 'station' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              التحكم في عناصر شاشة مدير المحطة
            </h3>
            <button
              onClick={handleShowAllStation}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              تفعيل وإظهار كافة عناصر المحطة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. BUTTONS */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>أزرار صفحة مدير المحطة</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { key: 'add_asset', label: 'زر إضافة أصل جديد' },
                  { key: 'whatsapp_task', label: 'زر تكليف الموظف بمطابقة الأصول عبر واتساب' },
                  { key: 'export_excel', label: 'زر تصدير الأصول لملف Excel' },
                  { key: 'import_excel', label: 'زر استيراد أصول المحطة من Excel' },
                  { key: 'print_qr', label: 'زر طباعة أكواد QR والباركود' },
                  { key: 'bulk_confirm', label: 'زر التأكيد الجماعي لكافة الأصول' },
                  { key: 'edit_asset', label: 'زر تعديل الأصل الفردي' },
                  { key: 'delete_asset', label: 'زر حذف الأصل' },
                  { key: 'filter_buttons', label: 'أزرار الفلترة والتصفية (الكل، مطابق، معلق)' },
                  { key: 'chat_button', label: 'زر شات ومحادثة الإدارة' }
                ].map(item => {
                  const isVisible = uiVisibility.station.buttons[item.key as keyof UiVisibilitySettings['station']['buttons']];
                  return (
                    <div key={item.key} className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleStationButton(item.key as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isVisible
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'ظاهر' : 'مخفي'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. ICONS */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>أيقونات صفحة مدير المحطة</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { key: 'category_icons', label: 'أيقونات فئات الأصول والتصنيفات' },
                  { key: 'station_icon', label: 'أيقونة المحطة والوقود CNG' },
                  { key: 'status_icons', label: 'أيقونات علامة الصح والحالة الفنية' },
                  { key: 'action_icons', label: 'الأيقونات المصغرة داخل الأزرار' }
                ].map(item => {
                  const isVisible = uiVisibility.station.icons[item.key as keyof UiVisibilitySettings['station']['icons']];
                  return (
                    <div key={item.key} className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleStationIcon(item.key as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isVisible
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'ظاهر' : 'مخفي'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. TEXTS & WORDS */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>الكلمات والنصوص في صفحة المحطة</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { key: 'stats_cards', label: 'بطاقات الإحصائيات والأرقام (إجمالي، مطابق، متبقي)' },
                  { key: 'station_details_text', label: 'بيانات وتفاصيل عنوان المحطة والمنطقة' },
                  { key: 'help_hints', label: 'النصوص الإرشادية وتلميحات الاستخدام' }
                ].map(item => {
                  const isVisible = uiVisibility.station.texts[item.key as keyof UiVisibilitySettings['station']['texts']];
                  return (
                    <div key={item.key} className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleStationText(item.key as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isVisible
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'ظاهر' : 'مخفي'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. TABLE & FIELDS */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>الجدول والحقول المعروضة</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
                {[
                  { key: 'table_visible', label: 'ظهور جدول الأصول بالكامل' },
                  { key: 'col_asset_code', label: 'حقل كود الأصل' },
                  { key: 'col_asset_name', label: 'حقل اسم الأصل / المعدة' },
                  { key: 'col_category', label: 'حقل الفئة' },
                  { key: 'col_source', label: 'حقل مصدر الأصل المعتمد (دفاتر المالية / حصر)' },
                  { key: 'col_financial_reconciliation', label: 'حقل مطابقة دفاتر المالية والتسوية' },
                  { key: 'col_serial_no', label: 'حقل الرقم المسلسل (S/N)' },
                  { key: 'col_condition', label: 'حقل الحالة الفنية' },
                  { key: 'col_inventory_type', label: 'حقل نوع الحصر' },
                  { key: 'col_financial_book', label: 'حقل الدفتر المالي' },
                  { key: 'col_manufacturer', label: 'حقل المصنع' },
                  { key: 'col_model', label: 'حقل الموديل / النوع' },
                  { key: 'col_quantity', label: 'حقل الكمية' },
                  { key: 'col_notes', label: 'حقل الملاحظات' }
                ].map(item => {
                  const isVisible = uiVisibility.station.fields[item.key as keyof UiVisibilitySettings['station']['fields']];
                  return (
                    <div key={item.key} className="py-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleStationField(item.key as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isVisible
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'ظاهر' : 'مخفي'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: EMPLOYEE MATCHING VIEW CONTROLS */}
      {activeSubTab === 'employee' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              التحكم في عناصر شاشة الموظف (المكلف بمطابقة الأصول)
            </h3>
            <button
              onClick={handleShowAllEmployee}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              تفعيل وإظهار كافة عناصر شاشة الموظف
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Employee Buttons */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>أزرار صفحة الموظف</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { key: 'single_confirm', label: 'زر تأكيد المطابقة الفردي لكل أصل' },
                  { key: 'bulk_confirm', label: 'زر تأكيد مطابقة جميع الأصول دفعة واحدة' },
                  { key: 'refresh', label: 'زر تحديث القائمة' }
                ].map(item => {
                  const isVisible = uiVisibility.employee.buttons[item.key as keyof UiVisibilitySettings['employee']['buttons']];
                  return (
                    <div key={item.key} className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleEmployeeButton(item.key as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isVisible
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'ظاهر' : 'مخفي'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Employee Icons */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>أيقونات صفحة الموظف</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { key: 'check_icons', label: 'أيقونة علامة الصح والتأكيد الخضراء' },
                  { key: 'category_icons', label: 'أيقونات فئات الأصول' },
                  { key: 'status_icons', label: 'أيقونات الحالة الفنية' }
                ].map(item => {
                  const isVisible = uiVisibility.employee.icons[item.key as keyof UiVisibilitySettings['employee']['icons']];
                  return (
                    <div key={item.key} className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleEmployeeIcon(item.key as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isVisible
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'ظاهر' : 'مخفي'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Employee Texts */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>الكلمات والنصوص الإرشادية</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { key: 'task_header', label: 'ترويسة التكليف الرسمي واسم المحطة' },
                  { key: 'instructions', label: 'نص التعليمات والإرشادات الميدانية للموظف' },
                  { key: 'progress_stats', label: 'شريط ونسبة إنجاز المطابقة (التقدم)' }
                ].map(item => {
                  const isVisible = uiVisibility.employee.texts[item.key as keyof UiVisibilitySettings['employee']['texts']];
                  return (
                    <div key={item.key} className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleEmployeeText(item.key as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isVisible
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'ظاهر' : 'مخفي'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Employee Table & Fields */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>جدول وحقول صفحة الموظف</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { key: 'table_visible', label: 'ظهور جدول الأصول' },
                  { key: 'category_top_bar', label: 'شريط الفئات العلوي السريع مع عدد الأصول لكل فئة' },
                  { key: 'search_input', label: 'حقل البحث السريع' },
                  { key: 'filter_category', label: 'فلتر تصنيف الفئات المنسدل' },
                  { key: 'col_asset_code', label: 'حقل كود الأصل' },
                  { key: 'col_asset_name', label: 'حقل اسم الأصل' },
                  { key: 'col_category', label: 'حقل الفئة' },
                  { key: 'col_source', label: 'حقل مصدر الأصل المعتمد (دفاتر المالية / حصر)' },
                  { key: 'col_financial_reconciliation', label: 'حقل مطابقة دفاتر المالية' },
                  { key: 'col_serial_no', label: 'حقل الرقم المسلسل' },
                  { key: 'col_model', label: 'حقل الموديل / الصانع' },
                  { key: 'col_condition', label: 'حقل الحالة الفنية' },
                  { key: 'col_notes', label: 'حقل الملاحظات' }
                ].map(item => {
                  const isVisible = uiVisibility.employee.fields[item.key as keyof UiVisibilitySettings['employee']['fields']];
                  return (
                    <div key={item.key} className="py-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleEmployeeField(item.key as any)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isVisible
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'ظاهر' : 'مخفي'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: SECURITY & ADMIN PIN CHANGE */}
      {activeSubTab === 'security' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تعديل كلمة مرور دخول مدير النظام
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تُطلب كلمة المرور هذه عند الضغط 5 مرات على شعار كارجاس للدخول للوحة الإدارة.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">آلية الدخول السري المشفر:</p>
            <p>1. الضغط 5 مرات متتالية على اللوجو في الشريط العلوي.</p>
            <p>2. إدخال كلمة المرور الحالية (الافتراضية: <strong>0000</strong>).</p>
            <p>3. يتم فتح لوحة الإدارة العامة فوراً بصلاحية <strong>محمد عبد الرحمن (مدير النظام)</strong>.</p>
          </div>

          <form onSubmit={handleSavePin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور الحالية:
              </label>
              <input
                type="password"
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية (الافتراضية: 0000)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور الجديدة:
              </label>
              <input
                type="password"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة (4 خانات فأكثر)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تأكيد كلمة المرور الجديدة:
              </label>
              <input
                type="password"
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {pinFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  pinFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {pinFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Lock className="w-4 h-4 shrink-0" />}
                <span>{pinFeedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!currentPinInput || !newPinInput || !confirmPinInput}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>حفظ وتحديث كلمة مرور مدير النظام</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
