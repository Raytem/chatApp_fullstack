import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PrivateChat } from "../types/interfaces/PrivateChat";
import { ChatOnlineInfo } from "../types/interfaces/ChatOnlineInfo";

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    curChat: {} as PrivateChat,
  },
  reducers: {
    setCurChat(state, action: PayloadAction<PrivateChat>) {
      state.curChat = action.payload;
    },

    setCurChatOnlineStatus(state, action: PayloadAction<ChatOnlineInfo>) {
      state.curChat.onlineInfo = action.payload;
    },
    
    clearCurChat(state) {
      state.curChat = {} as PrivateChat;
    },

    setCurChatUnreadMsgsCnt(state, action: PayloadAction<number>) {
      state.curChat.unreadMsgsCnt = action.payload;
    },

    readCurChatMsgs(state) {
      state.curChat.unreadMsgsCnt = 0;
    },
  }
})

export const { 
  setCurChat, 
  setCurChatOnlineStatus, 
  clearCurChat, 
  readCurChatMsgs, 
  setCurChatUnreadMsgsCnt,
} = chatSlice.actions;
export const chatReducer = chatSlice.reducer;