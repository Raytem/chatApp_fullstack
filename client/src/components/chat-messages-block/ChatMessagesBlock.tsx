import React, { useEffect, useRef, useState } from 'react'
import s from './ChatMessagesBlock.module.css'
import { useAppDispatch, useAppSelector } from '../../hooks/rtkHooks';
import { Message } from '../../types/interfaces/Message';
import { usePrivateChat } from '../../hooks/usePrivateChat';
import { chatService } from '../../API/services/ChatService';
import { useFetch } from '../../hooks/useFetch';
import { ArrowDown } from '../arrow-down/ArrowDown';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { readCurChatMsgs, setCurChatUnreadMsgsCnt } from '../../store/chatSlice';
import { MessageList } from '../message-list/MessageList';
import { useObserver } from '../../hooks/useObserver';

interface ChatMessageBlockProps {
  setIsEditMode: (flag: boolean) => void
  setMsgToEdit: (msg: Message) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  msgBlockRef: any;
  readMsgsIntersectEl: (node?: Element | null | undefined) => void;
  readMsgsIntersectEl_inView: boolean;
}

export const ChatMessagesBlock: React.FC<ChatMessageBlockProps> = ({
  setIsEditMode, 
  setMsgToEdit, 
  msgBlockRef,
  readMsgsIntersectEl, 
  readMsgsIntersectEl_inView
}) => {
  const dispatch = useAppDispatch();

  const curChat = useAppSelector(state => state.chat.curChat);
  const curUser = useAppSelector(state => state.user.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState<number>(0);

  const { 
    updatedChat, 
    readMsgsResp, 
    newMsgResp, 
    setNewMsgResp,
    updatedMsgResp, 
    removedMsgResp, 
    chatActions 
  } = usePrivateChat();

  const [msgsTotalCnt, setMsgsTotalCnt] = useState<number>(0);
  const [fetchMsgs, msgsIsLoading, msgsError] = useFetch(async () => {
    const messagesAndCnt = await chatService.getMessages(curChat.id, {page: page, perPage: 40});
    const fMessages = messagesAndCnt.messages;
    setMsgsTotalCnt(+messagesAndCnt.cnt);

    if (fMessages.length) {
      setMessages((prevMsgs) => [...fMessages, ...prevMsgs]);
    }
  });

  const { isPageVisible } = usePageVisibility();
  const loadMsgsIntersectEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsEditMode(false);
    setMsgToEdit({} as Message);

    setMessages([]);
    setMsgsTotalCnt(0);
    setPage(0);
    
    setPervMsgBlockScrollHeight(0);
  }, [curChat.id])

  useEffect(() => {
    if (page === 1) {
      msgBlockRef.current!.scrollTop = 1e5;
    }
  }, [msgsIsLoading])

  useObserver(
    msgBlockRef.current as Element,
    loadMsgsIntersectEl.current as Element,
    msgsIsLoading,
    messages.length < msgsTotalCnt,
    () => {
      setPage((prev) => prev + 1);
    }
  )

  useEffect(() => {
    if (page < 1) {
      setPage(1);
    } else {
      fetchMsgs();
    }
  }, [page])

  useEffect(() => {
    if (readMsgsIntersectEl_inView && curChat.unreadMsgsCnt) {
      chatActions.readChatMsgs({chatId: curChat.id});
      dispatch(readCurChatMsgs());
    }
  }, [readMsgsIntersectEl_inView, curChat.id])

  useEffect(() => {
    if (updatedChat) {
      dispatch(setCurChatUnreadMsgsCnt(updatedChat.unreadMsgsCnt))
    }
  }, [updatedChat])
  
  useEffect(() => {
    if (newMsgResp && !isPageVisible) {
      const newMsgSound = new Audio('/newMessageSound.ogg');
      newMsgSound.play();
    }

    if (newMsgResp && curChat.id === newMsgResp.chatId) {
      setMessages(prevMsgs => [...prevMsgs, newMsgResp.message])

      if (
          isPageVisible
          && readMsgsIntersectEl_inView
        ) {
        chatActions.readChatMsgs({chatId: curChat.id});
        dispatch(readCurChatMsgs());
      }
    }
  }, [newMsgResp])

  const [pervMsgBlockScrollHeight, setPervMsgBlockScrollHeight] = useState<number>(0);
  useEffect(() => {
    if (newMsgResp && curChat.id === newMsgResp?.chatId) {
      const scrollHeight = msgBlockRef.current!.scrollHeight;
      const fullScrollTop = msgBlockRef.current!.scrollTop + msgBlockRef.current!.clientHeight;
      const lastMsgHeight = scrollHeight - pervMsgBlockScrollHeight;

      if (newMsgResp.message.user.id === curUser.id) {
        msgBlockRef.current!.scrollTo({
          top: scrollHeight,
          behavior: 'smooth',
        })
      } else {
        if ((fullScrollTop + lastMsgHeight) >= (scrollHeight - 0.5)) {
          msgBlockRef.current!.scrollTo({
            top: scrollHeight,
            behavior: 'smooth',
          })
        }
      }
      setPervMsgBlockScrollHeight(scrollHeight);
    }

    setPervMsgBlockScrollHeight(msgBlockRef.current!.scrollHeight)
    setNewMsgResp(undefined);
  }, [messages])

  useEffect(() => {
    if (
        isPageVisible
        && curChat.id 
        && readMsgsIntersectEl_inView
        && curChat.unreadMsgsCnt
      ) {
      chatActions.readChatMsgs({chatId: curChat.id});
      dispatch(readCurChatMsgs());
    }
  }, [isPageVisible])

  useEffect(() => {
    if (updatedMsgResp && curChat.id === updatedMsgResp.chatId) {
      setMessages(prevMsgs => prevMsgs.map(msg => {
        if (msg.id === updatedMsgResp.message.id) {
          return updatedMsgResp.message;
        } else {
          return msg;
        }
      }))
    }
  }, [updatedMsgResp])

  useEffect(() => {
    if (removedMsgResp && curChat.id === removedMsgResp.chatId) {
      setMessages(prevMsgs => prevMsgs.filter(msg => msg.id !== removedMsgResp.message.id));
    }
  }, [removedMsgResp])

  useEffect(() => {
    if (readMsgsResp) {
      if (curChat.id === readMsgsResp.chatId && readMsgsResp.readMsgs.length) {
        setMessages(prev => prev.map(msg => {
          if (readMsgsResp.readMsgs.some(readMsg => readMsg.msgId === msg.id)) {
            return {...msg, isRead: true};
          } else {
            return msg;
          }
        }))
      }
    }
  }, [readMsgsResp])

  useEffect(() => {
    const handleScroll = () => {
      const fullHeight = msgBlockRef.current?.scrollHeight as number;
      const scrolledHeight = 
        fullHeight - ((msgBlockRef.current?.scrollTop as number) + (msgBlockRef.current?.clientHeight as number))

      if (scrolledHeight >= 100) {
        setShowArrowDown(true);
      } else {
        setShowArrowDown(false);
      }
    }
    msgBlockRef.current?.addEventListener('scroll', handleScroll);
    return () => {
      msgBlockRef.current?.removeEventListener('scroll', handleScroll);
    }
  }, [])

  const [showArrowDown, setShowArrowDown] = useState<boolean>(false);
  const handleArrowDownClick = () => {
    const fullHeight = msgBlockRef.current?.scrollHeight;
    msgBlockRef.current?.scrollTo({
      top: fullHeight,
      behavior: 'smooth',
    })
  }

  return (
    <div className={s.messagesListBlock} ref={msgBlockRef}>

    <div style={{marginTop: 'auto'}}>
      <div style={{height: 1}} ref={loadMsgsIntersectEl}></div>

      <MessageList
        setIsEditMode={setIsEditMode}
        setMsgToEdit={setMsgToEdit}
        messages={messages} 
        isLoading={msgsIsLoading}
        error={msgsError}
      />

      <div style={{height: 1}} ref={readMsgsIntersectEl}></div>
    </div>

      <ArrowDown 
        isVisible={showArrowDown}
        handleClick={handleArrowDownClick}
        unreadMsgsCnt={curChat.unreadMsgsCnt}
      />
    </div>
  )
}
