import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchServices = createAsyncThunk('services/fetchAll', async (params, thunkAPI) => {
  try {
    const { data } = await api.get('/services', { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
  }
});

export const fetchFeaturedServices = createAsyncThunk('services/featured', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/services/featured');
    return data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
  }
});

export const fetchServiceById = createAsyncThunk('services/fetchOne', async (id, thunkAPI) => {
  try {
    const { data } = await api.get(`/services/${id}`);
    return data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Service not found');
  }
});

export const fetchMyServices = createAsyncThunk('services/myServices', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/services/my-services');
    return data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const createService = createAsyncThunk('services/create', async (serviceData, thunkAPI) => {
  try {
    const { data } = await api.post('/services', serviceData);
    toast.success('Service created successfully!');
    return data.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to create service';
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

export const updateService = createAsyncThunk('services/update', async ({ id, serviceData }, thunkAPI) => {
  try {
    const { data } = await api.put(`/services/${id}`, serviceData);
    toast.success('Service updated successfully!');
    return data.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to update service';
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

export const deleteService = createAsyncThunk('services/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/services/${id}`);
    toast.success('Service deleted successfully!');
    return id;
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to delete service';
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    featuredServices: [],
    myServices: [],
    currentService: null,
    isLoading: false,
    error: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {
    clearCurrentService: (state) => { state.currentService = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => { state.isLoading = true; })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeaturedServices.fulfilled, (state, action) => {
        state.featuredServices = action.payload;
      })
      .addCase(fetchServiceById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyServices.fulfilled, (state, action) => {
        state.myServices = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.myServices.unshift(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.myServices.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.myServices[index] = action.payload;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.myServices = state.myServices.filter(s => s._id !== action.payload);
      });
  },
});

export const { clearCurrentService } = servicesSlice.actions;
export default servicesSlice.reducer;
