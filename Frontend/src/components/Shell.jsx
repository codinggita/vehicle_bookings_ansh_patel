import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
export default function Shell() {
  const user = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(false);
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

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
          <button onClick={() => setDark(!dark)}>Theme</button>
          <button onClick={() => setProfile(!profile)}>Profile</button>
        </header>
        <div className="page"><Outlet /></div>
      </main>
    </div>
  );
}
