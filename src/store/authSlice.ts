import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loadClientSession, type ClientSession } from '../lib/clientSession'

interface AuthState {
  session: ClientSession | null
}

const initialState: AuthState = {
  session: loadClientSession(),
}

const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    clearSession(state) {
      state.session = null
    },
    setSession(state, action: PayloadAction<ClientSession | null>) {
      state.session = action.payload
    },
  },
})

export const { clearSession, setSession } = authSlice.actions
export const authReducer = authSlice.reducer
