import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Filter, Plus, Search, SlidersHorizontal, Eye, Calendar, IndianRupee, Activity } from 'lucide-react';
import api, { dateTime, money } from '../lib/api';
import { Empty, ErrorPanel, PageHeader, SkeletonRows, Status } from '../components/UI';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

const statuses = ['', 'Success', 'Canceled by Driver', 'Canceled by Customer', 'Driver Not Found'];
const vehicles = ['', 'Bike', 'eBike', 'Auto', 'Mini', 'Prime Sedan', 'Prime Plus', 'Prime SUV'];

export default function Bookings() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [url, setUrl] = useSearchParams();
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    keyword: url.get('keyword') || '',
    status: url.get('status') || '',
    vehicle: url.get('vehicle') || '',
    sort: url.get('sort') || '-date',
    startDate: url.get('startDate') || '',
    endDate: url.get('endDate') || '',
    minFare: url.get('minFare') || '',
    maxFare: url.get('maxFare') || '',
    minDistance: url.get('minDistance') || '',
    maxDistance: url.get('maxDistance') || '',
    showDeleted: url.get('showDeleted') || 'false',
  });

  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const k = url.get('keyword') || '';
    if (k !== filters.keyword) {
      setFilters(f => ({ ...f, keyword: k }));
      setPage(1);
    }
  }, [url]);

  const query = useMemo(() => ({ ...filters, page, limit: 12 }), [filters, page]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await api.get('/bookings', { params: query }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const update = (name, value) => {
    setFilters((f) => {
      const next = { ...f, [name]: value };
      
      const params = {};
      Object.entries(next).forEach(([k, v]) => {
        if (v && v !== 'false') params[k] = v;
      });
      setUrl(params);
      
      return next;
    });
    setPage(1);
  };

  const clearFilters = () => {
    const fresh = {
      keyword: '',
      status: '',
      vehicle: '',
      sort: '-date',
      startDate: '',
      endDate: '',
      minFare: '',
      maxFare: '',
      minDistance: '',
      maxDistance: '',
      showDeleted: 'false',
    };
    setFilters(fresh);
    setUrl({});
    setPage(1);
  };

  const exportCsv = () => {
    const headers = ['Booking ID', 'Customer', 'Date', 'Vehicle', 'Pickup', 'Drop', 'Value', 'Status', 'Distance'];
    const rows = result.data.map((b) => [
      b.bookingId,
      b.customerId,
      b.date,
      b.vehicleType,
      b.pickupLocation,
      b.dropLocation,
      b.bookingValue,
      b.bookingStatus,
      b.rideDistance
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `rideops-bookings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <Helmet><title>Booking Control</title></Helmet>
      <PageHeader 
        eyebrow="OPERATIONS / BOOKINGS" 
        title={filters.showDeleted === 'true' ? 'Archived Bookings' : 'Booking control'} 
        description={filters.showDeleted === 'true' ? 'Audit and recover soft-deleted booking logs.' : 'Search, inspect, and resolve every booking in the network.'} 
        actions={
          <>
            <button className="button ghost" onClick={exportCsv}>
              <Download size={16} /> Export CSV
            </button>
            {user?.role === 'admin' && (
              <Link to="/bookings/new" className="button primary">
                <Plus size={16} /> New booking
              </Link>
            )}
          </>
        } 
      />

      <section className="filter-bar">
        <label className="search-field">
          <Search />
          <input 
            value={filters.keyword} 
            onChange={(e) => update('keyword', e.target.value)} 
            placeholder="Search ID, customer, route..." 
          />
        </label>
        <label>
          <Filter />
          <select value={filters.status} onChange={(e) => update('status', e.target.value)}>
            {statuses.map((x) => <option key={x} value={x}>{x || 'All statuses'}</option>)}
          </select>
        </label>
        <label>
          <SlidersHorizontal />
          <select value={filters.vehicle} onChange={(e) => update('vehicle', e.target.value)}>
            {vehicles.map((x) => <option key={x} value={x}>{x || 'All vehicles'}</option>)}
          </select>
        </label>
        
        <select className="sort-select" value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="-date">Newest first</option>
          <option value="date">Oldest first</option>
          <option value="-Booking_Value">Highest value</option>
          <option value="Booking_Value">Lowest value</option>
        </select>

        <button 
          className={`button small ${showAdvanced ? 'primary' : 'ghost'}`} 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ height: '38px', whiteSpace: 'nowrap' }}
        >
          Advanced Filters
        </button>
      </section>

      {showAdvanced && (
        <section className="panel advanced-filter-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <label className="field">
              <span>Start Date</span>
              <input type="date" value={filters.startDate} onChange={(e) => update('startDate', e.target.value)} />
            </label>
            <label className="field">
              <span>End Date</span>
              <input type="date" value={filters.endDate} onChange={(e) => update('endDate', e.target.value)} />
            </label>
            <label className="field">
              <span>Min Value (INR)</span>
              <input type="number" placeholder="Min Fare" value={filters.minFare} onChange={(e) => update('minFare', e.target.value)} />
            </label>
            <label className="field">
              <span>Max Value (INR)</span>
              <input type="number" placeholder="Max Fare" value={filters.maxFare} onChange={(e) => update('maxFare', e.target.value)} />
            </label>
            <label className="field">
              <span>Min Distance (km)</span>
              <input type="number" placeholder="Min km" value={filters.minDistance} onChange={(e) => update('minDistance', e.target.value)} />
            </label>
            <label className="field">
              <span>Max Distance (km)</span>
              <input type="number" placeholder="Max km" value={filters.maxDistance} onChange={(e) => update('maxDistance', e.target.value)} />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--line)', paddingTop: '15px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--muted)' }}>
              <input 
                type="checkbox" 
                checked={filters.showDeleted === 'true'} 
                onChange={(e) => update('showDeleted', e.target.checked ? 'true' : 'false')} 
              />
              Show Archived (Soft-Deleted) Bookings Only
            </label>
            
            <button className="button ghost small" onClick={clearFilters}>
              Reset Filters
            </button>
          </div>
        </section>
      )}

      {error ? (
        <ErrorPanel message={error} retry={load} />
      ) : (
        <section className="panel data-panel">
          <div className="result-meta">
            <b>{result.pagination?.total ?? 0} bookings {filters.showDeleted === 'true' && '(Archived)'}</b>
            <span>Server synchronized</span>
          </div>
          
          {loading ? (
            <SkeletonRows count={8} />
          ) : result.data.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Date / time</th>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((b) => (
                    <tr key={b.bookingId} onClick={() => navigate(`/bookings/${b.bookingId}`)}>
                      <td>
                        <b>{b.bookingId}</b>
                        <small>{b.customerId}</small>
                      </td>
                      <td>{dateTime(b.date)}</td>
                      <td>
                        <b className="route-text">{b.pickupLocation}</b>
                        <small>to {b.dropLocation}</small>
                      </td>
                      <td>{b.vehicleType}</td>
                      <td>
                        <b>{money(b.bookingValue)}</b>
                        <small>{b.rideDistance || 0} km</small>
                      </td>
                      <td>
                        <Status value={b.bookingStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title={filters.showDeleted === 'true' ? "No soft-deleted bookings found" : "No matching bookings"} />
          )}
        </section>
      )}

      <div className="pagination">
        <span>Page {result.pagination?.page || page} of {result.pagination?.totalPages || 1}</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft />
          </button>
          <button disabled={page >= (result.pagination?.totalPages || 1)} onClick={() => setPage(page + 1)}>
            <ChevronRight />
          </button>
        </div>
      </div>
    </>
  );
}
