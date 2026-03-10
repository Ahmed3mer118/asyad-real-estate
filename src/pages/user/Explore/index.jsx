// pages/user/Explore/index.jsx — Tailwind CSS version
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import UserLayout from '../../../layouts/UserLayout.jsx';
import PropertyCard from '../../../components/property/PropertyCard.jsx';
import { propertyService } from '../../../services/index.js';
import { Spinner, Empty } from '../../../components/common/index.jsx';
import { useDebounce } from '../../../hooks/index.jsx';

const TYPES = ['Villa', 'Apartment', 'Townhouse', 'Office', 'Land'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

/* Chip filter button */
const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-[14px] py-[6px] rounded-pill border-[1.5px] text-[13px] font-medium cursor-pointer transition-all duration-200
      ${active
        ? 'border-blue bg-blue-light text-blue'
        : 'border-border bg-white text-dark hover:border-blue hover:bg-blue-light hover:text-blue'
      }`}
  >
    {children}
  </button>
);

/* Quick select */
const quickSelectCls = `h-[38px] px-[14px] border-[1.5px] border-border rounded-pill text-[13px] text-dark bg-white
  cursor-pointer outline-none transition-all duration-200 appearance-none
  hover:border-blue focus:border-blue`;

const ExplorePage = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 8;

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minBedrooms: '',
    furnished: '',
    sort: '-createdAt',
  });
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.city) params.city = filters.city;
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minBedrooms) params.minBedrooms = filters.minBedrooms;
      if (filters.furnished) params.furnished = filters.furnished;
      if (filters.sort) params.sort = filters.sort;
      const res = await propertyService.getList(params);
      setProperties(res.data?.properties || []);
      setTotal(res.data?.total || 0);
    } catch {
      setProperties([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, [page, debouncedSearch, filters.city, filters.type, filters.status, filters.minPrice, filters.maxPrice, filters.minBedrooms, filters.furnished, filters.sort]);

  const setFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };
  const clearFilters = () => {
    setFilters({ search: '', city: '', type: '', status: '', minPrice: '', maxPrice: '', minBedrooms: '', furnished: '', sort: '-createdAt' });
    setPage(1);
  };
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <UserLayout>
      <div className="min-h-[calc(100vh-76px)] bg-gray-light">

        {/* ── TOP BAR ── */}
        <div className="bg-white border-b border-border sticky top-[76px] z-[100] shadow-sm">
          <div className="max-w-8xl mx-auto px-10 py-4 flex items-center gap-4 flex-wrap max-[600px]:px-5">

            {/* Search */}
            <div className="flex-1 min-w-[240px] flex items-center gap-[10px] bg-gray-light rounded-pill
              px-[18px] py-[10px] border-[1.5px] border-border transition-all duration-200
              focus-within:border-blue focus-within:bg-white">
              <span className="text-[16px] text-gray">🔍</span>
              <input
                className="border-none outline-none bg-transparent text-[14px] text-dark flex-1"
                placeholder="Search by title, city..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
              />
            </div>

            {/* Quick filters */}
            <div className="flex gap-[10px] flex-wrap">
              <select className={quickSelectCls} value={filters.city} onChange={(e) => setFilter('city', e.target.value)}>
                <option value="">All Cities</option>
                {['New Cairo', 'Sheikh Zayed', 'New Capital', 'October', 'North Coast'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select className={quickSelectCls} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                <option value="">Buy &amp; Rent</option>
                <option value="for_sale">For Sale</option>
                <option value="for_rent">For Rent</option>
              </select>
              <select className={quickSelectCls} value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                className="px-4 py-[9px] rounded-pill text-[13px] font-semibold bg-blue-light text-blue cursor-pointer border-none
                  transition-all duration-200 hover:bg-blue hover:text-white"
                onClick={() => setShowFilters((s) => !s)}
              >
                ⚙️ Filters {showFilters ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* ── Advanced filters panel ── */}
          {showFilters && (
            <div className="border-t border-border px-10 py-6 bg-gray-light animate-fade-down max-[600px]:px-5">
              <div className="flex gap-8 flex-wrap items-start mb-4">

                {/* Property Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray uppercase tracking-[0.5px]">Property Type</label>
                  <div className="flex gap-1.5 flex-wrap">
                    <Chip active={!filters.type} onClick={() => setFilter('type', '')}>All</Chip>
                    {TYPES.map((t) => <Chip key={t} active={filters.type === t} onClick={() => setFilter('type', t)}>{t}</Chip>)}
                  </div>
                </div>

                {/* Min Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray uppercase tracking-[0.5px]">Min Price (EGP)</label>
                  <input type="number" placeholder="0"
                    className="h-[38px] px-3 rounded-md border-[1.5px] border-border text-[14px] outline-none w-[160px] bg-white transition-all duration-200 focus:border-blue"
                    value={filters.minPrice} onChange={(e) => setFilter('minPrice', e.target.value)} />
                </div>

                {/* Max Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray uppercase tracking-[0.5px]">Max Price (EGP)</label>
                  <input type="number" placeholder="Any"
                    className="h-[38px] px-3 rounded-md border-[1.5px] border-border text-[14px] outline-none w-[160px] bg-white transition-all duration-200 focus:border-blue"
                    value={filters.maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)} />
                </div>

                {/* Min Bedrooms */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray uppercase tracking-[0.5px]">Min Bedrooms</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {['', '1', '2', '3', '4', '5'].map((n) => (
                      <Chip key={n} active={filters.minBedrooms === n} onClick={() => setFilter('minBedrooms', n)}>
                        {n || 'Any'}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Furnished */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray uppercase tracking-[0.5px]">Furnished</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[['', 'Any'], ['true', 'Yes'], ['false', 'No']].map(([val, lbl]) => (
                      <Chip key={val} active={filters.furnished === val} onClick={() => setFilter('furnished', val)}>{lbl}</Chip>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className="text-[13px] text-red font-semibold cursor-pointer bg-transparent border-none p-0 hover:underline"
                onClick={clearFilters}
              >
                ✕ Clear All
              </button>
            </div>
          )}
        </div>

        {/* ── RESULTS ── */}
        <div className="max-w-8xl mx-auto px-10 py-8 max-[600px]:px-5">
          <p className="text-[15px] text-gray mb-6 font-medium">
            {loading ? 'Searching...' : `${total} properties found`}
          </p>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : properties.length === 0 ? (
            <Empty icon="🏚️" title="No properties found" sub="Try adjusting your filters." />
          ) : (
            <>
              <div className="grid grid-cols-4 gap-6 max-[1400px]:grid-cols-3 max-[1100px]:grid-cols-2 max-[600px]:grid-cols-1">
                {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10 flex-wrap">
                  <button
                    className="w-9 h-9 rounded-md border border-border bg-white text-dark font-medium
                      cursor-pointer transition-all duration-200 hover:border-blue hover:text-blue disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                  >‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => Math.abs(n - page) < 3)
                    .map((n) => (
                      <button
                        key={n}
                        className={`w-9 h-9 rounded-md border text-[14px] font-medium cursor-pointer transition-all duration-200
                          ${n === page
                            ? 'bg-blue border-blue text-white'
                            : 'border-border bg-white text-dark hover:border-blue hover:text-blue'
                          }`}
                        onClick={() => setPage(n)}
                      >{n}</button>
                    ))}
                  <button
                    className="w-9 h-9 rounded-md border border-border bg-white text-dark font-medium
                      cursor-pointer transition-all duration-200 hover:border-blue hover:text-blue disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                  >›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default ExplorePage;
