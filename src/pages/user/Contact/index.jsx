// pages/user/Contact/index.jsx — Get in touch (professional layout)
import { useState } from 'react';
import UserLayout from '../../../layouts/UserLayout.jsx';
import { toast } from 'react-toastify';

const CONTACT_CARDS = [
  { icon: '📍', title: 'Visit Us', text: 'Plot 45, North 90th St, New Cairo, Egypt.' },
  { icon: '📞', title: 'Call Us', text: '+20 100 123 4567\n+20 122 987 6543' },
  { icon: '✉️', title: 'Email Us', text: 'info@asyad-realestate.com' },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // Replace with your API when ready
      await new Promise((r) => setTimeout(r, 600));
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (_) {
      toast.error('Failed to send. Try again or call us.');
    } finally {
      setSending(false);
    }
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <UserLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-dark mb-4">Get in touch with us.</h1>
            <p className="text-slate-600 mb-8">We are here to help you find the perfect property.</p>
            <div className="space-y-4 mb-8">
              {CONTACT_CARDS.map((c) => (
                <div key={c.title} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                  <span className="text-2xl mb-2 block">{c.icon}</span>
                  <h3 className="font-display font-bold text-dark">{c.title}</h3>
                  <p className="text-slate-600 text-sm whitespace-pre-line mt-1">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-200 aspect-video flex items-center justify-center text-slate-500 text-sm">Map — New Cairo, Egypt</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <h2 className="font-display text-xl font-bold text-dark mb-6 flex items-center gap-2">Send a Message 💬</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
                <input type="text" placeholder="Full Name" required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.name} onChange={(e) => setF('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input type="email" placeholder="email@domain.com" required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.email} onChange={(e) => setF('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                <input type="text" placeholder="I want to buy a villa..." className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={form.subject} onChange={(e) => setF('subject', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
                <textarea rows={4} placeholder="Write your message here..." required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" value={form.message} onChange={(e) => setF('message', e.target.value)} />
              </div>
              <button type="submit" disabled={sending} className="w-full py-3 bg-dark text-white font-semibold rounded-xl hover:bg-primary transition-colors disabled:opacity-50">{sending ? 'Sending...' : 'Send Message'}</button>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ContactPage;
