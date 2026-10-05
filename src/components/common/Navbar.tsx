import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Database,
  FileSpreadsheet,
  Fuel,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Moon,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Table,
  Unlock,
  UserCheck
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { CargasLogo } from './CargasLogo';
import { GoogleLoginModal } from '../auth/GoogleLoginModal';
import { DemoDataModal } from '../admin/DemoDataModal';
import { SystemAdminLoginModal } from '../auth/SystemAdminLoginModal';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenScan?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenScan
}) => {
  const {
    currentUser,
    isLoggedIn,
    logout,
    switchRole,
    stations,
    selectedStationId,
    setSelectedStationId,
    notifications,
    markNotificationRead,
    resetToDefaultData,
    darkMode,
    toggleDarkMode
  } = useCargas();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showDemoDataModal, setShowDemoDataModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // Logo 5-click secret entry for System Manager (Mohamed Abdelrahman)
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastLogoClickTime, setLastLogoClickTime] = useState(0);

  const isSystemManager = currentUser?.role === 'admin' && (currentUser?.name?.includes('محمد عبد الرحمن') || currentUser?.id === 'usr-admin-1');

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoClickTime > 2500) {
      setLogoClicks(1);
      setLastLogoClickTime(now);
    } else {
      const next = logoClicks + 1;
      setLastLogoClickTime(now);
      if (next >= 5) {
        setLogoClicks(0);
        setShowAdminLoginModal(true);
      } else {
        setLogoClicks(next);
      }
    }
  };

  const handleLockAdmin = () => {
    switchRole('station_manager', selectedStationId);
    onNavigate('/station');
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentStation = stations.find(s => s.id === selectedStationId) || stations[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-950/10 dark:border-slate-800 shadow-xs transition-colors duration-200">
        {/* Main Navbar Top Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Brand with 5-click Secret System Manager Entry */}
            <div
              onClick={handleLogoClick}
              className="cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 select-none relative group"
              id="nav-logo-btn"
              title={logoClicks > 0 ? `نقرة ${logoClicks} من 5 لدخول مدير النظام` : 'شعار كارجاس للغاز الطبيعي'}
            >
              <CargasLogo size="md" />

              {/* Click Indicator Tooltip */}
              {logoClicks > 0 && logoClicks < 5 && (
                <span className="absolute -bottom-2 right-0 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                  {logoClicks} / 5 لدخول مدير النظام
                </span>
              )}
            </div>

            {/* Center Navigation Tabs: HIDE Admin, Station, and Employee views unless logged in as System Manager */}
            {isSystemManager ? (
              <nav className="hidden lg:flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-emerald-200 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>مدير النظام: محمد عبد الرحمن</span>
                </div>

                <button
                  onClick={() => onNavigate('/admin')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === '/admin' || currentRoute.startsWith('/admin')
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-slate-700'
                  }`}
                  id="nav-link-admin"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>لوحة الإدارة</span>
                </button>

                <button
                  onClick={() => onNavigate('/station')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === '/station' || currentRoute.startsWith('/station/')
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-slate-700'
                  }`}
                  id="nav-link-station-preview"
                >
                  <Fuel className="w-3.5 h-3.5" />
                  <span>شاشة المحطة (معاينة)</span>
                </button>

                <button
                  onClick={handleLockAdmin}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="قفل لوحة الإدارة والخروج من وضع مدير النظام"
                >
                  <Lock className="w-3 h-3" />
                  <span>قفل لوحة الإدارة</span>
                </button>
              </nav>
            ) : (
              /* Public / Employee view: Hide admin, station, and employee pages from top bar */
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                  منظومة مطابقة وحصر أصول شركة كارجاس
                </span>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Dark Mode Toggle Switch (Accessible for both day/night shifts) */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all duration-200 outline-none
                  bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700
                  dark:bg-slate-800 dark:hover:bg-slate-700/90 dark:border-slate-700 dark:text-amber-400 shadow-2xs"
                title={darkMode ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
                aria-label="تبديل الوضع الليلي والنهاري"
                id="theme-toggle-btn"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
                    <span className="hidden xl:inline text-xs font-bold text-slate-200">الوضع النهاري</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-300" />
                    <span className="hidden xl:inline text-xs font-bold text-slate-700">الوضع الليلي</span>
                  </>
                )}
              </button>

              {/* Quick Scan QR button */}
              <button
                onClick={() => onOpenScan ? onOpenScan() : onNavigate('/scan')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                title="مسح واستعلام كود أصل"
                id="nav-scan-qr-btn"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مسح كود الأصل</span>
              </button>

              {/* Station Selector: Dropdown for Admin, locked badge for Station Manager */}
              {currentUser.role === 'admin' ? (
                <div className="relative hidden sm:block">
                  <select
                    value={selectedStationId}
                    onChange={(e) => {
                      setSelectedStationId(e.target.value);
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer pr-7 transition-colors appearance-none"
                    id="nav-station-select"
                    title="تحديد المحطة النشطة"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id} className="dark:bg-slate-800 dark:text-slate-100">
                        {st.name} ({st.region})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                  <Fuel className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>{currentStation.name}</span>
                </div>
              )}

              {/* Notifications Popover Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  id="nav-notifications-btn"
                  aria-label="التنبيهات"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Popover Dropdown */}
                {showNotifMenu && (
                  <div
                    className="absolute left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 text-right"
                    id="notifications-popover"
                  >
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">التنبيهات والمطابقات</span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} جديد
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">لا توجد إشعارات حالياً</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                              !n.read ? 'bg-emerald-50/40 dark:bg-emerald-950/30' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{n.date}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                            {n.station_name && (
                              <span className="inline-block mt-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                                {n.station_name}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Google Sign In / User Profile Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-all border border-slate-200/70 dark:border-slate-700"
                  id="nav-user-menu-btn"
                >
                  {/* Google Profile Avatar with small Google badge */}
                  <div className="relative">
                    <img
                      src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-600/30 dark:border-emerald-500/50"
                    />
                    <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-xs flex items-center justify-center">
                      {/* Google G mini logo */}
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono leading-tight truncate max-w-[120px]">
                      {currentUser.email}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>

                {/* User Switcher & Google Login Dropdown */}
                {showUserMenu && (
                  <div
                    className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 text-right animate-in fade-in zoom-in-95 duration-150"
                    id="user-switcher-dropdown"
                  >
                    {/* User Profile Card */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/70 dark:border-slate-700/80 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                          alt={currentUser.name}
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            currentUser.role === 'admin' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          }`}>
                            {currentUser.role === 'admin' ? 'مدير النظام' : (currentUser.station_name || 'مدير محطة')}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all mt-1">
                        {currentUser.email}
                      </p>
                    </div>

                    {/* Dark Mode Switch Row in Menu */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 mb-2">
                      <div className="flex items-center gap-2">
                        {darkMode ? (
                          <Moon className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Sun className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">الوضع الليلي</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                          darkMode ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                        }`}
                        id="dropdown-darkmode-toggle"
                        title={darkMode ? 'تعطيل الوضع الليلي' : 'تفعيل الوضع الليلي'}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                      </button>
                    </div>

                    {/* Google Login / Switcher Button */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowGoogleModal(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors mb-2"
                      id="btn-switch-google-account"
                    >
                      <div className="flex items-center gap-2">
                        {/* Google Logo SVG */}
                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>تسجيل الدخول بحساب Google آخر</span>
                      </div>
                      <LogIn className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-1 space-y-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>تسجيل الخروج</span>
                      </button>

                      {/* Demo Data Management - ONLY FOR ADMIN */}
                      {isSystemManager && (
                        <>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowDemoDataModal(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            id="menu-demo-data-control"
                          >
                            <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>التحكم في البيانات التجريبية (مسح / استعادة)</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('هل تريد إعادة تعيين بيانات التطبيق إلى الوضع الافتراضي؟')) {
                                resetToDefaultData();
                                setShowUserMenu(false);
                                onNavigate('/admin');
                              }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إعادة ضبط البيانات الافتراضية</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Mobile & Tablet Sub-Navigation Strip (Visible only for System Manager) */}
        {isSystemManager && (
          <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800 bg-emerald-50/90 dark:bg-slate-900/90 px-4 py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max mx-auto justify-center">
              <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-800 text-white rounded-lg">
                مدير النظام
              </span>

              <button
                onClick={() => onNavigate('/admin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentRoute === '/admin' || currentRoute.startsWith('/admin')
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                لوحة الإدارة
              </button>

              <button
                onClick={() => onNavigate('/station')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentRoute === '/station' || currentRoute.startsWith('/station/')
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Fuel className="w-3.5 h-3.5" />
                شاشة المحطة
              </button>

              <button
                onClick={handleLockAdmin}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200"
              >
                <Lock className="w-3 h-3" />
                <span>قفل الإدارة</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Secret System Manager PIN Login Modal (Triggered by 5 clicks on logo) */}
      <SystemAdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onSuccess={() => onNavigate('/admin')}
      />

      {/* Google Login Modal */}
      <GoogleLoginModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />

      {/* Demo Data Modal */}
      <DemoDataModal
        isOpen={showDemoDataModal}
        onClose={() => setShowDemoDataModal(false)}
        onGoToUsers={() => onNavigate('/admin')}
      />
    </>
  );
};
