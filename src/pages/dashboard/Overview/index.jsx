// pages/dashboard/Overview/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout.jsx';
import { webhookService, propertyService, requestService } from '../../../services/index.js';
import { Badge, Spinner, Empty } from '../../../components/common/index.jsx';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ACTIVITY_CHART = [
  { month: 'Jan', listings: 12, requests: 8 },
  { month: 'Feb', listings: 19, requests: 14 },
  { month: 'Mar', listings: 15, requests: 18 },
  { month: 'Apr', listings: 22, requests: 16 },
  { month: 'May', listings: 28, requests: 24 },
  { month: 'Jun', listings: 35, requests: 30 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const OverviewPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentProps, setRecentProps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, reqRes, propRes] = await Promise.allSettled([
          webhookService.getStats(),
          requestService.getAllRequests({ limit: 5, sort: '-createdAt' }),
          propertyService.getList({ limit: 5, sort: '-createdAt' }),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data);
        if (reqRes.status === 'fulfilled') setRecentRequests(reqRes.value?.data?.requests || []);
        if (propRes.status === 'fulfilled') setRecentProps(propRes.value?.data?.properties || []);
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  const STAT_CARDS = [
    { label: 'Total Users', value: stats?.users ?? '—', icon: '👥', color: 'blue', sub: 'Registered users' },
    { label: 'Total Properties', value: stats?.properties ?? '—', icon: '🏠', color: 'green', sub: 'Active listings' },
    { label: 'Total Requests', value: stats?.requests ?? '—', icon: '📋', color: 'yellow', sub: 'Buy & rent requests' },
    { label: 'Pending Appts', value: stats?.appointments ?? '—', icon: '📅', color: 'red', sub: 'Pending appointments' },
  ];

  const PIE_DATA = [
    { name: 'Villa', value: stats?.categories?.Villa || 120 },
    { name: 'Apartment', value: stats?.categories?.Apartment || 340 },
    { name: 'Townhouse', value: stats?.categories?.Townhouse || 85 },
    { name: 'Office', value: stats?.categories?.Office || 42 },
    { name: 'Land', value: stats?.categories?.Land || 18 },
  ];

  const totalPie = PIE_DATA.reduce((acc, curr) => acc + curr.value, 0);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
            <p className="text-slate-500 text-sm">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Live Updates</span>
          </div>
        </div>

        {/* Stat Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {STAT_CARDS.map((s) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110
                  ${s.color === 'blue' ? 'bg-blue/10 text-blue' :
                    s.color === 'green' ? 'bg-emerald-50 text-emerald-500' :
                      s.color === 'yellow' ? 'bg-amber-50 text-amber-500' :
                        'bg-rose-50 text-rose-500'}`}
                >
                  {s.icon}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-black text-slate-800">{s.value}</p>
                </div>
              </div>
              <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${s.color === 'blue' ? 'bg-blue' : s.color === 'green' ? 'bg-emerald-500' : s.color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1">
                <span className="text-green-500 font-bold">↑ 12%</span> {s.sub}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Activity Analytics</h3>
                <p className="text-xs text-slate-400 mt-1">Comparing property listings vs user requests</p>
              </div>
              <select className="text-xs font-bold bg-slate-50 border-0 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ACTIVITY_CHART} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="listings" stroke="#3b82f6" fill="url(#gBlue)" strokeWidth={3} name="Listings" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="requests" stroke="#10b981" fill="url(#gEmerald)" strokeWidth={3} name="Requests" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 self-start mb-2">Property Types</h3>
            <p className="text-xs text-slate-400 self-start mb-6">Distribution based on category</p>
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                    {PIE_DATA.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">{totalPie}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {PIE_DATA.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }}></div>
                  <span className="text-xs font-bold text-slate-600">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Requests Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden auto-cols-min">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Recent Requests</h3>
              <button
                onClick={() => navigate('/dashboard/requests')}
                className="text-xs font-bold text-blue hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              {recentRequests.length === 0 ? (
                <Empty icon="📋" title="No requests yet" />
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-700 text-sm">{r.property?.title || '—'}</td>
                        <td className="px-6 py-4">
                          <Badge color="blue" className="!bg-blue/5 !text-blue !rounded-lg text-[10px]">{r.type}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={r.statusColor} className="!rounded-lg text-[10px]">{r.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-400">{r.formattedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Properties Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Recent Listings</h3>
              <button
                onClick={() => navigate('/dashboard/properties')}
                className="text-xs font-bold text-blue hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              {recentProps.length === 0 ? (
                <Empty icon="🏠" title="No properties yet" />
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentProps.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 max-w-[200px] truncate font-bold text-slate-700 text-sm">{p.title}</td>
                        <td className="px-6 py-4 font-black text-blue text-sm">{p.formattedPrice}</td>
                        <td className="px-6 py-4">
                          <Badge color={p.isForSale ? 'blue' : 'green'} className="!rounded-lg text-[10px]">{p.badgeText}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OverviewPage;
