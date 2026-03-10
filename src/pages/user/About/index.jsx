// pages/user/About/index.jsx — Our Story (professional layout)
import { Link } from 'react-router-dom';
import UserLayout from '../../../layouts/UserLayout.jsx';

const STATS = [
  { value: '10+', label: 'Years Experience' },
  { value: '500+', label: 'Properties Sold' },
  { value: '50+', label: 'Awards Won' },
];

const AboutPage = () => (
  <UserLayout>
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <p className="text-xs font-bold text-rose-500/90 uppercase tracking-widest mb-2">Our Story</p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-dark mb-6">Building Trust, One Home at a Time.</h1>
          <p className="text-slate-600 leading-relaxed mb-8">Founded in 2015, Asyad has become a pillar of trust in the Egyptian real estate market. We don&apos;t just sell properties; we build communities.</p>
          <div className="flex flex-wrap gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-xl px-6 py-4 min-w-[140px]">
                <p className="font-display text-2xl font-black text-dark">{s.value}</p>
                <p className="text-xs font-semibold text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden bg-slate-200 aspect-[4/3]">
          <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" alt="Team" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 p-8 bg-slate-50/50 rounded-2xl">
        <div className="flex gap-4">
          <span className="text-3xl">🎯</span>
          <div>
            <h2 className="font-display text-xl font-bold text-dark mb-2">Our Mission</h2>
            <p className="text-slate-600 text-sm leading-relaxed">To simplify the real estate process and provide transparent, data-driven advice to help our clients make the best investment decisions.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="text-3xl">👁</span>
          <div>
            <h2 className="font-display text-xl font-bold text-dark mb-2">Our Vision</h2>
            <p className="text-slate-600 text-sm leading-relaxed">To be the #1 most trusted real estate partner in the Middle East, setting new standards for luxury and service.</p>
          </div>
        </div>
      </section>

      <div className="text-center">
        <Link to="/contact" className="inline-flex px-6 py-3 bg-dark text-white font-semibold rounded-xl hover:bg-primary transition-colors">Contact Us</Link>
      </div>
    </div>
  </UserLayout>
);

export default AboutPage;
