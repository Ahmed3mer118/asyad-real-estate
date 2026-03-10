// pages/dashboard/Reports/index.jsx — Analytics: payment methods, property types (Power BI–style)
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout.jsx';
import { transactionService, paymentService, propertyService } from '../../../services/index.js';
import { Spinner } from '../../../components/common/index.jsx';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  visa: 'Visa',
  bank_transfer: 'Bank transfer',
  check: 'Check',
};

const PROPERTY_TYPE_LABELS = {
  Apartment: 'Apartment',
  Villa: 'Villa',
  Townhouse: 'Townhouse',
  Office: 'Office',
  Land: 'Land',
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const toId = (v) => {
  if (v == null) return null;
  if (typeof v === 'object') return v._id || v.id || null;
  return v;
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [txRes, payRes, propRes] = await Promise.all([
          transactionService.getTransactions({ limit: 500 }).catch(() => ({ data: { transactions: [] } })),
          paymentService.getAllPayments({ limit: 500 }).catch(() => ({ data: { payments: [] } })),
          propertyService.getList({ limit: 500 }).catch(() => ({ data: { properties: [] } })),
        ]);
        setTransactions(txRes.data?.transactions || []);
        setPayments(payRes.data?.payments || []);
        setProperties(propRes.data?.properties || []);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const propertyIdToType = useMemo(() => {
    const map = {};
    for (const p of properties) {
      const id = toId(p);
      if (id) map[String(id)] = p.propertyType || p.type || 'Other';
    }
    return map;
  }, [properties]);

  const paymentMethodStats = useMemo(() => {
    const byMethod = {};
    for (const method of ['cash', 'visa', 'bank_transfer', 'check']) {
      byMethod[method] = { count: 0, amount: 0 };
    }
    for (const p of payments) {
      const m = (p.paymentMethod || p.method || 'cash').toLowerCase().replace('cheque', 'check');
      if (!byMethod[m]) byMethod[m] = { count: 0, amount: 0 };
      byMethod[m].count += 1;
      byMethod[m].amount += Number(p.amount) || 0;
    }
    return Object.entries(byMethod).map(([method, data]) => ({
      name: PAYMENT_METHOD_LABELS[method] || method,
      method,
      count: data.count,
      amount: data.amount,
      value: data.count,
    })).filter((d) => d.count > 0);
  }, [payments]);

  const salesByPropertyType = useMemo(() => {
    const sales = transactions.filter((t) => (t.transactionType || '').toLowerCase() === 'sale');
    const byType = {};
    for (const t of sales) {
      const type = t.property?.propertyType || t.property?.type || propertyIdToType[String(toId(t.propertyId))] || 'Other';
      const key = type || 'Other';
      if (!byType[key]) byType[key] = { count: 0, totalAmount: 0 };
      byType[key].count += 1;
      byType[key].totalAmount += Number(t.totalAmount) || 0;
    }
    return Object.entries(byType).map(([type, data]) => ({
      name: PROPERTY_TYPE_LABELS[type] || type,
      type,
      count: data.count,
      totalAmount: data.totalAmount,
      value: data.count,
    })).sort((a, b) => b.count - a.count);
  }, [transactions, propertyIdToType]);

  const totalPaymentsAmount = useMemo(() => payments.reduce((s, p) => s + (Number(p.amount) || 0), 0), [payments]);
  const totalSalesCount = useMemo(() => transactions.filter((t) => (t.transactionType || '').toLowerCase() === 'sale').length, [transactions]);
  const topPaymentMethod = useMemo(() => {
    if (paymentMethodStats.length === 0) return null;
    return paymentMethodStats.reduce((a, b) => (a.count >= b.count ? a : b));
  }, [paymentMethodStats]);
  const topPropertyType = useMemo(() => {
    if (salesByPropertyType.length === 0) return null;
    return salesByPropertyType[0];
  }, [salesByPropertyType]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-800"> Reports and Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">Analysis of payment methods and most sold property types (similar to Power BI)</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Payments</p>
            <p className="text-2xl font-black text-slate-800 mt-1">EGP {new Intl.NumberFormat('en-EG').format(totalPaymentsAmount)}</p>
            <p className="text-xs text-slate-500 mt-1">{payments.length} payment transactions</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Number of Sales Transactions</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalSalesCount}</p>
            <p className="text-xs text-slate-500 mt-1">Sale transaction</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Payment Method</p>
            <p className="text-xl font-bold text-primary mt-1">{topPaymentMethod ? topPaymentMethod.name : '—'}</p>
            <p className="text-xs text-slate-500 mt-1">{topPaymentMethod ? `${topPaymentMethod.count} transactions` : 'No data'}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Sold Property Type</p>
            <p className="text-xl font-bold text-primary mt-1">{topPropertyType ? topPropertyType.name : '—'}</p>
            <p className="text-xs text-slate-500 mt-1">{topPropertyType ? `${topPropertyType.count} sale` : 'No data'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment methods */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Payment Method Distribution</h3>
            <p className="text-sm text-slate-500 mb-6">Which payment method is used most often (number of transactions)</p>
            {paymentMethodStats.length === 0 ? (
              <p className="text-slate-500 py-8 text-center">No payments yet</p>
            ) : (
              <>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, count }) => `${name}: ${count}`}
                      >
                        {paymentMethodStats.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} transaction — EGP ${new Intl.NumberFormat('en-EG').format(props.payload.amount)}`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {paymentMethodStats.map((row, i) => (
                    <div key={row.method} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{row.name}</span>
                      <span className="text-slate-500">{row.count} transactions — EGP {new Intl.NumberFormat('en-EG').format(row.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Property types (sales) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Most Sold Property Types</h3>
            <p className="text-sm text-slate-500 mb-6">Distribution of sales by property type (Apartments, Villas, etc.)</p>
            {salesByPropertyType.length === 0 ? (
              <p className="text-slate-500 py-8 text-center">No sales yet</p>
            ) : (
              <>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByPropertyType} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value, name, props) => [`${value} sale — EGP ${new Intl.NumberFormat('en-EG').format(props.payload.totalAmount)}`, name]} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Number of sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {salesByPropertyType.map((row) => (
                    <div key={row.type} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{row.name}</span>
                      <span className="text-slate-500">{row.count} sale — EGP {new Intl.NumberFormat('en-EG').format(row.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment method by amount (bar) */}
        {paymentMethodStats.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Total Amount by Payment Method</h3>
            <p className="text-sm text-slate-500 mb-6">Value of payments (EGP) for each method</p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodStats} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [`EGP ${new Intl.NumberFormat('en-EG').format(value)}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} name="Amount (EGP)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
