// components/common/Navbar.jsx — Tailwind CSS version
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getStoredUser, getToken } from '../../utils/authUtils.js';
import { authService } from '../../services/index.js';
import { useNotifications } from '../../hooks/index.jsx';
import { Avatar } from './index';

const Navbar = ({ transparent = false }) => {
  const user = getStoredUser();
  const isAuth = !!getToken();
  const logout = () => authService.logout();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const imgURL ="./asyad-logo.png"

  const isSolid = !transparent || scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[500] h-[76px] transition-all duration-300
      ${isSolid
        ? 'bg-white/96 backdrop-blur-[20px] border-b border-border shadow-[0_1px_12px_rgba(0,0,0,0.05)]'
        : 'bg-transparent'
      }`}
    >
      <div className="max-w-8xl mx-auto h-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-[120px] flex items-center justify-between gap-4 sm:gap-8">
        {/* Logo */}
        <Link 
          to="/"
          className="flex items-center gap-2 shrink-0"
        >
          <img src={imgURL} alt="ASYAD Logo" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-[100px] lg:h-[100px] object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="flex gap-8 items-center max-lg:hidden">
          {navLinks.map(({ to, label }) => {
            const active = (to === '/' && location.pathname === '/') || (to !== '/' && isActive(to));
            return (
              <Link
                key={to}
                to={to}
                className={`nav-link-underline text-[14px] font-medium transition-colors duration-200
                  ${isSolid
                    ? active ? 'text-blue font-semibold active' : 'text-gray hover:text-dark'
                    : active ? 'text-white active' : 'text-white/80 hover:text-white'
                  } ${active ? 'active' : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {isAuth ? (
            <div
              className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer relative px-2 sm:px-[10px] py-[6px] rounded-md transition-all duration-200 min-w-0
                ${isSolid ? 'hover:bg-gray-light' : ''}`}
              onClick={() => setDropOpen((o) => !o)}
            >
              {/* Notification bell */}
              <div className="relative cursor-pointer shrink-0">
                <span className="text-base sm:text-[20px]">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-[5px] -right-[6px] bg-red text-white text-[10px] font-bold
                    min-w-[18px] h-[18px] rounded-[9px] flex items-center justify-center px-1
                    border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <Avatar name={user?.fullName || user?.userName || 'U'} size="sm" />
              <span className={`text-[13px] sm:text-[14px] font-semibold truncate max-w-[80px] sm:max-w-none max-lg:hidden ${isSolid ? 'text-dark' : 'text-white'}`}>
                {user?.fullName?.split(' ')[0] || user?.userName?.split(' ')[0] || 'U'}
              </span>
              <span className={`text-[11px] max-lg:hidden ${isSolid ? 'text-gray' : 'text-white'}`}>▾</span>

              {/* Dropdown */}
              {dropOpen && (
                <div
                  className="absolute top-[calc(100%+10px)] right-0 bg-white rounded-xl border border-border shadow-lg w-[260px] max-w-[calc(100vw-2rem)] overflow-hidden z-[600] animate-fade-down"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-3 items-center px-5 py-4 bg-gray-light border-b border-border">
                    <Avatar name={user?.fullName || 'U'} size="md" />
                    <div>
                      <p className="text-[14px] font-bold text-dark">{user?.fullName}</p>
                      <p className="text-[12px] text-gray mt-[1px]">{user?.email}</p>
                    </div>
                  </div>
                  <div className="py-2">
                    {user?.isAdmin && (
                      <Link to="/dashboard" className="flex items-center gap-[10px] px-5 py-[10px] text-[14px] text-dark hover:bg-gray-light transition-colors duration-150 cursor-pointer w-full">
                        📊 Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-[10px] px-5 py-[10px] text-[14px] text-dark hover:bg-gray-light transition-colors duration-150 cursor-pointer w-full">👤 Profile</Link>
                    <Link to="/my-requests" className="flex items-center gap-[10px] px-5 py-[10px] text-[14px] text-dark hover:bg-gray-light transition-colors duration-150 cursor-pointer w-full">📋 My Requests</Link>
                    <Link to="/my-appointments" className="flex items-center gap-[10px] px-5 py-[10px] text-[14px] text-dark hover:bg-gray-light transition-colors duration-150 cursor-pointer w-full">📅 My Appointments</Link>
                    <Link to="/my-payments" className="flex items-center gap-[10px] px-5 py-[10px] text-[14px] text-dark hover:bg-gray-light transition-colors duration-150 cursor-pointer w-full">💳 My Payments</Link>
                    <Link to="/favorites" className="flex items-center gap-[10px] px-5 py-[10px] text-[14px] text-dark hover:bg-gray-light transition-colors duration-150 cursor-pointer w-full">❤️ Favorites</Link>
                    <hr className="border-none border-t border-border my-1" />
                    <button className="flex items-center gap-[10px] px-5 py-[10px] text-[14px] text-red hover:bg-gray-light transition-colors duration-150 cursor-pointer w-full text-left" onClick={logout}>
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2 sm:gap-3 shrink-0">
              <Link
                to={{ pathname: '/login', state: { from: location.pathname + (location.search || '') } }}
                className={`px-4 sm:px-[22px] py-2 sm:py-[10px] rounded-pill text-[13px] sm:text-[14px] font-semibold transition-all duration-200 border-[1.5px] whitespace-nowrap
                  ${isSolid
                    ? 'border-border text-dark hover:border-blue hover:text-blue'
                    : 'border-white/40 text-white'
                  }`}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className={`px-4 sm:px-[22px] py-2 sm:py-[10px] rounded-pill text-[13px] sm:text-[14px] font-semibold transition-all duration-200 whitespace-nowrap
                  ${isSolid ? 'bg-dark text-white hover:bg-blue' : 'bg-blue text-white hover:bg-blue-dark'}`}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="hidden max-lg:flex flex-col gap-[5px] p-2 cursor-pointer"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`block w-6 h-[2px] rounded-sm transition-all duration-200 ${isSolid ? 'bg-dark' : 'bg-white'}`} />
            <span className={`block w-6 h-[2px] rounded-sm transition-all duration-200 ${isSolid ? 'bg-dark' : 'bg-white'}`} />
            <span className={`block w-6 h-[2px] rounded-sm transition-all duration-200 ${isSolid ? 'bg-dark' : 'bg-white'}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-white border-t border-border px-4 sm:px-6 pb-6 pt-4 flex flex-col gap-0 animate-fade-down max-h-[85vh] overflow-y-auto">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="block py-3 px-2 text-[15px] font-medium text-dark border-b border-gray-light">
              {label}
            </Link>
          ))}
          {isAuth && (
            <>
              <hr className="border-t border-border my-2" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">My account</span>
              {user?.isAdmin && (
                <Link to="/dashboard" className="flex items-center gap-2 py-3 px-2 text-[15px] text-dark border-b border-gray-light">📊 Dashboard</Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 py-3 px-2 text-[15px] text-dark border-b border-gray-light">👤 Profile</Link>
              <Link to="/my-requests" className="flex items-center gap-2 py-3 px-2 text-[15px] text-dark border-b border-gray-light">📋 My Requests</Link>
              <Link to="/my-appointments" className="flex items-center gap-2 py-3 px-2 text-[15px] text-dark border-b border-gray-light">📅 My Appointments</Link>
              <Link to="/my-payments" className="flex items-center gap-2 py-3 px-2 text-[15px] text-dark border-b border-gray-light">💳 My Payments</Link>
              <Link to="/favorites" className="flex items-center gap-2 py-3 px-2 text-[15px] text-dark border-b border-gray-light">❤️ Favorites</Link>
            </>
          )}
          <hr className="border-t border-border my-2" />
          {isAuth ? (
            <button onClick={logout} className="block py-3 px-2 text-[15px] text-red text-left font-medium">🚪 Logout</button>
          ) : (
            <>
              <Link to={{ pathname: '/login', state: { from: location.pathname + (location.search || '') } }} className="block py-3 px-2 text-[15px] font-medium text-dark border-b border-gray-light">Log In</Link>
              <Link to="/register" className="block py-3 px-2 text-[15px] font-medium text-dark border-b border-gray-light">Sign Up</Link>
            </>
          )}
        </div>
      )}

      {dropOpen && <div className="fixed inset-0 z-[499]" onClick={() => setDropOpen(false)} />}
    </nav>
  );
};

export default Navbar;
