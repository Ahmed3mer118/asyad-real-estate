// layouts/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredUser } from '../utils/authUtils.js';
import { authService } from '../services/index.js';
import { useNotifications } from '../hooks/index.jsx';
import { Avatar, Badge } from '../components/common/index.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NAV_ITEMS = [
  { icon: '📊', label: 'Overview', path: '/dashboard' },
  { icon: '🏠', label: 'Properties', path: '/dashboard/properties' },
  { icon: '📋', label: 'Requests', path: '/dashboard/requests' },
  { icon: '📅', label: 'Appointments', path: '/dashboard/appointments' },
  { icon: '💳', label: 'Payments', path: '/dashboard/payments' },
  { icon: '👥', label: 'Users', path: '/dashboard/users' },
  { icon: '👷', label: 'Employees', path: '/dashboard/employees' },
  { icon: '🧾', label: 'Transactions', path: '/dashboard/transactions' },
  { icon: '💰', label: 'Financials', path: '/dashboard/financials' },
  { icon: '📈', label: 'Reports', path: '/dashboard/reports' },
  { icon: '❤️', label: 'Favorites', path: '/dashboard/favorites' },
  { icon: '📋', label: 'Tasks', path: '/dashboard/tasks' },
  { icon: '⭐', label: 'Evaluations', path: '/dashboard/evaluations' },
  { icon: '🔔', label: 'Notifications', path: '/dashboard/notifications' },
];

const DashboardLayout = ({ children }) => {
  const user = getStoredUser();
  const logout = () => authService.logout();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-dashboard-page">
      {/* ── MOBILE OVERLAY ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-[100] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 bg-dashboard-sidebar text-slate-300 z-[110] transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50 h-16">
          <Link to="/" className="text-xl font-black text-primary tracking-tighter hover:scale-105 transition-transform">
            {collapsed ? 'A' : 'ASYAD'}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {collapsed ? '›' : '‹'}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] dashboard-sidebar-nav">
          {NAV_ITEMS.map(({ icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive(path)
                  ? 'bg-blue/10 text-blue shadow-[0_0_15px_rgba(2,137,251,0.1)]'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
              title={collapsed ? label : undefined}
            >
              <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{icon}</span>
              {(!collapsed || mobileOpen) && <span className="flex-1 truncate">{label}</span>}
              {(!collapsed || mobileOpen) && label === 'Notifications' && unreadCount > 0 && (
                <Badge color="red" className="scale-75 origin-right">{unreadCount}</Badge>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50 bg-dashboard-sidebar">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar name={user?.fullName || 'A'} size="sm" className="ring-2 ring-slate-800" />
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-red/10 hover:text-red transition-all group"
          >
            <span className="text-lg group-hover:rotate-12 transition-transform">🚪</span>
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
        {/* Topbar */}
        <header className="h-16 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="text-xl">☰</span>
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight">
              {NAV_ITEMS.find((n) => isActive(n.path))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <button
              onClick={() => navigate('/dashboard/notifications')}
              className="relative p-2 text-slate-500 hover:text-blue hover:bg-blue/5 rounded-full transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white ring-1 ring-red/20 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue border border-blue/20 rounded-full hover:bg-blue hover:text-white hover:border-blue transition-all"
            >
              <span>←</span>
              <span>Visit Site</span>
            </Link>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <Avatar name={user?.fullName || 'A'} size="sm" className="cursor-pointer hover:ring-4 hover:ring-primary/10 transition-all" />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 flex-1">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-[1400px] mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar
        toastClassName="!rounded-2xl !shadow-xl !border-0"
      />
    </div>
  );
};

export default DashboardLayout;
