import React, { RefObject, useState } from 'react'
import s from './privateChatItem.module.css'
import { useAppSelector } from '../../hooks/rtkHooks';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { Message } from '../../types/interfaces/Message';
import { ChatInput } from '../chat-input/ChatInput';
import { ChatMessagesBlock } from '../chat-messages-block/ChatMessagesBlock';
import { ChatHeader } from '../chat-header/ChatHeader';

export interface PrivateChatProps {
  allChatsUnreadMsgsCnt: number;
  msgBlockRef: RefObject<Element>;
  readMsgsIntersectEl: (node?: Element | null | undefined) => void;
  readMsgsIntersectEl_inView: boolean;
}

export const PrivateChatItem: React.FC<PrivateChatProps> = ({
  allChatsUnreadMsgsCnt,
  msgBlockRef,
  readMsgsIntersectEl,
  readMsgsIntersectEl_inView,
}) => {
  const curChat = useAppSelector(state => state.chat.curChat);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [msgToEdit, setMsgToEdit] = useState<Message>();


  
  if (!curChat.id) {
    return (
      <div className={s.noChatBlock}>
        <div className={s.noChatBlock_info}>
          <div className={s.noChatBlockInner}>
            <QuestionAnswerIcon fontSize='large' />
            <h4>Start chatting now</h4>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={s.privateChatBlock} style={{position: 'relative'}}>

      <ChatHeader 
        allChatsUnreadMsgsCnt={ allChatsUnreadMsgsCnt }
      />

      <ChatMessagesBlock 
        setIsEditMode={setIsEditMode} 
        setMsgToEdit={setMsgToEdit} 
        msgBlockRef={msgBlockRef}
        readMsgsIntersectEl={readMsgsIntersectEl}
        readMsgsIntersectEl_inView={readMsgsIntersectEl_inView}
      />

      <ChatInput 
        isEditMode={isEditMode} 
        msgToEdit={msgToEdit} 
        setIsEditMode={setIsEditMode}
        setMsgToEdit={setMsgToEdit}
      />
    </div>
  )
}

