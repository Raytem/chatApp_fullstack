import React, { useEffect, useState } from 'react'
import s from './chatHeader.module.css'
import shared from '../../shared.module.css'
import { useAppDispatch, useAppSelector } from '../../hooks/rtkHooks'
import { clearCurChat, setCurChatOnlineStatus } from '../../store/chatSlice'
import { Avatar, IconButton } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIosNew';
import { useResize } from '../../hooks/useResize'
import { useLocation, useNavigate } from 'react-router'
import { usePrivateChat } from '../../hooks/usePrivateChat'
import { formatDate_onlineStatus } from '../../utils/formatDate'
import classNames from 'classnames'
import { UnreadMsgsCircle } from '../unread-msgs-circle/UnreadMsgsCircle'
import { TypingStatusItem } from '../typing-status-item/TypingStatusItem'
import { ChatOnlineInfo } from '../../types/interfaces/ChatOnlineInfo'
import { OnlineStatusType } from '../../types/enums/OnlineStatusType'
import { TypingStatusDto } from '../../types/dtos/privateChat/TypingStatusDto'

interface ChatHeaderProps {
  allChatsUnreadMsgsCnt: number
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({allChatsUnreadMsgsCnt}) => {
  const curChat = useAppSelector(state => state.chat.curChat);
  const dispatch = useAppDispatch();

  const [onlineStatus, setOnlineStatus] = useState<OnlineStatusType | string>(OnlineStatusType.OFFLINE);
  const { onlineStatusLog, typingStatus, setTypingStatus } = usePrivateChat();

  const {width} = useResize();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (onlineStatusLog?.userId === curChat?.onlineInfo?.userId) {
      dispatch(setCurChatOnlineStatus(onlineStatusLog as ChatOnlineInfo));
      if (!onlineStatusLog?.isOnline && curChat.isTyping) {
        setOnlineStatus(formatDate_onlineStatus(curChat.onlineInfo?.lastActivity));
      }
    }
  }, [onlineStatusLog]);

  useEffect(() => {
    if (curChat.onlineInfo?.isOnline) {
      setOnlineStatus(OnlineStatusType.ONLINE);
    } else {
      setOnlineStatus(formatDate_onlineStatus(curChat.onlineInfo?.lastActivity));
    }
  }, [curChat.onlineInfo?.isOnline, curChat])

  useEffect(() => {
    if (curChat.onlineInfo?.isOnline && typingStatus?.chatId === curChat.id) {
      if (typingStatus?.isTyping) {
        setOnlineStatus(OnlineStatusType.IS_TYPING);
      } else {
        setOnlineStatus(OnlineStatusType.ONLINE);
      }
    } 
  }, [typingStatus]);

  useEffect(() => {
    if (curChat.onlineInfo && !curChat.onlineInfo.isOnline && !curChat.isSelf) {
      const interval = setInterval(() => {
        setOnlineStatus(formatDate_onlineStatus(curChat.onlineInfo?.lastActivity));
      }, 1500);
      return () => clearInterval(interval);
    }
    if (curChat.isTyping) {
      setTypingStatus({
        isTyping: true,
        chatId: curChat.id,
        userId: 0,
      })
    }
  }, [curChat]);

  function handleBack() {
    dispatch(clearCurChat());
    navigate(`${location.pathname}`)
    document.title = import.meta.env.VITE_APP_TITLE;
  }

  return (
    <div className={s.privateChatBlock}>
      <div className={s.chatHeader}>

        <div className={s.chatHeader_btnBackBlock}>
          {
            (allChatsUnreadMsgsCnt > 0 && width <= import.meta.env.VITE_MOBILE_SIZE)
            ? <UnreadMsgsCircle className={s.btnBack_unreadCnt} unreadMsgsCnt={allChatsUnreadMsgsCnt} />
            : <></>
          }
          <IconButton className={s.btnBack} onClick={handleBack} color='inherit'>
            <ArrowBackIosIcon />
          </IconButton>
        </div>
        
        <Avatar sx={{height: 45, width: 45}} alt={ curChat.name } src={curChat.avatar} />
        
        <div className={s.chatHeader_right}>
          <h3 className={classNames(s.chatName, shared.one_line_textCutter)}>{ curChat.name }</h3>

          <p 
            className={classNames(
              s.onlineStatus, 
              shared.one_line_textCutter,
              (curChat.onlineInfo && curChat.onlineInfo?.isOnline) ? s?.isOnline : ''
              )}
          >
            {
              onlineStatus === OnlineStatusType.IS_TYPING ?
                <TypingStatusItem typingStatus={typingStatus as TypingStatusDto} />
              : onlineStatus === OnlineStatusType.ONLINE ?
                <>{ OnlineStatusType.ONLINE }</>
              : 
                <>{ onlineStatus }</>
            }
          </p>
        </div>
      </div>
    </div>
  )
}
