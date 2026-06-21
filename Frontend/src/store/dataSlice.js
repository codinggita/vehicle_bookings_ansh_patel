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

const dataSlice = createSlice({
  name: 'data',
  initialState: { bookings: [], pagination: {}, stats: {}, loading: false, error: null },
  reducers: {},
});
export default dataSlice.reducer;
