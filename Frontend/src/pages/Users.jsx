import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, UserRound, UsersRound, Edit, Trash2, Mail, Search, X, Check, Lock, KeyRound } from 'lucide-react';
import api from '../lib/api';
import { Empty, ErrorPanel, PageHeader, SkeletonRows } from '../components/UI';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

export default function Users() {
  const currentUser = useSelector((state) => state.auth.user);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data || response);
    } catch (err) {
      setError(err.message || 'Failed to load operators');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setName('');
    setEmail('');
    setRole('user');
    setPassword('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword('');
    setFormError('');
    setShowModal(true);
  };

  const openResetModal = (user) => {
    setResetTarget(user);
    setResetPassword('');
    setResetError('');
    setShowResetModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (resetPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    setResetSubmitting(true);
    try {
      await api.put(/auth/users/\, { password: resetPassword });
      setSuccess(Password for \ has been reset.);
      setShowResetModal(false);
    } catch (err) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (user._id === currentUser._id) {
      alert('You cannot delete your own account from here. Go to Settings to close your account.');
      return;
    }
    if (!window.confirm(Permanently remove operator \? This will revoke their workspace access.)) return;
    
    setError('');
    setSuccess('');
    try {
      await api.delete(/auth/users/\);
      setSuccess(Operator \ removed successfully.);
      load();
    } catch (err) {
      setError(err.message || 'Failed to delete operator');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = { name, email, role };
      if (modalMode === 'create') {
        if (!password) {
          throw new Error('Password is required for new operators');
        }
        payload.password = password;
        await api.post('/auth/users', payload);
        setSuccess(Operator \ created successfully.);
      } else {
        if (password) {
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          payload.password = password;
        }
        await api.put(/auth/users/\, payload);
        setSuccess(Operator \ updated successfully.);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter((u) => 
    u.name?.toLowerCase().includes(query.toLowerCase()) || 
    u.email?.toLowerCase().includes(query.toLowerCase()) ||
    u.role?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Operator Directory</title></Helmet>
      <PageHeader 
        eyebrow="ADMIN / ACCESS CONTROL" 
        title="Operator directory" 
        description="Provision operator roles, manage security levels, and audit workspace credentials."
        actions={
          <button className="button primary" onClick={openCreateModal}>
            <UserPlus size={16} /> New operator
          </button>
        }
      />

      {error && <ErrorPanel message={error} retry={load} />}
      {success && (
        <div className="form-alert success" style={{ marginBottom: '20px' }}>
          <Check /> {success}
        </div>
      )}

      <section className="directory-tools">
        <label className="search-field">
          <Search />
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search name, email, or role..." 
          />
        </label>
        <div>
          <UsersRound />
          <span>Active operators</span>
          <b>{users.length}</b>
        </div>
      </section>

      {loading ? (
        <SkeletonRows count={6} />
      ) : filtered.length ? (
        <section className="panel data-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} style={{ cursor: 'default' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--panel-strong)', color: 'var(--primary)' }}>
                          <UserRound size={16} />
                        </div>
                        <div>
                          <b>{u.name}</b> {u._id === currentUser._id && <small className="live-pill" style={{ display: 'inline', padding: '1px 5px', fontSize: '10px', marginLeft: '5px' }}>You</small>}
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={status-pill \}>
                        {u.role === 'admin' ? 'Administrator' : 'Viewer'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button className="button ghost small icon-button" onClick={() => openEditModal(u)} title="Edit Operator">
                          <Edit size={14} />
                        </button>
                        <button className="button ghost small icon-button" onClick={() => openResetModal(u)} title="Reset Password" style={{ color: 'var(--warning, #f59e0b)' }}>
                          <KeyRound size={14} />
                        </button>
                        {u._id !== currentUser._id && (
                          <button className="button danger small icon-button" onClick={() => handleDelete(u)} title="Remove Access">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <Empty title="No operators found" />
      )}

      {showModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 12, 9, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel modal-container" style={{ width: '100%', maxWidth: '500px', padding: '30px', position: 'relative' }}>
            <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <span className="form-step">CREDENTIALS / 01</span>
            <h2>{modalMode === 'create' ? 'Register New Operator' : 'Edit Operator Details'}</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
              {modalMode === 'create' ? 'Provision access key and identity for new fleet dispatcher.' : 'Modify role and email access for verified dispatch agent.'}
            </p>

            {formError && <div className="form-alert error" style={{ marginBottom: '15px' }}>{formError}</div>}

            <form onSubmit={handleSubmit} className="booking-form" style={{ gap: '15px' }}>
              <label className="field">
                <span>Operator full name</span>
                <div className="input-icon">
                  <UserRound />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Jane Doe" 
                    required 
                  />
                </div>
              </label>

              <label className="field">
                <span>Operator email address</span>
                <div className="input-icon">
                  <Mail />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="jane@company.com" 
                    required 
                  />
                </div>
              </label>

              <label className="field">
                <span>Access Role Level</span>
                <div className="input-icon">
                  <ShieldCheck />
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%' }}>
                    <option value="user">Operations Viewer (Read-only)</option>
                    <option value="admin">Operations Administrator (Full Write Access)</option>
                  </select>
                </div>
              </label>

              <label className="field">
                <span>Password {modalMode === 'edit' && '(optional)'}</span>
                <div className="input-icon">
                  <Lock />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={modalMode === 'create' ? 'Minimum 6 characters' : 'Leave blank to keep same'} 
                    required={modalMode === 'create'} 
                  />
                </div>
              </label>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="button ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : modalMode === 'create' ? 'Register Operator' : 'Apply Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 12, 9, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel modal-container" style={{ width: '100%', maxWidth: '420px', padding: '30px', position: 'relative' }}>
            <button className="modal-close" onClick={() => setShowResetModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <span className="form-step">ADMIN / SECURITY</span>
            <h2>Reset Password</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
              Set a new temporary password for <strong>{resetTarget?.name}</strong>. Ask them to change it immediately after logging in.
            </p>
            {resetError && <div className="form-alert error" style={{ marginBottom: '15px' }}>{resetError}</div>}
            <form onSubmit={handleResetPassword} className="booking-form" style={{ gap: '15px' }}>
              <label className="field">
                <span>New password for operator</span>
                <div className="input-icon">
                  <KeyRound />
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    autoFocus
                  />
                </div>
              </label>
              <div className="form-actions" style={{ marginTop: '10px' }}>
                <button type="button" className="button ghost" onClick={() => setShowResetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={resetSubmitting}>
                  {resetSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
