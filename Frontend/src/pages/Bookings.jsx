import React, { useState } from 'react';
export default function Bookings() {
  const [keyword, setKeyword] = useState('');
  return (
    <div className="bookings-container">
      <h2>Booking Control Dashboard</h2>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search..." />
    </div>
  );
}
