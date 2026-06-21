import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, UserRound, UsersRound } from 'lucide-react';
import api, { compact } from '../lib/api';
import { Empty, ErrorPanel, PageHeader, SkeletonRows } from '../components/UI';

export default function Customers() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], totalPages: 1 });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.get('/customers', { params: { page, limit: 18 } }));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = data.data?.filter((x) => x.customerId.toLowerCase().includes(query.toLowerCase())) || [];

  return (
    <>
      <PageHeader 
        eyebrow="NETWORK / CUSTOMERS" 
        title="Rider directory" 
        description="Understand customer activity and identify your most engaged riders." 
      />
      <section className="directory-tools">
        <label className="search-field">
          <Search />
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Find customer on this page..." 
          />
        </label>
        <div>
          <UsersRound />
          <span>Customer network</span>
          <b>{compact((data.totalPages || 1) * 18)}+</b>
        </div>
      </section>

      {error ? (
        <ErrorPanel message={error} retry={load} />
      ) : loading ? (
        <SkeletonRows count={8} />
      ) : filtered.length ? (
        <section className="customer-grid">
          {filtered.map((c, i) => (
            <article className="customer-card" key={c.customerId}>
              <div className={`avatar tone-${i % 4}`}>
                <UserRound />
              </div>
              <div>
                <span className="eyebrow">CUSTOMER</span>
                <h3>{c.customerId}</h3>
                <p>{c.totalBookings} completed interactions</p>
              </div>
              <div className="activity-bar">
                <i style={{ width: `${Math.min(100, c.totalBookings * 4)}%` }} />
              </div>
              <footer>
                <span>Engagement</span>
                <b>{c.totalBookings > 20 ? 'High' : c.totalBookings > 8 ? 'Regular' : 'Growing'}</b>
              </footer>
            </article>
          ))}
        </section>
      ) : (
        <Empty title="No customers found" />
      )}

      <div className="pagination">
        <span>Page {page} of {data.totalPages || 1}</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft />
          </button>
          <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight />
          </button>
        </div>
      </div>
    </>
  );
}
