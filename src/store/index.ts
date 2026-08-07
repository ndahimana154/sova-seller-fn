import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './authSlice'
import { uiReducer } from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
