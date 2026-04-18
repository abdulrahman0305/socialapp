import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { api, getStoredToken, setStoredToken } from '../api/client';

export type User = {
  id: string;
  email: string;
  username: string;
  bio: string;
  avatarUrl: string;
  role: string;
  followersCount: number;
  followingCount: number;
};

type AuthState = {
  user: User | null;
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  const token = await getStoredToken();
  if (!token) return null;
  try {
    const { data } = await api.get<User>('/auth/me');
    return data;
  } catch {
    await setStoredToken(null);
    return rejectWithValue(null);
  }
});

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', payload);
      await setStoredToken(data.token);
      return data.user;
    } catch (e: unknown) {
      return rejectWithValue(axiosErrorMessage(e));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    payload: { email: string; password: string; username: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', payload);
      await setStoredToken(data.token);
      return data.user;
    } catch (e: unknown) {
      return rejectWithValue(axiosErrorMessage(e));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await setStoredToken(null);
});

function axiosErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as { error?: string })?.error || e.message || 'Request failed';
  }
  return 'Network error';
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (s) => {
        s.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (s, a) => {
        s.status = 'ready';
        s.user = a.payload ?? null;
        s.error = null;
      })
      .addCase(bootstrapAuth.rejected, (s) => {
        s.status = 'ready';
        s.user = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.user = a.payload;
        s.error = null;
      })
      .addCase(login.rejected, (s, a) => {
        s.error = (a.payload as string) || 'Login failed';
      })
      .addCase(register.fulfilled, (s, a) => {
        s.user = a.payload;
        s.error = null;
      })
      .addCase(register.rejected, (s, a) => {
        s.error = (a.payload as string) || 'Signup failed';
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
