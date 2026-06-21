import React, { useState } from 'react';
export default function Bookings() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  return (
    <div className="bookings-container">
      <h2>Booking Control Dashboard</h2>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search..." />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        <option value="Success">Success</option>
      </select>
    </div>
  );
}
