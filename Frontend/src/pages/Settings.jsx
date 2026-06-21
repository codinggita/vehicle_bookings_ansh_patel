import { useState } from 'react';
import { Bell, Check, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck, Trash2, UserRound, Edit, X } from 'lucide-react';
import api from '../lib/api';
import { PageHeader } from '../components/UI';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Helmet } from 'react-helmet-async';

export default function Settings() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({ incidents: true, digest: true, product: false });
  const [editing, setEditing] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const toggle = (k) => setNotifications(p => ({ ...p, [k]: !p[k] }));
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const remove = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;
    try {
      await api.delete('/auth/account');
      dispatch(logout());
    } catch (err) {
      setError(err.message || 'Failed to delete account');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const payload = { name, email };
      const response = await api.put('/auth/profile', payload);
      const updatedUser = response.data || response;
      localStorage.setItem('rideops_user', JSON.stringify(updatedUser));
      setSuccessMsg('Profile updated! Reloading console...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPwSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <>
      <Helmet><title>Account Settings</title></Helmet>
      <PageHeader 
        eyebrow="WORKSPACE / PREFERENCES" 
        title="Account settings" 
        description="Manage your operator identity, notifications, and account security." 
      />
      
      {error && <div className="form-alert error" style={{ marginBottom: '20px' }}>{error}</div>}
      {successMsg && <div className="form-alert success" style={{ marginBottom: '20px' }}><Check />{successMsg}</div>}
      
      <section className="settings-grid">
        <article className="panel settings-card">
          <div className="settings-title">
            <span><UserRound /></span>
            <div>
              <h2>Operator profile</h2>
              <p>Your verified workspace identity.</p>
            </div>
            {!editing ? (
              <button className="button ghost small" onClick={() => setEditing(true)} style={{ marginLeft: 'auto' }}>
                <Edit size={14} /> Edit
              </button>
            ) : (
              <button className="button ghost small" onClick={() => { setEditing(false); setError(''); }} style={{ marginLeft: 'auto' }}>
                <X size={14} /> Cancel
              </button>
            )}
          </div>
          
          <div className="profile-summary">
            <div>{initials}</div>
            <span>
              <b>{displayName}</b>
              <small>{user?.email}</small>
            </span>
            <em>{user?.role === 'admin' ? 'Admin' : 'Viewer'}</em>
          </div>

          {!editing ? (
            <div className="read-only-fields">
              <label>
                <span>Full name</span>
                <div><UserRound />{user?.name || 'Not provided'}</div>
              </label>
              <label>
                <span>Email address</span>
                <div><Mail />{user?.email}</div>
              </label>
              <label>
                <span>Access level</span>
                <div><ShieldCheck />{user?.role === 'admin' ? 'Operations administrator' : 'Operations viewer'}</div>
              </label>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="booking-form" style={{ marginTop: '20px', gap: '15px' }}>
              <label className="field">
                <span>Full name</span>
                <div className="input-icon">
                  <UserRound />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </label>
              <label className="field">
                <span>Email address</span>
                <div className="input-icon">
                  <Mail />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </label>
              <button type="submit" className="button primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving changes...' : 'Save Profile Details'}
              </button>
            </form>
          )}
        </article>

        <article className="panel settings-card">
          <div className="settings-title">
            <span><Lock /></span>
            <div>
              <h2>Change password</h2>
              <p>Verify your current password to set a new one.</p>
            </div>
          </div>
          {pwError && <div className="form-alert error" style={{ marginBottom: '15px' }}>{pwError}</div>}
          {pwSuccess && <div className="form-alert success" style={{ marginBottom: '15px' }}><Check />{pwSuccess}</div>}
          <form onSubmit={handleChangePassword} className="booking-form" style={{ gap: '15px' }}>
            <label className="field">
              <span>Current password</span>
              <div className="input-icon">
                <Lock />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Your existing password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <label className="field">
              <span>New password</span>
              <div className="input-icon">
                <KeyRound />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <div className="input-icon">
                <KeyRound />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </label>
            <button type="submit" className="button primary" style={{ width: '100%' }} disabled={pwSaving}>
              {pwSaving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </article>

        <article className="panel settings-card">
          <div className="settings-title">
            <span><Bell /></span>
            <div>
              <h2>Notifications</h2>
              <p>Choose the signals that reach you.</p>
            </div>
          </div>
          <div className="toggle-list">
            {[
              ['incidents', 'Service incidents', 'Critical booking and API disruptions'],
              ['digest', 'Weekly performance digest', 'Network trends every Monday'],
              ['product', 'Product updates', 'New console features and improvements']
            ].map(([key, title, text]) => (
              <button key={key} onClick={() => toggle(key)}>
                <div>
                  <b>{title}</b>
                  <small>{text}</small>
                </div>
                <i className={notifications[key] ? 'on' : ''}><span /></i>
              </button>
            ))}
          </div>
          <button className="button primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
            {saved ? <><Check />Preferences saved</> : 'Save preferences'}
          </button>
        </article>

        <article className="panel settings-card security">
          <div className="settings-title">
            <span><Lock /></span>
            <div>
              <h2>Security</h2>
              <p>Session and account controls.</p>
            </div>
          </div>
          <div className="security-row">
            <KeyRound />
            <div>
              <b>Password authentication</b>
              <small>Protected by encrypted password and JWT session</small>
            </div>
            <span>Active</span>
          </div>
          <button className="danger-zone" onClick={remove}>
            <Trash2 />
            <div>
              <b>Delete account</b>
              <small>Permanently remove your operator account</small>
            </div>
          </button>
        </article>
      </section>
    </>
  );
}
