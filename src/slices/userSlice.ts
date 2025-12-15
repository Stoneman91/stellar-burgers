import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
  refreshToken
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TLoginData, TUser } from '@utils-types';
import { deleteCookie, getCookie, setCookie } from '../../src/utils/cookie';
import { RootState } from '../services/store';

export type TRegisterData = {
  email: string;
  password: string;
  name: string;
};

interface UserState {
  user: TUser | null;
  isAuthChecked: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  error: null
};

export const checkUserAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    const accessToken = getCookie('accessToken');

    if (!accessToken) {
      return null;
    }

    try {
      const response = await getUserApi();
      return response.user;
    } catch (error) {
      try {
        const refreshData = await refreshToken();
        setCookie('accessToken', refreshData.accessToken);
        localStorage.setItem('refreshToken', refreshData.refreshToken);

        const response = await getUserApi();
        return response.user;
      } catch (refreshError) {
        deleteCookie('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Сессия истекла');
      }
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    if (response.success) {
      setCookie('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response.user;
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (data: TLoginData) => {
    const info = await loginUserApi(data);
    if (info.success) {
      setCookie('accessToken', info.accessToken);
      localStorage.removeItem('refreshToken');
      localStorage.setItem('refreshToken', info.refreshToken);
    }
    return info.user;
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  const info = await logoutApi();
  if (info.success) {
    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  }
  return info;
});

export const updateUser = createAsyncThunk('user/updateUser', updateUserApi);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.user = null;
        state.isAuthChecked = true;
        state.error = (action.payload as string) || 'Ошибка авторизации';
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка входа';
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка регистрации';
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка обновления данных';
      });
  }
});

export const { clearError } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthChecked = (state: RootState) =>
  state.user.isAuthChecked;
export const selectIsAuthenticated = (state: RootState) => !!state.user.user;
export const selectError = (state: RootState) => state.user.error;

export default userSlice.reducer;
