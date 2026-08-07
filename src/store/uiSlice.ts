import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sellerSidebarCollapsed: boolean
  sellerSidebarOpen: boolean
  toast: string
}

const initialState: UiState = {
  sellerSidebarCollapsed: false,
  sellerSidebarOpen: false,
  toast: '',
}

const uiSlice = createSlice({
  initialState,
  name: 'ui',
  reducers: {
    setToast(state, action: PayloadAction<string>) {
      state.toast = action.payload
    },
    setSellerSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sellerSidebarOpen = action.payload
    },
    toggleSellerSidebarCollapsed(state) {
      state.sellerSidebarCollapsed = !state.sellerSidebarCollapsed
    },
  },
})

export const { setSellerSidebarOpen, setToast, toggleSellerSidebarCollapsed } = uiSlice.actions
export const uiReducer = uiSlice.reducer
