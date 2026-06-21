import React, { useState } from 'react';
export default function Bookings() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  return (
    <div className="bookings-container">
      <h2>Booking Control Dashboard</h2>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search..." />
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
