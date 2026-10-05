import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Factory,
  FileSpreadsheet,
  Fuel,
  MapPin,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Tag,
  UserCheck
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Asset } from '../../types/cargas';
import { generateQrDataUrl } from '../../utils/qrGenerator';
import { CargasLogo } from '../common/CargasLogo';

interface ScanAssetViewProps {
  initialCode?: string;
  onBack: () => void;
}

export const ScanAssetView: React.FC<ScanAssetViewProps> = ({
  initialCode = '',
  onBack
}) => {
  const { assets, toggleConfirmAsset, currentUser } = useCargas();
  const [searchQuery, setSearchQuery] = useState(initialCode);
  const [searchedAsset, setSearchedAsset] = useState<Asset | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Initial load if code provided
  useEffect(() => {
    if (initialCode) {
      findAsset(initialCode);
    }
  }, [initialCode]);

  const findAsset = (code: string) => {
    const q = code.trim().toLowerCase();
    if (!q) return;

    const found = assets.find(a => 
      a.asset_code.toLowerCase() === q ||
      (a.serial_no && a.serial_no.toLowerCase() === q) ||
      a.asset_name.toLowerCase().includes(q)
    );

    if (found) {
      setSearchedAsset(found);
      setNotFound(false);
      const link = found.qr_code || `${window.location.origin}/scan/${found.asset_code}`;
      generateQrDataUrl(link, 260).then(setQrDataUrl);
    } else {
      setSearchedAsset(null);
      setNotFound(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    findAsset(searchQuery);
  };

  const handleConfirm = () => {
    if (searchedAsset) {
      toggleConfirmAsset(searchedAsset.id, currentUser.name);
      // Update local state copy
      setSearchedAsset(prev => prev ? {
        ...prev,
        confirmed: !prev.confirmed,
        confirmed_at: !prev.confirmed ? new Date().toLocaleString('ar-EG') : undefined,
        confirmed_by: !prev.confirmed ? currentUser.name : undefined
      } : null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Back and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors self-start"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للنظام</span>
          </button>

          <form onSubmit={handleSearchSubmit} className="flex-1 sm:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="أدخل كود الأصل أو الرقم المسلسل..."
                className="w-full pl-3 pr-9 py-2 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
            >
              بحث
            </button>
          </form>
        </div>

        {/* Not Found Alert */}
        {notFound && (
          <div className="p-8 rounded-3xl bg-white border-2 border-rose-200 shadow-md text-center max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">لم يتم العثور على أصل بهذا الكود</h3>
            <p className="text-xs text-slate-500 mb-4">
              يرجى التحقق من صحة كود الأصل أو الرقم المسلسل وإعادة المحاولة.
            </p>
            <p className="text-xs font-mono font-bold bg-slate-100 py-1.5 px-3 rounded-lg inline-block text-slate-700">
              الكود المدخل: {searchQuery}
            </p>
          </div>
        )}

        {/* Found Asset Passport Card */}
        {searchedAsset && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
            
            {/* Cargas Official Top Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CargasLogo size="md" light showSubtitle={false} />
                <div>
                  <h1 className="text-lg font-bold text-white">بطاقة تعريف الأصل الرسمي</h1>
                  <p className="text-xs text-emerald-200">شركة كارجاس للغاز الطبيعي للسيارات</p>
                </div>
              </div>

              {/* Confirmation Status Tag */}
              <div>
                {searchedAsset.confirmed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>تم تأكيد المطابقة</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-bold animate-pulse">
                    <Clock className="w-4 h-4 text-amber-300" />
                    <span>بانتظار التأكيد والمطابقة</span>
                  </span>
                )}
              </div>
            </div>

            {/* Asset Core Headline */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-sm font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {searchedAsset.asset_code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {searchedAsset.category}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {searchedAsset.asset_name}
                </h2>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{searchedAsset.station_name} — منطقة {searchedAsset.region} ({searchedAsset.governorate})</span>
                </p>
              </div>

              {/* QR Thumbnail */}
              {qrDataUrl && (
                <div className="shrink-0 p-2 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <img src={qrDataUrl} alt={searchedAsset.asset_code} className="w-24 h-24 rounded-lg mx-auto" />
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">كود QR المعتمد</span>
                </div>
              )}
            </div>

            {/* Specifications Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">الشركة المصنعة</span>
                <span className="font-bold text-slate-800 text-sm">{searchedAsset.manufacturer || '—'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">الموديل / الطراز</span>
                <span className="font-bold text-slate-800 text-sm">{searchedAsset.model_type || '—'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">الرقم المسلسل (S/N)</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{searchedAsset.serial_no || '—'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">الحالة التشغيلية</span>
                <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                  searchedAsset.condition === 'ممتازة'
                    ? 'bg-emerald-100 text-emerald-800'
                    : searchedAsset.condition === 'جيدة'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {searchedAsset.condition || 'جيدة'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">القدرة / المواصفات</span>
                <span className="font-semibold text-slate-800">{searchedAsset.power_specs || searchedAsset.capacity_size || '—'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">الضغط التشغيلي</span>
                <span className="font-semibold text-slate-800">{searchedAsset.suction || '—'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">المنظومة / السيستم</span>
                <span className="font-semibold text-slate-800">{searchedAsset.system || '—'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">تاريخ التركيب</span>
                <span className="font-semibold text-slate-800">{searchedAsset.install_date || '—'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">العهدة / الشخص المسند إليه</span>
                <span className="font-semibold text-slate-800">{searchedAsset.assigned_to || 'مدير المحطة'}</span>
              </div>

            </div>

            {/* Audit Confirmation Info */}
            <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs">
                {searchedAsset.confirmed ? (
                  <p className="text-slate-700">
                    <span className="font-bold text-emerald-800">تم تأكيد المطابقة: </span>
                    بواسطة {searchedAsset.confirmed_by || 'مدير المحطة'} بتاريخ {searchedAsset.confirmed_at || 'مؤكد'}
                  </p>
                ) : (
                  <p className="text-amber-800 font-medium">
                    لم يتم تأكيد مطابقة هذا الأصل حتى الآن من قبل مدير المحطة أو لجنة الجرد.
                  </p>
                )}
                {searchedAsset.notes && (
                  <p className="text-slate-500 mt-1">ملاحظات: {searchedAsset.notes}</p>
                )}
              </div>

              {/* Quick Confirm Action */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleConfirm}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                    searchedAsset.confirmed
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{searchedAsset.confirmed ? 'إلغاء التأكيد' : 'تأكيد الأصل ومطابقته'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
