// pages/user/MyPayments/index.jsx — User: track installments & payment history (per property / all)
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../../layouts/UserLayout.jsx';
import { transactionService, installmentService, paymentService } from '../../../services/index.js';
import { getCurrentUserId, getToken } from '../../../utils/authUtils.js';
import { Spinner, Empty, Button, Badge, Input, Modal } from '../../../components/common/index.jsx';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const toId = (v) => {
  if (v == null) return null;
  if (typeof v === 'object') return v._id || v.id || null;
  return v;
};

/** Round to 2 decimals (no fractional piasters) to avoid floating-point errors. */
const roundMoney = (n) => Math.round(Number(n) * 100) / 100;

const MyPaymentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'cash', notes: '' });
  const [expandedTxIds, setExpandedTxIds] = useState(new Set());

  const load = useCallback(async () => {
    const userId = getCurrentUserId();
    setLoading(true);
    try {
      let txList = [];
      try {
        const txRes = await transactionService.getMyTransactions();
        txList = txRes.data?.transactions || [];
      } catch (_) {}
      if (txList.length === 0 && userId) {
        try {
          const txRes = await transactionService.getTransactions({ customerId: userId, limit: 100 });
          txList = txRes.data?.transactions || [];
        } catch (_) {}
      }
      if (txList.length === 0 && userId) {
        try {
          const txRes = await transactionService.getTransactions({ limit: 200 });
          const all = txRes.data?.transactions || [];
          txList = all.filter((t) => toId(t.customerId) === userId || toId(t.customerId) === String(userId));
        } catch (_) {}
      }
      setTransactions(txList);

      const myTxIds = new Set(txList.map((t) => toId(t) || t.id || t._id).filter(Boolean));

      let instList = [];
      try {
        const instRes = await installmentService.getMyInstallments();
        instList = instRes.data?.installments || [];
      } catch (_) {}
      if (instList.length === 0 && myTxIds.size > 0) {
        try {
          const all = await Promise.all(
            Array.from(myTxIds).map((tid) => installmentService.getInstallments({ transactionId: tid, limit: 50 }).then((r) => r.data?.installments || []))
          );
          instList = all.flat();
        } catch (_) {}
      }
      setInstallments(instList);

      let payList = [];
      try {
        const payRes = await paymentService.getMyPayments();
        payList = payRes.data?.payments || [];
      } catch (_) {}
      if (payList.length === 0 && myTxIds.size > 0) {
        try {
          const payRes = await paymentService.getAllPayments({ limit: 500 });
          const allPay = payRes.data?.payments || [];
          payList = allPay.filter((p) => {
            const pid = toId(p.transactionId);
            return pid && (myTxIds.has(pid) || myTxIds.has(String(pid)));
          });
        } catch (_) {}
      }
      setPayments(payList);
    } catch {
      setTransactions([]);
      setInstallments([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const txMap = Object.fromEntries((transactions || []).map((t) => [toId(t.id), t]));
  const installmentsWithTx = installments.map((i) => ({
    ...i,
    transaction: txMap[toId(i.transactionId)] || null,
  }));

  // Group by property/transaction for accordion
  const groupedByTx = (() => {
    const map = {};
    for (const i of installmentsWithTx) {
      const txId = toId(i.transactionId) || 'unknown';
      if (!map[txId]) {
        map[txId] = { transaction: i.transaction, installments: [] };
      }
      map[txId].installments.push(i);
    }
    for (const key of Object.keys(map)) {
      const list = map[key].installments;
      const due = list.filter((x) => (x.status || '').toLowerCase() === 'due').sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
      const paid = list.filter((x) => (x.status || '').toLowerCase() === 'paid').sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
      map[key].installments = [...due, ...paid];
    }
    return map;
  })();

  const dueInstallments = installmentsWithTx.filter((i) => (i.status || '').toLowerCase() === 'due');
  const originalTotal = installmentsWithTx.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalDue = dueInstallments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const nextDue = dueInstallments[0];

  const handlePayClick = (installment) => {
    setPayForm({
      amount: String(roundMoney(installment.amount ?? 0)),
      paymentMethod: 'cash',
      notes: '',
    });
    setPayModal(installment);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payModal) return;
    const transactionId = toId(payModal.transactionId);
    const installmentId = toId(payModal.id) || toId(payModal._id);
    const amount = roundMoney(Number(payForm.amount));
    if (!transactionId || !amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setPaySubmitting(true);
    try {
      await paymentService.recordPayment({
        transactionId,
        installmentId: installmentId || undefined,
        amount,
        paymentMethod: payForm.paymentMethod,
        notes: payForm.notes || undefined,
      });
      toast.success('Payment recorded. It will appear in your history once confirmed.');
      setPayModal(null);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Could not record payment. Try again or contact us.';
      toast.error(msg);
    } finally {
      setPaySubmitting(false);
    }
  };

  if (!getToken()) {
    return (
      <UserLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-gray">You must be logged in to view your payments.</p>
          <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-dark mb-2">My payments & installments</h1>
        <p className="text-gray mb-8">Track installments and payment history for your properties</p>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Original Total</p>
                <p className="text-xl font-black text-slate-800 mt-1">EGP {new Intl.NumberFormat('en-EG').format(originalTotal)}</p>
                <p className="text-xs text-slate-500 mt-1">Original Total</p>
              </div>
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Total due</p>
                <p className="text-xl font-black text-amber-800 mt-1">EGP {new Intl.NumberFormat('en-EG').format(totalDue)}</p>
                <p className="text-xs text-amber-600 mt-1">{dueInstallments.length} installment(s) due</p>
              </div>
              <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Total paid</p>
                <p className="text-xl font-black text-green-800 mt-1">EGP {new Intl.NumberFormat('en-EG').format(totalPaid)}</p>
                <p className="text-xs text-green-600 mt-1">{payments.length} payment(s)</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Next due</p>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  {nextDue
                    ? `EGP ${new Intl.NumberFormat('en-EG').format(nextDue.amount || 0)} — ${nextDue.dueDate ? new Date(nextDue.dueDate).toLocaleDateString('en-EG') : '—'}`
                    : '—'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-display text-lg font-bold text-dark">Installments</h2>
                <p className="text-sm text-slate-500 mt-1">Grouped by property. Click a property to see due first, then paid installments.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {installmentsWithTx.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Empty icon="📋" title="No installments yet" sub="Installments will appear here when you have a purchase with a payment plan." />
                  </div>
                ) : (
                  Object.entries(groupedByTx).map(([txId, { transaction, installments: instList }]) => {
                    const label = transaction?.property?.name || transaction?.property?.title || transaction?.formattedTotal || 'Transaction';
                    const dueCount = instList.filter((i) => (i.status || '').toLowerCase() === 'due').length;
                    const paidCount = instList.filter((i) => (i.status || '').toLowerCase() === 'paid').length;
                    const isExpanded = expandedTxIds.has(txId);
                    const toggle = () => {
                      setExpandedTxIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(txId)) next.delete(txId);
                        else next.add(txId);
                        return next;
                      });
                    };
                    return (
                      <div key={txId} className="border-b border-slate-100 last:border-b-0">
                        <button
                          type="button"
                          onClick={toggle}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/70 transition-colors"
                        >
                          <span className="font-display font-semibold text-dark">{label}</span>
                          <span className="flex items-center gap-3">
                            {dueCount > 0 && (
                              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">{dueCount} due</span>
                            )}
                            {paidCount > 0 && (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">{paidCount} paid</span>
                            )}
                            <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                          </span>
                        </button>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 sm:px-5 pb-5 pt-0 overflow-x-auto">
                              <table className="w-full min-w-[320px] text-left border-collapse rounded-xl border border-slate-100 overflow-hidden">
                                <thead className="bg-slate-50/80">
                                  <tr>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due date</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {instList.map((i) => (
                                    <tr key={i.id || i._id} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-3 text-sm text-slate-700">#{i.installmentNo ?? '—'}</td>
                                      <td className="px-4 py-3 font-semibold text-slate-800">EGP {new Intl.NumberFormat('en-EG').format(i.amount || 0)}</td>
                                      <td className="px-4 py-3 text-sm text-slate-600">{i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-EG') : '—'}</td>
                                      <td className="px-4 py-3">
                                        <Badge
                                          color={(i.status || '').toLowerCase() === 'paid' ? 'green' : (i.status || '').toLowerCase() === 'overdue' ? 'red' : 'yellow'}
                                          className="!rounded-lg text-[10px]"
                                        >
                                          {(i.status || 'due').toLowerCase()}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        {(i.status || '').toLowerCase() === 'due' && (
                                          <Button size="sm" variant="outline" className="!rounded-lg" onClick={() => handlePayClick(i)}>
                                            Pay
                                          </Button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-display text-lg font-bold text-dark">Payment history</h2>
                <p className="text-sm text-slate-500 mt-1">Full record of your payments (one or more properties)</p>
              </div>
              <div className="overflow-x-auto">
                {payments.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Empty icon="💳" title="No payments yet" sub="When you pay an installment, it will appear here." />
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {payments
                        .slice()
                        .sort((a, b) => new Date(b.paymentDate || b.createdAt || 0) - new Date(a.paymentDate || a.createdAt || 0))
                        .map((p) => (
                          <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50">
                            <td className="px-5 py-4 text-sm text-slate-700">
                              {p.formattedDate || (p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-EG') : (p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-EG') : '—'))}
                            </td>
                            <td className="px-5 py-4 font-semibold text-green-600">EGP {new Intl.NumberFormat('en-EG').format(p.amount || 0)}</td>
                            <td className="px-5 py-4 text-sm text-slate-600">{(p.method || p.paymentMethod || '—').toString().replace(/_/g, ' ')}</td>
                            <td className="px-5 py-4 text-xs text-slate-500">{p.transactionId ? `Tx ${String(toId(p.transactionId)).slice(-8)}` : '—'}</td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-primary transition-colors">
                Back to profile
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-dark text-sm font-semibold hover:border-primary hover:text-primary transition-colors">
                Contact us (payment / questions)
              </Link>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Record payment">
        {payModal && (
          <form onSubmit={handlePaySubmit} className="space-y-4">
            <p className="text-sm text-slate-600">
              Installment #{payModal.installmentNo ?? '—'} — {payModal.transaction?.property?.name || payModal.transaction?.formattedTotal || 'Transaction'}
            </p>
            <Input disabled label="Amount (EGP)" type="number" min="0" step="0.01" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} required />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment method</label>
              <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20" value={payForm.paymentMethod} onChange={(e) => setPayForm((f) => ({ ...f, paymentMethod: e.target.value }))}>
                <option value="cash">Cash</option>
                <option value="visa">Visa</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="check">Check</option>
              </select>
            </div>
            <Input label="Notes (optional)" value={payForm.notes} onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))} />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setPayModal(null)}>Cancel</Button>
              <Button type="submit" loading={paySubmitting}>Submit payment</Button>
            </div>
          </form>
        )}
      </Modal>
    </UserLayout>
  );
};

export default MyPaymentsPage;
