import React, { useEffect, useRef, useState } from 'react'
import s from './chats.module.css'
import { PrivateChatItem } from '../../components/private-chat-item/PrivateChatItem'
import { ChatsPanel } from '../../components/chats-panel/ChatsPanel';
import { useResize } from '../../hooks/useResize';
import { useAppDispatch, useAppSelector } from '../../hooks/rtkHooks';
import { useLocation } from 'react-router';
import { clearCurChat } from '../../store/chatSlice';
import { useInView } from 'react-intersection-observer';

export const Chats: React.FC = () => {
  const msgBlockRef = useRef<Element>(null);
  
  const curChat = useAppSelector(state => state.chat.curChat);
  const dispatch = useAppDispatch();

  const [allChatsUnreadMsgsCnt, setAllChatsUnreadMsgsCnt] = useState<number>(0);

  const { width } = useResize();
  const [chatStyle, setChatStyle] = useState(s.chat_default);

  const location = useLocation();
  const [prevHash, setPervHash] = useState('');
  useEffect(() => {
    if (location.pathname === '/chats') {
      if (!location.hash && prevHash) {
        dispatch(clearCurChat())
        document.title = import.meta.env.VITE_APP_TITLE;
      }
    }
    setPervHash(location.hash)
  }, [location.hash])

  useEffect(() => {
    if (width <= import.meta.env.VITE_MOBILE_SIZE) {
      if (curChat.id) {
        setChatStyle(s.chat_mobile_active);
      } else {
        setChatStyle(s.chat_mobile_default);
      }
    } else {
      setChatStyle(s.chat_default)
    }
  }, [curChat.id, width])

  const {ref: readMsgsIntersectEl, inView: readMsgsIntersectEl_inView} = useInView({
    root: msgBlockRef.current,
  })
  
  return (
    <div className={s.page}>
      <div className={s.chatBox}>
        <ChatsPanel 
          setAllChatsUnreadMsgsCnt={setAllChatsUnreadMsgsCnt}
          readMsgsIntersectEl_inView={readMsgsIntersectEl_inView}
        />
        <div className={chatStyle}>
          <PrivateChatItem 
            allChatsUnreadMsgsCnt={allChatsUnreadMsgsCnt}
            msgBlockRef={msgBlockRef}
            readMsgsIntersectEl={readMsgsIntersectEl}
            readMsgsIntersectEl_inView={readMsgsIntersectEl_inView}
          />
        </div>
      </div>
    </div>
  )
}
