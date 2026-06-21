import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Car, IndianRupee, Clock3, CreditCard, MapPin, Navigation, Route, Star, Trash2, UserRound, Edit, RotateCcw, AlertTriangle } from 'lucide-react';
import api, { dateTime, money } from '../lib/api';
import { ErrorPanel, PageHeader, SkeletonRows, Status } from '../components/UI';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data || response);
    } catch (err) {
      setError(err.message);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleHardDelete = async () => {
    if (!window.confirm(`Warning: Permanently delete booking record ${bookingId}? This cannot be undone.`)) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      navigate('/bookings');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSoftDelete = async () => {
    if (!window.confirm(`Archive/Soft-delete booking record ${bookingId}? The booking will be hidden from standard lists but can be restored later.`)) return;
    try {
      await api.patch(`/bookings/${bookingId}/soft-delete`);
      setSuccess('Booking archived successfully.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestore = async () => {
    try {
      await api.patch(`/bookings/${bookingId}/restore`);
      setSuccess('Booking restored successfully.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <ErrorPanel message={error} retry={load} />;
  if (!booking) return <SkeletonRows count={8} />;

  const facts = [
    [Calendar, 'Booked', dateTime(booking.date)],
    [Clock3, 'Pickup time', booking.time],
    [Car, 'Vehicle', booking.vehicleType],
    [CreditCard, 'Payment', booking.paymentMethod || 'Not recorded'],
    [Route, 'Distance', `${booking.rideDistance || 0} km`],
    [Star, 'Driver rating', booking.driverRatings ? `${booking.driverRatings} / 5` : 'Not rated']
  ];

  return (
    <>
      <Helmet><title>{`Booking ${booking.bookingId}`}</title></Helmet>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Link to="/bookings" className="back-link" style={{ margin: 0 }}><ArrowLeft />Back to bookings</Link>
        <Link to={`/compare?b1=${booking.bookingId}`} className="text-link" style={{ fontSize: '13px' }}>Compare this ride</Link>
      </div>

      {success && (
        <div className="form-alert success" style={{ marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {booking.isDeleted && (
        <div className="form-alert error" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', background: 'rgba(255, 138, 101, 0.15)', color: 'var(--orange)', border: '1px solid var(--orange)' }}>
          <AlertTriangle size={18} />
          <span>This booking record is currently <b>Archived (Soft-Deleted)</b>.</span>
        </div>
      )}

      <PageHeader 
        eyebrow={`BOOKING / ${booking.bookingId}`} 
        title="Ride overview" 
        description="Complete operational record and service timeline." 
        actions={
          user?.role === 'admin' && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {booking.isDeleted ? (
                <>
                  <button className="button primary" onClick={handleRestore} style={{ background: 'var(--primary)', color: '#121d17' }}>
                    <RotateCcw size={16} /> Restore Booking
                  </button>
                  <button className="button danger" onClick={handleHardDelete}>
                    <Trash2 size={16} /> Delete Permanently
                  </button>
                </>
              ) : (
                <>
                  <Link to={`/bookings/${booking.bookingId}/edit`} className="button ghost">
                    <Edit size={16} /> Edit Booking
                  </Link>
                  <button className="button ghost" onClick={handleSoftDelete} style={{ border: '1px solid var(--orange)', color: 'var(--orange)' }}>
                    Archive
                  </button>
                  <button className="button danger" onClick={handleHardDelete}>
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              )}
            </div>
          )
        } 
      />

      <section className="detail-hero">
        <div>
          <Status value={booking.bookingStatus} />
          <h2>{booking.pickupLocation}<span>to</span>{booking.dropLocation}</h2>
          <p><UserRound />Customer {booking.customerId}</p>
        </div>
        <div>
          <small>BOOKING VALUE</small>
          <strong>{money(booking.bookingValue)}</strong>
          <span>{booking.paymentMethod || 'Payment pending'}</span>
        </div>
      </section>

      <section className="detail-grid">
        <article className="panel route-card">
          <div className="panel-head">
            <div>
              <span className="eyebrow">ROUTE PLAN</span>
              <h2>Journey details</h2>
            </div>
            <Navigation />
          </div>
          
          <div className="route-line">
            <i />
            <div>
              <small>PICKUP</small>
              <b>{booking.pickupLocation}</b>
              <span>{booking.time}</span>
            </div>
            <div>
              <small>DROP-OFF</small>
              <b>{booking.dropLocation}</b>
              <span>{booking.rideDistance || 0} km estimated route</span>
            </div>
          </div>
          
          <div className="route-summary">
            <MapPin />
            <span>Vehicle arrival time</span>
            <b>{booking.vTAT ?? '—'} min</b>
            <span>Customer arrival time</span>
            <b>{booking.cTAT ?? '—'} min</b>
          </div>
        </article>

        <article className="panel facts-card">
          <div className="panel-head">
            <div>
              <span className="eyebrow">SERVICE RECORD</span>
              <h2>Booking facts</h2>
            </div>
            <IndianRupee />
          </div>
          {facts.map(([Icon, label, value]) => (
            <div className="fact" key={label}>
              <span><Icon /></span>
              <div>
                <small>{label}</small>
                <b>{value}</b>
              </div>
            </div>
          ))}
          
          {booking.bookingStatus.includes('Canceled') && (
            <div className="fact" style={{ background: 'rgba(255, 138, 101, 0.1)', borderRadius: '8px', padding: '12px', marginTop: '15px' }}>
              <div>
                <small style={{ color: 'var(--orange)' }}>CANCELLATION CONTEXT</small>
                <b style={{ display: 'block', marginTop: '4px' }}>
                  {booking.bookingStatus === 'Canceled by Customer' 
                    ? `Reason: ${booking.canceledRidesByCustomer || 'Not detailed'}`
                    : `Reason: ${booking.canceledRidesByDriver || 'Not detailed'}`}
                </b>
              </div>
            </div>
          )}

          {booking.incompleteRides === 'Yes' && (
            <div className="fact" style={{ background: 'rgba(255, 138, 101, 0.1)', borderRadius: '8px', padding: '12px', marginTop: '15px' }}>
              <div>
                <small style={{ color: 'var(--orange)' }}>INCOMPLETE RIDE CONTEXT</small>
                <b style={{ display: 'block', marginTop: '4px' }}>
                  Reason: {booking.incompleteRidesReason || 'Not detailed'}
                </b>
              </div>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
