// pages/user/MyAppointments/index.jsx — Customer viewing appointments
import { useState, useEffect, useCallback } from 'react';
import UserLayout from '../../../layouts/UserLayout.jsx';
import { appointmentService } from '../../../services/index.js';
import { Spinner, Empty } from '../../../components/common/index.jsx';
import { motion } from 'framer-motion';

const STATUS_LABELS = { scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled' };

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data?.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <UserLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-dark mb-2">My viewings</h1>
        <p className="text-gray mb-8">All your viewing appointments</p>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : appointments.length === 0 ? (
          <Empty
            icon="📅"
            title="No viewings yet"
            sub="Book a viewing from any property page to see it here"
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-800">
                      {a.propertyId?.name || a.propertyId?.title || 'Property'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {a.formattedDate} · {a.formattedStartTime} – {a.formattedEndTime}
                    </p>
                    {a.notes && (
                      <p className="text-sm text-slate-600 mt-2 italic">{a.notes}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shrink-0
                      ${(a.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${(a.status || '').toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                      ${(a.status || '').toLowerCase() === 'cancelled' ? 'bg-slate-100 text-slate-600' : ''}`}
                  >
                    {STATUS_LABELS[(a.status || '').toLowerCase()] || a.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default MyAppointmentsPage;
