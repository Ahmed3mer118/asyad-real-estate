// pages/user/PropertyDetail/index.jsx — Property details + book viewing
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserLayout from '../../../layouts/UserLayout.jsx';
import { propertyService, appointmentService } from '../../../services/index.js';
import { Spinner, Button, Badge } from '../../../components/common/index.jsx';
import { getToken } from '../../../utils/authUtils.js';
import { toast } from 'react-toastify';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const isAuth = !!getToken();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await propertyService.getById(id);
        if (!cancelled) setProperty(res.data?.property || null);
      } catch {
        if (!cancelled) setProperty(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleBookViewing = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime) {
      toast.error('Please pick date and time');
      return;
    }
    setBooking(true);
    try {
      const start = new Date(`${form.date}T${form.startTime}`);
      const end = new Date(`${form.date}T${form.endTime}`);
      if (end <= start) {
        toast.error('End time must be after start time');
        setBooking(false);
        return;
      }
      await appointmentService.book({
        propertyId: id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: form.notes || undefined,
      });
      toast.success('Viewing booked successfully');
      setForm({ date: '', startTime: '', endTime: '', notes: '' });
      navigate('/my-appointments');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to book viewing';
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </UserLayout>
    );
  }

  if (!property) {
    return (
      <UserLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
          <span className="text-6xl">🏠</span>
          <h1 className="font-display text-2xl font-bold text-dark">Property not available</h1>
          <Link to="/explore" className="text-primary font-semibold hover:underline">Back to properties</Link>
        </div>
      </UserLayout>
    );
  }

  const images = property.images?.length ? property.images : [{ url: null, isMain: true }];
  const mainImg = images.find((i) => i?.isMain)?.url || images[0]?.url;

  return (
    <UserLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/explore" className="hover:text-primary">Properties</Link>
          <span>/</span>
          <span className="text-dark font-medium truncate max-w-[200px]">{property.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[16/10]">
              {mainImg ? (
                <img src={mainImg} alt={property.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">🏠</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-transparent hover:border-primary bg-slate-100"
                  >
                    {img?.url ? (
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Title & price */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge color={property.isForSale ? 'gray' : 'blue'} className="mb-2">
                  {property.badgeText}
                </Badge>
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-dark">{property.name}</h1>
                <p className="text-gray mt-1 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">📍 {property.shortLocation || '—'}</span>
                  {property.ageLabel && (
                    <span className="text-gray/80 text-sm">· {property.ageLabel}</span>
                  )}
                </p>
              </div>
              <p className="text-2xl font-black text-primary">{property.formattedPrice}</p>
            </div>

            {/* Specs */}
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl">
              {property.details?.bedrooms > 0 && (
                <span className="text-sm font-medium text-slate-700">🛏 {property.details.bedrooms} bedrooms</span>
              )}
              {property.details?.bathrooms > 0 && (
                <span className="text-sm font-medium text-slate-700">🚿 {property.details.bathrooms} bathrooms</span>
              )}
              {(property.area || property.details?.area) > 0 && (
                <span className="text-sm font-medium text-slate-700">📐 {property.area || property.details?.area} m²</span>
              )}
              {property.propertyType && (
                <span className="text-sm font-medium text-slate-700">🏷 {property.propertyType}</span>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="font-display text-lg font-bold text-dark mb-2">Description</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {/* Features */}
            {property.features && (
              <div>
                <h2 className="font-display text-lg font-bold text-dark mb-2">Features</h2>
                <p className="text-slate-600 leading-relaxed">{property.features}</p>
              </div>
            )}
          </div>

          {/* Sidebar: Book viewing */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-display text-xl font-bold text-dark">Book a viewing</h2>
                <p className="text-sm text-gray mt-1">Choose date and time for the viewing</p>
              </div>
              <div className="p-6">
                {isAuth ? (
                  <form onSubmit={handleBookViewing} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().slice(0, 10)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={form.date}
                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">From</label>
                        <input
                          type="time"
                          required
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          value={form.startTime}
                          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">To</label>
                        <input
                          type="time"
                          required
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          value={form.endTime}
                          onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Notes (optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Any special requests for the viewing"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-sm"
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full !h-12 !rounded-xl font-bold"
                      loading={booking}
                      disabled={booking}
                    >
                      Confirm booking
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-600 mb-4">Log in to book a viewing for this property</p>
                    <Button onClick={() => navigate('/login', { state: { from: `/property/${id}` } })} className="w-full !h-12 !rounded-xl">
                      Log in
                    </Button>
                    <Link to="/register" className="block mt-3 text-sm text-primary font-semibold hover:underline">
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PropertyDetailPage;
