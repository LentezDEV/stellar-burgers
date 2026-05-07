import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  resetPasswordApi,
  TLoginData,
  TRegisterData,
  updateUserApi
} from '@api';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookie';
import { TUser } from '@utils-types';
import type { RootState } from '../store';

type TAuthState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  request: boolean;
  error: string | null;
  updateUserError: string | null;
  passwordResetError: string | null;
};

type TAuthData = {
  accessToken: string;
  refreshToken: string;
  user: TUser;
};

const initialState: TAuthState = {
  user: null,
  isAuthChecked: false,
  isAuthenticated: false,
  request: false,
  error: null,
  updateUserError: null,
  passwordResetError: null
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String(error.message);
  }
  return 'Что-то пошло не так';
};

const saveTokens = ({ accessToken, refreshToken }: TAuthData) => {
  localStorage.setItem('refreshToken', refreshToken);
  setCookie('accessToken', accessToken);
};

const clearTokens = () => {
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
};

export const checkUserAuth = createAsyncThunk<
  TUser | null,
  void,
  { rejectValue: string }
>('auth/checkUserAuth', async (_, { rejectWithValue }) => {
  if (!getCookie('accessToken')) {
    return null;
  }

  try {
    const data = await getUserApi();
    if (data.success) {
      return data.user;
    }

    clearTokens();
    return rejectWithValue('Не удалось проверить пользователя');
  } catch (error) {
    clearTokens();
    return rejectWithValue(getErrorMessage(error));
  }
});

export const loginUser = createAsyncThunk<
  TUser,
  TLoginData,
  { rejectValue: string }
>('auth/loginUser', async (data, { rejectWithValue }) => {
  try {
    const authData = await loginUserApi(data);
    saveTokens(authData);
    return authData.user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const registerUser = createAsyncThunk<
  TUser,
  TRegisterData,
  { rejectValue: string }
>('auth/registerUser', async (data, { rejectWithValue }) => {
  try {
    const authData = await registerUserApi(data);
    saveTokens(authData);
    return authData.user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateUser = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  { rejectValue: string }
>('auth/updateUser', async (data, { rejectWithValue }) => {
  try {
    const response = await updateUserApi(data);
    if (response.success) {
      return response.user;
    }

    return rejectWithValue('Не удалось обновить данные пользователя');
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      clearTokens();
    } catch (error) {
      clearTokens();
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>('auth/forgotPassword', async (data, { rejectWithValue }) => {
  try {
    await forgotPasswordApi(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { password: string; token: string },
  { rejectValue: string }
>('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    await resetPasswordApi(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.updateUserError = null;
      state.passwordResetError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.pending, (state) => {
        state.request = true;
        state.error = null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.request = false;
        state.isAuthChecked = true;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.request = false;
        state.isAuthChecked = true;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Не удалось проверить пользователя';
      })
      .addCase(loginUser.pending, (state) => {
        state.request = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.request = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.request = false;
        state.error = action.payload || 'Не удалось войти';
      })
      .addCase(registerUser.pending, (state) => {
        state.request = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.request = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.request = false;
        state.error = action.payload || 'Не удалось зарегистрироваться';
      })
      .addCase(updateUser.pending, (state) => {
        state.request = true;
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.request = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.request = false;
        state.updateUserError =
          action.payload || 'Не удалось обновить данные пользователя';
      })
      .addCase(logoutUser.pending, (state) => {
        state.request = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.request = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAuthChecked = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.request = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAuthChecked = true;
        state.error = action.payload || 'Не удалось выйти';
      })
      .addCase(forgotPassword.pending, (state) => {
        state.request = true;
        state.passwordResetError = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.request = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.request = false;
        state.passwordResetError =
          action.payload || 'Не удалось отправить письмо восстановления пароля';
      })
      .addCase(resetPassword.pending, (state) => {
        state.request = true;
        state.passwordResetError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.request = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.request = false;
        state.passwordResetError =
          action.payload || 'Не удалось изменить пароль';
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthChecked = (state: RootState) =>
  state.auth.isAuthChecked;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthRequest = (state: RootState) => state.auth.request;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUpdateUserError = (state: RootState) =>
  state.auth.updateUserError;
export const selectPasswordResetError = (state: RootState) =>
  state.auth.passwordResetError;
