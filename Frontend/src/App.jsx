import { lazy, Suspense } from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { validateAuth } from './store/authSlice';
import { Helmet } from 'react-helmet-async';
import Shell from './components/Shell';
import { FullLoader } from './components/UI';

const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Bookings = lazy(() => import('./pages/Bookings'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const CreateBooking = lazy(() => import('./pages/CreateBooking'));
const Customers = lazy(() => import('./pages/Customers'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const CompareBookings = lazy(() => import('./pages/CompareBookings'));
const Users = lazy(() => import('./pages/Users'));

function Protected({ children }) {
  const { user, ready } = useSelector((state) => state.auth);
  const location = useLocation();
  if (!ready) return <FullLoader label="Validating secure session" />;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function AdminOnly({ children }) {
  const { user } = useSelector((state) => state.auth);
  return user?.role === 'admin' ? children : <Navigate to="/bookings" replace />;
}

export default function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(validateAuth());
  }, [dispatch]);

  return (
    <>
      <Helmet titleTemplate="%s | RideOps Fleet Console" defaultTitle="RideOps Fleet Console">
        <meta name="description" content="Vehicle Bookings and Fleet Management Console" />
        <meta property="og:title" content="RideOps Fleet Console" />
        <meta property="og:description" content="Manage your vehicle fleet bookings seamlessly." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Suspense fallback={<FullLoader label="Loading workspace" />}>
        <Routes>
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/" element={<Protected><Shell /></Protected>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/new" element={<AdminOnly><CreateBooking /></AdminOnly>} />
          <Route path="bookings/:bookingId" element={<BookingDetail />} />
          <Route path="bookings/:bookingId/edit" element={<AdminOnly><CreateBooking mode="edit" /></AdminOnly>} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="compare" element={<CompareBookings />} />
          <Route path="users" element={<AdminOnly><Users /></AdminOnly>} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<section className="empty-page"><b>404</b><h1>That route left the service area.</h1><a href="/dashboard" className="button primary">Return to command center</a></section>} />
        </Route>
      </Routes>
    </Suspense>
    </>
  );
}
