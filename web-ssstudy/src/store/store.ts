import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Import reducers
import counterReducer from './slices/counterSlice';

// Tạo root reducer
const rootReducer = combineReducers({
  counter: counterReducer,
  // Thêm reducers khác vào đây
});

// Định nghĩa kiểu state
export type RootState = ReturnType<typeof rootReducer>;

// Tạo store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Thêm các action/path không cần kiểm tra serialization
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Định nghĩa kiểu dispatch
export type AppDispatch = typeof store.dispatch; 