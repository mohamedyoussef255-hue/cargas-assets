import React from 'react';
import { Asset } from '../../types/cargas';
import { Tag, BookOpen } from 'lucide-react';
import { ASSET_FIELD_ALIASES, normalizeArabic } from '../../utils/excelUtils';

interface AssetTableCellProps {
  asset: Asset;
  colKey: string;
}

function resolveFieldValue(asset: Asset, colKey: string): string {
  if (!asset) return '';

  // 1. Direct property match on asset
  const directVal = (asset as any)[colKey];
  if (directVal !== undefined && directVal !== null && String(directVal).trim() !== '') {
    return String(directVal).trim();
  }

  const normCol = normalizeArabic(colKey);

  // 2. Bidirectional translation: if colKey is an Arabic alias, check the corresponding standard English field on asset
  let standardFieldKey: string | undefined = undefined;
  for (const [sKey, aliases] of Object.entries(ASSET_FIELD_ALIASES)) {
    if (sKey === colKey || aliases.some(a => normalizeArabic(a) === normCol)) {
      standardFieldKey = sKey;
      break;
    }
  }

  if (standardFieldKey && standardFieldKey !== colKey) {
    const sVal = (asset as any)[standardFieldKey];
    if (sVal !== undefined && sVal !== null && String(sVal).trim() !== '') {
      return String(sVal).trim();
    }
  }

  // 3. Search in custom_data
  if (asset.custom_data && typeof asset.custom_data === 'object') {
    // 3a. Direct key in custom_data
    if (asset.custom_data[colKey] !== undefined && asset.custom_data[colKey] !== null) {
      const v = String(asset.custom_data[colKey]).trim();
      if (v !== '') return v;
    }

    // 3b. Search using aliases of colKey and aliases of standardFieldKey
    const allAliases = [
      ...(ASSET_FIELD_ALIASES[colKey] || []),
      ...(standardFieldKey ? (ASSET_FIELD_ALIASES[standardFieldKey] || []) : [])
    ];

    for (const a of allAliases) {
      if (asset.custom_data[a] !== undefined && asset.custom_data[a] !== null) {
        const v = String(asset.custom_data[a]).trim();
        if (v !== '') return v;
      }
    }

    // 3c. Normalized match in custom_data
    const normAliases = allAliases.map(a => normalizeArabic(a));

    for (const [cKey, cVal] of Object.entries(asset.custom_data)) {
      if (cVal === undefined || cVal === null || String(cVal).trim() === '') continue;
      const normCk = normalizeArabic(cKey);
      if (normCk === normCol || normAliases.includes(normCk)) {
        return String(cVal).trim();
      }
    }

    // 3d. Token/substring match in custom_data for compound column names
    if (normCol.length >= 3) {
      for (const [cKey, cVal] of Object.entries(asset.custom_data)) {
        if (cVal === undefined || cVal === null || String(cVal).trim() === '') continue;
        const normCk = normalizeArabic(cKey);
        if (normCk.includes(normCol) || (normCol.length >= 5 && normCol.includes(normCk))) {
          return String(cVal).trim();
        }
      }
    }
  }

  // 4. Fallback for common visual fields
  if ((colKey === 'asset_name' || normCol.includes('اسم') || normCol.includes('بيان')) && asset.asset_name) {
    return asset.asset_name;
  }
  if ((colKey === 'asset_code' || normCol.includes('كود')) && asset.asset_code) {
    return asset.asset_code;
  }

  return '';
}

export const AssetTableCell: React.FC<AssetTableCellProps> = ({ asset, colKey }) => {
  const resolved = resolveFieldValue(asset, colKey);

  switch (colKey) {
    case 'asset_code':
      return (
        <div className="flex items-center gap-1.5 font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
          <span>{resolved || asset.asset_code || '—'}</span>
          {asset.is_new && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0" title="أصل جديد بالجرد">
              جديد
            </span>
          )}
        </div>
      );

    case 'asset_name':
      return (
        <div>
          <p className="font-bold text-slate-900 dark:text-white max-w-xs">{resolved || asset.asset_name || 'أصل بدون اسم'}</p>
          {asset.old_description && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500">سابقاً: {String(asset.old_description)}</p>
          )}
        </div>
      );

    case 'inventory_type':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>{resolved || asset.inventory_type || 'حصر فعلي'}</span>
        </span>
      );

    case 'source': {
      const src = resolved || asset.source || 'دفاتر المالية (المصدر المعتمد)';
      const isFin = src.includes('دفاتر المالية') || src.includes('المالية');
      const is2026 = src.includes('2026');
      const is2025 = src.includes('2025');
      const is2023 = src.includes('2023');
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
          isFin
            ? 'bg-emerald-100/90 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
            : is2026
            ? 'bg-blue-100/90 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
            : is2025
            ? 'bg-cyan-100/90 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700'
            : is2023
            ? 'bg-purple-100/90 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
        }`} title={src}>
          <span>{src}</span>
        </span>
      );
    }

    case 'financial_reconciliation': {
      const rec = resolved || asset.financial_reconciliation || (asset.confirmed ? 'مطابق ومعتمد بدفاتر المالية' : 'مقيد بالدفاتر وبانتظار المطابقة');
      const isMatch = rec.includes('مطابق') || rec.includes('معتمد');
      const isUnreg = rec.includes('غير مقيد') || rec.includes('مستجد');
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isMatch
            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : isUnreg
            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
        }`}>
          <span>{rec}</span>
        </span>
      );
    }

    case 'financial_book':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100/80 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 max-w-[200px] truncate" title={resolved || String(asset.financial_book || 'دفتر أصول عامة')}>
          <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">{resolved || String(asset.financial_book || 'دفتر أصول عامة')}</span>
        </span>
      );

    case 'category':
      return (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
          {resolved || asset.category || 'عام'}
        </span>
      );

    case 'station_name':
      return (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{resolved || asset.station_name || 'غير محدد'}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">منطقة {String(asset.region || '')}</p>
        </div>
      );

    case 'region':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.region || '—'}</span>;

    case 'governorate':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.governorate || '—'}</span>;

    case 'quantity':
      return (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {resolved || asset.quantity || 1}
        </span>
      );

    case 'manufacturer':
      return (
        <span className="text-slate-800 dark:text-slate-200 font-medium">
          {resolved || asset.manufacturer || '—'}
        </span>
      );

    case 'model_type':
      return (
        <span className="text-slate-700 dark:text-slate-300">
          {resolved || asset.model_type || '—'}
        </span>
      );

    case 'serial_no':
      return (
        <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">
          {resolved || asset.serial_no || '—'}
        </span>
      );

    case 'condition': {
      const cond = resolved || asset.condition || 'جيدة';
      return (
        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
          cond === 'ممتازة'
            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
            : cond === 'جيدة'
            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
        }`}>
          {cond}
        </span>
      );
    }

    case 'criticality': {
      const crit = resolved || asset.criticality || 'لا';
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          crit === 'نعم'
            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
        }`}>
          {crit}
        </span>
      );
    }

    case 'system':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.system || '—'}</span>;

    case 'equipment_unit':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.equipment_unit || '—'}</span>;

    case 'subunit':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.subunit || '—'}</span>;

    case 'power_specs':
      return <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{resolved || asset.power_specs || '—'}</span>;

    case 'capacity_size':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.capacity_size || '—'}</span>;

    case 'dimension':
      return <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{resolved || asset.dimension || '—'}</span>;

    case 'suction':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.suction || '—'}</span>;

    case 'install_date':
      return <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{resolved || asset.install_date || '—'}</span>;

    case 'assigned_to':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.assigned_to || '—'}</span>;

    case 'cost_center':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.cost_center || '—'}</span>;

    case 'source':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.source || '—'}</span>;

    case 'building_no':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.building_no || '—'}</span>;

    case 'floor_no':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.floor_no || '—'}</span>;

    case 'office_no':
      return <span className="text-slate-700 dark:text-slate-300">{resolved || asset.office_no || '—'}</span>;

    case 'notes':
      return (
        <span className="text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate block" title={resolved || String(asset.notes || '')}>
          {resolved || asset.notes || '—'}
        </span>
      );

    case 'remarks':
      return (
        <span className="text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate block" title={resolved || String(asset.remarks || '')}>
          {resolved || asset.remarks || '—'}
        </span>
      );

    case 'confirmed':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
          asset.confirmed
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
        }`}>
          {asset.confirmed ? 'مؤكد ومطابق' : 'بانتظار التأكيد'}
        </span>
      );

    default: {
      if (!resolved || resolved === '') {
        return <span className="text-slate-400 dark:text-slate-600">—</span>;
      }
      return <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">{resolved}</span>;
    }
  }
};
