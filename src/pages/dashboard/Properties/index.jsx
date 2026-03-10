// pages/dashboard/Properties/index.js
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout.jsx';
import { propertyService } from '../../../services/index.js';
import { Button, Badge, Modal, Input, Select, Textarea, Spinner, Empty, ConfirmModal } from '../../../components/common/index.jsx';
import { toast } from 'react-toastify';
import { useAsync, usePagination } from '../../../hooks/index.jsx';

const TYPES = ['Villa', 'Apartment', 'Townhouse', 'Office', 'Land'].map((v) => ({ value: v, label: v }));
const STATUSES = [{ value: 'sale', label: 'For Sale' }, { value: 'rent', label: 'For Rent' }];

const EMPTY_FORM = {
  name: '', description: '', price: '', statusSaleRent: 'sale', propertyType: 'Apartment',
  'details.bedrooms': '', 'details.bathrooms': '', 'details.area': '', 'details.furnished': false,
  'location.address': '', 'location.city': '', 'location.country': 'Egypt',
};

const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { loading, run } = useAsync();
  const pagination = usePagination(1, 10);

  const load = useCallback(async () => {
    await run(async () => {
      const params = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (filterStatus) params.statusSaleRent = filterStatus;
      const res = await propertyService.getList(params);
      setProperties(res.data?.properties || []);
      pagination.setTotal(res.data?.total || 0);
    });
  }, [pagination.page, search, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditProp(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => {
    setEditProp(p);
    setForm({
      name: p.name || p.title, description: p.description, price: p.price,
      statusSaleRent: p.statusSaleRent || (p.status === 'for_rent' ? 'rent' : 'sale'),
      propertyType: p.propertyType || p.type,
      'details.bedrooms': p.details?.bedrooms ?? '', 'details.bathrooms': p.details?.bathrooms ?? '',
      'details.area': p.details?.area ?? p.area ?? '', 'details.furnished': p.details?.furnished ?? false,
      'location.address': p.location?.address ?? '', 'location.city': p.location?.city ?? '',
      'location.country': p.location?.country ?? 'Egypt',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await run(async () => {
      const payload = {
        name: form.name, description: form.description,
        price: Number(form.price), statusSaleRent: form.statusSaleRent, propertyType: form.propertyType,
        availability: 'available',
        details: {
          bedrooms: Number(form['details.bedrooms']) || 0,
          bathrooms: Number(form['details.bathrooms']) || 0,
          area: Number(form['details.area']) || 0,
          furnished: Boolean(form['details.furnished']),
        },
        location: {
          address: form['location.address'], city: form['location.city'],
          country: form['location.country'] || 'Egypt',
        },
      };
      if (editProp) {
        await propertyService.updateProperty(editProp.id, payload);
        toast.success('Property updated!');
      } else {
        await propertyService.createProperty(payload);
        toast.success('Property created!');
      }
      setModalOpen(false);
      load();
    });
  };

  const handleDelete = async () => {
    await run(async () => {
      await propertyService.deactivateProperty(deleteTarget.id);
      toast.success('Property deactivated!');
      setDeleteTarget(null);
      load();
    });
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-1 items-center gap-3 max-w-md">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue/20 transition-all outline-none"
                placeholder="Search properties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue/20 transition-all outline-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <Button onClick={openCreate} className="!rounded-xl !shadow-lg !shadow-blue/10">Add Property</Button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : properties.length === 0 ? (
            <Empty icon="🏠" title="No properties found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-50">
                  {properties.map((p) => (
                    <motion.tr key={p.id} variants={tableRowVariants} className="hover:bg-blue/5 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{p.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium italic">{p.location?.city || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge color="gray" className="!rounded-lg text-[10px]">{p.propertyType || p.type}</Badge>
                          <span className="text-[11px] text-slate-400 font-bold">{p.details?.bedrooms ?? 0} Bed • {p.details?.area ?? p.area ?? 0}m²</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-blue font-black text-sm">{p.formattedPrice}</td>
                      <td className="px-6 py-4"><Badge color={p.isForSale ? 'blue' : 'green'} className="!rounded-lg text-[10px] font-bold">{p.badgeText}</Badge></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all">✎</button>
                          <button onClick={() => setDeleteTarget(p)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">🗑</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}

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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProp ? 'Edit Property' : 'Add New Property'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setF('name', e.target.value)} required className="sm:col-span-2" />
            <Select label="Type" options={TYPES} value={form.propertyType} onChange={(e) => setF('propertyType', e.target.value)} />
            <Select label="Status" options={STATUSES} value={form.statusSaleRent} onChange={(e) => setF('statusSaleRent', e.target.value)} />
            <Input label="Price (EGP)" type="number" value={form.price} onChange={(e) => setF('price', e.target.value)} required />
            <Input label="Bedrooms" type="number" value={form['details.bedrooms']} onChange={(e) => setF('details.bedrooms', e.target.value)} />
            <Input label="Bathrooms" type="number" value={form['details.bathrooms']} onChange={(e) => setF('details.bathrooms', e.target.value)} />
            <Input label="Area (m²)" type="number" value={form['details.area']} onChange={(e) => setF('details.area', e.target.value)} />
            <Input label="City" value={form['location.city']} onChange={(e) => setF('location.city', e.target.value)} />
            <Input label="Address" value={form['location.address']} onChange={(e) => setF('location.address', e.target.value)} />
            <div className="sm:col-span-2">
              <Textarea label="Description" value={form.description} onChange={(e) => setF('description', e.target.value)} rows={3} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer hidden"
                  checked={form['details.furnished']}
                  onChange={(e) => setF('details.furnished', e.target.checked)}
                />
                <div className="w-5 h-5 border-2 border-slate-200 rounded-lg group-hover:border-blue transition-all peer-checked:bg-blue peer-checked:border-blue flex items-center justify-center">
                  <span className="text-white text-[10px] scale-0 peer-checked:scale-100 transition-transform">✓</span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-blue transition-colors">Furnished</span>
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>{editProp ? 'Save Changes' : 'Publish Property'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate Property"
        message={`Are you sure you want to deactivate "${deleteTarget?.name || deleteTarget?.title}"?`}
        danger
      />
    </DashboardLayout>
  );
};

export default PropertiesPage;
