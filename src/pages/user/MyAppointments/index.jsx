// pages/user/MyAppointments/index.jsx — Customer viewing appointments + rate employee after completed viewing
import { useState, useEffect, useCallback } from 'react';
import UserLayout from '../../../layouts/UserLayout.jsx';
import { appointmentService, evaluationService } from '../../../services/index.js';
import { Spinner, Empty, Button } from '../../../components/common/index.jsx';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const STATUS_LABELS = { scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled' };

const toId = (v) => (v == null ? null : typeof v === 'object' ? (v._id || v.id) : v);

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingFor, setEvaluatingFor] = useState(null);
  const [evalRating, setEvalRating] = useState(0);
  const [evalComments, setEvalComments] = useState('');
  const [evalSubmitting, setEvalSubmitting] = useState(false);
  const [evaluatedAppointmentIds, setEvaluatedAppointmentIds] = useState(new Set());

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

  const canRate = (a) => {
    const status = (a.status || '').toLowerCase();
    const empId = toId(a.employeeId);
    return status === 'completed' && empId && !evaluatedAppointmentIds.has(a.id);
  };

  const handleSubmitEvaluation = async (a) => {
    const employeeId = toId(a.employeeId);
    if (!employeeId || evalRating < 1 || evalRating > 5) {
      toast.error('Please choose a rating (1–5)');
      return;
    }
    setEvalSubmitting(true);
    try {
      await evaluationService.createEvaluation({
        employeeId,
        appointmentId: a.id,
        rating: evalRating,
        comments: evalComments.trim() || undefined,
      });
      toast.success('Thank you for your feedback!');
      setEvaluatedAppointmentIds((prev) => new Set([...prev, a.id]));
      setEvaluatingFor(null);
      setEvalRating(0);
      setEvalComments('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setEvalSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-dark mb-2">My viewings</h1>
        <p className="text-gray mb-8">All your viewing appointments. Rate the employee after a completed viewing.</p>

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
                    {a.employeeId && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Agent: {a.employeeId?.name ?? a.employee?.name ?? a.employeeId?.userName ?? '—'}
                      </p>
                    )}
                    {a.notes && (
                      <p className="text-sm text-slate-600 mt-2 italic">{a.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shrink-0
                        ${(a.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${(a.status || '').toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                        ${(a.status || '').toLowerCase() === 'cancelled' ? 'bg-slate-100 text-slate-600' : ''}`}
                    >
                      {STATUS_LABELS[(a.status || '').toLowerCase()] || a.status}
                    </span>
                    {evaluatedAppointmentIds.has(a.id) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 shrink-0">Rated</span>
                    )}
                    {canRate(a) && evaluatingFor !== a.id && (
                      <Button size="sm" variant="outline" onClick={() => { setEvaluatingFor(a.id); setEvalRating(0); setEvalComments(''); }}>
                        Rate this viewing
                      </Button>
                    )}
                  </div>
                </div>

                {evaluatingFor === a.id && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Rate the agent for this viewing (1–5)</p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvalRating(star)}
                          className="text-2xl  "
                        >
                          {star <= evalRating ? <FaStar className="text-yellow-500" /> : <FaStar className="text-gray-500" />}
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Comments (optional)"
                      value={evalComments}
                      onChange={(e) => setEvalComments(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm mb-3 min-h-[80px]"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSubmitEvaluation(a)} disabled={evalSubmitting}>
                        {evalSubmitting ? 'Submitting…' : 'Submit rating'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEvaluatingFor(null); setEvalRating(0); setEvalComments(''); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default MyAppointmentsPage;
