import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = axios.create({
  baseURL: "https://playground-029-backend.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Registration failed" }
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post("/auth/login", userData);
      const { token, user } = response.data;

      // Regular login uses username/password
      const userWithProvider = { ...user, provider: "local" };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithProvider));
      localStorage.setItem("auth_provider", "local");

      return { token, user: userWithProvider };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Login failed" }
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await API.post("/auth/logout");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth_provider");

      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Logout failed" }
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/auth/me");
      
      // Preserve the provider information
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const provider = storedUser.provider || localStorage.getItem("auth_provider") || "unknown";
      
      const updatedUser = {
        ...response.data,
        provider
      };
      
      return updatedUser;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth_provider");
      
      return rejectWithValue(
        error.response?.data || { message: "Failed to get the current user" }
      );
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null,
    status: "idle",
    error: null,
    isAuthenticated: !!localStorage.getItem("token"),
    provider: localStorage.getItem("auth_provider") || null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    oauthLoginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.status = "succeeded";
      state.error = null;
      state.provider = action.payload.provider;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Registration failed";
      })

      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.provider = action.payload.user.provider || "local";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Login failed";
        state.isAuthenticated = false;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
        state.provider = null;
      })

      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.provider = action.payload.provider;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "failed";
        state.error = action.payload?.message || "Failed to get user";
        state.provider = null;
      });
  },
});

export const { clearError, oauthLoginSuccess } = authSlice.actions;
export default authSlice.reducer;