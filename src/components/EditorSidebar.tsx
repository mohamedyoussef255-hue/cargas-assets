import React, { useState } from 'react';
import { ColoringFrameConfig, FontOption, MascotType, HeaderBadgeType, DoodleType, TraceDotStyle } from '../types';
import { ColorPickerInput } from './ColorPickerInput';
import { PRESET_ILLUSTRATIONS } from '../data/illustrations';
import {
  Palette,
  Sliders,
  Type,
  Image as ImageIcon,
  PenTool,
  Bookmark,
  Sparkles,
  Upload,
  RefreshCw,
  Eye,
  Check,
  PlusCircle,
} from 'lucide-react';

interface EditorSidebarProps {
  config: ColoringFrameConfig;
  onChange: (updated: ColoringFrameConfig) => void;
  onApplyPreset: (presetId: string) => void;
  onSaveCustomPreset: () => void;
  onReset: () => void;
}

type TabType = 'presets' | 'borders' | 'text' | 'image' | 'tracing';

const FONT_OPTIONS: { id: FontOption; label: string }[] = [
  { id: 'Fredoka', label: 'Fredoka (طفولي ناعم / Kids Rounded)' },
  { id: 'Marhey', label: 'Marhey (عربي مرح للأطفال / Fun Arabic)' },
  { id: 'Cairo', label: 'Cairo (عربي وإنجليزي واضح / Modern)' },
  { id: 'Tajawal', label: 'Tajawal (عربي أنيق / Clean Arabic)' },
  { id: 'Comic Neue', label: 'Comic Neue (كوميكس كلاسيكي / Comic)' },
  { id: 'Baloo 2', label: 'Baloo 2 (ممتلئ وحيوي / Bubbly)' },
  { id: 'Bubblegum Sans', label: 'Bubblegum Sans (فقاعي كرتوني)' },
  { id: 'Sniglet', label: 'Sniglet (مرح جداً / Playful)' },
  { id: 'Sour Gummy', label: 'Sour Gummy (حيوي ولطيف)' },
];

const THEME_PALETTES = [
  {
    name: 'سماعة الطبيب (Doctor Cyan)',
    border: '#00b4d8',
    bannerBg: '#e0f7fa',
    bannerBgEnd: '#cffafe',
    titleColor: '#0284c7',
  },
  {
    name: 'ساعي البريد (Postman Purple)',
    border: '#a855f7',
    bannerBg: '#f3e8ff',
    bannerBgEnd: '#ede9fe',
    titleColor: '#6b21a8',
  },
  {
    name: 'طبيعة وحديقة (Garden Green)',
    border: '#059669',
    bannerBg: '#ecfdf5',
    bannerBgEnd: '#d1fae5',
    titleColor: '#065f46',
  },
  {
    name: 'فضاء ومغامرة (Space Blue)',
    border: '#3b82f6',
    bannerBg: '#eff6ff',
    bannerBgEnd: '#dbeafe',
    titleColor: '#1e40af',
  },
  {
    name: 'حلوى وزهور (Rose Blossom)',
    border: '#f43f5e',
    bannerBg: '#fff1f2',
    bannerBgEnd: '#ffe4e6',
    titleColor: '#be123c',
  },
  {
    name: 'شمس مشرقة (Sun Amber)',
    border: '#f59e0b',
    bannerBg: '#fffbeb',
    bannerBgEnd: '#fef3c7',
    titleColor: '#b45309',
  },
  {
    name: 'أبيض وأسود للطباعة (Monochrome Ink)',
    border: '#0f172a',
    bannerBg: '#f8fafc',
    bannerBgEnd: '#f1f5f9',
    titleColor: '#0f172a',
  },
];

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  config,
  onChange,
  onApplyPreset,
  onSaveCustomPreset,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('presets');

  // Helper updater
  const update = (updater: (prev: ColoringFrameConfig) => ColoringFrameConfig) => {
    onChange(updater(config));
  };

  const applyThemePalette = (palette: typeof THEME_PALETTES[0]) => {
    update((prev) => ({
      ...prev,
      page: { ...prev.page, outerBorderColor: palette.border },
      header: {
        ...prev.header,
        bannerBg: palette.bannerBg,
        bannerBgEnd: palette.bannerBgEnd,
        bannerBorderColor: palette.border,
        titleColor: palette.titleColor,
        subtitleColor: palette.titleColor,
        mascot: { ...prev.header.mascot, color: palette.border },
        badge: { ...prev.header.badge, borderColor: palette.border, textColor: palette.titleColor },
      },
      mainContent: {
        ...prev.mainContent,
        borderColor: palette.border,
        instructionBorderColor: palette.border,
        instructionTextColor: palette.titleColor,
      },
      bottomSection: {
        ...prev.bottomSection,
        borderColor: palette.border,
        traceHeaderColor: palette.titleColor,
        doodleColor: palette.titleColor,
      },
      footer: {
        ...prev.footer,
        textColor: palette.titleColor,
        lineColor: palette.border,
        iconColor: palette.titleColor,
      },
    }));
  };

  // Upload handler for coloring line art
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        update((prev) => ({
          ...prev,
          mainContent: {
            ...prev.mainContent,
            imageSource: 'upload',
            uploadedImage: result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload handler for colored reference guide
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        update((prev) => ({
          ...prev,
          bottomSection: {
            ...prev.bottomSection,
            referenceImage: result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside
      id="editor-control-panel"
      className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-64px)] shadow-lg z-20"
      dir="rtl"
    >
      {/* Tab Navigation Header */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'presets'
              ? 'bg-white text-cyan-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>القوالب</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('borders')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'borders'
              ? 'bg-white text-cyan-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>الإطارات والألوان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'text'
              ? 'bg-white text-cyan-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>العناوين والخط</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'image'
              ? 'bg-white text-cyan-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>رسمة التلوين</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tracing')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tracing'
              ? 'bg-white text-cyan-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>التتبع والتذييل</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* ================= TAB 1: PRESETS ================= */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>القوالب الجاهزة (مطابقة للصور المرفقة)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                اضغط لتطبيق التنسيق مباشرة وتخصيصه بالكامل
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onApplyPreset('listen-to-my-heart')}
                  className="flex flex-col items-center p-3 rounded-xl border-2 border-cyan-400 bg-cyan-50/50 hover:bg-cyan-100/60 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    💙
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Listen to My Heart
                  </span>
                  <span className="text-[11px] text-cyan-700 font-medium mt-0.5">
                    سماعة الطبيب (الصورة 1)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onApplyPreset('community-helpers')}
                  className="flex flex-col items-center p-3 rounded-xl border-2 border-purple-400 bg-purple-50/50 hover:bg-purple-100/60 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    💜
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Community Helpers
                  </span>
                  <span className="text-[11px] text-purple-700 font-medium mt-0.5">
                    ساعي البريد (الصورة 2)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onApplyPreset('arabic-kindergarten')}
                  className="flex flex-col items-center p-3 rounded-xl border border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100/60 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    🌱
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    تتبع ولون عربي
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    حيوانات الحديقة
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onApplyPreset('space-adventure')}
                  className="flex flex-col items-center p-3 rounded-xl border border-blue-300 bg-blue-50/40 hover:bg-blue-100/60 transition-all text-center group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    🚀
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Space Explorer
                  </span>
                  <span className="text-[11px] text-blue-700 font-medium mt-0.5">
                    رائد الفضاء
                  </span>
                </button>
              </div>
            </div>

            {/* Color themes 1-click */}
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-cyan-600" />
                <span>سمات الألوان الفورية (1-Click Color Schemes)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-2.5">
                تطبيق لوحة ألوان متناسقة بالكامل بلمسة واحدة
              </p>

              <div className="space-y-1.5">
                {THEME_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => applyThemePalette(pal)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-medium"
                  >
                    <span className="text-slate-800 font-semibold">{pal.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full border border-slate-200"
                        style={{ backgroundColor: pal.border }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-slate-200"
                        style={{ backgroundColor: pal.bannerBg }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-slate-200"
                        style={{ backgroundColor: pal.titleColor }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-slate-200 pt-4 flex gap-2">
              <button
                type="button"
                onClick={onSaveCustomPreset}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>حفظ التعديل الحالي كقالب</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="flex items-center justify-center gap-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                title="استعادة الإعدادات الافتراضية"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة ضبط</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: BORDERS & COLORS ================= */}
        {activeTab === 'borders' && (
          <div className="space-y-5">
            {/* Outer Page Border */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                1. إطار الصفحة الخارجي (Outer Frame)
              </h3>

              <ColorPickerInput
                label="لون الإطار الخارجي"
                value={config.page.outerBorderColor}
                onChange={(c) =>
                  update((prev) => ({ ...prev, page: { ...prev.page, outerBorderColor: c } }))
                }
              />

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>سُمك الإطار (Border Width)</span>
                  <span className="font-mono">{config.page.outerBorderWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={config.page.outerBorderWidth}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      page: { ...prev.page, outerBorderWidth: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>انحناء الزوايا (Corner Radius)</span>
                  <span className="font-mono">{config.page.outerBorderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="36"
                  value={config.page.outerBorderRadius}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      page: { ...prev.page, outerBorderRadius: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-600"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={config.page.outerDoubleBorder}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      page: { ...prev.page, outerDoubleBorder: e.target.checked },
                    }))
                  }
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  تأثير إطار مزدوج فاخر (Double Stroke Frame)
                </span>
              </label>
            </div>

            {/* Header Banner Border & BG */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                2. إطار وخلفية بانر الهيدر (Header Banner)
              </h3>

              <ColorPickerInput
                label="لون إطار الهيدر"
                value={config.header.bannerBorderColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    header: { ...prev.header, bannerBorderColor: c },
                  }))
                }
              />

              <ColorPickerInput
                label="لون خلفية البانر (البداية)"
                value={config.header.bannerBg}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    header: { ...prev.header, bannerBg: c },
                  }))
                }
              />

              <ColorPickerInput
                label="لون خلفية البانر (التدرج/النهاية)"
                value={config.header.bannerBgEnd}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    header: { ...prev.header, bannerBgEnd: c },
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span>السُمك</span>
                    <span className="font-mono">{config.header.bannerBorderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={config.header.bannerBorderWidth}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        header: { ...prev.header, bannerBorderWidth: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span>الانحناء</span>
                    <span className="font-mono">{config.header.bannerRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={config.header.bannerRadius}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        header: { ...prev.header, bannerRadius: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-600"
                  />
                </div>
              </div>
            </div>

            {/* Main Box Border & Bottom Box Border */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                3. إطار صندوق رسم التلوين (Coloring Box Border)
              </h3>

              <ColorPickerInput
                label="لون إطار صندوق التلوين"
                value={config.mainContent.borderColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    mainContent: { ...prev.mainContent, borderColor: c },
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span>السُمك</span>
                    <span className="font-mono">{config.mainContent.borderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.mainContent.borderWidth}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        mainContent: { ...prev.mainContent, borderWidth: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span>الانحناء</span>
                    <span className="font-mono">{config.mainContent.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={config.mainContent.borderRadius}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        mainContent: { ...prev.mainContent, borderRadius: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-600"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Card Border */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                4. إطار قسم التتبع السفلي (Bottom Section Border)
              </h3>

              <ColorPickerInput
                label="لون إطار قسم التتبع"
                value={config.bottomSection.borderColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    bottomSection: { ...prev.bottomSection, borderColor: c },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* ================= TAB 3: TEXT & FONTS ================= */}
        {activeTab === 'text' && (
          <div className="space-y-5">
            {/* Main Title Settings */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                العنوان الرئيسي (Main Title)
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نص العنوان</label>
                <input
                  type="text"
                  value={config.header.title}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      header: { ...prev.header, title: e.target.value },
                    }))
                  }
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-hidden"
                  placeholder="مثال: Listen to My Heart"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نوع الخط (Font)</label>
                <select
                  value={config.header.titleFont}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      header: { ...prev.header, titleFont: e.target.value as FontOption },
                    }))
                  }
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-hidden"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>حجم خط العنوان (Title Size)</span>
                  <span className="font-mono">{config.header.titleSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="52"
                  value={config.header.titleSize}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      header: { ...prev.header, titleSize: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-600"
                />
              </div>

              <ColorPickerInput
                label="لون العنوان الرئيسي"
                value={config.header.titleColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    header: { ...prev.header, titleColor: c },
                  }))
                }
              />
            </div>

            {/* Subtitle Settings */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                العنوان الفرعي (Subtitle)
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نص العنوان الفرعي</label>
                <input
                  type="text"
                  value={config.header.subtitle}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      header: { ...prev.header, subtitle: e.target.value },
                    }))
                  }
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-hidden"
                  placeholder="مثال: My Big World!"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>حجم خط العنوان الفرعي</span>
                  <span className="font-mono">{config.header.subtitleSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={config.header.subtitleSize}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      header: { ...prev.header, subtitleSize: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-cyan-600"
                />
              </div>

              <ColorPickerInput
                label="لون العنوان الفرعي"
                value={config.header.subtitleColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    header: { ...prev.header, subtitleColor: c },
                  }))
                }
              />
            </div>

            {/* Mascot & Flanking Stars */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                أيقونة وشخصية الهيدر (Header Mascot)
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'stethoscope', label: 'سماعة' },
                    { id: 'police', label: 'شرطي' },
                    { id: 'astronaut', label: 'فضاء' },
                    { id: 'bear', label: 'دب' },
                    { id: 'chef', label: 'طباخ' },
                    { id: 'heart', label: 'قلب' },
                    { id: 'star', label: 'نجمة' },
                  ] as { id: MascotType; label: string }[]
                ).map((mascot) => (
                  <button
                    key={mascot.id}
                    type="button"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          mascot: { ...prev.header.mascot, type: mascot.id },
                        },
                      }))
                    }
                    className={`p-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center ${
                      config.header.mascot.type === mascot.id
                        ? 'border-cyan-500 bg-cyan-100 text-cyan-800 ring-1 ring-cyan-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{mascot.label}</span>
                  </button>
                ))}
              </div>

              <ColorPickerInput
                label="لون رسمة الأيقونة"
                value={config.header.mascot.color}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      mascot: { ...prev.header.mascot, color: c },
                    },
                  }))
                }
              />

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={config.header.showStars}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      header: { ...prev.header, showStars: e.target.checked },
                    }))
                  }
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  إظهار النجوم اللامعة الجانبية (Glitter Stars)
                </span>
              </label>

              {config.header.showStars && (
                <ColorPickerInput
                  label="لون النجوم"
                  value={config.header.starsColor}
                  onChange={(c) =>
                    update((prev) => ({
                      ...prev,
                      header: { ...prev.header, starsColor: c },
                    }))
                  }
                />
              )}
            </div>

            {/* Page Badge Settings */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                شارة رقم الصفحة (Page Badge)
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'cloud', label: 'سحابة (Cloud)' },
                    { id: 'scallop', label: 'صدفية (Scallop)' },
                    { id: 'pill', label: 'كبسولة (Pill)' },
                  ] as { id: HeaderBadgeType; label: string }[]
                ).map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          badge: { ...prev.header.badge, type: badge.id },
                        },
                      }))
                    }
                    className={`p-2 rounded-lg border text-xs font-bold transition-all text-center ${
                      config.header.badge.type === badge.id
                        ? 'border-cyan-500 bg-cyan-100 text-cyan-800 ring-1 ring-cyan-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{badge.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رقم/نص الشارة</label>
                  <input
                    type="text"
                    value={config.header.badge.text}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          badge: { ...prev.header.badge, text: e.target.value },
                        },
                      }))
                    }
                    className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-hidden"
                    placeholder="2 أو 1 - 20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رمز الشارة السفلي</label>
                  <select
                    value={config.header.badge.icon}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          badge: {
                            ...prev.header.badge,
                            icon: e.target.value as 'heart' | 'star' | 'smile' | 'none',
                          },
                        },
                      }))
                    }
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-hidden"
                  >
                    <option value="heart">قلب (Heart)</option>
                    <option value="star">نجمة (Star)</option>
                    <option value="none">بدون رمز</option>
                  </select>
                </div>
              </div>

              <ColorPickerInput
                label="لون رقم الشارة"
                value={config.header.badge.textColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      badge: { ...prev.header.badge, textColor: c },
                    },
                  }))
                }
              />

              <ColorPickerInput
                label="لون إطار الشارة"
                value={config.header.badge.borderColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      badge: { ...prev.header.badge, borderColor: c },
                    },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* ================= TAB 4: COLORING IMAGE ================= */}
        {activeTab === 'image' && (
          <div className="space-y-5">
            {/* Choose Preset Drawing */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                الرسومات الجاهزة فائقة الدقة (Built-in Line Arts)
              </h3>

              <div className="space-y-2">
                {PRESET_ILLUSTRATIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        mainContent: {
                          ...prev.mainContent,
                          imageSource: 'preset',
                          presetId: item.id,
                        },
                        bottomSection: {
                          ...prev.bottomSection,
                          referencePresetId: item.id,
                        },
                      }))
                    }
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      config.mainContent.imageSource === 'preset' &&
                      config.mainContent.presetId === item.id
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg border overflow-hidden bg-white flex items-center justify-center p-1"
                        dangerouslySetInnerHTML={{ __html: item.lineArtSvg }}
                      />
                      <div className="text-right">
                        <div>{item.title}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    {config.mainContent.imageSource === 'preset' &&
                      config.mainContent.presetId === item.id && (
                        <Check className="w-4 h-4 text-cyan-600" />
                      )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom File Upload */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                رفع رسمة مخصصة من جهازك (Upload Your Own)
              </h3>
              <p className="text-xs text-slate-500">
                يمكنك رفع أي رسمة تلوين أو صورة كرتونية بتنسيق PNG أو JPG
              </p>

              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-cyan-400 rounded-xl bg-cyan-50/40 hover:bg-cyan-50 cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-cyan-600 mb-1" />
                <span className="text-xs font-bold text-cyan-800">
                  انقر هنا لاختيار ملف أو اسحب وأفلت الصورة
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  يدعم صور التلوين والرسومات الخطية
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {config.mainContent.uploadedImage && (
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border text-xs">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> تم تحميل الرسمة المخصصة
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        mainContent: {
                          ...prev.mainContent,
                          imageSource: 'preset',
                          uploadedImage: null,
                        },
                      }))
                    }
                    className="text-red-500 hover:text-red-700 text-xs font-semibold"
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>

            {/* Image Adjustments (Zoom, Brightness, Contrast) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                التحكم في حجم ونقاء الرسمة (Image Adjustments)
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>المقياس والحجم (Zoom)</span>
                  <span className="font-mono">{config.mainContent.imageScale}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={config.mainContent.imageScale}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      mainContent: {
                        ...prev.mainContent,
                        imageScale: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-cyan-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>التباين (Contrast - لجعل الخطوط داكنة)</span>
                  <span className="font-mono">{config.mainContent.imageContrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={config.mainContent.imageContrast}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      mainContent: {
                        ...prev.mainContent,
                        imageContrast: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-cyan-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>السطوع (Brightness)</span>
                  <span className="font-mono">{config.mainContent.imageBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={config.mainContent.imageBrightness}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      mainContent: {
                        ...prev.mainContent,
                        imageBrightness: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-cyan-600"
                />
              </div>
            </div>

            {/* Instruction Badge in top corner */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mainContent.showInstructionBadge}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      mainContent: {
                        ...prev.mainContent,
                        showInstructionBadge: e.target.checked,
                      },
                    }))
                  }
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  شارة تلميح التلوين (مثال: ✏️ Color the picture)
                </span>
              </label>

              {config.mainContent.showInstructionBadge && (
                <div className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">نص التلميح</label>
                    <input
                      type="text"
                      value={config.mainContent.instructionText}
                      onChange={(e) =>
                        update((prev) => ({
                          ...prev,
                          mainContent: {
                            ...prev.mainContent,
                            instructionText: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg outline-hidden"
                      placeholder="Color the picture. أو لون الصورة"
                    />
                  </div>

                  <ColorPickerInput
                    label="لون نص التلميح"
                    value={config.mainContent.instructionTextColor}
                    onChange={(c) =>
                      update((prev) => ({
                        ...prev,
                        mainContent: { ...prev.mainContent, instructionTextColor: c },
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: TRACING & FOOTER ================= */}
        {activeTab === 'tracing' && (
          <div className="space-y-5">
            {/* Trace words & Handwriting Line */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                كلمات التتبع والكتابة (Trace Words)
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  الكلمات المطلوب تتبعها (Words to Trace)
                </label>
                <input
                  type="text"
                  value={config.bottomSection.traceWords}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      bottomSection: {
                        ...prev.bottomSection,
                        traceWords: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-hidden"
                  placeholder="Listen to My Heart أو Mail Carrier"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  نمط النقاط والتتبع (Dotting Style)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'dotted', label: 'نقاط (Dotted)' },
                      { id: 'dashed', label: 'شرطات (Dashed)' },
                      { id: 'solid', label: 'مصمت (Solid)' },
                    ] as { id: TraceDotStyle; label: string }[]
                  ).map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() =>
                        update((prev) => ({
                          ...prev,
                          bottomSection: {
                            ...prev.bottomSection,
                            traceDotStyle: style.id,
                          },
                        }))
                      }
                      className={`p-2 rounded-lg border text-xs font-bold transition-all text-center ${
                        config.bottomSection.traceDotStyle === style.id
                          ? 'border-cyan-500 bg-cyan-100 text-cyan-800 ring-1 ring-cyan-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>حجم خط التتبع (Trace Font Size)</span>
                  <span className="font-mono">{config.bottomSection.traceWordsSize}px</span>
                </div>
                <input
                  type="range"
                  min="22"
                  max="44"
                  value={config.bottomSection.traceWordsSize}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      bottomSection: {
                        ...prev.bottomSection,
                        traceWordsSize: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-cyan-600"
                />
              </div>

              <ColorPickerInput
                label="لون حروف التتبع"
                value={config.bottomSection.traceWordsColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    bottomSection: { ...prev.bottomSection, traceWordsColor: c },
                  }))
                }
              />

              <ColorPickerInput
                label="لون سطور الكتابة الأفقية (Guide Lines Color)"
                value={config.bottomSection.lineBottomColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    bottomSection: {
                      ...prev.bottomSection,
                      lineBottomColor: c,
                      lineTopColor: `${c}80`,
                      lineMidColor: `${c}80`,
                    },
                  }))
                }
              />
            </div>

            {/* Doodle Icon (Heart, Envelope, Star) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                الرسمة الرمزية بجانب التتبع (Doodle Icon)
              </h3>
              <p className="text-xs text-slate-500">
                مثل القلب المبتسم (الصورة 1) أو ظرف الرسالة اللطيف (الصورة 2)
              </p>

              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'heart', label: 'قلب مبتسم' },
                    { id: 'envelope', label: 'ظرف رسالة' },
                    { id: 'star', label: 'نجمة' },
                    { id: 'flower', label: 'وردة' },
                    { id: 'pencil', label: 'قلم' },
                    { id: 'smile', label: 'ابتسامة' },
                    { id: 'none', label: 'بدون' },
                  ] as { id: DoodleType; label: string }[]
                ).map((doodle) => (
                  <button
                    key={doodle.id}
                    type="button"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        bottomSection: {
                          ...prev.bottomSection,
                          doodleIcon: doodle.id,
                        },
                      }))
                    }
                    className={`p-2 rounded-lg border text-xs font-bold transition-all text-center ${
                      config.bottomSection.doodleIcon === doodle.id
                        ? 'border-cyan-500 bg-cyan-100 text-cyan-800 ring-1 ring-cyan-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{doodle.label}</span>
                  </button>
                ))}
              </div>

              {config.bottomSection.doodleIcon !== 'none' && (
                <ColorPickerInput
                  label="لون الرسمة الرمزية"
                  value={config.bottomSection.doodleColor}
                  onChange={(c) =>
                    update((prev) => ({
                      ...prev,
                      bottomSection: { ...prev.bottomSection, doodleColor: c },
                    }))
                  }
                />
              )}
            </div>

            {/* Colored Reference Thumbnail */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bottomSection.showReferenceThumbnail}
                  onChange={(e) =>
                    update((prev) => ({
                      ...prev,
                      bottomSection: {
                        ...prev.bottomSection,
                        showReferenceThumbnail: e.target.checked,
                      },
                    }))
                  }
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  إظهار بطاقة الصورة الملونة الإرشادية (Reference Thumbnail)
                </span>
              </label>

              {config.bottomSection.showReferenceThumbnail && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-slate-500">
                    يمكنك استخدام الصورة الملونة الجاهزة للنموذج أو رفع صورة ملونة مخصصة:
                  </p>
                  <label className="flex items-center justify-center gap-2 p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Upload className="w-4 h-4 text-cyan-600" />
                    <span>رفع صورة إرشادية ملونة مخصصة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReferenceUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Footer Bar Labels & Colors */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                شريط التذييل (Footer: Name & Date)
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">تسمية حقل الاسم</label>
                  <input
                    type="text"
                    value={config.footer.nameLabel}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, nameLabel: e.target.value },
                      }))
                    }
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg outline-hidden"
                    placeholder="Name: أو الاسم:"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">تسمية حقل التاريخ</label>
                  <input
                    type="text"
                    value={config.footer.dateLabel}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, dateLabel: e.target.value },
                      }))
                    }
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg outline-hidden"
                    placeholder="Date: أو التاريخ:"
                  />
                </div>
              </div>

              <ColorPickerInput
                label="لون خطوط ونصوص التذييل"
                value={config.footer.textColor}
                onChange={(c) =>
                  update((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, textColor: c, lineColor: c, iconColor: c },
                  }))
                }
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
