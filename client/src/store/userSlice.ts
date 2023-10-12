import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "../types/interfaces/User";

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {} as User,
  },
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },

    clearUser(state) {
      state.user = {} as User
    },

    updateUser(state, action: PayloadAction<User>) {
      state.user = {
        ...state.user,
        ...action.payload,
      }
    }
  },
})

export const { setUser, clearUser, updateUser } = userSlice.actions;
export const userReducer = userSlice.reducer;