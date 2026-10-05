import React, { useEffect, useState } from 'react';
import { CargasProvider, useCargas } from './context/CargasContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StationView } from './components/station/StationView';
import { StationAnalytics } from './components/station/StationAnalytics';
import { ScanAssetView } from './components/scan/ScanAssetView';
import { InviteAcceptView } from './components/auth/InviteAcceptView';
import { EmployeeMatchingView } from './components/station/EmployeeMatchingView';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function AppContent() {
  const { currentUser, stations, setSelectedStationId, switchRole, addNotification } = useCargas();
  const isAdmin = currentUser?.role === 'admin';

  // Simple client-side router supporting /, /admin, /station, /match, /station-analytics, /scan/:code, /invite/:token, ?invite=..., ?station=..., ?task=match
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isMatchingTask, setIsMatchingTask] = useState<boolean>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('task') === 'match' || window.location.pathname === '/match' || window.location.pathname.startsWith('/match/');
  });

  const [inviteToken, setInviteToken] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromQuery = urlParams.get('invite');
    if (fromQuery) return fromQuery;
    const match = window.location.pathname.match(/^\/invite\/(.+)/);
    return match ? decodeURIComponent(match[1]) : '';
  });

  const [scanCode, setScanCode] = useState<string>(() => {
    const match = window.location.pathname.match(/^\/scan\/(.+)/);
    return match ? decodeURIComponent(match[1]) : '';
  });

  // Handle direct station links sent via WhatsApp (e.g. ?station=st-1 or ?station=ST-01)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stationQuery = urlParams.get('station');
    if (stationQuery && stations.length > 0) {
      const qLower = stationQuery.toLowerCase().trim();
      const matched = stations.find(
        s => s.id.toLowerCase() === qLower ||
             s.code.toLowerCase() === qLower ||
             s.name.toLowerCase().includes(qLower)
      );
      if (matched) {
        setSelectedStationId(matched.id);
        switchRole('station_manager', matched.id);
        setCurrentPath('/station');
        addNotification({
          title: 'دخول مباشر عبر رابط الواتساب',
          message: `تم فتح منظومة كارجاس مباشرة على محطة ${matched.name} للتأكيد على وجود الأصول ومطابقتها.`,
          type: 'success',
          date: 'الآن'
        });
      }
    }
  }, [stations, setSelectedStationId, switchRole, addNotification]);

  // Guard: If regular user is on an admin/landing/analytics route, redirect them to their user data tables page (/station)
  useEffect(() => {
    if (!isAdmin && (currentPath === '/' || currentPath.startsWith('/admin') || currentPath === '/station-analytics')) {
      setCurrentPath('/station');
      window.history.replaceState({}, '', '/station');
    }
  }, [isAdmin, currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);

      const urlParams = new URLSearchParams(window.location.search);
      const fromQuery = urlParams.get('invite');
      const matchInvite = path.match(/^\/invite\/(.+)/);
      if (fromQuery) {
        setInviteToken(fromQuery);
      } else if (matchInvite) {
        setInviteToken(decodeURIComponent(matchInvite[1]));
      }

      const matchScan = path.match(/^\/scan\/(.+)/);
      if (matchScan) {
        setScanCode(decodeURIComponent(matchScan[1]));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    // If not admin and trying to go to admin or home or analytics, keep on station
    if (!isAdmin && (path === '/' || path.startsWith('/admin') || path === '/station-analytics')) {
      window.history.pushState({}, '', '/station');
      setCurrentPath('/station');
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);

    const matchScan = path.match(/^\/scan\/(.+)/);
    if (matchScan) {
      setScanCode(decodeURIComponent(matchScan[1]));
    }

    const matchInvite = path.match(/^\/invite\/(.+)/);
    if (matchInvite) {
      setInviteToken(decodeURIComponent(matchInvite[1]));
    }
  };

  const handleScanCode = (code: string) => {
    setScanCode(code);
    navigateTo(`/scan/${encodeURIComponent(code)}`);
  };

  const handleTestInvite = (token: string) => {
    setInviteToken(token);
    navigateTo(`/?invite=${encodeURIComponent(token)}`);
  };

  const clearInvite = () => {
    setInviteToken('');
    // Strip ?invite= from URL without reloading
    const cleanUrl = isAdmin ? window.location.pathname : '/station';
    window.history.replaceState({}, '', cleanUrl);
    if (!isAdmin) setCurrentPath('/station');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-emerald-100 transition-colors duration-200" dir="rtl">
      {/* Top Bar */}
      <Navbar
        currentRoute={currentPath}
        onNavigate={navigateTo}
        onOpenScan={() => navigateTo('/scan')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        <ErrorBoundary fallbackTitle="حدث خطأ في عرض الشاشة الحالية">
          {/* If user clicked an invitation link or ?invite= token is present */}
          {inviteToken ? (
            <InviteAcceptView
              inviteToken={inviteToken}
              onNavigate={navigateTo}
              onClearInvite={clearInvite}
            />
          ) : (
            (() => {
              const cleanPath = (currentPath || '/').split('?')[0].replace(/\/+$/, '') || '/';
              const isHome = cleanPath === '/' || cleanPath === '/index.html';
              const isAdminRoute = cleanPath === '/admin' || cleanPath.startsWith('/admin/');
              const isStationRoute = cleanPath === '/station' || cleanPath.startsWith('/station/');
              const isAnalyticsRoute = cleanPath === '/station-analytics';
              const isScanRoute = cleanPath === '/scan' || cleanPath.startsWith('/scan/');
              const isMatchRoute = isMatchingTask || cleanPath === '/match' || cleanPath.startsWith('/match/');

              // Matching Assignment View for employees (direct WhatsApp task link)
              if (isMatchRoute) {
                return (
                  <EmployeeMatchingView
                    onBackToMain={() => {
                      setIsMatchingTask(false);
                      navigateTo('/');
                    }}
                  />
                );
              }

              if (!isAdmin) {
                return isScanRoute ? (
                  <ScanAssetView
                    initialCode={scanCode}
                    onBack={() => navigateTo('/station')}
                  />
                ) : (
                  <StationView />
                );
              }

              // Admin Views
              if (isHome) {
                return (
                  <LandingPage
                    onNavigate={navigateTo}
                    onScanCode={handleScanCode}
                  />
                );
              }
              if (isAdminRoute) {
                return (
                  <AdminDashboard
                    onTestInvite={handleTestInvite}
                  />
                );
              }
              if (isStationRoute) {
                return <StationView />;
              }
              if (isAnalyticsRoute) {
                return <StationAnalytics />;
              }
              if (isScanRoute) {
                return (
                  <ScanAssetView
                    initialCode={scanCode}
                    onBack={() => navigateTo('/')}
                  />
                );
              }

              // Guaranteed fallback so screen never turns blank
              return (
                <LandingPage
                  onNavigate={navigateTo}
                  onScanCode={handleScanCode}
                />
              );
            })()
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="منظومة إدارة أصول كارجاس">
      <CargasProvider>
        <AppContent />
      </CargasProvider>
    </ErrorBoundary>
  );
}
