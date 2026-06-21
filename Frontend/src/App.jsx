import { Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<div>Auth Screen (Login)</div>} />
      <Route path="/register" element={<div>Auth Screen (Register)</div>} />
      <Route path="/" element={<div>Shell Layout</div>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<div>Dashboard</div>} />
        <Route path="bookings" element={<div>Bookings List</div>} />
        <Route path="bookings/new" element={<div>Create Booking</div>} />
        <Route path="bookings/:bookingId" element={<div>Booking Details</div>} />
        <Route path="bookings/:bookingId/edit" element={<div>Edit Booking</div>} />
        <Route path="customers" element={<div>Customers</div>} />
        <Route path="analytics" element={<div>Analytics</div>} />
        <Route path="compare" element={<div>Compare</div>} />
        <Route path="users" element={<div>Users</div>} />
        <Route path="settings" element={<div>Settings</div>} />
        <Route path="*" element={<div>Not Found</div>} />
      </Route>
    </Routes>
  );
}
