import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { login, register } from '../store/authSlice';

export default function Auth({ mode }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  const submit = async (values, { setSubmitting }) => {
    try {
      if (mode === 'login') await dispatch(login({ email: values.email, password: values.password })).unwrap();
    } catch (err) { setServerError(err); } finally { setSubmitting(false); }
  };

  return (
    <main className="auth-page">
      <h2>{mode === 'login' ? 'Sign In' : 'Register'}</h2>
      <Formik initialValues={{ email: '', password: '' }} onSubmit={submit}>
        <Form>
          <Field name="email" type="email" />
          <Field name="password" type="password" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </main>
  );
}
