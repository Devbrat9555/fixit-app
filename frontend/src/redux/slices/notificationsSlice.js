import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/notifications?limit=20');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.put('/notifications/read-all');
});

export const markOneRead = createAsyncThunk('notifications/markOneRead', async (id) => {
  await api.put(`/notifications/${id}/read`);
  return id;
});

export const deleteNotif = createAsyncThunk('notifications/delete', async (id) => {
  await api.delete(`/notifications/${id}`);
  return id;
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.isLoading = false; })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markOneRead.fulfilled, (state, action) => {
        const n = state.notifications.find(n => n._id === action.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(deleteNotif.fulfilled, (state, action) => {
        const n = state.notifications.find(n => n._id === action.payload);
        if (n && !n.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
