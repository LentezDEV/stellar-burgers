import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { constructorReducer } from './slices/constructorSlice';
import { ingredientsReducer } from './slices/ingredientsSlice';
import { ordersReducer } from './slices/ordersSlice';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

const rootReducer = combineReducers({
  auth: authReducer,
  burgerConstructor: constructorReducer,
  ingredients: ingredientsReducer,
  orders: ordersReducer
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
