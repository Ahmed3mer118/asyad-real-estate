// pages/user/Home/index.jsx — Tailwind CSS version
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../../layouts/UserLayout.jsx';
import PropertyCard from '../../../components/property/PropertyCard.jsx';
import { propertyService } from '../../../services/index.js';
import { Spinner } from '../../../components/common/index.jsx';
import { Property } from '../../../models/Property.js';

const PROPERTY_TYPES = [
  { icon: '🏡', label: 'Villa', count: 120 },
  { icon: '🏢', label: 'Apartment', count: 340 },
  { icon: '🏘️', label: 'Townhouse', count: 85 },
  { icon: '🏬', label: 'Office', count: 42 },
  { icon: '🌍', label: 'Land', count: 18 },
];

const AREAS = [
  { name: 'New Cairo', count: '1,200', bg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', size: 'large' },
  { name: 'Sheikh Zayed', count: '850', bg: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80', size: 'small' },
  { name: 'New Capital', count: '600', bg: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80', size: 'small' },
  { name: 'North Coast', count: '420', bg: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=400&q=80', size: 'tall' },
];

const WHY_US = [
  { icon: '🛡️', title: 'Trusted By Thousands', sub: '10+ Years of experience in the market.' },
  { icon: '🏘️', title: 'Wide Range of Properties', sub: 'From luxury villas to cozy studios.' },
  { icon: '💰', title: 'Financing Made Easy', sub: 'Support with mortgage plans.' },
];

/* ── Shared section header ── */
const SectionHeader = ({ label, title, sub, link }) => (
  <div className="flex items-end justify-between mb-10 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-3">
    <div>
      {label && <p className="text-[12px] font-bold text-blue uppercase tracking-[1.5px] mb-2">{label}</p>}
      <h2 className="font-display text-[32px] font-bold text-dark leading-tight max-[768px]:text-[26px]">{title}</h2>
      {sub && <p className="text-[15px] text-gray mt-2">{sub}</p>}
    </div>
    {link && <a href={link.href} className="text-[14px] font-semibold text-blue whitespace-nowrap hover:underline">{link.label}</a>}
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [newestProperties, setNewestProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [search, setSearch] = useState({ location: '', type: '', price: '' });

  useEffect(() => {
    propertyService.getList({ limit: 10, sort: '-createdAt', availability: 'available' })
      .then((res) => {
        const list = (res.data?.properties || []).filter((p) => (p.availability || 'available') === 'available');
        setNewestProperties(list.slice(0, 3));
      })
      .catch(() => { })
      .finally(() => setLoadingProps(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (search.location) q.set('city', search.location);
    if (search.type) q.set('type', search.type);
    if (search.price) q.set('maxPrice', search.price);
    navigate(`/explore?${q.toString()}`);
  };

  return (
    <UserLayout transparentNav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050d1f] via-[#0c2040] to-[#174a8a]">
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 65% 40%, rgba(2,137,251,0.22) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 15% 75%, rgba(2,137,251,0.1) 0%, transparent 60%)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-[820px] mx-auto animate-fade-up">
          <span className="inline-block bg-[rgba(2,137,251,0.18)] border border-[rgba(2,137,251,0.35)] text-[#90ccff]
            text-[12px] font-semibold tracking-[1.5px] uppercase px-[18px] py-[7px] rounded-full mb-7">
            🏆 Egypt's #1 Real Estate Platform
          </span>

          <h1 className="font-display text-[clamp(48px,6.5vw,84px)] font-black leading-[1.05] text-white mb-5">
            Find Your Place.<br />
            Feel The <span className="text-blue">Space.</span>
          </h1>
          <p className="text-[18px] text-white/75 mb-11 leading-relaxed">
            Browse the largest collection of active properties in Egypt.
          </p>

          {/* Search bar */}
          <form
            className="bg-white rounded-full px-7 py-2 pr-2 flex items-center shadow-[0_20px_60px_rgba(0,0,0,0.28)]
              max-w-[720px] mx-auto animate-fade-up delay-200
              max-[768px]:flex-col max-[768px]:rounded-2xl max-[768px]:p-4 max-[768px]:gap-3"
            onSubmit={handleSearch}
          >
            {/* Location */}
            <div className="flex flex-col flex-1 px-4 py-1 border-r border-border max-[768px]:border-r-0 max-[768px]:border-b max-[768px]:w-full max-[768px]:pb-3">
              <label className="text-[11px] font-bold text-dark uppercase tracking-[0.4px] mb-0.5">Location</label>
              <input
                placeholder="Select Area..."
                value={search.location}
                onChange={(e) => setSearch((s) => ({ ...s, location: e.target.value }))}
                className="border-none outline-none text-[14px] text-gray bg-transparent p-0 w-full"
              />
            </div>
            {/* Type */}
            <div className="flex flex-col flex-1 px-4 py-1 border-r border-border max-[768px]:border-r-0 max-[768px]:border-b max-[768px]:w-full max-[768px]:pb-3">
              <label className="text-[11px] font-bold text-dark uppercase tracking-[0.4px] mb-0.5">Property Type</label>
              <select
                value={search.type}
                onChange={(e) => setSearch((s) => ({ ...s, type: e.target.value }))}
                className="border-none outline-none text-[14px] text-gray bg-transparent p-0 appearance-none cursor-pointer w-full"
              >
                <option value="">Villa, Apt...</option>
                {PROPERTY_TYPES.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
              </select>
            </div>
            {/* Price */}
            <div className="flex flex-col flex-1 px-4 py-1 max-[768px]:w-full">
              <label className="text-[11px] font-bold text-dark uppercase tracking-[0.4px] mb-0.5">Price Range</label>
              <select
                value={search.price}
                onChange={(e) => setSearch((s) => ({ ...s, price: e.target.value }))}
                className="border-none outline-none text-[14px] text-gray bg-transparent p-0 appearance-none cursor-pointer w-full"
              >
                <option value="">Set Budget</option>
                <option value="2000000">Up to 2M</option>
                <option value="5000000">Up to 5M</option>
                <option value="10000000">Up to 10M</option>
                <option value="20000000">Up to 20M</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue text-white w-[52px] h-[52px] rounded-full flex items-center justify-center
                text-[18px] border-none cursor-pointer transition-all duration-200 flex-shrink-0 ml-2
                hover:bg-blue-dark hover:scale-[1.06]"
            >🔍</button>
          </form>

          {/* Stats */}
          <div className="flex justify-center items-center mt-11 animate-fade-up delay-300">
            {[
              { num: '10K+', label: 'Properties' },
              null,
              { num: '500+', label: 'Sales Done' },
              null,
              { num: '10+', label: 'Years Exp.' },
            ].map((item, i) =>
              item === null
                ? <div key={i} className="w-px h-10 bg-white/20 mx-0" />
                : (
                  <div key={i} className="text-center px-8">
                    <span className="block font-display text-[30px] font-bold text-white">{item.num}</span>
                    <span className="block text-[13px] text-white/55 mt-1">{item.label}</span>
                  </div>
                )
            )}
          </div>
        </div>
      </section>

      {/* ── EXPLORE BY TYPE ── */}
      <section className="py-24 px-[120px] bg-white max-[1200px]:px-10 max-[768px]:px-5 max-[768px]:py-16">
        <SectionHeader label="Browse Categories" title="Explore by Type" sub="Find the perfect property for your needs." link={{ href: '/explore', label: 'View All →' }} />
        <div className="flex gap-5 max-[768px]:grid max-[768px]:grid-cols-3 max-[1200px]:flex-wrap">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.label}
              className="flex-1 flex flex-col items-center px-4 pt-7 pb-6 gap-[10px]
                border-[1.5px] border-border rounded-lg bg-gray-light cursor-pointer
                transition-all duration-200
                hover:border-blue hover:bg-blue-light hover:-translate-y-1 hover:shadow-md"
              onClick={() => navigate(`/explore?type=${t.label}`)}
            >
              <span className="text-[40px]">{t.icon}</span>
              <span className="text-[16px] font-bold text-dark">{t.label}</span>
              <span className="text-[13px] text-gray">{t.count} Listings</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── NEWEST LISTINGS ── */}
      <section className="py-24 px-[120px] bg-white max-[1200px]:px-10 max-[768px]:px-5 max-[768px]:py-16">
        <SectionHeader label="Fresh on Market" title="Newest Listings" sub="Check out the latest additions to our portfolio." link={{ href: '/explore', label: 'View All →' }} />
        {loadingProps ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : newestProperties.length > 0 ? (
          <div className="grid grid-cols-3 gap-7 max-[1200px]:grid-cols-2 max-[768px]:grid-cols-1">
            {newestProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-7 max-[1200px]:grid-cols-2 max-[768px]:grid-cols-1">
            {[
              { id: '1', title: 'Grand Luxury Villa', price: 12500000, status: 'for_sale', location: { address: '5th Settlement', city: 'New Cairo' }, details: { bedrooms: 6, bathrooms: 5, area: 600 }, isFavorited: false, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'], slug: 'grand-luxury-villa' },
              { id: '2', title: 'Modern Apartment', price: 6200000, status: 'for_sale', location: { address: 'Mivida', city: 'New Cairo' }, details: { bedrooms: 3, bathrooms: 3, area: 185 }, isFavorited: false, images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80'], slug: 'modern-apartment' },
              { id: '3', title: 'Modern Apartment', price: 45000, status: 'for_rent', location: { address: 'Palm Hills', city: 'October' }, details: { bedrooms: 4, bathrooms: 4, area: 320 }, isFavorited: true, images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'], slug: 'modern-apartment-rent' },
            ].map((p) => {
              const prop = new Property(p);
              return <PropertyCard key={prop.id} property={prop} />;
            })}
          </div>
        )}
      </section>

      {/* ── POPULAR AREAS ── */}
      <section className="py-24 px-[120px] bg-white max-[1200px]:px-10 max-[768px]:px-5 max-[768px]:py-16">
        <SectionHeader label="Top Locations" title="Popular Areas" sub="Explore properties in the most sought-after locations." link={{ href: '/explore', label: 'View All →' }} />
        <div className="grid gap-4"
          style={{ gridTemplateColumns: '580px 1fr 1fr', gridTemplateRows: '140px 140px' }}
        >
          {AREAS.map((area) => (
            <button
              key={area.name}
              className={`relative rounded-lg overflow-hidden bg-cover bg-center cursor-pointer border-none
                transition-all duration-200 hover:scale-[1.01] hover:shadow-lg
                ${area.size === 'large' || area.size === 'tall' ? 'row-span-2' : ''}`}
              style={{ backgroundImage: `url(${area.bg})` }}
              onClick={() => navigate(`/explore?city=${area.name}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-5 flex flex-col gap-1 text-left">
                <span className="text-[18px] font-bold text-white">{area.name}</span>
                <span className="text-[12px] text-white/75">{area.count} Properties</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="grid grid-cols-2 gap-20 items-center px-[120px] py-[100px]"
        style={{ background: 'linear-gradient(135deg, #f8faff 0%, #fff 100%)' }}>
        <div className="rounded-xl overflow-hidden shadow-lg max-[768px]:hidden">
          <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80" alt="About Asyad" className="w-full h-[460px] object-cover" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-blue uppercase tracking-[1.5px] mb-4">ABOUT ASYAD</p>
          <h2 className="font-display text-[38px] font-bold text-dark leading-tight mb-5">
            We Help You Find The Home of Your Dreams.
          </h2>
          <p className="text-[15px] text-gray leading-[1.8] mb-8">
            With over 10 years of experience in the Egyptian market, Asyad has helped thousands
            of families find their perfect match. We prioritize trust, transparency, and luxury.
          </p>
          <div className="flex items-center mb-8">
            {[
              { num: '10+', label: 'Years Experience' },
              null,
              { num: '500+', label: 'Properties Sold' },
              null,
              { num: '50+', label: 'Awards Won' },
            ].map((item, i) =>
              item === null
                ? <div key={i} className="w-px h-10 bg-border mx-10" />
                : (
                  <div key={i} className="text-left">
                    <span className="block font-display text-[32px] font-bold text-dark">{item.num}</span>
                    <span className="block text-[13px] text-gray mt-0.5">{item.label}</span>
                  </div>
                )
            )}
          </div>
          <button
            className="bg-dark text-white px-7 py-[14px] rounded-md text-[15px] font-semibold
              border-none cursor-pointer transition-all duration-200 hover:bg-blue"
            onClick={() => navigate('/about')}
          >
            More About Us →
          </button>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-24 px-[120px] bg-[#f0f7ff] max-[1200px]:px-10 max-[768px]:px-5 max-[768px]:py-16">
        <SectionHeader title="Why Choose ASYAD?" sub="We provide the most complete real estate service in the country." />
        <div className="grid grid-cols-3 gap-6 max-[768px]:grid-cols-1">
          {WHY_US.map((w) => (
            <div key={w.title}
              className="flex items-center gap-5 bg-white rounded-lg p-6 shadow-sm
                transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="w-[60px] h-[60px] rounded-md bg-blue-light flex items-center justify-center text-[26px] flex-shrink-0">
                {w.icon}
              </div>
              <div>
                <p className="text-[17px] font-bold text-dark mb-1">{w.title}</p>
                <p className="text-[13px] text-gray">{w.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="py-24 px-[120px] bg-white max-[1200px]:px-10 max-[768px]:px-5 max-[768px]:py-16">
        <SectionHeader label="Stay Informed" title="Latest Insights & Projects" sub="Stay updated with the real estate market trends." link={{ href: '#', label: 'Read Blog →' }} />
        <div className="grid grid-cols-2 gap-7 max-[768px]:grid-cols-1">
          {[
            { tag: 'COMING SOON', title: 'The New Green City Launch', sub: 'Everything you need to know about the eco-friendly expansion.', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80' },
            { tag: 'MARKET TRENDS', title: 'Why invest in New Cairo now?', sub: 'Analysis of price surges and future ROI in the 5th settlement.', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80' },
          ].map((b) => (
            <div key={b.title}
              className="border border-border rounded-lg overflow-hidden bg-white
                transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-transparent">
              <img src={b.img} alt={b.title} className="w-full h-[200px] object-cover" />
              <div className="px-6 pt-5 pb-6">
                <span className="text-[11px] font-bold text-blue tracking-[1px] uppercase">{b.tag}</span>
                <h3 className="text-[20px] font-bold text-dark mt-2 mb-1.5 leading-snug">{b.title}</h3>
                <p className="text-[14px] text-gray leading-relaxed mb-4">{b.sub}</p>
                <a href="#" className="text-[14px] font-bold text-blue hover:underline">Read Article →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

    </UserLayout>
  );
};

export default HomePage;
