import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./userSlice";
import { chatReducer } from "./chatSlice";
import { chatsReducer } from "./chatsSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    chats: chatsReducer,
  }
})

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;