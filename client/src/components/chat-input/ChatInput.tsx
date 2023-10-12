import React, { useEffect, useRef, useState } from 'react'
import s from './chatInput.module.css'
import { IconButton, Input } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import { useAppSelector } from '../../hooks/rtkHooks';
import { usePrivateChat } from '../../hooks/usePrivateChat';
import { Message } from '../../types/interfaces/Message';

interface ChatInputProps {
  isEditMode: boolean,
  msgToEdit: Message | undefined,
  setIsEditMode: (flag: boolean) => void,
  setMsgToEdit: (msg: Message) => void,
}

export const ChatInput: React.FC<ChatInputProps> = ({isEditMode, msgToEdit, setIsEditMode, setMsgToEdit}) => {
  const curUser = useAppSelector(state => state.user.user);
  const curChat = useAppSelector(state => state.chat.curChat);
  
  const { chatActions } = usePrivateChat();
  const [messageText, setMessageText] = useState<string>('');

  useEffect(() => {
    setMessageText('');
  }, [curChat.id])

  useEffect(() => {
    if (isEditMode) {
      setMessageText(msgToEdit!.text);
    } else {
      setMessageText('');
    }
  }, [isEditMode])

  const timeoutID = useRef<NodeJS.Timer | null>(null);
  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setMessageText(e.target.value);
    if (!isEditMode && !timeoutID.current) {
      chatActions.updateTypingStatus({
        isTyping: true,
        userId: curUser.id,
        chatId: curChat.id,
      });
    }

    clearTimeout(timeoutID.current as NodeJS.Timer);
    timeoutID.current = setTimeout(() => {
      chatActions.updateTypingStatus({
        isTyping: false,
        userId: curUser.id,
        chatId: curChat.id,
      });
    timeoutID.current = null;
    }, 5000);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (messageText) {
      if (isEditMode) {
        if (messageText !== msgToEdit?.text) {
          chatActions.updateMsg({
            msgId: msgToEdit!.id, 
            chatId: curChat.id, 
            text: messageText
          });
        }
        setMessageText('');
        setIsEditMode(false);
        setMsgToEdit({} as Message)
      } else {
        setMessageText('');
        chatActions.sendMsg({chatId: curChat.id, text: messageText});

        clearTimeout(timeoutID.current as NodeJS.Timer);
        timeoutID.current = null;
        
        chatActions.updateTypingStatus({
          isTyping: false,
          userId: curUser.id,
          chatId: curChat.id,
        });
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  }


  return (
    <div className={s.inputBlock}>
        <form className={s.inputBlockInner} onSubmit={handleSubmit}>
          <Input 
            onKeyDown={handleKeyDown}
            disableUnderline
            name='msgText'
            value={messageText}
            onInput={handleInput} 
            className={s.input} 
            placeholder="Type message..."
            multiline
            sx={{maxHeight: '250px', overflowY: 'scroll'}}
            slotProps={{
              input: {style: {transition: '.15s'}}
            }}
          />
          <IconButton type='submit' sx={{mt: 'auto'}}>
            {isEditMode ?
              <CheckCircleIcon className={s.sendIcon} color='info'/>
            :
              <SendIcon className={s.sendIcon} color='info' />
            }
          </IconButton>
        </form>
      </div>
  )
}
