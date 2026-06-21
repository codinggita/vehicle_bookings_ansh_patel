import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
export default function Shell() {
  const user = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(false);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><b>RIDEOPS</b></div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <button onClick={() => setProfile(!profile)}>Profile</button>
        </header>
      </main>
    </div>
  );
}
