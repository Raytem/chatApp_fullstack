import React from 'react'
import { PrivateChat } from '../../types/interfaces/PrivateChat'
import { ChatItem } from '../chat-item/ChatItem';
import s from './chatList.module.css'
import { CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SearchIcon from '@mui/icons-material/Search';

interface ChatListProps {
  chats: PrivateChat[];
  searchValue: string;
  isLoading: boolean;
  error: string;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, searchValue, isLoading, error }) => {

  if (error) {
    return (
      <div className={s.loadingPanel}>
        <div className={ s.loader }>
          <ErrorOutlineIcon fontSize='large' className={ s.loader }/>
          <h3>Something wrong</h3>
        </div>
      </div>
    )
  }

  if (!error && !isLoading && !chats.length && searchValue.length) {
    return (
      <div className={s.loadingPanel}>
        <div className={ s.loader }>
          <SearchOffIcon fontSize='large' className={ s.loader }/>
          <h3>No such chats were found</h3>
        </div>
      </div>
    )
  }

  if (!error && !isLoading && !chats.length && !searchValue.length) {
    return (
      <div className={s.loadingPanel}>
        <div className={ s.loader }>
          <SearchIcon fontSize='large' className={ s.loader }/>
          <h3>You don't have chats yet</h3>
        </div>
      </div>
    )
  }

  return (<>
    {
      chats.map(chat => 
        <ChatItem
          key={chat.id}
          chat={chat}
        />
      )
    }
     { !isLoading ||
      <div className={s.loadingPanel}>
        <CircularProgress className={ s.loader } />
      </div>
    }
  </>)
}
