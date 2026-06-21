import { useCallback, useEffect, useState } from 'react';
import { Activity, Bike, CheckCircle2, IndianRupee, CreditCard, Target, XCircle, FileText, AlertTriangle, UserX, RefreshCw } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { compact, money, pct } from '../lib/api';
import { ErrorPanel, MetricCard, PageHeader, SkeletonRows } from '../components/UI';
import { Helmet } from 'react-helmet-async';

const CANCEL_COLORS = ['#b9e85f', '#ff8a65', '#64b5f6', '#ce93d8', '#ffb74d', '#4db6ac', '#f06292', '#90a4ae'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [total, success, cancelled, topVehicle, payment, highest, trending, cancellations] = await Promise.all([
        '/stats/total-bookings',
        '/stats/success-rides',
        '/stats/cancelled-rides',
        '/stats/top-vehicle',
        '/stats/top-payment-method',
        '/stats/highest-fare',
        '/bookings/trending',
        '/stats/cancellations'
      ].map((u) => api.get(u)));

      setData({
        total: total.data.totalBookings,
        success: success.data.successRides,
        cancelled: cancelled.data.cancelledRides,
        topVehicle: topVehicle.data,
        payment: payment.data,
        highest: highest.data,
        trending: trending.data || [],
        cancellations: cancellations.data || {}
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExportPDF = () => {
    window.print();
  };

  if (error) return <ErrorPanel message={error} retry={load} />;
  if (loading || !data) return <SkeletonRows count={10} />;

  const outcomes = [
    { name: 'Completed', value: data.success, color: '#b9e85f' },
    { name: 'Cancelled', value: data.cancelled, color: '#ff8a65' },
    { name: 'Other', value: Math.max(0, data.total - data.success - data.cancelled), color: '#64756d' }
  ];

  const customerCancelData = (data.cancellations.customerCancel || []).slice(0, 6);
  const driverCancelData = (data.cancellations.driverCancel || []).slice(0, 6);
  const incompleteData = (data.cancellations.incomplete || []).slice(0, 6);

  return (
    <>
      <Helmet><title>Performance Intelligence</title></Helmet>
      <PageHeader
        eyebrow="INTELLIGENCE / NETWORK"
        title="Performance intelligence"
        description="A decision layer for demand, service quality, and revenue signals."
        actions={
          <>
            <button className="button ghost" onClick={load} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="button ghost print-hide" onClick={handleExportPDF}>
              <FileText size={16} /> Export as PDF
            </button>
          </>
        }
      />

      <section className="metric-grid">
        <MetricCard
          label="Completion rate"
          value={`${pct(data.success, data.total)}%`}
          note={`${compact(data.success)} successful rides`}
          icon={Target}
          tone="lime"
        />
        <MetricCard
          label="Cancelled rides"
          value={compact(data.cancelled)}
          note={`${pct(data.cancelled, data.total)}% of demand`}
          icon={XCircle}
          tone="orange"
        />
        <MetricCard
          label="Top vehicle"
          value={data.topVehicle?.vehicleType || '—'}
          note={`${compact(data.topVehicle?.count || 0)} bookings`}
          icon={Bike}
          tone="blue"
        />
        <MetricCard
          label="Highest fare"
          value={money(data.highest?.bookingValue)}
          note={data.highest?.bookingId || 'No fare data'}
          icon={IndianRupee}
          tone="purple"
        />
      </section>

      <section className="analytics-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">DEMAND COMPOSITION</span>
              <h2>Bookings by vehicle</h2>
            </div>
            <Activity />
          </div>
          <div className="chart-wrap large">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trending}>
                <XAxis dataKey="_id" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: 10 }} itemStyle={{ color: 'var(--text)' }} />
                <Bar dataKey="count" fill="#b9e85f" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">SERVICE OUTCOMES</span>
              <h2>Booking resolution</h2>
            </div>
            <CheckCircle2 />
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={outcomes} dataKey="value" innerRadius={72} outerRadius={105} paddingAngle={3}>
                  {outcomes.map((x) => <Cell key={x.name} fill={x.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: 10 }} itemStyle={{ color: 'var(--text)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <b>{compact(data.total)}</b>
              <span>Total rides</span>
            </div>
          </div>
          <div className="legend">
            {outcomes.map((x) => (
              <div key={x.name}>
                <i style={{ background: x.color }} />
                <span>{x.name}</span>
                <b>{pct(x.value, data.total)}%</b>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="analytics-grid" style={{ marginTop: '25px' }}>
        {customerCancelData.length > 0 && (
          <article className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">CUSTOMER CANCELLATIONS</span>
                <h2>Why customers cancel</h2>
              </div>
              <UserX />
            </div>
            <div className="chart-wrap large">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerCancelData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="_id" width={140} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: 10 }} itemStyle={{ color: 'var(--text)' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={35}>
                    {customerCancelData.map((_, i) => (
                      <Cell key={i} fill={CANCEL_COLORS[i % CANCEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        )}

        {driverCancelData.length > 0 && (
          <article className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">DRIVER CANCELLATIONS</span>
                <h2>Why drivers cancel</h2>
              </div>
              <AlertTriangle />
            </div>
            <div className="chart-wrap large">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverCancelData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="_id" width={140} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: 10 }} itemStyle={{ color: 'var(--text)' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={35}>
                    {driverCancelData.map((_, i) => (
                      <Cell key={i} fill={CANCEL_COLORS[(i + 3) % CANCEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        )}
      </section>

      {incompleteData.length > 0 && (
        <section className="analytics-grid" style={{ marginTop: '25px' }}>
          <article className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-head">
              <div>
                <span className="eyebrow">INCOMPLETE RIDES</span>
                <h2>Ride failure reasons</h2>
              </div>
              <AlertTriangle />
            </div>
            <div className="chart-wrap large">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incompleteData}>
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--panel-strong)', border: '1px solid var(--line)', borderRadius: 10 }} itemStyle={{ color: 'var(--text)' }} />
                  <Bar dataKey="count" fill="#ff8a65" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    {incompleteData.map((_, i) => (
                      <Cell key={i} fill={CANCEL_COLORS[(i + 5) % CANCEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>
      )}

      <section className="insight-strip">
        <CreditCard />
        <div>
          <span className="eyebrow">PAYMENT SIGNAL</span>
          <h3>{data.payment?.paymentMethod || 'Payment data pending'} leads customer preference</h3>
        </div>
        <p>Use this signal to prioritize checkout reliability and payment incentives.</p>
      </section>
    </>
  );
}
