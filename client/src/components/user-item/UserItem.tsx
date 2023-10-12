import React from 'react'
import s from './userItem.module.css';
import { Avatar, Button } from '@mui/material';
import { User } from '../../types/interfaces/User';
import { useFetch } from '../../hooks/useFetch';
import { chatService } from '../../API/services/ChatService';
import { useAppDispatch, useAppSelector } from '../../hooks/rtkHooks';
import { setCurChat } from '../../store/chatSlice';
import { PrivateChat } from '../../types/interfaces/PrivateChat';
import { ChatPanelTab } from '../../types/enums/ChatPanelTab';
import { usePrivateChat } from '../../hooks/usePrivateChat';
import shared from '../../shared.module.css';
import { useNavigate } from 'react-router';
import { addChat } from '../../store/chatsSlice';

export interface UserItemProps {
  user: User;
  setTabIdx: (tabName: ChatPanelTab) => void;
}

const buttonStyles = {
  textTransform: 'none', 
  padding: '0 10px',
  fontSize: 16,
  borderRadius: 3,
}

export const UserItem: React.FC<UserItemProps> = ({ user, setTabIdx }) => {
  const curUser = useAppSelector(state => state.user.user);
  const chats = useAppSelector(state => state.chats.chats);
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const { chatActions } = usePrivateChat();
  const [fetchChat] = useFetch<number>(async (oppoUserId: number | undefined) => {

    let chat: PrivateChat;
    try {
      chat = await chatService.getChatByMemberIds(curUser.id, oppoUserId as number);
    } catch(e) {
      chat = await chatService.createChat({
        userIds: [curUser.id, oppoUserId as number],
      })
      chatActions.connectToChat({chatId: chat.id});
    }

    dispatch(setCurChat(chat))
    navigate(`#${chat.id}`);

    if (!chats.some(ch => ch.id === chat.id)) {
      dispatch(addChat(chat));
    }
  });

  const handleClick = () => {
    fetchChat(user.id);
    setTabIdx(ChatPanelTab.CHATS)
  }

  let onlineCircleElement;
  if (user.onlineStatus?.isOnline) {
    onlineCircleElement = <div className={s.onlineCircle}></div>;
  }

  return (
    <Button onClick={handleClick} color='inherit' sx={buttonStyles} className={s.userItem}>
      <div className={s.userItem}>
        <div className={s.userInner}>

          <div className={s.avatarDiv}>
            <Avatar sx={{height: 55, width: 55, m: 'auto'}} alt={ user.name } src={ user.avatar } />
            { onlineCircleElement }
          </div>

          <p className={`${s.fullName}  ${shared.one_line_textCutter}`}>{ user.fullName }</p>
          
        </div>
      </div>
    </Button>
  )
}
