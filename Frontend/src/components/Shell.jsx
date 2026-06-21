import React from 'react';
import { NavLink } from 'react-router-dom';
export default function Shell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><b>RIDEOPS</b></div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/bookings">Bookings</NavLink>
        </nav>
      </aside>
      <main className="workspace">
        <header className="topbar">Header</header>
      </main>
    </div>
  );
}
