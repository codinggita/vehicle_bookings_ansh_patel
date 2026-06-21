import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('rideops_user')); }
  catch { return null; }
};

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

export const register = createAsyncThunk(
  'auth/register',
  async (values, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', values);
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
  initialState: {
    user: readUser(),
    ready: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('rideops_token');
      localStorage.removeItem('rideops_user');
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.ready = true;
        state.loading = false;
      })
      .addCase(validateAuth.rejected, (state) => {
        state.ready = true;
        state.loading = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
