import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { ButtonLoader, PageHeader, SkeletonRows } from '../components/UI';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet-async';

const validationSchema = Yup.object({
  bookingId: Yup.string().required('Booking ID is required'),
  customerId: Yup.string().required('Customer ID is required'),
  date: Yup.string().required('Date is required'),
  time: Yup.string().required('Time is required'),
  pickupLocation: Yup.string().required('Pickup location is required'),
  dropLocation: Yup.string().required('Drop location is required'),
  vehicleType: Yup.string().required('Vehicle type is required'),
  bookingStatus: Yup.string().required('Status is required'),
  bookingValue: Yup.number().min(0, 'Must be 0 or more').required('Booking value is required'),
  rideDistance: Yup.number().min(0, 'Must be 0 or more').nullable(),
  paymentMethod: Yup.string().required('Payment method is required'),
});

const freshValues = {
  bookingId: `CNR${Date.now().toString().slice(-10)}`,
  customerId: '',
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  bookingStatus: 'Success',
  vehicleType: 'Mini',
  pickupLocation: '',
  dropLocation: '',
  bookingValue: '',
  paymentMethod: 'UPI',
  rideDistance: '',
  driverRatings: '',
  customerRating: '',
  vTAT: '',
  cTAT: '',
  incompleteRides: '',
  incompleteRidesReason: '',
  canceledRidesByCustomer: '',
  canceledRidesByDriver: '',
};

export default function CreateBooking({ mode }) {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const isEdit = mode === 'edit';

  const [serverError, setServerError] = useState('');
  const [initialValues, setInitialValues] = useState(isEdit ? null : freshValues);
  const [loadError, setLoadError] = useState('');

  const loadBooking = useCallback(async () => {
    if (!isEdit || !bookingId) return;
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      const b = response.data || response;
      setInitialValues({
        bookingId: b.bookingId || '',
        customerId: b.customerId || '',
        date: b.date ? new Date(b.date).toISOString().slice(0, 10) : '',
        time: b.time || '',
        bookingStatus: b.bookingStatus || 'Success',
        vehicleType: b.vehicleType || 'Mini',
        pickupLocation: b.pickupLocation || '',
        dropLocation: b.dropLocation || '',
        bookingValue: b.bookingValue ?? '',
        paymentMethod: b.paymentMethod || 'UPI',
        rideDistance: b.rideDistance ?? '',
        driverRatings: b.driverRatings ?? '',
        customerRating: b.customerRating ?? '',
        vTAT: b.vTAT ?? '',
        cTAT: b.cTAT ?? '',
        incompleteRides: b.incompleteRides || '',
        incompleteRidesReason: b.incompleteRidesReason || '',
        canceledRidesByCustomer: b.canceledRidesByCustomer || '',
        canceledRidesByDriver: b.canceledRidesByDriver || '',
      });
    } catch (err) {
      setLoadError(err.message || 'Failed to load booking details');
    }
  }, [isEdit, bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const submit = async (values, { setSubmitting }) => {
    setServerError('');
    try {
      const payload = {
        ...values,
        date: new Date(`${values.date}T${values.time}`).toISOString(),
        bookingValue: Number(values.bookingValue),
        rideDistance: Number(values.rideDistance || 0),
        driverRatings: values.driverRatings !== '' ? Number(values.driverRatings) : null,
        customerRating: values.customerRating !== '' ? Number(values.customerRating) : null,
        vTAT: values.vTAT !== '' ? Number(values.vTAT) : null,
        cTAT: values.cTAT !== '' ? Number(values.cTAT) : null,
        incompleteRides: values.incompleteRides || null,
        incompleteRidesReason: values.incompleteRidesReason || null,
        canceledRidesByCustomer: values.canceledRidesByCustomer || null,
        canceledRidesByDriver: values.canceledRidesByDriver || null,
      };

      if (isEdit) {
        await api.put(`/bookings/${bookingId}`, payload);
      } else {
        await api.post('/bookings', payload);
      }
      navigate(`/bookings/${values.bookingId}`);
    } catch (err) {
      setServerError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <>
        <Link to="/bookings" className="back-link"><ArrowLeft />Back to bookings</Link>
        <div className="form-alert error" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {loadError}
        </div>
      </>
    );
  }

  if (isEdit && !initialValues) {
    return <SkeletonRows count={8} />;
  }

  return (
    <>
      <Helmet><title>{isEdit ? `Edit ${bookingId}` : 'Create Booking'}</title></Helmet>
      <Link to={isEdit ? `/bookings/${bookingId}` : '/bookings'} className="back-link">
        <ArrowLeft />{isEdit ? 'Back to booking' : 'Back to bookings'}
      </Link>
      <PageHeader
        eyebrow={isEdit ? `ADMIN / EDIT RECORD / ${bookingId}` : 'ADMIN / NEW RECORD'}
        title={isEdit ? 'Edit booking' : 'Create booking'}
        description={isEdit ? 'Update ride parameters for this operational record.' : 'Add a validated ride record to the live operations database.'}
      />

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={submit} enableReinitialize>
        {({ isSubmitting, values }) => (
          <Form className="booking-form">
            {serverError && <div className="form-alert error">{serverError}</div>}

            <section className="panel form-section">
              <div className="section-number">01</div>
              <div className="section-title">
                <CalendarPlus />
                <div>
                  <h2>Booking identity</h2>
                  <p>Core references and service time.</p>
                </div>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Booking ID</span>
                  <Field name="bookingId" disabled={isEdit} />
                  <ErrorMessage name="bookingId" component="div" className="form-alert error inline" />
                </label>
                <label className="field">
                  <span>Customer ID</span>
                  <Field name="customerId" placeholder="CID713523" />
                  <ErrorMessage name="customerId" component="div" className="form-alert error inline" />
                </label>
                <label className="field">
                  <span>Date</span>
                  <Field type="date" name="date" />
                  <ErrorMessage name="date" component="div" className="form-alert error inline" />
                </label>
                <label className="field">
                  <span>Time</span>
                  <Field type="time" name="time" />
                  <ErrorMessage name="time" component="div" className="form-alert error inline" />
                </label>
              </div>
            </section>

            <section className="panel form-section">
              <div className="section-number">02</div>
              <div className="section-title">
                <CheckCircle2 />
                <div>
                  <h2>Service plan</h2>
                  <p>Route, vehicle, value, and payment details.</p>
                </div>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Pickup location</span>
                  <Field name="pickupLocation" />
                  <ErrorMessage name="pickupLocation" component="div" className="form-alert error inline" />
                </label>
                <label className="field">
                  <span>Drop location</span>
                  <Field name="dropLocation" />
                  <ErrorMessage name="dropLocation" component="div" className="form-alert error inline" />
                </label>
                <label className="field">
                  <span>Vehicle</span>
                  <Field as="select" name="vehicleType">
                    {['Bike', 'eBike', 'Auto', 'Mini', 'Prime Sedan', 'Prime Plus', 'Prime SUV'].map(x => <option key={x}>{x}</option>)}
                  </Field>
                </label>
                <label className="field">
                  <span>Status</span>
                  <Field as="select" name="bookingStatus">
                    {['Success', 'Canceled by Driver', 'Canceled by Customer', 'Driver Not Found'].map(x => <option key={x}>{x}</option>)}
                  </Field>
                </label>
                <label className="field">
                  <span>Booking value (INR)</span>
                  <Field type="number" min="0" name="bookingValue" />
                  <ErrorMessage name="bookingValue" component="div" className="form-alert error inline" />
                </label>
                <label className="field">
                  <span>Ride distance (km)</span>
                  <Field type="number" min="0" step=".1" name="rideDistance" />
                  <ErrorMessage name="rideDistance" component="div" className="form-alert error inline" />
                </label>
                <label className="field">
                  <span>Payment method</span>
                  <Field as="select" name="paymentMethod">
                    {['Cash', 'UPI', 'Credit Card', 'Debit Card'].map(x => <option key={x}>{x}</option>)}
                  </Field>
                </label>
              </div>
            </section>

            <section className="panel form-section">
              <div className="section-number">03</div>
              <div className="section-title">
                <AlertCircle />
                <div>
                  <h2>Operational context</h2>
                  <p>Ratings, turnaround times, and cancellation/incomplete details.</p>
                </div>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Driver Rating (0-5)</span>
                  <Field type="number" min="0" max="5" step="0.1" name="driverRatings" placeholder="e.g. 4.5" />
                </label>
                <label className="field">
                  <span>Customer Rating (0-5)</span>
                  <Field type="number" min="0" max="5" step="0.1" name="customerRating" placeholder="e.g. 4.2" />
                </label>
                <label className="field">
                  <span>Vehicle TAT (minutes)</span>
                  <Field type="number" min="0" name="vTAT" placeholder="Vehicle turnaround time" />
                </label>
                <label className="field">
                  <span>Customer TAT (minutes)</span>
                  <Field type="number" min="0" name="cTAT" placeholder="Customer turnaround time" />
                </label>
                <label className="field">
                  <span>Incomplete ride?</span>
                  <Field as="select" name="incompleteRides">
                    <option value="">None</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Field>
                </label>
                {values.incompleteRides === 'Yes' && (
                  <label className="field">
                    <span>Incomplete Ride Reason</span>
                    <Field name="incompleteRidesReason" placeholder="Describe what happened" />
                  </label>
                )}
                {(values.bookingStatus === 'Canceled by Customer') && (
                  <label className="field" style={{ gridColumn: '1 / -1' }}>
                    <span>Customer Cancellation Reason</span>
                    <Field name="canceledRidesByCustomer" placeholder="Why did the customer cancel?" />
                  </label>
                )}
                {(values.bookingStatus === 'Canceled by Driver') && (
                  <label className="field" style={{ gridColumn: '1 / -1' }}>
                    <span>Driver Cancellation Reason</span>
                    <Field name="canceledRidesByDriver" placeholder="Why did the driver cancel?" />
                  </label>
                )}
              </div>
            </section>

            <div className="form-actions">
              <Link className="button ghost" to={isEdit ? `/bookings/${bookingId}` : '/bookings'}>Cancel</Link>
              <button type="submit" className="button primary" disabled={isSubmitting}>
                {isSubmitting ? <ButtonLoader /> : <>{isEdit ? 'Save changes' : 'Create booking'}<ArrowRight /></>}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
