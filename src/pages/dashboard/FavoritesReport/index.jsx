// pages/dashboard/FavoritesReport/index.jsx — Favorites report: popular, long-standing, property stats
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout.jsx';
import { favoriteService } from '../../../services/index.js';
import { Spinner, Button } from '../../../components/common/index.jsx';
import { toast } from 'react-toastify';

const LIMIT_OPTIONS = [10, 20, 50, 100];
const DAYS_OPTIONS = [7, 14, 30, 60, 90];

export default function FavoritesReportPage() {
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingLongStanding, setLoadingLongStanding] = useState(true);
  const [popular, setPopular] = useState([]);
  const [longStanding, setLongStanding] = useState([]);
  const [city, setCity] = useState('');
  const [limit, setLimit] = useState(20);
  const [days, setDays] = useState(30);

  // Property stats (optional)
  const [statsPropertyId, setStatsPropertyId] = useState('');
  const [stats, setStats] = useState(null);
  const [favoritedBy, setFavoritedBy] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadPopular = useCallback(async () => {
    setLoadingPopular(true);
    try {
      const res = await favoriteService.getPopularByFavorites({ city: city || undefined, limit });
      setPopular(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error('Failed to load popular favorites');
      setPopular([]);
    } finally {
      setLoadingPopular(false);
    }
  }, [city, limit]);

  const loadLongStanding = useCallback(async () => {
    setLoadingLongStanding(true);
    try {
      const res = await favoriteService.getLongStandingFavorites({ days });
      setLongStanding(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error('Failed to load long-standing favorites');
      setLongStanding([]);
    } finally {
      setLoadingLongStanding(false);
    }
  }, [days]);

  useEffect(() => { loadPopular(); }, [loadPopular]);
  useEffect(() => { loadLongStanding(); }, [loadLongStanding]);

  const loadStatsForProperty = async () => {
    const id = statsPropertyId?.trim();
    if (!id) {
      toast.info('Enter a property ID');
      return;
    }
    setLoadingStats(true);
    setStats(null);
    setFavoritedBy([]);
    try {
      const [statsRes, usersRes] = await Promise.all([
        favoriteService.getPropertyFavoriteStats(id),
        favoriteService.getFavoritedByUsers(id).catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data ?? null);
      setFavoritedBy(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (e) {
      toast.error('Failed to load property stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const formatPrice = (n) => (n != null ? `EGP ${new Intl.NumberFormat('en-EG').format(n)}` : '—');
  const locationStr = (loc) => {
    if (!loc) return '—';
    const parts = [loc.city, loc.area, loc.address].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Favorites Report</h2>
          <p className="text-slate-500 text-sm mt-1">Most favorited properties, long-standing favorites, and per-property stats</p>
        </div>

        {/* Most popular by favorites */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Most popular by favorites</h3>
            <p className="text-sm text-slate-500 mt-0.5">For analytics and promotion</p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <input
                type="text"
                placeholder="City (optional)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm w-40"
              />
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
              >
                {LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>Top {n}</option>
                ))}
              </select>
              <Button size="sm" onClick={loadPopular} disabled={loadingPopular}>Refresh</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingPopular ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : popular.length === 0 ? (
              <p className="text-slate-500 py-12 text-center">No data</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Favorites</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Price</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {popular.map((row, i) => (
                    <tr key={row.propertyId?._id ?? row.propertyId ?? i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{row.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{row.favoriteCount ?? row.count ?? 0}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatPrice(row.price)}</td>
                      <td className="px-4 py-3 text-slate-600">{locationStr(row.location)}</td>
                      <td className="px-4 py-3 text-slate-600">{row.statusSaleRent ?? row.availability ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Long-standing favorites */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Long-standing favorites</h3>
            <p className="text-sm text-slate-500 mt-0.5">For recommendations or &quot;Still interested?&quot; notifications</p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
              >
                {DAYS_OPTIONS.map((d) => (
                  <option key={d} value={d}>Last {d} days</option>
                ))}
              </select>
              <Button size="sm" onClick={loadLongStanding} disabled={loadingLongStanding}>Refresh</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingLongStanding ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : longStanding.length === 0 ? (
              <p className="text-slate-500 py-12 text-center">No data</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Price</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Days in Favorites</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Added at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {longStanding.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{row.userName ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{row.email ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{row.propertyName ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatPrice(row.propertyPrice)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{row.daysInFavorites ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{row.addedAt ? new Date(row.addedAt).toLocaleDateString('en-EG') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Property favorite stats + users who favorited */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800">Favorite stats for a property</h3>
          <p className="text-sm text-slate-500 mt-0.5">Current favorites count, total added, total removed — and users who have it in favorites</p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <input
              type="text"
              placeholder="Property ID"
              value={statsPropertyId}
              onChange={(e) => setStatsPropertyId(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm w-56"
            />
            <Button size="sm" onClick={loadStatsForProperty} disabled={loadingStats}>Load</Button>
          </div>
          {loadingStats && <div className="mt-4 flex justify-center"><Spinner /></div>}
          {!loadingStats && stats && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current favorites</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{stats.currentFavoriteCount ?? 0}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total added</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalAdded ?? 0}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total removed</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalRemoved ?? 0}</p>
              </div>
            </div>
          )}
          {!loadingStats && favoritedBy.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-bold text-slate-700 mb-2">Users who have this in favorites</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-wider">Added at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {favoritedBy.map((u, i) => (
                      <tr key={u.userId ?? i}>
                        <td className="px-4 py-2 font-medium text-slate-800">{u.userName ?? '—'}</td>
                        <td className="px-4 py-2 text-slate-600">{u.email ?? '—'}</td>
                        <td className="px-4 py-2 text-slate-600">{u.phone_number ?? '—'}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{u.addedAt ? new Date(u.addedAt).toLocaleDateString('en-EG') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
