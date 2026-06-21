import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const fetchBookings = createAsyncThunk(
  'data/fetchBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStats = createAsyncThunk(
  'data/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const successResp = await api.get('/bookings/success');
      const cancelledResp = await api.get('/bookings/cancelled');
      const allResp = await api.get('/bookings');
      return {
        total: allResp.data.count || 0,
        success: successResp.data.count || 0,
        cancelled: cancelledResp.data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState: { bookings: [], pagination: {}, stats: { total: 0, success: 0, cancelled: 0 }, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});
export default dataSlice.reducer;
