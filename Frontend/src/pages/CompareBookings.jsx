import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Calendar, Car, IndianRupee, Clock, MapPin, Route, Star, AlertCircle, RefreshCw } from 'lucide-react';
import api, { dateTime, money } from '../lib/api';
import { PageHeader, SkeletonRows, Status } from '../components/UI';
import { Helmet } from 'react-helmet-async';

export default function CompareBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [b1, setB1] = useState(searchParams.get('b1') || '');
  const [b2, setB2] = useState(searchParams.get('b2') || '');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadComparison = useCallback(async (id1, id2) => {
    if (!id1 || !id2) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const response = await api.get('/bookings/compare', {
        params: { booking1: id1.trim(), booking2: id2.trim() }
      });
      const result = response.data || response;
      if (!result.booking1 || !result.booking2) {
        throw new Error('One or both booking records were not found. Make sure IDs start with CNR.');
      }
      setData(result);
    } catch (err) {
      setError(err.message || 'Comparison failed. Verify Booking IDs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlB1 = searchParams.get('b1');
    const urlB2 = searchParams.get('b2');
    if (urlB1 && urlB2) {
      loadComparison(urlB1, urlB2);
    }
  }, [searchParams, loadComparison]);

  const handleCompare = (e) => {
    e.preventDefault();
    if (!b1 || !b2) {
      setError('Please specify both Booking IDs to run comparison');
      return;
    }
    setSearchParams({ b1: b1.trim(), b2: b2.trim() });
  };

  const getHighlightClass = (val1, val2, type = 'high-better') => {
    const num1 = Number(val1 || 0);
    const num2 = Number(val2 || 0);
    if (num1 === num2) return '';
    if (type === 'high-better') {
      return num1 > num2 ? 'highlight-positive' : 'highlight-negative';
    } else {
      return num1 < num2 ? 'highlight-positive' : 'highlight-negative';
    }
  };

  const booking1 = data?.booking1;
  const booking2 = data?.booking2;

  return (
    <>
      <Helmet><title>Booking Comparison</title></Helmet>
      <PageHeader
        eyebrow="INTELLIGENCE / COMPARE"
        title="Ride comparative workspace"
        description="Inspect and crosscheck routes, operational metrics, and revenue signals of two separate bookings side-by-side."
      />

      <section className="panel search-panel" style={{ padding: '20px', marginBottom: '25px' }}>
        <form onSubmit={handleCompare} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
          <label className="field" style={{ flex: 1, minWidth: '200px' }}>
            <span>Booking ID A</span>
            <input 
              value={b1} 
              onChange={(e) => setB1(e.target.value)} 
              placeholder="e.g. CNR7153255142" 
              required
            />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', color: 'var(--muted)' }}>
            <ArrowLeftRight size={20} />
          </div>
          <label className="field" style={{ flex: 1, minWidth: '200px' }}>
            <span>Booking ID B</span>
            <input 
              value={b2} 
              onChange={(e) => setB2(e.target.value)} 
              placeholder="e.g. CNR7153255145" 
              required
            />
          </label>
          <button type="submit" className="button primary" disabled={loading} style={{ height: '42px' }}>
            {loading ? <RefreshCw className="spin" size={16} /> : 'Compare Bookings'}
          </button>
        </form>
      </section>

      {error && (
        <div className="form-alert error" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading && <SkeletonRows count={8} />}

      {data && booking1 && booking2 && (
        <div className="comparison-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          <article className="panel compare-card">
            <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '15px' }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--primary)' }}>BOOKING RECORD A</span>
                <h2>{booking1.bookingId}</h2>
              </div>
              <Status value={booking1.bookingStatus} />
            </div>

            <div className="compare-details" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} /> Date / Time</span>
                <b>{dateTime(booking1.date)} ({booking1.time})</b>
              </div>
              
              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={15} /> Vehicle Type</span>
                <b>{booking1.vehicleType}</b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} /> Pickup Location</span>
                <b style={{ maxWidth: '200px', textAlign: 'right' }}>{booking1.pickupLocation}</b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} /> Drop Location</span>
                <b style={{ maxWidth: '200px', textAlign: 'right' }}>{booking1.dropLocation}</b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Route size={15} /> Distance</span>
                <b className={getHighlightClass(booking1.rideDistance, booking2.rideDistance)}>
                  {booking1.rideDistance || 0} km
                </b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={15} /> Booking Value</span>
                <b className={getHighlightClass(booking1.bookingValue, booking2.bookingValue)}>
                  {money(booking1.bookingValue)}
                </b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={15} /> Turnaround (vTAT / cTAT)</span>
                <b>{booking1.vTAT ?? '—'}m / {booking1.cTAT ?? '—'}m</b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={15} /> Driver Rating</span>
                <b className={getHighlightClass(booking1.driverRatings, booking2.driverRatings)}>
                  {booking1.driverRatings ? `${booking1.driverRatings} / 5` : 'Not Rated'}
                </b>
              </div>

              {booking1.bookingStatus.includes('Canceled') && (
                <div className="detail-item" style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', background: 'rgba(255, 138, 101, 0.1)', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--orange)', fontSize: '12px' }}>Cancellation Reason</span>
                  <b>
                    {booking1.canceledRidesByCustomer || booking1.canceledRidesByDriver || 'No cancellation details logged'}
                  </b>
                </div>
              )}
            </div>
          </article>

          <article className="panel compare-card">
            <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '15px' }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--primary)' }}>BOOKING RECORD B</span>
                <h2>{booking2.bookingId}</h2>
              </div>
              <Status value={booking2.bookingStatus} />
            </div>

            <div className="compare-details" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} /> Date / Time</span>
                <b>{dateTime(booking2.date)} ({booking2.time})</b>
              </div>
              
              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={15} /> Vehicle Type</span>
                <b>{booking2.vehicleType}</b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} /> Pickup Location</span>
                <b style={{ maxWidth: '200px', textAlign: 'right' }}>{booking2.pickupLocation}</b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} /> Drop Location</span>
                <b style={{ maxWidth: '200px', textAlign: 'right' }}>{booking2.dropLocation}</b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Route size={15} /> Distance</span>
                <b className={getHighlightClass(booking2.rideDistance, booking1.rideDistance)}>
                  {booking2.rideDistance || 0} km
                </b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={15} /> Booking Value</span>
                <b className={getHighlightClass(booking2.bookingValue, booking1.bookingValue)}>
                  {money(booking2.bookingValue)}
                </b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={15} /> Turnaround (vTAT / cTAT)</span>
                <b>{booking2.vTAT ?? '—'}m / {booking2.cTAT ?? '—'}m</b>
              </div>

              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={15} /> Driver Rating</span>
                <b className={getHighlightClass(booking2.driverRatings, booking1.driverRatings)}>
                  {booking2.driverRatings ? `${booking2.driverRatings} / 5` : 'Not Rated'}
                </b>
              </div>

              {booking2.bookingStatus.includes('Canceled') && (
                <div className="detail-item" style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', background: 'rgba(255, 138, 101, 0.1)', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--orange)', fontSize: '12px' }}>Cancellation Reason</span>
                  <b>
                    {booking2.canceledRidesByCustomer || booking2.canceledRidesByDriver || 'No cancellation details logged'}
                  </b>
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </>
  );
}
