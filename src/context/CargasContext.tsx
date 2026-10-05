import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Asset,
  AuditFieldChange,
  AuditLogEntry,
  Category,
  CargasNotification,
  CargasUser,
  ChatMessage,
  GeoArea,
  Station,
  TableColumn,
  UiVisibilitySettings,
  UserRole
} from '../types/cargas';
import { discoverPopulatedColumns } from '../utils/excelUtils';
import {
  DEFAULT_UI_VISIBILITY,
  INITIAL_ASSETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_CHAT_MESSAGES,
  INITIAL_GEO_AREAS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STATIONS,
  INITIAL_TABLE_COLUMNS,
  INITIAL_USERS
} from '../data/initialData';

interface CargasContextType {
  // Data
  assets: Asset[];
  stations: Station[];
  categories: Category[];
  tableColumns: TableColumn[];
  geoAreas: GeoArea[];
  users: CargasUser[];
  notifications: CargasNotification[];
  auditLogs: AuditLogEntry[];
  currentUser: CargasUser;
  selectedStationId: string;
  isLoggedIn: boolean;
  darkMode: boolean;
  uiVisibility: UiVisibilitySettings;
  adminPin: string;

  // Setters & Navigation
  setCurrentUser: (user: CargasUser) => void;
  setSelectedStationId: (stationId: string) => void;
  switchRole: (role: UserRole, stationId?: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  updateUiVisibility: (updates: Partial<UiVisibilitySettings> | ((prev: UiVisibilitySettings) => UiVisibilitySettings)) => void;
  resetUiVisibility: () => void;
  updateAdminPin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  verifyAdminPin: (pin: string) => boolean;

  // Google Auth & WhatsApp Invites
  loginWithGoogle: (googleProfile: { name: string; email: string; avatar?: string }) => CargasUser;
  logout: () => void;
  sendWhatsAppInvite: (userId: string, customPhone?: string) => { inviteUrl: string; message: string; waLink: string; token: string };
  acceptInvite: (token: string, googleProfile: { name: string; email: string; avatar?: string }) => { success: boolean; user?: CargasUser; error?: string };
  getInviteInfo: (token: string) => { user: CargasUser; station?: Station } | null;

  // Assets Operations
  addAsset: (asset: Omit<Asset, 'id' | 'created_at'>) => Asset;
  addAssetsForStations: (
    assetData: Omit<Asset, 'id' | 'created_at' | 'station_id' | 'station_name' | 'region' | 'governorate'>,
    targetStationIds: string[]
  ) => Asset[];
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  toggleConfirmAsset: (id: string, confirmedBy?: string) => void;
  bulkConfirmAssets: (ids: string[], confirmedBy?: string) => void;
  bulkImportAssets: (newAssets: Omit<Asset, 'id' | 'created_at'>[]) => number;
  generateMissingQrs: () => number;
  getNextAssetCode: (categoryKey: string) => string;

  // Stations Operations
  addStation: (station: Omit<Station, 'id'>) => Station;
  updateStation: (id: string, updates: Partial<Station>) => void;
  deleteStation: (id: string) => void;

  // Categories Operations
  addCategory: (cat: Category) => void;
  updateCategory: (key: string, updates: Partial<Category>) => void;
  deleteCategory: (key: string) => void;

  // Columns Operations
  addColumn: (column: Omit<TableColumn, 'sort_order'>) => void;
  updateColumn: (key: string, updates: Partial<TableColumn>) => void;
  reorderColumns: (newColumns: TableColumn[]) => void;
  resetColumnsToDefault: () => void;
  deleteColumn: (key: string) => void;
  toggleColumnActive: (key: string) => void;
  showAllColumnsWithData: (customAssets?: Asset[]) => void;
  showAllColumns: () => void;
  hideEmptyColumns: (currentAssets?: Asset[]) => void;

  // Geo Operations
  addGeoArea: (level: 'region' | 'governorate', name: string) => void;
  updateGeoArea: (id: string, newName: string) => void;
  deleteGeoArea: (id: string) => void;

  // Users Operations
  addUser: (user: Omit<CargasUser, 'id'>) => CargasUser;
  updateUser: (id: string, updates: Partial<CargasUser>) => void;
  deleteUser: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<CargasNotification, 'id' | 'read'>) => void;

  // Audit Logs
  addAuditLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'date_formatted'>) => void;
  clearAuditLogs: () => void;

  // Chat Operations
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, options?: { stationId?: string; assetCode?: string }) => void;
  markChatAsRead: (stationId: string, asAdmin?: boolean) => void;

  // Demo Reset & Clear
  clearDemoAssets: () => void;
  resetToDefaultData: () => void;
}

const CargasContext = createContext<CargasContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ASSETS: 'cargas_assets_v2',
  STATIONS: 'cargas_stations_v2',
  CATEGORIES: 'cargas_categories_v2',
  COLUMNS: 'cargas_columns_v2',
  GEO: 'cargas_geo_v2',
  USERS: 'cargas_users_v2',
  NOTIFICATIONS: 'cargas_notifications_v2',
  AUDIT_LOGS: 'cargas_audit_logs_v2',
  CURRENT_USER_ID: 'cargas_curr_user_id_v2',
  SELECTED_STATION_ID: 'cargas_selected_st_v2',
  IS_LOGGED_IN: 'cargas_is_logged_in_v2',
  CHAT_MESSAGES: 'cargas_chat_messages_v2',
  UI_VISIBILITY: 'cargas_ui_visibility_v2',
  ADMIN_PIN: 'cargas_system_admin_pin_v2'
};

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (e) {
    console.warn('[Cargas] safeJsonParse failed, using fallback:', e);
    return fallback;
  }
}

export const CargasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(() => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.ASSETS), INITIAL_ASSETS);
  });

  const [stations, setStations] = useState<Station[]>(() => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.STATIONS), INITIAL_STATIONS);
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.CATEGORIES), INITIAL_CATEGORIES);
  });

  const [tableColumns, setTableColumns] = useState<TableColumn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COLUMNS);
    if (!saved) return INITIAL_TABLE_COLUMNS;
    try {
      const parsed: TableColumn[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_TABLE_COLUMNS;
      const existingKeys = new Set(parsed.map(c => c.key));
      const missing = INITIAL_TABLE_COLUMNS.filter(c => !existingKeys.has(c.key));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing].map((c, i) => ({ ...c, sort_order: i + 1 }));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_TABLE_COLUMNS;
    }
  });

  const [geoAreas, setGeoAreas] = useState<GeoArea[]>(() => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.GEO), INITIAL_GEO_AREAS);
  });

  const [users, setUsers] = useState<CargasUser[]>(() => {
    const raw = safeJsonParse<CargasUser[]>(localStorage.getItem(STORAGE_KEYS.USERS), INITIAL_USERS);
    // Migration: Mohamed Abdelrahman is sole system manager; Hossam El-Din removed
    const cleaned = (raw || []).filter(u => u.id !== 'usr-sys-1' && !u.name.includes('حسام'));
    const adminIdx = cleaned.findIndex(u => u.role === 'admin' || u.id === 'usr-admin-1' || u.name.includes('محمد'));
    if (adminIdx >= 0) {
      cleaned[adminIdx] = {
        ...cleaned[adminIdx],
        name: 'محمد عبد الرحمن',
        role: 'admin',
        title: 'مدير النظام',
        region: 'المركز الرئيسي - إدارة النظم والمعلومات'
      };
    } else {
      cleaned.unshift({
        id: 'usr-admin-1',
        name: 'محمد عبد الرحمن',
        email: 'mohamedyoussef255@gmail.com',
        phone: '01020002550',
        whatsapp_number: '01020002550',
        role: 'admin',
        title: 'مدير النظام',
        region: 'المركز الرئيسي - إدارة النظم والمعلومات',
        status: 'active',
        auth_provider: 'google'
      });
    }
    return cleaned;
  });

  const [notifications, setNotifications] = useState<CargasNotification[]>(() => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS), INITIAL_NOTIFICATIONS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS), INITIAL_AUDIT_LOGS);
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES), INITIAL_CHAT_MESSAGES);
  });

  // UI Visibility Controls managed by System Manager (Mohamed Abdelrahman)
  const [uiVisibility, setUiVisibilityState] = useState<UiVisibilitySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UI_VISIBILITY);
    return safeJsonParse<UiVisibilitySettings>(saved, DEFAULT_UI_VISIBILITY);
  });

  // System Admin Entry PIN code (Default '0000', can be changed inside System Manager page)
  const [adminPin, setAdminPinState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN);
    return saved || '0000';
  });

  const updateUiVisibility = (updates: Partial<UiVisibilitySettings> | ((prev: UiVisibilitySettings) => UiVisibilitySettings)) => {
    setUiVisibilityState(prev => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.UI_VISIBILITY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save UI visibility:', e);
      }
      return next;
    });
  };

  const resetUiVisibility = () => {
    setUiVisibilityState(DEFAULT_UI_VISIBILITY);
    try {
      localStorage.setItem(STORAGE_KEYS.UI_VISIBILITY, JSON.stringify(DEFAULT_UI_VISIBILITY));
    } catch (e) {
      console.warn('Failed to reset UI visibility:', e);
    }
  };

  const updateAdminPin = (oldPin: string, newPin: string): { success: boolean; error?: string } => {
    if (oldPin.trim() !== adminPin.trim()) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: 'يجب ألا تقل كلمة المرور الجديدة عن 4 أرقام أو حروف' };
    }
    const clean = newPin.trim();
    setAdminPinState(clean);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, clean);
    } catch (e) {
      console.warn('Failed to save PIN:', e);
    }
    return { success: true };
  };

  const verifyAdminPin = (pin: string): boolean => {
    return (pin || '').trim() === adminPin.trim();
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return saved !== null ? saved === 'true' : true;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'usr-admin-1';
  });

  const [selectedStationId, setSelectedStationId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_STATION_ID);
    return saved || 'st-1';
  });

  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('cargas_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('cargas_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkModeState(prev => !prev);
  };

  const setDarkMode = (enabled: boolean) => {
    setDarkModeState(enabled);
  };

  const safeSetLocalStorage = (key: string, value: any) => {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.warn(`[Cargas] localStorage write failed for key "${key}":`, err);
    }
  };

  // Save changes to localStorage safely without crashing on quota exceeded
  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.ASSETS, assets);
  }, [assets]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.STATIONS, stations);
  }, [stations]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.COLUMNS, tableColumns);
  }, [tableColumns]);

  // Ensure any columns that have data in the loaded assets are automatically active and visible
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    const { populatedStandardKeys, discoveredCustomColumns } = discoverPopulatedColumns(assets);

    setTableColumns(prevCols => {
      const existingKeys = new Set(prevCols.map(c => c.key));
      let hasChanges = false;

      const updated = prevCols.map(c => {
        if (populatedStandardKeys.has(c.key) && !c.active) {
          hasChanges = true;
          return { ...c, active: true };
        }
        return c;
      });

      discoveredCustomColumns.forEach(cCol => {
        if (!existingKeys.has(cCol.key)) {
          hasChanges = true;
          updated.push({
            key: cCol.key,
            label: cCol.label,
            type: 'text',
            sort_order: updated.length + 1,
            active: true,
            is_custom: true
          });
          existingKeys.add(cCol.key);
        }
      });

      if (hasChanges) {
        return updated;
      }
      return prevCols;
    });
  }, [assets]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.GEO, geoAreas);
  }, [geoAreas]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.SELECTED_STATION_ID, selectedStationId);
  }, [selectedStationId]);

  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEYS.IS_LOGGED_IN, String(isLoggedIn));
  }, [isLoggedIn]);

  const currentUser: CargasUser = (users && users.find(u => u.id === currentUserId)) || (users && users[0]) || {
    id: 'usr-admin-1',
    name: 'محمد عبد الرحمن',
    email: 'mohamedyoussef255@gmail.com',
    phone: '01020002550',
    role: 'admin',
    title: 'مدير النظام'
  };

  const addAuditLogEntry = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'date_formatted'>) => {
    try {
      const now = new Date();
      const formatted = now.toLocaleString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const newLog: AuditLogEntry = {
        ...entry,
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: now.toISOString(),
        date_formatted: formatted,
        user_id: entry.user_id || currentUser?.id || 'usr-admin-1',
        user_name: entry.user_name || currentUser?.name || 'محمد عبد الرحمن (مدير النظام)',
        user_role: entry.user_role || currentUser?.role || 'admin'
      };

      setAuditLogs(prev => [newLog, ...prev]);
    } catch (e) {
      console.error('Error adding audit log:', e);
    }
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    } catch (e) {
      console.warn(e);
    }
  };

  // Auto-sync station for station manager
  useEffect(() => {
    if (currentUser?.role === 'station_manager' && currentUser.station_id) {
      if (selectedStationId !== currentUser.station_id) {
        setSelectedStationId(currentUser.station_id);
      }
    }
  }, [currentUser, selectedStationId]);

  const switchRole = (role: UserRole, targetStationId?: string) => {
    if (role === 'admin' || role === 'system_manager') {
      const admin = users.find(u => u.role === 'admin' || u.name === 'محمد عبد الرحمن') || users[0];
      setCurrentUserId(admin.id);
    } else {
      const stId = targetStationId || selectedStationId || 'st-1';
      setSelectedStationId(stId);
      const manager = users.find(u => u.station_id === stId) || users.find(u => u.role === 'station_manager') || users[1];
      if (manager) {
        setCurrentUserId(manager.id);
      }
    }
  };

  // Google Authentication
  const loginWithGoogle = (googleProfile: { name: string; email: string; avatar?: string }): CargasUser => {
    const emailLower = googleProfile.email.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase().trim() === emailLower);
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

    if (existing) {
      const updated: CargasUser = {
        ...existing,
        name: googleProfile.name || existing.name,
        avatar: googleProfile.avatar || existing.avatar,
        status: 'active',
        auth_provider: 'google',
        last_login: nowStr
      };
      setUsers(prev => prev.map(u => u.id === existing.id ? updated : u));
      setCurrentUserId(existing.id);
      setIsLoggedIn(true);

      if (existing.station_id) {
        setSelectedStationId(existing.station_id);
      }

      addNotification({
        title: 'تسجيل دخول بحساب Google',
        message: `مرحباً ${updated.name}! تم تسجيل الدخول بنجاح بحساب Google (${updated.email}).`,
        type: 'success',
        date: 'الآن'
      });

      return updated;
    } else {
      // Create new user (Admin if mohamedyoussef255@gmail.com, else station manager)
      const isAdminEmail = emailLower === 'mohamedyoussef255@gmail.com';
      const newUser: CargasUser = {
        id: `usr-${Date.now()}`,
        name: googleProfile.name || emailLower.split('@')[0],
        email: googleProfile.email,
        phone: '',
        whatsapp_number: '',
        role: isAdminEmail ? 'admin' : 'station_manager',
        station_id: isAdminEmail ? undefined : 'st-1',
        station_name: isAdminEmail ? undefined : stations[0]?.name,
        region: isAdminEmail ? 'المركز الرئيسي' : stations[0]?.region,
        status: 'active',
        auth_provider: 'google',
        avatar: googleProfile.avatar,
        last_login: nowStr
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentUserId(newUser.id);
      setIsLoggedIn(true);

      if (newUser.station_id) {
        setSelectedStationId(newUser.station_id);
      }

      addNotification({
        title: 'مستخدم Google جديد',
        message: `تم إنشاء حساب وتنشيط الدخول للمستخدم ${newUser.name} (${newUser.email}).`,
        type: 'success',
        date: 'الآن'
      });

      return newUser;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    addNotification({
      title: 'تسجيل الخروج',
      message: 'تم تسجيل الخروج بنجاح. يمكنك تسجيل الدخول مجدداً بحساب Google في أي وقت.',
      type: 'info',
      date: 'الآن'
    });
  };

  // WhatsApp Invitations
  const sendWhatsAppInvite = (userId: string, customPhone?: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      throw new Error('المستخدم غير موجود');
    }

    const token = targetUser.invite_token || `INV-${targetUser.id.replace('usr-', '').slice(0, 5).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const origin = window.location.origin;
    const inviteUrl = `${origin}/?invite=${token}`;
    const phoneToUse = (customPhone || targetUser.whatsapp_number || targetUser.phone || '').trim();

    // Clean phone number for WhatsApp wa.me
    const digitsOnly = phoneToUse.replace(/\D/g, '');
    let cleanWaPhone = digitsOnly;
    if (digitsOnly.startsWith('01')) {
      cleanWaPhone = '20' + digitsOnly.slice(1);
    } else if (digitsOnly.startsWith('1') && digitsOnly.length === 10) {
      cleanWaPhone = '20' + digitsOnly;
    } else if (!cleanWaPhone.startsWith('20') && cleanWaPhone.length > 0) {
      cleanWaPhone = '20' + cleanWaPhone;
    }

    const matchedStation = stations.find(s => s.id === targetUser.station_id);
    const stationText = matchedStation
      ? `${matchedStation.name} (${matchedStation.region} - ${matchedStation.governorate})`
      : 'الإدارة المركزية للأصول';
    const roleText = targetUser.role === 'admin' ? 'مدير النظام (System Admin)' : 'مدير محطة ومسؤول مطابقة الأصول';

    const message = `السيد المهندس / ${targetUser.name} المحترم،
تحية طيبة وبعد،،

يسر إدارة شركة كارجاس دعوتكم للانضمام لمنظومة إدارة وتكويد أصول كارجاس (CARGAS Asset Flow).

🏢 المحطة المسندة: ${stationText}
🛡️ الصلاحية: ${roleText}
📧 بريد Google المعتمد: ${targetUser.email}

يرجى الضغط على الرابط التالي لتسجيل الدخول بحساب Google (Gmail) وتأكيد عهدة وأصول المحطة:
🔗 ${inviteUrl}

شركة الغاز الطبيعي للسيارات (كارجاس) - قطاع الأصول وتكنولوجيا المعلومات`;

    const waLink = cleanWaPhone ? `https://wa.me/${cleanWaPhone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    const today = new Date().toISOString().split('T')[0];

    // Update user in state
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'invited',
          invite_token: token,
          invite_date: today,
          invite_url: inviteUrl,
          whatsapp_number: phoneToUse || u.whatsapp_number
        };
      }
      return u;
    }));

    addNotification({
      title: 'إرسال دعوة واتساب',
      message: `تم إعداد وإرسال رابط الدعوة للمهندس ${targetUser.name} عبر واتساب بنجاح.`,
      type: 'info',
      date: 'الآن'
    });

    return {
      inviteUrl,
      message,
      waLink,
      token
    };
  };

  const getInviteInfo = (token: string): { user: CargasUser; station?: Station } | null => {
    if (!token) return null;
    const cleanToken = token.trim().toLowerCase();
    const matchedUser = users.find(u =>
      (u.invite_token && u.invite_token.toLowerCase() === cleanToken) ||
      u.id.toLowerCase() === cleanToken
    );

    if (!matchedUser) return null;
    const matchedStation = stations.find(s => s.id === matchedUser.station_id);
    return {
      user: matchedUser,
      station: matchedStation
    };
  };

  const acceptInvite = (
    token: string,
    googleProfile: { name: string; email: string; avatar?: string }
  ): { success: boolean; user?: CargasUser; error?: string } => {
    const inviteInfo = getInviteInfo(token);
    if (!inviteInfo) {
      return { success: false, error: 'رمز الدعوة غير صحيح أو قد تم استخدامه مسبقاً.' };
    }

    const { user: targetUser } = inviteInfo;
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

    const updatedUser: CargasUser = {
      ...targetUser,
      name: googleProfile.name || targetUser.name,
      email: googleProfile.email || targetUser.email,
      avatar: googleProfile.avatar || targetUser.avatar,
      status: 'active',
      auth_provider: 'google',
      last_login: nowStr
    };

    setUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
    setCurrentUserId(updatedUser.id);
    setIsLoggedIn(true);

    if (updatedUser.station_id) {
      setSelectedStationId(updatedUser.station_id);
    }

    addNotification({
      title: 'تم قبول الدعوة وتفعيل الحساب',
      message: `مرحباً بك م/ ${updatedUser.name}! تم تفعيل حسابك كمدير لمحطة ${updatedUser.station_name || 'كارجاس'} بنجاح عبر حساب Google.`,
      type: 'success',
      date: 'الآن'
    });

    return { success: true, user: updatedUser };
  };

  const getNextAssetCode = (categoryKey: string): string => {
    const cat = categories.find(c => c.key === categoryKey);
    const prefix = cat?.prefix || 'AS';
    let maxNum = 0;

    assets.forEach(a => {
      if (a.asset_code && a.asset_code.startsWith(prefix)) {
        const numPart = parseInt(a.asset_code.slice(prefix.length), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });

    return `${prefix}${String(maxNum + 1).padStart(5, '0')}`;
  };

  const ASSET_FIELD_LABELS: Record<string, string> = {
    asset_name: 'اسم الأصل / المعدة',
    asset_code: 'كود الأصل',
    category: 'الفئة الرئيسية',
    station_name: 'المحطة',
    region: 'المنطقة',
    governorate: 'المحافظة',
    quantity: 'الكمية',
    manufacturer: 'الشركة المصنعة',
    model_type: 'الموديل / النوع',
    serial_no: 'الرقم المسلسل (S/N)',
    condition: 'الحالة الفنية',
    criticality: 'الحرجية',
    power_specs: 'القدرة / المواصفات الفنية',
    capacity_size: 'السعة / الحجم',
    dimension: 'الأبعاد',
    suction: 'الضغط (بار)',
    frame_shape: 'شكل الهيكل',
    system: 'السيستم / المنظومة',
    equipment_unit: 'وحدة المعدة',
    subunit: 'الوحدة الفرعية',
    component_maintainable: 'المكون القابل للصيانة',
    part: 'الجزء / القطعة',
    building_no: 'المبنى',
    floor_no: 'الدور',
    office_no: 'المكتب / الغرفة',
    assigned_to: 'عهدة المسؤول',
    install_date: 'تاريخ التركيب',
    installation: 'طريقة التثبيت',
    industry: 'القطاع / الصناعة',
    business_category: 'فئة العمل',
    notes: 'الملاحظات',
    remarks: 'ملاحظات إضافية',
    confirmed: 'حالة المطابقة',
    confirmed_by: 'القائم بالمطابقة',
    confirmed_at: 'تاريخ المطابقة',
    screen_sn: 'سيريال الشاشة'
  };

  const addAsset = (assetData: Omit<Asset, 'id' | 'created_at'>): Asset => {
    const id = `ast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created_at = new Date().toISOString().split('T')[0];
    const newAsset: Asset = {
      ...assetData,
      id,
      created_at,
      qr_code: assetData.qr_code || `${window.location.origin}/scan/${assetData.asset_code}`
    };

    setAssets(prev => [newAsset, ...prev]);

    // Record in Audit Log
    addAuditLogEntry({
      action_type: 'create',
      action_label: 'إضافة أصل جديد',
      user_name: currentUser.name,
      user_role: currentUser.role,
      asset_id: newAsset.id,
      asset_code: newAsset.asset_code,
      asset_name: newAsset.asset_name,
      station_id: newAsset.station_id,
      station_name: newAsset.station_name,
      category: newAsset.category,
      description: `تمت إضافة الأصل "${newAsset.asset_name}" (${newAsset.asset_code}) في ${newAsset.station_name}.`,
      changes: [
        { field: 'asset_code', field_label: 'كود الأصل', old_value: '-', new_value: newAsset.asset_code },
        { field: 'category', field_label: 'الفئة', old_value: '-', new_value: newAsset.category },
        { field: 'station_name', field_label: 'المحطة', old_value: '-', new_value: newAsset.station_name }
      ]
    });

    // Add notification
    addNotification({
      title: 'إضافة أصل جديد',
      message: `تمت إضافة الأصل "${newAsset.asset_name}" (${newAsset.asset_code}) في ${newAsset.station_name}.`,
      type: 'info',
      date: 'الآن',
      station_name: newAsset.station_name,
      asset_code: newAsset.asset_code
    });

    return newAsset;
  };

  const addAssetsForStations = (
    assetData: Omit<Asset, 'id' | 'created_at' | 'station_id' | 'station_name' | 'region' | 'governorate'>,
    targetStationIds: string[]
  ): Asset[] => {
    const createdDate = new Date().toISOString().split('T')[0];
    const created: Asset[] = [];

    // Find category to get prefix
    const cat = categories.find(c => c.name === assetData.category || c.key === assetData.category);
    const prefix = cat?.prefix || 'AS';

    let currentMax = 0;
    assets.forEach(a => {
      if (a.asset_code && a.asset_code.startsWith(prefix)) {
        const numPart = parseInt(a.asset_code.slice(prefix.length), 10);
        if (!isNaN(numPart) && numPart > currentMax) {
          currentMax = numPart;
        }
      }
    });

    targetStationIds.forEach((stId, index) => {
      const station = stations.find(s => s.id === stId);
      if (!station) return;

      const codeNum = currentMax + index + 1;
      const assetCode = `${prefix}${String(codeNum).padStart(5, '0')}`;

      const newAsset: Asset = {
        ...assetData,
        id: `ast-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        asset_code: targetStationIds.length === 1 && assetData.asset_code ? assetData.asset_code : assetCode,
        station_id: station.id,
        station_name: station.name,
        region: station.region,
        governorate: station.governorate,
        created_at: createdDate,
        qr_code: `${window.location.origin}/scan/${targetStationIds.length === 1 && assetData.asset_code ? assetData.asset_code : assetCode}`
      };

      created.push(newAsset);
    });

    if (created.length > 0) {
      setAssets(prev => [...created, ...prev]);

      addAuditLogEntry({
        action_type: 'create',
        action_label: 'إضافة أصل لمجموعة محطات',
        user_name: currentUser.name,
        user_role: currentUser.role,
        description: `تمت إضافة الأصل "${assetData.asset_name}" وتوزيعه على ${created.length} محطات بنجاح.`,
        notes: `المحطات: ${created.map(c => c.station_name).join('، ')}`
      });

      addNotification({
        title: 'إضافة أصل لمجموعة محطات',
        message: `تم توزيع الأصل "${assetData.asset_name}" على ${created.length} محطات وتوليد الأكواد تلقائياً.`,
        type: 'success',
        date: 'الآن'
      });
    }

    return created;
  };

  const updateAsset = (id: string, updates: Partial<Asset>, updatedBy?: string) => {
    const existing = assets.find(a => a.id === id);
    if (existing) {
      const changes: AuditFieldChange[] = [];
      (Object.keys(updates) as (keyof Asset)[]).forEach(key => {
        if (key === 'id' || key === 'created_at') return;
        const oldVal = existing[key];
        const newVal = updates[key];
        if (oldVal !== newVal && (oldVal !== undefined || newVal !== undefined)) {
          changes.push({
            field: String(key),
            field_label: ASSET_FIELD_LABELS[String(key)] || String(key),
            old_value: oldVal !== undefined && oldVal !== '' ? String(oldVal) : '(فارغ)',
            new_value: newVal !== undefined && newVal !== '' ? String(newVal) : '(فارغ)'
          });
        }
      });

      if (changes.length > 0) {
        const userName = updatedBy || currentUser.name;
        addAuditLogEntry({
          action_type: 'update',
          action_label: 'تعديل بيانات أصل',
          user_name: userName,
          user_role: currentUser.role,
          asset_id: existing.id,
          asset_code: updates.asset_code || existing.asset_code,
          asset_name: updates.asset_name || existing.asset_name,
          station_id: updates.station_id || existing.station_id,
          station_name: updates.station_name || existing.station_name,
          category: updates.category || existing.category,
          description: `قام ${userName} بتعديل ${changes.length} حقول في بيانات الأصل "${existing.asset_name}" (${existing.asset_code}).`,
          changes
        });
      }
    }

    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAsset = (id: string, deletedBy?: string) => {
    const existing = assets.find(a => a.id === id);
    if (existing) {
      const userName = deletedBy || currentUser.name;
      addAuditLogEntry({
        action_type: 'delete',
        action_label: 'حذف أصل',
        user_name: userName,
        user_role: currentUser.role,
        asset_id: existing.id,
        asset_code: existing.asset_code,
        asset_name: existing.asset_name,
        station_id: existing.station_id,
        station_name: existing.station_name,
        category: existing.category,
        description: `قام ${userName} بحذف الأصل "${existing.asset_name}" (${existing.asset_code}) نهائياً من محطة ${existing.station_name}.`
      });
    }

    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const toggleConfirmAsset = (id: string, confirmedBy?: string) => {
    const target = assets.find(a => a.id === id);
    const user = confirmedBy || currentUser.name;

    if (target) {
      const isConfirming = !target.confirmed;
      addAuditLogEntry({
        action_type: isConfirming ? 'confirm' : 'unconfirm',
        action_label: isConfirming ? 'تأكيد ومطابقة أصل' : 'إلغاء مطابقة أصل',
        user_name: user,
        user_role: currentUser.role,
        asset_id: target.id,
        asset_code: target.asset_code,
        asset_name: target.asset_name,
        station_id: target.station_id,
        station_name: target.station_name,
        category: target.category,
        description: isConfirming
          ? `قام ${user} بتأكيد ومطابقة وجود الأصل "${target.asset_name}" (${target.asset_code}) في محطة ${target.station_name}.`
          : `قام ${user} بإلغاء تأكيد مطابقة الأصل "${target.asset_name}" (${target.asset_code}).`,
        changes: [
          {
            field: 'confirmed',
            field_label: 'حالة المطابقة',
            old_value: target.confirmed ? 'معتمد ومطابق' : 'بانتظار المطابقة',
            new_value: isConfirming ? 'معتمد ومطابق' : 'بانتظار المطابقة'
          }
        ]
      });
    }

    setAssets(prev => prev.map(a => {
      if (a.id !== id) return a;
      const isConfirming = !a.confirmed;
      const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
      return {
        ...a,
        confirmed: isConfirming,
        confirmed_at: isConfirming ? nowStr : undefined,
        confirmed_by: isConfirming ? user : undefined,
        is_new: false
      };
    }));
  };

  const bulkConfirmAssets = (ids: string[], confirmedBy?: string) => {
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    const user = confirmedBy || currentUser.name;
    const affected = assets.filter(a => ids.includes(a.id));
    const stationsList = Array.from(new Set(affected.map(a => a.station_name))).filter(Boolean).join('، ');

    addAuditLogEntry({
      action_type: 'bulk_confirm',
      action_label: 'مطابقة وتأكيد مجمع للأصول',
      user_name: user,
      user_role: currentUser.role,
      description: `تمت المطابقة والاعتماد الميداني لـ ${ids.length} أصلاً دفعة واحدة بواسطة ${user} في ${stationsList || 'المحطات'}.`,
      notes: `نماذج من الأكواد: ${affected.slice(0, 5).map(a => a.asset_code).join(', ')}${affected.length > 5 ? ` و ${affected.length - 5} أصول أخرى` : ''}`
    });

    setAssets(prev => prev.map(a => {
      if (ids.includes(a.id)) {
        return {
          ...a,
          confirmed: true,
          confirmed_at: nowStr,
          confirmed_by: user,
          is_new: false
        };
      }
      return a;
    }));
  };

  const bulkImportAssets = (newAssets: Omit<Asset, 'id' | 'created_at'>[]): number => {
    try {
      if (!newAssets || !Array.isArray(newAssets) || newAssets.length === 0) return 0;

      const createdDate = new Date().toISOString().split('T')[0];
      const safeUserName = currentUser?.name || 'مدير النظام';
      const safeUserRole = currentUser?.role || 'admin';
      const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';

      const createdAssets: Asset[] = newAssets.map((item, idx) => {
        const rawCode = item.asset_code ? String(item.asset_code).trim() : '';
        const safeCode = rawCode || `AST-${Date.now().toString().slice(-4)}-${idx + 1}`;
        const rawName = item.asset_name ? String(item.asset_name).trim() : '';
        const rawStationId = item.station_id ? String(item.station_id).trim() : 'st-1';
        const rawStationName = item.station_name ? String(item.station_name).trim() : 'محطة ألماظة';

        const safeQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity)
          ? item.quantity
          : (parseInt(String(item.quantity || 1), 10) || 1);

        return {
          ...item,
          id: `ast-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          created_at: (item as any).created_at || createdDate,
          asset_code: safeCode,
          asset_name: rawName || 'أصل مستورد جديد',
          category: item.category ? String(item.category).trim() : 'الالات والمعدات',
          inventory_type: item.inventory_type ? String(item.inventory_type).trim() : 'حصر فعلي',
          financial_book: item.financial_book ? String(item.financial_book).trim() : 'دفتر أصول عامة',
          station_id: rawStationId,
          station_name: rawStationName,
          region: item.region ? String(item.region).trim() : 'شرق',
          governorate: item.governorate ? String(item.governorate).trim() : 'القاهرة',
          quantity: safeQuantity,
          serial_no: item.serial_no !== undefined && item.serial_no !== null ? String(item.serial_no).trim() : '',
          manufacturer: item.manufacturer ? String(item.manufacturer).trim() : '',
          model_type: item.model_type ? String(item.model_type).trim() : '',
          condition: item.condition || 'جيدة',
          criticality: item.criticality || 'لا',
          confirmed: Boolean(item.confirmed),
          confirmed_at: item.confirmed ? (item.confirmed_at || createdDate) : undefined,
          confirmed_by: item.confirmed ? (item.confirmed_by || safeUserName) : undefined,
          is_new: true,
          qr_code: item.qr_code || (origin ? `${origin}/scan/${safeCode}` : safeCode)
        };
      });

      setAssets(prev => [...createdAssets, ...(Array.isArray(prev) ? prev : [])]);

      // Auto-activate all columns that have data in the newly imported assets
      const { populatedStandardKeys, discoveredCustomColumns } = discoverPopulatedColumns(createdAssets);

      setTableColumns(prevCols => {
        const existingKeys = new Set(prevCols.map(c => c.key));
        let hasChanges = false;

        const updated = prevCols.map(c => {
          if (populatedStandardKeys.has(c.key) && !c.active) {
            hasChanges = true;
            return { ...c, active: true };
          }
          return c;
        });

        discoveredCustomColumns.forEach(cCol => {
          if (!existingKeys.has(cCol.key)) {
            hasChanges = true;
            updated.push({
              key: cCol.key,
              label: cCol.label,
              type: 'text',
              sort_order: updated.length + 1,
              active: true,
              is_custom: true
            });
            existingKeys.add(cCol.key);
          } else {
            const idx = updated.findIndex(u => u.key === cCol.key);
            if (idx >= 0 && !updated[idx].active) {
              hasChanges = true;
              updated[idx] = { ...updated[idx], active: true };
            }
          }
        });

        if (hasChanges) {
          safeSetLocalStorage(STORAGE_KEYS.COLUMNS, updated);
          return updated;
        }
        return prevCols;
      });

      const targetStation = createdAssets[0]?.station_name;

      addAuditLogEntry({
        action_type: 'bulk_import',
        action_label: 'استيراد أصول من ملف Excel',
        user_name: safeUserName,
        user_role: safeUserRole,
        station_name: targetStation,
        description: `قام ${safeUserName} باستيراد ${createdAssets.length} أصلاً عبر ملف Excel وتوليد أكواد QR لها بنجاح في ${targetStation || 'المحطات'}.`,
        notes: `تم تسجيل ${createdAssets.length} أصلاً جديداً في قاعدة البيانات`
      });

      addNotification({
        title: 'استيراد أصول بنجاح',
        message: `تم استيراد ${createdAssets.length} أصلاً بنجاح إلى قاعدة البيانات.`,
        type: 'success',
        date: 'الآن'
      });

      return createdAssets.length;
    } catch (err) {
      console.error('Error in bulkImportAssets:', err);
      return 0;
    }
  };

  const generateMissingQrs = (): number => {
    let count = 0;
    setAssets(prev => prev.map(a => {
      if (!a.qr_code && a.asset_code) {
        count++;
        return {
          ...a,
          qr_code: `${window.location.origin}/scan/${a.asset_code}`
        };
      }
      return a;
    }));

    if (count > 0) {
      addAuditLogEntry({
        action_type: 'qr_generated',
        action_label: 'توليد رموز QR للأصول',
        user_name: currentUser.name,
        user_role: currentUser.role,
        description: `تم فحص وتوليد أكواد QR تلقائياً لـ ${count} أصلاً مسجلاً.`
      });
    }

    return count;
  };

  // Station operations
  const addStation = (data: Omit<Station, 'id'>): Station => {
    const id = `st-${Date.now()}`;
    const newStation: Station = { ...data, id };
    setStations(prev => [...prev, newStation]);
    return newStation;
  };

  const updateStation = (id: string, updates: Partial<Station>) => {
    setStations(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    // Cascade update station_name in assets
    if (updates.name) {
      setAssets(prev => prev.map(a => a.station_id === id ? { ...a, station_name: updates.name! } : a));
    }
  };

  const deleteStation = (id: string) => {
    setStations(prev => prev.filter(s => s.id !== id));
  };

  // Category operations
  const addCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
  };

  const updateCategory = (key: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.key === key ? { ...c, ...updates } : c));
  };

  const deleteCategory = (key: string) => {
    setCategories(prev => prev.filter(c => c.key !== key));
  };

  // Columns operations
  const addColumn = (col: Omit<TableColumn, 'sort_order'>) => {
    setTableColumns(prev => [
      ...prev,
      { ...col, sort_order: prev.length + 1 }
    ]);
  };

  const updateColumn = (key: string, updates: Partial<TableColumn>) => {
    setTableColumns(prev => prev.map(c => c.key === key ? { ...c, ...updates } : c));
  };

  const reorderColumns = (newColumns: TableColumn[]) => {
    const updated = newColumns.map((c, idx) => ({ ...c, sort_order: idx + 1 }));
    setTableColumns(updated);
    localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(updated));
  };

  const resetColumnsToDefault = () => {
    setTableColumns(INITIAL_TABLE_COLUMNS);
    localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(INITIAL_TABLE_COLUMNS));
  };

  const deleteColumn = (key: string) => {
    setTableColumns(prev => prev.filter(c => c.key !== key));
  };

  const toggleColumnActive = (key: string) => {
    setTableColumns(prev => {
      const updated = prev.map(c => c.key === key ? { ...c, active: !c.active } : c);
      safeSetLocalStorage(STORAGE_KEYS.COLUMNS, updated);
      return updated;
    });
  };

  const showAllColumnsWithData = (customAssets?: Asset[]) => {
    const targetAssets = customAssets && customAssets.length > 0 ? customAssets : assets;
    if (!targetAssets || targetAssets.length === 0) return;

    const { populatedStandardKeys, discoveredCustomColumns } = discoverPopulatedColumns(targetAssets);

    setTableColumns(prevCols => {
      const existingKeys = new Set(prevCols.map(c => c.key));
      const updated = prevCols.map(c => {
        if (populatedStandardKeys.has(c.key)) {
          return { ...c, active: true };
        }
        return c;
      });

      discoveredCustomColumns.forEach(cCol => {
        if (!existingKeys.has(cCol.key)) {
          updated.push({
            key: cCol.key,
            label: cCol.label,
            type: 'text',
            sort_order: updated.length + 1,
            active: true,
            is_custom: true
          });
          existingKeys.add(cCol.key);
        } else {
          const idx = updated.findIndex(u => u.key === cCol.key);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], active: true };
          }
        }
      });

      safeSetLocalStorage(STORAGE_KEYS.COLUMNS, updated);
      return updated;
    });
  };

  const showAllColumns = () => {
    setTableColumns(prev => {
      const updated = prev.map(c => ({ ...c, active: true }));
      safeSetLocalStorage(STORAGE_KEYS.COLUMNS, updated);
      return updated;
    });
  };

  const hideEmptyColumns = (currentAssets?: Asset[]) => {
    const targetAssets = currentAssets && currentAssets.length > 0 ? currentAssets : assets;
    if (!targetAssets || targetAssets.length === 0) return;
    const { populatedStandardKeys, discoveredCustomColumns } = discoverPopulatedColumns(targetAssets);
    const customKeys = new Set(discoveredCustomColumns.map(c => c.key));

    setTableColumns(prev => {
      const updated = prev.map(c => {
        if (c.key === 'asset_code' || c.key === 'asset_name' || c.key === 'category') {
          return { ...c, active: true };
        }
        const hasData = populatedStandardKeys.has(c.key) || customKeys.has(c.key);
        return { ...c, active: hasData };
      });
      safeSetLocalStorage(STORAGE_KEYS.COLUMNS, updated);
      return updated;
    });
  };

  // Geo operations with cascade
  const addGeoArea = (level: 'region' | 'governorate', name: string) => {
    const id = `geo-${Date.now()}`;
    setGeoAreas(prev => [...prev, { id, level, name }]);
  };

  const updateGeoArea = (id: string, newName: string) => {
    const oldArea = geoAreas.find(g => g.id === id);
    if (!oldArea) return;
    const oldName = oldArea.name;

    setGeoAreas(prev => prev.map(g => g.id === id ? { ...g, name: newName } : g));

    if (oldArea.level === 'region') {
      setStations(prev => prev.map(s => s.region === oldName ? { ...s, region: newName } : s));
      setAssets(prev => prev.map(a => a.region === oldName ? { ...a, region: newName } : a));
    } else {
      setStations(prev => prev.map(s => s.governorate === oldName ? { ...s, governorate: newName } : s));
      setAssets(prev => prev.map(a => a.governorate === oldName ? { ...a, governorate: newName } : a));
    }
  };

  const deleteGeoArea = (id: string) => {
    setGeoAreas(prev => prev.filter(g => g.id !== id));
  };

  // User operations
  const addUser = (userData: Omit<CargasUser, 'id'>): CargasUser => {
    const id = `usr-${Date.now()}`;
    const newUser: CargasUser = {
      ...userData,
      id,
      status: userData.status || 'pending',
      auth_provider: 'google'
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<CargasUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addNotification = (notif: Omit<CargasNotification, 'id' | 'read'>) => {
    const newNotif: CargasNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Chat Operations
  const sendChatMessage = (text: string, options?: { stationId?: string; assetCode?: string }) => {
    if (!text || !text.trim()) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const targetStationId = options?.stationId || currentUser.station_id || selectedStationId || stations[0]?.id || 'st-1';
    const targetStation = stations.find(s => s.id === targetStationId) || stations[0];
    const isCurrentAdmin = currentUser.role === 'admin' || currentUser.role === 'system_manager';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      sender_avatar: currentUser.avatar,
      station_id: targetStationId,
      station_name: targetStation.name,
      text: text.trim(),
      timestamp: now.toISOString(),
      time_formatted: timeFormatted,
      asset_code: options?.assetCode,
      read_by_admin: isCurrentAdmin,
      read_by_user: !isCurrentAdmin
    };

    setChatMessages(prev => [...prev, newMsg]);

    if (!isCurrentAdmin) {
      addNotification({
        title: `رسالة جديدة من ${currentUser.name}`,
        message: `محطة ${targetStation.name}: ${text.trim().slice(0, 50)}...`,
        type: 'info',
        date: 'الآن',
        target_role: 'admin',
        station_name: targetStation.name
      });

      // Automated responsive simulation from the General System Manager
      setTimeout(() => {
        setChatMessages(prev => {
          const autoMsgId = `ack-${Date.now()}`;
          const ackTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
          const adminReply: ChatMessage = {
            id: autoMsgId,
            sender_id: 'usr-admin-1',
            sender_name: 'م. محمد يوسف (المدير العام للنظام)',
            sender_role: 'admin',
            sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            station_id: targetStationId,
            station_name: targetStation.name,
            text: `تم استلام رسالتكم بخصوص محطة ${targetStation.name}. جاري المتابعة والتدقيق في السجلات الميدانية وقاعدة البيانات. شكراً لتواصلكم.`,
            timestamp: new Date().toISOString(),
            time_formatted: ackTime,
            read_by_admin: true,
            read_by_user: false
          };
          return [...prev, adminReply];
        });
      }, 1500);
    } else {
      addNotification({
        title: `رد جديد من المدير العام للنظام`,
        message: `إلى محطة ${targetStation.name}: ${text.trim().slice(0, 50)}...`,
        type: 'info',
        date: 'الآن',
        target_role: 'station_manager',
        station_name: targetStation.name
      });
    }
  };

  const markChatAsRead = (stationId: string, asAdmin: boolean = false) => {
    setChatMessages(prev => prev.map(m => {
      if (m.station_id === stationId) {
        return {
          ...m,
          ...(asAdmin ? { read_by_admin: true } : { read_by_user: true })
        };
      }
      return m;
    }));
  };

  const clearDemoAssets = () => {
    setAssets([]);
    addAuditLogEntry({
      action_type: 'clear_demo',
      action_label: 'مسح الأصول التجريبية',
      user_name: currentUser.name,
      user_role: currentUser.role,
      description: `قام ${currentUser.name} بمسح كافة الأصول التجريبية لإعادة التهيئة ببيانات نظيفة.`
    });
    addNotification({
      title: 'تم تفريغ الأصول التجريبية بنجاح',
      message: 'قام مدير النظام بمسح كافة الأصول والبيانات التجريبية. الجداول فارغة ونظيفة الآن ومستعدة لإدخال بيانات أصول كارجاس الفعلية.',
      type: 'warning',
      target_role: 'admin',
      date: new Date().toLocaleDateString('ar-EG')
    });
  };

  const resetToDefaultData = () => {
    setAssets(INITIAL_ASSETS);
    setStations(INITIAL_STATIONS);
    setCategories(INITIAL_CATEGORIES);
    setTableColumns(INITIAL_TABLE_COLUMNS);
    setGeoAreas(INITIAL_GEO_AREAS);
    setUsers(INITIAL_USERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setCurrentUserId('usr-admin-1');
    setSelectedStationId('st-1');
    setIsLoggedIn(true);
    localStorage.clear();
    addAuditLogEntry({
      action_type: 'reset_demo',
      action_label: 'استعادة البيانات النموذجية',
      user_name: currentUser.name,
      user_role: currentUser.role,
      description: `تمت استعادة البيانات النموذجية الافتراضية لكافة المحطات والأصول.`
    });
    addNotification({
      title: 'تم استعادة البيانات النموذجية التجريبية',
      message: 'تمت استعادة كافة البيانات والأصول النموذجية الافتراضية بنجاح.',
      type: 'info',
      target_role: 'admin',
      date: new Date().toLocaleDateString('ar-EG')
    });
  };

  return (
    <CargasContext.Provider
      value={{
        assets,
        stations,
        categories,
        tableColumns,
        geoAreas,
        users,
        notifications,
        auditLogs,
        currentUser,
        selectedStationId,
        isLoggedIn,
        darkMode,
        uiVisibility,
        adminPin,
        setCurrentUser: (u) => setCurrentUserId(u.id),
        setSelectedStationId,
        switchRole,
        toggleDarkMode,
        setDarkMode,
        updateUiVisibility,
        resetUiVisibility,
        updateAdminPin,
        verifyAdminPin,
        loginWithGoogle,
        logout,
        sendWhatsAppInvite,
        acceptInvite,
        getInviteInfo,
        addAsset,
        addAssetsForStations,
        updateAsset,
        deleteAsset,
        toggleConfirmAsset,
        bulkConfirmAssets,
        bulkImportAssets,
        generateMissingQrs,
        getNextAssetCode,
        addStation,
        updateStation,
        deleteStation,
        addCategory,
        updateCategory,
        deleteCategory,
        addColumn,
        updateColumn,
        reorderColumns,
        resetColumnsToDefault,
        deleteColumn,
        toggleColumnActive,
        showAllColumnsWithData,
        showAllColumns,
        hideEmptyColumns,
        addGeoArea,
        updateGeoArea,
        deleteGeoArea,
        addUser,
        updateUser,
        deleteUser,
        markNotificationRead,
        addNotification,
        addAuditLogEntry,
        clearAuditLogs,
        clearDemoAssets,
        resetToDefaultData,
        chatMessages,
        sendChatMessage,
        markChatAsRead
      }}
    >
      {children}
    </CargasContext.Provider>
  );
};

export const useCargas = () => {
  const context = useContext(CargasContext);
  if (!context) {
    throw new Error('useCargas must be used within a CargasProvider');
  }
  return context;
};
