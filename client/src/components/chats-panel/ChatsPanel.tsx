import React, { useEffect, useRef, useState } from 'react'
import s from './chatsPanel.module.css'
import { useAppDispatch, useAppSelector } from '../../hooks/rtkHooks'
import { useFetch } from '../../hooks/useFetch';
import { User } from '../../types/interfaces/User';
import { userService } from '../../API/services/UserService';
import { PrivateChat } from '../../types/interfaces/PrivateChat';
import { ChatPanelTab } from '../../types/enums/ChatPanelTab';
import { UserFilterDto } from '../../types/dtos/user/UserFilterDto';
import { usePrivateChat } from '../../hooks/usePrivateChat';
import { useResize } from '../../hooks/useResize';
import { removeChat, setChats, updateChat, updateChatTypingStatus, updateOnlineStatus } from '../../store/chatsSlice';
import { clearCurChat } from '../../store/chatSlice';
import { useObserver } from '../../hooks/useObserver';
import { ChatsPanelHeader } from '../chats-panel-header/ChatsPanelHeader';
import { UserList } from '../user-list/UserList';
import { ChatList } from '../chat-list/ChatList';
import { CurUserPanel } from '../cur-user-panel/CurUserPanel';

interface ChatsPanelProps {
  setAllChatsUnreadMsgsCnt: (cnt: number) => void;
  readMsgsIntersectEl_inView: boolean;
}

export const ChatsPanel: React.FC<ChatsPanelProps> = ({
  setAllChatsUnreadMsgsCnt, 
  readMsgsIntersectEl_inView
}) => {
  const curUser = useAppSelector(state => state.user.user);
  const curChat = useAppSelector(state => state.chat.curChat);
  const chats = useAppSelector(state => state.chats.chats);
  const dispatch = useAppDispatch();
  const { width } = useResize();

  const [users, setUsers] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [fetchUsers, usersIsLoading, usersError] = useFetch(async (userFilterDto: UserFilterDto | undefined) => {
    const resUsers = await userService.getAll(userFilterDto);
    const filteredUsers = resUsers.filter(user => user.id !== curUser.id);
    setUsers(filteredUsers);
  })
  const [chatsPage, setChatsPage] = useState<number>(0);
  const [chatsTotalCnt, setChatsTotalCnt] = useState<number>(0);
  const [fetchChats, chatsIsLoading, chatsError] = useFetch(async () => {
    if (
      chats.length && (chats.length >= chatsTotalCnt)
    ) {
      return;
    }

    const chatsAndCnt = await userService.getChats(curUser.id, {page: chatsPage, perPage: 25});
    const resChats = chatsAndCnt.chats;
    setChatsTotalCnt(chatsAndCnt.cnt);

    if (resChats.length) {
      const newChats: PrivateChat[] = [];
      resChats.forEach(resChat => {
        if (!chats.some(chat => chat.id === resChat.id)) {
          newChats.push(resChat);
        }
      })

      dispatch(setChats([...chats, ...newChats]));
    }
  })
  const { updatedChat ,onlineStatusLog, deletedChatInfo, typingStatus } = usePrivateChat();
  const [tabIdx, setTabIdx] = useState<ChatPanelTab>(ChatPanelTab.CHATS);

  const [filteredChats, setFilteredChats] = useState<PrivateChat[]>(chats);

  const itemListBlockRef = useRef(null);
  const loadChatsIntersectEl = useRef(null);

  useObserver(
    itemListBlockRef.current,
    loadChatsIntersectEl.current,
    chatsIsLoading,
    chats.length < chatsTotalCnt,
    () => {
      setChatsPage(prev => prev + 1);
    }
  )

  useEffect(() => {
    if (typingStatus) {
      dispatch(updateChatTypingStatus(typingStatus));
    }
  }, [typingStatus])

  useEffect(() => {
      fetchChats();
  }, [chatsPage])

  useEffect(() => {
    setAllChatsUnreadMsgsCnt(countAllChatsUnreadMsgs());
  }, [chats])

  const countAllChatsUnreadMsgs = () => {
    let cnt = 0;
    chats.forEach(chat => {
      cnt += chat.unreadMsgsCnt;
    })
    return cnt;
  }
  
  useEffect(() => {
    if (onlineStatusLog) {
      if (users) {
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            if (user.id === onlineStatusLog.userId) {
              return { ...user, onlineStatus: onlineStatusLog }
            } else {
              return user;
            }
          })
        })
      }
  
      if (chats) {
        dispatch(updateOnlineStatus(onlineStatusLog));
      }

      if (!onlineStatusLog?.isOnline) {
        chats.forEach(chat => {
          if (chat.isTyping && chat.onlineInfo?.userId === onlineStatusLog?.userId) {
            dispatch(updateChatTypingStatus({
              chatId: chat.id,
              userId: onlineStatusLog?.userId,
              isTyping: false,
            }));
          }
        })
      }
    }
  }, [onlineStatusLog])

  useEffect(() => {
    if (updatedChat) {
      dispatch(updateChat({
        updatedChat,
        curChat,
        readMsgsIntersectEl_inView,
      }))
      setAllChatsUnreadMsgsCnt(countAllChatsUnreadMsgs());
    }
  }, [updatedChat])

  useEffect(() => {
    if (deletedChatInfo) {
      if (deletedChatInfo.userIdsToDelChat.some(userId => userId === curUser.id)) {
        dispatch(removeChat(deletedChatInfo.chatId));
        setAllChatsUnreadMsgsCnt(countAllChatsUnreadMsgs());

        if (curChat.id === deletedChatInfo.chatId) {
          dispatch(clearCurChat());
        }
      }
    }
  }, [deletedChatInfo])

  useEffect(() => {
    setFilteredChats(chats);
  }, [users, chats])

 

  return (
    <div className={width <= import.meta.env.VITE_MOBILE_SIZE ? s.chatsPanel_mobile : s.chatsPanel}>
      <div className={s.chatsPanelInner}>
        
        <ChatsPanelHeader
          users={users}
          setUsers={setUsers}
          chats={chats}
          setFilteredChats={setFilteredChats}
          tabIdx={tabIdx}
          setTabIdx={setTabIdx}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          fetchUsers={fetchUsers}
        />

        <div 
          className={ s.itemListBlock } 
          ref={itemListBlockRef}
        >
          {tabIdx === ChatPanelTab.USERS ?
            <UserList 
              users={users} 
              searchValue={searchValue}
              setTabIdx={setTabIdx}
              isLoading={usersIsLoading} 
              error={usersError} 
            />
            :
            <div>
              <ChatList 
                chats={filteredChats} 
                searchValue={searchValue}
                isLoading={chatsIsLoading} 
                error={chatsError} 
              />

              <div style={{height: 1}} ref={loadChatsIntersectEl}></div>
            </div>
          }
        </div>

        <CurUserPanel />

      </div>
    </div>
  )
}
