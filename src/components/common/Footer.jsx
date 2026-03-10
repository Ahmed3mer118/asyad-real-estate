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
    >
      💬
    </a>
  </footer>
);

export default Footer;
