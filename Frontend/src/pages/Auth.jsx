import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Command, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import api from '../lib/api';
import { ButtonLoader } from '../components/UI';
import { useSelector, useDispatch } from 'react-redux';
import { login, register } from '../store/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet-async';

const copy = {
  login: ['Welcome back', 'Enter the operations console.'],
  register: ['Create your workspace', 'Start managing fleet operations.'],
};

const getValidationSchema = (mode) => {
  const base = { email: Yup.string().email('Invalid email format').required('Required') };
  if (mode === 'login') return Yup.object({ ...base, password: Yup.string().required('Required') });
  if (mode === 'register') return Yup.object({ ...base, name: Yup.string().required('Required'), password: Yup.string().min(8, 'Minimum 8 characters').required('Required') });
  return Yup.object();
};

export default function Auth({ mode }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => { if (user) navigate(location.state?.from?.pathname || '/dashboard', { replace: true }); }, [user, navigate, location]);

  const submit = async (values, { setSubmitting }) => {
    setBusy(true); setServerError('');
    try {
      if (mode === 'login') await dispatch(login({ email: values.email, password: values.password })).unwrap();
      if (mode === 'register') await dispatch(register({ name: values.name, email: values.email, password: values.password })).unwrap();
    } catch (err) { setServerError(err); } finally { setBusy(false); setSubmitting(false); }
  };

  const passwordField = (name = 'password', label = 'Password') => <label className="field"><span>{label}</span><div className="input-icon"><LockKeyhole /><Field name={name} type={show ? 'text' : 'password'} placeholder="Minimum 8 characters" /><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</button></div><ErrorMessage name={name} component="div" className="form-alert error inline" /></label>;

  const initialValues = { name: '', email: '', password: '' };
  const title = mode === 'login' ? 'Sign In' : 'Create Account';

  return <main className="auth-page"><Helmet><title>{title}</title></Helmet><section className="auth-story"><div className="auth-brand"><Command /><b>RIDEOPS</b></div><div className="story-copy"><span className="eyebrow light">BUILT FOR LIVE OPERATIONS</span><h1>Every ride.<br />One clear signal.</h1><p>Monitor demand, resolve exceptions, and keep your fleet moving from a single real-time workspace.</p><div className="proof-grid"><div><strong>99.9%</strong><span>Platform uptime</span></div><div><strong>18K+</strong><span>Trips analyzed</span></div></div></div><div className="auth-quote"><ShieldCheck /><p>Role-based access and encrypted sessions keep operational data protected.</p></div></section><section className="auth-panel"><div className="auth-form-wrap"><div className="mobile-brand"><Command /><b>RIDEOPS</b></div><span className="form-step">SECURE ACCESS / 01</span><h2>{copy[mode][0]}</h2><p>{copy[mode][1]}</p>{serverError && <div className="form-alert error">{serverError}</div>}<Formik initialValues={initialValues} validationSchema={getValidationSchema(mode)} onSubmit={submit}>{({ isSubmitting }) => (<Form>
    {mode === 'register' && <label className="field"><span>Full name</span><div className="input-icon"><UserRound /><Field name="name" placeholder="Operations lead" /></div><ErrorMessage name="name" component="div" className="form-alert error inline" /></label>}
    {<label className="field"><span>Work email</span><div className="input-icon"><Mail /><Field type="email" name="email" placeholder="you@company.com" /></div><ErrorMessage name="email" component="div" className="form-alert error inline" /></label>}
    {passwordField()}
    {mode === 'login' && <div className="form-meta"><label><input type="checkbox" />Keep me signed in</label><span style={{ fontSize: '10px', color: 'var(--muted)' }}>Contact your admin to reset password</span></div>}
    <button type="submit" className="button primary wide" disabled={busy || isSubmitting}>{busy || isSubmitting ? <ButtonLoader /> : <>{mode === 'login' ? 'Enter command center' : 'Create account'}<ArrowRight /></>}</button>
  </Form>)}</Formik><div className="auth-switch">{mode === 'login' ? <>New to RideOps? <Link to="/register">Create account</Link></> : <>Already have access? <Link to="/login">Sign in</Link></>}</div></div></section></main>;
}
