import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const validateAuth = createAsyncThunk(
  'auth/validate',
  async (_, { dispatch, rejectWithValue }) => {
    if (!localStorage.getItem('rideops_token')) return rejectWithValue('No token');
    try {
      const response = await api.get('/auth/me');
      localStorage.setItem('rideops_user', JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      dispatch(logout());
      return rejectWithValue(err.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('rideops_token', response.data.token);
      localStorage.setItem('rideops_user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, ready: false, loading: false, error: null },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('rideops_token');
      localStorage.removeItem('rideops_user');
      state.user = null;
    }
  }
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;
