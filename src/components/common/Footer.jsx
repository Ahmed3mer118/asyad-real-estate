// components/common/Footer.jsx — Tailwind CSS version
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-dark2 text-[#ccc] relative">
    <div className="max-w-8xl mx-auto px-[120px] pt-[72px] pb-12 grid grid-cols-[2fr_1fr_1fr_1fr] gap-12
      max-lg:px-8 max-lg:grid-cols-[1fr_1fr] max-lg:pt-12
      max-[600px]:grid-cols-1 max-[600px]:px-5 max-[600px]:pt-10 max-[600px]:pb-20">

      {/* Brand */}
      <div>
        <span className="font-display text-[32px] font-black text-white block mb-4">ASYAD</span>
        <p className="text-[14px] leading-[1.7] text-[#888] mb-6">
          Discover the perfect property with Asyad.<br />
          We connect you with the best homes in Egypt.
        </p>
        <div className="flex gap-[10px]">
          {['Fb', 'In', 'X'].map((s) => (
            <a
              key={s}
              href="#"
              className="w-[38px] h-[38px] rounded-full border border-[#333] flex items-center justify-center
                text-[12px] font-bold text-[#888] transition-all duration-200 hover:border-blue hover:text-blue"
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      {/* Explore */}
      <div>
        <p className="text-[14px] font-bold text-white mb-5">Explore</p>
        <div className="flex flex-col gap-3">
          <Link to="/explore?type=Apartment" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">Apartments</Link>
          <Link to="/explore?type=Villa" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">Villas</Link>
          <Link to="/explore?type=Office" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">Offices</Link>
          <Link to="/explore" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">New Projects</Link>
        </div>
      </div>

      {/* Company */}
      <div>
        <p className="text-[14px] font-bold text-white mb-5">Company</p>
        <div className="flex flex-col gap-3">
          <Link to="/about" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">About Us</Link>
          <Link to="/contact" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">Contact</Link>
        </div>
      </div>

      {/* Support */}
      <div>
        <p className="text-[14px] font-bold text-white mb-5">Support</p>
        <div className="flex flex-col gap-3">
          <a href="#" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">Help Center</a>
          <a href="#" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">Terms of Service</a>
          <a href="#" className="text-[14px] text-[#888] hover:text-white transition-colors duration-200">Privacy Policy</a>
        </div>
      </div>
    </div>

  

    {/* WhatsApp FAB */}
    <a
      href="https://wa.me/201033705805"
      className="absolute bottom-20 right-10 w-14 h-14 bg-whatsapp rounded-full flex items-center justify-center
        text-[24px] shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-200 hover:scale-110 no-underline"
      target="_blank"
      rel="noreferrer"
      aria-label="Contact us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" aria-hidden="true">
        <path d="M19.11 17.2c-.26-.13-1.52-.75-1.76-.83-.23-.09-.4-.13-.57.13-.17.26-.66.83-.81 1-.15.17-.3.19-.56.06-.26-.13-1.08-.4-2.05-1.27-.76-.68-1.27-1.52-1.41-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.4-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.57-1.38-.78-1.89-.2-.49-.41-.43-.57-.43l-.48-.01c-.17 0-.45.06-.68.32-.23.26-.88.86-.88 2.1s.9 2.45 1.03 2.62c.13.17 1.76 2.69 4.27 3.77.6.26 1.07.42 1.44.54.61.19 1.16.16 1.6.1.49-.07 1.52-.62 1.74-1.22.21-.6.21-1.11.15-1.22-.06-.11-.23-.17-.49-.3z" />
        <path d="M16.01 3.2c-6.99 0-12.66 5.67-12.66 12.66 0 2.23.58 4.41 1.68 6.33L3.2 28.8l6.78-1.78a12.62 12.62 0 0 0 6.03 1.53h.01c6.99 0 12.66-5.67 12.66-12.66S23 3.2 16.01 3.2zm0 23.09h-.01a10.4 10.4 0 0 1-5.29-1.44l-.38-.23-4.02 1.05 1.07-3.92-.25-.4a10.39 10.39 0 0 1-1.59-5.55c0-5.74 4.67-10.41 10.41-10.41 2.78 0 5.39 1.08 7.36 3.05a10.34 10.34 0 0 1 3.05 7.36c0 5.74-4.67 10.41-10.4 10.41z" />
      </svg>
    </a>
  </footer>
);

export default Footer;
