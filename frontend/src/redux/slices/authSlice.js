import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const user = JSON.parse(localStorage.getItem('fixit_user'));
const token = localStorage.getItem('fixit_token');

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/auth/me');
    localStorage.setItem('fixit_user', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

export const login = createAsyncThunk('auth/login', async (formData, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/login', formData);
    localStorage.setItem('fixit_token', data.token);
    localStorage.setItem('fixit_user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const register = createAsyncThunk('auth/register', async (formData, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('fixit_token', data.token);
    localStorage.setItem('fixit_user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed';
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
  try {
    const { data } = await api.put('/auth/profile', profileData);
    localStorage.setItem('fixit_user', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    token: token || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAuth: (state) => {
      localStorage.removeItem('fixit_user');
      state.user = null;
      state.token = null;
      state.error = null;
    },
    logout: (state) => {
      localStorage.removeItem('fixit_token');
      localStorage.removeItem('fixit_user');
      state.user = null;
      state.token = null;
      state.error = null;
      toast.success('Logged out successfully');
    },
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success(`Welcome back, ${action.payload.user.name.split(' ')[0]}!`);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success('Account created successfully!');
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Don't toast error on fetchCurrentUser to avoid spam
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        toast.success('Profile updated successfully!');
      })
      .addCase(updateProfile.rejected, (state, action) => {
        toast.error(action.payload);
      });
  },
});

export const { logout, clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
