import { useCallback, useEffect, useMemo, useState } from "react"
import { Socket, io } from "socket.io-client"
import { getToken } from "../utils/localStorage_token";
import { PrivateChat } from "../types/interfaces/PrivateChat";
import { ChatOnlineInfo } from "../types/interfaces/ChatOnlineInfo";
import { ReadMessagesResponse } from "../types/interfaces/ReadMessagesResponse";
import { UpdatedChatInfo } from "../types/interfaces/UpdatedChatInfo";
import { CreateMessageDto } from "../types/dtos/message/CreateMessageDto";
import { UpdateMessageDto } from "../types/dtos/message/UpdateMessageDto";
import { DeleteMessageDto } from "../types/dtos/message/DeleteMessageDto";
import { ReadChatMsgsDto } from "../types/dtos/privateChat/ReadChatMsgsDto";
import { UsePrivateChatType } from "../types/interfaces/UsePrivateChatType";
import { ConnectToChatDto } from "../types/interfaces/ConnectToChatDto";
import { ConnectToChatResponseDto } from "../types/interfaces/ConnectToChatResponseDto";
import { WsMessageResponse } from "../types/interfaces/WsMessageResponse";
import { DeletedChatInfo } from "../types/interfaces/DeletedChatInfo";
import { DeleteChatDto } from "../types/dtos/privateChat/DeleteChatDto";
import { TypingStatusDto } from "../types/dtos/privateChat/TypingStatusDto";
import { useAppSelector } from "./rtkHooks";

let socket: Socket | null;
let mainSocket: Socket;

export const usePrivateChat = (): UsePrivateChatType => {
  const curUser = useAppSelector(state => state.user.user);

  const [typingStatus, setTypingStatus] = useState<TypingStatusDto>();
  const [newMsgResp, setNewMsgResp] = useState<WsMessageResponse>();
  const [updatedMsgResp, setUpdatedMsgResp] = useState<WsMessageResponse>();
  const [removedMsgResp, setRemovedMsgResp] = useState<WsMessageResponse>();
  const [updatedChat, setUpdatedChat] = useState<PrivateChat>();
  const [deletedChatInfo, setDeletedChatInfo] = useState<DeletedChatInfo>();
  const [readMsgsResp, setReadMsgsResp] = useState<ReadMessagesResponse>();
  const [onlineStatusLog, setOnlineStatusLog] = useState<ChatOnlineInfo>();

  useEffect(() => {
    if (!curUser.id) {
      socket = null;
    } else {
      if (!socket) {
        socket = io(`${import.meta.env.VITE_SERVER_URL}/private-chat`, {
          extraHeaders: {
            'authorization': `Bearer ${getToken()}`,
          },
          withCredentials: true,
          secure: true,
          reconnection: true,
          reconnectionDelay: 1000,
        }) 
      }
    }
  }, [curUser]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    mainSocket = socket as Socket;

    mainSocket.on('error', (e) => {
      console.log(e, 'error')
    })

    //user

    mainSocket.on('user:online-status', (onlineStatus: ChatOnlineInfo) => {
      if (onlineStatus.userId === curUser.id && onlineStatus.isOnline === false) {
        setOnline();
      }
      setOnlineStatusLog(onlineStatus);
    })

    mainSocket.on('user:typing-status', (typingStatusDto: TypingStatusDto) => {
      setTypingStatus(typingStatusDto);
    })

    //chat

    mainSocket.on('private-chat:readMsgs', (readMessagesResponse: ReadMessagesResponse) => {
      setReadMsgsResp(readMessagesResponse);
    })

    mainSocket.on('private-chat:update', (updatedChatInfo: UpdatedChatInfo) => {
      mainSocket.emit('private-chat:getOne', {
        chatId: updatedChatInfo.id,
      })
    })

    mainSocket.on('private-chat:delete', (deletedChatInfo: DeletedChatInfo) => {
      setDeletedChatInfo(deletedChatInfo);
    })

    mainSocket.on('private-chat:connectInfo', (connectToChatResponseDto: ConnectToChatResponseDto) => {
      if (connectToChatResponseDto.connectedUserId === curUser.id) {
        mainSocket.emit('private-chat:connect', { chatId: connectToChatResponseDto.chatId });
      }
    })

    mainSocket.on('private-chat:getOne', (chat: PrivateChat) => {
      setUpdatedChat(chat)
    })

    //message

    mainSocket.on('message:post', (newMessageResp: WsMessageResponse) => {
      setNewMsgResp(newMessageResp);
    })

    mainSocket.on('message:update', (updatedMessageResp: WsMessageResponse) => {
      setUpdatedMsgResp(updatedMessageResp)
    })

    mainSocket.on('message:remove', (removedMessageResp: WsMessageResponse) => {
      setRemovedMsgResp(removedMessageResp);
    })

  }, [])

  const setOnline = useCallback(() => {
    mainSocket.emit('user:online-status-setOnline');
  }, []);

  const updateTypingStatus = useCallback((writeMessageDto: TypingStatusDto) => {
    mainSocket.emit('user:typing-status', writeMessageDto);
  }, [])

  const readChatMsgs = useCallback((readChatMsgsDto: ReadChatMsgsDto) => {
    mainSocket.emit('private-chat:readMsgs', readChatMsgsDto)
  }, [])
  
  const sendMsg = useCallback((createMsgDto: CreateMessageDto) => {
    mainSocket.emit('message:post', createMsgDto);
  }, [])

  const updateMsg = useCallback((updateMsgDto: UpdateMessageDto) => {
    mainSocket.emit('message:update', updateMsgDto);
  }, [])

  const deleteChat = useCallback((deleteChatDto: DeleteChatDto) => {
    mainSocket.emit('private-chat:delete', deleteChatDto);
    if (deleteChatDto.isFullDelete) {
      leaveFromChat({ chatId: deleteChatDto.chatId });
    }
  }, [])

  const removeMsg = useCallback((removeMsgDto: DeleteMessageDto) => {
    mainSocket.emit('message:remove', removeMsgDto);
  }, [])

  const connectToChat = useCallback((connectToChatDto: ConnectToChatDto) => {
    mainSocket.emit('private-chat:connect', connectToChatDto);
  }, [])

  const leaveFromChat = useCallback((leaveFromChatDto: ConnectToChatDto) => {
    mainSocket.emit('private-chat:leave', leaveFromChatDto);
  }, [])

  const disconnect = useCallback(() => {
    mainSocket.disconnect();
  }, [])


  const chatActions = useMemo(() => ({
    updateTypingStatus,
    readChatMsgs,
    sendMsg,
    deleteChat,
    updateMsg,
    removeMsg,
    connectToChat,
    leaveFromChat,
    disconnect,
  }), [])

  return {
    typingStatus,
    setTypingStatus,
    onlineStatusLog,
    updatedChat,
    deletedChatInfo,
    readMsgsResp,
    newMsgResp,
    setNewMsgResp,
    updatedMsgResp,
    removedMsgResp,
    chatActions,
  };
}