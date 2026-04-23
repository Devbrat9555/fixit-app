import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const createBooking = createAsyncThunk('bookings/create', async (bookingData, thunkAPI) => {
  try {
    const { data } = await api.post('/bookings', bookingData);
    toast.success('Booking created successfully! 🎉');
    return data.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Booking failed';
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

export const fetchMyBookings = createAsyncThunk('bookings/myBookings', async (params, thunkAPI) => {
  try {
    const { data } = await api.get('/bookings/my-bookings', { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const fetchProviderBookings = createAsyncThunk('bookings/providerBookings', async (params, thunkAPI) => {
  try {
    const { data } = await api.get('/bookings/provider-bookings', { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ id, status, cancellationReason }, thunkAPI) => {
  try {
    const { data } = await api.put(`/bookings/${id}/status`, { status, cancellationReason });
    toast.success(`Booking ${status} successfully!`);
    return data.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Update failed';
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async ({ id, reason }, thunkAPI) => {
  try {
    const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
    toast.success('Booking cancelled successfully');
    return data.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Cancellation failed';
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

export const fetchNearbyBookings = createAsyncThunk('bookings/nearby', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/bookings/nearby');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const acceptBooking = createAsyncThunk('bookings/accept', async ({ id, providerLocation }, thunkAPI) => {
  try {
    const { data } = await api.put(`/bookings/${id}/accept`, { providerLocation });
    toast.success('Job accepted! 🎉');
    return data.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Acceptance failed';
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

export const addReview = createAsyncThunk('bookings/addReview', async ({ id, rating, comment }, thunkAPI) => {
  try {
    const { data } = await api.post(`/bookings/${id}/review`, { rating, comment });
    toast.success('Review submitted! ⭐');
    return data.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Review submission failed';
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    providerBookings: [],
    nearbyBookings: [],
    isLoading: false,
    error: null,
    total: 0,
    totalPages: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMyBookings.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchProviderBookings.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProviderBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providerBookings = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchProviderBookings.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchNearbyBookings.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNearbyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyBookings = action.payload.data;
      })
      .addCase(fetchNearbyBookings.rejected, (state) => { state.isLoading = false; })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.nearbyBookings = state.nearbyBookings.filter(b => b._id !== action.payload._id);
        state.providerBookings.unshift(action.payload);
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const idx = state.providerBookings.findIndex(b => b._id === action.payload._id);
        if (idx !== -1) state.providerBookings[idx] = action.payload;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex(b => b._id === action.payload._id);
        if (idx !== -1) state.bookings[idx] = action.payload;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex(b => b._id === action.payload._id);
        if (idx !== -1) state.bookings[idx] = action.payload;
      });
  },
});

export default bookingsSlice.reducer;
