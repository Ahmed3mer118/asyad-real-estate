// pages/user/Profile/index.jsx — My Profile (professional layout)
import { Link } from 'react-router-dom';
import UserLayout from '../../../layouts/UserLayout.jsx';
import { getStoredUser } from '../../../utils/authUtils.js';
import { Avatar } from '../../../components/common/index.jsx';

const ProfilePage = () => {
  const user = getStoredUser();

  if (!user) {
    return (
      <UserLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-gray">You must be logged in to view your profile.</p>
          <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-dark mb-8">Profile</h1>

        <div className="max-w-xl bg-white rounded-2xl border border-slate-200 shadow-[0_1px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar name={user.fullName || user.username || 'U'} size="lg" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-xl font-bold text-dark">{user.fullName || user.username || '—'}</h2>
              <p className="text-gray mt-1">{user.email || '—'}</p>
              {user.role && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.role}
                </span>
              )}
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact</h3>
                <p className="text-sm text-slate-600">Email: {user.email || '—'}</p>
                <p className="text-sm text-slate-600">Phone: {user.phoneNumber || user.phone_number || '—'}</p>
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Services</h3>
                <p className="text-sm text-slate-600">Browse properties, book viewings, and manage your appointments.</p>
                <Link to="/services" className="text-sm font-semibold text-primary hover:underline mt-1 inline-block">View all services →</Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                <Link
                  to="/my-appointments"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-primary transition-colors"
                >
                  My Appointments
                </Link>
                <Link
                  to="/my-payments"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
                >
                  My Payments & Installments
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-dark text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
                >
                  Explore Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ProfilePage;
