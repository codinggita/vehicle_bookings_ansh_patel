import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, Bell, CalendarDays, ChevronDown, Command,
  LayoutDashboard, LogOut, Menu, Moon, RefreshCw, Search, Settings,
  Sun, Users, X, Scale, UserCog, AlertTriangle, CheckCircle2, Info, Zap,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNotifications } from '../hooks/useNotifications';

const links = [
  { to: '/dashboard',  label: 'Command center', icon: LayoutDashboard },
  { to: '/bookings',   label: 'Bookings',        icon: CalendarDays },
  { to: '/customers',  label: 'Customers',        icon: Users },
  { to: '/analytics',  label: 'Intelligence',     icon: BarChart3 },
  { to: '/compare',    label: 'Compare',          icon: Scale },
  { to: '/users',      label: 'Operators',        icon: UserCog, adminOnly: true },
];

const TYPE_ICON = {
  danger:  <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />,
  warn:    <Zap           size={14} style={{ color: '#f59e0b' }} />,
  success: <CheckCircle2  size={14} style={{ color: 'var(--accent)' }} />,
  info:    <Info          size={14} style={{ color: 'var(--primary)' }} />,
};

const TYPE_DOT = {
  danger:  'var(--danger)',
  warn:    '#f59e0b',
  success: 'var(--accent)',
  info:    'var(--primary)',
};

export default function Shell() {
  const user         = useSelector((state) => state.auth.user);
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const displayName  = user?.name || user?.email?.split('@')[0] || 'User';
  const initials     = displayName.slice(0, 2).toUpperCase();

  const [mobile,      setMobile]      = useState(false);
  const [profile,     setProfile]     = useState(false);
  const [showNotif,   setShowNotif]   = useState(false);
  const [query,       setQuery]       = useState('');
  const [dark,        setDark]        = useState(() => localStorage.getItem('rideops_theme') !== 'light');

  const notifRef = useRef(null);

  const { notifications, loading, hasUnread, markAllRead, markOneRead, refresh } = useNotifications();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('rideops_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!showNotif) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotif]);

  const search = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(/bookings?keyword=);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="app-shell">
      <aside className={mobile ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <span><Command size={19} /></span>
          <div><b>RIDEOPS</b><small>Fleet intelligence</small></div>
          <button className="mobile-close" onClick={() => setMobile(false)}><X /></button>
        </div>
        <div className="nav-label">Operations</div>
        <nav>
          {links
            .filter(l => !l.adminOnly || user?.role === 'admin')
            .map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMobile(false)}>
                <Icon size={18} /><span>{label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="nav-label">Workspace</div>
        <nav>
          <NavLink to="/settings" onClick={() => setMobile(false)}>
            <Settings size={18} /><span>Settings</span>
          </NavLink>
        </nav>
        <div className="system-card">
          <div><Activity size={16} /><span>System status</span></div>
          <b><i />All services operational</b>
          <small>API synchronization active</small>
        </div>
        <div className="sidebar-foot">RID / OPS <span>v1.0</span></div>
      </aside>

      {mobile && <button className="scrim" onClick={() => setMobile(false)} aria-label="Close navigation" />}

      <main className="workspace">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobile(true)}><Menu /></button>

          <form className="global-search" onSubmit={search}>
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search booking, customer, location..."
            />
            <kbd>ENTER</kbd>
          </form>

          <div className="top-actions">
            <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">
              {dark ? <Sun /> : <Moon />}
            </button>

            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="icon-button notification"
                onClick={() => { setShowNotif(v => !v); setProfile(false); }}
                aria-label="Notifications"
              >
                <Bell />
                {hasUnread && <i />}
              </button>

              {showNotif && (
                <div
                  className="profile-menu"
                  style={{ width: '340px', padding: '0', right: '-10px', overflow: 'hidden' }}
                >
                  <div style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <b style={{ color: 'var(--text)', fontSize: '13px' }}>Notifications</b>
                      {unreadCount > 0 && (
                        <span style={{
                          background: 'var(--danger)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          lineHeight: '16px',
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={refresh}
                        title="Refresh notifications"
                        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <RefreshCw size={13} />
                      </button>
                      {unreadCount > 0 && (
                        <span
                          style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                          onClick={markAllRead}
                        >
                          Mark all as read
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {loading ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                        Fetching live fleet data...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markOneRead(n.id)}
                          style={{
                            padding: '13px 16px',
                            borderBottom: '1px solid var(--line)',
                            background: n.read ? 'transparent' : 'rgba(185,232,95,.04)',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--panel-strong)'}
                          onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(185,232,95,.04)'}
                        >
                          <span style={{ marginTop: '1px', flexShrink: 0 }}>
                            {TYPE_ICON[n.type] ?? TYPE_ICON.info}
                          </span>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b style={{ color: 'var(--text)', fontSize: '12px', display: 'block' }}>{n.title}</b>
                            <p style={{ color: 'var(--muted)', margin: '3px 0 5px', fontSize: '11px', lineHeight: '1.5' }}>{n.desc}</p>
                            <small style={{ color: 'var(--faint)', fontSize: '10px' }}>{n.time}</small>
                          </div>

                          <div style={{
                            flexShrink: 0,
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: n.read ? 'transparent' : (TYPE_DOT[n.type] ?? 'var(--accent)'),
                            marginTop: '5px',
                            transition: 'background 0.2s',
                          }} />
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{
                    padding: '10px 16px',
                    textAlign: 'center',
                    borderTop: '1px solid var(--line)',
                    display: 'flex',
                    justifyContent: 'center',
                  }}>
                    <button
                      onClick={() => setShowNotif(false)}
                      style={{ background: 'none', border: '0', color: 'var(--muted)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-wrap">
              <button
                className="profile-button"
                onClick={() => { setProfile(!profile); setShowNotif(false); }}
              >
                <span>{initials}</span>
                <div><b>{displayName}</b><small>{user?.role === 'admin' ? 'Operations admin' : 'Operations viewer'}</small></div>
                <ChevronDown size={15} />
              </button>
              {profile && (
                <div className="profile-menu">
                  <button onClick={() => navigate('/settings')}><Settings />Account settings</button>
                  <button onClick={() => dispatch(logout())}><LogOut />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page"><Outlet /></div>
      </main>
    </div>
  );
}
