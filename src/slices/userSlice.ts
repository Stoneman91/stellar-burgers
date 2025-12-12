import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TUser } from '@utils-types';
import {
  registerUserApi,
  loginUserApi,
  getUserApi,
  updateUserApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  TRegisterData,
  TLoginData
} from '@api';
import { setCookie, getCookie, deleteCookie } from '../utils/cookie';
import { AppDispatch, RootState } from '../services/store';

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData, { rejectWithValue }) => {
    try {
      const response = await registerUserApi(data);
      setCookie('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка регистрации'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (data: TLoginData, { rejectWithValue }) => {
    try {
      const response = await loginUserApi(data);
      setCookie('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка авторизации'
      );
    }
  }
);

export const getUser = createAsyncThunk(
  'user/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserApi();
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Ошибка получения данных пользователя'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (user: Partial<TRegisterData>, { rejectWithValue }) => {
    try {
      const response = await updateUserApi(user);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка обновления данных'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      deleteCookie('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка выхода'
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await forgotPasswordApi({ email });
      return email;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка восстановления пароля'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async (data: { password: string; token: string }, { rejectWithValue }) => {
    try {
      await resetPasswordApi(data);
      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка сброса пароля'
      );
    }
  }
);

interface UserState {
  user: TUser | null;
  isLoading: boolean;
  error: string | null;
  isAuth: boolean;
  forgotPasswordEmail: string | null;
  resetPasswordSuccess: boolean;
}

export const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  isAuth: false,
  forgotPasswordEmail: null,
  resetPasswordSuccess: false
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<{ user: TUser | null }>) => {
      state.user = action.payload.user;
      state.isAuth = !!action.payload.user;
    },

    setUser: (state, action: PayloadAction<TUser | null>) => {
      state.user = action.payload;
      state.isAuth = !!action.payload;
    },

    setAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuth = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuth = false;
      state.error = null;
    },
    clearForgotPassword: (state) => {
      state.forgotPasswordEmail = null;
      state.resetPasswordSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuth = false;
        state.error = action.payload as string;
      })

      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuth = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forgotPasswordEmail = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setAuth, clearUser, clearForgotPassword } = userSlice.actions;
export default userSlice.reducer;

export const selectUser = (state: RootState) =>
  (state as any).user?.user || null;
export const selectIsAuth = (state: RootState) =>
  (state as any).user?.isAuth || false;
export const selectUserLoading = (state: RootState) =>
  (state as any).user?.isLoading || false;
export const selectUserError = (state: RootState) =>
  (state as any).user?.error || null;
export const selectForgotPasswordEmail = (state: RootState) =>
  (state as any).user?.forgotPasswordEmail || null;
export const selectResetPasswordSuccess = (state: RootState) =>
  (state as any).user?.resetPasswordSuccess || false;
