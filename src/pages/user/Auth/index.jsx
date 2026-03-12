// pages/user/Auth/index.jsx — Tailwind CSS version
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService, userService } from '../../../services/index.js';
import { getUserIdFromToken, getRole } from '../../../utils/authUtils.js';
import { toast , ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const USER_KEY = 'asyad_user';

/* ─── Shared Split Layout ─── */
const AuthLayout = ({ quote, sub, children }) => (
  <div className="flex min-h-screen flex-col md:flex-row">
    {/* Left panel — hidden on small screens */}
    <div className="w-full md:w-1/2 relative overflow-hidden flex flex-col px-6 sm:px-10 md:px-[60px] py-8 md:py-10 hidden md:flex"
      style={{ background: 'linear-gradient(135deg, #050d1f 0%, #0c2040 50%, #174a8a 100%)' }}>
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(2,137,251,0.22) 0%, transparent 70%)' }} />
      <Link to="/" className="font-display text-2xl md:text-[28px] font-black text-white relative z-10 tracking-tight">ASYAD</Link>
      <div className="flex-1 flex flex-col justify-end pb-10 md:pb-[60px] relative z-10">
        <h2 className="font-display text-3xl sm:text-4xl md:text-[48px] font-black text-white leading-[1.1] mb-3">{quote}</h2>
        <p className="text-sm md:text-[16px] text-white/60">{sub}</p>
      </div>
    </div>

    {/* Right panel — full width on mobile (page scroll only, no inner scroll) */}
    <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 bg-white min-h-[60vh] md:min-h-0">
      <div className="w-full max-w-[460px] py-4">{children}</div>
    </div>
  </div>
);

/* ── Shared input style ── */
const inputCls = `w-full h-[52px] px-4 border-[1.5px] border-border rounded-md text-[14px] text-dark
  outline-none transition-all duration-200 bg-white
  focus:border-blue focus:shadow-[0_0_0_3px_rgba(2,137,251,0.1)]`;

/* ─── LOGIN ─── (redirect back to same page after login) */
export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(form.email, form.password);
      const { data } = await userService.getMe();
      const user = data?.user || {};
      if (!user.id && user._id) user.id = user._id;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      toast.success('Welcome back! 👋');
      const role = (user.role || '').toLowerCase();
      if (role === 'admin') {
        navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
      } else {
        navigate(from && from !== '/login' ? from : '/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout quote="Find your dream home today." sub="Join 10,000+ happy homeowners.">
      <ToastContainer position="bottom-right" autoClose={3500} hideProgressBar />
      <h1 className="font-display text-2xl sm:text-[28px] md:text-[30px] font-bold text-dark mb-2">Welcome Back! 👋</h1>
      <p className="text-sm sm:text-[15px] text-gray mb-6 sm:mb-8">Enter your details to access your account.</p>

      <form className="flex flex-col gap-5 mb-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">Email Address</label>
          <input type="email" placeholder="name@example.com" required className={inputCls}
            value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="••••••••" required
              className={`${inputCls} pr-16`}
              value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <button type="button"
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[13px] font-semibold text-blue cursor-pointer bg-transparent border-none"
              onClick={() => setShowPass((s) => !s)}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="text-[13px] text-blue font-semibold">Forgot Password?</Link>
        </div>
        <button type="submit"
          className="w-full h-[52px] bg-dark text-white border-none rounded-md text-[15px] font-bold cursor-pointer
            transition-all duration-200 hover:bg-blue disabled:opacity-65 disabled:cursor-default"
          disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[13px] text-gray mb-4
        before:content-[''] before:flex-1 before:h-px before:bg-border
        after:content-[''] after:flex-1 after:h-px after:bg-border">
        <span>Or</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {['🔵 Google', '🍎 Apple'].map((s) => (
          <button key={s}
            className="h-12 border-[1.5px] border-border rounded-md text-[14px] font-semibold text-dark
              cursor-pointer bg-white transition-all duration-200 hover:border-blue hover:text-blue">
            {s}
          </button>
        ))}
      </div>
      <p className="text-[14px] text-gray text-center">
        Don't have an account? <Link to="/register" className="text-blue font-bold">Sign Up</Link>
      </p>
    </AuthLayout>
  );
};

/* ─── REGISTER ─── */
export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'User', agree: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agree) { toast.error('Please accept the Terms & Privacy Policy'); return; }
    setLoading(true);
    try {
      await authService.register({
        username: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success('Account created! Check your email for the verification code.');
      navigate('/verify-email', { state: { email: form.email }, replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout quote="Join the exclusive community." sub="Access thousands of premium listings.">
      <h1 className="font-display text-2xl sm:text-[28px] md:text-[30px] font-bold text-dark mb-2">Create an Account ✨</h1>
      <p className="text-sm sm:text-[15px] text-gray mb-6 sm:mb-8">Start your journey with Asyad today.</p>

      <form className="flex flex-col gap-5 mb-6" onSubmit={handleSubmit}>
        {[
          { label: 'Full Name', type: 'text', field: 'fullName', placeholder: 'Your full name' },
          { label: 'Email Address', type: 'email', field: 'email', placeholder: 'name@example.com' },
        ].map(({ label, type, field, placeholder }) => (
          <div key={field} className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-dark">{label}</label>
            <input type={type} placeholder={placeholder} required className={inputCls}
              value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
          </div>
        ))}

        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" required minLength={8}
              className={`${inputCls} pr-16`}
              value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <button type="button"
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[13px] font-semibold text-blue cursor-pointer bg-transparent border-none"
              onClick={() => setShowPass((s) => !s)}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">I am a</label>
          <select className={`${inputCls} select-arrow cursor-pointer`}
            value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            <option value="User">Tenant / Buyer</option>
            <option value="Owner">Property Owner</option>
          </select>
        </div>

        <label className="flex items-center gap-[10px] text-[14px] text-dark cursor-pointer">
          <input type="checkbox" className="w-[17px] h-[17px] cursor-pointer accent-blue"
            checked={form.agree} onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))} />
          <span>I agree to the <a href="#" className="text-blue">Terms &amp; Privacy Policy</a></span>
        </label>

        <button type="submit"
          className="w-full h-[52px] bg-dark text-white border-none rounded-md text-[15px] font-bold cursor-pointer
            transition-all duration-200 hover:bg-blue disabled:opacity-65 disabled:cursor-default"
          disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[13px] text-gray mb-4
        before:content-[''] before:flex-1 before:h-px before:bg-border
        after:content-[''] after:flex-1 after:h-px after:bg-border">
        <span>Or</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {['🔵 Google', '🍎 Apple'].map((s) => (
          <button key={s}
            className="h-12 border-[1.5px] border-border rounded-md text-[14px] font-semibold text-dark
              cursor-pointer bg-white transition-all duration-200 hover:border-blue hover:text-blue">
            {s}
          </button>
        ))}
      </div>
      <p className="text-[14px] text-gray text-center">
        Already have an account? <Link to="/login" className="text-blue font-bold">Log In</Link>
      </p>
    </AuthLayout>
  );
};

/* ─── VERIFY EMAIL (after create account) ─── */
export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || '';
  const [form, setForm] = useState({ email: prefilledEmail, code: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyCode(form.email.trim(), form.code.trim());
      toast.success('Email verified! You can log in now.');
      navigate('/login', { state: { verified: true }, replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout quote="Verify your email." sub="Enter the 6-digit code we sent to your inbox.">
      <h1 className="font-display text-[30px] font-bold text-dark mb-2">Verify your email ✉️</h1>
      <p className="text-[15px] text-gray mb-8">Check your email and enter the verification code below.</p>

      <form className="flex flex-col gap-5 mb-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">Email Address</label>
          <input type="email" placeholder="name@example.com" required className={inputCls}
            value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">Verification code</label>
          <input type="text" placeholder="6-digit code" required maxLength={6} className={inputCls}
            value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, '') }))} />
        </div>
        <button type="submit"
          className="w-full h-[52px] bg-dark text-white border-none rounded-md text-[15px] font-bold cursor-pointer
            transition-all duration-200 hover:bg-blue disabled:opacity-65 disabled:cursor-default"
          disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <p className="text-[14px] text-gray text-center">
        <Link to="/login" className="text-blue font-bold">← Back to Log In</Link>
      </p>
    </AuthLayout>
  );
};

/* ─── FORGOT PASSWORD ─── */
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgetPassword(email);
      setSent(true);
      toast.success('Reset code sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to send reset code');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout quote="Don't worry, we got you." sub="Recover your account in seconds.">
      <h1 className="font-display text-[30px] font-bold text-dark mb-2">Forgot Password? 🔒</h1>
      <p className="text-[15px] text-gray mb-8">Enter your email and we'll send you a reset link.</p>

      {sent ? (
        <div className="flex flex-col items-center gap-3 text-center p-10 bg-gray-light rounded-lg my-5">
          <span className="text-5xl">✅</span>
          <p>We've sent a reset link to <strong>{email}</strong>.</p>
          <p className="text-[13px] text-gray mt-2">Check your spam folder if you don't see it.</p>
        </div>
      ) : (
        <form className="flex flex-col gap-5 mb-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-dark">Email Address</label>
            <input type="email" placeholder="name@example.com" required className={inputCls}
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit"
            className="w-full h-[52px] bg-dark text-white border-none rounded-md text-[15px] font-bold cursor-pointer
              transition-all duration-200 hover:bg-blue disabled:opacity-65 disabled:cursor-default"
            disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <div className="text-[14px] text-gray text-center mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link to="/login" className="text-blue font-bold">← Back to Log In</Link>
        <span>·</span>
        <Link to="/reset-password" className="text-blue font-bold">I have a code</Link>
      </div>
    </AuthLayout>
  );
};

/* ─── RESET PASSWORD (with code from email) ─── */
export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', resetCode: '', newPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(form);
      toast.success('Password reset successfully. You can log in now.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout quote="Set a new password." sub="Use the code we sent to your email.">
      <h1 className="font-display text-[30px] font-bold text-dark mb-2">Reset Password 🔑</h1>
      <p className="text-[15px] text-gray mb-8">Enter your email, code, and new password.</p>

      <form className="flex flex-col gap-5 mb-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">Email</label>
          <input type="email" placeholder="name@example.com" required className={inputCls}
            value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">Verification code</label>
          <input type="text" placeholder="6-digit code" required className={inputCls}
            value={form.resetCode} onChange={(e) => setForm((f) => ({ ...f, resetCode: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-dark">New password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" required minLength={8}
              className={`${inputCls} pr-16`}
              value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
            <button type="button"
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[13px] font-semibold text-blue cursor-pointer bg-transparent border-none"
              onClick={() => setShowPass((s) => !s)}>{showPass ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <button type="submit"
          className="w-full h-[52px] bg-dark text-white border-none rounded-md text-[15px] font-bold cursor-pointer
            transition-all duration-200 hover:bg-blue disabled:opacity-65 disabled:cursor-default"
          disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className="text-[14px] text-gray text-center">
        <Link to="/login" className="text-blue font-bold">← Back to Log In</Link>
      </p>
    </AuthLayout>
  );
};
