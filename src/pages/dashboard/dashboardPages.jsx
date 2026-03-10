// pages/dashboard/dashboardPages.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  userService, requestService, appointmentService, propertyService,
  paymentService, notificationService, employeeService, transactionService,
  taskService, evaluationService, emailLogService, installmentService
} from '../../services/index.js';
import {
  Button, Badge, Avatar, Spinner, Empty,
  Input, Modal, ConfirmModal,
} from '../../components/common/index.jsx';
import { toast } from 'react-toastify';
import { useAsync, usePagination } from '../../hooks/index.jsx';

const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

/* ── Normalize ID (backend may return populated object) ── */
const toId = (v) => {
  if (v == null) return null;
  if (typeof v === 'object') return v._id || v.id || null;
  return v;
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

/* ════════════════════════════════════════════
   USERS PAGE
   ════════════════════════════════════════════ */
const ROLES = ['User', 'Tenant', 'Owner', 'Employee', 'Admin'];

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const res = await userService.getAllUsers({
        page: pagination.page, limit: pagination.limit, search, role: roleFilter,
      });
      setUsers(res.data?.users || []);
      pagination.setTotal(res.data?.total || 0);
    });
  }, [pagination.page, search, roleFilter]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeService.getAllEmployees({ limit: 500 });
      setEmployees(res.data?.employees || []);
    } catch (_) {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (editUser && editRole === 'Employee') loadEmployees(); }, [editUser, editRole]);

  const toggleActive = async (u) => {
    await run(async () => {
      await userService.updateStatus(u.id);
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`);
      load();
    });
  };

  const openEditRole = (u) => { setEditUser(u); setEditRole(u.role || 'User'); };
  const saveRole = async () => {
    if (!editUser) return;
    await run(async () => {
      await userService.updateUserByAdmin(editUser.id, { role: editRole });
      toast.success('Role updated');
      setEditUser(null);
      load();
    });
  };

  const isAlreadyEmployee = editUser && employees.some((e) => toId(e.userId) === editUser.id);
  const addToEmployees = async () => {
    if (!editUser) return;
    await run(async () => {
      await employeeService.createEmployee({
        userId: editUser.id,
        jobTitle: 'Staff',
        department: '',
        commissionRate: 0,
      });
      toast.success('Added to employees');
      loadEmployees();
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-1 items-center gap-3 max-w-md">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue/20 transition-all outline-none"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue/20 transition-all outline-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="User">User</option>
              <option value="Tenant">Tenant</option>
              <option value="Owner">Owner</option>
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Total: {pagination.total}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-24"><Spinner size="lg" /></div>
          ) : users.length === 0 ? (
            <Empty icon="👥" title="No users found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={tableContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-slate-50"
                >
                  {users.map((u) => (
                    <motion.tr key={u.id} variants={tableRowVariants} className="hover:bg-blue/5 transition-colors group cursor-pointer" onClick={() => openEditRole(u)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.fullName || u.userName} size="sm" color={u.isAdmin ? 'purple' : u.isOwner ? 'green' : 'blue'} className="ring-2 ring-slate-50" />
                          <div>
                            <p className="text-sm font-bold text-slate-700">{u.fullName || u.userName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Joined {u.formattedDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 font-medium">{u.email}</p>
                        <p className="text-[11px] text-slate-400">{u.phoneNumber || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={u.isAdmin ? 'purple' : u.isOwner ? 'green' : 'blue'} className="!rounded-lg text-[10px] font-bold tracking-wider">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-400'}`}></span>
                          <span className={`text-[11px] font-bold ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant={u.isActive ? 'danger' : 'outline'}
                          onClick={() => toggleActive(u)}
                          className="!rounded-xl !h-8 !px-4 text-[11px]"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit user role">
        {editUser && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{editUser.fullName || editUser.userName} — {editUser.email}</p>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
              <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/20" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {editRole === 'Employee' && !isAlreadyEmployee && (
              <div className="p-3 bg-blue/5 border border-blue/20 rounded-xl">
                <p className="text-sm text-slate-700 mb-2">Not added as employee yet. Add them to the employees list to enable employee permissions.</p>
                <Button variant="outline" size="sm" onClick={addToEmployees} loading={loading}>Add to Employees</Button>
              </div>
            )}
            {editRole === 'Employee' && isAlreadyEmployee && (
              <p className="text-xs text-green-600 font-medium">✓ Registered as employee</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button onClick={saveRole} loading={loading}>Save</Button>
            </div>
          </div>
        )}
      </Modal>

          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-slate-50 flex items-center justify-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue/10 hover:text-blue transition-all disabled:opacity-30"
                onClick={pagination.prevPage}
                disabled={pagination.page === 1}
              >
                ‹
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((n) => Math.abs(n - pagination.page) < 3)
                .map((n) => (
                  <button
                    key={n}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all
                      ${n === pagination.page ? 'bg-blue text-white shadow-lg shadow-blue/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    onClick={() => pagination.goToPage(n)}
                  >
                    {n}
                  </button>
                ))}
              <button
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue/10 hover:text-blue transition-all disabled:opacity-30"
                onClick={pagination.nextPage}
                disabled={pagination.page === pagination.totalPages}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

/* ════════════════════════════════════════════
   REQUESTS PAGE
   ════════════════════════════════════════════ */
export const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const res = await requestService.getAllRequests({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
      });
      setRequests(res.data?.requests || []);
      pagination.setTotal(res.data?.total || 0);
    });
  }, [pagination.page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (r, status) => {
    await run(async () => {
      await requestService.updateStatus(r.id, status);
      toast.success(`Request ${status}`);
      load();
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <select
            className="px-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue/20 transition-all outline-none cursor-pointer min-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {['Pending', 'Approved', 'Rejected', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : requests.length === 0 ? (
            <Empty icon="📋" title="No requests found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                  {requests.map((r) => (
                    <motion.tr key={r.id} variants={tableRowVariants} className="hover:bg-blue/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700 text-sm italic">{r.property?.title || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{r.requester?.userName || '—'}</td>
                      <td className="px-6 py-4"><Badge color="blue" className="!rounded-lg text-[10px]">{r.type}</Badge></td>
                      <td className="px-6 py-4"><Badge color={r.statusColor} className="!rounded-lg text-[10px]">{r.status}</Badge></td>
                      <td className="px-6 py-4 text-right">
                        {r.status === 'Pending' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => updateStatus(r, 'Approved')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => updateStatus(r, 'Rejected')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                              title="Reject"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

/* ── Status: normalize for filter, label for display, backend value for API ── */
const statusToNormalized = (s) => (s || '').toLowerCase();
const appointmentStatusLabel = (s) => (s && s.charAt(0).toUpperCase() + s.slice(1)) || '—';
const statusToBackend = (s) => statusToNormalized(s);

/* ════════════════════════════════════════════
   APPOINTMENTS PAGE
   ════════════════════════════════════════════ */
export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const res = await appointmentService.getAllAppointments({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusToBackend(statusFilter) }),
      });
      const list = res.data?.appointments || [];
      if (res.data?.total != null) pagination.setTotal(res.data.total);
      const propIds = [...new Set(list.map((a) => toId(a.propertyId)).filter(Boolean))];
      const custIds = [...new Set(list.map((a) => toId(a.customerId)).filter(Boolean))];
      const propertyMap = {};
      const clientMap = {};
      await Promise.all([
        ...propIds.map(async (id) => {
          try {
            const pr = await propertyService.getById(String(id));
            propertyMap[id] = pr.data?.property || null;
          } catch (_) {
            propertyMap[id] = null;
          }
        }),
        ...custIds.map(async (id) => {
          try {
            const ur = await userService.getById(String(id));
            clientMap[id] = ur.data?.user || null;
          } catch (_) {
            clientMap[id] = null;
          }
        }),
      ]);
      list.forEach((a) => {
        const pid = toId(a.propertyId);
        const cid = toId(a.customerId);
        a.property = a.property || (pid ? propertyMap[pid] : null) || null;
        a.client = (a.client && typeof a.client === 'object' && (a.client.userName || a.client.email)) ? a.client : (cid ? clientMap[cid] : null) || null;
      });
      setAppointments(list);
      if (res.data?.total == null) pagination.setTotal(list.length);
    });
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedId) { setDetailData(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    const fetchClientIfNeeded = async (appointment) => {
        const hasClient = appointment.client && typeof appointment.client === 'object' && (appointment.client.userName || appointment.client.email);
        const customerId = toId(appointment.customerId);
        if (hasClient || !customerId) return null;
        try {
          const ur = await userService.getById(String(customerId));
          return ur.data?.user || null;
        } catch (_) {
          return null;
        }
      };
      (async () => {
      try {
        const res = await appointmentService.getById(selectedId);
        if (cancelled) return;
        const appointment = res.data?.appointment;
        if (!appointment) return;
        let property = appointment.property || null;
        const pid = toId(appointment.propertyId);
        if (!property && pid) {
          try {
            const pr = await propertyService.getById(String(pid));
            if (!cancelled) property = pr.data?.property || null;
          } catch (_) {}
        }
        let clientUser = await fetchClientIfNeeded(appointment);
        if (cancelled) return;
        if (!cancelled) setDetailData({ appointment, property, clientUser });
      } catch (_) {
        if (cancelled) return;
        const row = appointments.find((a) => a.id === selectedId);
        if (row) {
          let property = row.property || null;
          const rowPid = toId(row.propertyId);
          if (!property && rowPid) {
            try {
              const pr = await propertyService.getById(String(rowPid));
              if (!cancelled) property = pr.data?.property || null;
            } catch (_) {}
          }
          let clientUser = await fetchClientIfNeeded(row);
          if (cancelled) return;
          if (!cancelled) setDetailData({ appointment: row, property, clientUser });
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId, appointments]);

  const filteredAppointments = statusFilter
    ? appointments.filter((a) => statusToNormalized(a.status) === statusFilter)
    : appointments;

  const updateStatus = async (a, status) => {
    const backendStatus = statusToBackend(status);
    await run(async () => {
      await appointmentService.updateStatus(a.id, backendStatus);
      toast.success(`Status updated to: ${appointmentStatusLabel(status)}`);
      load();
      if (selectedId === a.id) setSelectedId(null);
    });
  };

  const clientName = (a) => {
    const c = a.client;
    if (!c) return a.customerId || '—';
    return c.userName || c.username || c.email || (typeof c === 'string' ? c : a.customerId) || '—';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <select
            className="px-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue/20 transition-all outline-none cursor-pointer min-w-[180px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : filteredAppointments.length === 0 ? (
            <Empty icon="📅" title="No appointments" sub={statusFilter ? 'Change filter or add new appointments' : ''} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property / Client</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                  {filteredAppointments.map((a) => (
                    <motion.tr
                      key={a.id}
                      variants={tableRowVariants}
                      className="hover:bg-blue/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedId(a.id)}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700">{a.property?.name || a.property?.title || '—'}</p>
                        <p className="text-[11px] text-slate-400">Client: {clientName(a)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-600">{a.formattedDate}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">{a.formattedStartTime} – {a.formattedEndTime}</p>
                      </td>
                      <td className="px-6 py-4"><Badge color={a.statusColor} className="!rounded-lg text-[10px]">{appointmentStatusLabel(a.status)}</Badge></td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {statusToNormalized(a.status) === 'scheduled' && (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="!h-8 !rounded-lg text-[11px]" onClick={() => updateStatus(a, 'completed')}>Complete</Button>
                            <Button size="sm" variant="danger" className="!h-8 !rounded-lg text-[11px]" onClick={() => updateStatus(a, 'cancelled')}>Cancel</Button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} title="Appointment details" size="lg">
        {detailLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : detailData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & time</p>
                <p className="text-sm font-semibold text-slate-800">{detailData.appointment.formattedDate}</p>
                <p className="text-xs text-slate-600">{detailData.appointment.formattedStartTime} – {detailData.appointment.formattedEndTime}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <Badge color={detailData.appointment.statusColor} className="!rounded-lg">{appointmentStatusLabel(detailData.appointment.status)}</Badge>
              </div>
            </div>
            {detailData.appointment.notes && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-slate-700">{detailData.appointment.notes}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Client</p>
              <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  {detailData.clientUser
                    ? (detailData.clientUser.userName || detailData.clientUser.email || '—')
                    : clientName(detailData.appointment)}
                </p>
                {detailData.clientUser?.phone_number && (
                  <p className="text-xs text-slate-600">Phone: {detailData.clientUser.phone_number}</p>
                )}
                {(detailData.clientUser?.email || detailData.appointment.client?.email) && (
                  <p className="text-xs text-slate-500">{detailData.clientUser?.email || detailData.appointment.client.email}</p>
                )}
                {!detailData.clientUser && toId(detailData.appointment.customerId) && (
                  <p className="text-xs text-slate-400">ID: {toId(detailData.appointment.customerId)}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Property</p>
              <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-2">
                {detailData.property ? (
                  <>
                    <p className="text-sm font-semibold text-slate-800">{detailData.property.name || detailData.property.title || '—'}</p>
                    <p className="text-xs text-slate-600">{detailData.property.shortLocation || '—'}</p>
                    <p className="text-sm font-bold text-primary">{detailData.property.formattedPrice}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {detailData.property.details?.bedrooms > 0 && <span>{detailData.property.details.bedrooms} Beds</span>}
                      {detailData.property.details?.bathrooms > 0 && <span>{detailData.property.details.bathrooms} Baths</span>}
                      {(detailData.property.area || detailData.property.details?.area) > 0 && (
                        <span>{detailData.property.area || detailData.property.details?.area} m²</span>
                      )}
                    </div>
                    {toId(detailData.appointment.propertyId) && (
                      <p className="text-[11px] text-slate-400">Property ID: {toId(detailData.appointment.propertyId)}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Property ID: {toId(detailData.appointment.propertyId) || '—'}</p>
                )}
              </div>
            </div>
            {statusToNormalized(detailData.appointment.status) === 'scheduled' && (
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="ghost" onClick={() => updateStatus(detailData.appointment, 'completed')}>Mark completed</Button>
                <Button size="sm" variant="danger" onClick={() => updateStatus(detailData.appointment, 'cancelled')}>Cancel appointment</Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 py-4">Could not load appointment details.</p>
        )}
      </Modal>
    </DashboardLayout>
  );
};

/* ── Payer/customer display name ── */
const payerName = (p) => {
  const c = p.transaction?.customer;
  if (!c) return '—';
  return c.userName || c.username || c.email || (typeof c === 'string' ? c : '—');
};

const methodLabel = (m) => (m && m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()) || m || '—';
const statusLabel = (s) => (s && s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) || s || '—';

/* ════════════════════════════════════════════
   PAYMENTS PAGE
   ════════════════════════════════════════════ */
export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 50);

  const load = useCallback(async () => {
    await run(async () => {
      const res = await paymentService.getAllPayments({ page: pagination.page, limit: pagination.limit });
      const list = res.data?.payments || [];
      const txIds = [...new Set(list.map((p) => toId(p.transactionId)).filter(Boolean))];
      const transactionMap = {};
      await Promise.all(
        txIds.map(async (id) => {
          try {
            const tr = await transactionService.getTransactionById(String(id));
            transactionMap[id] = tr.data?.transaction || null;
          } catch (_) {
            transactionMap[id] = null;
          }
        })
      );
      const custIds = [...new Set(Object.values(transactionMap).filter(Boolean).map((t) => toId(t.customerId)).filter(Boolean))];
      const propIds = [...new Set(Object.values(transactionMap).filter(Boolean).map((t) => toId(t.propertyId)).filter(Boolean))];
      const customerMap = {};
      const propertyMap = {};
      await Promise.all([
        ...custIds.map(async (id) => {
          try {
            const ur = await userService.getById(String(id));
            customerMap[id] = ur.data?.user || null;
          } catch (_) {
            customerMap[id] = null;
          }
        }),
        ...propIds.map(async (id) => {
          try {
            const pr = await propertyService.getById(String(id));
            propertyMap[id] = pr.data?.property || null;
          } catch (_) {
            propertyMap[id] = null;
          }
        }),
      ]);
      list.forEach((p) => {
        const tid = toId(p.transactionId);
        const tx = (tid ? transactionMap[tid] : null) || p.transaction || null;
        p.transaction = tx;
        if (tx) {
          const cid = toId(tx.customerId);
          const pid = toId(tx.propertyId);
          tx.customer = tx.customer || (cid ? customerMap[cid] : null) || null;
          tx.property = tx.property || (pid ? propertyMap[pid] : null) || null;
        }
      });
      setPayments(list);
      pagination.setTotal(res.data?.total ?? list.length);
    });
  }, [pagination.page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedId) { setDetailData(null); return; }
    const payment = payments.find((p) => p.id === selectedId);
    if (!payment) { setDetailData(null); return; }
    setDetailData({ payment, transaction: payment.transaction || null });
    setDetailLoading(false);
  }, [selectedId, payments]);

  const transactionRefLabel = (p) => {
    const t = p.transaction;
    if (!t) return p.transactionId ? `Transaction ${String(p.transactionId).slice(-8)}` : '—';
    const type = (t.transactionType || '').toLowerCase() === 'rent' ? 'Rent' : 'Sale';
    const total = t.totalAmount ? `EGP ${new Intl.NumberFormat('en-EG').format(t.totalAmount)}` : '';
    return total ? `${type} ${total}` : (t.id ? String(t.id).slice(-8) : '—');
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Payments</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : payments.length === 0 ? (
          <Empty icon="💳" title="No payments found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reference</th>
                </tr>
              </thead>
              <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                {payments.map((p) => (
                  <motion.tr
                    key={p.id}
                    variants={tableRowVariants}
                    className="hover:bg-blue/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedId(p.id)}
                  >
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">{payerName(p)}</td>
                    <td className="px-6 py-4">
                      <span className="text-blue font-black text-sm">{p.formattedAmount}</span>
                    </td>
                    <td className="px-6 py-4"><Badge color="gray" className="!rounded-lg text-[10px] uppercase">{methodLabel(p.method)}</Badge></td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">{p.formattedDate}</td>
                    <td className="px-6 py-4 text-[10px] font-medium text-slate-500">{transactionRefLabel(p)}</td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} title="Payment details" size="lg">
        {detailLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : detailData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                <p className="text-lg font-black text-primary">{detailData.payment.formattedAmount}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Method</p>
                <p className="text-sm font-semibold text-slate-800">{methodLabel(detailData.payment.method)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm text-slate-700">{detailData.payment.formattedPaymentDateTime || detailData.payment.formattedDate}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <Badge color="green" className="!rounded-lg">{statusLabel(detailData.payment.status)}</Badge>
              </div>
            </div>
            {detailData.payment.notes && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-slate-700">{detailData.payment.notes}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payer</p>
              <div className="p-4 bg-white border border-slate-100 rounded-xl">
                <p className="text-sm font-semibold text-slate-800">{detailData.transaction ? payerName({ transaction: detailData.transaction }) : '—'}</p>
                {detailData.transaction?.customer?.email && (
                  <p className="text-xs text-slate-500 mt-1">{detailData.transaction.customer.email}</p>
                )}
                {detailData.transaction?.customer?.phone_number && (
                  <p className="text-xs text-slate-500">Phone: {detailData.transaction.customer.phone_number}</p>
                )}
              </div>
            </div>
            {detailData.transaction && (
              <>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction</p>
                  <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1">
                    <p className="text-sm font-semibold text-slate-800">{(detailData.transaction.transactionType || '').toLowerCase() === 'rent' ? 'Rent' : 'Sale'} — {detailData.transaction.formattedTotal}</p>
                    <p className="text-xs text-slate-500">Paid: {detailData.transaction.formattedPaid}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Property</p>
                  <div className="p-4 bg-white border border-slate-100 rounded-xl">
                    {detailData.transaction.property ? (
                      <>
                        <p className="text-sm font-semibold text-slate-800">{detailData.transaction.property.name || detailData.transaction.property.title || '—'}</p>
                        <p className="text-xs text-slate-600 mt-1">{detailData.transaction.property.shortLocation || '—'}</p>
                        <p className="text-sm font-bold text-primary mt-1">{detailData.transaction.property.formattedPrice}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">Property ID: {toId(detailData.transaction.propertyId) || '—'}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-slate-500 py-4">Could not load payment details.</p>
        )}
      </Modal>
    </DashboardLayout>
  );
};

/* ════════════════════════════════════════════
   NOTIFICATIONS PAGE
   ════════════════════════════════════════════ */
export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { loading, run } = useAsync();

  const load = async () => {
    await run(async () => {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    });
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await notificationService.markOneRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteOne = async (id) => {
    await notificationService.deleteOne(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">System Alerts</h2>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">{unreadCount} UNREAD</p>
          </div>
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAll} className="!rounded-xl text-[11px] font-bold">Mark all as read</Button>}
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : notifications.length === 0 ? (
          <Empty icon="🔔" title="All clear!" sub="No new notifications for you." />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <AnimatePresence>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className={`relative p-5 rounded-2xl border transition-all group flex gap-4
                    ${n.isRead ? 'bg-white border-slate-100' : 'bg-blue/5 border-blue/10 shadow-lg shadow-blue/5'}`}
                >
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-blue shadow-[0_0_8px_rgba(2,137,251,0.6)] animate-pulse'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm tracking-tight leading-tight ${n.isRead ? 'text-slate-600 font-medium' : 'text-slate-800 font-bold'}`}>{n.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{n.timeAgo}</p>
                  </div>
                  <div className="flex gap-2 items-start shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-[10px] font-black text-blue hover:underline uppercase tracking-tighter"
                      >
                        Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(n.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

/* ════════════════════════════════════════════
   EMPLOYEES PAGE
   ════════════════════════════════════════════ */
const EMPTY_EMP = { userId: '', jobTitle: '', department: '', commissionRate: '', phone: '', salary: '', hireDate: '', employmentType: '', yearsOfExperience: '' };
const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'remote', label: 'Remote' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
];

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setFormState] = useState(EMPTY_EMP);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empDetail, setEmpDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const res = await employeeService.getAllEmployees({ page: pagination.page, limit: pagination.limit, search });
      setEmployees(res.data?.employees || []);
      pagination.setTotal(res.data?.total || 0);
    });
  }, [pagination.page, search]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await userService.getAllUsers({ limit: 500 });
      setUsers(res.data?.users || []);
    } catch (_) {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (modalOpen && !editEmp) loadUsers(); }, [modalOpen, editEmp]);

  const openCreate = () => { setEditEmp(null); setFormState(EMPTY_EMP); setModalOpen(true); };
  const openEdit = (e) => {
    setEditEmp(e);
    const hire = e.hireDate ? (e.hireDate instanceof Date ? e.hireDate : new Date(e.hireDate)).toISOString().slice(0, 10) : '';
    setFormState({
      userId: toId(e.userId) || '',
      jobTitle: e.jobTitle || e.department || '',
      department: e.department || '',
      commissionRate: e.commissionRate ?? '',
      phone: e.phone || '',
      salary: e.salary ?? '',
      hireDate: hire,
      employmentType: e.employmentType || '',
      yearsOfExperience: e.yearsOfExperience ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    await run(async () => {
      if (editEmp) {
        await employeeService.updateEmployee(editEmp.id, {
          jobTitle: form.jobTitle,
          department: form.department,
          commissionRate: form.commissionRate !== '' ? Number(form.commissionRate) : undefined,
          phone: form.phone || undefined,
          salary: form.salary !== '' ? Number(form.salary) : undefined,
          hireDate: form.hireDate || undefined,
          employmentType: form.employmentType || undefined,
          yearsOfExperience: form.yearsOfExperience !== '' ? Number(form.yearsOfExperience) : undefined,
        });
        toast.success('Employee updated!');
      } else {
        if (!form.userId) { toast.error('Please select a user'); return; }
        await employeeService.createEmployee({
          userId: form.userId,
          jobTitle: form.jobTitle || 'Staff',
          department: form.department || '',
          commissionRate: form.commissionRate !== '' ? Number(form.commissionRate) : 0,
          phone: form.phone || undefined,
          salary: form.salary !== '' ? Number(form.salary) : undefined,
          hireDate: form.hireDate || undefined,
          employmentType: form.employmentType || undefined,
          yearsOfExperience: form.yearsOfExperience !== '' ? Number(form.yearsOfExperience) : undefined,
        });
        toast.success('Employee added!');
      }
      setModalOpen(false);
      load();
    });
  };

  const handleDeactivate = async () => {
    await run(async () => {
      await employeeService.deactivateEmployee(deleteTarget.id);
      toast.success('Employee deactivated');
      setDeleteTarget(null);
      load();
    });
  };

  const setF = (k, v) => setFormState((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!selectedEmp) { setEmpDetail(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    (async () => {
      try {
        const [empRes, txRes, taskRes] = await Promise.all([
          employeeService.getEmployeeById(selectedEmp.id),
          transactionService.getTransactions({ employeeId: selectedEmp.id }).catch(() => ({ data: { transactions: [] } })),
          taskService.getAssignedTasks({ employeeId: selectedEmp.id }).catch(() => ({ data: { tasks: [] } })),
        ]);
        if (cancelled) return;
        const emp = empRes.data?.employee;
        const transactions = txRes.data?.transactions || [];
        const tasks = Array.isArray(taskRes.data?.tasks) ? taskRes.data.tasks : (taskRes.data?.data || []);
        const installmentsRes = await installmentService.getInstallments({}).catch(() => ({ data: { installments: [] } }));
        const allInstallments = installmentsRes.data?.installments || [];
        const txIds = (transactions || []).map((t) => toId(t.id));
        const installments = Array.isArray(allInstallments) ? allInstallments.filter((i) => txIds.includes(toId(i.transactionId))) : [];
        setEmpDetail({ employee: emp, transactions: transactions || [], tasks, installments });
      } catch (_) {
        if (!cancelled) setEmpDetail(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedEmp]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm outline-none"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openCreate} className="!rounded-xl !shadow-lg !shadow-blue/10">Add Member</Button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : employees.length === 0 ? (
            <Empty icon="👷" title="No employees yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialty</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                  {employees.map((e) => (
                    <motion.tr
                    key={e.id}
                    variants={tableRowVariants}
                    className="hover:bg-blue/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedEmp(e)}
                  >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={e.name} size="sm" color="purple" />
                          <div>
                            <p className="text-sm font-bold text-slate-700">{e.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${e.isActive ? 'bg-green-500' : 'bg-red-400'}`}></span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{e.isActive ? 'Active' : 'Offline'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        <p>{e.email}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{e.phone || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color="purple" className="!rounded-lg text-[10px] font-bold">{e.jobTitle || e.department || '—'}</Badge>
                        {e.employmentType && <span className="text-[10px] text-slate-500 ml-1">({e.employmentType})</span>}
                        {e.commissionRate != null && e.commissionRate > 0 && (
                          <span className="text-[10px] text-slate-500 ml-1">{e.commissionRate}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4" onClick={(ev) => ev.stopPropagation()}>
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(e)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all">✎</button>
                          <button onClick={() => setDeleteTarget(e)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">Deactivate</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editEmp ? 'Edit Member' : 'Add Member'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {!editEmp && (
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-dark">User (required)</label>
              <select className="w-full h-12 px-4 border-[1.5px] border-border rounded-md text-[14px] bg-white outline-none focus:border-blue" value={form.userId} onChange={(e) => setF('userId', e.target.value)} required>
                <option value="">Select user...</option>
                {users.filter((u) => !employees.some((emp) => toId(emp.userId) === u.id)).map((u) => (
                  <option key={u.id} value={u.id}>{u.userName || u.email} ({u.email})</option>
                ))}
                {users.length === 0 && <option value="">Loading users...</option>}
              </select>
            </div>
          )}
          <Input label="Job title / Specialty" value={form.jobTitle} onChange={(e) => setF('jobTitle', e.target.value)} placeholder="e.g. Sales Agent" />
          <Input label="Department" value={form.department} onChange={(e) => setF('department', e.target.value)} placeholder="e.g. Sales" />
          <div>
            <label className="block text-[13px] font-semibold text-dark mb-1">Employment type</label>
            <select className="w-full h-12 px-4 border-[1.5px] border-border rounded-md text-[14px] bg-white outline-none focus:border-blue" value={form.employmentType} onChange={(e) => setF('employmentType', e.target.value)}>
              <option value="">— Select —</option>
              {EMPLOYMENT_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Salary (EGP)" type="number" min="0" value={form.salary} onChange={(e) => setF('salary', e.target.value)} placeholder="0" />
            <Input label="Years of experience" type="number" min="0" value={form.yearsOfExperience} onChange={(e) => setF('yearsOfExperience', e.target.value)} placeholder="0" />
          </div>
          <Input label="Hire date" type="date" value={form.hireDate} onChange={(e) => setF('hireDate', e.target.value)} />
          <Input label="Commission rate (%)" type="number" min="0" max="100" step="0.5" value={form.commissionRate} onChange={(e) => setF('commissionRate', e.target.value)} placeholder="0" />
          <Input label="Phone" value={form.phone} onChange={(e) => setF('phone', e.target.value)} />
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>{editEmp ? 'Save Changes' : 'Add Member'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!selectedEmp} onClose={() => setSelectedEmp(null)} title="Employee details" size="lg">
        {detailLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : empDetail ? (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-4">
              <Avatar name={empDetail.employee?.name} size="lg" />
              <div>
                <p className="font-bold text-slate-800">{empDetail.employee?.name}</p>
                <p className="text-sm text-slate-500">{empDetail.employee?.email}</p>
                <p className="text-xs text-slate-400">{empDetail.employee?.jobTitle || empDetail.employee?.department || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-end gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Commission rate (%)</label>
                  <input type="number" min="0" max="100" step="0.5" className="mt-1 w-24 px-3 py-2 border rounded-lg text-sm"
                    defaultValue={empDetail.employee?.commissionRate ?? ''} id="emp-commission-input" />
                </div>
                <Button size="sm" onClick={async () => {
                  const input = document.getElementById('emp-commission-input');
                  const v = input && input.value !== '' ? Number(input.value) : 0;
                  try {
                    await employeeService.updateEmployee(selectedEmp.id, { commissionRate: v });
                    toast.success('Commission rate updated');
                    setEmpDetail((d) => ({ ...d, employee: { ...d.employee, commissionRate: v } }));
                    load();
                  } catch (_) { toast.error('Failed to update'); }
                }}>Save</Button>
              </div>
              <p className="text-sm text-slate-500">Total sales: {empDetail.employee?.totalSalesAmount != null ? `EGP ${new Intl.NumberFormat('en-EG').format(empDetail.employee.totalSalesAmount)}` : '—'}</p>
              <p className="text-sm text-slate-500">Deals: {empDetail.employee?.totalDeals ?? '—'}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Transactions / Sales ({empDetail.transactions?.length || 0})</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {(empDetail.transactions || []).length === 0 ? <p className="text-slate-500 text-sm">None</p> : empDetail.transactions.map((t) => (
                  <div key={t.id} className="p-2 bg-white border rounded-lg text-xs flex justify-between">
                    <span>{(t.transactionType || '').toLowerCase() === 'rent' ? 'Rent' : 'Sale'} — {t.formattedTotal}</span>
                    <span className="text-slate-400">{t.formattedPaid} paid</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Tasks ({empDetail.tasks?.length || 0})</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {(empDetail.tasks || []).length === 0 ? <p className="text-slate-500 text-sm">None</p> : empDetail.tasks.map((t) => (
                  <div key={t.id || t._id} className="p-2 bg-white border rounded-lg text-xs">{t.title || t.taskNo || t.id}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Installments ({empDetail.installments?.length || 0})</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {(empDetail.installments || []).length === 0 ? <p className="text-slate-500 text-sm">None</p> : empDetail.installments.slice(0, 20).map((i) => (
                  <div key={i.id || i._id} className="p-2 bg-white border rounded-lg text-xs flex justify-between">
                    <span>Installment #{i.installmentNo ?? ''}</span>
                    <span>EGP {new Intl.NumberFormat('en-EG').format(i.amount || 0)} — {i.status || '—'}</span>
                  </div>
                ))}
                {(empDetail.installments?.length || 0) > 20 && <p className="text-slate-400 text-xs">+{empDetail.installments.length - 20} more</p>}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeactivate} title="Deactivate employee" message="Deactivate this team member? They can be reactivated later." danger />
    </DashboardLayout>
  );
};

/* ════════════════════════════════════════════
   TRANSACTIONS PAGE
   ════════════════════════════════════════════ */
const EMPTY_TRANS = { propertyId: '', customerId: '', employeeId: '', transactionType: 'sale', totalAmount: '', paidAmount: 0 };
const INSTALLMENT_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly', defaultCount: 12 },
  { value: 'quarterly', label: 'Every 3 months', defaultCount: 4 },
  { value: 'semi_annual', label: 'Every 6 months', defaultCount: 2 },
  { value: 'yearly', label: 'Yearly', defaultCount: 1 },
];

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [selectedTransForGen, setSelectedTransForGen] = useState(null);
  const [genForm, setGenForm] = useState({ transactionId: '', startDate: '', numberOfInstallments: 12, frequency: 'monthly' });
  const [form, setFormState] = useState(EMPTY_TRANS);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [propSearch, setPropSearch] = useState('');
  const [custSearch, setCustSearch] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const res = await transactionService.getTransactions({ page: pagination.page, limit: pagination.limit });
      setTransactions(res.data?.transactions || []);
      pagination.setTotal(res.data?.total || 0);
    });
  }, [pagination.page]);

  const loadOptions = useCallback(async () => {
    try {
      const [propRes, userRes, empRes] = await Promise.all([
        propertyService.getList({ limit: 200 }).catch(() => ({ data: { properties: [] } })),
        userService.getAllUsers({ limit: 200 }).catch(() => ({ data: { users: [] } })),
        employeeService.getAllEmployees({ limit: 200 }).catch(() => ({ data: { employees: [] } })),
      ]);
      setPropertyOptions(propRes.data?.properties || []);
      setUserOptions(userRes.data?.users || []);
      setEmployeeOptions(empRes.data?.employees || []);
    } catch (_) {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (modalOpen) loadOptions(); }, [modalOpen]);

  const openCreate = () => { setFormState(EMPTY_TRANS); setPropSearch(''); setCustSearch(''); setEmpSearch(''); setModalOpen(true); };

  const filterOpt = (list, search, labelFn) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((x) => labelFn(x).toLowerCase().includes(q));
  };
  const propLabel = (p) => (p?.name || p?.title || p?.id || '').toString();
  const userLabel = (u) => (u?.userName || u?.email || u?.id || '').toString();
  const empLabel = (e) => (e?.name || e?.email || e?.id || '').toString();
  const filteredProps = filterOpt(propertyOptions, propSearch, propLabel);
  const filteredUsers = filterOpt(userOptions, custSearch, userLabel);
  const filteredEmps = filterOpt(employeeOptions, empSearch, empLabel);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    await run(async () => {
      await transactionService.create(form);
      toast.success('Transaction created!');
      setModalOpen(false);
      load();
    });
  };

  const setF = (k, v) => setFormState((f) => ({ ...f, [k]: v }));
  const setG = (k, v) => setGenForm((f) => ({ ...f, [k]: v }));

  const openGenModal = (t) => {
    setSelectedTransForGen(t);
    const freq = INSTALLMENT_FREQUENCIES.find((f) => f.value === 'monthly');
    setGenForm({
      transactionId: t.id,
      startDate: new Date().toISOString().slice(0, 10),
      numberOfInstallments: freq?.defaultCount ?? 12,
      frequency: 'monthly',
    });
    setGenModalOpen(true);
  };

  const onGenFrequencyChange = (frequency) => {
    setG('frequency', frequency);
    const f = INSTALLMENT_FREQUENCIES.find((x) => x.value === frequency);
    if (f) setG('numberOfInstallments', f.defaultCount);
  };

  const totalForGen = selectedTransForGen ? Number(selectedTransForGen.totalAmount) || 0 : 0;
  const perInstallment = genForm.numberOfInstallments > 0 ? Math.round(totalForGen / genForm.numberOfInstallments) : 0;

  const handleGenerateInstallments = async (evt) => {
    evt.preventDefault();
    await run(async () => {
      await installmentService.generateInstallments(genForm);
      toast.success('Installments generated');
      setGenModalOpen(false);
      setSelectedTransForGen(null);
      load();
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Transactions Ledger</h2>
          <Button onClick={openCreate}>Record Transaction</Button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : transactions.length === 0 ? (
            <Empty icon="🧾" title="No transactions yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property/Customer</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amounts</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                  {transactions.map((t) => (
                    <motion.tr key={t.id} variants={tableRowVariants} className="hover:bg-blue/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700">{t.property?.name || t.property?.title || (typeof t.propertyId === 'string' ? t.propertyId : toId(t.propertyId)) || '—'}</p>
                        <p className="text-[11px] text-slate-400">Customer: {t.customer?.fullName || t.customer?.userName || t.customer?.email || (typeof t.customerId === 'string' ? t.customerId : toId(t.customerId)) || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color="blue" className="!rounded-lg text-[10px]">{t.transactionType}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800 text-green-600">Total: {t.formattedTotal}</p>
                        <p className="text-xs font-semibold text-slate-400">Paid: {t.formattedPaid}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => openGenModal(t)} className="!rounded-lg !text-xs">Set installments</Button>
                          <Button size="sm" variant="ghost" className="!text-blue">Details</Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Transaction" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Property (search then select)</label>
            <input type="text" placeholder="Search property..." className="w-full mb-2 px-4 py-2 border rounded-xl text-sm" value={propSearch} onChange={(e) => setPropSearch(e.target.value)} />
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.propertyId} onChange={(e) => setF('propertyId', e.target.value)} required>
              <option value="">— Select property —</option>
              {filteredProps.map((p) => (
                <option key={p.id} value={p.id}>{propLabel(p)} {p?.formattedPrice ? ` — ${p.formattedPrice}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer (search then select)</label>
            <input type="text" placeholder="Search customer..." className="w-full mb-2 px-4 py-2 border rounded-xl text-sm" value={custSearch} onChange={(e) => setCustSearch(e.target.value)} />
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.customerId} onChange={(e) => setF('customerId', e.target.value)} required>
              <option value="">— Select customer —</option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>{userLabel(u)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employee (search then select)</label>
            <input type="text" placeholder="Search employee..." className="w-full mb-2 px-4 py-2 border rounded-xl text-sm" value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} />
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.employeeId} onChange={(e) => setF('employeeId', e.target.value)} required>
              <option value="">— Select employee —</option>
              {filteredEmps.map((e) => (
                <option key={e.id} value={e.id}>{empLabel(e)} {e?.jobTitle ? ` (${e.jobTitle})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction Type</label>
              <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.transactionType} onChange={(e) => setF('transactionType', e.target.value)}>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </div>
            <Input label="Total Amount" type="number" value={form.totalAmount} onChange={(e) => setF('totalAmount', e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Record</Button>
          </div>
        </form>
      </Modal>

      <Modal open={genModalOpen} onClose={() => { setGenModalOpen(false); setSelectedTransForGen(null); }} title="Generate installments" size="lg">
        <form onSubmit={handleGenerateInstallments} className="space-y-4">
          {selectedTransForGen && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-bold text-slate-800">{selectedTransForGen.property?.name || selectedTransForGen.property?.title || 'Transaction'} — {selectedTransForGen.formattedTotal}</p>
              <p className="text-xs text-slate-500 mt-1">Total will be split into installments by frequency below.</p>
            </div>
          )}
          <input type="hidden" name="transactionId" value={genForm.transactionId} />
          <Input label="Start date" type="date" value={genForm.startDate} onChange={(e) => setG('startDate', e.target.value)} required />
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Frequency</label>
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={genForm.frequency} onChange={(e) => onGenFrequencyChange(e.target.value)}>
              {INSTALLMENT_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <Input label="Number of installments" type="number" min="1" value={genForm.numberOfInstallments} onChange={(e) => setG('numberOfInstallments', parseInt(e.target.value, 10) || 1)} required />
          {totalForGen > 0 && (
            <div className="p-4 bg-blue/5 rounded-xl border border-blue/20">
              <p className="text-sm font-semibold text-slate-800">Preview: EGP {new Intl.NumberFormat('en-EG').format(totalForGen)} ÷ {genForm.numberOfInstallments} = <span className="text-primary">EGP {new Intl.NumberFormat('en-EG').format(perInstallment)}</span> per installment</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { setGenModalOpen(false); setSelectedTransForGen(null); }}>Cancel</Button>
            <Button type="submit" loading={loading}>Generate</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

/* ════════════════════════════════════════════
   TASKS PAGE (Employee / Admin)
   ════════════════════════════════════════════ */
const EMPTY_TASK = { employeeId: '', propertyId: '', title: '', description: '', dueDate: '' };

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setFormState] = useState(EMPTY_TASK);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const res = await taskService.getAssignedTasks({ page: pagination.page, limit: pagination.limit });
      setTasks(res.data?.tasks || []);
      pagination.setTotal(res.data?.total || 0);
    });
  }, [pagination.page]);

  const loadOptions = useCallback(async () => {
    try {
      const [empRes, propRes] = await Promise.all([
        employeeService.getAllEmployees({ limit: 200 }).catch(() => ({ data: { employees: [] } })),
        propertyService.getList({ limit: 200 }).catch(() => ({ data: { properties: [] } })),
      ]);
      setEmployeeOptions(empRes.data?.employees || []);
      setPropertyOptions(propRes.data?.properties || []);
    } catch (_) {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (modalOpen) loadOptions(); }, [modalOpen]);

  const openCreate = () => { setFormState(EMPTY_TASK); setEmpSearch(''); setPropSearch(''); setModalOpen(true); };

  const filterOpt = (list, search, labelFn) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((x) => labelFn(x).toLowerCase().includes(q));
  };
  const empLabel = (e) => (e?.name || e?.email || e?.id || '').toString();
  const propLabel = (p) => (p?.name || p?.title || p?.id || '').toString();
  const filteredEmps = filterOpt(employeeOptions, empSearch, empLabel);
  const filteredProps = filterOpt(propertyOptions, propSearch, propLabel);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    await run(async () => {
      await taskService.assignTask(form);
      toast.success('Task Assigned!');
      setModalOpen(false);
      load();
    });
  };

  const setF = (k, v) => setFormState((f) => ({ ...f, [k]: v }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Task Management</h2>
          <Button onClick={openCreate}>Assign Task</Button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : tasks.length === 0 ? (
            <Empty icon="📋" title="No active tasks" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Task Info</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                  {tasks.map((t) => (
                    <motion.tr key={t.id} variants={tableRowVariants} className="hover:bg-blue/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700 text-sm">{t.employeeId || '—'}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{t.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-red-500">{t.formattedDueDate}</td>
                      <td className="px-6 py-4">
                        <Badge color="yellow" className="!rounded-lg text-[10px]">{t.status}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Assign Task" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setF('title', e.target.value)} required />
          <Input label="Description" value={form.description} onChange={(e) => setF('description', e.target.value)} required />
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employee (search then select)</label>
            <input type="text" placeholder="Search employee..." className="w-full mb-2 px-4 py-2 border rounded-xl text-sm" value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} />
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.employeeId} onChange={(e) => setF('employeeId', e.target.value)} required>
              <option value="">— Select employee —</option>
              {filteredEmps.map((e) => (
                <option key={e.id} value={e.id}>{empLabel(e)} {e?.jobTitle ? ` (${e.jobTitle})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Property (optional — search then select)</label>
            <input type="text" placeholder="Search property..." className="w-full mb-2 px-4 py-2 border rounded-xl text-sm" value={propSearch} onChange={(e) => setPropSearch(e.target.value)} />
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.propertyId} onChange={(e) => setF('propertyId', e.target.value)}>
              <option value="">— Optional —</option>
              {filteredProps.map((p) => (
                <option key={p.id} value={p.id}>{propLabel(p)}</option>
              ))}
            </select>
          </div>
          <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setF('dueDate', e.target.value)} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Assign Task</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

/* ════════════════════════════════════════════
   EVALUATIONS & EMAIL LOGS PAGE
   ════════════════════════════════════════════ */

export const EvaluationsPage = () => {
  const [evals, setEvals] = useState([]);
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const res = await evaluationService.getAll({ page: pagination.page, limit: pagination.limit });
      setEvals(res.data?.evaluations || []);
      pagination.setTotal(res.data?.total || 0);
    });
  }, [pagination.page]);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Customer Evaluations</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : evals.length === 0 ? (
          <Empty icon="⭐" title="No evaluations found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Comments</th>
                </tr>
              </thead>
              <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                {evals.map((e) => (
                  <motion.tr key={e.id} variants={tableRowVariants} className="hover:bg-blue/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">{e.employeeId || '—'}</td>
                    <td className="px-6 py-4"><span className="text-amber-400 font-bold">{Array(e.rating).fill('★').join('')}</span></td>
                    <td className="px-6 py-4"><p className="text-xs text-slate-500 italic max-w-[300px] truncate">{e.comments}</p></td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

/* ════════════════════════════════════════════
   FINANCIALS PAGE (Installments & Payments)
   ════════════════════════════════════════════ */

export const FinancialsPage = () => {
  const [installments, setInstallments] = useState([]);
  const [sales, setSales] = useState([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [payments, setPayments] = useState([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [transactionOptions, setTransactionOptions] = useState([]);
  const [installmentsForSelectedTx, setInstallmentsForSelectedTx] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [transSearch, setTransSearch] = useState('');
  const [genTransSearch, setGenTransSearch] = useState('');
  const [payForInstallment, setPayForInstallment] = useState(null);

  const [form, setFormState] = useState({ transactionId: '', installmentId: '', amount: '', paymentMethod: 'cash', notes: '' });
  const [genForm, setGenForm] = useState({ transactionId: '', startDate: '', numberOfInstallments: 5, frequency: 'monthly' });

  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const [txRes, instRes, payRes] = await Promise.all([
        transactionService.getTransactions({ limit: 500 }).catch(() => ({ data: { transactions: [] } })),
        installmentService.getInstallments({ limit: 500 }).catch(() => ({ data: { installments: [] } })),
        paymentService.getAllPayments({ limit: 500 }).catch(() => ({ data: { payments: [] } })),
      ]);
      const allTx = txRes.data?.transactions || [];
      const saleList = allTx.filter((t) => (t.transactionType || '').toLowerCase() === 'sale');
      const totalAmount = saleList.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
      setSales(saleList);
      setSalesTotal(totalAmount);
      setTransactionOptions(allTx);
      setInstallments(instRes.data?.installments || []);
      const payList = payRes.data?.payments || [];
      setPayments(payList);
      setTotalReceived(payList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
    });
  }, []);

  const loadTransactionOptions = useCallback(async () => {
    try {
      const res = await transactionService.getTransactions({ limit: 300 });
      setTransactionOptions(res.data?.transactions || []);
    } catch (_) { setTransactionOptions([]); }
  }, []);

  const loadInstallmentsForTransaction = useCallback(async (transactionId) => {
    if (!transactionId) { setInstallmentsForSelectedTx([]); return; }
    try {
      const res = await installmentService.getInstallments({ transactionId, limit: 100 });
      let list = res.data?.installments || [];
      const tid = toId(transactionId);
      if (tid && list.some((i) => toId(i.transactionId) !== tid)) list = list.filter((i) => toId(i.transactionId) === tid);
      list = list.slice().sort((a, b) => {
        const dA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dA - dB;
      });
      setInstallmentsForSelectedTx(list);
    } catch (_) { setInstallmentsForSelectedTx([]); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (modalOpen || genModalOpen) loadTransactionOptions(); }, [modalOpen, genModalOpen]);
  useEffect(() => { loadInstallmentsForTransaction(form.transactionId); }, [form.transactionId]);
  useEffect(() => {
    if (payForInstallment) {
      setFormState((f) => ({
        ...f,
        transactionId: payForInstallment.transactionId || '',
        installmentId: payForInstallment.id || '',
        amount: String(payForInstallment.amount ?? ''),
      }));
      setModalOpen(true);
      setPayForInstallment(null);
    }
  }, [payForInstallment]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    await run(async () => {
      await paymentService.recordPayment(form);
      toast.success('Payment recorded — amount will appear in Financials.');
      setModalOpen(false);
      setFormState({ transactionId: '', installmentId: '', amount: '', paymentMethod: 'cash', notes: '' });
      load();
    });
  };

  const dueInstallments = installmentsForSelectedTx.filter((i) => (i.status || '').toLowerCase() === 'due');
  const nextDueForForm = dueInstallments[0] || null;
  const txMap = Object.fromEntries((transactionOptions || []).map((t) => [t.id, t]));
  const installmentsWithTx = installments.map((i) => ({
    ...i,
    transaction: txMap[toId(i.transactionId)] || null,
  })).filter((i) => i.transaction || i.transactionId);
  const sortedInstallments = installmentsWithTx.slice().sort((a, b) => {
    const dA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const dB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return dA - dB;
  });
  const nextDueGlobal = sortedInstallments.find((i) => (i.status || '').toLowerCase() === 'due');

  const handleGenerate = async (evt) => {
    evt.preventDefault();
    await run(async () => {
      await installmentService.generateInstallments(genForm);
      toast.success('Installments generated successfully!');
      setGenModalOpen(false);
      load();
    });
  };

  const setF = (k, v) => setFormState((f) => ({ ...f, [k]: v }));
  const setG = (k, v) => setGenForm((f) => ({ ...f, [k]: v }));

  const filteredTransForForm = transactionOptions.filter((t) => {
    const label = `${t.transactionType || ''} ${t.formattedTotal || ''} ${t.id || ''}`.toLowerCase();
    return !transSearch || label.includes(transSearch.toLowerCase());
  });
  const filteredTransForGen = transactionOptions.filter((t) => {
    const label = `${t.transactionType || ''} ${t.formattedTotal || ''} ${t.id || ''}`.toLowerCase();
    return !genTransSearch || label.includes(genTransSearch.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Financial Management</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setGenModalOpen(true)}>Generate Installments</Button>
            <Button onClick={() => { setFormState({ transactionId: '', installmentId: '', amount: '', paymentMethod: 'cash', notes: '' }); setModalOpen(true); }}>Record Payment</Button>
          </div>
        </div>

        {/* Company Sales */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Company Sales</h3>
            <p className="text-sm text-slate-500 mt-1">What we sold and for how much — for financial analysis</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">Total Sales</p>
                <p className="text-2xl font-black text-green-700 mt-1">EGP {new Intl.NumberFormat('en-EG').format(salesTotal)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Number of Deals (Sale)</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{sales.length}</p>
              </div>
              <div className="p-4 bg-blue/5 rounded-2xl border border-blue/20">
                <p className="text-[11px] font-bold text-blue uppercase tracking-wider">Average Deal</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{sales.length ? `EGP ${new Intl.NumberFormat('en-EG').format(Math.round(salesTotal / sales.length))}` : '—'}</p>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : sales.length === 0 ? (
              <Empty icon="📊" title="No sales yet" sub="Sale transactions will appear here once recorded" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sales.map((t) => (
                      <tr key={t.id} className="hover:bg-blue/5">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{t.property?.name || t.property?.title || toId(t.propertyId) || '—'}</td>
                        <td className="px-6 py-4 font-bold text-green-600">{t.formattedTotal}</td>
                        <td className="px-6 py-4 text-slate-600">{t.formattedPaid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled installments — only real money when paid via Record Payment */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Scheduled installments</h3>
            <p className="text-sm text-slate-500 mt-1">Installments appear here; they are recorded in Financials only when paid (Record Payment).</p>
          </div>
          <div className="overflow-x-auto">
            {sortedInstallments.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>No installments yet. Generate installments from a transaction (Transactions → Set installments).</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property / Transaction</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedInstallments.map((i) => {
                    const isNextDue = (i.status || '').toLowerCase() === 'due' && nextDueGlobal?.id === i.id;
                    return (
                      <tr key={i.id || i._id} className={isNextDue ? 'bg-amber-50/50' : ''}>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {i.transaction?.property?.name || i.transaction?.property?.title || i.transaction?.formattedTotal || toId(i.transactionId) || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm">{i.installmentNo ?? '—'}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">EGP {new Intl.NumberFormat('en-EG').format(i.amount || 0)}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">{i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-EG') : '—'}</td>
                        <td className="px-6 py-4">
                          <Badge color={(i.status || '').toLowerCase() === 'paid' ? 'green' : (i.status || '').toLowerCase() === 'overdue' ? 'red' : 'yellow'} className="!rounded-lg text-[10px]">
                            {(i.status || 'due').toLowerCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(i.status || '').toLowerCase() === 'due' && (
                            <Button size="sm" variant="outline" className="!rounded-lg" onClick={() => setPayForInstallment({ id: toId(i), transactionId: toId(i.transactionId), amount: i.amount })}>
                              Pay
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Payments received — actual money (only when payment is recorded) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Payments received</h3>
            <p className="text-sm text-slate-500 mt-1">Actual money received. Amounts appear here only after recording a payment.</p>
          </div>
          <div className="p-6">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 inline-block">
              <p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">Total received</p>
              <p className="text-2xl font-black text-green-700 mt-1">EGP {new Intl.NumberFormat('en-EG').format(totalReceived)}</p>
            </div>
            {payments.length > 0 && (
              <div className="mt-4 overflow-x-auto max-h-48">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase">Amount</th>
                      <th className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase">Method</th>
                      <th className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.slice(0, 20).map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 font-semibold text-green-600">EGP {new Intl.NumberFormat('en-EG').format(p.amount || 0)}</td>
                        <td className="px-4 py-2 text-slate-600">{methodLabel(p.method)}</td>
                        <td className="px-4 py-2 text-slate-500">{p.formattedDate || (p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-EG') : '—')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length > 20 && <p className="text-xs text-slate-400 mt-2">+{payments.length - 20} more</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction (search then select)</label>
            <input type="text" placeholder="Search by amount or ID..." className="w-full mb-2 px-4 py-2 border rounded-xl text-sm" value={transSearch} onChange={(e) => setTransSearch(e.target.value)} />
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.transactionId} onChange={(e) => setF('transactionId', e.target.value)} required>
              <option value="">— Select transaction —</option>
              {filteredTransForForm.map((t) => (
                <option key={t.id} value={t.id}>{(t.transactionType || '').toLowerCase() === 'rent' ? 'Rent' : 'Sale'} — {t.formattedTotal} (ID: {String(t.id).slice(-8)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Apply to installment (optional — auto: next due)</label>
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.installmentId} onChange={(e) => { const opt = installmentsForSelectedTx.find((i) => (i.id || i._id) === e.target.value); setF('installmentId', e.target.value); if (opt) setF('amount', String(opt.amount ?? '')); }}>
              <option value="">— No specific installment —</option>
              {installmentsForSelectedTx.filter((i) => (i.status || '').toLowerCase() === 'due').map((i) => (
                <option key={i.id || i._id} value={i.id || i._id}>#{i.installmentNo ?? ''} — EGP {new Intl.NumberFormat('en-EG').format(i.amount || 0)} — due {i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-EG') : ''}</option>
              ))}
            </select>
            {form.transactionId && nextDueForForm && !form.installmentId && (
              <p className="text-xs text-amber-600 mt-1">Next due: #{nextDueForForm.installmentNo} — EGP {new Intl.NumberFormat('en-EG').format(nextDueForForm.amount || 0)}. Select it above or leave amount as needed.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount" type="number" value={form.amount} onChange={(e) => setF('amount', e.target.value)} required />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
              <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={form.paymentMethod} onChange={(e) => setF('paymentMethod', e.target.value)}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
          <Input label="Notes" value={form.notes} onChange={(e) => setF('notes', e.target.value)} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Payment</Button>
          </div>
        </form>
      </Modal>

      <Modal open={genModalOpen} onClose={() => setGenModalOpen(false)} title="Generate Installments">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction (search then select)</label>
            <input type="text" placeholder="Search by amount or ID..." className="w-full mb-2 px-4 py-2 border rounded-xl text-sm" value={genTransSearch} onChange={(e) => setGenTransSearch(e.target.value)} />
            <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={genForm.transactionId} onChange={(e) => setG('transactionId', e.target.value)} required>
              <option value="">— Select transaction —</option>
              {filteredTransForGen.map((t) => (
                <option key={t.id} value={t.id}>{(t.transactionType || '').toLowerCase() === 'rent' ? 'Rent' : 'Sale'} — {t.formattedTotal} (ID: {String(t.id).slice(-8)})</option>
              ))}
            </select>
          </div>
          <Input label="Start Date" type="date" value={genForm.startDate} onChange={(e) => setG('startDate', e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Number of Installments" type="number" value={genForm.numberOfInstallments} onChange={(e) => setG('numberOfInstallments', parseInt(e.target.value))} required />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Frequency</label>
              <select className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue/50" value={genForm.frequency} onChange={(e) => setG('frequency', e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Every 3 months</option>
                <option value="semi_annual">Every 6 months</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setGenModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Generate</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
