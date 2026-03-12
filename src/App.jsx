// src/App.jsx — auth via token + role (no Context), redirect by role like Courses_platform
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getToken, getRole } from './utils/authUtils.js';
import { Spinner } from './components/common/index.jsx';
import './index.css';

/* ── LAZY PAGES ── */
const HomePage = lazy(() => import('./pages/user/Home/index.jsx'));
const ExplorePage = lazy(() => import('./pages/user/Explore/index.jsx'));
const LoginPage = lazy(() => import('./pages/user/Auth/index.jsx').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/user/Auth/index.jsx').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/user/Auth/index.jsx').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/user/Auth/index.jsx').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/user/Auth/index.jsx').then(m => ({ default: m.VerifyEmailPage })));
const OverviewPage = lazy(() => import('./pages/dashboard/Overview/index.jsx'));
const PropertiesPage = lazy(() => import('./pages/dashboard/Properties/index.jsx'));
const UsersPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.UsersPage })));
const RequestsPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.RequestsPage })));
const AppointmentsPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.AppointmentsPage })));
const PaymentsPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.PaymentsPage })));
const NotificationsPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.NotificationsPage })));
const EmployeesPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.EmployeesPage })));
const TransactionsPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.TransactionsPage })));
const TasksPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.TasksPage })));
const EvaluationsPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.EvaluationsPage })));
const FinancialsPage = lazy(() => import('./pages/dashboard/dashboardPages.jsx').then(m => ({ default: m.FinancialsPage })));
const ReportsPage = lazy(() => import('./pages/dashboard/Reports/index.jsx'));
const FavoritesReportPage = lazy(() => import('./pages/dashboard/FavoritesReport/index.jsx'));
const PropertyDetailPage = lazy(() => import('./pages/user/PropertyDetail/index.jsx'));
const MyAppointmentsPage = lazy(() => import('./pages/user/MyAppointments/index.jsx'));
const MyPaymentsPage = lazy(() => import('./pages/user/MyPayments/index.jsx'));
const ProfilePage = lazy(() => import('./pages/user/Profile/index.jsx'));
const ServicesPage = lazy(() => import('./pages/user/Services/index.jsx'));
const AboutPage = lazy(() => import('./pages/user/About/index.jsx'));
const ContactPage = lazy(() => import('./pages/user/Contact/index.jsx'));

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4">
    <span className="text-8xl font-black text-primary/20">404</span>
    <h1 className="font-display text-3xl font-bold text-dark">Page Not Found</h1>
    <p className="text-gray text-center max-w-md">The page you’re looking for doesn’t exist or was moved.</p>
    <a href="/" className="mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
      Back to Home
    </a>
  </div>
);

/* ── GUARDS (token + role from localStorage; redirect back after login) ── */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const token = getToken();
  if (!token) return <Navigate to="/login" state={{ from: location.pathname + (location.search || '') }} replace />;
  const role = getRole();
  const userRole = (role || '').toLowerCase();
  const allowed = allowedRoles.map((r) => String(r).toLowerCase());
  if (allowed.length > 0 && !allowed.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const token = getToken();
  if (!token) return children;
  const role = (getRole() || '').toLowerCase();
  if (role === 'admin') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/" replace />;
};

const SuspenseFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spinner size="lg" />
  </div>
);

/* On route change: scroll to top */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.documentElement.style.scrollBehavior = 'smooth';
  }, [pathname]);
  return null;
};

/* ── APP ── */
const App = () => (
  <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* ── USER ROUTES ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          {/* <Route path="/favorites" element={<PrivateRoute><ComingSoon title="My Favorites" /></PrivateRoute>} /> */}
          {/* <Route path="/my-requests" element={<PrivateRoute><ComingSoon title="My Requests" /></PrivateRoute>} /> */}
          <Route path="/my-appointments" element={<PrivateRoute><MyAppointmentsPage /></PrivateRoute>} />
          <Route path="/my-payments" element={<PrivateRoute><MyPaymentsPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* ── AUTH ROUTES ── */}
          <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
          <Route path="/reset-password" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />
          <Route path="/verify-email" element={<PublicOnly><VerifyEmailPage /></PublicOnly>} />

          {/* ── DASHBOARD ROUTES (protected by role) ── */}
          <Route path="/dashboard" element={<PrivateRoute allowedRoles={['admin']}><OverviewPage /></PrivateRoute>} />
          <Route path="/dashboard/properties" element={<PrivateRoute allowedRoles={['admin']}><PropertiesPage /></PrivateRoute>} />
          <Route path="/dashboard/users" element={<PrivateRoute allowedRoles={['admin']}><UsersPage /></PrivateRoute>} />
          <Route path="/dashboard/requests" element={<PrivateRoute allowedRoles={['admin']}><RequestsPage /></PrivateRoute>} />
          <Route path="/dashboard/appointments" element={<PrivateRoute allowedRoles={['admin']}><AppointmentsPage /></PrivateRoute>} />
          <Route path="/dashboard/payments" element={<PrivateRoute allowedRoles={['admin']}><PaymentsPage /></PrivateRoute>} />
          <Route path="/dashboard/employees" element={<PrivateRoute allowedRoles={['admin']}><EmployeesPage /></PrivateRoute>} />
          <Route path="/dashboard/notifications" element={<PrivateRoute allowedRoles={['admin']}><NotificationsPage /></PrivateRoute>} />
          <Route path="/dashboard/transactions" element={<PrivateRoute allowedRoles={['admin']}><TransactionsPage /></PrivateRoute>} />
          <Route path="/dashboard/tasks" element={<PrivateRoute allowedRoles={['admin']}><TasksPage /></PrivateRoute>} />
          <Route path="/dashboard/evaluations" element={<PrivateRoute allowedRoles={['admin']}><EvaluationsPage /></PrivateRoute>} />
          <Route path="/dashboard/financials" element={<PrivateRoute allowedRoles={['admin']}><FinancialsPage /></PrivateRoute>} />
          <Route path="/dashboard/reports" element={<PrivateRoute allowedRoles={['admin']}><ReportsPage /></PrivateRoute>} />
          <Route path="/dashboard/favorites" element={<PrivateRoute allowedRoles={['admin']}><FavoritesReportPage /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
);

export default App;
