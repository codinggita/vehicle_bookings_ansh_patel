import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bike, CalendarCheck, CheckCircle2, IndianRupee, Plus, RefreshCw, Route, Users, XCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { compact, dateTime, money, pct } from '../lib/api';
import { Empty, ErrorPanel, MetricCard, PageHeader, SkeletonRows, Status } from '../components/UI';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

const statCalls = [
  ['total',     '/stats/total-bookings',    'totalBookings'],
  ['success',   '/stats/success-rides',     'successRides'],
  ['cancelled', '/stats/cancelled-rides',   'cancelledRides'],
  ['customers', '/stats/total-customers',   'totalCustomers'],
  ['dnf',       '/stats/driver-not-found',  'driverNotFound'],
  ['incomplete','/stats/incomplete-rides',  'incompleteRides'],
];

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [data, setData] = useState({ stats: {}, recent: [], trending: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [stats, recent, trending] = await Promise.all([
        Promise.all(statCalls.map(async ([key, url, field]) => [key, (await api.get(url)).data[field]])),
        api.get('/bookings/recent'),
        api.get('/bookings/trending'),
      ]);
      setData({
        stats: Object.fromEntries(stats),
        recent: recent.data || [],
        trending: trending.data || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = data.stats;

  const total         = s.total      || 0;
  const completionPct = pct(s.success,   total);
  const cancelPct     = pct(s.cancelled, total);
  const dnfPct        = pct(s.dnf,       total);
  const customerDensityPct = total > 0 ? Math.round(((s.customers || 0) / total) * 100) : 0;

  const topVehicle = data.trending.length > 0
    ? [...data.trending].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
    : null;

  return (
    <>
      <Helmet><title>Command Center</title></Helmet>
      <PageHeader
        eyebrow="LIVE OPERATIONS / TODAY"
        title={Good \, \.}
        description="Here is the pulse of your booking network right now."
        actions={
          <>
            <button className="button ghost" onClick={load} disabled={loading}>
              <RefreshCw size={16} />Refresh
            </button>
            {user?.role === 'admin' && (
              <Link className="button primary" to="/bookings/new">
                <Plus size={16} />New booking
              </Link>
            )}
          </>
        }
      />

      {error && <ErrorPanel message={error} retry={load} />}

      <section className="metric-grid">
        <MetricCard
          label="Total bookings"
          value={compact(total)}
          note="All-time demand"
          icon={CalendarCheck}
          tone="lime"
          trend={completionPct}
        />
        <MetricCard
          label="Completed rides"
          value={compact(s.success)}
          note={\% completion rate}
          icon={CheckCircle2}
          tone="blue"
          trend={completionPct}
        />
        <MetricCard
          label="Cancellation"
          value={compact(s.cancelled)}
          note={\% of bookings}
          icon={XCircle}
          tone="orange"
          trend={-cancelPct}
        />
        <MetricCard
          label="Active customers"
          value={compact(s.customers)}
          note={\% unique rider ratio}
          icon={Users}
          tone="purple"
          trend={customerDensityPct}
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">DEMAND SIGNAL</span>
              <h2>Fleet mix</h2>
            </div>
            <span className="live-pill"><i />Live data</span>
          </div>
          <div className="chart-wrap">
            {loading ? <SkeletonRows count={4} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trending.map((x) => ({ name: x._id || x.vehicleType, rides: x.count }))}>
                  <defs>
                    <linearGradient id="rides" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#c7f36b" stopOpacity=".45"/>
                      <stop offset="1" stopColor="#c7f36b" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--line)" vertical={false}/>
                  <XAxis dataKey="name" tickLine={false} axisLine={false}/>
                  <YAxis tickLine={false} axisLine={false}/>
                  <Tooltip
                    cursor={{ stroke: 'var(--faint)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: 10 }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Area type="monotone" dataKey="rides" stroke="#b9e85f" strokeWidth={3} fill="url(#rides)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="panel signal-panel">
          <div className="panel-head">
            <div><span className="eyebrow">OPERATOR BRIEF</span><h2>Network signals</h2></div>
            <Route />
          </div>
          <div className="signals">
            <div>
              <span><Bike /></span>
              <div>
                <b>{topVehicle?._id || topVehicle?.vehicleType || 'No data'}</b>
                <p>Highest demand vehicle — {compact(topVehicle?.count || 0)} rides</p>
              </div>
            </div>
            <div>
              <span><IndianRupee /></span>
              <div>
                <b>{money(data.recent[0]?.bookingValue)}</b>
                <p>Latest recorded booking value</p>
              </div>
            </div>
            <div>
              <span><Users /></span>
              <div>
                <b>{compact(s.customers)} riders</b>
                <p>Addressable customer network</p>
              </div>
            </div>
            {dnfPct > 0 && (
              <div>
                <span><XCircle /></span>
                <div>
                  <b>{dnfPct}% driver-not-found</b>
                  <p>{compact(s.dnf)} bookings with no driver assigned</p>
                </div>
              </div>
            )}
          </div>
          <Link to="/analytics" className="text-link">Open intelligence report <ArrowRight /></Link>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel-head">
          <div><span className="eyebrow">LATEST MOVEMENT</span><h2>Recent bookings</h2></div>
          <Link to="/bookings" className="text-link">View all <ArrowRight /></Link>
        </div>
        {loading ? <SkeletonRows /> : data.recent.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Booking</th><th>Route</th><th>Vehicle</th><th>Value</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody>
                {data.recent.slice(0, 7).map((b) => (
                  <tr key={b.bookingId} onClick={() => navigate(/bookings/\)}>
                    <td><b>{b.bookingId}</b><small>{b.customerId}</small></td>
                    <td>{b.pickupLocation}<span className="route-arrow">→</span>{b.dropLocation}</td>
                    <td>{b.vehicleType}</td>
                    <td><b>{money(b.bookingValue)}</b></td>
                    <td><Status value={b.bookingStatus} /></td>
                    <td>{dateTime(b.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty />}
      </section>
    </>
  );
}
