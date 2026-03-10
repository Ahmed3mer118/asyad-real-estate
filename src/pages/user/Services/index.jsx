// pages/user/Services/index.jsx — Our Expertise (professional layout)
import { Link } from 'react-router-dom';
import UserLayout from '../../../layouts/UserLayout.jsx';

const SERVICES = [
  { icon: '🏠', title: 'Buying & Selling', desc: 'We help you find the perfect property at the best price, or sell your home quickly to the right buyer.', href: '/explore' },
  { icon: '🔑', title: 'Property Management', desc: 'Hassle-free management for your rental units. We handle tenants, maintenance, and rent collection.' },
  { icon: '⚖️', title: 'Legal Assistance', desc: 'Our legal team ensures all contracts and paperwork are 100% compliant with Egyptian real estate laws.' },
  { icon: '💡', title: 'Interior Design', desc: 'Turn your new house into a home. We offer finishing and furnishing packages with top designers.' },
  { icon: '📊', title: 'Market Valuation', desc: 'Get an accurate estimate of your property\'s value based on current market trends and data.' },
  { icon: '💰', title: 'Mortgage Support', desc: 'We guide you through bank loans and mortgage plans to finance your dream property.' },
];

const ServicesPage = () => (
  <UserLayout>
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our Expertise</p>
      <h1 className="font-display text-3xl lg:text-4xl font-bold text-dark mb-4">Real Estate Services Tailored For You</h1>
      <p className="text-slate-600 text-lg max-w-2xl mb-12">From buying your first home to managing your investment portfolio, we cover it all.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {SERVICES.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-3xl mb-4 block">{s.icon}</span>
            <h2 className="font-display text-xl font-bold text-dark mb-2">{s.title}</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{s.desc}</p>
            {s.href ? <Link to={s.href} className="text-primary font-semibold text-sm hover:underline">Learn More →</Link> : <span className="text-slate-400 text-sm">Coming soon</span>}
          </div>
        ))}
      </div>

      <div className="bg-slate-800 text-white rounded-2xl p-8 lg:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="font-display text-2xl font-bold">Ready to get started?</p>
        <Link to="/contact" className="px-6 py-3 bg-white text-slate-800 font-semibold rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap">Contact Us</Link>
      </div>
    </div>
  </UserLayout>
);

export default ServicesPage;
