import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getFeedsApi,
  getOrderByNumberApi,
  getOrdersApi,
  orderBurgerApi
} from '@api';
import { TOrder } from '@utils-types';
import type { RootState } from '../store';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

type TOrderModalData = {
  number: number;
};

type TOrdersState = {
  feed: TFeedState;
  profileOrders: TOrder[];
  currentOrder: TOrder | null;
  orderModalData: TOrderModalData | null;
  isFeedLoading: boolean;
  isProfileOrdersLoading: boolean;
  isOrderLoading: boolean;
  orderRequest: boolean;
  error: string | null;
};

const initialState: TOrdersState = {
  feed: {
    orders: [],
    total: 0,
    totalToday: 0
  },
  profileOrders: [],
  currentOrder: null,
  orderModalData: null,
  isFeedLoading: false,
  isProfileOrdersLoading: false,
  isOrderLoading: false,
  orderRequest: false,
  error: null
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String(error.message);
  }
  return 'Не удалось загрузить заказы';
};

export const fetchFeeds = createAsyncThunk<
  TFeedState,
  void,
  { rejectValue: string }
>('orders/fetchFeeds', async (_, { rejectWithValue }) => {
  try {
    const data = await getFeedsApi();
    return {
      orders: data.orders,
      total: data.total,
      totalToday: data.totalToday
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchOrderByNumber = createAsyncThunk<
  TOrder,
  number,
  { rejectValue: string }
>('orders/fetchOrderByNumber', async (number, { rejectWithValue }) => {
  try {
    const data = await getOrderByNumberApi(number);
    if (data.success && data.orders.length) {
      return data.orders[0];
    }

    return rejectWithValue('Заказ не найден');
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchProfileOrders = createAsyncThunk<
  TOrder[],
  void,
  { rejectValue: string }
>('orders/fetchProfileOrders', async (_, { rejectWithValue }) => {
  try {
    return await getOrdersApi();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createOrder = createAsyncThunk<
  TOrderModalData,
  string[],
  { rejectValue: string }
>('orders/createOrder', async (ingredients, { rejectWithValue }) => {
  try {
    const data = await orderBurgerApi(ingredients);
    return {
      number: data.order.number
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderModalData: (state) => {
      state.orderModalData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isFeedLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isFeedLoading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isFeedLoading = false;
        state.error = action.payload || 'Не удалось загрузить ленту заказов';
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isOrderLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isOrderLoading = false;
        state.error = action.payload || 'Не удалось загрузить заказ';
      })
      .addCase(fetchProfileOrders.pending, (state) => {
        state.isProfileOrdersLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        state.isProfileOrdersLoading = false;
        state.profileOrders = action.payload;
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        state.isProfileOrdersLoading = false;
        state.error = action.payload || 'Не удалось загрузить историю заказов';
      })
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderModalData = null;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.payload || 'Не удалось оформить заказ';
      });
  }
});

export const { clearOrderModalData } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;

export const selectFeedOrders = (state: RootState) => state.orders.feed.orders;
export const selectProfileOrders = (state: RootState) =>
  state.orders.profileOrders;
export const selectFeed = (state: RootState) => state.orders.feed;
export const selectOrdersIsFeedLoading = (state: RootState) =>
  state.orders.isFeedLoading;
export const selectOrdersIsProfileOrdersLoading = (state: RootState) =>
  state.orders.isProfileOrdersLoading;
export const selectOrdersIsOrderLoading = (state: RootState) =>
  state.orders.isOrderLoading;
export const selectOrdersError = (state: RootState) => state.orders.error;
export const selectOrderRequest = (state: RootState) =>
  state.orders.orderRequest;
export const selectOrderModalData = (state: RootState) =>
  state.orders.orderModalData;
export const selectOrderByNumber = (number?: number) => (state: RootState) => {
  const profileOrder = state.orders.profileOrders.find(
    (order) => order.number === number
  );
  const feedOrder = state.orders.feed.orders.find(
    (order) => order.number === number
  );

  if (profileOrder) return profileOrder;
  if (feedOrder) return feedOrder;
  if (state.orders.currentOrder?.number === number) {
    return state.orders.currentOrder;
  }

  return null;
};
