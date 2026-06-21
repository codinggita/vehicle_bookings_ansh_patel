import { createSlice } from '@reduxjs/toolkit';
const dataSlice = createSlice({
  name: 'data',
  initialState: { bookings: [], pagination: {}, stats: {}, loading: false, error: null },
  reducers: {},
});
export default dataSlice.reducer;
