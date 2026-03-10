// components/common/index.jsx — Tailwind CSS version
import React, { useEffect } from 'react';

/* ──────── BUTTON ──────── */
const variantMap = {
  primary: 'bg-blue text-white hover:bg-blue-dark hover:-translate-y-px hover:shadow-blue',
  dark: 'bg-dark text-white hover:bg-[#333] hover:-translate-y-px',
  outline: 'bg-transparent border border-border text-dark hover:border-blue hover:text-blue',
  ghost: 'bg-gray-light text-dark hover:bg-[#e9ecef]',
  danger: 'bg-red text-white hover:bg-[#dc2626]',
};
const sizeMap = {
  sm: 'px-[18px] h-9 text-[13px]',
  md: 'px-6 h-11 text-[14px]',
  lg: 'px-8 h-[52px] text-[16px]',
};

export const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, className = '', ...props
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-pill font-semibold
      transition-all duration-200 ease-smooth whitespace-nowrap border border-transparent cursor-pointer
      disabled:opacity-50 disabled:pointer-events-none
      ${variantMap[variant] || variantMap.primary}
      ${sizeMap[size] || sizeMap.md}
      ${loading ? 'opacity-75 pointer-events-none' : ''}
      ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <Spinner size="sm" /> : icon && <span className="text-base leading-none">{icon}</span>}
    {children}
  </button>
);

/* ──────── BADGE ──────── */
const badgeColorMap = {
  blue: 'bg-blue-light text-blue',
  green: 'bg-[#f0fdf4] text-[#16a34a]',
  red: 'bg-[#fef2f2] text-[#dc2626]',
  yellow: 'bg-[#fffbeb] text-[#d97706]',
  gray: 'bg-[#f1f5f9] text-[#64748b]',
  purple: 'bg-[#faf5ff] text-[#7c3aed]',
};
export const Badge = ({ children, color = 'gray', className = '' }) => (
  <span className={`inline-flex items-center px-[10px] py-[3px] rounded-pill text-[12px] font-semibold tracking-[0.3px]
    ${badgeColorMap[color] || badgeColorMap.gray} ${className}`}>
    {children}
  </span>
);

/* ──────── INPUT ──────── */
export const Input = React.forwardRef(({
  label, error, icon, hint, className = '', ...props
}, ref) => (
  <div className={`flex flex-col gap-[6px] ${error ? 'field-error-state' : ''} ${className}`}>
    {label && <label className="text-[13px] font-semibold text-dark">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-gray text-base pointer-events-none flex">{icon}</span>}
      <input
        ref={ref}
        className={`w-full h-12 px-4 border-[1.5px] rounded-md text-[14px] text-dark bg-white
          outline-none transition-all duration-200
          focus:border-blue focus:shadow-[0_0_0_3px_rgba(2,137,251,0.1)]
          ${error ? 'border-red' : 'border-border'}
          ${icon ? 'pl-[42px]' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-[12px] text-red">{error}</p>}
    {hint && !error && <p className="text-[12px] text-gray">{hint}</p>}
  </div>
));

/* ──────── SELECT ──────── */
export const Select = React.forwardRef(({
  label, error, options = [], placeholder, className = '', ...props
}, ref) => (
  <div className={`flex flex-col gap-[6px] ${className}`}>
    {label && <label className="text-[13px] font-semibold text-dark">{label}</label>}
    <div className="relative">
      <select
        ref={ref}
        className={`w-full h-12 px-4 border-[1.5px] rounded-md text-[14px] text-dark bg-white
          outline-none transition-all duration-200 cursor-pointer select-arrow
          focus:border-blue
          ${error ? 'border-red' : 'border-border'}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    {error && <p className="text-[12px] text-red">{error}</p>}
  </div>
));

/* ──────── TEXTAREA ──────── */
export const Textarea = React.forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className={`flex flex-col gap-[6px] ${className}`}>
    {label && <label className="text-[13px] font-semibold text-dark">{label}</label>}
    <textarea
      ref={ref}
      className={`w-full px-4 py-3 border-[1.5px] rounded-md text-[14px] text-dark bg-white
        outline-none transition-all duration-200 resize-y min-h-[100px]
        focus:border-blue focus:shadow-[0_0_0_3px_rgba(2,137,251,0.1)]
        ${error ? 'border-red' : 'border-border'}`}
      {...props}
    />
    {error && <p className="text-[12px] text-red">{error}</p>}
  </div>
));

/* ──────── SPINNER ──────── */
const spinnerSizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
const spinnerColorMap = { blue: 'text-blue', white: 'text-white', gray: 'text-gray' };
export const Spinner = ({ size = 'md', color = 'blue' }) => (
  <span
    className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin-fast
      ${spinnerSizeMap[size] || spinnerSizeMap.md}
      ${spinnerColorMap[color] || spinnerColorMap.blue}`}
    aria-label="loading"
  />
);

/* ──────── MODAL ──────── */
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const maxWMap = { sm: 'max-w-[420px]', md: 'max-w-[600px]', lg: 'max-w-[840px]' };
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in ${maxWMap[size] || maxWMap.md}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 pt-6 mb-5">
          <h3 className="font-display text-[22px] font-bold">{title}</h3>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray text-base
              transition-all duration-200 bg-gray-light hover:bg-border hover:text-dark"
            onClick={onClose}
          >✕</button>
        </div>
        <div className="px-7 pb-7">{children}</div>
      </div>
    </div>
  );
};

/* ──────── CARD ──────── */
export const Card = ({ children, className = '', padding = true, ...props }) => (
  <div
    className={`bg-white border border-border rounded-lg ${padding ? 'p-6' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

/* ──────── EMPTY STATE ──────── */
export const Empty = ({ icon = '📭', title = 'Nothing here', sub }) => (
  <div className="flex flex-col items-center py-[60px] px-6 gap-3">
    <span className="text-5xl">{icon}</span>
    <p className="text-[18px] font-semibold text-dark">{title}</p>
    {sub && <p className="text-[14px] text-gray">{sub}</p>}
  </div>
);

/* ──────── AVATAR ──────── */
const avatarSizeMap = { sm: 'w-8 h-8 text-[12px]', md: 'w-10 h-10 text-[14px]', lg: 'w-14 h-14 text-[18px]' };
const avatarColorMap = { blue: 'bg-blue-light text-blue', green: 'bg-[#f0fdf4] text-[#16a34a]', purple: 'bg-[#faf5ff] text-[#7c3aed]' };
export const Avatar = ({ name = '?', size = 'md', src, color = 'blue' }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden
      ${avatarSizeMap[size] || avatarSizeMap.md}
      ${avatarColorMap[color] || avatarColorMap.blue}`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
};

/* ──────── CONFIRM MODAL ──────── */
export const ConfirmModal = ({ open, onClose, onConfirm, title, message, danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-gray mb-6 leading-relaxed">{message}</p>
    <div className="flex gap-3 justify-end">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Button>
    </div>
  </Modal>
);
