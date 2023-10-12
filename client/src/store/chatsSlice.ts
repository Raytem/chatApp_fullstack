import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PrivateChat } from "../types/interfaces/PrivateChat";
import { ChatOnlineInfo } from "../types/interfaces/ChatOnlineInfo";
import { UpdateChatSlicePayload } from "../types/interfaces/UpdateChatSlicePayload";
import { TypingStatusDto } from "../types/dtos/privateChat/TypingStatusDto";

function getSortedChats(chats: PrivateChat[]) {
  return chats.sort((a, b) => {
    if (a.isSelf && !b.isSelf) {
      return -1;
    } 
    if (!a.isSelf && b.isSelf) {
      return 1;
    }

    if (a.isPinned && !b.isPinned) {
      return -1;
    } 
    if (!a.isPinned && b.isPinned) {
      return 1;
    }

    return 0;
  })
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
   chats: [] as PrivateChat[],
  },
  reducers: {
    setChats(state, action: PayloadAction<PrivateChat[]>) {
      state.chats = getSortedChats(action.payload);
    },

    addChat(state, action: PayloadAction<PrivateChat>) {
      state.chats = getSortedChats([
        ...state.chats,
        action.payload
      ]);
    },

    removeChat(state, action: PayloadAction<number>) {
      const filteredChats = state.chats.filter(chat => chat.id !== action.payload);
      state.chats = getSortedChats(filteredChats);
    },

    updateChat(state, action: PayloadAction<UpdateChatSlicePayload>) {
      const updateChatPayload = action.payload
      const updatedChat = updateChatPayload.updatedChat
      const curChat = updateChatPayload.curChat;
      const readMsgsIntersectEl_inView = updateChatPayload.readMsgsIntersectEl_inView;

      if (state.chats.some(chat => chat.id === updatedChat.id)) {
        state.chats = state.chats.map(chat => {
          if (chat.id === updatedChat.id) {
            if (curChat.id === updatedChat.id && readMsgsIntersectEl_inView) {
              return {...updatedChat, unreadMsgsCnt: 0};
            }
            return updatedChat              
          } 
          return chat;
        })
      } else {
        state.chats = [...state.chats, updatedChat];
      }
    },

    pinChat(state, action: PayloadAction<PrivateChat>) {
      const updatedChats = state.chats.map(chat => {
        if (chat.id === action.payload.id) {
          return { ...chat, isPinned: true };
        }
        return chat;
      })
      state.chats = getSortedChats(updatedChats);
    },

    unpinChat(state, action: PayloadAction<PrivateChat>) {
      const updatedChats = state.chats.map(chat => {
        if (chat.id === action.payload.id) {
          return { ...chat, isPinned: false };
        }
        return chat;
      })
      state.chats = getSortedChats(updatedChats);
    },

    updateChatTypingStatus(state, action: PayloadAction<TypingStatusDto>) {
      const updatedChats = state.chats.map(chat => {
        if (chat.id === action.payload.chatId) {
          return { ...chat, isTyping: action.payload.isTyping };
        }
        return chat;
      })
      state.chats = getSortedChats(updatedChats);
    },

    updateOnlineStatus(state, action: PayloadAction<ChatOnlineInfo>) {
      const onlineStatusLog = action.payload;

      state.chats = state.chats.map(chat => {
        if (chat?.onlineInfo?.userId === onlineStatusLog.userId) {
          return {...chat, onlineInfo: onlineStatusLog};
        } else {
          return chat;
        }
      })
    },
    
    clearChats(state) {
      state.chats = [];
    },
  }
})

export const { 
  setChats, 
  addChat, 
  updateChat, 
  removeChat, 
  clearChats, 
  pinChat, 
  unpinChat, 
  updateChatTypingStatus,
  updateOnlineStatus
} = chatsSlice.actions;

export const chatsReducer = chatsSlice.reducer;