export type UserRole = 'admin' | 'system_manager' | 'station_manager';

export interface CargasUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  title?: string;
  station_id?: string;
  station_name?: string;
  region?: string;
  avatar?: string;
  status?: 'active' | 'invited' | 'pending';
  invite_token?: string;
  invite_date?: string;
  invite_url?: string;
  last_login?: string;
  auth_provider?: 'google' | 'demo';
  whatsapp_number?: string;
}

export interface GeoArea {
  id: string;
  level: 'region' | 'governorate';
  name: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  region: string;
  governorate: string;
  manager_name?: string;
  phone?: string;
  address?: string;
  status?: 'active' | 'maintenance' | 'inactive' | 'نشطة' | 'تحت الصيانة' | 'خارج الخدمة' | string;
}

export interface Category {
  key: string;
  name: string;
  icon: string;
  sort_order: number;
  active_fields: string[];
  prefix?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  sort_order: number;
  active: boolean;
  is_custom: boolean;
}

export interface Asset {
  id: string;
  asset_code: string;
  asset_name: string;
  category: string;
  station_id: string;
  station_name: string;
  region: string;
  governorate: string;
  
  // Dynamic fields
  quantity?: number;
  old_asset_code?: string; // Old Asse_Code (كود الأصل القديم)
  old_quantity?: number;   // Old Qty (الكمية السابقة)
  old_category?: string;   // Old Asset_Category (فئة الأصل القديمة)
  old_description?: string; // Old Old_Descrip (الوصف القديم)
  old_notes?: string;      // Old Notes (ملاحظات قديمة)
  cost_center?: string;    // Cost_Center (مركز التكلفة)
  manufacturer?: string;   // Model / Manufacturer (الصانع)
  model_type?: string;     // Type (النوع)
  model_no?: string;       // Model No (رقم الموديل / الطراز)
  serial_no?: string;      // Serial_No (الرقم المسلسل)
  job_no?: string;         // Job No (رقم أمر الشغل)
  condition?: 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'كهنة/تالفة';
  criticality?: 'نعم' | 'لا';
  install_date?: string;
  system?: string;
  equipment_unit?: string; // L6 Equipment/Unit
  subunit?: string;        // L7 Subunit
  component_maintainable?: string; // Component/Maintainable Item
  part?: string;           // L9 Part
  power_specs?: string;    // Power/Specs
  capacity_size?: string;  // Capacity/Size
  dimension?: string;      // Dimention
  suction?: string;        // Suction
  frame_shape?: string;    // Frame/Shape
  assigned_to?: string;    // Assigned to
  screen_sn?: string;      // Screen S/N
  building_no?: string;    // Building_No
  floor_no?: string;       // Floor_No
  office_no?: string;      // Office_No
  installation?: string;   // L3 Installation
  industry?: string;       // L1 Industry ess
  business_category?: string; // L2 Category
  section?: string;        // Section (القطاع: الجنوبي، الشمالي، إلخ)
  photo_ref?: string;      // Photo_Ref (صورة الأصل)
  gps?: string;            // GPS (إحداثيات الموقع)
  inspector?: string;      // Inspector (الفاحص)
  notes?: string;
  remarks?: string;

  // Status & Audit
  source?: string; // مصدر الأصل: دفاتر المالية (المصدر المعتمد)، حصر 2026، حصر 2025، حصر 2023
  inventory_type?: string; // نوع الحصر: حصر فعلي وميداني 2026، حصر 2025، حصر 2023، دفاتر مالية
  financial_book?: string; // الدفاتر المالية: دفتر الأصول الثابتة العام، دفتر الآلات، دفتر وسائل الإطفاء، إلخ
  financial_reconciliation?: 'مطابق ومعتمد بدفاتر المالية' | 'مقيد بالدفاتر وبانتظار المطابقة' | 'حصر فعلي غير مقيد بالدفاتر' | 'فارق كميات أو مواصفات' | string;
  financial_qty?: number; // الكمية الدفترية المعتمدة
  confirmed: boolean;
  confirmed_at?: string;
  confirmed_by?: string;
  is_new?: boolean;
  qr_code?: string;
  created_at: string;
  
  custom_data?: Record<string, string>;
}

export interface CargasNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'audit';
  date: string;
  read: boolean;
  station_name?: string;
  asset_code?: string;
  target_role?: 'admin' | 'station_manager' | 'all';
}

export type AuditActionType =
  | 'create'
  | 'update'
  | 'confirm'
  | 'unconfirm'
  | 'delete'
  | 'bulk_confirm'
  | 'bulk_import'
  | 'qr_generated'
  | 'reset_demo'
  | 'clear_demo';

export interface AuditFieldChange {
  field: string;
  field_label: string;
  old_value: any;
  new_value: any;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  date_formatted: string;
  user_id?: string;
  user_name: string;
  user_role: UserRole;
  action_type: AuditActionType;
  action_label: string;
  asset_id?: string;
  asset_code?: string;
  asset_name?: string;
  station_id?: string;
  station_name?: string;
  category?: string;
  description: string;
  changes?: AuditFieldChange[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  sender_avatar?: string;
  station_id: string;
  station_name: string;
  text: string;
  timestamp: string;
  time_formatted: string;
  asset_code?: string;
  read_by_admin?: boolean;
  read_by_user?: boolean;
}

export interface UiVisibilitySettings {
  station: {
    buttons: {
      add_asset: boolean;
      whatsapp_task: boolean;
      export_excel: boolean;
      import_excel: boolean;
      print_qr: boolean;
      bulk_confirm: boolean;
      edit_asset: boolean;
      delete_asset: boolean;
      filter_buttons: boolean;
      chat_button: boolean;
    };
    icons: {
      category_icons: boolean;
      station_icon: boolean;
      status_icons: boolean;
      action_icons: boolean;
    };
    texts: {
      stats_cards: boolean;
      station_details_text: boolean;
      help_hints: boolean;
    };
    fields: {
      table_visible: boolean;
      col_asset_code: boolean;
      col_asset_name: boolean;
      col_category: boolean;
      col_serial_no: boolean;
      col_condition: boolean;
      col_source?: boolean;
      col_financial_reconciliation?: boolean;
      col_inventory_type: boolean;
      col_financial_book: boolean;
      col_manufacturer: boolean;
      col_model: boolean;
      col_quantity: boolean;
      col_notes: boolean;
    };
  };
  employee: {
    buttons: {
      single_confirm: boolean;
      bulk_confirm: boolean;
      refresh: boolean;
    };
    icons: {
      check_icons: boolean;
      category_icons: boolean;
      status_icons: boolean;
    };
    texts: {
      task_header: boolean;
      instructions: boolean;
      progress_stats: boolean;
    };
    fields: {
      table_visible: boolean;
      category_top_bar?: boolean;
      search_input: boolean;
      filter_category: boolean;
      col_asset_code: boolean;
      col_asset_name: boolean;
      col_category: boolean;
      col_serial_no: boolean;
      col_model: boolean;
      col_condition: boolean;
      col_source?: boolean;
      col_financial_reconciliation?: boolean;
      col_notes: boolean;
    };
  };
}

