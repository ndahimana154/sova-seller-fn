import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

interface UiState {
  sellerSidebarCollapsed: boolean
  sellerSidebarOpen: boolean
  toasts: Toast[]
}

const initialState: UiState = {
  sellerSidebarCollapsed: false,
  sellerSidebarOpen: false,
  toasts: [],
}

const uiSlice = createSlice({
  initialState,
  name: 'ui',
  reducers: {
    pushToast: {
      prepare: (message: string, tone: ToastTone = 'success') => ({
        payload: { id: nanoid(), message, tone },
      }),
      reducer(state, action: PayloadAction<Toast>) {
        if (state.toasts.some((toast) => toast.message === action.payload.message)) return
        state.toasts = [...state.toasts, action.payload].slice(-3)
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    setSellerSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sellerSidebarOpen = action.payload
    },
    toggleSellerSidebarCollapsed(state) {
      state.sellerSidebarCollapsed = !state.sellerSidebarCollapsed
    },
  },
})

export const { dismissToast, pushToast, setSellerSidebarOpen, toggleSellerSidebarCollapsed } = uiSlice.actions
export const uiReducer = uiSlice.reducer
