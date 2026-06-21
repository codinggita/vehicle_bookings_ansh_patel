import { createSlice } from '@reduxjs/toolkit';
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, ready: false, loading: false, error: null },
  reducers: {}
});
export default authSlice.reducer;
