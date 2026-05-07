import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getFeedsApi, getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';
import type { RootState } from '../store';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

type TOrdersState = {
  feed: TFeedState;
  currentOrder: TOrder | null;
  isFeedLoading: boolean;
  isOrderLoading: boolean;
  error: string | null;
};

const initialState: TOrdersState = {
  feed: {
    orders: [],
    total: 0,
    totalToday: 0
  },
  currentOrder: null,
  isFeedLoading: false,
  isOrderLoading: false,
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

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
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
      });
  }
});

export const ordersReducer = ordersSlice.reducer;

export const selectFeedOrders = (state: RootState) => state.orders.feed.orders;
export const selectFeed = (state: RootState) => state.orders.feed;
export const selectOrdersIsFeedLoading = (state: RootState) =>
  state.orders.isFeedLoading;
export const selectOrdersIsOrderLoading = (state: RootState) =>
  state.orders.isOrderLoading;
export const selectOrdersError = (state: RootState) => state.orders.error;
export const selectOrderByNumber = (number?: number) => (state: RootState) => {
  const feedOrder = state.orders.feed.orders.find(
    (order) => order.number === number
  );

  if (feedOrder) return feedOrder;
  if (state.orders.currentOrder?.number === number) {
    return state.orders.currentOrder;
  }

  return null;
};
