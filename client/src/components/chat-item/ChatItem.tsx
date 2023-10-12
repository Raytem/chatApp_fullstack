import React, { useEffect, useState } from 'react'
import { Avatar, Button } from '@mui/material';
import { PrivateChat } from '../../types/interfaces/PrivateChat';
import { useAppDispatch, useAppSelector } from '../../hooks/rtkHooks';
import { setCurChat } from '../../store/chatSlice';
import { formatDate_date } from '../../utils/formatDate';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import s from './chatItem.module.css';
import shared from '../../shared.module.css';
import { UnreadMsgsCircle } from '../unread-msgs-circle/UnreadMsgsCircle';
import classNames from 'classnames';
import { ChatItemPopover } from '../chat-item-popover/ChatItemPopover';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { usePrivateChat } from '../../hooks/usePrivateChat';
import { TypingStatusItem } from '../typing-status-item/TypingStatusItem';


export interface ChatItemProps {
  chat: PrivateChat,
}

const buttonStyles = {
  textTransform: 'none', 
  fontSize: 16,
  borderRadius: 3,
  transition: '.2s',
}

const activeButtonStyles = {
  ...buttonStyles,
  background: 'rgb(140 178 255 / 42%)',
  '&:hover': {
    background: 'rgb(140 178 255 / 42%)',
  }
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat }) => {
  const dispatch = useAppDispatch()
  const curChat = useAppSelector(state => state.chat.curChat);
  const { typingStatus, onlineStatusLog, updatedChat } = usePrivateChat();

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [mouseTopPos, setMouseTopPos] = useState<number>(0);
  const [mouseLeftPos, setMouseLeftPos] = useState<number>(0);

  const [chatLastMsgText, setChatLastMsgText] = useState<React.ReactNode | null>(null);

  const handleRightClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    if (!chat.isSelf) {
      setIsPopoverOpen(true);
      setMouseTopPos(e.clientY);
      setMouseLeftPos(e.clientX);
    }
  };

  const handleClick = () => {
    dispatch(setCurChat(chat));
    document.title = chat.name;
  }

  const btnStyle = curChat.id === chat.id ? activeButtonStyles : buttonStyles

  const lastMsgTime = formatDate_date(chat.lastMessage?.createdAt);

  useEffect(() => {
    if (typingStatus?.isTyping && typingStatus?.chatId === chat.id ) {
      setChatLastMsgText(<TypingStatusItem typingStatus={typingStatus} />)
    } else {
      if (chat.lastMessage?.text) {
        setChatLastMsgText(<>{ chat.lastMessage?.text }</>);
      } else {
        setChatLastMsgText(<></>);
      }
    }
  }, [typingStatus]);

  useEffect(() => {
    if (chat.isTyping === true && !onlineStatusLog?.isOnline && onlineStatusLog?.userId === chat.onlineInfo?.userId) {
      setChatLastMsgText(<>{ chat.lastMessage?.text }</>)
    }
  }, [onlineStatusLog])

  useEffect(() => {
    if (updatedChat?.id === chat.id) {
      setChatLastMsgText(<p>{ updatedChat.lastMessage?.text }</p>)
    }
  }, [updatedChat])

  let doneIconElement;
  if (chat?.lastMessage?.isRead && chat.lastMessage) {
    doneIconElement = <DoneAllIcon style={{fontSize: 16}} className={s.doneIcon} />;
  } else if (!chat?.lastMessage?.isRead  && chat.lastMessage) {
    doneIconElement = <DoneIcon style={{fontSize: 16}} className={s.doneIcon} />
  }

  let unreadMsgsCntElement;
  if (chat.unreadMsgsCnt) {
    unreadMsgsCntElement = 
      <UnreadMsgsCircle 
        className={s.chatInfo_bottom_unreadCnt} unreadMsgsCnt={chat.unreadMsgsCnt} 
      />
  }

  let onlineCircleElement;
  if (chat.onlineInfo?.isOnline) {
    onlineCircleElement = <div className={s.onlineCircle}></div>;
  }

  return (
    <>
      <Button 
        onClick={handleClick} 
        color='inherit' 
        sx={btnStyle}
        className={s.chatItem}
        href={`#${chat.id}`}
        onContextMenu={handleRightClick}
      >
        <div className={s.avatarDiv}>
          <Avatar sx={{height: 55, width: 55, m: 'auto'}} alt={ chat.name } src={ chat.avatar } />
          { onlineCircleElement }
        </div>

        <div className={s.chatInfo}>
          <div className={s.chatInfo_top}>
            <div style={{display: 'flex'}} className={classNames(shared.one_line_textCutter)}>
              <div className={classNames(s.chatName, shared.one_line_textCutter)}>{ chat.name }</div>
            </div>
            
            <div className={s.chatInfo_topRight}>
              { doneIconElement }
              <p className={s.chatInfo_msgTime}>{ chat.lastMessage?.createdAt ? lastMsgTime : '' }</p>
            </div>
          </div>

          <div className={s.chatInfo_bottom}>
            <p className={`${s.chatInfo_msgText} ${shared.two_line_textCutter}`}>
              { chatLastMsgText }
            </p>
            {
              (chat.unreadMsgsCnt) ?
              unreadMsgsCntElement
              :
              (!chat.isPinned) ||
              <PushPinOutlinedIcon 
                color='disabled' 
                fontSize='inherit'
                sx={{transform: 'rotate(45deg)', mt: 'auto', mb: 'auto'}}
              />
            }
          </div>

        </div>
      </Button>

      <ChatItemPopover
        isOpen={isPopoverOpen}
        setIsOpen={setIsPopoverOpen}
        chat={chat}
        mouseTopPos={mouseTopPos}
        mouseLeftPos={mouseLeftPos}
      />
    </>
  )
}