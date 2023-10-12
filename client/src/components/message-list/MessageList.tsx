import React from 'react'
import { Message } from '../../types/interfaces/Message'
import { MessageItem } from '../message-item/MessageItem';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ChatIcon from '@mui/icons-material/Chat';
import s from './messageList.module.css';
import { formatDate_date } from '../../utils/formatDate';
import { CircularProgress } from '@mui/material';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string;
  setIsEditMode: (val: boolean) => void,
  setMsgToEdit: (val: Message) => void,
}

export const MessageList: React.FC<MessageListProps> = ({setIsEditMode, setMsgToEdit, messages, isLoading, error }) => {

  if (error) {
    return (
      <div className={s.loadingPanel}>
        <div className={ s.loader }>
          <ErrorOutlineIcon fontSize='large' />
          <h3>Something wrong</h3>
        </div>
      </div>
    )
  }

  if (!error && !isLoading && !messages.length) {
    return (
      <div className={s.loadingPanel}>
        <div className={ s.noMessagesBlock_info }>
          <div className={s.noMessagesBlockInner}>
            <ChatIcon fontSize='large' />
            <h3>Write first message</h3>
          </div>
        </div>
      </div>
    )
  }


  let lastFormattedDate = '';

  return (
    <div className={s.messageList}>
      {!isLoading || 
        <div className={s.loadingPanel}>
          <CircularProgress className={ s.loader } />
       </div>
      }
      { 
        messages.map(message => {
          const curFormattedDate = formatDate_date(message.createdAt, true);
      
          if (lastFormattedDate !== curFormattedDate) {
            lastFormattedDate = curFormattedDate;
            return (
              <div key={message.id}>
                <div className={ s.dateMarkerBlock }>
                  <div className={ s.dateMarker }>{ curFormattedDate }</div>
                </div>
                <MessageItem 
                  key={message.id} 
                  message={message} 
                  setIsEditMode={setIsEditMode} 
                  setMsgToEdit={setMsgToEdit}
                />
              </div>
            );
          } else {
            lastFormattedDate = curFormattedDate;
            return (
              <MessageItem
                key={message.id} 
                message={message} 
                setIsEditMode={setIsEditMode} 
                setMsgToEdit={setMsgToEdit}
              />
            );
          }
        })
      }
    </div>
  )
}